class ProdutoEstoque:

    def __init__(
        self,
        id=None,
        nome=None,
        codigo_barras=None,
        unidade="UN",
        controla_validade=True,
        estoque_minimo=0,
        ativo=True,
        criado_em=None
    ):

        self.id = id
        self.nome = nome
        self.codigo_barras = codigo_barras
        self.unidade = unidade
        self.controla_validade = controla_validade
        self.estoque_minimo = estoque_minimo
        self.ativo = ativo
        self.criado_em = criado_em


    def to_dict(self):

        return {
            "id": self.id,
            "nome": self.nome,
            "codigo_barras": self.codigo_barras,
            "unidade": self.unidade,
            "controla_validade": self.controla_validade,
            "estoque_minimo": float(
                self.estoque_minimo or 0
            ),
            "ativo": self.ativo,
            "criado_em": (
                self.criado_em.isoformat()
                if self.criado_em
                else None
            )
        }