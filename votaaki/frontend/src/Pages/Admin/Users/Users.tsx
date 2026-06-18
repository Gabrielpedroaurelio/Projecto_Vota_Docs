import { useState, useEffect, useCallback } from 'react';
import {
    HiOutlineUsers,
    HiOutlineMagnifyingGlass,
    HiOutlineFunnel,
    HiOutlineTrash,
    HiOutlinePencilSquare,
    HiOutlineShieldCheck,
    HiOutlineNoSymbol,
    HiOutlinePlus
} from 'react-icons/hi2';
import { adminService } from '../../../Services/adminService';
import Loading from '../../../Components/Loading/Loading';
import styles from './Users.module.css';

import type { User } from '../../../@types/types';

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        user_type: 'user',
        status: 'active'
    });

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminService.getUsers(search, statusFilter);
            setUsers(Array.isArray(data) ? data : []);
        } catch (err: unknown) {
            console.error('Failed to fetch users:', err);
            const errorObj = err as Error;
            setError(errorObj.message || 'Não foi possível carregar a lista de usuários.');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // Small debounce for search
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleOpenModal = (mode: 'create' | 'edit', user: User | null = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        if (user && mode === 'edit') {
            setFormData({
                name: user.name,
                email: user.email,
                password: '', 
                user_type: user.user_type,
                status: user.status
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                user_type: 'user',
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (modalMode === 'create') {
                await adminService.createUser(formData);
                alert('Utilizador criado com sucesso!');
            } else if (selectedUser) {
                // Admin can only change status and user_type
                const payload = {
                    user_type: formData.user_type,
                    status: formData.status
                };

                await adminService.updateUser(selectedUser.id_user, payload);
                alert('Cargo e status atualizados com sucesso!');
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err: unknown) {
            const errorObj = err as Error;
            alert(errorObj.message || 'Erro ao processar solicitação.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleStatus = async (user: User) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        if (!confirm(`Deseja alterar o status de ${user.name} para ${newStatus === 'active' ? 'Ativo' : 'Inativo'}?`)) return;

        try {
            await adminService.updateUser(user.id_user, { status: newStatus });
            fetchUsers(); // Refresh list
        } catch {
            alert('Erro ao atualizar status do usuário.');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className={styles.pageWrapper}>
            <main className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1><HiOutlineUsers /> Gestão de Utilizadores</h1>
                        <p>Controle de cargos, permissões e status das contas.</p>
                    </div>
                    <button className={styles.addBtn} onClick={() => handleOpenModal('create')}>
                        <HiOutlinePlus /> Novo Utilizador
                    </button>
                </header>

                <div className={styles.filtersBar}>
                    <div className={styles.searchBox}>
                        <HiOutlineMagnifyingGlass />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); }}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <HiOutlineFunnel />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); }}
                        >
                            <option value="all">Todos os Status</option>
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                            <option value="banned">Banido</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingWrapper}>
                        <Loading />
                        <p>A carregar utilizadores...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorState}>
                        <p>{error}</p>
                        <button onClick={() => fetchUsers()} className={styles.retryBtn}>Tentar Novamente</button>
                    </div>
                ) : (
                    <div className={styles.tableCard}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Utilizador</th>
                                    <th>Cargo</th>
                                    <th>Status</th>
                                    <th>Data de Criação</th>
                                    <th>Último Acesso</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map((u) => (
                                    <tr key={u.id_user}>
                                        <td>
                                            <div className={styles.userInfo}>
                                                <div className={styles.avatar}>
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div className={styles.userText}>
                                                    <span className={styles.userName}>{u.name}</span>
                                                    <span className={styles.userEmail}>{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${u.user_type === 'admin' ? styles.admin : styles.user}`}>
                                                {u.user_type === 'admin' ? 'Admin' : 'Utilizador'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusDot} ${styles[u.status]}`}>
                                                {u.status === 'active' ? 'Ativo' : u.status === 'inactive' ? 'Inativo' : 'Banido'}
                                            </span>
                                        </td>
                                        <td>{formatDate(u.created_at)}</td>
                                        <td>{u.last_login ? formatDate(u.last_login) : 'Nunca'}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    onClick={() => handleToggleStatus(u)}
                                                    className={styles.actionBtn}
                                                    title={u.status === 'active' ? 'Desativar' : 'Ativar'}
                                                >
                                                    {u.status === 'active' ? <HiOutlineNoSymbol /> : <HiOutlineShieldCheck />}
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal('edit', u)}
                                                    className={styles.actionBtn}
                                                    title="Mudar Cargo/Status"
                                                >
                                                    <HiOutlinePencilSquare />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className={styles.emptyTable}>
                                            Nenhum utilizador encontrado com estes filtros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* User Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{modalMode === 'create' ? 'Novo Utilizador' : 'Gestão de Cargo e Status'}</h2>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleFormSubmit} className={styles.modalForm}>
                            {modalMode === 'edit' && selectedUser && (
                                <div className={styles.userEditPreview}>
                                    <div className={styles.avatarSmall}>{selectedUser.name.charAt(0)}</div>
                                    <div>
                                        <strong>{selectedUser.name}</strong>
                                        <p>{selectedUser.email}</p>
                                    </div>
                                </div>
                            )}

                            {modalMode === 'create' && (
                                <>
                                    <div className={styles.formGroup}>
                                        <label>Nome Completo</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ex: João Silva"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="joao@votaaki.pt"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Palavra-passe</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="******"
                                        />
                                    </div>
                                </>
                            )}

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Tipo de Conta (Cargo)</label>
                                    <select
                                        value={formData.user_type}
                                        onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                                    >
                                        <option value="user">Utilizador Comum</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Status da Conta</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="active">Ativo</option>
                                        <option value="inactive">Inativo</option>
                                        <option value="banned">Banido</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={formLoading}
                                >
                                    {formLoading ? 'A processar...' : (modalMode === 'create' ? 'Criar Utilizador' : 'Guardar Alterações')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
