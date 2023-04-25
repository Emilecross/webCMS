'''
social.py
Handles the social aspects of the app (connections, messaging, etc)
'''
from datetime import datetime
from src.data import db, global_data, Request, Alert, Report, Message, FileRoom
from src.translate import translate_text
import src.util as util
from bson import ObjectId
from uuid import uuid4
from src.error import AccessError, InputError

'''
get_username
user_id: str

returns the username of the given user: str
'''
def get_username(user_id):
    user = db.Users.find_one({"_id": ObjectId(user_id)})
    return user["username"]

'''
is_connected
token: str,
user_id: str

returns if the two users are connected

Will fail when:
Invalid token

returns
is_connected: bool
'''
def is_connected(token, user_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    my_id = session_pair[0]
    user = db.Users.find_one({"_id": ObjectId(my_id)})

    if user_id in user["connections"]:
        return {
            "is_connected": True
        }

    return {
        "is_connected": False
    }

'''
get_connections
token: str

gets the details of all the connections of the user

Will fail when:
Invalid Token

connectionObj = {
    user_id: str,
    username: str
}

returns
connections: connectionObj[]
'''
def get_connections(token):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")

    user_id = session_pair[0]
    my_user = db.Users.find_one({"_id": ObjectId(user_id)})
    users = list(db.Users.find({}))

    connections = []

    for user in users:
        if user["_id"] in my_user["connections"]:
            connections.append({
                "user_id": user["_id"],
                "username": user["username"]
            })

    return {
        "connections": connections
    }

'''
get_incoming_requests
token: str

returns the requests incoming to the user

Will fail when:
Invalid token

returns
requests: Request[]
'''
def get_incoming_requests(token):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]

    return {
        "requests": [req for req in global_data.requests if req.receiver_id == user_id]
    }

'''
get_outgoing_request
token: str

returns the requests that the user has sent

Will fail when:
Invalid token

returns
requests: Request[]
'''
def get_outgoing_requests(token):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]

    return {
        "requests": [req for req in global_data.requests if req.sender == user_id]
    }

'''
block_user
token: str,
blockee_id: str

blocks the given user

Will fail when:
Invalid token
User is already blocked

returns empty dictionary
'''
def block_user(token, blockee_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]
    my_user = db.Users.find_one({"_id": ObjectId(user_id)})

    if blockee_id not in my_user["blocked_users"]:
        my_user["blocked_users"].append(blockee_id)
        db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"blocked_users": my_user["blocked_users"]}})
    else:
        raise InputError(description="User is already blocked!")


    return {}

'''
unblock_user
token: str,
blockee_id: str

unblocks the user

Will fail when:
Invalid token
User is not blocked

returns empty dictionary
'''
def unblock_user(token, blockee_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]
    my_user = db.Users.find_one({"_id": ObjectId(user_id)})
    
    if blockee_id in my_user["blocked_users"]:
        my_user["blocked_users"].remove(blockee_id)
        db.Users.update_one({"_id": ObjectId(user_id)}, {'$set': {"blocked_users": my_user["blocked_users"]}})
    else:
        raise InputError(description="User is not blocked!")

    return {}

