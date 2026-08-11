import { useEffect, useState } from 'react';
import api from '../../services/api';
import './Orders.css';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');

    function loadOrders() {
        setLoading(true);
        api
            .get('/admin/orders', { params: { status: filter || undefined } })
            .then((res) => setOrders(res.data.orders))
            .catch(() => setError('Could not load orders.'))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadOrders();
    }, [filter]);

    async function handleStatusChange(id, status) {
        await api.put(`/admin/orders/${id}/status`, { status });
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }

    if (loading && orders.length === 0) return <div className="admin-orders__status">Loading…</div>;
    if (error) return <div className="admin-orders__status">{error}</div>;

    return (
        <div className="admin-orders">
            <h1>Orders</h1>

            <div className="admin-orders__filters">
                <button className={filter === '' ? 'is-active' : ''} onClick={() => setFilter('')}>
                    All
                </button>
                {statuses.map((s) => (
                    <button key={s} className={filter === s ? 'is-active' : ''} onClick={() => setFilter(s)}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="table-scroll">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>
                                    <div>{order.customer_name}</div>
                                    <div className="admin-orders__email">{order.customer_email}</div>
                                </td>
                                <td>Rs {Number(order.total_amount).toLocaleString('en-PK')}</td>
                                <td>{new Date(order.created_at).toLocaleDateString('en-PK')}</td>
                                <td>
                                    <select
                                        className={`admin-orders__select admin-orders__select--${order.status}`}
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    >
                                        {statuses.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {orders.length === 0 && !loading && <p className="admin-orders__empty">No orders found.</p>}
        </div>
    );
}
