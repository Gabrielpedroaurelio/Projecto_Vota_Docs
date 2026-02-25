import styles from './NavMenu.module.css'
export default function NavMenu() {
    return (
        <>
        <header className={styles.header}>
            <div className={styles.logo}>
                <img src="logo_votaaki.png" alt="" width={150}/>
            </div>
            <nav className={styles.navbarmenu}>
                <a href="">Começar</a>
            </nav>
        </header>
        </>
    )
}