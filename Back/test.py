import requests

# URL de l'API
url = "http://localhost:8000/blur_bottles/"

# Chemin vers votre vidéo
video_path = "test.mp4"

# Classes à flouter
classes_to_blur = ["eau_vive"]

# Préparer les données
files = {"video": open(video_path, "rb")}
data = {"classes_to_blur": classes_to_blur}

# Envoyer la requête
response = requests.post(url, files=files, data=data)

# Sauvegarder la vidéo renvoyée
if response.status_code == 200:
    with open("blurred_video.mp4", "wb") as f:
        f.write(response.content)
    print("Video processed and saved as blurred_video.mp4")
else:
    print(f"Error: {response.status_code} - {response.text}")