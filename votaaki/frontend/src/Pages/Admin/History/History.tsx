import { useState, useEffect, useCallback } from 'react';
import { 
    HiOutlineShieldCheck, 
    HiOutlineClock, 
    HiOutlineFunnel, 
    HiOutlineArrowDownTray,
    HiOutlineUser,
    HiOutlineDevicePhoneMobile,
    HiOutlineGlobeAlt,
    HiOutlineExclamationCircle,
    HiOutlineMagnifyingGlass,
    HiOutlineXMark,
    HiOutlineDocumentMagnifyingGlass
} from 'react-icons/hi2';
import { adminService } from '../../../Services/adminService';
import Loading from '../../../Components/Loading/Loading';
import styles from './History.module.css';

type Tab = 'logins' | 'activities';

export default function History() {
    const [activeTab, setActiveTab] = useState<Tab>('logins');
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [filters, setFilters] = useState({
        userId: '',
        startDate: '',
        endDate: '',
        action: '',
        tableName: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = activeTab === 'logins' 
                ? await adminService.getLoginLogs(filters)
                : await adminService.getActivityLogs(filters);
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        // Fetch users for the filter dropdown
        const fetchUsers = async () => {
            try {
                const data = await adminService.getUsers();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const exportToCSV = () => {
        if (logs.length === 0) return;

        const headers = activeTab === 'logins'
            ? ['Utilizador', 'E-mail', 'IP', 'Dispositivo', 'Navegador', 'Login', 'Logout']
            : ['Utilizador', 'Tabela', 'ID Registo', 'Acção', 'Data'];

        const csvContent = [
            headers.join(','),
            ...logs.map(log => {
                if (activeTab === 'logins') {
                    return [
                        log.user_name,
                        log.user_email,
                        log.ip_address,
                        log.device_info,
                        `"${log.browser_info?.substring(0, 50)}..."`,
                        new Date(log.login_time).toLocaleString(),
                        log.logout_time ? new Date(log.logout_time).toLocaleString() : 'Sessão Activa'
                    ].join(',');
                } else {
                    return [
                        log.user_name,
                        log.table_name,
                        log.row_id,
                        log.action,
                        new Date(log.created_at).toLocaleString()
                    ].join(',');
                }
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `historico_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatData = (data: any) => {
        if (!data) return 'Nenhum dado';
        if (typeof data === 'object') return JSON.stringify(data, null, 2);
        try {
            // If it's a string, try to parse it (in case it's a JSON string)
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            // If parsing fails, return as is
            return String(data);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Histórico do Sistema</h1>
                    <p>Monitorização de acessos e modificações de dados.</p>
                </div>
                <button className={styles.exportBtn} onClick={exportToCSV} disabled={logs.length === 0}>
                    <HiOutlineArrowDownTray /> Exportar Relatório
                </button>
            </header>

            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'logins' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('logins')}
                >
                    <HiOutlineShieldCheck /> Histórico de Acessos
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'activities' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('activities')}
                >
                    <HiOutlineClock /> Actividade do Sistema
                </button>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label><HiOutlineUser /> Utilizador</label>
                    <select name="userId" value={filters.userId} onChange={handleFilterChange}>
                        <option value="">Todos os Utilizadores</option>
                        {users.map(u => (
                            <option key={u.id_user} value={u.id_user}>{u.name}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <label><HiOutlineClock /> Data Início</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                </div>
                <div className={styles.filterGroup}>
                    <label><HiOutlineClock /> Data Fim</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                </div>
                {activeTab === 'activities' && (
                    <>
                        <div className={styles.filterGroup}>
                            <label><HiOutlineMagnifyingGlass /> Tabela</label>
                            <input 
                                placeholder="Ex: Poll, User" 
                                name="tableName" 
                                value={filters.tableName} 
                                onChange={handleFilterChange} 
                            />
                        </div>
                        <div className={styles.filterGroup}>
                            <label><HiOutlineFunnel /> Acção</label>
                            <select name="action" value={filters.action} onChange={handleFilterChange}>
                                <option value="">Todas</option>
                                <option value="Insert">Inserção</option>
                                <option value="Update">Actualização</option>
                                <option value="Delete">Eliminação</option>
                            </select>
                        </div>
                    </>
                )}
            </div>

            <div className={styles.tableCard}>
                {loading ? (
                    <div className={styles.tableLoader}><Loading /></div>
                ) : logs.length === 0 ? (
                    <div className={styles.emptyState}>
                        <HiOutlineExclamationCircle />
                        <p>Nenhum registo encontrado para os filtros seleccionados.</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            {activeTab === 'logins' ? (
                                <tr>
                                    <th>Utilizador</th>
                                    <th>IP / Localização</th>
                                    <th>Dispositivo / Browser</th>
                                    <th>Login / Logout</th>
                                    <th>Estado</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>Utilizador</th>
                                    <th>Acção</th>
                                    <th>Tabela / Registo</th>
                                    <th>Data / Hora</th>
                                    <th>Detalhes</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {logs.map((log, idx) => (
                                <tr key={idx}>
                                    {activeTab === 'logins' ? (
                                        <>
                                            <td>
                                                <div className={styles.userInfo}>
                                                    <strong>{log.user_name}</strong>
                                                    <span>{log.user_email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.ipInfo}>
                                                    <HiOutlineGlobeAlt /> {log.ip_address}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.deviceInfo}>
                                                    <HiOutlineDevicePhoneMobile /> {log.device_info}
                                                    <small>{log.browser_info?.substring(0, 30)}...</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.timeInfo}>
                                                    <span>In: {new Date(log.login_time).toLocaleString()}</span>
                                                    {log.logout_time && <small>Out: {new Date(log.logout_time).toLocaleString()}</small>}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${log.logout_time ? styles.offline : styles.online}`}>
                                                    {log.logout_time ? 'Terminado' : 'Activo'}
                                                </span>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td><strong>{log.user_name}</strong></td>
                                            <td>
                                                <span className={`${styles.actionBadge} ${log.action ? styles[log.action.toLowerCase()] : ''}`}>
                                                    {log.action || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.tableInfo}>
                                                    <span>{log.table_name}</span>
                                                    <small>ID: {log.row_id}</small>
                                                </div>
                                            </td>
                                            <td>{new Date(log.created_at).toLocaleString()}</td>
                                            <td>
                                                <button 
                                                    className={styles.viewDataBtn}
                                                    onClick={() => setSelectedLog(log)}
                                                >
                                                    Ver Dados
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedLog && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <header className={styles.modalHeader}>
                            <div className={styles.modalTitle}>
                                <HiOutlineDocumentMagnifyingGlass />
                                <div>
                                    <h3>Detalhes da Actividade</h3>
                                    <span>#{selectedLog.id_log} - {selectedLog.action} em {selectedLog.table_name}</span>
                                </div>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setSelectedLog(null)}>
                                <HiOutlineXMark />
                            </button>
                        </header>

                        <div className={styles.modalContent}>
                            <div className={styles.dataGrid}>
                                <div className={styles.dataSection}>
                                    <h4><span className={styles.dotOld}></span> Dados Anteriores</h4>
                                    <pre>{formatData(selectedLog.old_data)}</pre>
                                </div>
                                <div className={styles.dataSection}>
                                    <h4><span className={styles.dotNew}></span> Novos Dados</h4>
                                    <pre>{formatData(selectedLog.new_data)}</pre>
                                </div>
                            </div>
                        </div>

                        <footer className={styles.modalFooter}>
                            <div className={styles.metaInfo}>
                                <span><strong>Realizado por:</strong> {selectedLog.user_name}</span>
                                <span><strong>Data:</strong> {new Date(selectedLog.created_at).toLocaleString()}</span>
                            </div>
                            <button className={styles.primaryBtn} onClick={() => setSelectedLog(null)}>Fechar</button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
