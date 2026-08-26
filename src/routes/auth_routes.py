from flask import Blueprint

from src.controller.auth_controller import AuthController


auth_bp = Blueprint(
    "auth",
    __name__
)


@auth_bp.route(
    "/login",
    methods=["POST"]
)
def login():

    return AuthController.login()