from flask import Flask
from flask_cors import CORS
import os


app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"]="sqlite:///projectdb.db"
app.config['SECRET_KEY']='SUPER-SECRET-KEY'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"]=False
app.config["JWT_COOKIE_SECURE"] = False
app.config["JWT_SECRET_KEY"] = "super-secret"
app.config['CACHE_TYPE']='simple'
app.config['MODEL_PATH']='path/to'
app.config['JWT_COOKIE_CSRF_PROTECT']=False
app.config['JWT_TOKEN_LOCATION'] = ["headers", "cookies", "json", "query_string"]