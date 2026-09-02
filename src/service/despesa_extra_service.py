from decimal import (
    Decimal,
    InvalidOperation
)

from src.entities.despesa_extra import (
    DespesaExtra
)

from src.repositories.despesa_extra_repository import (
    DespesaExtraRepository
)


class DespesaDuplicadaError(Exception):

    pass


class DespesaExtraService:

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
            TypeError,
            ValueError
        ):

            raise ValueError(
                f"{campo} inválido."
            )


    @staticmethod
    def listar(busca=None):

        despesas = (
            DespesaExtraRepository
            .listar(busca)
        )

        return [
            despesa.to_dict()
            for despesa in despesas
        ]


    @staticmethod
    def buscar_por_id(despesa_id):

        despesa = (
            DespesaExtraRepository
            .buscar_por_id(
                despesa_id
            )
        )

        if not despesa:

            raise ValueError(
                "Despesa não encontrada."
            )

        return despesa


    @staticmethod
    def criar(dados):

        nome = str(
            dados.get(
                "nome",
                ""
            )
        ).strip()


        if not nome:

            raise ValueError(
                "Nome é obrigatório."
            )


        quantidade = (
            DespesaExtraService
            ._decimal(
                dados.get(
                    "quantidade",
                    1
                ),
                "Quantidade"
            )
        )


        if quantidade <= 0:

            raise ValueError(
                "Quantidade deve ser "
                "maior que zero."
            )


        valor_unitario = (
            DespesaExtraService
            ._decimal(
                dados.get(
                    "valor_unitario"
                ),
                "Valor"
            )
        )


        if valor_unitario < 0:

            raise ValueError(
                "Valor não pode "
                "ser negativo."
            )


        confirmar_duplicada = bool(
            dados.get(
                "confirmar_duplicada",
                False
            )
        )


        existente = (
            DespesaExtraRepository
            .buscar_por_nome(nome)
        )


        if (
            existente
            and not confirmar_duplicada
        ):

            raise DespesaDuplicadaError(
                f'Já existe uma despesa '
                f'chamada "{nome}". '
                f'Deseja continuar?'
            )


        despesa = DespesaExtra(
            nome=nome,

            quantidade=quantidade,

            valor_unitario=valor_unitario,

            categoria=None,

            observacao=None
        )


        return (
            DespesaExtraRepository
            .criar(despesa)
        )


    @staticmethod
    def atualizar(
        despesa_id,
        dados
    ):

        despesa_atual = (
            DespesaExtraRepository
            .buscar_por_id(
                despesa_id
            )
        )


        if not despesa_atual:

            raise ValueError(
                "Despesa não encontrada."
            )


        nome = str(
            dados.get(
                "nome",
                ""
            )
        ).strip()


        if not nome:

            raise ValueError(
                "Nome é obrigatório."
            )


        quantidade = (
            DespesaExtraService
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


        valor_unitario = (
            DespesaExtraService
            ._decimal(
                dados.get(
                    "valor_unitario"
                ),
                "Valor"
            )
        )


        if valor_unitario < 0:

            raise ValueError(
                "Valor não pode "
                "ser negativo."
            )


        confirmar_duplicada = bool(
            dados.get(
                "confirmar_duplicada",
                False
            )
        )


        existente = (
            DespesaExtraRepository
            .buscar_por_nome(
                nome,
                ignorar_id=despesa_id
            )
        )


        if (
            existente
            and not confirmar_duplicada
        ):

            raise DespesaDuplicadaError(
                f'Já existe uma despesa '
                f'chamada "{nome}". '
                f'Deseja continuar?'
            )


        despesa = DespesaExtra(
            id=despesa_id,

            nome=nome,

            quantidade=quantidade,

            valor_unitario=valor_unitario,

            categoria=(
                despesa_atual.categoria
            ),

            observacao=(
                despesa_atual.observacao
            )
        )


        return (
            DespesaExtraRepository
            .atualizar(despesa)
        )


    @staticmethod
    def excluir(despesa_id):

        despesa = (
            DespesaExtraRepository
            .buscar_por_id(
                despesa_id
            )
        )


        if not despesa:

            raise ValueError(
                "Despesa não encontrada."
            )


        return (
            DespesaExtraRepository
            .excluir(despesa_id)
        )