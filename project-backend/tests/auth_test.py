import pytest
import src.auth as auth
from src.error import InputError
# import requests
import json
import jwt
from src.data import debug, global_data, secret


def test_whatever():
    debug = True
    global_data.clear()
    auth.register("norandom@gmail.com", "mypass", "Linoed", True)

    with pytest.raises(InputError):
        auth.login("norandom@gmail.com", "mypass")

    with pytest.raises(InputError):
        auth.verify("6969EKSHEKEYAA")

    auth.verify("DEBUGCODE")

    # logging into 4 different sessions
    auth.login("norandom@gmail.com", "mypass")
    auth.login("norandom@gmail.com", "mypass")
    auth.login("norandom@gmail.com", "mypass")
    auth.login("norandom@gmail.com", "mypass")

    debug = False
    pass

def test_validate():
    debug = True
    global_data.clear()
    auth.register("norandom@gmail.com", "mypass", "Linoed", True)

    auth.verify("DEBUGCODE")

    token = auth.login("norandom@gmail.com", "mypass")["token"]

    auth.logout(token)

    debug = False