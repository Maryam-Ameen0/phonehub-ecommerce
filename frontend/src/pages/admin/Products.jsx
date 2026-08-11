import { useEffect, useState } from 'react';
import api from '../../services/api';
import SpecChip from '../../components/SpecChip';
import ProductFormModal from './ProductFormModal';
import { resolveImageUrl } from '../../utils/resolveImageUrl';
import './Products.css';

const statusTone = { pending: 'default', approved: 'new', rejected: 'used' };

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [editingProduct, setEditingProduct] = useState(null); // null = closed, {} = new, {...} = editing
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        api.get('/categories').then((res) => setCategories(res.data.categories));
    }, []);

    function loadProducts() {
        setLoading(true);
        api
            .get('/admin/products', { params: { search: search || undefined, limit: 50 } })
            .then((res) => setProducts(res.data.products))
            .catch(() => setError('Could not load products.'))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadProducts();
    }, [search]);

    async function handleDelete(id) {
        if (!confirm('Delete this product permanently?')) return;
        await api.delete(`/admin/products/${id}`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
    }

    function handleSaved() {
        setEditingProduct(null);
        loadProducts();
    }

    if (loading && products.length === 0) return <div className="admin-products__status">Loading…</div>;
    if (error) return <div className="admin-products__status">{error}</div>;

    return (
        <div className="admin-products">
            <div className="admin-products__header">
                <h1>Products</h1>
                <button className="admin-products__add" onClick={() => setEditingProduct({})}>
                    + Add Product
                </button>
            </div>

            <input
                className="admin-products__search"
                type="text"
                placeholder="Search by name or brand…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="table-scroll">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Seller</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id}>
                                <td>
                                    <div className="admin-table__thumb">
                                        {p.image_url ? (
                                            <img src={resolveImageUrl(p.image_url)} alt={p.name} />
                                        ) : (
                                            <div className="admin-table__thumb-placeholder" />
                                        )}
                                    </div>
                                </td>
                                <td>{p.name}</td>
                                <td>Rs {Number(p.price).toLocaleString('en-PK')}</td>
                                <td>{p.stock}</td>
                                <td>
                                    <SpecChip tone={statusTone[p.approval_status]}>{p.approval_status}</SpecChip>
                                </td>
                                <td className="admin-table__seller">{p.seller_name || 'Store'}</td>
                                <td className="admin-table__actions">
                                    <button onClick={() => setEditingProduct(p)}>Edit</button>
                                    <button className="admin-table__delete" onClick={() => handleDelete(p.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {products.length === 0 && !loading && <p className="admin-products__empty">No products found.</p>}

            {editingProduct !== null && (
                <ProductFormModal
                    product={editingProduct}
                    categories={categories}
                    onClose={() => setEditingProduct(null)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
