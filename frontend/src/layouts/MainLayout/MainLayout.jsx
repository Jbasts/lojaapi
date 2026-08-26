import {
    Outlet
} from "react-router-dom";

import Sidebar
    from "../../components/Sidebar/Sidebar";

import Header
    from "../../components/Header/Header";

import styles
    from "./MainLayout.module.css";


function MainLayout() {

    return (

        <div className={styles.layout}>

            <Sidebar />

            <div className={styles.right}>

                <Header />

                <main className={styles.content}>

                    <Outlet />

                </main>

            </div>

        </div>
    );
}


export default MainLayout;