from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from src.controller.relatorio_controller import (
    RelatorioController
)


relatorio_bp = Blueprint(
    "relatorios",
    __name__
)


@relatorio_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def gerar():

    return (
        RelatorioController
        .gerar()
    )