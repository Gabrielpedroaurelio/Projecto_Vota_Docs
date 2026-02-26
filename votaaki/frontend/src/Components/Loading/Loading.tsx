
import styles from './Loading.module.css'

interface LoadingProps {
    texto?: string;
}

export default function Loading({ texto = 'Carregando' }: LoadingProps) {
    return (
        <>
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>{texto}...</p>
            </div>
        </>
    )
}