

from datetime import (
    date,
    timedelta
)

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
        "PROXIMOS_VALIDADE",
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

    @staticmethod
    def listar_retiradas(
        periodo="DIARIO",
        referencia=None
    ):

        periodo = str(
            periodo
            or "DIARIO"
        ).upper().strip()


        if periodo not in (
            "DIARIO",
            "MENSAL",
            "ANUAL"
        ):

            raise ValueError(
                "Período de retiradas inválido."
            )


        referencia = str(
            referencia
            or ""
        ).strip()


        try:

            if periodo == "DIARIO":

                data_inicio = (
                    date.fromisoformat(
                        referencia
                    )
                    if referencia
                    else date.today()
                )

                data_fim = (
                    data_inicio
                    + timedelta(days=1)
                )


            elif periodo == "MENSAL":

                if referencia:

                    partes = (
                        referencia.split("-")
                    )

                    if len(partes) < 2:

                        raise ValueError

                    ano = int(
                        partes[0]
                    )

                    mes = int(
                        partes[1]
                    )

                else:

                    hoje = date.today()

                    ano = hoje.year
                    mes = hoje.month


                data_inicio = date(
                    ano,
                    mes,
                    1
                )


                if mes == 12:

                    data_fim = date(
                        ano + 1,
                        1,
                        1
                    )

                else:

                    data_fim = date(
                        ano,
                        mes + 1,
                        1
                    )


            else:

                if referencia:

                    ano = int(
                        referencia[:4]
                    )

                else:

                    ano = (
                        date.today().year
                    )


                data_inicio = date(
                    ano,
                    1,
                    1
                )

                data_fim = date(
                    ano + 1,
                    1,
                    1
                )


        except (
            ValueError,
            TypeError
        ):

            raise ValueError(
                "Data de referência inválida."
            )


        return (
            EstoqueRepository
            .listar_retiradas(
                data_inicio=(
                    data_inicio
                ),
                data_fim=(
                    data_fim
                )
            )
        )



    @staticmethod
    def listar_receitas():

        return (
            EstoqueRepository
            .listar_receitas()
        )


    @staticmethod
    def buscar_receita(
        produto_venda_id
    ):

        receita = (
            EstoqueRepository
            .buscar_receita(
                produto_venda_id
            )
        )

        if not receita:

            raise ValueError(
                "Produto não possui "
                "receita ativa."
            )


        if (
            not receita["itens"]
        ):

            raise ValueError(
                "A receita não possui "
                "ingredientes cadastrados."
            )


        return receita


    @staticmethod
    def retirar_por_receita(
        usuario_id,
        dados
    ):

        produto_venda_id = dados.get(
            "produto_venda_id"
        )


        if not produto_venda_id:

            raise ValueError(
                "Selecione a receita."
            )


        quantidade_produzir = (
            EstoqueService._decimal(
                dados.get(
                    "quantidade_produzir"
                ),
                "Quantidade a produzir"
            )
        )


        if quantidade_produzir <= 0:

            raise ValueError(
                "Quantidade a produzir deve "
                "ser maior que zero."
            )


        lotes_selecionados = (
            dados.get(
                "lotes_selecionados"
            )
            or []
        )


        if not isinstance(
            lotes_selecionados,
            list
        ):

            raise ValueError(
                "Seleção de lotes inválida."
            )


        observacao = str(
            dados.get(
                "observacao",
                ""
            )
        ).strip()


        return (
            EstoqueRepository
            .retirar_por_receita(
                produto_venda_id=(
                    produto_venda_id
                ),
                quantidade_produzir=(
                    quantidade_produzir
                ),
                usuario_id=(
                    usuario_id
                ),
                lotes_selecionados=(
                    lotes_selecionados
                ),
                observacao=(
                    observacao
                    or None
                )
            )
        )