'''
is_blocked
token: str,
user_id: str

returns if the user is blocked

Will fail when:
Invalid token

return
is_blocked: bool
'''
def is_blocked(token, user_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    our_id = session_pair[0]

    user_id = session_pair[0]
    my_user = db.Users.find_one({"_id": ObjectId(our_id)})
    
    if user_id in my_user["blocked_users"]:
        return {
            "is_blocked": True
            }

    return {
        "is_blocked": False
    }

# request connection, and check for both charity and sponsor present
'''
request_connection
token: str,
partner_id: str,
message: str

requests a connection with the target user with a message

Will fail when:
Invalid token
Partner_id is invalid
Both users are the same account type
Both users are already connected
Either user has blocked the other
The request has been made before

returns empty dictionary
'''
def request_connection(token, partner_id, message):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]

    user = db.Users.find_one({"_id": ObjectId(user_id)})
    partner = db.Users.find_one({"_id": ObjectId(partner_id)})
    
    if user is None or partner is None:
        raise InputError(description="User ids not found")
    
    if user["is_charity"] == partner["is_charity"]:
        raise InputError(description="Both sponsor and charity required for connection")

    if partner_id in user["connections"]:
        raise InputError(description="Already connected")

    if partner_id in user["blocked_users"] or user_id in partner["blocked_users"]:
        # resolve the connection request by sending an alert to sender
        user["alerts"].append({
            "alert_type": "request_accepted",
            "alert_id": str(uuid4()),
            "params": {
                "title": f"You have blocked or are blocked by {partner['username']}, cannot send connection request.",
            }
        })
        db.Users.update_one({"_id": ObjectId(user_id)}, 
                {'$set': {"alerts": user["alerts"],}})
        
        raise InputError(description="Users have blocked each other")


    # request already sent
    request = db.Requests.find_one({"$and":
                        [{"sender_id": ObjectId(user_id)}, {"receiver_id": ObjectId(partner_id)}]})
    if request:
        raise InputError(description="Request has already been made!")

    # create request object and add to global requests
    request = {
            "sender_id": user_id,
            "receiver_id": partner_id,
            "sender_username": user["username"],
            "receiver_username": partner["username"],
            "message": message,
    }

    request_id = db.Requests.insert_one(request).inserted_id
    request["request_id"] = str(request_id)

    # send an alert to partner
    partner["alerts"].append({
        "alert_type": "connection_request",
        "alert_id": str(uuid4()),
        "params":
            {
                "title": user["username"] + " wants to connect",
                "content": message,
                "request": request
            }
        })
    db.Users.update_one({"_id": ObjectId(partner_id)}, {'$set': {"alerts": partner["alerts"]}})
    return {}

'''
handle_request
token: str,
request_id: str,
is_accept: bool,
message: str,
alert_id: str

handles (accepts or declines) requests of the user

Will fail when:
Invalid Token
Invalid request_id
Request is not to the user

returns empty dict
'''
def handle_request(token, request_id, is_accept, message, alert_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]

    # get the target request and remove it from active request
    request = db.Requests.find_one_and_delete({"_id": ObjectId(request_id)})

    if request is None:
        raise InputError(description="Request id not found")

    sender_id, receiver_id = request["sender_id"], request["receiver_id"]

    if receiver_id != user_id:
        raise InputError(description="Request is not incoming to user")

    # assume user ids in request are valid
    sender = db.Users.find_one({"_id": ObjectId(sender_id)})
    receiver = db.Users.find_one({"_id": ObjectId(receiver_id)})
    
    if sender is None or receiver is None:
        raise InputError(description="User ids not found")
    
    # if accept, establish connection and notify sender
    if is_accept:
        sender["connections"].append(receiver_id)
        receiver["connections"].append(sender_id)
        id_1 = min(receiver_id, sender_id)
        id_2 = max(receiver_id, sender_id)
        db.FileRooms.insert_one({
            "user_1": id_1,
            "user_2": id_2,
            "files": []
        })
        sender["alerts"].append({
            "alert_type": "request_accepted",
            "alert_id": str(uuid4()),
            "params": {
                "title": receiver["username"] + " has accepted your collaboration request!",
            }
        })
    # if decline, notify sender with message
    else:
        sender["alerts"].append({
            "alert_type": "request_declined",
            "alert_id": str(uuid4()),
            "params": {
                "title": receiver["username"] + " has declined your collaboration request!",
                "content": message,
            }
        })

    receiver["alerts"] = [alert for alert in receiver["alerts"] if alert["alert_id"] != alert_id]
    db.Users.update_one({"_id": ObjectId(sender_id)}, 
                        {'$set': {"alerts": sender["alerts"],
                                  "connections": sender["connections"]}})
    db.Users.update_one({"_id": ObjectId(receiver_id)}, 
                    {'$set': {"alerts": receiver["alerts"],
                                "connections": receiver["connections"]}})
    return {}

