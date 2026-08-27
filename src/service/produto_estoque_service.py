import re

from src.entities.produto_estoque import ProdutoEstoque
from src.repositories.produto_estoque_repository import (
    ProdutoEstoqueRepository
)


class ProdutoEstoqueService:

    @staticmethod
    def _limpar_codigo(codigo):

        if not codigo:
            return None

        return re.sub(
            r"\D",
            "",
            str(codigo)
        )


    @staticmethod
    def listar(busca=None):

        produtos = ProdutoEstoqueRepository.listar(
            busca
        )

        return [
            produto.to_dict()
            for produto in produtos
        ]


    @staticmethod
    def buscar_por_id(produto_id):

        produto = (
            ProdutoEstoqueRepository
            .buscar_por_id(produto_id)
        )

        if not produto or not produto.ativo:

            raise ValueError(
                "Produto de estoque não encontrado."
            )

        return produto


    @staticmethod
    def buscar_por_codigo(codigo_barras):

        codigo_barras = (
            ProdutoEstoqueService
            ._limpar_codigo(codigo_barras)
        )

        produto = (
            ProdutoEstoqueRepository
            .buscar_por_codigo(codigo_barras)
        )

        if not produto or not produto.ativo:

            raise ValueError(
                "Produto de estoque não registrado."
            )

        return produto


    @staticmethod
    def criar(dados):

        nome = dados.get("nome")

        codigo_barras = (
            ProdutoEstoqueService
            ._limpar_codigo(
                dados.get("codigo_barras")
            )
        )

        if not nome or not nome.strip():

            raise ValueError(
                "Nome é obrigatório."
            )

        if not codigo_barras:

            raise ValueError(
                "Código de barras é obrigatório."
            )

        existente = (
            ProdutoEstoqueRepository
            .buscar_por_codigo(codigo_barras)
        )

        if existente:

            raise ValueError(
                "Já existe um produto com esse código de barras."
            )

        produto = ProdutoEstoque(
            nome=nome.strip(),
            codigo_barras=codigo_barras,

            # Valores padrão.
            unidade="UN",
            controla_validade=True,
            estoque_minimo=0
        )

        return ProdutoEstoqueRepository.criar(
            produto
        )


    @staticmethod
    def atualizar(produto_id, dados):

        produto_atual = (
            ProdutoEstoqueRepository
            .buscar_por_id(produto_id)
        )

        if not produto_atual:

            raise ValueError(
                "Produto de estoque não encontrado."
            )

        nome = dados.get("nome")

        codigo_barras = (
            ProdutoEstoqueService
            ._limpar_codigo(
                dados.get("codigo_barras")
            )
        )

        if not nome or not nome.strip():

            raise ValueError(
                "Nome é obrigatório."
            )

        if not codigo_barras:

            raise ValueError(
                "Código de barras é obrigatório."
            )

        produto_codigo = (
            ProdutoEstoqueRepository
            .buscar_por_codigo(codigo_barras)
        )

        if (
            produto_codigo
            and produto_codigo.id != produto_id
        ):

            raise ValueError(
                "Já existe outro produto com esse código de barras."
            )

        produto = ProdutoEstoque(
            id=produto_id,
            nome=nome.strip(),
            codigo_barras=codigo_barras
        )

        return ProdutoEstoqueRepository.atualizar(
            produto
        )


    @staticmethod
    def excluir(produto_id):

        produto = (
            ProdutoEstoqueRepository
            .buscar_por_id(produto_id)
        )

        if not produto:

            raise ValueError(
                "Produto de estoque não encontrado."
            )

        ProdutoEstoqueRepository.desativar(
            produto_id
        )