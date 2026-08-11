import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import PlaceholderImage from '../components/PlaceholderImage';
import { resolveImageUrl } from '../utils/resolveImageUrl';
import SpecChip from '../components/SpecChip';
import './Wishlist.css';

const conditionTone = { New: 'new', Used: 'used', Refurbished: 'refurbished' };

export default function Wishlist() {
    const { items, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="wishlist-page wishlist-page--empty">
                <h1>Your wishlist is empty</h1>
                <p>Tap the heart on any product to save it for later.</p>
                <Link to="/" className="wishlist-page__shop-link">
                    Go to shop
                </Link>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <h1>Your Wishlist</h1>

            <div className="wishlist-grid">
                {items.map((item) => (
                    <div className="wishlist-card" key={item.id}>
                        <Link to={`/products/${item.product_id}`} className="wishlist-card__image">
                            {item.image_url ? (
                                <img src={resolveImageUrl(item.image_url)} alt={item.name} />
                            ) : (
                                <PlaceholderImage label={item.name} />
                            )}
                        </Link>

                        <div className="wishlist-card__body">
                            <p className="wishlist-card__brand">{item.brand}</p>
                            <Link to={`/products/${item.product_id}`} className="wishlist-card__name">
                                {item.name}
                            </Link>

                            <SpecChip tone={conditionTone[item.condition_status] || 'default'}>
                                {item.condition_status}
                            </SpecChip>

                            <p className="wishlist-card__price">Rs {Number(item.price).toLocaleString('en-PK')}</p>

                            <div className="wishlist-card__actions">
                                <button
                                    className="wishlist-card__add"
                                    disabled={item.stock === 0}
                                    onClick={() => addToCart(item.product_id, 1)}
                                >
                                    {item.stock === 0 ? 'Out of stock' : 'Add to Cart'}
                                </button>
                                <button
                                    className="wishlist-card__remove"
                                    onClick={() => removeFromWishlist(item.product_id)}
                                    aria-label="Remove from wishlist"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
