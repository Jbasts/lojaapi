from datetime import date

from src.repositories.relatorio_repository import (
    RelatorioRepository
)


class RelatorioService:

    PERIODOS = (
        "DIARIO",
        "MENSAL",
        "ANUAL"
    )


    @staticmethod
    def _validar_periodo(
        periodo
    ):

        periodo = str(
            periodo or "DIARIO"
        ).upper()


        if periodo not in (
            RelatorioService.PERIODOS
        ):

            raise ValueError(
                "Período inválido."
            )


        return periodo


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
                "Data de referência inválida."
            )


    @staticmethod
    def gerar(
        periodo,
        data_referencia
    ):

        periodo = (
            RelatorioService
            ._validar_periodo(
                periodo
            )
        )


        data_referencia = (
            RelatorioService
            ._validar_data(
                data_referencia
            )
        )


        relatorio = (
            RelatorioRepository
            .gerar(
                periodo,
                data_referencia
            )
        )


        relatorio[
            "periodo"
        ] = periodo


        relatorio[
            "data_referencia"
        ] = (
            data_referencia
            .isoformat()
        )


        return relatorio