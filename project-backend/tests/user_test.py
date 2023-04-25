import pytest
from src.data import debug, global_data, User
import src.user as user
import src.auth as auth

debug_verification_code = "DEBUGCODE"

# create a user for testing and return their login user_id and token
# email should be already added to debug_emails in auth.py
def create_test_user(email, password, username, is_charity):
    debug = True

    # register
    auth.register(email, password, username, is_charity)
    
    # verify using debug code
    auth.verify("DEBUGCODE")

    # login 1 session
    login_res = auth.login(email, password)

    debug = False
    return login_res["user_id"], login_res["token"]

@pytest.fixture
def reset():
    global_data.registrants.clear()
    global_data.users.clear()

def get_user_by_user_id(user_id):
    users = global_data.users
    for user in users:
        if user.user_id == user_id:
            return user
    return None

def test_add_need(reset):
    users = global_data.users
    user_id1, token1 = create_test_user("user1@gmail.com", "password", "user1", True)
    user_id2, token2 = create_test_user("user2@gmail.com", "password", "user2", False)
    
    user.add_need(token1, "Money")
    user.add_need(token1, "Helpers")
    user.add_need(token2, "Food")

    user1 = get_user_by_user_id(user_id1)
    user2 = get_user_by_user_id(user_id2)

    assert len(user1.needs) == 2 and "Money" in user1.needs and "Helpers" in user1.needs 
    assert len(user2.needs) == 1 and "Food" in user2.needs

    user.add_need(token1, "Money")
    user1 = get_user_by_user_id(user_id1)
    assert len(user1.needs) == 2 and "Money" in user1.needs and "Helpers" in user1.needs 

    print(global_data)


def test_remove_need(reset):
    users = global_data.users
    user_id1, token1 = create_test_user("user1@gmail.com", "password", "user1", True)
    user_id2, token2 = create_test_user("user2@gmail.com", "password", "user2", False)
    
    user.add_need(token1, "Money")
    user.add_need(token1, "Helpers")
    user.add_need(token2, "Food")

    user.remove_need(token1, "Helpers")
    user.remove_need(token2, "Food")

    user1 = get_user_by_user_id(user_id1)
    user2 = get_user_by_user_id(user_id2)

    assert len(user1.needs) == 1 and "Money" in user1.needs
    assert len(user2.needs) == 0

    user.remove_need(token1, "Food")
    user.remove_need(token2, "Food")

    user1 = get_user_by_user_id(user_id1)
    user2 = get_user_by_user_id(user_id2)

    assert len(user1.needs) == 1 and "Money" in user1.needs
    assert len(user2.needs) == 0


def test_remove_all_needs(reset):
    users = global_data.users
    user_id1, token1 = create_test_user("user1@gmail.com", "password", "user1", True)
    user_id2, token2 = create_test_user("user2@gmail.com", "password", "user2", False)
    
    user.add_need(token1, "Money")
    user.add_need(token1, "Helpers")
    user.add_need(token2, "Food")

    user.remove_all_needs(token1)
    user1 = get_user_by_user_id(user_id1)
    assert len(user1.needs) == 0

def test_connection(reset):
    users = global_data.users
    charity_id1, charity_token1 = create_test_user("charity1@gmail.com", "password", "charity1", True)
    charity_id2, charity_token2 = create_test_user("charity2@gmail.com", "password", "charity2", True)
    sponsor_id1, sponsor_token1 = create_test_user("sponsor1@gmail.com", "password", "sponsor1", False)
    sponsor_id2, sponsor_token2 = create_test_user("sponsor2@gmail.com", "password", "sponsor2", False)

    user.add_connection(charity_token1, sponsor_id1)
    user.add_connection(charity_token1, sponsor_id2)
    user.add_connection(sponsor_token1, charity_id2)

    charity1 = get_user_by_user_id(charity_id1)
    charity2 = get_user_by_user_id(charity_id2)
    sponsor1 = get_user_by_user_id(sponsor_id1)
    sponsor2 = get_user_by_user_id(sponsor_id2)

    assert len(charity1.connections) == 2
    assert len(charity2.connections) == 1
    assert len(sponsor1.connections) == 2
    assert len(sponsor2.connections) == 1

    user.remove_connection(charity_token1, sponsor_id2)
    user.remove_connection(sponsor_token1, charity_token1)

    charity1 = get_user_by_user_id(charity_id1)
    charity2 = get_user_by_user_id(charity_id2)
    sponsor1 = get_user_by_user_id(sponsor_id1)
    sponsor2 = get_user_by_user_id(sponsor_id2)

    assert len(charity1.connections) == 1
    assert len(charity2.connections) == 1
    assert len(sponsor1.connections) == 2
    assert len(sponsor2.connections) == 0