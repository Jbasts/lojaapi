class LoteEstoque:

    def __init__(
        self,
        id=None,
        item_compra_id=None,
        produto_estoque_id=None,
        produto_nome=None,
        codigo_barras=None,
        unidade=None,
        quantidade_inicial=0,
        quantidade_atual=0,
        custo_unitario=0,
        validade=None,
        compra_id=None,
        compra_numero=None,
        data_compra=None
    ):
        self.id = id
        self.item_compra_id = item_compra_id
        self.produto_estoque_id = produto_estoque_id
        self.produto_nome = produto_nome
        self.codigo_barras = codigo_barras
        self.unidade = unidade

        self.quantidade_inicial = (
            quantidade_inicial
        )

        self.quantidade_atual = (
            quantidade_atual
        )

        self.custo_unitario = (
            custo_unitario
        )

        self.validade = validade
        self.compra_id = compra_id
        self.compra_numero = compra_numero
        self.data_compra = data_compra


    def to_dict(self):

        quantidade = float(
            self.quantidade_atual or 0
        )

        custo = float(
            self.custo_unitario or 0
        )

        return {
            "id": self.id,

            "item_compra_id":
                self.item_compra_id,

            "produto_estoque_id":
                self.produto_estoque_id,

            "produto_nome":
                self.produto_nome,

            "codigo_barras":
                self.codigo_barras,

            "unidade":
                self.unidade,

            "quantidade_inicial": float(
                self.quantidade_inicial or 0
            ),

            "quantidade_atual":
                quantidade,

            "custo_unitario":
                custo,

            "valor_total": round(
                quantidade * custo,
                2
            ),

            "validade": (
                self.validade.isoformat()
                if self.validade
                else None
            ),

            "compra_id":
                self.compra_id,

            "compra_numero":
                self.compra_numero,

            "data_compra": (
                self.data_compra.isoformat()
                if self.data_compra
                else None
            )
        }