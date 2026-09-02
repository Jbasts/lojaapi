class ProdutoVenda:

    def __init__(
        self,
        id=None,
        produto_estoque_id=None,
        produto_estoque_nome=None,
        nome=None,
        sabor=None,
        tipo=None,
        unidade="UN",
        preco_venda=0,
        ativo=True,
        criado_em=None
    ):

        self.id = id

        self.produto_estoque_id = (
            produto_estoque_id
        )

        self.produto_estoque_nome = (
            produto_estoque_nome
        )

        self.nome = nome
        self.sabor = sabor
        self.tipo = tipo
        self.unidade = unidade
        self.preco_venda = preco_venda
        self.ativo = ativo
        self.criado_em = criado_em


    def to_dict(self):

        return {
            "id": self.id,

            "produto_estoque_id":
                self.produto_estoque_id,

            "produto_estoque_nome":
                self.produto_estoque_nome,

            "nome": self.nome,

            "sabor": self.sabor,

            "tipo": self.tipo,

            "unidade": self.unidade,

            "preco_venda": float(
                self.preco_venda or 0
            ),

            "ativo": self.ativo,

            "criado_em": (
                self.criado_em.isoformat()
                if self.criado_em
                else None
            )
        }