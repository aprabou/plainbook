#!/usr/bin/env python3

from bottle import route, template, get, post, static_file, view, HTTPError
from bottle import run, default_app, request
import json
import os
import socket
import webbrowser
import sys
import secrets
import threading
from functools import wraps

APP_FOLDER = os.path.dirname(__file__)
TEST_INPUTS = os.path.join(APP_FOLDER, "tests/files")
AUTH_TOKEN = secrets.token_hex(32)

class LNBook(object):
    """This class implements an LNBook and its operations."""
    
    def __init__(self, notebook_path):
        self.path = notebook_path
        self.name = os.path.splitext(os.path.basename(notebook_path))[0]
        self.nb = None
        self._lock = threading.Lock()
        self.last_executed_cell = -1
        self.load_notebook()

    def load_notebook(self):
        """Loads the notebook from the specified path."""
        with open(self.path) as f:
            self.nb = json.load(f)
            # DEBUG: Adds explanations to each code cell.
            for cell in self.nb['cells']:
                if cell['cell_type'] == 'code':
                    explanation = [
                        "This cell does something interesting.\n",
                        " * It is nice to look at\n",
                        " * It might be even interesting to understand\n",
                    ]
                    cell['metadata']['explanation'] = explanation

                    
notebook_path = os.path.join(TEST_INPUTS, 'sample_notebook.ipynb')
if len(sys.argv) > 1:
    notebook_path = os.path.abspath(sys.argv[1]) 
    
notebook = LNBook(notebook_path)
                    
# Static file routes 
@route('/js/<filepath:path>')
def server_static_js(filepath):
    return static_file(filepath, root=os.path.join(APP_FOLDER, 'js'))

@route('/css/<filepath:path>')
def server_static_css(filepath):
    return static_file(filepath, root=os.path.join(APP_FOLDER, 'css'))

@route('/fonts/<filepath:path>')
def server_static_fonts(filepath):
    return static_file(filepath, root=os.path.join(APP_FOLDER, 'fonts'))

# Authentication decorator
def require_token(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = request.query.get('token')
        if token != AUTH_TOKEN:
            raise HTTPError(403, 'Invalid or missing token')
        return func(*args, **kwargs)
    return wrapper

# Main routes
@get('/')
@view('index.html')
@require_token
def index():
    return dict(notebook_name=notebook.name)

@get('/get_notebook')
@require_token
def get_notebook():
    return dict(
        nb=notebook.nb,
    )
    
@post('/edit_explanation')
@require_token
def edit_explanation():
    data = request.json
    cell_index = data.get('cell_index')
    explanation = data.get('explanation')
    # Here you would typically save the explanation to a database or file
    # For this example, we just log it
    print(f"Updated explanation for cell {cell_index}: {explanation}")
    return dict(status='success')

@post('/edit_code')
@require_token
def edit_code():
    data = request.json
    cell_index = data.get('cell_index')
    source = data.get('source')
    # Here you would typically save the code to a database or file
    # For this example, we just log it
    print(f"Updated code for cell {cell_index}: {source}")
    return dict(status='success')

################################
# Server startup

def find_free_port(start_port):
    port = start_port
    while True:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
            port += 2
            
def logger_middleware(app):
    def wrapper(environ, start_response):
        # This function catches the status code before it's sent to the browser
        def logging_start_response(status, headers, exc_info=None):
            print(f"{environ['REQUEST_METHOD']} {environ['PATH_INFO']} - {status}")
            return start_response(status, headers, exc_info)
        
        return app(environ, logging_start_response)
    return wrapper
    
if __name__ == '__main__':    
    port = find_free_port(8080)
    url = f"http://127.0.0.1:{port}/?token={AUTH_TOKEN}"    
    try:
        webbrowser.open(url)
    except Exception:
        print(f"If the browser does not open, please load this URL: {url}")
    app_with_logging = logger_middleware(default_app())
    run(app=app_with_logging, host='localhost', port=port, server='waitress', 
        threads=16, debug=True)