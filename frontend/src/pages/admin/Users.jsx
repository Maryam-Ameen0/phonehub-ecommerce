import { useEffect, useState } from 'react';
import api from '../../services/api';
import './Users.css';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api
            .get('/admin/users')
            .then((res) => setUsers(res.data.users))
            .catch(() => setError('Could not load users.'))
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(id) {
        if (!confirm('Delete this user? This also removes their orders, cart, wishlist, and listings.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this user.');
        }
    }

    if (loading) return <div className="admin-users__status">Loading…</div>;
    if (error) return <div className="admin-users__status">{error}</div>;

    return (
        <div className="admin-users">
            <h1>Users</h1>

            <div className="table-scroll">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Orders</th>
                            <th>Listings</th>
                            <th>Joined</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`role-badge role-badge--${u.role}`}>{u.role}</span>
                                </td>
                                <td>{u.order_count}</td>
                                <td>{u.listing_count}</td>
                                <td>{new Date(u.created_at).toLocaleDateString('en-PK')}</td>
                                <td>
                                    {u.role !== 'admin' && (
                                        <button className="admin-users__delete" onClick={() => handleDelete(u.id)}>
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
