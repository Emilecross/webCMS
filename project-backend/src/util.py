'''
util.py

holds utility functions
'''

from src.data import global_data, secret, db
import jwt

# takes token and looks for it in the list of sessions
# if it exists, return (user_id, session_id)
# if it doesnt exist, return None

'''
validate_session
token: str

returns a tuple or None based on the validity of the token

if valid
returns (user_id, session_id)
if not valid
returns None
'''
def validate_session(token):
    decoded = jwt.decode(token, secret, algorithms="HS256")
    user_id = decoded["user_id"]
    session_id = decoded["session_id"]

    for session in global_data.sessions:
        if session.user_id == user_id and session.session_id == session_id:
            return (user_id, session_id)

    return None

'''
for testing purposes

clears the database

'''
def clear_db():
    db.FileRooms.delete_many({})
    db.Messages.delete_many({})
    db.Registrants.delete_many({})
    db.Requests.delete_many({})
    db.Resets.delete_many({})
    db.Users.delete_many({})