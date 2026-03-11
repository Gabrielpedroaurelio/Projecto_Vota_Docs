import { useState, useEffect, useCallback } from 'react';
import {
    HiOutlineChartPie,
    HiOutlineArrowDownTray,
    HiOutlineFunnel,
    HiOutlineCalendar,
    HiOutlineChartBar,
    HiOutlineUsers,
    HiOutlineCheckCircle
} from 'react-icons/hi2';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminService } from '../../../Services/adminService';
import Loading from '../../../Components/Loading/Loading';
import styles from './Reports.module.css';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

interface DashboardStats {
    stats: {
        total_active_users: number;
        total_admins: number;
        total_polls: number;
        active_polls: number;
        closed_polls: number;
        users_online: number;
        votes_last_24h: number;
        votes_last_week: number;
        total_votes_overall: number;
    };
    topPolls: { id_poll: number; title: string; total_votes: number }[];
    votesByDay: { week_day: string; total_votes: number }[];
}

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [reportData, setReportData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [groupBy, setGroupBy] = useState('day');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [dashboardStats, report] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getVotingReport(startDate, endDate, groupBy)
            ]);
            setStats(dashboardStats);
            setReportData(report.report);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar dados dos relatórios');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, groupBy]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const exportToExcel = () => {
        if (!reportData.length) return;

        // Mapear os dados para português
        const dataInPortuguese = reportData.map(item => ({
            'Período': item.period,
            'Total de Votos': item.total_votes,
            'Utilizadores Únicos': item.unique_users,
            'Enquetes Votadas': item.voted_polls
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataInPortuguese);
        const workbook = XLSX.utils.book_new();

        // Ajustar largura das colunas para melhor visualização
        const colWidths = [
            { wch: 15 }, // Período
            { wch: 15 }, // Total de Votos
            { wch: 20 }, // Utilizadores Únicos
            { wch: 18 }  // Enquetes Votadas
        ];
        worksheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório de Votações");

        XLSX.writeFile(
            workbook,
            `votaaki_relatorio_${startDate}_${endDate}.xlsx`
        );
    };

    const exportToPDF = () => {
        if (!reportData.length) return;

        const doc = new jsPDF();

        // Configurar fonte e tamanhos
        doc.setFontSize(14);

        // Cabeçalho centralizado
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("República de Angola", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Relatório de Votações", pageWidth / 2, 40, { align: "center" });

        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text("VotaAki", pageWidth / 2, 30, { align: "center" });

        // Linha separadora
        doc.setLineWidth(0.5);
        doc.line(20, 45, pageWidth - 20, 45);

        // Informação do período centralizada
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(`Período: ${startDate} até ${endDate}`, pageWidth / 2, 52, { align: "center" });

        // Tabela
        const tableData = reportData.map(d => [
            d.period,
            d.total_votes,
            d.unique_users,
            d.voted_polls
        ]);

        autoTable(doc, {
            startY: 60, // Ajustado para dar espaço ao cabeçalho
            head: [["Período", "Total Votos", "Utilizadores Únicos", "Enquetes Votadas"]],
            body: tableData,
            headStyles: {
                fillColor: [99, 102, 241], // Cor #6366f1 em RGB
                textColor: [255, 255, 255],
                fontSize: 11,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            margin: { top: 60 },
            styles: {
                fontSize: 10,
                cellPadding: 5,
                lineColor: [226, 232, 240],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { cellWidth: 'auto' }, // Período
                1: { cellWidth: 40, halign: 'center' }, // Total Votos
                2: { cellWidth: 45, halign: 'center' }, // Utilizadores Únicos
                3: { cellWidth: 45, halign: 'center' } // Enquetes Votadas
            }
        });

        // Rodapé com data de geração
        const today = new Date().toLocaleDateString('pt-PT');
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text(`Documento gerado em: ${today}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

        doc.save(`votaaki_relatorio_${startDate}_${endDate}.pdf`);
    };

    if (loading && !stats) return <div className={styles.loadingWrapper}><Loading /></div>;

    const pollStatusData = [
        { name: 'Ativas', value: stats?.stats?.active_polls || 0 },
        { name: 'Encerradas', value: stats?.stats?.closed_polls || 0 }
    ];

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1><HiOutlineChartPie /> Estatísticas e Relatórios</h1>
                    <p>Análise detalhada do engajamento e desempenho do sistema.</p>
                </div>
                <div>
                    <button className={styles.exportBtn} onClick={exportToPDF}>
                        <HiOutlineArrowDownTray /> PDF
                    </button>

                    <button className={styles.exportBtn} onClick={exportToExcel}>
                        <HiOutlineArrowDownTray /> Excel
                    </button>
                </div>
            </header>

            <div className={styles.filtersBar}>
                <div className={styles.filterGroup}>
                    <label><HiOutlineCalendar /> Periodo:</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span>até</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className={styles.filterGroup}>
                    <label><HiOutlineFunnel /> Agrupar por:</label>
                    <select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
                        <option value="day">Dia</option>
                        <option value="week">Semana</option>
                        <option value="month">Mês</option>
                    </select>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={`${styles.kpiIcon} ${styles.blue}`}>
                        <HiOutlineUsers />
                    </div>
                    <div className={styles.kpiInfo}>
                        <span>Utilizadores Ativos</span>
                        <h3>{stats?.stats?.total_active_users}</h3>
                    </div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={`${styles.kpiIcon} ${styles.purple}`}>
                        <HiOutlineChartBar />
                    </div>
                    <div className={styles.kpiInfo}>
                        <span>Total de Enquetes</span>
                        <h3>{stats?.stats?.total_polls}</h3>
                    </div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={`${styles.kpiIcon} ${styles.pink}`}>
                        <HiOutlineCheckCircle />
                    </div>
                    <div className={styles.kpiInfo}>
                        <span>Total de Votos</span>
                        <h3>{stats?.stats?.total_votes_overall}</h3>
                    </div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={`${styles.kpiIcon} ${styles.orange}`}>
                        <HiOutlineUsers />
                    </div>
                    <div className={styles.kpiInfo}>
                        <span>Votos (24h)</span>
                        <h3>{stats?.stats?.votes_last_24h}</h3>
                    </div>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                {/* 1. Votos por Período */}
                <div className={`${styles.chartCard} ${styles.full}`}>
                    <h3>Fluxo de Votação por Período</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={reportData}>
                                <defs>
                                    <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="total_votes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVotes)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Top Enquetes */}
                <div className={styles.chartCard}>
                    <h3>Top 5 Enquetes (Líderes de Engajamento)</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats?.topPolls} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="title" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="total_votes" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                    {stats?.topPolls?.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Status das Enquetes */}
                <div className={styles.chartCard}>
                    <h3>Distribuição por Status</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pollStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pollStatusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Atividade por Dia da Semana */}
                <div className={`${styles.chartCard} ${styles.full}`}>
                    <h3>Distribuição de Votos por Dia da Semana</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats?.votesByDay}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="week_day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="total_votes" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {error && <div className={styles.errorToast}>{error}</div>}
        </div>
    );
}
