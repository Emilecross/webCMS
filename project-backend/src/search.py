'''
search.py
Handles requests for searching and filtering through users
'''
from src.data import global_data, db
from bson import ObjectId

# really simple searching mechanism:
# just check if words are in username and description

# check if words are in needs

'''
search_charity

gets all charity users and returns the results of search on them
'''
def search_charity(words, needs):
    return search(list(db.Users.find({"is_charity": True})), words, needs)

'''
search_sponsor

gets all sponsor users and returns the results of search on them
'''
def search_sponsor(words, needs):
    return search(list(db.Users.find({"is_charity": False})), words, needs)


'''
search_all

gets all users and returns the results of search on them
'''
def search_all(words, needs):
    return search(list(db.Users.find({})), words, needs)

'''
words_match

check if the words are in the user's description or username
if no words are provided, return a match
'''
def words_match(user, words):
    if not len(words):
        return True
    for word in words:
        if word in user["description"].lower() or word in user["username"].lower():
            print(f'{user["description"]}, {user["username"]}')
            return True
    return False

'''
needs_match

check if the needs are in the user's needs
if no needs are provided, return a match
'''
def needs_match(user, needs):
    if not len(needs):
        return True
    for need in needs:
        if need in [need.lower() for need in user["needs"]]:
            return True
    return False

'''
search
users: User[]
words: str[]
needs: str[]

returns the details of all users in the params that matched the words and needs

userObj = {
    user_id: str,
    username: str
}

returns
users: userObj[]
'''
def search(users, words, needs):
    # return the user_id, username
    words = [word.lower() for word in words]
    needs = [need.lower() for need in needs]
    targetUsers = [user for user in users if (words_match(user, words) and needs_match(user, needs))]

    return {
        "users": [{
            "user_id": str(user["_id"]), 
            "username": user["username"]
        } for user in targetUsers]
    }