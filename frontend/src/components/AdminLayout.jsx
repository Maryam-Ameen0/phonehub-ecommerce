import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const links = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/listings', label: 'Listing Approvals' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/users', label: 'Users' }
];

export default function AdminLayout() {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <p className="admin-sidebar__title">Admin</p>
                <nav>
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) => `admin-sidebar__link ${isActive ? 'is-active' : ''}`}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}
