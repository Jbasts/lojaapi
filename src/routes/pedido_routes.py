from flask import Blueprint

from flask_jwt_extended import jwt_required

from src.controller.pedido_controller import (
    PedidoController
)


pedido_bp = Blueprint(
    "pedidos",
    __name__
)


# ==========================
# LISTAR PEDIDOS
# ==========================

@pedido_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return PedidoController.listar()


# ==========================
# BUSCAR PEDIDO
# ==========================

@pedido_bp.route(
    "/<int:pedido_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(pedido_id):

    return PedidoController.buscar(
        pedido_id
    )


# ==========================
# CRIAR PEDIDO
# ==========================

@pedido_bp.route(
    "",
    methods=["POST"]
)
@jwt_required()
def criar():

    return PedidoController.criar()


# ==========================
# ATUALIZAR PEDIDO
# ==========================

@pedido_bp.route(
    "/<int:pedido_id>",
    methods=["PUT"]
)
@jwt_required()
def atualizar(pedido_id):

    return PedidoController.atualizar(
        pedido_id
    )


# ==========================
# EXCLUIR / CANCELAR PEDIDO
# ==========================

@pedido_bp.route(
    "/<int:pedido_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(pedido_id):

    return PedidoController.excluir(
        pedido_id
    )


# ==========================
# CONCLUIR PEDIDO
# ==========================

@pedido_bp.route(
    "/<int:pedido_id>/concluir",
    methods=["POST"]
)
@jwt_required()
def concluir(pedido_id):

    return PedidoController.concluir(
        pedido_id
    )