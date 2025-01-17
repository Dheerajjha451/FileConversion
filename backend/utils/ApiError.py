from flask import jsonify

def ApiError(message, status_code, errors=None):
    response = {
        "message": message,
        "status": status_code,
        "errors": errors if errors is not None else [],
        "success": False
    }
    return jsonify(response), status_code