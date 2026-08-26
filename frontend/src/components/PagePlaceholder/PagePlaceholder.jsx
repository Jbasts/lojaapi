import styles from "./PagePlaceholder.module.css";


function PagePlaceholder({
    titulo,
    descricao
}) {

    return (
        <div className={styles.container}>

            <h1>
                {titulo}
            </h1>

            <p>
                {descricao}
            </p>

        </div>
    );
}


export default PagePlaceholder;