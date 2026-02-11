import { Link } from "react-router-dom";
import styles from './Auth.module.css'
import { useForm } from "react-hook-form";
import { AiOutlineGoogle } from "react-icons/ai";
import { useState } from "react";
type userLogin = {
    email: string,
    password: string
}
export default function Auth() {
    const { register, handleSubmit, formState: { errors } } = useForm<userLogin>()
    const [submitting, setSubmitting] = useState(false)
    async function Login(data: userLogin) {
        setSubmitting(true)
        setTimeout(() => {
            console.log(data);
            
            setSubmitting(false)
        }, 2000);
        

    }
    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.background}>
                    <div className={styles.header}>
                        <p>O que você acha?</p>
                    </div>
                    <div className={styles.footer}>
                        <h1>VotaAki <br />
                            Aqui a sua opnião importa
                        </h1>
                    </div>
                </div>
                <div className={styles.cardform}>
                    <div className={styles.logo}>
                        <img src="logo_votaaki.png" alt="" width={100} />
                    </div>
                    <form className={styles.form} onSubmit={handleSubmit(Login)}>
                        <div className={styles.controller}>
                            <h1>Bem-Vindo de Volta</h1>
                            <small>Insira o seu email e palavra-passe para acessar sua conta</small>
                        </div>
                        <div className={styles.controller}>
                            <label htmlFor="email">E-mail</label>
                            <input type="email" id="email" {...register("email", { required: "Este Campo é Obrigatório" })} />
                            {errors?.email && (<p>{errors.email?.message}</p>)}
                        </div>
                        <div className={styles.controller}>
                            <label htmlFor="password">Palavra-Passe</label>
                            <input type="password" id="password" {...register("password", { required: "Este Campo é Obrigatório" })} />
                            {errors?.password && (<p>{errors.password?.message}</p>)}
                        </div>
                        <div className={styles.controller}>
                            <button type="submit">{submitting ? "Entrando..." : "Entrar"}</button>
                        </div>
                        <div className={styles.controller}>
                            <button type="button">  <AiOutlineGoogle size={30} /> <span>Entrar com o Google</span></button>
                        </div>
                    </form>
                    <div className={styles.footer}>
                        <p>Não tem um conta? <strong><Link to={"/register"}>Cadastre-se</Link></strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
}