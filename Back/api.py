import cv2
import numpy as np
from ultralytics import YOLO
from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
import os
import tempfile
from typing import List
import subprocess
from fastapi.middleware.cors import CORSMiddleware
import base64
import json
import logging
import asyncio

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Bottle Blur API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize YOLO model (fine-tuned)
try:
    model = YOLO("my_model.pt")  # Load your trained model
    logger.info("YOLO model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {str(e)}")
    raise

@app.post("/blur_bottles/")
async def blur_bottles(video: UploadFile = File(...), classes_no_blur: List[str] = None):
    """
    API endpoint to process a video and blur all bottle classes except those specified.
    
    Parameters:
    - video: The input video file (e.g., mp4)
    - classes_no_blur: List of class names to exclude from blurring (e.g., ["eau_vive", "cristalline"])
    
    Returns:
    - Processed video file with blurred bottles (except specified classes)
    """
    logger.info("Received request for /blur_bottles/")
    # Validate inputs
    if not video:
        logger.error("No video file provided")
        raise HTTPException(status_code=400, detail="No video file provided.")
    
    if not classes_no_blur:
        logger.error("No classes to exclude from blurring provided")
        raise HTTPException(status_code=400, detail="No classes to exclude from blurring provided.")

    # Convert classes_no_blur to lowercase for case-insensitive comparison
    classes_no_blur = [cls.lower() for cls in classes_no_blur]
    
    # Create temporary files for input and output
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as input_file:
        input_path = input_file.name
        input_file.write(await video.read())

    # Load the video
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        os.remove(input_path)
        logger.error("Could not open video file")
        raise HTTPException(status_code=500, detail="Could not open video file.")

    # Get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Create temporary file for intermediate output
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as output_file:
        output_path = output_file.name

    # Initialize video writer for the intermediate output
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    # Process the video frame by frame
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Process the frame with YOLO to detect bottles
        try:
            results = model(frame)
        except Exception as e:
            logger.error(f"YOLO processing failed during video processing: {str(e)}")
            raise HTTPException(status_code=500, detail=f"YOLO processing failed: {str(e)}")

        # Process YOLO results
        for result in results:
            for box in result.boxes:
                # Get bounding box coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                class_id = int(box.cls)  # Detected class ID
                class_name = model.names[class_id].lower()  # Class name

                # Draw bounding box on the frame
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

                # Check if the bottle class should be blurred (if not in classes_no_blur)
                if class_name not in classes_no_blur:
                    # Extract the region of interest (ROI) for the bottle
                    roi = frame[y1:y2, x1:x2]
                    # Blur the bottle region
                    if roi.size > 0:
                        blurred_roi = cv2.GaussianBlur(roi, (99, 99), 30)
                        frame[y1:y2, x1:x2] = blurred_roi
                    # Display class name above the bounding box in red
                    cv2.putText(frame, class_name.capitalize(), (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                else:
                    # Display class name above the bounding box in green (not blurred)
                    cv2.putText(frame, class_name.capitalize(), (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # Write the processed frame to the output video
        out.write(frame)

    # Release resources
    cap.release()
    out.release()

    # Create temporary file for final output
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as final_file:
        final_output = final_file.name

    # Re-encode with FFmpeg to ensure H.264 compatibility and faststart
    try:
        result = subprocess.run([
            "ffmpeg",
            "-i", output_path,
            "-c:v", "libx264",
            "-c:a", "aac",
            "-movflags", "+faststart",
            "-y",  # Overwrite output file
            final_output
        ], check=True, capture_output=True, text=True)
        logger.info("FFmpeg processing completed")
        logger.debug(f"FFmpeg stdout: {result.stdout}")
        logger.debug(f"FFmpeg stderr: {result.stderr}")
    except subprocess.CalledProcessError as e:
        os.remove(input_path)
        os.remove(output_path)
        logger.error(f"FFmpeg processing failed: {e.stderr}")
        raise HTTPException(status_code=500, detail=f"FFmpeg processing failed: {e.stderr}")

    # Clean up temporary input and intermediate output files
    os.remove(input_path)
    os.remove(output_path)

    # Check if final output exists
    if not os.path.exists(final_output):
        logger.error("Failed to create final video")
        raise HTTPException(status_code=500, detail="Failed to create final video.")

    # Stream the processed video and ensure cleanup after streaming
    def iterfile():
        try:
            with open(final_output, "rb") as f:
                yield from f
        finally:
            # Clean up the final output file after streaming
            if os.path.exists(final_output):
                os.remove(final_output)

    response = StreamingResponse(iterfile(), media_type="video/mp4")
    response.headers["Content-Disposition"] = "attachment; filename=blurred_video.mp4"
    logger.info("Video streaming completed")
    return response

async def heartbeat(websocket: WebSocket):
    """Send periodic pings to keep WebSocket alive."""
    try:
        while websocket.client_state == WebSocket.OPEN:
            await websocket.send_json({"type": "ping"})
            logger.debug("Sent WebSocket ping")
            await asyncio.sleep(10)
    except Exception as e:
        logger.debug(f"Heartbeat stopped: {str(e)}")

@app.websocket("/ws/blur_bottles_live")
async def blur_bottles_live(websocket: WebSocket):
    """
    WebSocket endpoint to process live video frames and blur bottle classes except those specified.
    
    Expects JSON messages with:
    - frame: Base64-encoded JPEG image of the video frame
    - classes_no_blur: List of class names to exclude from blurring (e.g., ["eau_vive", "cristalline"])
    
    Sends back JSON messages with:
    - frame: Base64-encoded JPEG image of the processed frame
    - type: "ping" for heartbeat messages
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    frame_count = 0
    # Start heartbeat
    heartbeat_task = asyncio.create_task(heartbeat(websocket))
    try:
        while True:
            frame_count += 1
            logger.debug(f"Processing frame {frame_count}")
            # Receive JSON data from the client
            try:
                data = await websocket.receive_json()
                logger.debug("Received JSON data")
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON received: {str(e)}")
                await websocket.send_json({"error": "Invalid JSON data"})
                continue
            except Exception as e:
                logger.error(f"Error receiving JSON data: {str(e)}")
                await websocket.send_json({"error": f"Error receiving JSON: {str(e)}"})
                break  # Exit loop on connection error

            # Skip heartbeat messages
            if data.get("type") == "pong":
                logger.debug("Received WebSocket pong")
                continue

            # Validate input
            if not data.get("frame") or not data.get("classes_no_blur"):
                logger.error("Missing frame or classes_no_blur in received data")
                await websocket.send_json({"error": "Missing frame or classes_no_blur"})
                continue

            # Decode base64 frame
            try:
                frame_data = base64.b64decode(data["frame"])
                logger.debug(f"Decoded frame, size: {len(frame_data)} bytes")
            except base64.binascii.Error as e:
                logger.error(f"Invalid base64 frame data: {str(e)}")
                await websocket.send_json({"error": "Invalid base64 frame data"})
                continue
            except Exception as e:
                logger.error(f"Error decoding base64 frame: {str(e)}")
                await websocket.send_json({"error": f"Error decoding frame: {str(e)}"})
                continue

            nparr = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                logger.error("Failed to decode frame into image")
                await websocket.send_json({"error": "Invalid frame data"})
                continue

            # Convert classes_no_blur to lowercase
            classes_no_blur = [cls.lower() for cls in data["classes_no_blur"]]
            logger.debug(f"Processing frame with classes_no_blur: {classes_no_blur}")

            # Process the frame with YOLO
            try:
                start_time = cv2.getTickCount()
                results = model(frame, imgsz=320)
                end_time = cv2.getTickCount()
                processing_time = ((end_time - start_time) / cv2.getTickFrequency()) * 1000
                logger.debug(f"YOLO processing completed, detections: {len(results[0].boxes)}, time: {processing_time:.2f}ms")
            except Exception as e:
                logger.error(f"YOLO processing failed: {str(e)}")
                await websocket.send_json({"error": f"YOLO processing failed: {str(e)}"})
                continue

            # Process YOLO results
            try:
                has_detections = False
                for result in results:
                    for box in result.boxes:
                        has_detections = True
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                        class_id = int(box.cls)
                        class_name = model.names[class_id].lower()

                        # Validate bounding box coordinates
                        if x1 < 0 or y1 < 0 or x2 > frame.shape[1] or y2 > frame.shape[0]:
                            logger.warning(f"Invalid bounding box: ({x1}, {y1}, {x2}, {y2})")
                            continue

                        # Draw bounding box
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

                        # Blur if class is not in classes_no_blur
                        if class_name not in classes_no_blur:
                            roi = frame[y1:y2, x1:x2]
                            if roi.size > 0:
                                blurred_roi = cv2.GaussianBlur(roi, (99, 99), 30)
                                frame[y1:y2, x1:x2] = blurred_roi
                            cv2.putText(frame, class_name.capitalize(), (x1, y1 - 10),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                        else:
                            cv2.putText(frame, class_name.capitalize(), (x1, y1 - 10),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            except Exception as e:
                logger.error(f"Error processing YOLO results: {str(e)}")
                await websocket.send_json({"error": f"Error processing YOLO results: {str(e)}"})
                continue

            # Encode and send the processed frame
            try:
                _, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                if buffer is None:
                    logger.error("Failed to encode frame: cv2.imencode returned None")
                    await websocket.send_json({"error": "Failed to encode frame"})
                    continue
                encoded_frame = base64.b64encode(buffer).decode("utf-8")
                logger.debug(f"Encoded processed frame, size: {len(encoded_frame)} bytes")
                await websocket.send_json({"frame": encoded_frame})
                logger.info(f"Sent processed frame {frame_count}")
            except Exception as e:
                logger.error(f"Failed to encode or send frame: {str(e)}")
                await websocket.send_json({"error": f"Failed to encode or send frame: {str(e)}"})
                continue

    except WebSocketDisconnect as e:
        logger.info(f"WebSocket client disconnected: code={e.code}, reason={e.reason}")
    except Exception as e:
        logger.error(f"Unexpected error in WebSocket: {str(e)}")
    finally:
        heartbeat_task.cancel()
        try:
            await websocket.close()
            logger.info("WebSocket connection closed")
        except RuntimeError:
            logger.debug("WebSocket already closed")
            pass