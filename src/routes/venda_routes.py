from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from src.controller.venda_controller import (
    VendaController
)


venda_bp = Blueprint(
    "vendas",
    __name__
)


@venda_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return (
        VendaController.listar()
    )


@venda_bp.route(
    "/resumo",
    methods=["GET"]
)
@jwt_required()
def resumo():

    return (
        VendaController.resumo()
    )