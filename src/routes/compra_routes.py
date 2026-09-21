from flask import Blueprint
from flask_jwt_extended import jwt_required

from src.controller.compra_controller import (
    CompraController
)


compra_bp = Blueprint(
    "compras",
    __name__
)


@compra_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return CompraController.listar()


@compra_bp.route(
    "/<int:compra_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(compra_id):

    return CompraController.buscar(
        compra_id
    )


@compra_bp.route(
    "",
    methods=["POST"]
)
@jwt_required()
def criar():

    return CompraController.criar()


@compra_bp.route(
    "/<int:compra_id>",
    methods=["PUT"]
)
@jwt_required()
def atualizar(compra_id):

    return CompraController.atualizar(
        compra_id
    )


@compra_bp.route(
    "/<int:compra_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(compra_id):

    return CompraController.excluir(
        compra_id
    )

@compra_bp.route(
    "/ler-nota",
    methods=["POST"]
)
@jwt_required()
def ler_nota():

    return (
        CompraController
        .ler_nota()
    )