from datetime import date
from decimal import Decimal, InvalidOperation

from src.repositories.compra_repository import (
    CompraRepository
)

from src.repositories.produto_estoque_repository import (
    ProdutoEstoqueRepository
)


class ValidadeNaoInformadaError(Exception):
    pass


class CompraEmUsoError(Exception):
    pass


class CompraService:

    @staticmethod
    def _decimal(valor, campo):

        try:
            return Decimal(
                str(valor).replace(",", ".")
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
    def listar(busca=None):

        return CompraRepository.listar(
            busca
        )


    @staticmethod
    def buscar(compra_id):

        compra = CompraRepository.buscar_por_id(
            compra_id
        )

        if not compra:
            raise ValueError(
                "Compra não encontrada."
            )

        return compra


    @staticmethod
    def _validar_itens(dados):

        itens_recebidos = (
            dados.get("itens")
            or []
        )

        if not itens_recebidos:
            raise ValueError(
                "Adicione pelo menos um item à compra."
            )


        confirmar_sem_validade = bool(
            dados.get(
                "confirmar_sem_validade",
                False
            )
        )

        possui_item_sem_validade = False

        itens = []


        for indice, item in enumerate(
            itens_recebidos,
            start=1
        ):

            produto_id = item.get(
                "produto_estoque_id"
            )

            if not produto_id:
                raise ValueError(
                    f"Produto do item {indice} "
                    "não informado."
                )


            produto = (
                ProdutoEstoqueRepository
                .buscar_por_id(produto_id)
            )

            if (
                not produto
                or not produto.ativo
            ):
                raise ValueError(
                    "Produto de estoque não registrado, "
                    "vá em produto_estoque e registre "
                    "o produto antes."
                )


            quantidade = (
                CompraService._decimal(
                    item.get("quantidade"),
                    f"Quantidade do item {indice}"
                )
            )

            if quantidade <= 0:
                raise ValueError(
                    f"Quantidade do item {indice} "
                    "deve ser maior que zero."
                )


            valor_unitario = (
                CompraService._decimal(
                    item.get("valor_unitario"),
                    f"Valor unitário do item {indice}"
                )
            )

            if valor_unitario < 0:
                raise ValueError(
                    f"Valor unitário do item {indice} "
                    "não pode ser negativo."
                )


            validade_recebida = item.get(
                "validade"
            )

            validade = None

            if validade_recebida:

                try:
                    validade = date.fromisoformat(
                        validade_recebida
                    )

                except ValueError:
                    raise ValueError(
                        f"Validade do item {indice} "
                        "é inválida."
                    )

            else:
                possui_item_sem_validade = True


            itens.append({
                "produto_estoque_id":
                    produto_id,

                "quantidade":
                    quantidade,

                "valor_unitario":
                    valor_unitario,

                "validade":
                    validade
            })


        if (
            possui_item_sem_validade
            and not confirmar_sem_validade
        ):
            raise ValidadeNaoInformadaError(
                "Produto sem validade, "
                "deseja prosseguir?"
            )


        return itens


    @staticmethod
    def criar(
        usuario_id,
        dados
    ):

        itens = CompraService._validar_itens(
            dados
        )

        compra_id = CompraRepository.criar(
            usuario_id=usuario_id,
            itens=itens
        )

        return CompraService.buscar(
            compra_id
        )


    @staticmethod
    def atualizar(
        compra_id,
        dados
    ):

        compra = CompraRepository.buscar_por_id(
            compra_id
        )

        if not compra:
            raise ValueError(
                "Compra não encontrada."
            )


        if not CompraRepository.pode_alterar(
            compra_id
        ):
            raise CompraEmUsoError(
                "Esta compra não pode mais ser editada "
                "porque algum produto deste lote já "
                "foi utilizado ou movimentado."
            )


        itens = CompraService._validar_itens(
            dados
        )

        CompraRepository.atualizar(
            compra_id,
            itens
        )

        return CompraService.buscar(
            compra_id
        )


    @staticmethod
    def excluir(compra_id):

        compra = CompraRepository.buscar_por_id(
            compra_id
        )

        if not compra:
            raise ValueError(
                "Compra não encontrada."
            )


        if not CompraRepository.pode_alterar(
            compra_id
        ):
            raise CompraEmUsoError(
                "Esta compra não pode ser excluída "
                "porque algum produto deste lote "
                "já foi utilizado ou movimentado."
            )


        CompraRepository.excluir(
            compra_id
        )