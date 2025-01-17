from flask import jsonify

def ApiResponse(message, status_code, data=None):
    response = {
        "message": message,
        "status": status_code,
        "data": data if data is not None else {},
        "success": True
    }
    return jsonify(response), status_code