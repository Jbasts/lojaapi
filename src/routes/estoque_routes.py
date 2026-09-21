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


@estoque_bp.route(
    "/retiradas",
    methods=["GET"]
)
@jwt_required()
def listar_retiradas():

    return (
        EstoqueController
        .listar_retiradas()
    )


@estoque_bp.route(
    "/receitas",
    methods=["GET"]
)
@jwt_required()
def listar_receitas():

    return (
        EstoqueController
        .listar_receitas()
    )


@estoque_bp.route(
    "/receitas/<int:produto_id>",
    methods=["GET"]
)
@jwt_required()
def buscar_receita(
    produto_id
):

    return (
        EstoqueController
        .buscar_receita(
            produto_id
        )
    )


@estoque_bp.route(
    "/retirar-receita",
    methods=["POST"]
)
@jwt_required()
def retirar_por_receita():

    return (
        EstoqueController
        .retirar_por_receita()
    )