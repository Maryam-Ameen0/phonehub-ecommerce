import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import './Shop.css';

const emptyFilters = { category: '', brand: '', condition: '', minPrice: '', maxPrice: '' };

export default function Shop() {
    const [searchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category') || '';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filters, setFilters] = useState({ ...emptyFilters, category: categoryFromUrl });
    const [sort, setSort] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Keep the category filter in sync if the URL changes (e.g. a link from a product page)
    useEffect(() => {
        if (categoryFromUrl) {
            setFilters((prev) => ({ ...prev, category: categoryFromUrl }));
        }
    }, [categoryFromUrl]);

    // Load filter options once
    useEffect(() => {
        api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
        api.get('/products/meta/brands').then(({ data }) => setBrands(data.brands)).catch(() => {});
    }, []);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { ...filters, sort };
            if (search) params.search = search;
            Object.keys(params).forEach((k) => !params[k] && delete params[k]);

            const { data } = await api.get('/products', { params });
            setProducts(data.products);
        } catch {
            setError('Could not load products. Is the backend running?');
        } finally {
            setLoading(false);
        }
    }, [filters, sort, search]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="shop-page">
            <div className="shop-page__header">
                <div>
                    <h1>{search ? `Results for "${search}"` : 'Shop phones'}</h1>
                    <p className="shop-page__count">{loading ? 'Loading…' : `${products.length} results`}</p>
                </div>

                <select className="shop-page__sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A–Z</option>
                </select>
            </div>

            <button className="shop-page__filter-toggle" onClick={() => setFiltersOpen((o) => !o)}>
                {filtersOpen ? 'Hide filters ▲' : 'Filters ▾'}
                {activeFilterCount > 0 && <span className="shop-page__filter-count">{activeFilterCount}</span>}
            </button>

            <div className="shop-page__layout">
                <div className={`shop-page__filters ${filtersOpen ? 'is-open' : ''}`}>
                    <FilterSidebar
                        categories={categories}
                        brands={brands}
                        filters={filters}
                        onChange={setFilters}
                        onClear={() => setFilters(emptyFilters)}
                    />
                    <button
                        className="shop-page__show-results"
                        onClick={() => {
                            setFiltersOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        Show {loading ? '…' : products.length} result{products.length === 1 ? '' : 's'}
                    </button>
                </div>

                <div className="shop-page__results">
                    {error && <p className="shop-page__error">{error}</p>}

                    {!loading && !error && products.length === 0 && (
                        <p className="shop-page__empty">No products match your filters. Try clearing some.</p>
                    )}

                    <div className="shop-page__grid">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
