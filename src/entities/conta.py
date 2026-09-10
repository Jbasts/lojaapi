class ContaMovimento:

    def __init__(
        self,
        origem_id=None,
        tipo=None,
        categoria=None,
        data_movimento=None,
        referencia=None,
        descricao=None,
        valor=0
    ):
        self.origem_id = origem_id
        self.tipo = tipo
        self.categoria = categoria
        self.data_movimento = data_movimento
        self.referencia = referencia
        self.descricao = descricao
        self.valor = valor


    def to_dict(self):

        return {
            "origem_id":
                self.origem_id,

            "tipo":
                self.tipo,

            "categoria":
                self.categoria,

            "data_movimento": (
                self.data_movimento.isoformat()
                if self.data_movimento
                else None
            ),

            "referencia":
                self.referencia,

            "descricao":
                self.descricao,

            "valor":
                float(
                    self.valor or 0
                )
        }