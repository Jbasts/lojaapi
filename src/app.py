from flask import Flask, jsonify

from src.config import Config
from src.extensions import jwt, cors

from src.routes.auth_routes import auth_bp
from src.routes.usuario_routes import usuario_bp
from src.routes.cliente_routes import cliente_bp
from src.routes.produto_estoque_routes import produto_estoque_bp
from src.routes.produto_venda_routes import produto_venda_bp
from src.routes.custo_produto_routes import custo_produto_bp
from src.routes.despesa_extra_routes import despesa_extra_bp
from src.routes.compra_routes import compra_bp
from src.routes.estoque_routes import estoque_bp
from src.routes.desperdicio_routes import desperdicio_bp
from src.routes.pedido_routes import pedido_bp
from src.routes.pagamento_routes import pagamento_bp
from src.routes.venda_routes import venda_bp
from src.routes.conta_routes import conta_bp
from src.routes.relatorio_routes import relatorio_bp
from src.routes.dashboard_routes import dashboard_bp



def create_app():

    app = Flask(__name__)

    app.config["JWT_SECRET_KEY"] = (
        Config.JWT_SECRET_KEY
    )

    app.config[
        "JWT_ACCESS_TOKEN_EXPIRES"
    ] = Config.JWT_ACCESS_TOKEN_EXPIRES

    jwt.init_app(
        app
    )

    cors.init_app(
        app,
        resources={
            r"/*": {
                "origins": Config.FRONTEND_URL
            }
        }
    )

    app.register_blueprint(
        auth_bp,
        url_prefix="/auth"
    )

    app.register_blueprint(
        usuario_bp,
        url_prefix="/usuarios"
    )

    app.register_blueprint(
        cliente_bp,
        url_prefix="/clientes"
    )

    app.register_blueprint(
        produto_estoque_bp,
        url_prefix="/produtos-estoque"
    )

    app.register_blueprint(
        produto_venda_bp,
        url_prefix="/produtos-venda"
    )

    app.register_blueprint(
        custo_produto_bp,
        url_prefix="/custos-produtos"
    )

    app.register_blueprint(
        despesa_extra_bp,
        url_prefix="/despesas-extras"
    )

    app.register_blueprint(
    compra_bp,
    url_prefix="/compras"
    )

    app.register_blueprint(
    estoque_bp,
    url_prefix="/estoque"
    )

    app.register_blueprint(
    desperdicio_bp,
    url_prefix="/desperdicios"
    )

    app.register_blueprint(
    pedido_bp,
    url_prefix="/pedidos"
    )

    app.register_blueprint(
    pagamento_bp,
    url_prefix="/pagamentos"
    )

    app.register_blueprint(
        venda_bp,
        url_prefix="/vendas"
    )

    app.register_blueprint(
        conta_bp,
        url_prefix="/contas"
    )

    app.register_blueprint(
    relatorio_bp,
    url_prefix="/relatorios"
    )

    app.register_blueprint(
        dashboard_bp,
        url_prefix="/dashboard"
    )

    @app.route(
        "/",
        methods=["GET"]
    )
    def home():

        return jsonify({
            "mensagem": "API MARDRI funcionando."
        })


    @app.route(
        "/health",
        methods=["GET"]
    )
    def health():

        return jsonify({
            "status": "ok"
        })

    return app


app = create_app()


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )