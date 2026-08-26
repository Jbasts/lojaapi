from flask import Flask, jsonify

from src.config import Config
from src.extensions import jwt, cors

from src.routes.auth_routes import auth_bp
from src.routes.usuario_routes import usuario_bp


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