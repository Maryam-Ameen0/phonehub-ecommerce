import { useEffect, useState } from 'react';
import api from '../../services/api';
import PlaceholderImage from '../../components/PlaceholderImage';
import { resolveImageUrl } from '../../utils/resolveImageUrl';
import './Listings.css';

export default function AdminListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rejectingId, setRejectingId] = useState(null);
    const [reason, setReason] = useState('');

    function loadPending() {
        setLoading(true);
        api
            .get('/admin/products', { params: { status: 'pending', limit: 50 } })
            .then((res) => setListings(res.data.products))
            .catch(() => setError('Could not load pending listings.'))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadPending();
    }, []);

    async function handleApprove(id) {
        await api.put(`/admin/products/${id}/approve`);
        setListings((prev) => prev.filter((l) => l.id !== id));
    }

    async function handleRejectSubmit(id) {
        await api.put(`/admin/products/${id}/reject`, { reason: reason || undefined });
        setListings((prev) => prev.filter((l) => l.id !== id));
        setRejectingId(null);
        setReason('');
    }

    if (loading) return <div className="admin-listings__status">Loading…</div>;
    if (error) return <div className="admin-listings__status">{error}</div>;

    return (
        <div className="admin-listings">
            <h1>Listing Approvals</h1>
            <p className="admin-listings__subtitle">
                {listings.length === 0 ? 'Nothing waiting for review.' : `${listings.length} listing(s) awaiting review`}
            </p>

            <div className="admin-listings__list">
                {listings.map((item) => (
                    <div className="review-card" key={item.id}>
                        <div className="review-card__image">
                            {item.image_url ? (
                                <img src={resolveImageUrl(item.image_url)} alt={item.name} />
                            ) : (
                                <PlaceholderImage label={item.name} />
                            )}
                        </div>

                        <div className="review-card__info">
                            <p className="review-card__name">{item.name}</p>
                            <p className="review-card__meta">
                                {item.brand && `${item.brand} · `}
                                {item.condition_status} · Rs {Number(item.price).toLocaleString('en-PK')}
                            </p>
                            <p className="review-card__seller">
                                Listed by {item.seller_name} ({item.seller_email})
                            </p>
                            {item.description && <p className="review-card__description">{item.description}</p>}
                        </div>

                        <div className="review-card__actions">
                            {rejectingId === item.id ? (
                                <div className="review-card__reject-form">
                                    <input
                                        type="text"
                                        placeholder="Reason (optional)"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="review-card__reject-buttons">
                                        <button
                                            className="review-card__confirm-reject"
                                            onClick={() => handleRejectSubmit(item.id)}
                                        >
                                            Confirm reject
                                        </button>
                                        <button
                                            className="review-card__cancel"
                                            onClick={() => {
                                                setRejectingId(null);
                                                setReason('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button className="review-card__approve" onClick={() => handleApprove(item.id)}>
                                        Approve
                                    </button>
                                    <button className="review-card__reject" onClick={() => setRejectingId(item.id)}>
                                        Reject
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
