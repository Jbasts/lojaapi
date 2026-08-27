from flask import Blueprint
from flask_jwt_extended import jwt_required

from src.controller.produto_estoque_controller import (
    ProdutoEstoqueController
)


produto_estoque_bp = Blueprint(
    "produtos_estoque",
    __name__
)


@produto_estoque_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return ProdutoEstoqueController.listar()


@produto_estoque_bp.route(
    "/codigo",
    methods=["GET"]
)
@jwt_required()
def buscar_por_codigo():

    return (
        ProdutoEstoqueController
        .buscar_por_codigo()
    )


@produto_estoque_bp.route(
    "/<int:produto_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(produto_id):

    return ProdutoEstoqueController.buscar(
        produto_id
    )


@produto_estoque_bp.route(
    "",
    methods=["POST"]
)
@jwt_required()
def criar():

    return ProdutoEstoqueController.criar()


@produto_estoque_bp.route(
    "/<int:produto_id>",
    methods=["PUT"]
)
@jwt_required()
def atualizar(produto_id):

    return ProdutoEstoqueController.atualizar(
        produto_id
    )


@produto_estoque_bp.route(
    "/<int:produto_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(produto_id):

    return ProdutoEstoqueController.excluir(
        produto_id
    )