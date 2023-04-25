'''
files.py
Handles requests that the file-sharing system on the frontend wants to make
'''
from io import BytesIO
from pathlib import Path
from uuid import uuid4
from bson import Binary, ObjectId
import src.util as util
from src.error import InputError, AccessError
from src.data import global_data, db

'''
get_files
token: str,
partner_id: str

shows the files that the user shares with their chosen partner

Will fail when:
Invalid token
Invalid FileRoom (users are not connected)

file = {
    file_id: str,
    filename: str,
    content: bytes
}

returns
username: str (partner's username)
files: file[]
'''
def get_files(token, partner_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")

    id_1 = min(session_pair[0], partner_id)
    id_2 = max(session_pair[0], partner_id)

    file_room = db.FileRooms.find_one({"user_1": id_1, "user_2": id_2})
    
    if not file_room:
        raise InputError(description="Invalid Room")
    
    partner = db.Users.find_one({"_id": ObjectId(partner_id)})
    
    return {
        "username": partner["username"],
        "files": file_room["files"]
    }

'''
upload_file
token: str,
partner_id: str,
file: javascript FormData object

places the file in the proper fileroom in the database

Will fail when:
Invalid token
Invalid FileRoom (users are not connected)

returns empty dictionary
'''
def upload_file(token, partner_id, file):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")

    id_1 = min(session_pair[0], partner_id)
    id_2 = max(session_pair[0], partner_id)

    file_room = db.FileRooms.find_one({"user_1": id_1, "user_2": id_2})
    
    if not file_room:
        raise InputError(description="Invalid Room")
    
    encoded_file = Binary(file.read())
    file_id = str(uuid4())
    file_name = file.filename

    file_room["files"].append({
        "file_id": file_id,
        "filename": file_name,
        "content": encoded_file
    })

    db.FileRooms.update_one({"user_1": id_1, "user_2": id_2}, {'$set': {"files": file_room["files"]}})

    return {}

'''
download_file
token: str,
partner_id: str,
file_id: str

sends the file to the user

Will fail when:
Invalid token
Invalid FileRoom (users are not connected)
Invalid file_id

returns file content
'''
def download_file(token, partner_id, file_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")

    id_1 = min(session_pair[0], partner_id)
    id_2 = max(session_pair[0], partner_id)

    file_room = db.FileRooms.find_one({"user_1": id_1, "user_2": id_2})
    
    if not file_room:
        raise InputError(description="Invalid Room")

    files = [file for file in file_room["files"] if file_id == file["file_id"]]

    if len(files) == 0:
        raise InputError(description="Invalid File")

    return files[0]

'''
delete_file
token: str,
partner_id: str,
file_id: str

deletes the chosen file from the fileroom

Will fail when:
Invalid token
Invalid FileRoom (users are not connected)
Invalid file

returns empty dictionary
'''
def delete_file(token, partner_id, file_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")

    id_1 = min(session_pair[0], partner_id)
    id_2 = max(session_pair[0], partner_id)

    file_room = db.FileRooms.find_one({"user_1": id_1, "user_2": id_2})
    
    if not file_room:
        raise InputError(description="Invalid Room")
    
    files = [file for file in file_room["files"] if file_id == file["file_id"]]

    if len(files) == 0:
        raise InputError(description="Invalid File")
    
    file_room["files"] = [file for file in file_room["files"] if file["file_id"] != file_id]

    db.FileRooms.update_one({"user_1": id_1, "user_2": id_2}, {'$set': {"files": file_room["files"]}})
    return {}