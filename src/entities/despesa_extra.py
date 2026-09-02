class DespesaExtra:

    def __init__(
        self,
        id=None,
        nome=None,
        quantidade=1,
        valor_unitario=0,
        categoria=None,
        data=None,
        observacao=None,
        criado_em=None
    ):

        self.id = id
        self.nome = nome
        self.quantidade = quantidade
        self.valor_unitario = valor_unitario
        self.categoria = categoria
        self.data = data
        self.observacao = observacao
        self.criado_em = criado_em


    def to_dict(self):

        quantidade = float(
            self.quantidade or 0
        )

        valor_unitario = float(
            self.valor_unitario or 0
        )

        return {
            "id": self.id,

            "nome": self.nome,

            "quantidade": quantidade,

            "valor_unitario": valor_unitario,

            "valor_total": round(
                quantidade * valor_unitario,
                2
            ),

            "categoria": self.categoria,

            "data": (
                self.data.isoformat()
                if self.data
                else None
            ),

            "observacao": self.observacao,

            "criado_em": (
                self.criado_em.isoformat()
                if self.criado_em
                else None
            )
        }