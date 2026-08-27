from flask import Blueprint
from flask_jwt_extended import jwt_required

from src.controller.cliente_controller import ClienteController


cliente_bp = Blueprint(
    "clientes",
    __name__
)


@cliente_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return ClienteController.listar()


@cliente_bp.route(
    "/<int:cliente_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(cliente_id):

    return ClienteController.buscar(
        cliente_id
    )


@cliente_bp.route(
    "",
    methods=["POST"]
)
@jwt_required()
def criar():

    return ClienteController.criar()


@cliente_bp.route(
    "/<int:cliente_id>",
    methods=["PUT"]
)
@jwt_required()
def atualizar(cliente_id):

    return ClienteController.atualizar(
        cliente_id
    )


@cliente_bp.route(
    "/<int:cliente_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(cliente_id):

    return ClienteController.excluir(
        cliente_id
    )