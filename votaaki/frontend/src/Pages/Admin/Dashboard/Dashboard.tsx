import { 
    HiOutlineUsers, 
    HiOutlineChartBar, 
    HiOutlineBolt, 
    HiOutlineClock,
    HiOutlinePlusCircle,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineCheckBadge,
    HiOutlineArrowTrendingUp,
    HiOutlineCalendarDays
} from 'react-icons/hi2';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    Cell
} from 'recharts';
import { adminService } from '../../../Services/adminService';
import Loading from '../../../Components/Loading/Loading';
import styles from './Dashboard.module.css';
import { useState , useEffect} from 'react';
interface DashboardData {
    stats: {
        total_active_users: number;
        total_admins: number;
        total_polls: number;
        active_polls: number;
        closed_polls: number;
        users_online: number;
        votes_last_24h: number;
        votes_last_week: number;
    };
    topPolls: Array<{
        id_poll: number;
        title: string;
        total_votes: number;
    }>;
    recentActivity: Array<{
        id_log: number;
        table_name: string;
        action: string;
        user_name: string;
        created_at: string;
    }>;
    engagement: Array<{
        date: string;
        votes: number;
    }>;
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const statsResult = await adminService.getDashboardStats();
                
                // Map the votesByDay to engagement format for the chart
                const engagementData = (statsResult.votesByDay || []).map((item: unknown) => {
                    const typedItem = item as { week_day: string; total_votes: number };
                    return {
                        date: typedItem.week_day,
                        votes: typedItem.total_votes
                    };
                });

                setData({
                    ...statsResult,
                    engagement: engagementData
                });
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Failed to load dashboard metrics. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        
        // Refresh every 30 seconds for "live" feel
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) return <Loading texto="Initializing Command Center..." />;
    if (error) return <div className={styles.errorContainer}>{error}</div>;

    const stats = data?.stats;

    const getActionIcon = (type?: string) => {
        if (!type) return <HiOutlineBolt />;
        switch (type.toLowerCase()) {
            case 'insert': return <HiOutlinePlusCircle style={{ color: '#10b981' }} />;
            case 'update': return <HiOutlinePencilSquare style={{ color: '#f59e0b' }} />;
            case 'delete': return <HiOutlineTrash style={{ color: '#ef4444' }} />;
            default: return <HiOutlineBolt />;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Admin Dashboard</h1>
                    <p className={styles.subtitle}>System overview and real-time activity metrics</p>
                </div>
                <div className={styles.dateDisplay}>
                    <HiOutlineClock />
                    <span>Live Tracking Active</span>
                </div>
            </header>

            {/* Core KPIs */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.iconWrapper} ${styles.blue}`} style={{ background: '#e0e7ff', color: '#6366f1' }}>
                        <HiOutlineUsers />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Active Users</h3>
                        <div className={styles.statValue}>{stats?.total_active_users}</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.iconWrapper} ${styles.purple}`} style={{ background: '#f3e8ff', color: '#a855f7' }}>
                        <HiOutlineChartBar />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Active Polls</h3>
                        <div className={styles.statValue}>{stats?.active_polls}</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.iconWrapper} ${styles.green}`} style={{ background: '#dcfce7', color: '#22c55e' }}>
                        <HiOutlineCheckBadge />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Today's Votes</h3>
                        <div className={styles.statValue}>{stats?.votes_last_24h}</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.iconWrapper} ${styles.orange}`} style={{ background: '#ffedd5', color: '#f97316' }}>
                        <HiOutlineArrowTrendingUp />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Users Online</h3>
                        <div className={styles.statValue}>{stats?.users_online}</div>
                    </div>
                </div>
            </div>

            <div className={styles.mainLayout}>
                {/* Voting Analytics Chart */}
                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h2><HiOutlineCalendarDays /> Voting Trends (Last 7 Days)</h2>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data?.engagement}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="votes" 
                                    stroke="#6366f1" 
                                    strokeWidth={4} 
                                    dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Top Performing Polls (Bar Chart) */}
                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h2><HiOutlineChartBar /> Top Polls (By Volume)</h2>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data?.topPolls} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="title" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={100}
                                    tick={{ fill: '#1a1a2e', fontSize: 11, fontWeight: 600 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total_votes" radius={[0, 4, 4, 0]}>
                                    {data?.topPolls.map((_entry: unknown, index: number) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a855f7'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Live Activity Feed */}
                <aside className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h2><HiOutlineArrowTrendingUp /> Recent Activity</h2>
                    </div>
                    <div className={styles.activityList}>
                        {data?.recentActivity.map((log: unknown) => {
                            const typedLog = log as { id_log: number; action: string; user_name: string; table_name: string; created_at: string };
                            return (
                                <div key={typedLog.id_log} className={styles.activityItem}>
                                    <div className={styles.actionBadge}>
                                        {getActionIcon(typedLog.action)}
                                    </div>
                                    <div className={styles.activityContent}>
                                        <div className={styles.activityUser}>{typedLog.user_name}</div>
                                        <div className={styles.activityText}>
                                            {typedLog.action}d a {typedLog.table_name}
                                        </div>
                                    </div>
                                    <div className={styles.activityTime}>{formatTime(typedLog.created_at)}</div>
                                </div>
                            );
                        })}
                    </div>
                </aside>
            </div>
        </div>
    );
}
