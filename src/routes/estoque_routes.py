from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from src.controller.estoque_controller import (
    EstoqueController
)


estoque_bp = Blueprint(
    "estoque",
    __name__
)


@estoque_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return (
        EstoqueController.listar()
    )


@estoque_bp.route(
    "/resumo",
    methods=["GET"]
)
@jwt_required()
def resumo():

    return (
        EstoqueController.resumo()
    )


@estoque_bp.route(
    "/codigo",
    methods=["GET"]
)
@jwt_required()
def buscar_por_codigo():

    return (
        EstoqueController
        .buscar_por_codigo()
    )


@estoque_bp.route(
    "/retirar",
    methods=["POST"]
)
@jwt_required()
def retirar_para_uso():

    return (
        EstoqueController
        .retirar_para_uso()
    )