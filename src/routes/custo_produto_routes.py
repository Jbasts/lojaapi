from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from src.controller.custo_produto_controller import (
    CustoProdutoController
)


custo_produto_bp = Blueprint(
    "custos_produtos",
    __name__
)


@custo_produto_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return (
        CustoProdutoController
        .listar()
    )


@custo_produto_bp.route(
    "/<int:produto_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(produto_id):

    return (
        CustoProdutoController
        .buscar(produto_id)
    )


@custo_produto_bp.route(
    "/<int:produto_id>",
    methods=["PUT"]
)
@jwt_required()
def salvar(produto_id):

    return (
        CustoProdutoController
        .salvar(produto_id)
    )


@custo_produto_bp.route(
    "/<int:produto_id>",
    methods=["DELETE"]
)
@jwt_required()
def remover(produto_id):

    return (
        CustoProdutoController
        .remover(produto_id)
    )