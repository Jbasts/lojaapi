from flask import Blueprint
from flask_jwt_extended import jwt_required

from src.controller.usuario_controller import UsuarioController


usuario_bp = Blueprint(
    "usuarios",
    __name__
)


@usuario_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return UsuarioController.listar()


@usuario_bp.route(
    "/me",
    methods=["GET"]
)
@jwt_required()
def usuario_logado():

    return UsuarioController.usuario_logado()


@usuario_bp.route(
    "/<int:usuario_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(usuario_id):

    return UsuarioController.buscar(
        usuario_id
    )


@usuario_bp.route(
    "",
    methods=["POST"]
)
@jwt_required()
def criar():

    return UsuarioController.criar()


@usuario_bp.route(
    "/<int:usuario_id>",
    methods=["PUT"]
)
@jwt_required()
def atualizar(usuario_id):

    return UsuarioController.atualizar(
        usuario_id
    )


@usuario_bp.route(
    "/<int:usuario_id>",
    methods=["DELETE"]
)
@jwt_required()
def desativar(usuario_id):

    return UsuarioController.desativar(
        usuario_id
    )