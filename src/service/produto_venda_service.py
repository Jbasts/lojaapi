from decimal import Decimal, InvalidOperation

from src.entities.produto_venda import ProdutoVenda

from src.repositories.produto_venda_repository import (
    ProdutoVendaRepository
)

from src.repositories.produto_estoque_repository import (
    ProdutoEstoqueRepository
)


class ProdutoVendaService:

    TIPOS_VALIDOS = (
        "PRODUCAO",
        "REVENDA"
    )


    @staticmethod
    def _texto_opcional(valor):

        if valor is None:
            return None

        valor = str(valor).strip()

        return valor if valor else None


    @staticmethod
    def _converter_preco(valor):

        try:

            preco = Decimal(
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
                "Preço de venda inválido."
            )

        if preco < 0:

            raise ValueError(
                "Preço de venda não pode ser negativo."
            )

        return preco


    @staticmethod
    def listar(busca=None):

        produtos = (
            ProdutoVendaRepository
            .listar(busca)
        )

        return [
            produto.to_dict()
            for produto in produtos
        ]


    @staticmethod
    def buscar_por_id(produto_id):

        produto = (
            ProdutoVendaRepository
            .buscar_por_id(produto_id)
        )

        if not produto or not produto.ativo:

            raise ValueError(
                "Produto de venda não encontrado."
            )

        return produto


    @staticmethod
    def criar(dados):

        nome = dados.get("nome")

        sabor = (
            ProdutoVendaService
            ._texto_opcional(
                dados.get("sabor")
            )
        )

        tipo = (
            ProdutoVendaService
            ._texto_opcional(
                dados.get("tipo")
            )
        )

        preco_venda = (
            ProdutoVendaService
            ._converter_preco(
                dados.get("preco_venda")
            )
        )


        if not nome or not nome.strip():

            raise ValueError(
                "Nome é obrigatório."
            )


        if not tipo:

            raise ValueError(
                "Tipo é obrigatório."
            )


        tipo = tipo.upper()


        if tipo not in (
            ProdutoVendaService
            .TIPOS_VALIDOS
        ):

            raise ValueError(
                "Tipo deve ser PRODUCAO ou REVENDA."
            )


        existente = (
            ProdutoVendaRepository
            .buscar_por_nome_sabor(
                nome.strip(),
                sabor
            )
        )

        if existente:

            raise ValueError(
                "Já existe um produto ativo "
                "com esse nome e sabor."
            )


        produto_estoque_id = (
            dados.get(
                "produto_estoque_id"
            )
        )


        if tipo == "REVENDA":

            if not produto_estoque_id:

                raise ValueError(
                    "Produto de revenda deve "
                    "estar relacionado a um "
                    "produto de estoque."
                )

            produto_estoque = (
                ProdutoEstoqueRepository
                .buscar_por_id(
                    produto_estoque_id
                )
            )

            if (
                not produto_estoque
                or not produto_estoque.ativo
            ):

                raise ValueError(
                    "Produto de estoque "
                    "não encontrado."
                )

        else:

            # Produto fabricado não precisa
            # apontar diretamente para um item
            # de estoque.
            produto_estoque_id = None


        produto = ProdutoVenda(
            produto_estoque_id=(
                produto_estoque_id
            ),

            nome=nome.strip(),

            sabor=sabor,

            tipo=tipo,

            unidade="UN",

            preco_venda=preco_venda
        )


        return (
            ProdutoVendaRepository
            .criar(produto)
        )


    @staticmethod
    def atualizar(
        produto_id,
        dados
    ):

        produto_atual = (
            ProdutoVendaRepository
            .buscar_por_id(
                produto_id
            )
        )

        if not produto_atual:

            raise ValueError(
                "Produto de venda não encontrado."
            )


        nome = dados.get("nome")

        sabor = (
            ProdutoVendaService
            ._texto_opcional(
                dados.get("sabor")
            )
        )

        tipo = (
            ProdutoVendaService
            ._texto_opcional(
                dados.get("tipo")
            )
        )

        preco_venda = (
            ProdutoVendaService
            ._converter_preco(
                dados.get("preco_venda")
            )
        )


        if not nome or not nome.strip():

            raise ValueError(
                "Nome é obrigatório."
            )


        if not tipo:

            raise ValueError(
                "Tipo é obrigatório."
            )


        tipo = tipo.upper()


        if tipo not in (
            ProdutoVendaService
            .TIPOS_VALIDOS
        ):

            raise ValueError(
                "Tipo deve ser PRODUCAO ou REVENDA."
            )


        existente = (
            ProdutoVendaRepository
            .buscar_por_nome_sabor(
                nome.strip(),
                sabor
            )
        )


        if (
            existente
            and existente.id != produto_id
        ):

            raise ValueError(
                "Já existe outro produto "
                "com esse nome e sabor."
            )


        produto_estoque_id = (
            dados.get(
                "produto_estoque_id"
            )
        )


        if tipo == "REVENDA":

            if not produto_estoque_id:

                raise ValueError(
                    "Produto de revenda deve "
                    "estar relacionado a um "
                    "produto de estoque."
                )


            produto_estoque = (
                ProdutoEstoqueRepository
                .buscar_por_id(
                    produto_estoque_id
                )
            )


            if (
                not produto_estoque
                or not produto_estoque.ativo
            ):

                raise ValueError(
                    "Produto de estoque "
                    "não encontrado."
                )

        else:

            produto_estoque_id = None


        produto = ProdutoVenda(
            id=produto_id,

            produto_estoque_id=(
                produto_estoque_id
            ),

            nome=nome.strip(),

            sabor=sabor,

            tipo=tipo,

            preco_venda=preco_venda
        )


        return (
            ProdutoVendaRepository
            .atualizar(produto)
        )


    @staticmethod
    def excluir(produto_id):

        produto = (
            ProdutoVendaRepository
            .buscar_por_id(
                produto_id
            )
        )

        if not produto:

            raise ValueError(
                "Produto de venda não encontrado."
            )

        ProdutoVendaRepository.desativar(
            produto_id
        )