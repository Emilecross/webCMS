'''
error.py
contains the two errors we use (although there's no difference right now, these 
can be extended to provide custom functionality)
'''
from werkzeug.exceptions import HTTPException

# used when someone is doing something that they are forbidden to do
class AccessError(HTTPException):
    code = 403
    message = "No message specified"

# used when someone inputs invalid data
class InputError(HTTPException):
    code = 403
    message = "No message specified"