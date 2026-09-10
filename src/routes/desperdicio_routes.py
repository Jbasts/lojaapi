from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from src.controller.desperdicio_controller import (
    DesperdicioController
)


desperdicio_bp = Blueprint(
    "desperdicios",
    __name__
)


@desperdicio_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return (
        DesperdicioController
        .listar()
    )


@desperdicio_bp.route(
    "/<int:desperdicio_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(
    desperdicio_id
):

    return (
        DesperdicioController
        .buscar(
            desperdicio_id
        )
    )


@desperdicio_bp.route(
    "",
    methods=["POST"]
)
@jwt_required()
def criar():

    return (
        DesperdicioController
        .criar()
    )


@desperdicio_bp.route(
    "/<int:desperdicio_id>",
    methods=["PUT"]
)
@jwt_required()
def atualizar(
    desperdicio_id
):

    return (
        DesperdicioController
        .atualizar(
            desperdicio_id
        )
    )


@desperdicio_bp.route(
    "/<int:desperdicio_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(
    desperdicio_id
):

    return (
        DesperdicioController
        .excluir(
            desperdicio_id
        )
    )