from flask import Blueprint
from flask_jwt_extended import jwt_required

from src.controller.conta_controller import (
    ContaController
)


conta_bp = Blueprint(
    "contas",
    __name__
)


@conta_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return ContaController.listar()


@conta_bp.route(
    "/resumo",
    methods=["GET"]
)
@jwt_required()
def resumo():

    return ContaController.resumo()

@conta_bp.route(
    "/compras/<int:compra_id>",
    methods=["GET"]
)
@jwt_required()
def buscar_compra(
    compra_id
):

    return (
        ContaController
        .buscar_compra(
            compra_id
        )
    )