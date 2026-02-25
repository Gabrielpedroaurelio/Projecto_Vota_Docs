import { useState, useEffect } from 'react';
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineArrowRight } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import {CiVoicemail} from 'react-icons/ci'
import { useAuth } from '../../../Hooks/useAuth';
import styles from './Auth.module.css';

export default function Auth() {
    const [isSignup, setIsSignup] = useState(false);
    const { user, login, register, loading, error, setError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.user_type === 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleToggle = () => {
        setIsSignup(!isSignup);
        setError(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSignup) {
            if (formData.password !== formData.confirmPassword) {
                setError('As senhas não coincidem');
                return;
            }
            const success = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            if (success) {
                // Switch to login or show success
                setIsSignup(false);
            }
        } else {
            await login({
                email: formData.email,
                password: formData.password
            });
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={`${styles.container} ${isSignup ? styles.isSignup : ''}`}>
                
                <div className={styles.formSection}>
                    <h2 className={styles.title}>{isSignup ? 'Criar Conta' : 'Bem-vindo de volta'}</h2>
                    <p className={styles.subtitle}>
                        {isSignup ? 'Cadastre-se para começar a votar.' : 'Entre com suas credenciais para continuar.'}
                    </p>

                    {error && <div className={styles.errorMsg}>{error}</div>}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        {isSignup && (
                            <div className={styles.inputGroup}>
                                <label><HiOutlineUser /> Nome Completo</label>
                                <input 
                                    className={styles.inputField}
                                    type="text" 
                                    name="name" 
                                    placeholder="Seu nome"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={isSignup}
                                />
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label><CiVoicemail /> Email</label>
                            <input 
                                className={styles.inputField}
                                type="email" 
                                name="email" 
                                placeholder="seu@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label><HiOutlineLockClosed /> Senha</label>
                            <input 
                                className={styles.inputField}
                                type="password" 
                                name="password" 
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {isSignup && (
                            <div className={styles.inputGroup}>
                                <label><HiOutlineLockClosed /> Confirmar Senha</label>
                                <input 
                                    className={styles.inputField}
                                    type="password" 
                                    name="confirmPassword" 
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required={isSignup}
                                />
                            </div>
                        )}

                        <button className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Processando...' : (
                                <>
                                    {isSignup ? 'Registrar' : 'Entrar'} <HiOutlineArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.toggleContainer}>
                        {isSignup ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                        <button className={styles.toggleBtn} onClick={handleToggle}>
                            {isSignup ? 'Fazer Login' : 'Cadastre-se'}
                        </button>
                    </div>
                </div>

                <div className={styles.visualSection}>
                    <h1>VotaAki</h1>
                    <p>
                        A plataforma de votação mais segura e inovadora para suas decisões coletivas.
                    </p>
                    <div className={styles.decorationCircle} />
                </div>

            </div>
        </div>
    );
}
