from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from src.controller.produto_venda_controller import (
    ProdutoVendaController
)


produto_venda_bp = Blueprint(
    "produtos_venda",
    __name__
)


@produto_venda_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return (
        ProdutoVendaController
        .listar()
    )


@produto_venda_bp.route(
    "/<int:produto_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(produto_id):

    return (
        ProdutoVendaController
        .buscar(produto_id)
    )


@produto_venda_bp.route(
    "",
    methods=["POST"]
)
@jwt_required()
def criar():

    return (
        ProdutoVendaController
        .criar()
    )


@produto_venda_bp.route(
    "/<int:produto_id>",
    methods=["PUT"]
)
@jwt_required()
def atualizar(produto_id):

    return (
        ProdutoVendaController
        .atualizar(produto_id)
    )


@produto_venda_bp.route(
    "/<int:produto_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(produto_id):

    return (
        ProdutoVendaController
        .excluir(produto_id)
    )