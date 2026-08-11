import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PlaceholderImage from '../components/PlaceholderImage';
import { resolveImageUrl } from '../utils/resolveImageUrl';
import './Cart.css';

export default function Cart() {
    const { items, total, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="cart-page cart-page--empty">
                <h1>Your cart is empty</h1>
                <p>Browse the shop and add something you like.</p>
                <Link to="/" className="cart-page__shop-link">
                    Go to shop
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1>Your Cart</h1>

            <div className="cart-page__layout">
                <div className="cart-page__items">
                    {items.map((item) => (
                        <div className="cart-item" key={item.id}>
                            <div className="cart-item__image">
                                {item.image_url ? (
                                    <img src={resolveImageUrl(item.image_url)} alt={item.name} />
                                ) : (
                                    <PlaceholderImage label={item.name} />
                                )}
                            </div>

                            <div className="cart-item__info">
                                <p className="cart-item__brand">{item.brand}</p>
                                <Link to={`/products/${item.product_id}`} className="cart-item__name">
                                    {item.name}
                                </Link>
                                <p className="cart-item__price">Rs {Number(item.price).toLocaleString('en-PK')}</p>
                            </div>

                            <div className="cart-item__qty">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={item.quantity >= item.stock}
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>

                            <p className="cart-item__subtotal">
                                Rs {(Number(item.price) * item.quantity).toLocaleString('en-PK')}
                            </p>

                            <button className="cart-item__remove" onClick={() => removeFromCart(item.id)}>
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="cart-summary__row">
                        <span>Subtotal</span>
                        <span>Rs {total.toLocaleString('en-PK')}</span>
                    </div>
                    <div className="cart-summary__row cart-summary__row--total">
                        <span>Total</span>
                        <span>Rs {total.toLocaleString('en-PK')}</span>
                    </div>
                    <button className="cart-summary__checkout" onClick={() => navigate('/checkout')}>
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}
