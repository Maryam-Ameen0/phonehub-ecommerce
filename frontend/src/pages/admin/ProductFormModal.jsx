import { useState } from 'react';
import api from '../../services/api';
import { resolveImageUrl } from '../../utils/resolveImageUrl';
import './ProductFormModal.css';

export default function ProductFormModal({ product, categories, onClose, onSaved }) {
    const isEdit = Boolean(product?.id);

    const [form, setForm] = useState({
        name: product?.name || '',
        brand: product?.brand || '',
        storage: product?.storage || '',
        ram: product?.ram || '',
        color: product?.color || '',
        conditionStatus: product?.condition_status || 'New',
        description: product?.description || '',
        price: product?.price || '',
        stock: product?.stock ?? 0,
        categoryId: product?.category_id || categories[0]?.id || ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(product?.image_url ? resolveImageUrl(product.image_url) : null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!form.name || !form.price || !form.categoryId) {
            setError('Name, price, and category are required.');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => formData.append(key, value));
            if (imageFile) formData.append('image', imageFile);

            if (isEdit) {
                await api.put(`/admin/products/${product.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save this product.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
                    <button className="modal__close" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                {error && <div className="modal__error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="modal__image-upload">
                        <label htmlFor="admin-image" className="modal__image-label">
                            {imagePreview ? <img src={imagePreview} alt="Preview" /> : <span>📷 Add a photo</span>}
                        </label>
                        <input
                            id="admin-image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            hidden
                        />
                    </div>

                    <div className="modal__grid">
                        <div className="modal__field modal__field--full">
                            <label htmlFor="name">Name</label>
                            <input id="name" name="name" value={form.name} onChange={handleChange} required />
                        </div>

                        <div className="modal__field">
                            <label htmlFor="brand">Brand</label>
                            <input id="brand" name="brand" value={form.brand} onChange={handleChange} />
                        </div>

                        <div className="modal__field">
                            <label htmlFor="categoryId">Category</label>
                            <select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleChange} required>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal__field">
                            <label htmlFor="storage">Storage</label>
                            <input id="storage" name="storage" value={form.storage} onChange={handleChange} />
                        </div>

                        <div className="modal__field">
                            <label htmlFor="ram">RAM</label>
                            <input id="ram" name="ram" value={form.ram} onChange={handleChange} />
                        </div>

                        <div className="modal__field">
                            <label htmlFor="color">Color</label>
                            <input id="color" name="color" value={form.color} onChange={handleChange} />
                        </div>

                        <div className="modal__field">
                            <label htmlFor="conditionStatus">Condition</label>
                            <select id="conditionStatus" name="conditionStatus" value={form.conditionStatus} onChange={handleChange}>
                                <option value="New">New</option>
                                <option value="Used">Used</option>
                                <option value="Refurbished">Refurbished</option>
                            </select>
                        </div>

                        <div className="modal__field">
                            <label htmlFor="price">Price (Rs)</label>
                            <input id="price" name="price" type="number" min="1" value={form.price} onChange={handleChange} required />
                        </div>

                        <div className="modal__field">
                            <label htmlFor="stock">Stock</label>
                            <input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
                        </div>

                        <div className="modal__field modal__field--full">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="modal__footer">
                        <button type="button" className="modal__cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="modal__save" disabled={saving}>
                            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
