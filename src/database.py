import psycopg2

from src.config import Config


def get_connection():

    connection = psycopg2.connect(
        Config.DATABASE_URL
    )

    return connection