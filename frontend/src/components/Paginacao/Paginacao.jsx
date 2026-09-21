import styles from "./Paginacao.module.css";


function Paginacao({
    paginaAtual,
    totalItens,
    itensPorPagina,
    onPaginaChange,
    onItensPorPaginaChange
}) {

    const totalPaginas = Math.max(
        1,
        Math.ceil(
            totalItens / itensPorPagina
        )
    );


    const inicio =
        totalItens === 0
            ? 0
            : (
                (paginaAtual - 1)
                * itensPorPagina
            ) + 1;


    const fim = Math.min(
        paginaAtual * itensPorPagina,
        totalItens
    );


    function alterarQuantidade(event) {

        const valor =
            Number(event.target.value);

        if (
            !Number.isInteger(valor)
            || valor < 1
        ) {
            return;
        }

        onItensPorPaginaChange(valor);
    }


    return (

        <div className={styles.pagination}>

            <div className={styles.info}>

                Mostrando{" "}
                <strong>
                    {inicio}
                </strong>

                {" - "}

                <strong>
                    {fim}
                </strong>

                {" de "}

                <strong>
                    {totalItens}
                </strong>

            </div>


            <div className={styles.navigation}>

                <button
                    type="button"
                    disabled={
                        paginaAtual <= 1
                    }
                    onClick={() =>
                        onPaginaChange(
                            paginaAtual - 1
                        )
                    }
                >
                    &lt;
                </button>


                <span>
                    Página{" "}
                    <strong>
                        {paginaAtual}
                    </strong>

                    {" de "}

                    <strong>
                        {totalPaginas}
                    </strong>
                </span>


                <button
                    type="button"
                    disabled={
                        paginaAtual
                        >= totalPaginas
                    }
                    onClick={() =>
                        onPaginaChange(
                            paginaAtual + 1
                        )
                    }
                >
                    &gt;
                </button>

            </div>


            <label
                className={
                    styles.pageSize
                }
            >

                <span>
                    Itens por página:
                </span>

                <input
                    type="number"
                    min="1"
                    value={
                        itensPorPagina
                    }
                    onChange={
                        alterarQuantidade
                    }
                />

            </label>

        </div>
    );
}


export default Paginacao;