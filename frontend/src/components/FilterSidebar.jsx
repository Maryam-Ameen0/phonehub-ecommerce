import './FilterSidebar.css';

export default function FilterSidebar({ categories, brands, filters, onChange, onClear }) {
    function handleCategoryClick(slug) {
        onChange({ ...filters, category: filters.category === slug ? '' : slug });
    }

    function handleBrandClick(brand) {
        onChange({ ...filters, brand: filters.brand === brand ? '' : brand });
    }

    function handleConditionClick(condition) {
        onChange({ ...filters, condition: filters.condition === condition ? '' : condition });
    }

    return (
        <aside className="filter-sidebar">
            <div className="filter-sidebar__header">
                <h3>Filters</h3>
                <button className="filter-sidebar__clear" onClick={onClear}>
                    Clear all
                </button>
            </div>

            <div className="filter-group">
                <h4>Category</h4>
                {categories.map((c) => (
                    <label key={c.id} className="filter-option">
                        <input
                            type="checkbox"
                            checked={filters.category === c.slug}
                            onChange={() => handleCategoryClick(c.slug)}
                        />
                        {c.name}
                    </label>
                ))}
            </div>

            <div className="filter-group">
                <h4>Brand</h4>
                {brands.map((b) => (
                    <label key={b} className="filter-option">
                        <input
                            type="checkbox"
                            checked={filters.brand === b}
                            onChange={() => handleBrandClick(b)}
                        />
                        {b}
                    </label>
                ))}
            </div>

            <div className="filter-group">
                <h4>Condition</h4>
                {['New', 'Used', 'Refurbished'].map((cond) => (
                    <label key={cond} className="filter-option">
                        <input
                            type="checkbox"
                            checked={filters.condition === cond}
                            onChange={() => handleConditionClick(cond)}
                        />
                        {cond}
                    </label>
                ))}
            </div>

            <div className="filter-group">
                <h4>Price range (Rs)</h4>
                <div className="filter-price-row">
                    <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
                    />
                    <span>–</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
                    />
                </div>
            </div>
        </aside>
    );
}
