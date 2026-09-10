from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from src.controller.dashboard_controller import (
    DashboardController
)


dashboard_bp = Blueprint(
    "dashboard",
    __name__
)


@dashboard_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def carregar():

    return (
        DashboardController
        .carregar()
    )