from datetime import date

from decimal import (
    Decimal,
    InvalidOperation
)

from src.repositories.desperdicio_repository import (
    DesperdicioRepository
)


class DesperdicioService:

    MOTIVOS = (
        "VENCIMENTO",
        "PRODUTO_DANIFICADO",
        "PRODUCAO_INCORRETA",
        "QUEDA",
        "QUEBRA",
        "OUTRO"
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
    def _validar(
        dados
    ):

        lote_id = (
            dados.get("lote_id")
        )

        if not lote_id:

            raise ValueError(
                "Selecione o lote."
            )


        quantidade = (
            DesperdicioService
            ._decimal(
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


        motivo = str(
            dados.get(
                "motivo",
                ""
            )
        ).upper().strip()


        if motivo not in (
            DesperdicioService
            .MOTIVOS
        ):

            raise ValueError(
                "Motivo do desperdício inválido."
            )


        observacao = str(
            dados.get(
                "observacao",
                ""
            )
        ).strip()


        return {
            "lote_id":
                int(lote_id),

            "quantidade":
                quantidade,

            "motivo":
                motivo,

            "observacao":
                observacao or None
        }


    @staticmethod
    def _intervalo_periodo(
        periodo,
        referencia
    ):

        periodo = str(
            periodo
            or "TOTAL"
        ).upper().strip()


        if periodo not in (
            "TOTAL",
            "MENSAL",
            "ANUAL"
        ):

            raise ValueError(
                "Período inválido."
            )


        if periodo == "TOTAL":

            return (
                None,
                None
            )


        referencia = str(
            referencia
            or ""
        ).strip()


        try:

            if periodo == "MENSAL":

                if referencia:

                    partes = (
                        referencia.split("-")
                    )

                    if len(partes) != 2:

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


                return (
                    data_inicio,
                    data_fim
                )


            if referencia:

                ano = int(
                    referencia[:4]
                )

            else:

                ano = (
                    date.today().year
                )


            return (
                date(
                    ano,
                    1,
                    1
                ),

                date(
                    ano + 1,
                    1,
                    1
                )
            )

        except (
            ValueError,
            TypeError
        ):

            raise ValueError(
                "Referência de período inválida."
            )


    @staticmethod
    def listar(
        busca=None,
        motivo=None,
        periodo="TOTAL",
        referencia=None
    ):

        if motivo:

            motivo = motivo.upper()

            if motivo not in (
                DesperdicioService
                .MOTIVOS
            ):

                raise ValueError(
                    "Motivo inválido."
                )


        (
            data_inicio,
            data_fim
        ) = (
            DesperdicioService
            ._intervalo_periodo(
                periodo,
                referencia
            )
        )


        registros = (
            DesperdicioRepository
            .listar(
                busca=busca,
                motivo=motivo,
                data_inicio=(
                    data_inicio
                ),
                data_fim=(
                    data_fim
                )
            )
        )

        return [
            registro.to_dict()
            for registro in registros
        ]


    @staticmethod
    def buscar(
        desperdicio_id
    ):

        desperdicio = (
            DesperdicioRepository
            .buscar_por_id(
                desperdicio_id
            )
        )


        if (
            not desperdicio
            or not desperdicio.ativo
        ):

            raise ValueError(
                "Desperdício não encontrado."
            )


        return desperdicio


    @staticmethod
    def criar(
        usuario_id,
        dados
    ):

        dados_validos = (
            DesperdicioService
            ._validar(dados)
        )


        desperdicio_id = (
            DesperdicioRepository
            .criar(
                lote_id=(
                    dados_validos[
                        "lote_id"
                    ]
                ),

                quantidade=(
                    dados_validos[
                        "quantidade"
                    ]
                ),

                motivo=(
                    dados_validos[
                        "motivo"
                    ]
                ),

                observacao=(
                    dados_validos[
                        "observacao"
                    ]
                ),

                usuario_id=(
                    usuario_id
                )
            )
        )


        return (
            DesperdicioService
            .buscar(
                desperdicio_id
            )
        )


    @staticmethod
    def atualizar(
        desperdicio_id,
        usuario_id,
        dados
    ):

        atual = (
            DesperdicioRepository
            .buscar_por_id(
                desperdicio_id
            )
        )


        if (
            not atual
            or not atual.ativo
        ):

            raise ValueError(
                "Desperdício não encontrado."
            )


        dados_validos = (
            DesperdicioService
            ._validar(dados)
        )


        DesperdicioRepository.atualizar(
            desperdicio_id=(
                desperdicio_id
            ),

            novo_lote_id=(
                dados_validos[
                    "lote_id"
                ]
            ),

            nova_quantidade=(
                dados_validos[
                    "quantidade"
                ]
            ),

            motivo=(
                dados_validos[
                    "motivo"
                ]
            ),

            observacao=(
                dados_validos[
                    "observacao"
                ]
            ),

            usuario_id=(
                usuario_id
            )
        )


        return (
            DesperdicioService
            .buscar(
                desperdicio_id
            )
        )


    @staticmethod
    def excluir(
        desperdicio_id,
        usuario_id
    ):

        desperdicio = (
            DesperdicioRepository
            .buscar_por_id(
                desperdicio_id
            )
        )


        if (
            not desperdicio
            or not desperdicio.ativo
        ):

            raise ValueError(
                "Desperdício não encontrado."
            )


        DesperdicioRepository.excluir(
            desperdicio_id,
            usuario_id
        )
