import { MdClose } from 'react-icons/md';
import { FaUser } from 'react-icons/fa6';
import favicon from '../../../assets/images/favicon.ico';
import { CgMenuRight } from 'react-icons/cg';
import styles from './MenuSitePublic.module.css';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function MenuSitePublic() {
    const usuarioLogado = false;
    const [toggleMenu, setToggleMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`${styles.headerMenu} ${scrolled ? styles.scrolled : ''} ${toggleMenu ? styles.menuExpandir : ''}`}>
            <div className={styles.logo}>
                <Link to="/" className={styles.logoLink}>
                    <img src={favicon} alt="Logo" className={styles.favicon} />
                    <div className={styles.titleContainer}>
                        <span className={styles.schoolName}>Instituto Politécnico <br />Do Maiombe</span>
                    </div>
                </Link>
            </div>

            <div className={styles.menu}>
                <button className={styles.btnMenu} onClick={() => setToggleMenu(!toggleMenu)}>
                    <CgMenuRight size={28} />
                </button>

                <nav className={styles.nav}>
                    <div className={styles.mobileNavHeader}>
                        <img src={favicon} alt="Logo" className={styles.favicon} />
                        <button className={styles.btnClose} onClick={() => setToggleMenu(false)}>
                            <MdClose size={32} />
                        </button>
                    </div>

                    <ul className={styles.navList}>
                        <li>
                            <Link to="/public/site" className={styles.navLink} onClick={() => setToggleMenu(false)}>Início</Link>
                        </li>
                        <li>
                            <Link to="/public/library" className={styles.navLink} onClick={() => setToggleMenu(false)}>Biblioteca</Link>
                        </li>
                        <li>
                            <Link to="/parent/auth" className={styles.navLink} onClick={() => setToggleMenu(false)}>Entrar Como Encarregado</Link>
                        </li>
                    </ul>

                    <div className={styles.navActions}>
                        {usuarioLogado ? (
                            <Link to="/student/dashboard" className={styles.loginBtn}>
                                <FaUser />
                                <span>Portal</span>
                            </Link>
                        ) : (
                            <Link to="/student/auth" className={styles.loginBtn}>
                                Entrar Como Aluno
                            </Link>
                        )}
                    </div>
                </nav>
            </div>
            {toggleMenu && <div className={styles.overlay} onClick={() => setToggleMenu(false)} />}
        </header>
    );
}