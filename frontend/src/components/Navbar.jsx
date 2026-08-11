import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { count: cartCount } = useCart();
    const { count: wishlistCount } = useWishlist();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);

    function closeMenus() {
        setMenuOpen(false);
        setAccountOpen(false);
    }

    function handleLogout() {
        logout();
        closeMenus();
        navigate('/');
    }

    function handleSearch(e) {
        e.preventDefault();
        closeMenus();
        navigate(query ? `/?search=${encodeURIComponent(query)}` : '/');
    }

    return (
        <header className="navbar">
            <div className="navbar__inner">
                <Link to="/" className="navbar__logo" onClick={closeMenus}>
                    Phone<span>Hub</span>
                </Link>

                <form className="navbar__search navbar__search--desktop" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search phones, brands…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" aria-label="Search">
                        🔍
                    </button>
                </form>

                <nav className="navbar__links navbar__links--desktop">
                    <Link to="/">Shop</Link>

                    {user && (
                        <>
                            <Link to="/sell" className="navbar__sell-link">
                                Sell
                            </Link>
                            <Link to="/wishlist" className="navbar__icon-link" aria-label="Wishlist">
                                ♡{wishlistCount > 0 && <span className="navbar__badge">{wishlistCount}</span>}
                            </Link>
                            <Link to="/cart" className="navbar__icon-link" aria-label="Cart">
                                🛒{cartCount > 0 && <span className="navbar__badge">{cartCount}</span>}
                            </Link>

                            <div className="navbar__account">
                                <button className="navbar__account-toggle" onClick={() => setAccountOpen((o) => !o)}>
                                    Hi, {user.name.split(' ')[0]} ▾
                                </button>
                                {accountOpen && (
                                    <div className="navbar__dropdown" onMouseLeave={() => setAccountOpen(false)}>
                                        <Link to="/my-listings" onClick={closeMenus}>
                                            My Listings
                                        </Link>
                                        <Link to="/orders" onClick={closeMenus}>
                                            Orders
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" onClick={closeMenus}>
                                                Admin Panel
                                            </Link>
                                        )}
                                        <button onClick={handleLogout}>Log out</button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {!user && (
                        <>
                            <Link to="/login">Log in</Link>
                            <Link to="/register" className="navbar__cta">
                                Sign up
                            </Link>
                        </>
                    )}
                </nav>

                <button
                    className="navbar__hamburger"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    onClick={() => setMenuOpen((o) => !o)}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {menuOpen && (
                <div className="navbar__mobile-menu">
                    <form className="navbar__search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search phones, brands…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" aria-label="Search">
                            🔍
                        </button>
                    </form>

                    <Link to="/" onClick={closeMenus}>
                        Shop
                    </Link>

                    {user ? (
                        <>
                            <Link to="/sell" onClick={closeMenus}>
                                Sell a Phone
                            </Link>
                            <Link to="/my-listings" onClick={closeMenus}>
                                My Listings
                            </Link>
                            <Link to="/orders" onClick={closeMenus}>
                                Orders
                            </Link>
                            <Link to="/wishlist" onClick={closeMenus}>
                                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                            </Link>
                            <Link to="/cart" onClick={closeMenus}>
                                Cart {cartCount > 0 && `(${cartCount})`}
                            </Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" onClick={closeMenus}>
                                    Admin Panel
                                </Link>
                            )}
                            <button className="navbar__mobile-logout" onClick={handleLogout}>
                                Log out ({user.name.split(' ')[0]})
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeMenus}>
                                Log in
                            </Link>
                            <Link to="/register" onClick={closeMenus}>
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
