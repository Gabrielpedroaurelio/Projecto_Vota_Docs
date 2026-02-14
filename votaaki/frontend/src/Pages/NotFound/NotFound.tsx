import { useNavigate } from "react-router-dom";
import styles from './NotFound.module.css';
import {FaFile} from 'react-icons/fa6'
export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.illustration}>
                        <div className={styles.number}>404</div>
                        <div className={styles.icon}><FaFile/></div>
                    </div>
                    
                    <div className={styles.text}>
                        <h1>Página não encontrada</h1>
                        <p>A página que você está procurando não existe ou foi movida.</p>
                    </div>
                    
                    <div className={styles.actions}>
                        <button 
                            className={styles.primaryButton}
                            onClick={() => navigate('/')}
                        >
                            Voltar para Home
                        </button>
                        <button 
                            className={styles.secondaryButton}
                            onClick={() => navigate(-1)}
                        >
                            Voltar
                        </button>
                    </div>
                </div>
                
                <div className={styles.background}>
                    <div className={styles.circle1}></div>
                    <div className={styles.circle2}></div>
                    <div className={styles.circle3}></div>
                </div>
            </div>
        </div>
    );
}
