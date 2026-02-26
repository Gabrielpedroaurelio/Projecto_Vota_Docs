import { useState, useEffect, useRef } from 'react';
import { 
    HiOutlineUser, 
    HiOutlineEnvelope, 
    HiOutlineLockClosed, 
    HiOutlineCamera,
    HiOutlineCheckCircle,
    HiOutlineCheckBadge,
    HiOutlineCalendar
} from 'react-icons/hi2';
import { profileService } from '../../Services/profileService';
import Loading from '../../Components/Loading/Loading';
import styles from './Profile.module.css';

interface UserProfile {
    id_user: number;
    name: string;
    email: string;
    user_type: string;
    status: string;
    path_thumb: string | null;
    created_at: string;
}

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getProfile();
            setUser(data);
            setFormData(prev => ({
                ...prev,
                name: data.name,
                email: data.email
            }));
            if (data.path_thumb) {
                setImagePreview(`http://localhost:5000${data.path_thumb}`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Imagem muito grande (máx 2MB)');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('As novas palavras-passe não coincidem');
            return;
        }

        try {
            setSaving(true);
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            if (formData.currentPassword && formData.newPassword) {
                data.append('currentPassword', formData.currentPassword);
                data.append('newPassword', formData.newPassword);
            }
            if (selectedFile) {
                data.append('image', selectedFile);
            }

            const result = await profileService.updateProfile(data);
            
            setSuccess('Perfil atualizado com sucesso!');
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            
            // Update local user state
            if (result.image) {
                const newImg = `http://localhost:5000${result.image}`;
                setImagePreview(newImg);
                // Also update localStorage if needed by Header
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                storedUser.image = result.image;
                storedUser.name = formData.name;
                localStorage.setItem('user', JSON.stringify(storedUser));
                
                // Dispatch event to notify other components (like Header)
                window.dispatchEvent(new Event('storage'));
            }

            fetchProfile();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className={styles.loader}><Loading /></div>;

    return (
        <div className={styles.container}>
            <div className={styles.profileHeader}>
                <div className={styles.headerContent}>
                    <h1>Meu Perfil</h1>
                    <p>Gere as tuas informações pessoais e preferências de conta.</p>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Left Side: Avatar & Basic Info */}
                <div className={styles.sidebar}>
                    <div className={styles.card}>
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarWrapper} onClick={() => fileInputRef.current?.click()}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        <HiOutlineUser />
                                    </div>
                                )}
                                <div className={styles.avatarOverlay}>
                                    <HiOutlineCamera />
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className={styles.hiddenInput} 
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />
                            </div>
                            <h2>{user?.name}</h2>
                            <span className={styles.badge}>
                                {user?.user_type === 'admin' ? (
                                    <><HiOutlineCheckBadge /> Administrador</>
                                ) : (
                                    'Utilizador'
                                )}
                            </span>
                        </div>

                        <div className={styles.miniStats}>
                            <div className={styles.statItem}>
                                <HiOutlineCalendar />
                                <div>
                                    <span>Membro desde</span>
                                    <p>{new Date(user?.created_at).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Edit Form */}
                <div className={styles.mainContent}>
                    <form className={styles.card} onSubmit={handleSubmit}>
                        <div className={styles.formSection}>
                            <h3><HiOutlineUser /> Informações Gerais</h3>
                            <div className={styles.inputGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Nome Completo</label>
                                    <div className={styles.inputWrapper}>
                                        <HiOutlineUser />
                                        <input 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>E-mail</label>
                                    <div className={styles.inputWrapper}>
                                        <HiOutlineEnvelope />
                                        <input 
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3><HiOutlineLockClosed /> Alterar Palavra-passe</h3>
                            <p className={styles.sectionDesc}>Deixa em branco se não pretenderes alterar.</p>
                            <div className={styles.inputGroup}>
                                <label>Palavra-passe Atual</label>
                                <div className={styles.inputWrapper}>
                                    <HiOutlineLockClosed />
                                    <input 
                                        name="currentPassword"
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        placeholder="Digite a senha atual"
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Nova Palavra-passe</label>
                                    <div className={styles.inputWrapper}>
                                        <HiOutlineLockClosed />
                                        <input 
                                            name="newPassword"
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            placeholder="Nova senha"
                                        />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Confirmar Nova Palavra-passe</label>
                                    <div className={styles.inputWrapper}>
                                        <HiOutlineLockClosed />
                                        <input 
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Confirme nova senha"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.footer}>
                            {error && <div className={styles.errorMsg}>{error}</div>}
                            {success && (
                                <div className={styles.successMsg}>
                                    <HiOutlineCheckCircle /> {success}
                                </div>
                            )}
                            <button type="submit" className={styles.saveBtn} disabled={saving}>
                                {saving ? 'A guardar...' : 'Guardar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
