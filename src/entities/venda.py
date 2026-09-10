class Venda:

    def __init__(
        self,
        pedido_id=None,
        numero_pedido=None,
        cliente_id=None,
        cliente=None,
        produto_id=None,
        produto=None,
        sabor=None,
        quantidade=0,
        valor_unitario=0,
        desconto_tipo="NENHUM",
        desconto_valor=0,
        valor_bruto=0,
        valor_desconto=0,
        valor_final=0,
        data_pedido=None,
        concluido_em=None,
        forma=None,
        valor=None,
        data_pagamento=None,
        status_pagamento="PENDENTE"
    ):
        self.pedido_id = pedido_id
        self.numero_pedido = numero_pedido
        self.cliente_id = cliente_id
        self.cliente = cliente
        self.produto_id = produto_id
        self.produto = produto
        self.sabor = sabor
        self.quantidade = quantidade
        self.valor_unitario = valor_unitario
        self.desconto_tipo = desconto_tipo
        self.desconto_valor = desconto_valor
        self.valor_bruto = valor_bruto
        self.valor_desconto = valor_desconto
        self.valor_final = valor_final
        self.data_pedido = data_pedido
        self.concluido_em = concluido_em
        self.forma = forma
        self.valor = valor
        self.data_pagamento = data_pagamento
        self.status_pagamento = status_pagamento


    def to_dict(self):

        return {
            "pedido_id":
                self.pedido_id,

            "numero_pedido":
                self.numero_pedido,

            "cliente_id":
                self.cliente_id,

            "cliente":
                self.cliente,

            "produto_id":
                self.produto_id,

            "produto":
                self.produto,

            "sabor":
                self.sabor,

            "quantidade":
                float(
                    self.quantidade or 0
                ),

            "valor_unitario":
                float(
                    self.valor_unitario or 0
                ),

            "desconto_tipo":
                self.desconto_tipo,

            "desconto_valor":
                float(
                    self.desconto_valor or 0
                ),

            "valor_bruto":
                float(
                    self.valor_bruto or 0
                ),

            "valor_desconto":
                float(
                    self.valor_desconto or 0
                ),

            "valor_final":
                float(
                    self.valor_final or 0
                ),

            "data_pedido": (
                self.data_pedido.isoformat()
                if self.data_pedido
                else None
            ),

            "concluido_em": (
                self.concluido_em.isoformat()
                if self.concluido_em
                else None
            ),

            "forma":
                self.forma,

            "valor": (
                float(self.valor)
                if self.valor is not None
                else None
            ),

            "data_pagamento": (
                self.data_pagamento.isoformat()
                if self.data_pagamento
                else None
            ),

            "status_pagamento":
                self.status_pagamento
        }