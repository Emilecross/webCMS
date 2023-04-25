'''
dashboard.py
Handles requests that the dashboard on the frontend wants to make
'''
from src.data import global_data, db
from bson import ObjectId
import src.util as util
from src.error import AccessError, InputError
from src.search import needs_match

'''
get_recommendation
token: str,
option: str ("All" | "Lone" | "Connected")

gets recommendations for a user

Will fail when:
Invalid token

userObj = {
    username: str,
    user_id: str,
    needs: str[]
}

returns
is_charity: bool,
needs: str[],
recommendations: userObj[]
'''
def get_recommendation(token, option):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    user_id = session_pair[0]

    target = db.Users.find_one({"_id": ObjectId(user_id)})

    user_connections = list(set(target["connections"]))
    filtered_users = []

    if option == "All":
        filtered_users = list(db.Users.find({"_id": {"$nin": user_connections}, "is_charity": {"$ne": target["is_charity"]}}))
        pass
    elif option == "Lone":
        filtered_users = list(db.Users.find({"_id": {"$ne": user_id}, "connections": [], "is_charity": {"$ne": target["is_charity"]}}))
        pass
    elif option == "Connected":
        filtered_users = list(db.Users.find({"_id": {"$nin": user_connections}, "connections": {"$ne": []}, "is_charity": {"$ne": target["is_charity"]}}))
        pass
    else:
        raise InputError(description="Invalid Option")
    
    for user in filtered_users:
        user["user_id"] = str(user["_id"])
        del user["_id"]
    
    return recommendations(target["needs"], filtered_users, target["is_charity"])

'''
recommendations
needs: str[],
users: User[],
is_charity: bool

gets all users whose needs match the given needs

userObj = {
    username: str,
    user_id: str,
    needs: str[]
}

returns
is_charity: bool,
needs: str[],
recommendations: userObj[]
'''
def recommendations(needs, users, is_charity):
    targetUsers = [user for user in users if needs_match(user, needs)]

    return {
        "is_charity": is_charity,
        "needs": needs,
        "recommendations": [{
            "username": user["username"],
            "user_id": str(user["user_id"]),
            "needs": user["needs"]
        } for user in targetUsers]
    }

'''
get_connections
token: string

gets the connections of the user using the token

connectionObj = {
    user_id: str,
    username: str,
    needs: str[]
}

returns
our_needs: str[],
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
        if str(user["_id"]) in my_user["connections"]:
            connections.append({
                "user_id": str(user["_id"]),
                "username": user["username"],
                "needs": user["needs"]
            })

    return {
        "our_needs": my_user["needs"],
        "connections": connections
    }