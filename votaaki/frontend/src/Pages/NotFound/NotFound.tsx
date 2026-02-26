import { useNavigate } from "react-router-dom";
import { HiOutlineHome, HiOutlineArrowUturnLeft, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import styles from './NotFound.module.css';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.illustration}>
                        <div className={styles.number}>404</div>
                        <div className={styles.icon}>
                            <HiOutlineExclamationTriangle />
                        </div>
                    </div>
                    
                    <div className={styles.text}>
                        <h1 className={styles.title}>Ops! Página Perdida</h1>
                        <p className={styles.description}>
                            Parece que seguiu um caminho que não existe. <br />
                            Não se preocupe, acontece aos melhores exploradores.
                        </p>
                    </div>
                    
                    <div className={styles.actions}>
                        <button 
                            className={styles.primaryButton}
                            onClick={() => navigate('/')}
                        >
                            <HiOutlineHome /> Ir para o Início
                        </button>
                        <button 
                            className={styles.secondaryButton}
                            onClick={() => navigate(-1)}
                        >
                            <HiOutlineArrowUturnLeft /> Voltar Atrás
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
