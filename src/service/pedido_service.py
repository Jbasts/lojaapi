import secrets

from decimal import (
    Decimal,
    InvalidOperation
)

from src.repositories.pedido_repository import (
    PedidoRepository
)

from src.repositories.cliente_repository import (
    ClienteRepository
)

from src.repositories.produto_venda_repository import (
    ProdutoVendaRepository
)


class PedidoService:

    TIPOS_DESCONTO = (
        "NENHUM",
        "VALOR",
        "PERCENTUAL"
    )


    @staticmethod
    def _decimal(
        valor,
        campo
    ):

        try:

            return Decimal(
                str(valor).replace(
                    ",",
                    "."
                )
            )

        except (
            InvalidOperation,
            TypeError,
            ValueError
        ):

            raise ValueError(
                f"{campo} inválido."
            )


    @staticmethod
    def _gerar_numero():

        for _ in range(30):

            numero = str(
                secrets.randbelow(
                    900000
                )
                +
                100000
            )

            existente = (
                PedidoRepository
                .buscar_por_numero(
                    numero
                )
            )

            if not existente:
                return numero

        raise ValueError(
            "Não foi possível gerar "
            "o número do pedido."
        )


    @staticmethod
    def _validar(
        dados
    ):

        cliente_id = (
            dados.get(
                "cliente_id"
            )
        )


        if not cliente_id:

            raise ValueError(
                "Selecione o cliente."
            )


        cliente = (
            ClienteRepository
            .buscar_por_id(
                cliente_id
            )
        )


        if (
            not cliente
            or not cliente.ativo
        ):

            raise ValueError(
                "Cliente não encontrado."
            )


        itens_recebidos = (
            dados.get("itens")
            or []
        )


        if not itens_recebidos:

            raise ValueError(
                "Adicione pelo menos "
                "um produto ao pedido."
            )


        itens = []


        for indice, item in enumerate(
            itens_recebidos,
            start=1
        ):

            produto_id = (
                item.get(
                    "produto_venda_id"
                )
            )


            if not produto_id:

                raise ValueError(
                    f"Produto do item "
                    f"{indice} não informado."
                )


            produto = (
                ProdutoVendaRepository
                .buscar_por_id(
                    produto_id
                )
            )


            if (
                not produto
                or not produto.ativo
            ):

                raise ValueError(
                    f"Produto do item "
                    f"{indice} não encontrado."
                )


            quantidade = (
                PedidoService._decimal(
                    item.get(
                        "quantidade"
                    ),
                    f"Quantidade do item {indice}"
                )
            )


            if quantidade <= 0:

                raise ValueError(
                    f"Quantidade do item "
                    f"{indice} deve ser "
                    "maior que zero."
                )


            valor_recebido = (
                item.get(
                    "valor_unitario"
                )
            )


            if (
                valor_recebido is None
                or valor_recebido == ""
            ):

                valor_unitario = Decimal(
                    str(
                        produto.preco_venda
                    )
                )

            else:

                valor_unitario = (
                    PedidoService._decimal(
                        valor_recebido,
                        f"Valor unitário "
                        f"do item {indice}"
                    )
                )


            if valor_unitario < 0:

                raise ValueError(
                    f"Valor do item "
                    f"{indice} não pode "
                    "ser negativo."
                )


            desconto_tipo = str(
                item.get(
                    "desconto_tipo",
                    "NENHUM"
                )
            ).upper()


            if desconto_tipo not in (
                PedidoService
                .TIPOS_DESCONTO
            ):

                raise ValueError(
                    f"Tipo de desconto "
                    f"do item {indice} "
                    "é inválido."
                )


            desconto_valor = (
                PedidoService._decimal(
                    item.get(
                        "desconto_valor",
                        0
                    ),
                    f"Desconto do item {indice}"
                )
            )


            if desconto_valor < 0:

                raise ValueError(
                    "Desconto não pode "
                    "ser negativo."
                )


            bruto = (
                quantidade
                * valor_unitario
            )


            if (
                desconto_tipo
                == "PERCENTUAL"
                and desconto_valor > 100
            ):

                raise ValueError(
                    "Desconto percentual "
                    "não pode ser maior "
                    "que 100%."
                )


            if (
                desconto_tipo
                == "VALOR"
                and desconto_valor
                    > bruto
            ):

                raise ValueError(
                    f"Desconto do item "
                    f"{indice} não pode "
                    "ser maior que o "
                    "valor do item."
                )


            if (
                desconto_tipo
                == "NENHUM"
            ):

                desconto_valor = (
                    Decimal("0")
                )


            itens.append({
                "produto_venda_id":
                    produto_id,

                "quantidade":
                    quantidade,

                "valor_unitario":
                    valor_unitario,

                "desconto_tipo":
                    desconto_tipo,

                "desconto_valor":
                    desconto_valor
            })


        return {
            "cliente_id":
                int(cliente_id),

            "itens":
                itens
        }


    @staticmethod
    def listar(
        busca=None,
        status=None
    ):

        if status:

            status = status.upper()

            if status not in (
                "ABERTO",
                "CONCLUIDO"
            ):

                raise ValueError(
                    "Status inválido."
                )


        return (
            PedidoRepository.listar(
                busca,
                status
            )
        )


    @staticmethod
    def buscar(
        pedido_id
    ):

        pedido = (
            PedidoRepository
            .buscar_por_id(
                pedido_id
            )
        )


        if not pedido:

            raise ValueError(
                "Pedido não encontrado."
            )


        return pedido


    @staticmethod
    def criar(
        usuario_id,
        dados
    ):

        dados_validos = (
            PedidoService
            ._validar(dados)
        )


        numero = (
            PedidoService
            ._gerar_numero()
        )


        pedido_id = (
            PedidoRepository.criar(
                numero=numero,

                usuario_id=usuario_id,

                cliente_id=(
                    dados_validos[
                        "cliente_id"
                    ]
                ),

                itens=(
                    dados_validos[
                        "itens"
                    ]
                )
            )
        )


        return (
            PedidoService.buscar(
                pedido_id
            )
        )


    @staticmethod
    def atualizar(
        pedido_id,
        dados
    ):

        atual = (
            PedidoService.buscar(
                pedido_id
            )
        )


        if (
            atual.status
            != "ABERTO"
        ):

            raise ValueError(
                "Pedido concluído não "
                "pode ser editado."
            )


        dados_validos = (
            PedidoService
            ._validar(dados)
        )


        PedidoRepository.atualizar(
            pedido_id=pedido_id,

            cliente_id=(
                dados_validos[
                    "cliente_id"
                ]
            ),

            itens=(
                dados_validos[
                    "itens"
                ]
            )
        )


        return (
            PedidoService.buscar(
                pedido_id
            )
        )


    @staticmethod
    def excluir(
        pedido_id
    ):

        pedido = (
            PedidoService.buscar(
                pedido_id
            )
        )


        if (
            pedido.status
            == "CONCLUIDO"
        ):

            raise ValueError(
                "Pedido concluído não "
                "pode ser excluído."
            )


        if (
            pedido.pagamento_status
            == "PAGO"
        ):

            raise ValueError(
                "Pedido pago não pode "
                "ser excluído."
            )


        PedidoRepository.cancelar(
            pedido_id
        )


    @staticmethod
    def concluir(
        pedido_id,
        usuario_id
    ):

        pedido = (
            PedidoService.buscar(
                pedido_id
            )
        )


        if (
            pedido.status
            != "ABERTO"
        ):

            raise ValueError(
                "Somente pedido aberto "
                "pode ser concluído."
            )


        PedidoRepository.concluir(
            pedido_id,
            usuario_id
        )


        return (
            PedidoService.buscar(
                pedido_id
            )
        )