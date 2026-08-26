import styles
    from "./Dashboard.module.css";


function Dashboard() {

    return (

        <div className={styles.page}>

            <div className={styles.titleArea}>

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Visão geral do negócio.
                    </p>

                </div>

            </div>


            <div className={styles.message}>

                Os indicadores de faturamento,
                despesas, vendas e lucro serão
                adicionados quando criarmos os
                endpoints do Dashboard.

            </div>

        </div>
    );
}


export default Dashboard;