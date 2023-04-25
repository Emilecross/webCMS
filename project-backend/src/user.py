# this will handle users 
# things like showing and editing user data like stats, username, needs, data etc

from datetime import datetime
from uuid import uuid4
from src.data import global_data, db, Blog
from src import auth
import src.util as util
from src.error import AccessError, InputError
from src.auth import login
from src.social import request_connection, handle_request
from bson import ObjectId
import hashlib

'''
add_need
token: str,
need: str

adds the need to the user's profile

Will fail when:
Invalid token

returns empty dictionary
'''
def add_need(token, need):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]
    user = db.Users.find_one({"_id": ObjectId(user_id)})
    user["needs"].append(need)
    db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"needs": user["needs"]}})
    return {}

'''
remove_need
token: str,
need: str

removes the need from the user's profile

Will fail when:
Invalid token

returns empty dictionary
'''
def remove_need(token, need):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]
    user = db.Users.find_one({"_id": ObjectId(user_id)})

    if need in user["needs"]:
        user["needs"].remove(need)

    db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"needs": user["needs"]}})
    return {}

'''
remove_all_needs
token: str

removes all needs from the user's profile

Will fail when:
Invalid token

returns empty dictionary
'''
def remove_all_needs(token):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]

    db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"needs": []}})
    return {}

'''
get_blog
token: str,
user_id: str,
blog_id: str

gets the blog owned by the target user with the specified blog_id

Will fail when:
Invalid token
Blog doesn't exist

returns Blog object
'''
def get_blog(token, user_id, blog_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user = db.Users.find_one({"_id": ObjectId(user_id)})
    for blog in user["blogs"]:
        if blog["blog_id"] == blog_id:
            return blog
                
    raise InputError(description="Blog does not exist")

'''
add_blog
token: str,
title: str,
content: str

adds the blog to the user's profile

Will fail when:
Invalid token

returns
blog_id: str
'''
def add_blog(token, title, content):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    user_id = session_pair[0]
    user = db.Users.find_one({"_id": ObjectId(user_id)})
    new_blog = {
        "title": title,
        "content": content,
        "author": user["username"],
        "authorId": user_id,
        "blog_id": str(uuid4()),
        "editDate": datetime.now(),
        "uploadDate": datetime.now(),
    }
    user["blogs"].append(new_blog)
    db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"blogs": user["blogs"]}})

    return {"blog_id": new_blog["blog_id"]}

'''
edit_blog
token: str,
blog_id: str,
title: str,
content: str

edits the details of the specified blog

Will fail when:
Invalid token
Invalid blog

returns
blog_id: str
'''
def edit_blog(token, blog_id, title, content):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    user_id = session_pair[0]
    user = db.Users.find_one({"_id": ObjectId(user_id)})
    for blog in user["blogs"]:
        if blog["blog_id"] == blog_id:
            blog["title"] = title
            blog["content"] = content
            db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"blogs": user["blogs"]}})
            return {"blog_id": blog["blog_id"]}
    raise InputError(description="Invalid blog")

'''
remove_blog
token: str,
blog_id: str

removes the given blog from the user's profile

Will fail when:
Invalid token

returns empty dictionary
'''
def remove_blog(token, blog_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    user_id = session_pair[0]
    user = db.Users.find_one({"_id": ObjectId(user_id)})
    if not user:
        InputError(description="No such user!")
    user["blogs"] = [blog for blog in user["blogs"] if blog["blog_id"] != blog_id]
    db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"blogs": user["blogs"]}})
    return {}
'''
update_password
token: str,
old_password: str,
new_password: str

updates the password of the user if the old_password is correct. Also invalidates
the current sessions of the user

Will fail when:
Invalid token
Invalid password

returns empty dictionary
'''
def update_password(token, old_password, new_password):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]
    session_id = session_pair[1]
    hashed_old_password = hashlib.sha256(old_password.encode()).hexdigest()
    hashed_new_password = hashlib.sha256(new_password.encode()).hexdigest()

    if not db.Users.find_one_and_update({"$and":
                    [{"_id": ObjectId(user_id)}, {"password": hashed_old_password}]},
                    {'$set': {"password": hashed_new_password}}):
        raise InputError(description="Invalid Password")

    # invalidate all other sessions of this user
    sessions = global_data.sessions
    sessions = [session for session in sessions if session.user_id != user_id or session.session_id == session_id]
    return {}


'''
update_email
token: str,
password: str,
new_email; str

updates the email of the user

Will fail when
Invalid token
Email already used
Invalid password

returns empty dictionary
'''
def update_email(token, password, new_email):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    if db.Users.find_one({"email": new_email}):
        raise InputError(description="Email is already in use")

    user_id = session_pair[0]
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    if not db.Users.find_one_and_update({"$and":
                        [{"_id": ObjectId(user_id)}, {"password": hashed_password}]},
                        {'$set': {"email": new_email}}):
        raise InputError(description="Invalid Password")
    return {}

'''
update_username
token: str,
new_username: str,

updates the users username if it's not already in use

Will fail when:
Invalid token
Username is already being used

returns empty dictionary
'''
def update_username(token, new_username):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    if len(list(db.Users.find({"username": new_username}))): 
        raise InputError(description="Username is already in use")

    user_id = session_pair[0]
    db.Users.find_one_and_update({"_id": ObjectId(user_id)}, {'$set': {"username": new_username}})

    return {}

