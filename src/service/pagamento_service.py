from src.repositories.pagamento_repository import (
    PagamentoRepository
)


class PagamentoService:

    FORMAS = (
        "DINHEIRO",
        "PIX",
        "CARTAO_CREDITO",
        "CARTAO_DEBITO",
        "TRANSFERENCIA",
        "OUTRO"
    )


    @staticmethod
    def listar(
        busca=None,
        status=None
    ):

        if status:

            status = (
                status.upper()
            )


            if status not in (
                "PAGO",
                "PENDENTE"
            ):

                raise ValueError(
                    "Status de pagamento inválido."
                )


        return (
            PagamentoRepository.listar(
                busca=busca,
                status_pagamento=status
            )
        )


    @staticmethod
    def pagar(
        pedido_id,
        usuario_id,
        dados
    ):

        forma = str(
            dados.get(
                "forma",
                ""
            )
        ).upper().strip()


        if (
            forma
            not in PagamentoService.FORMAS
        ):

            raise ValueError(
                "Forma de pagamento inválida."
            )


        pedido = (
            PagamentoRepository
            .calcular_valor_pedido(
                pedido_id
            )
        )


        if not pedido:

            raise ValueError(
                "Pedido não encontrado."
            )


        if (
            pedido["status"]
            == "CANCELADO"
        ):

            raise ValueError(
                "Pedido cancelado não "
                "pode ser pago."
            )


        valor = (
            pedido[
                "valor_total"
            ]
        )


        if valor < 0:

            raise ValueError(
                "Valor do pedido inválido."
            )


        existente = (
            PagamentoRepository
            .buscar_pagamento_ativo(
                pedido_id
            )
        )


        if existente:

            raise ValueError(
                "Este pedido já está pago."
            )


        observacao = str(
            dados.get(
                "observacao",
                ""
            )
        ).strip()


        pagamento_id = (
            PagamentoRepository
            .registrar(
                pedido_id=pedido_id,

                usuario_id=usuario_id,

                forma=forma,

                valor=valor,

                observacao=(
                    observacao
                    or None
                )
            )
        )


        return (
            PagamentoRepository
            .buscar_por_id(
                pagamento_id
            )
        )


    @staticmethod
    def estornar(
        pagamento_id,
        usuario_id
    ):

        pagamento = (
            PagamentoRepository
            .buscar_por_id(
                pagamento_id
            )
        )


        if not pagamento:

            raise ValueError(
                "Pagamento não encontrado."
            )


        if (
            pagamento.status
            != "PAGO"
        ):

            raise ValueError(
                "Pagamento já foi estornado."
            )


        PagamentoRepository.estornar(
            pagamento_id,
            usuario_id
        )