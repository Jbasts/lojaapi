from decimal import (
    Decimal,
    InvalidOperation
)

from src.repositories.custo_produto_repository import (
    CustoProdutoRepository
)

from src.repositories.produto_estoque_repository import (
    ProdutoEstoqueRepository
)


class CustoProdutoService:

    UNIDADES = (
        "UN",
        "KG",
        "G",
        "L",
        "ML",
        "CX",
        "PCT"
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
            TypeError,
            ValueError
        ):

            raise ValueError(
                f"{campo} inválido."
            )


    @staticmethod
    def _calcular_resumo(
        preco_venda,
        rendimento,
        itens
    ):

        preco_venda = Decimal(
            str(preco_venda or 0)
        )

        custo_total = Decimal("0")


        for item in itens:

            quantidade = Decimal(
                str(item.quantidade)
            )

            valor_unitario = Decimal(
                str(
                    item.valor_unitario_manual
                    or 0
                )
            )

            custo_total += (
                quantidade
                * valor_unitario
            )


        if (
            not itens
            or rendimento is None
            or Decimal(
                str(rendimento)
            ) <= 0
        ):

            return {
                "custo_total": 0,
                "custo_unitario": None,
                "preco_venda": float(
                    preco_venda
                ),
                "lucro_unitario": None,
                "margem_percentual": None
            }


        rendimento = Decimal(
            str(rendimento)
        )


        custo_unitario = (
            custo_total
            / rendimento
        )


        lucro_unitario = (
            preco_venda
            - custo_unitario
        )


        if preco_venda > 0:

            margem = (
                lucro_unitario
                / preco_venda
            ) * Decimal("100")

        else:

            margem = Decimal("0")


        return {
            "custo_total":
                round(
                    float(custo_total),
                    4
                ),

            "custo_unitario":
                round(
                    float(custo_unitario),
                    4
                ),

            "preco_venda":
                round(
                    float(preco_venda),
                    2
                ),

            "lucro_unitario":
                round(
                    float(lucro_unitario),
                    4
                ),

            "margem_percentual":
                round(
                    float(margem),
                    2
                )
        }


    @staticmethod
    def listar():

        registros = (
            CustoProdutoRepository
            .listar_produtos()
        )

        resultado = []


        for registro in registros:

            ficha_id = registro["ficha_id"]

            custo_total = None
            custo_unitario = None
            lucro_unitario = None
            margem = None


            if ficha_id:

                itens = (
                    CustoProdutoRepository
                    .listar_itens(ficha_id)
                )

                resumo = (
                    CustoProdutoService
                    ._calcular_resumo(
                        registro[
                            "preco_venda"
                        ],
                        registro[
                            "rendimento"
                        ],
                        itens
                    )
                )

                custo_total = (
                    resumo["custo_total"]
                )

                custo_unitario = (
                    resumo["custo_unitario"]
                )

                lucro_unitario = (
                    resumo["lucro_unitario"]
                )

                margem = (
                    resumo[
                        "margem_percentual"
                    ]
                )


            resultado.append({
                "produto_id":
                    registro["id"],

                "nome":
                    registro["nome"],

                "sabor":
                    registro["sabor"],

                "tipo":
                    registro["tipo"],

                "preco_venda":
                    float(
                        registro[
                            "preco_venda"
                        ]
                    ),

                "possui_ficha":
                    bool(ficha_id),

                "custo_total":
                    custo_total,

                "custo_unitario":
                    custo_unitario,

                "lucro_unitario":
                    lucro_unitario,

                "margem_percentual":
                    margem
            })


        return resultado


    @staticmethod
    def buscar(produto_id):

        produto = (
            CustoProdutoRepository
            .buscar_produto(produto_id)
        )


        if (
            not produto
            or not produto["ativo"]
        ):

            raise ValueError(
                "Produto de venda "
                "não encontrado."
            )


        ficha = (
            CustoProdutoRepository
            .buscar_ficha(produto_id)
        )


        itens = []


        if ficha:

            itens = (
                CustoProdutoRepository
                .listar_itens(
                    ficha.id
                )
            )


        resumo = (
            CustoProdutoService
            ._calcular_resumo(
                produto["preco_venda"],

                (
                    ficha.rendimento
                    if ficha
                    else None
                ),

                itens
            )
        )


        return {
            "produto": {
                "id":
                    produto["id"],

                "nome":
                    produto["nome"],

                "sabor":
                    produto["sabor"],

                "tipo":
                    produto["tipo"],

                "preco_venda":
                    float(
                        produto[
                            "preco_venda"
                        ]
                    )
            },

            "ficha": (
                ficha.to_dict()
                if ficha
                else None
            ),

            "itens": [
                item.to_dict()
                for item in itens
            ],

            "resumo":
                resumo
        }


    @staticmethod
    def salvar(
        produto_id,
        dados
    ):

        produto = (
            CustoProdutoRepository
            .buscar_produto(produto_id)
        )


        if (
            not produto
            or not produto["ativo"]
        ):

            raise ValueError(
                "Produto de venda "
                "não encontrado."
            )


        rendimento = (
            CustoProdutoService
            ._decimal(
                dados.get("rendimento"),
                "Rendimento"
            )
        )


        if rendimento <= 0:

            raise ValueError(
                "Rendimento deve ser "
                "maior que zero."
            )


        itens_recebidos = (
            dados.get("itens")
            or []
        )


        if not itens_recebidos:

            raise ValueError(
                "Adicione pelo menos "
                "um item de custo."
            )


        itens = []


        for indice, item in enumerate(
            itens_recebidos,
            start=1
        ):

            tipo = str(
                item.get(
                    "tipo",
                    ""
                )
            ).upper()


            if tipo not in (
                "ESTOQUE",
                "MANUAL"
            ):

                raise ValueError(
                    f"Tipo do item {indice} "
                    "é inválido."
                )


            quantidade = (
                CustoProdutoService
                ._decimal(
                    item.get(
                        "quantidade"
                    ),
                    f"Quantidade do item {indice}"
                )
            )


            if quantidade <= 0:

                raise ValueError(
                    f"Quantidade do item "
                    f"{indice} deve ser "
                    "maior que zero."
                )


            valor_unitario = (
                CustoProdutoService
                ._decimal(
                    item.get(
                        "valor_unitario"
                    ),
                    f"Valor do item {indice}"
                )
            )


            if valor_unitario < 0:

                raise ValueError(
                    f"Valor do item "
                    f"{indice} não pode "
                    "ser negativo."
                )


            unidade = str(
                item.get(
                    "unidade",
                    "UN"
                )
            ).upper()


            if unidade not in (
                CustoProdutoService
                .UNIDADES
            ):

                raise ValueError(
                    f"Unidade do item "
                    f"{indice} inválida."
                )


            produto_estoque_id = None
            descricao = None


            if tipo == "ESTOQUE":

                produto_estoque_id = (
                    item.get(
                        "produto_estoque_id"
                    )
                )


                if not produto_estoque_id:

                    raise ValueError(
                        f"Selecione o produto "
                        f"de estoque do item "
                        f"{indice}."
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
                        f"Produto de estoque "
                        f"do item {indice} "
                        "não encontrado."
                    )


            else:

                descricao = str(
                    item.get(
                        "descricao",
                        ""
                    )
                ).strip()


                if not descricao:

                    raise ValueError(
                        f"Descrição do item "
                        f"{indice} é obrigatória."
                    )


            itens.append({
                "produto_estoque_id":
                    produto_estoque_id,

                "descricao":
                    descricao,

                "quantidade":
                    quantidade,

                "unidade":
                    unidade,

                "valor_unitario":
                    valor_unitario
            })


        nome_produto = produto["nome"]

        if produto["sabor"]:

            nome_produto += (
                f" - {produto['sabor']}"
            )


        nome_ficha = (
            f"Ficha de custo - "
            f"{nome_produto}"
        )


        CustoProdutoRepository.salvar_ficha(
            produto_id=produto_id,
            nome_ficha=nome_ficha,
            rendimento=rendimento,
            itens=itens
        )


        return (
            CustoProdutoService
            .buscar(produto_id)
        )


    @staticmethod
    def remover(produto_id):

        ficha = (
            CustoProdutoRepository
            .buscar_ficha(produto_id)
        )


        if not ficha:

            raise ValueError(
                "Este produto não possui "
                "ficha de custo."
            )


        CustoProdutoRepository.remover_ficha(
            produto_id
        )