from flask import Blueprint, request, send_file, make_response, jsonify
import os
import io
import ffmpeg
from PIL import Image, UnidentifiedImageError

formatter = Blueprint('formatter', __name__)

supported_formats = {
    "image": ["jpeg", "png", "heic", "tiff", "bmp", "gif", "webp"],
    "pdf": ["pdf", "annotate"],
    "video": ["mp4", "avi", "mov", "mkv"],
}

@formatter.route('/api/v1/formatter/fetch', methods=['POST'])
def fetch():
    files = request.files.getlist('file[]')
    conversion_type = request.form.get('type')

    unsupported_files = [file.filename for file in files if file.filename.split(".")[-1].lower() not in supported_formats.get(conversion_type, [])]
    if unsupported_files:
        return jsonify({"error": f"Unsupported file types: {', '.join(unsupported_files)}"}), 400

    converted_file = io.BytesIO()  
    converted_filename = "converted_file.ext"  

    response = make_response(send_file(converted_file, as_attachment=True, download_name=converted_filename))
    response.headers['Content-Disposition'] = f'attachment; filename="{converted_filename}"'
    return response
