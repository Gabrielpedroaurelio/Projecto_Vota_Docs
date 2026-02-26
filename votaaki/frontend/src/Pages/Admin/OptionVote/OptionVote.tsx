import { useState, useEffect, useCallback } from 'react';
import { 
    HiOutlineListBullet, 
    HiOutlineMagnifyingGlass, 
    HiOutlineFunnel,
    HiOutlineTrash,
    HiOutlinePencilSquare,
    HiOutlineChatBubbleLeftEllipsis,
    HiOutlineCheckCircle,
    HiOutlineXMark
} from 'react-icons/hi2';
import { adminService } from '../../../Services/adminService';
import type { PollOption } from '../../../@types/types';
import Loading from '../../../Components/Loading/Loading';
import styles from './OptionVote.module.css';

interface DetailedOption extends PollOption {
    poll_title: string;
    id_poll: number;
}

export default function OptionVote() {
    const [options, setOptions] = useState<DetailedOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<DetailedOption | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        designation: '',
        description: ''
    });

    // Filters
    const [search, setSearch] = useState('');
    const [pollFilter, setPollFilter] = useState('all');

    const fetchOptions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminService.getOptions();
            setOptions(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar opções de voto');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    const handleOpenModal = (option: DetailedOption) => {
        setSelectedOption(option);
        setFormData({
            designation: option.designation,
            description: option.description || ''
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOption) return;

        setFormLoading(true);
        try {
            await adminService.updateOption(selectedOption.id_option, formData);
            alert('Opção atualizada com sucesso!');
            setIsModalOpen(false);
            fetchOptions();
        } catch (err: any) {
            alert(err.message || 'Erro ao atualizar opção');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteOption = async (option: DetailedOption) => {
        if (!confirm(`Tem certeza que deseja excluir a opção "${option.designation}"?\nIsso removerá todos os votos associados a esta opção!`)) return;
        
        try {
            await adminService.deleteOption(option.id_option);
            fetchOptions();
        } catch (err: any) {
            alert(err.message || 'Erro ao excluir opção');
        }
    };

    const filteredOptions = options.filter(opt => {
        const matchesSearch = opt.designation.toLowerCase().includes(search.toLowerCase()) || 
                             opt.poll_title.toLowerCase().includes(search.toLowerCase());
        const matchesPoll = pollFilter === 'all' || opt.poll_title === pollFilter;
        return matchesSearch && matchesPoll;
    });

    // Get unique poll titles for the filter
    const pollTitles = Array.from(new Set(options.map(opt => opt.poll_title)));

    return (
        <div className={styles.pageWrapper}>
            <main className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1><HiOutlineListBullet /> Opções de Voto</h1>
                        <p>Gerencie as alternativas de voto de todas as enquetes.</p>
                    </div>
                </header>

                <div className={styles.filtersBar}>
                    <div className={styles.searchBox}>
                        <HiOutlineMagnifyingGlass />
                        <input 
                            type="text" 
                            placeholder="Buscar por opção ou enquete..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <HiOutlineFunnel />
                        <select value={pollFilter} onChange={(e) => setPollFilter(e.target.value)}>
                            <option value="all">Todas as Enquetes</option>
                            {pollTitles.map(title => (
                                <option key={title} value={title}>{title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingWrapper}><Loading /></div>
                ) : (
                    <div className={styles.tableCard}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Designação</th>
                                    <th>Enquete Associada</th>
                                    <th>Votos Totais</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOptions.map(opt => (
                                    <tr key={opt.id_option}>
                                        <td>
                                            <div className={styles.optionInfo}>
                                                <span className={styles.optionName}>{opt.designation}</span>
                                                <span className={styles.optionDesc}>
                                                    <HiOutlineChatBubbleLeftEllipsis /> {opt.description || 'Sem descrição'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.pollBadge}>
                                                {opt.poll_title}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.voteCount}>
                                                <HiOutlineCheckCircle /> {opt.total_votes || 0}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button 
                                                    className={styles.actionBtn} 
                                                    title="Editar"
                                                    onClick={() => handleOpenModal(opt)}
                                                >
                                                    <HiOutlinePencilSquare />
                                                </button>
                                                <button 
                                                    className={`${styles.actionBtn} ${styles.delete}`} 
                                                    title="Excluir"
                                                    onClick={() => handleDeleteOption(opt)}
                                                >
                                                    <HiOutlineTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOptions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className={styles.emptyRow}>Nenhuma opção encontrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Editar Opção</h2>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><HiOutlineXMark /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label>Designação</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.designation}
                                    onChange={e => setFormData({...formData, designation: e.target.value})}
                                    placeholder="Ex: Sim, Não, Talvez..."
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Descrição (Opcional)</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="Explicação da opção..."
                                    rows={4}
                                />
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles.submitBtn} disabled={formLoading}>
                                    {formLoading ? 'Gravando...' : 'Guardar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
