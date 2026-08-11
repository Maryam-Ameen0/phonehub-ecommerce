import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import PlaceholderImage from '../components/PlaceholderImage';
import SpecChip from '../components/SpecChip';
import { resolveImageUrl } from '../utils/resolveImageUrl';
import './MyListings.css';

const statusTone = { pending: 'default', approved: 'new', rejected: 'used' };

export default function MyListings() {
    const location = useLocation();
    const justSubmitted = location.state?.justSubmitted;

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    function loadListings() {
        setLoading(true);
        api
            .get('/listings/mine')
            .then(({ data }) => setListings(data.listings))
            .catch(() => setError('Could not load your listings.'))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadListings();
    }, []);

    async function handleDelete(id) {
        if (!confirm('Remove this listing?')) return;
        await api.delete(`/listings/${id}`);
        setListings((prev) => prev.filter((l) => l.id !== id));
    }

    if (loading) return <div className="my-listings__status">Loading…</div>;
    if (error) return <div className="my-listings__status">{error}</div>;

    return (
        <div className="my-listings">
            <div className="my-listings__header">
                <h1>My Listings</h1>
                <Link to="/sell" className="my-listings__sell-link">
                    + Sell a phone
                </Link>
            </div>

            {justSubmitted && (
                <div className="my-listings__success">
                    Your listing was submitted and is awaiting admin approval.
                </div>
            )}

            {listings.length === 0 ? (
                <p className="my-listings__empty">You haven't listed anything yet.</p>
            ) : (
                <div className="my-listings__list">
                    {listings.map((item) => (
                        <div className="listing-row" key={item.id}>
                            <div className="listing-row__image">
                                {item.image_url ? (
                                    <img src={resolveImageUrl(item.image_url)} alt={item.name} />
                                ) : (
                                    <PlaceholderImage label={item.name} />
                                )}
                            </div>

                            <div className="listing-row__info">
                                <p className="listing-row__name">{item.name}</p>
                                <p className="listing-row__price">Rs {Number(item.price).toLocaleString('en-PK')}</p>
                                {item.approval_status === 'rejected' && item.rejection_reason && (
                                    <p className="listing-row__reason">Reason: {item.rejection_reason}</p>
                                )}
                            </div>

                            <SpecChip tone={statusTone[item.approval_status]}>{item.approval_status}</SpecChip>

                            <button className="listing-row__delete" onClick={() => handleDelete(item.id)}>
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
