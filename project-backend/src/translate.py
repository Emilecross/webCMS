
from googletrans import Translator

from src.data import global_data, Request, Alert, Report, Message, FileRoom
import src.util as util
from src.error import AccessError, InputError

translator = Translator()

"""
Translate a single string of text
"""
def translate_text(token, text, to_lang="en"):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    # text = text.encode("utf-8")
    if not len(text):
        return {
            "translation": ""
        }
    
    translated_text = translator.translate(text, dest=to_lang).text

    # translated_text = translated_text.decode("utf-8")
    
    return {
        "translation": translated_text
    }

"""
Translate data stored in a dict, returns same keys with translated values
Supports values stored as a string, or a list of strings
"""
def is_str_list(v):
    return isinstance(v, list) and all(isinstance(x, str) for x in v)

def translate_data(token, data, to_lang="en"):
    session_pair = util.validate_session(token)
    if not session_pair:
        raise AccessError(description="Invalid Token")
    
    translation = {}

    for k, v in data.items():
        if not (isinstance(v, str) or is_str_list(v)):
            raise InputError("Values must be a string or list of strings")
        if isinstance(v, str):
            translation[k] = translator.translate(v, dest=to_lang).text
        else:
            translation[k] = []
            for x in v:
                translation[k].append(translator.translate(x, dest=to_lang).text)

    return {
        "translation": translation,
    }


