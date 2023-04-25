'''
data.py
This file contains the backend data storage. Currently the only part of it being
used is the session storage. The rest of the data is completely stored on the
database. (90% of this was used as a replacement for a database)

The unused data classes are kept here for context, although keep
in mind that some parts of the actual system are different. For example, file rooms 
now store the actual binary data, and ids are now using UUIDs. For an accurate 
understanding of the data, check the mongo database using:
username: webCMS
'''
from datetime import datetime
from pwinput import pwinput
import pymongo
import certifi

def get_database():
    # username = input("Enter your MongoDB username: ")
    password = pwinput(prompt="Enter your MongoDB password: ", mask="*")
    uri = f"mongodb+srv://webCMS:{password}@webcms.wpxuknk.mongodb.net/?retryWrites=true&w=majority"
    client = pymongo.MongoClient(uri, tlsCAFile=certifi.where())
    # Send a ping to confirm a successful connection
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)

    return client.db

class Data:
    def __init__(self):
        # current users who have verified
        self.users = []
        # users yet to verify
        self.registrants = []
        # sessions current logged in
        self.sessions = []
        # current reset objects in storage
        self.resets = []
        # current unresolved requests
        self.requests = []
        # current sent messages
        self.messages = []
        # current file rooms (one for each connection)
        self.file_rooms = []
        # current last used session id
        self.session_id = 0
        # current last used user id
        self.user_id = 0
        # curret last used request id
        self.request_id = 0
        # current last used blog id
        self.blog_id = 0
        # current last used alert id
        self.alert_id = 0
        # current last used report id
        self.report_id = 0
        # current last used message id
        self.message_id = 0
        # current last used file id
        self.file_id = 0
        # mapping of file id to file name
        self.file_map = {}

    def get_file_id(self):
        self.file_id += 1
        return self.file_id

    def get_session_id(self):
        self.session_id += 1
        return self.session_id
    
    def get_user_id(self):
        self.user_id += 1
        return self.user_id
    
    def get_request_id(self):
        self.request_id += 1
        return self.request_id
    
    def get_blog_id(self):
        self.blog_id += 1
        return self.blog_id

    def get_alert_id(self):
        self.alert_id += 1
        return self.alert_id
    
    def get_report_id(self):
        self.report_id += 1
        return self.report_id

    def clear(self):
        self.users = []
        self.registrants = []
        self.sessions = []
        self.resets = []
        self.requests = []
        self.reports = []
        self.file_rooms = []
        self.session_id = 0
        self.user_id = 0
        self.request_id = 0
        self.blog_id = 0
        self.alert_id = 0
        self.report_id = 0
        self.message_id = 0
        self.file_id = 0
        self.file_map.clear()

    def __str__(self):
        return f"Users:\n {self.users}\n\nRegistrants:\n {self.registrants}\n\nSessions:\n {self.sessions}\n\nResets:\n {self.resets}\n\nRequests:\n {self.requests}"
    
    def __repr__(self):
        return self.__str__()

# only used for session storage
global global_data
global_data = Data()

# database connection instance
global db
db = get_database()

global debug
debug = True

# used to encode token
global secret
secret = "96eKEHSke"


# name, email, password, charity status, permissions, password (hashed), stats
class User:
    def __init__(self, username, email, password, is_charity, permissions):
        # decided at login
        self.username = username
        self.email = email
        self.password = password
        self.is_charity = is_charity
        self.permissions = permissions

        # decided by default
        self.user_id = global_data.get_user_id()
        self.needs = []
        self.description = "Hi, I haven't set a description yet."
        self.connections = []
        self.incoming_requests = []
        self.outgoing_requests = []
        self.blogs = []
        self.blocked_users = []
        self.alerts = []
        self.reports = []

    def __str__(self):
        return f"User username: {self.username}, email: {self.email}, password: {self.password}, is_charity: {self.is_charity}, permissions: {self.permissions}, \
            user_id: {self.user_id}, description: {self.description}, connections: {self.connections}, blogs: {self.blogs}, blocked_users: {self.blocked_users}, \
                alerts: {self.alerts}, reports:{self.reports}\n"

    def __repr__(self):
        return self.__str__()
    
class Registrant:
    def __init__(self, email, password, username, is_charity, verification_code, permissions):
        self.email = email
        self.password = password
        self.username = username
        self.is_charity = is_charity
        self.verification_code = verification_code
        self.permissions = permissions

    def __str__(self):
        return f"Registrant email: {self.email}, password: {self.password}, username: {self.username}, is_charity: {self.is_charity}, \
            verification_code: {self.verification_code}, permissions: {self.permissions}\n"

    def __repr__(self):
        return self.__str__()

