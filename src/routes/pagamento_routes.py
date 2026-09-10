from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from src.controller.pagamento_controller import (
    PagamentoController
)


pagamento_bp = Blueprint(
    "pagamentos",
    __name__
)


@pagamento_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def listar():

    return (
        PagamentoController.listar()
    )


@pagamento_bp.route(
    "/pedido/<int:pedido_id>/pagar",
    methods=["POST"]
)
@jwt_required()
def pagar(
    pedido_id
):

    return (
        PagamentoController.pagar(
            pedido_id
        )
    )


@pagamento_bp.route(
    "/<int:pagamento_id>/estornar",
    methods=["POST"]
)
@jwt_required()
def estornar(
    pagamento_id
):

    return (
        PagamentoController.estornar(
            pagamento_id
        )
    )