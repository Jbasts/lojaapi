class FichaTecnica:

    def __init__(
        self,
        id=None,
        produto_venda_id=None,
        nome=None,
        rendimento=1,
        ativa=True,
        criado_em=None
    ):

        self.id = id
        self.produto_venda_id = produto_venda_id
        self.nome = nome
        self.rendimento = rendimento
        self.ativa = ativa
        self.criado_em = criado_em


    def to_dict(self):

        return {
            "id": self.id,

            "produto_venda_id":
                self.produto_venda_id,

            "nome": self.nome,

            "rendimento": float(
                self.rendimento or 0
            ),

            "ativa": self.ativa,

            "criado_em": (
                self.criado_em.isoformat()
                if self.criado_em
                else None
            )
        }