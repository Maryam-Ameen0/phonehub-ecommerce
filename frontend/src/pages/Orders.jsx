import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import SpecChip from '../components/SpecChip';
import './Orders.css';

const statusTone = {
    pending: 'default',
    processing: 'refurbished',
    shipped: 'refurbished',
    delivered: 'new',
    cancelled: 'used'
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api
            .get('/orders')
            .then(({ data }) => setOrders(data.orders))
            .catch(() => setError('Could not load your orders.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="orders-page__status">Loading…</div>;
    if (error) return <div className="orders-page__status">{error}</div>;

    if (orders.length === 0) {
        return (
            <div className="orders-page orders-page--empty">
                <h1>No orders yet</h1>
                <p>Once you place an order, it'll show up here.</p>
                <Link to="/" className="orders-page__link">
                    Go to shop
                </Link>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <h1>Your Orders</h1>

            <div className="orders-list">
                {orders.map((order) => (
                    <Link to={`/orders/${order.id}`} className="order-row" key={order.id}>
                        <div>
                            <p className="order-row__id">Order #{order.id}</p>
                            <p className="order-row__date">
                                {new Date(order.created_at).toLocaleDateString('en-PK', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <SpecChip tone={statusTone[order.status] || 'default'}>{order.status}</SpecChip>
                        <p className="order-row__total">Rs {Number(order.total_amount).toLocaleString('en-PK')}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
