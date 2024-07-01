# gunicorn_config.py

import multiprocessing

bind = "0.0.0.0:8000"
wsgi_app = "transcendence.wsgi:application"

workers = multiprocessing.cpu_count() * 2 + 1

accesslog = "./logs/access.log"
errorlog = "./logs/error.log"
capture_output = True

certfile = "./certs/localhost.crt"
keyfile = "./certs/localhost.key"
