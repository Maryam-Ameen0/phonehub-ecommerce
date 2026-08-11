import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PlaceholderImage from '../components/PlaceholderImage';
import SpecChip from '../components/SpecChip';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { resolveImageUrl } from '../utils/resolveImageUrl';
import './ProductDetail.css';

const conditionTone = {
    New: 'new',
    Used: 'used',
    Refurbished: 'refurbished'
};

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);
    const [addedMessage, setAddedMessage] = useState('');

    const { user } = useAuth();
    const { addToCart } = useCart();
    const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        setError('');
        api
            .get(`/products/${id}`)
            .then(({ data }) => setProduct(data.product))
            .catch(() => setError('This product could not be found.'))
            .finally(() => setLoading(false));
    }, [id]);

    async function handleAddToCart() {
        if (!user) {
            navigate('/login');
            return;
        }
        setAdding(true);
        setAddedMessage('');
        try {
            await addToCart(product.id, 1);
            setAddedMessage('Added to cart.');
        } catch (err) {
            setAddedMessage(err.response?.data?.message || 'Could not add to cart.');
        } finally {
            setAdding(false);
        }
    }

    function handleWishlistToggle() {
        if (!user) {
            navigate('/login');
            return;
        }
        wishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
    }

    if (loading) return <div className="product-detail__status">Loading…</div>;
    if (error) return <div className="product-detail__status">{error}</div>;
    if (!product) return null;

    const price = Number(product.price).toLocaleString('en-PK');
    const wishlisted = user && isWishlisted(product.id);

    return (
        <div className="product-detail">
            <Link to="/" className="product-detail__back">
                ← Back to shop
            </Link>

            <div className="product-detail__layout">
                <div className="product-detail__image">
                    {product.image_url ? (
                        <img src={resolveImageUrl(product.image_url)} alt={product.name} />
                    ) : (
                        <PlaceholderImage label={product.name} />
                    )}
                </div>

                <div className="product-detail__info">
                    {product.category_name && (
                        <Link to={`/?category=${product.category_slug}`} className="product-detail__category">
                            {product.category_name}
                        </Link>
                    )}
                    <p className="product-detail__brand">{product.brand}</p>
                    <h1>{product.name}</h1>
                    {product.seller_name && (
                        <p className="product-detail__seller">Sold by {product.seller_name}</p>
                    )}

                    <div className="product-detail__chips">
                        <SpecChip tone={conditionTone[product.condition_status] || 'default'}>
                            {product.condition_status}
                        </SpecChip>
                        {product.storage && <SpecChip>{product.storage} storage</SpecChip>}
                        {product.ram && <SpecChip>{product.ram} RAM</SpecChip>}
                        {product.color && <SpecChip>{product.color}</SpecChip>}
                    </div>

                    <p className="product-detail__price">Rs {price}</p>

                    {product.stock > 0 ? (
                        <p className="product-detail__stock product-detail__stock--in">
                            {product.stock <= 3 ? `Only ${product.stock} left in stock` : 'In stock'}
                        </p>
                    ) : (
                        <p className="product-detail__stock product-detail__stock--out">Out of stock</p>
                    )}

                    <p className="product-detail__description">{product.description}</p>

                    <div className="product-detail__actions">
                        <button
                            className="product-detail__cta"
                            disabled={adding || product.stock === 0}
                            onClick={handleAddToCart}
                        >
                            {product.stock === 0 ? 'Out of stock' : adding ? 'Adding…' : 'Add to Cart'}
                        </button>
                        <button
                            className={`product-detail__wishlist-btn ${wishlisted ? 'is-active' : ''}`}
                            onClick={handleWishlistToggle}
                        >
                            {wishlisted ? '♥ Wishlisted' : '♡ Add to Wishlist'}
                        </button>
                    </div>
                    {addedMessage && <p className="product-detail__added">{addedMessage}</p>}
                </div>
            </div>
        </div>
    );
}
