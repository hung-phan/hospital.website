#!/usr/bin/python

"""Server"""

import tornado.ioloop
import tornado.web
import tornado.websocket
import json
import os
from server_database.databaseapi import Database
from global_handler import GlobalHandler

# Static files directories
SERVER_DIR = os.path.dirname(os.path.realpath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SERVER_DIR, os.pardir))
CLIENT_DIR = os.path.join(ROOT_DIR, "client/dist")
PARTIAL_DIR = os.path.join(CLIENT_DIR, "partials")
TEMPLATE_DIR = os.path.join(CLIENT_DIR, "template")

# Database
DB = Database('localhost', 'root', 'ttgr5678', 'hospital_schema')
NO_DATA = 'No data'


class MainHandler(tornado.web.RequestHandler):

    """Render index.html"""

    def get(self):
        """Main page"""
        self.render(CLIENT_DIR + '/index.html')


class NotFoundHandler(tornado.web.RequestHandler):

    """Render 404.html"""

    def get(self):
        """404 page"""
        self.render(CLIENT_DIR + '/404.html')


class PartialHandler(tornado.web.RequestHandler):

    """Render partial html files"""

    def get(self, page_name):
        """Partial html page"""
        self.render("{0}/{1}".format(PARTIAL_DIR, page_name))


class LoginHandler(tornado.web.RequestHandler):

    """Login Handler"""

    def post(self):
        """Post"""
        username = self.get_argument('username', NO_DATA)
        password = self.get_argument('password', NO_DATA)
        self.write(json.dumps(
            {'validUser': 'true' if DB.login(username, password)
             else 'false'}))

    def on_complete(self):
        """On complete funtion"""
        self.write('Login handling')
        self.finish()


class CreateAccountHandler(tornado.web.RequestHandler):

    """Create account handler"""

    def post(self):
        """Post"""
        first_name = self.get_argument('firstName', NO_DATA)
        last_name = self.get_argument('lastName', NO_DATA)
        username = self.get_argument('username', NO_DATA)
        password = self.get_argument('password', NO_DATA)

        # create account
        self.write(json.dumps(
            {'success': 'true' if DB.register_user(
                first_name, last_name, username, password)
                else 'false'}))

    def on_complete(self):
        """On complete funtion"""
        self.write('Create account')
        self.finish()


class Home(tornado.websocket.WebSocketHandler):

    """Websocket handler"""

    handler = GlobalHandler(DB)

    def open(self):
        """Open websocket"""
        self.handler.add_observer(self)

    def on_message(self, message):
        """On message"""
        connection = self
        self.handler.handle(connection, tornado.escape.json_decode(message))

    def on_close(self):
        """Close websocket"""
        self.handler.remove_observer(self)

    def update(self, args=None):
        """Update method"""
        self.write_message(args)


def main():
    """Main program"""
    application = tornado.web.Application([
        (r"/", MainHandler),
        (r"/404.html", NotFoundHandler),
        (r"/partials/(.*)", PartialHandler),
        (r"/login", LoginHandler),
        (r"/create-account", CreateAccountHandler),
        (r"/home", Home),
        (r"/template/(.*)", tornado.web.StaticFileHandler,
            {"path": os.path.join(CLIENT_DIR, "template")}),
        (r"/scripts/(.*)", tornado.web.StaticFileHandler,
            {"path": os.path.join(CLIENT_DIR, "scripts")},),
        (r"/styles/(.*)", tornado.web.StaticFileHandler,
            {"path": os.path.join(CLIENT_DIR, "styles")},),
        (r"/images/(.*)", tornado.web.StaticFileHandler,
            {"path": os.path.join(CLIENT_DIR, "images")},),
        (r"/bower_components/sass-bootstrap/fonts/(.*)",
            tornado.web.StaticFileHandler,
            {"path": os.path.join(CLIENT_DIR,
                                  "bower_components/sass-bootstrap/fonts")},),
    ])

    port = 8000
    print('server start at port {0}'.format(port))

    # start server
    application.listen(port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
