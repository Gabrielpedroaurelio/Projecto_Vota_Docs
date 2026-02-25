import { useState, useEffect, useCallback } from 'react';
import { 
    HiOutlineTicket, 
    HiOutlinePlus, 
    HiOutlineMagnifyingGlass, 
    HiOutlineFunnel,
    HiOutlineTrash,
    HiOutlinePencilSquare,
    HiOutlineChartBar,
    HiOutlineClock,
    HiOutlineXMark
} from 'react-icons/hi2';
import { adminService } from '../../../Services/adminService';
import type { Poll, PollOption } from '../../../@types/types';
import Loading from '../../../Components/Loading/Loading';
import styles from './Polls.module.css';

interface DetailedOption extends PollOption {
    poll_title: string;
    id_poll: number;
}

export default function Polls() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'active' as 'active' | 'closed'
    });
    const [options, setOptions] = useState<{ id_option?: number; designation: string; description: string }[]>([
        { designation: '', description: '' },
        { designation: '', description: '' }
    ]);

    // Reuse Modal State
    const [allExistingOptions, setAllExistingOptions] = useState<DetailedOption[]>([]);
    const [isReuseModalOpen, setIsReuseModalOpen] = useState(false);
    const [reuseSearch, setReuseSearch] = useState('');

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchPolls = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminService.getPolls();
            setPolls(Array.isArray(data) ? data : []);
            
            // Also fetch all options for the reuse list
            const optionsData = await adminService.getOptions();
            setAllExistingOptions(Array.isArray(optionsData) ? optionsData : []);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPolls();
    }, [fetchPolls]);

    const handleOpenModal = (mode: 'create' | 'edit', poll: Poll | null = null) => {
        setModalMode(mode);
        setSelectedPoll(poll);
        if (poll && mode === 'edit') {
            setFormData({
                title: poll.title,
                description: poll.description || '',
                start_date: poll.start_date.split('T')[0],
                end_date: poll.end_date ? poll.end_date.split('T')[0] : '',
                status: poll.status
            });
            setOptions(poll.options?.map(o => ({ 
                id_option: o.id_option,
                designation: o.designation, 
                description: o.description || '' 
            })) || []);
        } else {
            setFormData({
                title: '',
                description: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                status: 'active'
            });
            setOptions([
                { designation: '', description: '' },
                { designation: '', description: '' }
            ]);
        }
        setIsModalOpen(true);
    };

    const handleAddOption = () => {
        setOptions([...options, { designation: '', description: '' }]);
    };

    const handleReuseOption = (opt: DetailedOption) => {
        if (options.some(o => o.id_option === opt.id_option)) {
            alert('Esta opção já foi adicionada.');
            return;
        }

        setOptions([...options, { 
            id_option: opt.id_option, 
            designation: opt.designation, 
            description: opt.description || '' 
        }]);
        setIsReuseModalOpen(false);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) {
            alert('Uma enquete deve ter no mínimo duas opções.');
            return;
        }
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleOptionChange = (index: number, field: 'designation' | 'description', value: string) => {
        const newOptions = [...options];
        newOptions[index][field] = value;
        setOptions(newOptions);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validOptions = options.filter(opt => opt.designation.trim() !== '');
        if (validOptions.length < 2) {
            alert('Erro: A enquete deve ter pelo menos duas opções preenchidas.');
            return;
        }

        setFormLoading(true);
        try {
            const payload = { ...formData, options: validOptions };
            if (modalMode === 'create') {
                await adminService.createPoll(payload);
                alert('Enquete criada com sucesso!');
            } else if (selectedPoll) {
                await adminService.updatePoll(selectedPoll.id_poll, payload);
                alert('Enquete atualizada com sucesso!');
            }
            setIsModalOpen(false);
            fetchPolls();
        } catch (err: any) {
            alert(err.message || 'Erro ao processar enquete');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeletePoll = async (poll: Poll) => {
        if (!confirm(`Tem certeza que deseja excluir a enquete "${poll.title}"?`)) return;
        try {
            await adminService.deletePoll(poll.id_poll);
            fetchPolls();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const formatDate = (date: string) => {
        if (!date) return '---';
        return new Date(date).toLocaleDateString('pt-PT');
    };

    const filteredPolls = polls.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredReuseOptions = allExistingOptions.filter(opt => 
        opt.designation.toLowerCase().includes(reuseSearch.toLowerCase()) ||
        opt.poll_title.toLowerCase().includes(reuseSearch.toLowerCase())
    );

    return (
        <div className={styles.pageWrapper}>
            <main className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1><HiOutlineTicket /> Gestão de Enquetes</h1>
                        <p>Crie e monitore o desempenho das votações.</p>
                    </div>
                    <button className={styles.addBtn} onClick={() => handleOpenModal('create')}>
                        <HiOutlinePlus /> Nova Enquete
                    </button>
                </header>

                <div className={styles.filtersBar}>
                    <div className={styles.searchBox}>
                        <HiOutlineMagnifyingGlass />
                        <input 
                            type="text" 
                            placeholder="Buscar enquetes..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <HiOutlineFunnel />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Todos os Status</option>
                            <option value="active">Ativas</option>
                            <option value="closed">Encerradas</option>
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
                                    <th>Enquete</th>
                                    <th>Status</th>
                                    <th>Votos</th>
                                    <th>Início</th>
                                    <th>Término</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPolls.map(p => (
                                    <tr key={p.id_poll}>
                                        <td>
                                            <div className={styles.pollInfo}>
                                                <span className={styles.pollTitle}>{p.title}</span>
                                                <span className={styles.pollCreator}>Por: {p.creator}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[p.status]}`}>
                                                {p.status === 'active' ? 'Ativa' : 'Encerrada'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.voteStats}>
                                                <HiOutlineChartBar /> {p.total_votes}
                                            </div>
                                        </td>
                                        <td><HiOutlineClock /> {formatDate(p.start_date)}</td>
                                        <td><HiOutlineClock /> {formatDate(p.end_date || '')}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.actionBtn} title="Editar" onClick={() => handleOpenModal('edit', p)}>
                                                    <HiOutlinePencilSquare />
                                                </button>
                                                <button className={`${styles.actionBtn} ${styles.delete}`} title="Excluir" onClick={() => handleDeletePoll(p)}>
                                                    <HiOutlineTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{modalMode === 'create' ? 'Nova Enquete' : 'Editar Enquete'}</h2>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><HiOutlineXMark /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className={styles.modalForm}>
                            <div className={styles.formSection}>
                                <div className={styles.formGroup}>
                                    <label>Título da Enquete</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        placeholder="Ex: Qual o melhor framework?"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Descrição (Opcional)</label>
                                    <textarea 
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        placeholder="Contexto sobre a votação..."
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Data de Início</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={formData.start_date}
                                            onChange={e => setFormData({...formData, start_date: e.target.value})}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Data de Término</label>
                                        <input 
                                            type="date" 
                                            value={formData.end_date}
                                            onChange={e => setFormData({...formData, end_date: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.optionsSection}>
                                <div className={styles.optionsHeader}>
                                    <h3>Opções de Voto</h3>
                                    <div className={styles.optionsActions}>
                                        <button type="button" className={styles.reuseBtn} onClick={() => setIsReuseModalOpen(true)}>
                                            <HiOutlineMagnifyingGlass /> Pesquisar Existentes
                                        </button>
                                        <button type="button" className={styles.addOptionBtn} onClick={handleAddOption}>
                                            <HiOutlinePlus /> Adicionar Nova
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.optionsList}>
                                    {options.map((opt, index) => (
                                        <div key={index} className={`${styles.optionItem} ${opt.id_option ? styles.reused : ''}`}>
                                            <div className={styles.optionInputs}>
                                                <input 
                                                    type="text" 
                                                    placeholder={`Opção ${index + 1}`} 
                                                    value={opt.designation}
                                                    required
                                                    readOnly={!!opt.id_option}
                                                    onChange={e => handleOptionChange(index, 'designation', e.target.value)}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Breve descrição" 
                                                    value={opt.description}
                                                    readOnly={!!opt.id_option}
                                                    onChange={e => handleOptionChange(index, 'description', e.target.value)}
                                                />
                                            </div>
                                            <div className={styles.optionActions}>
                                                {opt.id_option && <span className={styles.reuseBadge}>Reutilizada</span>}
                                                <button type="button" className={styles.removeOptionBtn} onClick={() => handleRemoveOption(index)}>
                                                    <HiOutlineTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles.submitBtn} disabled={formLoading}>
                                    {formLoading ? 'Gravando...' : (modalMode === 'create' ? 'Publicar Enquete' : 'Guardar Alterações')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isReuseModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsReuseModalOpen(false)}>
                    <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Reutilizar Opção de Voto</h2>
                            <button className={styles.closeBtn} onClick={() => setIsReuseModalOpen(false)}><HiOutlineXMark /></button>
                        </div>
                        <div className={styles.reuseContent}>
                            <div className={styles.reuseSearch}>
                                <HiOutlineMagnifyingGlass />
                                <input 
                                    type="text" 
                                    placeholder="Pesquisar por nome ou enquete original..." 
                                    value={reuseSearch}
                                    onChange={e => setReuseSearch(e.target.value)}
                                />
                            </div>
                            <div className={styles.reuseList}>
                                {filteredReuseOptions.length > 0 ? (
                                    filteredReuseOptions.map(opt => (
                                        <div key={opt.id_option} className={styles.reuseItem} onClick={() => handleReuseOption(opt)}>
                                            <div className={styles.reuseInfo}>
                                                <div className={styles.reuseName}>{opt.designation}</div>
                                                <div className={styles.reusePoll}>Original: {opt.poll_title}</div>
                                            </div>
                                            <button className={styles.selectBtn}><HiOutlinePlus /> Selecionar</button>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptySearch}>Nenhuma opção encontrada.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
