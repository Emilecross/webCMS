'''
server.py

backend flask server providing a large amount of routes for the frontend to send
requests to
'''
from io import BytesIO
import sys
import signal
from bson import json_util
from json import dumps, loads
from flask import Flask, request, send_file, make_response
from flask_cors import CORS
from src.data import global_data, debug
import re
from src import auth, user, social, search, dashboard, files, translate, util


def quit_gracefully(*args):
    exit(0)


def defaultHandler(err):
    response = err.get_response()
    print("response", err, response)
    response.data = dumps({
        "code": err.code,
        "name": "System Error",
        "message": err.get_description(),
    }, default=json_util.default)
    response.content_type = "application/json"
    return response


APP = Flask(__name__)
CORS(APP)
APP.config["TRAP_HTTP_EXCEPTIONS"] = True
APP.register_error_handler(Exception, defaultHandler)


# vv ROUTES vv

@APP.route("/auth/register", methods=["POST"])
def auth_register():
    email = request.json.get("email")
    password = request.json.get("password")
    username = request.json.get("username")
    # not sure if this bool will work, prayge
    is_charity = request.json.get("is_charity")
    functionCall = auth.register(email, password, username, is_charity)
    return dumps(functionCall, default=json_util.default)

@APP.route("/auth/verify", methods=["POST"])
def auth_verify():
    verification_code = request.json.get("verification_code")
    functionCall = auth.verify(verification_code)
    return dumps(functionCall, default=json_util.default)

@APP.route("/auth/login", methods=["POST"])
def auth_login():
    email = request.json.get("email")
    password = request.json.get("password")
    functionCall = auth.login(email, password)
    return dumps(functionCall, default=json_util.default)

@APP.route("/auth/logout", methods=["POST"])
def auth_logout():
    token = request.json.get("token")
    functionCall = auth.logout(token)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/add_need", methods=["POST"])
def user_add_need():
    token = request.json.get("token")
    need = request.json.get("need")
    functionCall = user.add_need(token, need)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/remove_need", methods=["POST"])
def user_remove_need():
    token = request.json.get("token")
    need = request.json.get("need")
    functionCall = user.remove_need(token, need)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/remove_all_needs", methods=["POST"])
def user_all_needs():
    token = request.json.get("token")
    functionCall = user.remove_all_needs(token)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/update_email", methods=["PUT"])
def user_update_email():
    token = request.json.get("token")
    password = request.json.get("password")
    email = request.json.get("email")
    functionCall = user.update_email(token, password, email)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/update_username", methods=["PUT"])
def user_update_username():
    token = request.json.get("token")
    username = request.json.get("username")
    functionCall = user.update_username(token, username)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/update_description", methods=["PUT"])
def user_update_description():
    token = request.json.get("token")
    description = request.json.get("description")
    functionCall = user.update_description(token, description)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/add_connection", methods=["POST"])
