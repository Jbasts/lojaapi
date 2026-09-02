class ItemCompra:

    def __init__(
        self,
        id=None,
        compra_id=None,
        produto_estoque_id=None,
        produto_nome=None,
        codigo_barras=None,
        quantidade=0,
        valor_unitario=0,
        validade=None,
        criado_em=None
    ):
        self.id = id
        self.compra_id = compra_id
        self.produto_estoque_id = produto_estoque_id
        self.produto_nome = produto_nome
        self.codigo_barras = codigo_barras
        self.quantidade = quantidade
        self.valor_unitario = valor_unitario
        self.validade = validade
        self.criado_em = criado_em

    def to_dict(self):

        quantidade = float(self.quantidade or 0)
        valor_unitario = float(self.valor_unitario or 0)

        return {
            "id": self.id,
            "compra_id": self.compra_id,
            "produto_estoque_id": self.produto_estoque_id,
            "produto_nome": self.produto_nome,
            "codigo_barras": self.codigo_barras,
            "quantidade": quantidade,
            "valor_unitario": valor_unitario,
            "valor_total": round(
                quantidade * valor_unitario,
                2
            ),
            "validade": (
                self.validade.isoformat()
                if self.validade
                else None
            )
        }