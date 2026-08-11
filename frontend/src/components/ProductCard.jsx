import { Link } from 'react-router-dom';
import PlaceholderImage from './PlaceholderImage';
import SpecChip from './SpecChip';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl } from '../utils/resolveImageUrl';
import './ProductCard.css';

const conditionTone = {
    New: 'new',
    Used: 'used',
    Refurbished: 'refurbished'
};

export default function ProductCard({ product }) {
    const price = Number(product.price).toLocaleString('en-PK');
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
    const wishlisted = isWishlisted(product.id);

    function handleWishlistClick(e) {
        e.preventDefault(); // don't navigate to the product page
        if (!user) return;
        wishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
    }

    function handleAddToCart(e) {
        e.preventDefault();
        if (!user || product.stock === 0) return;
        addToCart(product.id, 1);
    }

    return (
        <Link to={`/products/${product.id}`} className="product-card">
            <div className="product-card__image">
                {product.image_url ? (
                    <img src={resolveImageUrl(product.image_url)} alt={product.name} />
                ) : (
                    <PlaceholderImage label={product.name} />
                )}

                {user && (
                    <button
                        className={`product-card__wishlist ${wishlisted ? 'is-active' : ''}`}
                        onClick={handleWishlistClick}
                        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        {wishlisted ? '♥' : '♡'}
                    </button>
                )}
            </div>

            <div className="product-card__body">
                <p className="product-card__brand">{product.brand}</p>
                <h3 className="product-card__name">{product.name}</h3>

                {product.seller_name && <p className="product-card__seller">Sold by {product.seller_name}</p>}

                <div className="product-card__chips">
                    <SpecChip tone={conditionTone[product.condition_status] || 'default'}>
                        {product.condition_status}
                    </SpecChip>
                    {product.storage && <SpecChip>{product.storage}</SpecChip>}
                    {product.color && <SpecChip>{product.color}</SpecChip>}
                </div>

                <p className="product-card__price">Rs {price}</p>

                {product.stock <= 3 && product.stock > 0 && (
                    <p className="product-card__low-stock">Only {product.stock} left</p>
                )}
                {product.stock === 0 && <p className="product-card__out">Out of stock</p>}

                {user && product.stock > 0 && (
                    <button className="product-card__add" onClick={handleAddToCart}>
                        Add to cart
                    </button>
                )}
            </div>
        </Link>
    );
}
