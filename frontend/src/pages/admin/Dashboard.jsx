import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import './Dashboard.css';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api
            .get('/admin/analytics')
            .then((res) => setData(res.data))
            .catch(() => setError('Could not load analytics.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="dashboard__status">Loading…</div>;
    if (error) return <div className="dashboard__status">{error}</div>;

    const { summary, revenueByDay, ordersByStatus, topProducts } = data;
    const chartData = revenueByDay.map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
    }));

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>

            <div className="dashboard__stats">
                <div className="stat-card">
                    <p className="stat-card__label">Total Revenue</p>
                    <p className="stat-card__value">Rs {summary.totalRevenue.toLocaleString('en-PK')}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-card__label">Total Orders</p>
                    <p className="stat-card__value">{summary.totalOrders}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-card__label">Customers</p>
                    <p className="stat-card__value">{summary.totalCustomers}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-card__label">Live Products</p>
                    <p className="stat-card__value">{summary.totalProducts}</p>
                </div>
                <div className="stat-card stat-card--alert">
                    <p className="stat-card__label">Pending Listings</p>
                    <p className="stat-card__value">{summary.pendingListings}</p>
                </div>
            </div>

            <div className="dashboard__panel">
                <h3>Revenue — last 14 days</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} width={70} />
                        <Tooltip formatter={(value) => [`Rs ${value.toLocaleString('en-PK')}`, 'Revenue']} />
                        <Line type="monotone" dataKey="revenue" stroke="#0058d3" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="dashboard__row">
                <div className="dashboard__panel">
                    <h3>Orders by status</h3>
                    <div className="status-breakdown">
                        {ordersByStatus.map((s) => (
                            <div className="status-breakdown__row" key={s.status}>
                                <span className={`status-dot status-dot--${s.status}`} />
                                <span className="status-breakdown__label">{s.status}</span>
                                <span className="status-breakdown__count">{s.count}</span>
                            </div>
                        ))}
                        {ordersByStatus.length === 0 && <p className="dashboard__empty">No orders yet.</p>}
                    </div>
                </div>

                <div className="dashboard__panel">
                    <h3>Top products</h3>
                    {topProducts.length === 0 ? (
                        <p className="dashboard__empty">No sales yet.</p>
                    ) : (
                        <table className="top-products-table">
                            <tbody>
                                {topProducts.map((p) => (
                                    <tr key={p.product_name}>
                                        <td>{p.product_name}</td>
                                        <td>{p.units_sold} sold</td>
                                        <td>Rs {Number(p.revenue).toLocaleString('en-PK')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
