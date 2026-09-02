class Compra:

    def __init__(
        self,
        id=None,
        numero=None,
        usuario_id=None,
        data_compra=None,
        status="CONFIRMADA",
        desconto=0,
        observacao=None,
        itens=None
    ):
        self.id = id
        self.numero = numero
        self.usuario_id = usuario_id
        self.data_compra = data_compra
        self.status = status
        self.desconto = desconto
        self.observacao = observacao
        self.itens = itens or []

    def to_dict(self):

        total_itens = sum(
            item.quantidade * item.valor_unitario
            for item in self.itens
        )

        total = (
            float(total_itens)
            - float(self.desconto or 0)
        )

        return {
            "id": self.id,
            "numero": self.numero,
            "usuario_id": self.usuario_id,
            "data_compra": (
                self.data_compra.isoformat()
                if self.data_compra
                else None
            ),
            "status": self.status,
            "desconto": float(
                self.desconto or 0
            ),
            "valor_total": round(
                max(total, 0),
                2
            ),
            "itens": [
                item.to_dict()
                for item in self.itens
            ]
        }