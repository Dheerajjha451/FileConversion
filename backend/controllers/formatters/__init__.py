from flask import Blueprint, request, jsonify, send_file
from utils.ApiError import ApiError
from utils.ApiResponse import ApiResponse
from constants.https_status_codes import *
from PIL import Image
from pillow_heif import register_heif_opener
import os
import zipfile
from PyPDF2 import PdfWriter, PdfReader
import ffmpeg

formatter = Blueprint("formatter", __name__, url_prefix="/api/v1/formatter")

# Global variables
image_extensions = ['jpg', 'jpeg', 'png', 'heic', 'tiff', 'bmp', 'gif', 'webp']
video_extensions = ['mp4', 'avi', 'mov', 'mkv']
register_heif_opener()
RESULT_FOLDER = 'images/results'
if not os.path.exists(RESULT_FOLDER):
    os.makedirs(RESULT_FOLDER)

# Helper functions
def convertImage(data, type):
    converted_files = []
    images = [Image.open(f) for f in data]

    for i, img in enumerate(images):
        converted_file_path = os.path.join(RESULT_FOLDER, f"converted_image_{i + 1}.{type}")
        print(f"Converting file {i + 1} to {type}")
        try:
            img = img.convert("RGB")  
            img.save(converted_file_path, type.upper())
            converted_files.append(converted_file_path)
            print(f"File {i + 1} successfully converted to {type}")
        except Exception as e:
            print(f"Error converting file {i + 1}: {e}")
            return ApiError(f"Error converting file {i + 1}: {e}", HTTP_500_INTERNAL_SERVER_ERROR)

    if len(converted_files) > 1:
        zip_filename = os.path.join(RESULT_FOLDER, "converted_images.zip")
        with zipfile.ZipFile(zip_filename, 'w') as zipf:
            for file_path in converted_files:
                zipf.write(file_path, os.path.basename(file_path))
        print("Images successfully converted!")
        return send_file(zip_filename, as_attachment=True, download_name="converted_images.zip")
    else:
        print("Image successfully converted!")
        return send_file(converted_files[0], as_attachment=True, download_name=os.path.basename(converted_files[0]))

def convertToPdf(data):
    images = [Image.open(f).convert('RGB') for f in data]  
    pdf_filename = os.path.join(RESULT_FOLDER, "output.pdf")

    # Save the images as a single PDF file
    images[0].save(pdf_filename, resolution=100.0, save_all=True, append_images=images[1:])
    return send_file(pdf_filename, as_attachment=True, download_name="converted_file.pdf")

def editPDF(data, pages):
    infile = PdfReader(data[0]) 
    output = PdfWriter()

    pages = [int(p) - 1 for p in pages]
    for i in pages:
        try:
            output.add_page(infile.pages[i])
        except IndexError:
            print(f"Page {i} does not exist in the provided PDF.")
            continue

    # Save the edited PDF
    pdf_filename = os.path.join(RESULT_FOLDER, 'newfile.pdf')
    with open(pdf_filename, 'wb') as f:
        output.write(f)

    return send_file(pdf_filename, as_attachment=True, download_name="edited_file.pdf")

def convertVideo(data, type):
    converted_files = []
    for i, video in enumerate(data):
        input_file_path = os.path.join(RESULT_FOLDER, f"input_video_{i + 1}.{video.filename.split('.')[-1]}")
        output_file_path = os.path.join(RESULT_FOLDER, f"converted_video_{i + 1}.{type}")
        video.save(input_file_path)
        print(f"Converting video {i + 1} to {type}")
        try:
            ffmpeg.input(input_file_path).output(output_file_path).run()
            converted_files.append(output_file_path)
            print(f"Video {i + 1} successfully converted to {type}")
        except Exception as e:
            print(f"Error converting video {i + 1}: {e}")
            return ApiError(f"Error converting video {i + 1}: {e}", HTTP_500_INTERNAL_SERVER_ERROR)

    if len(converted_files) > 1:
        zip_filename = os.path.join(RESULT_FOLDER, "converted_videos.zip")
        with zipfile.ZipFile(zip_filename, 'w') as zipf:
            for file_path in converted_files:
                zipf.write(file_path, os.path.basename(file_path))
        print("Videos successfully converted!")
        return send_file(zip_filename, as_attachment=True, download_name="converted_videos.zip")
    else:
        print("Video successfully converted!")
        return send_file(converted_files[0], as_attachment=True, download_name=os.path.basename(converted_files[0]))

# Routes
@formatter.route("/fetch", methods=['POST'])
def file_fetch():
    data = request.files.getlist('file[]')
    if not data:
        return ApiError("No files uploaded", HTTP_400_BAD_REQUEST)
    
    json_data = request.form
    file_type = json_data.get('type')  # Use .get() to handle missing 'type'

    if not file_type:
        return ApiError("Missing 'type' in request data", HTTP_400_BAD_REQUEST)

    if file_type in image_extensions:
        return convertImage(data, file_type)
    elif file_type == 'pdf':
        return convertToPdf(data)
    elif file_type == 'annotate':
        pages = request.form.getlist('pages_to_keep[]')
        if len(pages) == 1 and ',' in pages[0]:
            pages = pages[0].split(',')

        try:
            pages = [int(page) for page in pages]
        except ValueError:
            return ApiError("Invalid page numbers provided", HTTP_400_BAD_REQUEST)

        return editPDF(data, pages)
    elif file_type in video_extensions:
        return convertVideo(data, file_type)

    return ApiError(f"Unsupported file type: {file_type}", HTTP_400_BAD_REQUEST)