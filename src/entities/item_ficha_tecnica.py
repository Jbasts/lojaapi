class ItemFichaTecnica:

    def __init__(
        self,
        id=None,
        ficha_tecnica_id=None,
        produto_estoque_id=None,
        produto_estoque_nome=None,
        descricao=None,
        quantidade=0,
        unidade="UN",
        valor_unitario_manual=0,
        criado_em=None
    ):

        self.id = id

        self.ficha_tecnica_id = (
            ficha_tecnica_id
        )

        self.produto_estoque_id = (
            produto_estoque_id
        )

        self.produto_estoque_nome = (
            produto_estoque_nome
        )

        self.descricao = descricao

        self.quantidade = quantidade

        self.unidade = unidade

        self.valor_unitario_manual = (
            valor_unitario_manual
        )

        self.criado_em = criado_em


    def to_dict(self):

        quantidade = float(
            self.quantidade or 0
        )

        valor_unitario = float(
            self.valor_unitario_manual or 0
        )

        return {
            "id": self.id,

            "ficha_tecnica_id":
                self.ficha_tecnica_id,

            "produto_estoque_id":
                self.produto_estoque_id,

            "produto_estoque_nome":
                self.produto_estoque_nome,

            "descricao":
                self.descricao,

            "quantidade":
                quantidade,

            "unidade":
                self.unidade,

            "valor_unitario":
                valor_unitario,

            "subtotal":
                round(
                    quantidade * valor_unitario,
                    4
                ),

            "tipo": (
                "ESTOQUE"
                if self.produto_estoque_id
                else "MANUAL"
            )
        }