def user_add_connection():
    token = request.json.get("token")
    partner_id = request.json.get("partner_id")
    functionCall = user.add_connection(token, partner_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/remove_connection", methods=["POST"])
def user_remove_connection():
    token = request.json.get("token")
    partner_id = request.json.get("partner_id")
    functionCall = user.remove_connection(token, partner_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/update_password", methods=["PUT"])
def user_update_password():
    token = request.json.get("token")
    old_password = request.json.get("old_password")
    new_password = request.json.get("new_password")
    functionCall = user.update_password(token, old_password, new_password)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/add_blog", methods=["POST"])
def user_add_blog():
    token = request.json.get("token")
    title = request.json.get("title")
    content = request.json.get("content")
    functionCall = user.add_blog(token, title, content)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/edit_blog", methods=["PUT"])
def user_edit_blog():
    token = request.json.get("token")
    blog_id = request.json.get("blog_id")
    title = request.json.get("title")
    content = request.json.get("content")
    functionCall = user.edit_blog(token, blog_id, title, content)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/remove_blog", methods=["DELETE"])
def user_remove_blog():
    token = request.json.get("token")
    blog_id = request.json.get("blog_id")
    functionCall = user.remove_blog(token, blog_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/profile_data", methods=["GET"])
def user_profile_data():
    user_id = request.headers.get("user_id")
    functionCall = user.profile_data(user_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/auth/request_reset", methods=["PUT"])
def auth_request_reset():
    email = request.json.get("email")
    functionCall = auth.request_reset(email)
    return dumps(functionCall, default=json_util.default)

@APP.route("/auth/reset_password", methods=["PUT"])
def auth_reset_password():
    code = request.json.get("code")
    new_password = request.json.get("new_password")
    functionCall = auth.reset_password(code, new_password)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/top_ten_sponsors", methods=["GET"])
def user_top_ten_sponsors():
    functionCall = user.get_top10_sponsors()
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/get_users", methods=["GET"])
def user_get_users():
    token = request.headers.get("token")
    functionCall = user.get_users(token)
    return dumps(functionCall, default=json_util.default)

@APP.route("/social/is_blocked", methods=["GET"])
def social_is_blocked():
    token = request.json.get("token")
    user_id = request.json.get("user_id")
    functionCall = social.is_blocked(token, user_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/social/block_user", methods=["POST"])
def social_block_user():
    token = request.json.get("token")
    blockee_id = request.json.get("user_id")
    functionCall = social.block_user(token, blockee_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/social/unblock_user", methods=["POST"])
def social_unblock_user():
    token = request.json.get("token")
    blockee_id = request.json.get("user_id")
    functionCall = social.unblock_user(token, blockee_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/social/request_connection", methods=["POST"])
def social_request_connection():
    token = request.json.get("token")
    partner_id = request.json.get("partner_id")
    message = request.json.get("message")
    functionCall = social.request_connection(token, partner_id, message)
    return dumps(functionCall, default=json_util.default)

# used only for dev testing
# @APP.route("/populate_test_data", methods=["GET"])
# def populate_test_data():
#     user.make_debug_users(20, 20)
#     return dumps({})

@APP.route("/social/remove_user", methods=["DELETE"])
def social_remove_user():
    token = request.json.get("token")
    user_id = request.json.get("user_id")
    functionCall = social.remove_user(token, user_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/search/search_charity", methods=["GET"])
def search_search_charity():
    words = re.findall(r'\w+', request.headers.get("words"))
    needs = re.findall(r'\w+', request.headers.get("needs"))
    functionCall = search.search_charity(words, needs)
    return dumps(functionCall, default=json_util.default)

@APP.route("/search/search_sponsor", methods=["GET"])
def search_search_sponsor():
    words = re.findall(r'\w+', request.headers.get("words"))
    needs = re.findall(r'\w+', request.headers.get("needs"))
    functionCall = search.search_sponsor(words, needs)
    return dumps(functionCall, default=json_util.default)

@APP.route("/search/search_all", methods=["GET"])
def search_search_all():
    words = re.findall(r'\w+', request.headers.get("words"))
    needs = re.findall(r'\w+', request.headers.get("needs"))
    functionCall = search.search_all(words, needs)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/get_alerts", methods=["GET"])
def user_get_alerts():
    token = request.headers.get("token")
    functionCall = user.get_alerts(token)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/accept_request", methods=["POST"])
def user_accept_request():
    token = request.json.get("token")
    request_id = request.json.get("request_id")
    message = request.json.get("message")
    alert_id = request.json.get("alert_id")
    print(token, request_id, message)
    functionCall = social.handle_request(token, request_id, True, message, alert_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/decline_request", methods=["POST"])
def user_decline_request():
    token = request.json.get("token")
    request_id = request.json.get("request_id")
    message = request.json.get("message")
    alert_id = request.json.get("alert_id")
    print(token, request_id, message)
    functionCall = social.handle_request(token, request_id, False, message, alert_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/user/get_blog", methods=["GET"])
def user_get_blog():
    token = request.headers.get("token")
    user_id = request.headers.get("user_id")
    blog_id = request.headers.get("blog_id")
    functionCall = user.get_blog(token, user_id, blog_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/dashboard/get_recommendations", methods=["GET"])
def dashboard_get_recommendations():
    token = request.headers.get("token")
    option = request.headers.get("option")
    functionCall = dashboard.get_recommendation(token, option)
    return dumps(functionCall, default=json_util.default)

@APP.route("/social/report_user", methods=["POST"])
def social_report_user():
    token = request.json.get("token")
    target_id = request.json.get("target_id")
    reason = request.json.get("reason")
    functionCall = social.report_user(token, target_id, reason)
    return dumps(functionCall, default=json_util.default)

@APP.route("/dashboard/get_connections", methods=["GET"])
def dashboard_get_connections():
    token = request.headers.get("token")
    functionCall = dashboard.get_connections(token)
    return dumps(functionCall, default=json_util.default)

@APP.route("/social/send_message", methods=["POST"])
def social_send_message():
    token = request.json.get("token")
    target_id = request.json.get("target_id")
    content = request.json.get("content")
    functionCall = social.send_message(token, target_id, content)
    return dumps(functionCall, default=json_util.default)

@APP.route("/files/upload_file", methods=["POST"])
def files_upload_file():
    token = request.headers.get("token")
    partner_id = request.headers.get("partner_id")
    file = request.files["file"]
    functionCall = files.upload_file(token, partner_id, file)
    return dumps(functionCall, default=json_util.default)

@APP.route("/files/get_files", methods=["GET"])
def files_get_files():
    token = request.headers.get("token")
    partner_id = request.headers.get("partner_id")
    functionCall = files.get_files(token, partner_id)
    return dumps(functionCall, default=json_util.default)

@APP.route("/files/download_file", methods=["GET"])
def files_download_file():
    token = request.headers.get("token")
    partner_id = request.headers.get("partner_id")
    file_id = request.headers.get("file_id")
    file = files.download_file(token, partner_id, file_id)
    file_data = BytesIO(file["content"])
    file_name = file["filename"]

    response = make_response(send_file(file_data, download_name=file_name, as_attachment=True))
    response.headers["Access-Control-Expose-Headers"] = "*"
    response.headers["file_name"] = file_name
    return response

@APP.route("/translate/translate_text", methods=["POST"])
def translate_translate_text():
    token = request.json.get("token")
    text = request.json.get("text")
    functionCall = translate.translate_text(token, text, "en")
    return dumps(functionCall, default=json_util.default)

@APP.route("/translate/translate_data", methods=["POST"])
def translate_translate_data():
    token = request.json.get("token")
    data = request.json.get("data")
    functionCall = translate.translate_data(token, data, "en")
    return dumps(functionCall, default=json_util.default)

@APP.route("/social/get_messages", methods=["GET"])
def social_get_messages():
    token = request.headers.get("token")
    target_id = request.headers.get("target_id")
    functionCall = social.get_messages(token, target_id, False)
    return dumps(functionCall, default=json_util.default)

@APP.route("/social/get_messages_translated", methods=["GET"])
def social_get_messages_translated():
    token = request.headers.get("token")
    target_id = request.headers.get("target_id")
    functionCall = social.get_messages(token, target_id, True)
    return dumps(functionCall, default=json_util.default)

@APP.route("/files/delete_file", methods=["DELETE"])
def files_delete_file():
    token = request.json.get("token")
    partner_id = request.json.get("partner_id")
    file_id = request.json.get("file_id")
    functionCall = files.delete_file(token, partner_id, file_id)
    return dumps(functionCall)

@APP.route("/clear_db", methods=["DELETE"])
def clear_db():
    util.clear_db()
    return {}

# ^^ ROUTES ^^ 

if __name__ == "__main__":
    signal.signal(signal.SIGINT, quit_gracefully)
    APP.run(port=6969, debug=False)