class Session:
    def __init__(self, user_id, session_id):
        self.user_id = user_id
        self.session_id = session_id

    def __str__(self):
        return f"Session user_id: {self.user_id}, session_id: {self.session_id}"
    
    def __repr__(self):
        return self.__str__()
    
class Reset:
    def __init__(self, user_id, code, time):
        self.user_id = user_id
        self.code = code
        self.time = time

    def __str__(self):
        return f"Reset user_id: {self.user_id}, code: {self.code}, time: {self.time}"

    def __repr__(self):
        return self.__str__()
    
class Request:
    def __init__(self, sender_id, receiver_id, sender_username, receiver_username, message):
        # user request input
        self.sender_id = sender_id
        self.receiver_id = receiver_id
        self.sender_username = sender_username
        self.receiver_username = receiver_username
        self.message = message

        # decided by default
        self.request_id = global_data.get_request_id()

    def to_dict(self):
        return {
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "sender_username": self.sender_username,
            "receiver_username": self.receiver_username,
            "message": self.message,
            "request_id": self.request_id
        }
    
    def __str__(self):
        return f"Request request_id: {self.request_id}, sender_id: {self.sender_id}, receiver_id: {self.receiver_id}, sender_username: {self.sender_username}, \
            receiver_username: {self.receiver_username}, message: {self.message}"

    def __repr__(self):
        return self.__str__()

class Blog:
    def __init__(self, title, content, author, author_id):
        # user blog input
        self.title = title
        self.content = content
        self.author = author
        self.authorId = author_id

        # decided by default
        self.blog_id = global_data.get_blog_id()
        self.editDate = datetime.now()
        self.uploadDate = datetime.now()

    def update_blog(self, title, content):
        self.title = title
        self.content = content
        self.editDate = datetime.now()

    def __str__(self):
        return f"Blog ID: {self.blog_id}, Author username: {self.author}, Author UserID: {self.authorId}, title: {self.title}, \
            content: {self.content}, editDate: {self.editDate}, uploadDate: {self.uploadDate}\n"

    def __repr__(self):
        return self.__str__()

"""
Alert types:
"connect_request"
"request_accepted"
"request_declined"

params = {
    title: string
    content: string
    request: Request
}
"""
class Alert:
    def __init__(self, alert_type, params):
        # user alert input
        self.alert_type = alert_type
        self.params = params

        # decided by default
        self.alert_id = global_data.get_alert_id()

    def __str__(self):
        return f"Alert alert_id: {self.alert_id}, alert_type: {self.alert_type}, params: {self.params}"

    def __repr__(self):
        return self.__str__()
    
"""
Report {
    report_id: int,
    reporter_id: int,
    reportee_id: int,
    reason: string
}
"""
class Report:
    def __init__(self, reporter_id, reportee_id, reason):
        # user input
        self.reporter_id = reporter_id
        self.reportee_id = reportee_id
        self.reason = reason

        # decided by default
        self.report_id = global_data.get_report_id()

    def __str__(self):
        return f"Report reporter_id: {self.reporter_id}, reportee_id: {self.reportee_id}, reason: {self.reason}"

    def __repr__(self):
        return self.__str__()
    
    def to_dict(self):
        return {
            "report_id": self.report_id,
            "reporter_id": self.reporter_id,
            "reportee_id": self.reportee_id,
            "reason": self.reason,
        }

class Message:
    def __init__(self, sender_id, receiver_id, content):
        # user input
        self.content = content
        self.sender_id = sender_id
        self.receiver_id = receiver_id

        # decided by default
        self.message_id = global_data.get_message_id()
        self.time_sent = datetime.now()

    def __str__(self):
        return f"Message message_id: {self.message_id}, sender_id: {self.sender_id}, receiver_id: {self.receiver_id}, content: {self.content}, time_sent: {self.time_sent}"

    def __repr__(self):
        return self.__str__()

    def to_dict(self):
        return {
            "message_id": self.message_id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "content": self.content,
            "time_sent": self.time_sent.isoformat(),
        }

class FileRoom:
    def __init__(self, user_1, user_2):
        self.user_1 = user_1
        self.user_2 = user_2
        # list of file ids, can check the database for mappings to names
        self.files = []
    
    def __str__(self):
        return f"FileRoom user_1: {self.user_1}, user_2: {self.user_2}, files: {self.files}"
    
    def __repr__(self):
        return self.__str__()
