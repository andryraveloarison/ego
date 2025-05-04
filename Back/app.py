import cv2
import numpy as np
from ultralytics import YOLO

# Initialize YOLO model (fine-tuné)
model = YOLO("my_model.pt")  # Charger votre modèle entraîné

# Load video file
video_path = "test.mp4"  # Chemin de votre vidéo
cap = cv2.VideoCapture(video_path)

# Check if video opened successfully
if not cap.isOpened():
    print("Error: Could not open video file.")
    exit()

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        # End of video: loop back to start
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        continue

    # Process the frame with YOLO to detect bottles
    results = model(frame)

    # Process YOLO results
    for result in results:
        for box in result.boxes:
            # Get bounding box coordinates
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
            class_id = int(box.cls)  # ID de la classe détectée
            class_name = model.names[class_id]  # Nom de la classe (cristalline ou eau_vive)

            # Draw bounding box on the frame
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

            # Check if the bottle is "eau_vive"
            if class_name == "eau_vive":
                # Extract the region of interest (ROI) for the bottle
                roi = frame[y1:y2, x1:x2]
                # Blur the bottle region
                blurred_roi = cv2.GaussianBlur(roi, (99, 99), 30)
                frame[y1:y2, x1:x2] = blurred_roi
                # Display "Eau Vive" label above the bounding box in red
                cv2.putText(frame, "Eau Vive", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            else:
                # Display class name above the bounding box in green
                cv2.putText(frame, class_name.capitalize(), (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # Instructions
    cv2.putText(frame, "Press 'q' to quit", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

    # Show the frame
    cv2.imshow("Bottle Label Detection", frame)

    # Keyboard control
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()