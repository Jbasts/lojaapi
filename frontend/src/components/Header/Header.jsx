import {
    CalendarDays
} from "lucide-react";

import {
    useAuth
} from "../../hooks/useAuth";

import styles from "./Header.module.css";


function Header() {

    const { usuario } = useAuth();


    const dataAtual =
        new Intl.DateTimeFormat(
            "pt-BR"
        ).format(
            new Date()
        );


    return (

        <header className={styles.header}>

            <div>
                <span className={styles.systemName}>
                    Sistema de Gestão
                </span>
            </div>


            <div className={styles.right}>

                <div className={styles.date}>

                    <CalendarDays size={16} />

                    {dataAtual}

                </div>


                <div className={styles.user}>

                    <div className={styles.avatar}>

                        {
                            usuario?.nome
                                ?.charAt(0)
                                ?.toUpperCase()
                        }

                    </div>

                    <div>

                        <strong>
                            {usuario?.nome}
                        </strong>

                        <span>
                            Administrador
                        </span>

                    </div>

                </div>

            </div>

        </header>
    );
}


export default Header;