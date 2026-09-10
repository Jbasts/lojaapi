from decimal import Decimal


class Pedido:

    def __init__(
        self,
        id=None,
        numero=None,
        cliente_id=None,
        cliente_nome=None,
        usuario_id=None,
        data_pedido=None,
        status="ABERTO",
        concluido_em=None,
        pagamento_status="PENDENTE",
        itens=None
    ):
        self.id = id
        self.numero = numero
        self.cliente_id = cliente_id
        self.cliente_nome = cliente_nome
        self.usuario_id = usuario_id
        self.data_pedido = data_pedido
        self.status = status
        self.concluido_em = concluido_em
        self.pagamento_status = pagamento_status
        self.itens = itens or []


    def to_dict(self):

        subtotal = Decimal("0")
        desconto_total = Decimal("0")
        total = Decimal("0")


        for item in self.itens:

            calculo = item.calcular()

            subtotal += calculo[
                "valor_bruto"
            ]

            desconto_total += calculo[
                "valor_desconto"
            ]

            total += calculo[
                "valor_final"
            ]


        return {
            "id": self.id,

            "numero": self.numero,

            "cliente_id":
                self.cliente_id,

            "cliente_nome":
                self.cliente_nome,

            "usuario_id":
                self.usuario_id,

            "data_pedido": (
                self.data_pedido.isoformat()
                if self.data_pedido
                else None
            ),

            "status":
                self.status,

            "concluido_em": (
                self.concluido_em.isoformat()
                if self.concluido_em
                else None
            ),

            "pagamento_status":
                self.pagamento_status,

            "subtotal":
                round(
                    float(subtotal),
                    2
                ),

            "desconto_total":
                round(
                    float(desconto_total),
                    2
                ),

            "valor_total":
                round(
                    float(total),
                    2
                ),

            "itens": [
                item.to_dict()
                for item in self.itens
            ]
        }