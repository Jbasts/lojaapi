from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from src.controller.despesa_extra_controller import (
    DespesaExtraController
)


despesa_extra_bp = Blueprint(
    "despesas_extras",
    __name__
)


@despesa_extra_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return (
        DespesaExtraController
        .listar()
    )


@despesa_extra_bp.route(
    "/<int:despesa_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(despesa_id):

    return (
        DespesaExtraController
        .buscar(despesa_id)
    )


@despesa_extra_bp.route(
    "",
    methods=["POST"]
)
@jwt_required()
def criar():

    return (
        DespesaExtraController
        .criar()
    )


@despesa_extra_bp.route(
    "/<int:despesa_id>",
    methods=["PUT"]
)
@jwt_required()
def atualizar(despesa_id):

    return (
        DespesaExtraController
        .atualizar(despesa_id)
    )


@despesa_extra_bp.route(
    "/<int:despesa_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(despesa_id):

    return (
        DespesaExtraController
        .excluir(despesa_id)
    )