'''
remove_user
token: str,
target_id: str

deletes the user from the system

Will fail when:
Invalid token
Target_id is invalid
Requesting user is not an admin
Targetted user is an admin (this is here if the system is extended in the future to add more admins)

returns empty dictionary
'''
def remove_user(token, target_id):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]

    user = db.Users.find_one({"_id": ObjectId(user_id)})
    target = db.Users.find_one({"_id": ObjectId(target_id)})

    if user is None or target is None:
        raise InputError(description="User ids not found")

    if user["permissions"] == 0:
        raise AccessError(description="User is not an admin")
    if target["permissions"] == 1:
        raise InputError(description="Target user is an admin")

    # remove the user from the user storage
    db.Users.delete_one({"_id": ObjectId(target_id)})
    # remove requests sent by the user 
    # dangling connections
    # dangling blocks
    for user in list(db.Users.find({})):
        user["connections"] = [connection for connection in user["connections"] if connection != target_id]
        user["blocked_users"] = [blockee for blockee in user["blocked_users"] if blockee != target_id]
        db.Users.update_one({"_id": user["_id"]}, 
                        {'$set': {"connections": user["connections"],
                                  "blocked_users": user["blocked_users"]}})

    # delete all requests involving the user
    db.Requests.delete_many({"$or":
                        [{"sender_id": ObjectId(target_id)}, {"receiver_id": ObjectId(target_id)}]})

    return {}

'''
report_user
token: str,
target_id: str,
reason: str

makes a report against the user with a reason

Will fail when:
Invalid token
Target_id is invalid

returns empty dictionary
'''
def report_user(token, target_id, reason):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]
    target = db.Users.find_one({"_id": ObjectId(target_id)})

    if not target:
        raise InputError(description="Not a valid user")

    report = {
        "report_id": str(uuid4()),
        "reporter_id": get_username(user_id),
        "reportee_id": get_username(target_id),
        "reason": reason
    }

    target["reports"].append(report)
    db.Users.update_one({"_id": ObjectId(target_id)}, {'$set': {"reports": target["reports"]}})

    return {}

'''
send_message
token: str,
target_id: str,
content: str

sends a message to the chosen user

Will fail when:
Invalid token
Target_id is invalid

returns empty dictionary
'''
def send_message(token, target_id, content):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]
    target = db.Users.find_one({"_id": ObjectId(target_id)})
    user = db.Users.find_one({"_id": ObjectId(user_id)})

    if not target:
        raise InputError(description="Not a valid user")

    if user_id in target["blocked_users"]:
        raise InputError(description="You have been blocked by this user")
    
    if target_id in user["blocked_users"]:
        raise InputError(description="You have blocked this user")

    db.Messages.insert_one({
        "sender_id": user_id,
        "receiver_id": target_id,
        "message": content,
        "timeSent": datetime.now()
    })

    return {}

'''
get_messages
token: str,
target_id: str,
translate: bool

gets a list of messages between the user and the target user. If translate is set, also translates

messageObj = {
    message_id: str,
    fromMe: bool,
    timeSent: str,
    message: str
}

returns
username: str (target's username)
messages: messageObj[]
'''
def get_messages(token, target_id, translate=False):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    user_id = session_pair[0]
    messages = list(db.Messages.find({'$or': [{"sender_id": user_id, "receiver_id": target_id},
                                              {"receiver_id": user_id, "sender_id": target_id}]}))
    
    messages = [{
        "message_id": str(message["_id"]),
        "fromMe": (message["sender_id"] == user_id),
        "timeSent": message["timeSent"].strftime("%d/%m/%Y, %H:%M:%S"),
        # "message": message["message"]
        "message": translate_text(token, message["message"], "en")["translation"] if translate else message["message"]
        # "message": str(type(message["message"])) if translate else message["message"]
    } for message in messages]

    target = db.Users.find_one({"_id": ObjectId(target_id)})
    target_username = target["username"]

    return {
        "username": target_username,
        "messages": messages
    }