'''
update_description
token: str,
new_description: str

updates the description of the user

Will fail when:
Invalid token

returns empty dictionary
'''
def update_description(token, new_description):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")

    user_id = session_pair[0]
    db.Users.find_one_and_update({"_id": ObjectId(user_id)}, {'$set': {"description": new_description}})

    return {}

'''
add_connection
token: str,
partner_id: str

adds a connection between two users

Will fail when:
Invalid token

returns empty dictionary
'''
def add_connection(token, partner_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]
    user = db.Users.find_one({"_id": ObjectId(user_id)})
    partner = db.Users.find_one({"_id": ObjectId(partner_id)})
    # make the connection if not connected
    if partner_id not in user["connections"]:
        user["connections"].append(partner_id)
    if user_id not in partner["connections"]:
        partner["connections"].append(user_id)

    db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"connections": user["connections"]}})
    db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"connections": partner["connections"]}})
    return {}

'''
remove_connection
token: str,
partner_id: str

removes a connection between two users

Will fail when:
Invalid token

returns empty dictionary
'''
def remove_connection(token, partner_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]
    user = db.Users.find_one({"_id": ObjectId(user_id)})
    partner = db.Users.find_one({"_id": ObjectId(partner_id)})
    # remove the connection if connected
    if partner_id in user["connections"]:
        user["connections"].remove(partner_id)
    if user_id in partner["connections"]:
        partner["connections"].remove(user_id)

    db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"connections": user["connections"]}})
    db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"connections": partner["connections"]}})
    return {}


'''
profile_data
user_id: str

gives the profile data of the user with the specified user_id

returns
username: str,
email: str,
connections: str[],
is_charity: bool,
permissions: int,
is_own: bool,
description: str,
needs: str[],
blocked_users: str[],
blogs: Blog[]
'''
def profile_data(user_id):
    user = db.Users.find_one({"_id": ObjectId(user_id)})

    # blogs = [{"blog_id": blog["_id"], 
    #             "blog_title": blog["title"], 
    #             "blog_text": blog["content"], 
    #             "author_user_id": blog["authorId"], 
    #             "author_username": blog["author"]} 
    #             for blog in user["blogs"]]
    
    return {
        "username": user["username"],
        "email": user["email"],
        "connections": len(user["connections"]),
        "is_charity": user["is_charity"],
        "permissions": user["permissions"],
        "is_own": user_id == str(user["_id"]),
        "description": user["description"],
        "needs": user["needs"],
        "blocked_users": user["blocked_users"],
        "blogs": list(reversed(user["blogs"]))
    }

'''
get_top10_sponsors

shows the top 10 sponsors ordered by number of connections

sponsorObj = {
    name: str,
    connections: str[]
    user_id: str
}

returns
sponsors: sponsorObj[]
'''
# get the top 10 sponsors by number of connections
# return all in sorted in order if less than 10
def get_top10_sponsors():
    users = list(db.Users.find({}))
    sponsors = [u for u in users if not u["is_charity"]]
    sponsors.sort(key=lambda u: len(u["connections"]), reverse=True)
    top10 = sponsors[:min(len(sponsors), 10)]

    result = [{"name": sponsor["username"], "connections": len(sponsor["connections"]),"user_id":str(sponsor["_id"])} for sponsor in top10]

    return {
        "sponsors": result
    }

'''
get_users
token: str

gets all the users in the system

Will fail when:
Invalid token

userObj = {
    username: str,
    user_id: str,
    connections: str[],
    is_connected: bool,
    is_charity: bool,
    reports: Report[]
}

returns
users: userObj[]
'''
def get_users(token):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")

    user_id = session_pair[0]

    out_requests = list(db.Requests.find({"sender_id": user_id}))
    out_requests = [request["receiver_id"] for request in out_requests]

    in_requests = list(db.Requests.find({"receiver_id": user_id}))
    in_requests = [request["sender_id"] for request in in_requests]
    users = list(db.Users.find({}))
    result = [{"username": user["username"], 
               "user_id": str(user["_id"]), 
               "connections": len(user["connections"]), 
               "is_connected": user_id in user["connections"], 
               "is_charity": user["is_charity"],
                "reports": list(reversed(user["reports"])),
                "is_pending": str(user["_id"]) in out_requests or str(user["_id"]) in in_requests} for user in users if str(user["_id"]) != user_id]
    return {
        "users": result
    }

'''
get_alerts
token: str

gets all the incoming alerts for the user

Will fail when:
Invalid token

returns
alerts: Alert[]
'''
def get_alerts(token):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]
    users = db.Users
    user = users.find_one({"_id": ObjectId(user_id)})

    return {
        "alerts": list(reversed(user["alerts"]))
    }

# vv development testing functions below vv

def create_test_user(email, password, username, is_charity):
    # register
    auth.register(email, password, username, is_charity)
    
    # verify using debug code
    auth.verify("DEBUGCODE")

def make_debug_users(num_charities, num_sponsors):
    for i in range(1, num_charities + 1):
        create_test_user(f"charity{i}@debug.com", f"charity{i}@debug.com", f"charity{i}", True)
    for i in range(1, num_sponsors + 1):
        create_test_user(f"sponsor{i}@debug.com", f"sponsor{i}@debug.com", f"sponsor{i}", False)
