from decimal import (
    Decimal,
    InvalidOperation
)

from src.repositories.estoque_repository import (
    EstoqueRepository
)

from src.repositories.produto_estoque_repository import (
    ProdutoEstoqueRepository
)


class EstoqueService:

    STATUS_VALIDOS = (
        "VALIDO",
        "VENCIDO",
        "SEM_VALIDADE"
    )


    @staticmethod
    def _decimal(
        valor,
        campo
    ):

        try:

            return Decimal(
                str(valor).replace(
                    ",",
                    "."
                )
            )

        except (
            InvalidOperation,
            ValueError,
            TypeError
        ):

            raise ValueError(
                f"{campo} inválido."
            )


    @staticmethod
    def listar(
        busca=None,
        status=None
    ):

        if status:

            status = status.upper()

            if status not in (
                EstoqueService
                .STATUS_VALIDOS
            ):

                raise ValueError(
                    "Filtro de status inválido."
                )


        return EstoqueRepository.listar(
            busca=busca,
            status=status
        )


    @staticmethod
    def resumo():

        return (
            EstoqueRepository.resumo()
        )


    @staticmethod
    def buscar_por_codigo(
        codigo
    ):

        if not codigo:

            raise ValueError(
                "Código de barras é obrigatório."
            )


        produto = (
            ProdutoEstoqueRepository
            .buscar_por_codigo(
                str(codigo).strip()
            )
        )


        if (
            not produto
            or not produto.ativo
        ):

            raise ValueError(
                "Produto de estoque não registrado."
            )


        lotes = (
            EstoqueRepository
            .listar_lotes_produto(
                produto.id
            )
        )


        return {
            "produto":
                produto.to_dict(),

            "lotes":
                lotes
        }


    @staticmethod
    def retirar_para_uso(
        usuario_id,
        dados
    ):

        lote_id = dados.get(
            "lote_id"
        )


        if not lote_id:

            raise ValueError(
                "Selecione o lote."
            )


        quantidade = (
            EstoqueService._decimal(
                dados.get(
                    "quantidade"
                ),
                "Quantidade"
            )
        )


        if quantidade <= 0:

            raise ValueError(
                "Quantidade deve ser "
                "maior que zero."
            )


        observacao = str(
            dados.get(
                "observacao",
                ""
            )
        ).strip()


        if not observacao:

            observacao = (
                "Retirada para uso"
            )


        return (
            EstoqueRepository
            .retirar_para_uso(
                lote_id=lote_id,
                quantidade=quantidade,
                usuario_id=usuario_id,
                observacao=observacao
            )
        )