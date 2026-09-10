class Pagamento:

    def __init__(
        self,
        id=None,
        pedido_id=None,
        numero_pedido=None,
        cliente_nome=None,
        forma=None,
        valor=0,
        data_pagamento=None,
        status="PAGO",
        observacao=None,
        usuario_id=None,
        criado_em=None,
        estornado_em=None
    ):
        self.id = id
        self.pedido_id = pedido_id
        self.numero_pedido = numero_pedido
        self.cliente_nome = cliente_nome
        self.forma = forma
        self.valor = valor
        self.data_pagamento = data_pagamento
        self.status = status
        self.observacao = observacao
        self.usuario_id = usuario_id
        self.criado_em = criado_em
        self.estornado_em = estornado_em


    def to_dict(self):

        return {
            "id": self.id,

            "pedido_id":
                self.pedido_id,

            "numero_pedido":
                self.numero_pedido,

            "cliente_nome":
                self.cliente_nome,

            "forma":
                self.forma,

            "valor":
                float(
                    self.valor or 0
                ),

            "data_pagamento": (
                self.data_pagamento.isoformat()
                if self.data_pagamento
                else None
            ),

            "status":
                self.status,

            "observacao":
                self.observacao,

            "usuario_id":
                self.usuario_id,

            "criado_em": (
                self.criado_em.isoformat()
                if self.criado_em
                else None
            ),

            "estornado_em": (
                self.estornado_em.isoformat()
                if self.estornado_em
                else None
            )
        }