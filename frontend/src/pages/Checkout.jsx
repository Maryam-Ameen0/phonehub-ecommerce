import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import PlaceholderImage from '../components/PlaceholderImage';
import { resolveImageUrl } from '../utils/resolveImageUrl';
import './Checkout.css';

export default function Checkout() {
    const { items, total, refreshCart } = useCart();
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingPhone, setShippingPhone] = useState('');
    const [error, setError] = useState('');
    const [placing, setPlacing] = useState(false);

    async function handlePlaceOrder(e) {
        e.preventDefault();
        setError('');
        setPlacing(true);

        try {
            const { data } = await api.post('/orders', { shippingAddress, shippingPhone });
            await refreshCart();
            navigate(`/orders/${data.orderId}`, { state: { justPlaced: true } });
        } catch (err) {
            setError(err.response?.data?.message || 'Could not place your order. Please try again.');
        } finally {
            setPlacing(false);
        }
    }

    if (items.length === 0) {
        return (
            <div className="checkout-page checkout-page--empty">
                <h1>Your cart is empty</h1>
                <p>Add something to your cart before checking out.</p>
                <Link to="/" className="checkout-page__link">
                    Go to shop
                </Link>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>

            <div className="checkout-page__layout">
                <form className="checkout-form" onSubmit={handlePlaceOrder}>
                    <h3>Shipping details</h3>

                    {error && <div className="checkout-form__error">{error}</div>}

                    <div className="checkout-form__field">
                        <label htmlFor="address">Delivery address</label>
                        <textarea
                            id="address"
                            required
                            rows={3}
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="House, street, city"
                        />
                    </div>

                    <div className="checkout-form__field">
                        <label htmlFor="phone">Phone number</label>
                        <input
                            id="phone"
                            type="tel"
                            required
                            value={shippingPhone}
                            onChange={(e) => setShippingPhone(e.target.value)}
                            placeholder="03XXXXXXXXX"
                        />
                    </div>

                    <div className="checkout-form__payment">
                        <p className="checkout-form__payment-label">Payment method</p>
                        <div className="checkout-form__payment-option">
                            <span>💵 Cash on Delivery</span>
                            <span className="checkout-form__payment-note">Pay when your order arrives</span>
                        </div>
                    </div>

                    <button className="checkout-form__submit" type="submit" disabled={placing}>
                        {placing ? 'Placing order…' : `Place Order — Rs ${total.toLocaleString('en-PK')}`}
                    </button>
                </form>

                <div className="checkout-summary">
                    <h3>Order Summary</h3>
                    {items.map((item) => (
                        <div className="checkout-summary__item" key={item.id}>
                            <div className="checkout-summary__thumb">
                                {item.image_url ? (
                                    <img src={resolveImageUrl(item.image_url)} alt={item.name} />
                                ) : (
                                    <PlaceholderImage label={item.name} />
                                )}
                            </div>
                            <div className="checkout-summary__info">
                                <p className="checkout-summary__name">{item.name}</p>
                                <p className="checkout-summary__qty">Qty: {item.quantity}</p>
                            </div>
                            <p className="checkout-summary__price">
                                Rs {(Number(item.price) * item.quantity).toLocaleString('en-PK')}
                            </p>
                        </div>
                    ))}
                    <div className="checkout-summary__total">
                        <span>Total</span>
                        <span>Rs {total.toLocaleString('en-PK')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
