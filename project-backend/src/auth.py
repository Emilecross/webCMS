"""
auth.py
Handles things like registration, login, logout, verification
"""
import ssl
import smtplib
import random
import hashlib
import string
import jwt
from datetime import datetime, timedelta, timezone
from src.data import debug, db, global_data, secret, Registrant, User, Session, Reset
from src.error import InputError, AccessError
import src.util as util

# debug emails set the code to DEBUGCODE
def is_debug_email(email):
    return email.endswith("@debug.com")


'''
register
email: str,
password: str,
username: str,
is_charity: bool

registers a user given their credentials. 

Will fail when:
Email already registered,
Username already used,
Invalid email

returns empty dictionary
'''
def register(email, password, username, is_charity):
    users = db.Users
    registrants = db.Registrants

    if users.count_documents({"email": email }) != 0:
        raise InputError(description="Email already in use")
    if users.count_documents({"username": username }) != 0:
        raise InputError(description="Username already in use")
        
    if registrants.count_documents({"email": email }) != 0:
        raise InputError(description="This email is waiting to be verified")
    if registrants.count_documents({"username": username }) != 0:
        raise InputError(description="The email associated with this username is waiting to be verified")


    # If email and name not used up send an email
    # dbrdsursamnwnzmg app password
    app_password = "dbrdsursamnwnzmg"
    context = ssl.create_default_context()
    
    invalid_code = True
    verification_code = ""
    while invalid_code:
        verification_code = str(''.join(random.choices(string.ascii_uppercase + string.digits, k=10)))
        invalid_code = False
        # making sure the code isnt already in use
        if registrants.count_documents({"verification_code": verification_code }) != 0:
            invalid_code = True
            break

    # if in debug mode, register with debug emails for code = "DEBUGCODE"
    if debug and is_debug_email(email):
        verification_code = "DEBUGCODE"
    else:
        message = f"Hello {username},\nYour verification code is {verification_code}."
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as s:
            s.login("realwebcms@gmail.com", app_password)
            try:
                s.sendmail("realwebcms@gmail.com", email, message)
            except smtplib.SMTPRecipientsRefused:
                raise InputError(description="This email is invalid")

    # 0 = regular user, 1 = admin
    permissions = 0
    if users.count_documents({}) + registrants.count_documents({}) == 0:
        permissions = 1

    registrant = {
        "email": email,
        "password": hashlib.sha256(password.encode()).hexdigest(),
        "username": username,
        "is_charity": is_charity,
        "verification_code": verification_code,
        "permissions": permissions,
    }

    registrants.insert_one(registrant)

    return {}


'''
verify
verification_code: str,

verifies an outstanding verification code, registering the user

Will fail when:
verification code is invalid

returns empty dictionary
'''
def verify(verification_code):
    users = db.Users
    registrants = db.Registrants

    user = registrants.find_one({"verification_code": verification_code})

    if not user:
        raise InputError(description="This verification code is invalid")
    user = {
        "username": user['username'],
        "email": user['email'],
        "password": user['password'],
        "is_charity": user['is_charity'],
        "permissions": user['permissions'],
        "needs": [],
        "description": "Hi, I haven't set a description yet.",
        "connections": [],
        "incoming_requests": [],
        "outgoing_requests": [],
        "blogs": [],
        "blocked_users": [],
        "alerts": [],
        "reports": []
    }

    users.insert_one(user)
    registrants.delete_one({"verification_code": verification_code})

    # verification was successful at this point
    return {}

'''
login
email: str,
password: str

creates a logged-in session for a user given their details

Will fail when:
credentials are invalid

returns
user_id: str,
token: str
'''
def login(email, password):
    users = db.Users

    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    user = users.find_one({"$and":
                        [{"email": email},
                        {"password": hashed_password} ]})
    if not user:
        raise InputError(description="Invalid email or password")

    session_id = global_data.get_session_id()

    user_id = str(user['_id'])

    token = jwt.encode({"user_id": user_id, "session_id": session_id}, secret, algorithm="HS256")

    global_data.sessions.append(Session(user_id, session_id))

    return {
        "user_id": user_id,
        "token": token
    }

'''
logout
token: str,

logs a session out given its token

Will fail when:
Invalid token

returns empty dictionary
'''
def logout(token):
    sessions = global_data.sessions
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    for session in sessions:
        if session.user_id == session_pair[0] and session.session_id == session_pair[1]:
            sessions.remove(session)
            break

    return {}

'''
request_reset
email: str,

sends an email with a reset link given an email

Will fail when:
Invalid email

returns empty dictionary
'''
def request_reset(email):
    users = db.Users
    resets = db.Resets
    user = users.find_one({"email": email})
    if not user:
        raise InputError(description=f"We couldn't find an account associated with {email}.")
    
    username = user["username"]
    reset_code = str(''.join(random.choices(string.ascii_letters, k=15)))
    app_password = "dbrdsursamnwnzmg"
    context = ssl.create_default_context()
    message = f"Hello {username},\nYour reset link is http://localhost:3000/reset_password?code={reset_code}. This link will be valid for 15 minutes"
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as s:
        s.login("realwebcms@gmail.com", app_password)
        try:
            s.sendmail("realwebcms@gmail.com", email, message)
        except smtplib.SMTPRecipientsRefused:
            raise InputError(description="This email is invalid")

    expiry_time = datetime.now(timezone.utc) + timedelta(minutes=15)

    reset = {
        "user_id": user['_id'],
        "code": reset_code,
        "time": expiry_time
    }

    resets.insert_one(reset)
    return {}


'''
reset_password
code: str,
new_password: str

changes a users password given a reset code

Will fail when:
reset code is invalid

returns empty dictionary
'''
def reset_password(code, new_password):
    users = db.Users
    resets = db.Resets
    reset = resets.find_one_and_delete({"code": code})
    if not reset:
        raise InputError("This reset link is invalid")

    hashed_password = hashlib.sha256(new_password.encode()).hexdigest()

    users.find_one_and_update({"_id": reset["user_id"]},
                              {'$set': {"password": hashed_password}})


    # invalidate all the sessions of the user
    sessions = global_data.sessions
    sessions = [session for session in sessions if session.user_id != reset["user_id"]]

    return {}
