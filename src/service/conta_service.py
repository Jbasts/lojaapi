from datetime import date

from src.repositories.conta_repository import (
    ContaRepository
)


class ContaService:

    PERIODOS = (
        "DIARIO",
        "MENSAL",
        "ANUAL"
    )


    TIPOS = (
        "ENTRADA",
        "SAIDA"
    )


    CATEGORIAS = (
        "PAGAMENTO",
        "COMPRA",
        "DESPESA_EXTRA"
    )


    # ==============================
    # VALIDAR PERÍODO
    # ==============================

    @staticmethod
    def _validar_periodo(
        periodo
    ):

        periodo = str(
            periodo or "DIARIO"
        ).upper()


        if periodo not in (
            ContaService.PERIODOS
        ):

            raise ValueError(
                "Período inválido."
            )


        return periodo


    # ==============================
    # VALIDAR DATA
    # ==============================

    @staticmethod
    def _validar_data(
        data_referencia
    ):

        if not data_referencia:

            return date.today()


        try:

            return date.fromisoformat(
                data_referencia
            )


        except ValueError:

            raise ValueError(
                "Data inválida."
            )


    # ==============================
    # LISTAR MOVIMENTOS
    # ==============================

    @staticmethod
    def listar(
        periodo,
        data_referencia,
        busca=None,
        tipo=None,
        categoria=None
    ):

        periodo = (
            ContaService
            ._validar_periodo(
                periodo
            )
        )


        data_referencia = (
            ContaService
            ._validar_data(
                data_referencia
            )
        )


        if tipo:

            tipo = (
                tipo.upper()
            )


            if tipo not in (
                ContaService.TIPOS
            ):

                raise ValueError(
                    "Tipo inválido."
                )


        if categoria:

            categoria = (
                categoria.upper()
            )


            if categoria not in (
                ContaService.CATEGORIAS
            ):

                raise ValueError(
                    "Categoria inválida."
                )


        movimentos = (
            ContaRepository.listar(
                periodo=periodo,

                data_referencia=(
                    data_referencia
                ),

                busca=busca,

                tipo=tipo,

                categoria=(
                    categoria
                )
            )
        )


        return [
            movimento.to_dict()
            for movimento in movimentos
        ]


    # ==============================
    # RESUMO
    # ==============================

    @staticmethod
    def resumo(
        periodo,
        data_referencia
    ):

        periodo = (
            ContaService
            ._validar_periodo(
                periodo
            )
        )


        data_referencia = (
            ContaService
            ._validar_data(
                data_referencia
            )
        )


        return (
            ContaRepository.resumo(
                periodo,
                data_referencia
            )
        )


    # ==============================
    # DETALHES DA COMPRA
    # ==============================

    @staticmethod
    def buscar_compra(
        compra_id
    ):

        if not compra_id:

            raise ValueError(
                "Compra inválida."
            )


        compra = (
            ContaRepository
            .buscar_compra_detalhes(
                compra_id
            )
        )


        if not compra:

            raise ValueError(
                "Compra não encontrada."
            )


        return compra