import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import SpecChip from '../components/SpecChip';
import './OrderDetail.css';

const statusTone = {
    pending: 'default',
    processing: 'refurbished',
    shipped: 'refurbished',
    delivered: 'new',
    cancelled: 'used'
};

export default function OrderDetail() {
    const { id } = useParams();
    const location = useLocation();
    const justPlaced = location.state?.justPlaced;

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api
            .get(`/orders/${id}`)
            .then(({ data }) => {
                setOrder(data.order);
                setItems(data.items);
            })
            .catch(() => setError('This order could not be found.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="order-detail__status">Loading…</div>;
    if (error) return <div className="order-detail__status">{error}</div>;
    if (!order) return null;

    return (
        <div className="order-detail">
            <Link to="/orders" className="order-detail__back">
                ← Back to orders
            </Link>

            {justPlaced && <div className="order-detail__success">🎉 Your order has been placed!</div>}

            <div className="order-detail__header">
                <div>
                    <h1>Order #{order.id}</h1>
                    <p className="order-detail__date">
                        Placed on{' '}
                        {new Date(order.created_at).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <SpecChip tone={statusTone[order.status] || 'default'}>{order.status}</SpecChip>
            </div>

            <div className="order-detail__card">
                <h3>Shipping details</h3>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_phone}</p>
                <p className="order-detail__payment">Payment: {order.payment_method}</p>
            </div>

            <div className="order-detail__card">
                <h3>Items</h3>
                {items.map((item) => (
                    <div className="order-detail__item" key={item.id}>
                        <div>
                            <p className="order-detail__item-name">{item.product_name}</p>
                            <p className="order-detail__item-qty">Qty: {item.quantity}</p>
                        </div>
                        <p className="order-detail__item-price">
                            Rs {(Number(item.price) * item.quantity).toLocaleString('en-PK')}
                        </p>
                    </div>
                ))}
                <div className="order-detail__total">
                    <span>Total</span>
                    <span>Rs {Number(order.total_amount).toLocaleString('en-PK')}</span>
                </div>
            </div>
        </div>
    );
}
