import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Sell.css';

export default function Sell() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        brand: '',
        storage: '',
        ram: '',
        color: '',
        conditionStatus: 'Used',
        description: '',
        price: '',
        stock: '1',
        categoryId: ''
    });

    useEffect(() => {
        api.get('/categories').then(({ data }) => {
            setCategories(data.categories);
            if (data.categories.length > 0) {
                setForm((f) => ({ ...f, categoryId: data.categories[0].id }));
            }
        });
    }, []);

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

        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => formData.append(key, value));
            if (imageFile) formData.append('image', imageFile);

            await api.post('/listings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/my-listings', { state: { justSubmitted: true } });
        } catch (err) {
            setError(err.response?.data?.message || 'Could not submit your listing. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="sell-page">
            <h1>Sell a Phone</h1>
            <p className="sell-page__subtitle">
                List your phone for other buyers to see. An admin reviews every listing before it goes live.
            </p>

            {error && <div className="sell-form__error">{error}</div>}

            <form className="sell-form" onSubmit={handleSubmit}>
                <div className="sell-form__image-upload">
                    <label htmlFor="image" className="sell-form__image-label">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" />
                        ) : (
                            <span>📷 Add a photo</span>
                        )}
                    </label>
                    <input id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} hidden />
                </div>

                <div className="sell-form__grid">
                    <div className="sell-form__field sell-form__field--full">
                        <label htmlFor="name">Title</label>
                        <input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. iPhone 12, 128GB, Blue" />
                    </div>

                    <div className="sell-form__field">
                        <label htmlFor="brand">Brand</label>
                        <input id="brand" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Apple" />
                    </div>

                    <div className="sell-form__field">
                        <label htmlFor="categoryId">Category</label>
                        <select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleChange} required>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sell-form__field">
                        <label htmlFor="storage">Storage</label>
                        <input id="storage" name="storage" value={form.storage} onChange={handleChange} placeholder="e.g. 128GB" />
                    </div>

                    <div className="sell-form__field">
                        <label htmlFor="ram">RAM</label>
                        <input id="ram" name="ram" value={form.ram} onChange={handleChange} placeholder="e.g. 8GB" />
                    </div>

                    <div className="sell-form__field">
                        <label htmlFor="color">Color</label>
                        <input id="color" name="color" value={form.color} onChange={handleChange} placeholder="e.g. Black" />
                    </div>

                    <div className="sell-form__field">
                        <label htmlFor="conditionStatus">Condition</label>
                        <select id="conditionStatus" name="conditionStatus" value={form.conditionStatus} onChange={handleChange}>
                            <option value="New">New</option>
                            <option value="Used">Used</option>
                            <option value="Refurbished">Refurbished</option>
                        </select>
                    </div>

                    <div className="sell-form__field">
                        <label htmlFor="price">Price (Rs)</label>
                        <input id="price" name="price" type="number" min="1" value={form.price} onChange={handleChange} required />
                    </div>

                    <div className="sell-form__field">
                        <label htmlFor="stock">Quantity</label>
                        <input id="stock" name="stock" type="number" min="1" value={form.stock} onChange={handleChange} />
                    </div>

                    <div className="sell-form__field sell-form__field--full">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Condition details, reason for selling, anything a buyer should know…"
                        />
                    </div>
                </div>

                <button className="sell-form__submit" type="submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit for Review'}
                </button>
            </form>
        </div>
    );
}
