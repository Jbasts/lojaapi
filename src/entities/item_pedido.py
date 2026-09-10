from decimal import Decimal


class ItemPedido:

    def __init__(
        self,
        id=None,
        pedido_id=None,
        produto_venda_id=None,
        produto_nome=None,
        sabor=None,
        tipo_produto=None,
        quantidade=0,
        valor_unitario=0,
        desconto_tipo="NENHUM",
        desconto_valor=0
    ):
        self.id = id
        self.pedido_id = pedido_id
        self.produto_venda_id = produto_venda_id
        self.produto_nome = produto_nome
        self.sabor = sabor
        self.tipo_produto = tipo_produto
        self.quantidade = quantidade
        self.valor_unitario = valor_unitario
        self.desconto_tipo = desconto_tipo
        self.desconto_valor = desconto_valor


    def calcular(self):

        quantidade = Decimal(
            str(self.quantidade or 0)
        )

        valor_unitario = Decimal(
            str(self.valor_unitario or 0)
        )

        desconto_valor = Decimal(
            str(self.desconto_valor or 0)
        )

        bruto = (
            quantidade
            * valor_unitario
        )


        if (
            self.desconto_tipo
            == "PERCENTUAL"
        ):

            desconto = (
                bruto
                *
                desconto_valor
                /
                Decimal("100")
            )

        elif (
            self.desconto_tipo
            == "VALOR"
        ):

            desconto = (
                desconto_valor
            )

        else:

            desconto = Decimal("0")


        liquido = (
            bruto - desconto
        )


        if liquido < 0:
            liquido = Decimal("0")


        return {
            "valor_bruto":
                bruto,

            "valor_desconto":
                desconto,

            "valor_final":
                liquido
        }


    def to_dict(self):

        calculo = self.calcular()

        return {
            "id": self.id,

            "pedido_id":
                self.pedido_id,

            "produto_venda_id":
                self.produto_venda_id,

            "produto_nome":
                self.produto_nome,

            "sabor":
                self.sabor,

            "tipo_produto":
                self.tipo_produto,

            "quantidade":
                float(
                    self.quantidade or 0
                ),

            "valor_unitario":
                float(
                    self.valor_unitario or 0
                ),

            "desconto_tipo":
                self.desconto_tipo,

            "desconto_valor":
                float(
                    self.desconto_valor or 0
                ),

            "valor_bruto":
                round(
                    float(
                        calculo[
                            "valor_bruto"
                        ]
                    ),
                    2
                ),

            "valor_desconto":
                round(
                    float(
                        calculo[
                            "valor_desconto"
                        ]
                    ),
                    2
                ),

            "valor_final":
                round(
                    float(
                        calculo[
                            "valor_final"
                        ]
                    ),
                    2
                )
        }