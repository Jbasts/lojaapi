class Desperdicio:

    def __init__(
        self,
        id=None,
        lote_id=None,
        produto_estoque_id=None,
        produto_nome=None,
        codigo_barras=None,
        quantidade=0,
        custo_unitario=0,
        valor_total=0,
        validade=None,
        motivo=None,
        observacao=None,
        data_desperdicio=None,
        usuario_id=None,
        ativo=True
    ):
        self.id = id
        self.lote_id = lote_id
        self.produto_estoque_id = produto_estoque_id
        self.produto_nome = produto_nome
        self.codigo_barras = codigo_barras
        self.quantidade = quantidade
        self.custo_unitario = custo_unitario
        self.valor_total = valor_total
        self.validade = validade
        self.motivo = motivo
        self.observacao = observacao
        self.data_desperdicio = data_desperdicio
        self.usuario_id = usuario_id
        self.ativo = ativo


    def to_dict(self):

        return {
            "id": self.id,

            "lote_id":
                self.lote_id,

            "produto_estoque_id":
                self.produto_estoque_id,

            "produto_nome":
                self.produto_nome,

            "codigo_barras":
                self.codigo_barras,

            "quantidade": float(
                self.quantidade or 0
            ),

            "custo_unitario": float(
                self.custo_unitario or 0
            ),

            "valor_total": float(
                self.valor_total or 0
            ),

            "validade": (
                self.validade.isoformat()
                if self.validade
                else None
            ),

            "motivo":
                self.motivo,

            "observacao":
                self.observacao,

            "data_desperdicio": (
                self.data_desperdicio.isoformat()
                if self.data_desperdicio
                else None
            ),

            "usuario_id":
                self.usuario_id,

            "ativo":
                self.ativo
        }