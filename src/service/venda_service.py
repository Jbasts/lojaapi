from datetime import date

from src.repositories.venda_repository import (
    VendaRepository
)


class VendaService:

    PERIODOS = (
        "DIARIO",
        "MENSAL",
        "ANUAL"
    )


    STATUS_PAGAMENTO = (
        "PAGO",
        "PENDENTE"
    )


    @staticmethod
    def _validar_periodo(
        periodo
    ):

        periodo = str(
            periodo or "DIARIO"
        ).upper()


        if periodo not in (
            VendaService.PERIODOS
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
    def listar(
        periodo,
        data_referencia,
        busca=None,
        status=None
    ):

        periodo = (
            VendaService
            ._validar_periodo(
                periodo
            )
        )


        data_referencia = (
            VendaService
            ._validar_data(
                data_referencia
            )
        )


        if status:

            status = (
                status.upper()
            )


            if status not in (
                VendaService
                .STATUS_PAGAMENTO
            ):

                raise ValueError(
                    "Status de pagamento inválido."
                )


        return (
            VendaRepository.listar(
                periodo=periodo,

                data_referencia=(
                    data_referencia
                ),

                busca=busca,

                status_pagamento=(
                    status
                )
            )
        )


    @staticmethod
    def resumo(
        periodo,
        data_referencia
    ):

        periodo = (
            VendaService
            ._validar_periodo(
                periodo
            )
        )


        data_referencia = (
            VendaService
            ._validar_data(
                data_referencia
            )
        )


        return (
            VendaRepository.resumo(
                periodo,
                data_referencia
            )
        )