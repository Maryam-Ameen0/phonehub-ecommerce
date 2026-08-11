import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);

    const refreshCart = useCallback(async () => {
        if (!user) {
            setItems([]);
            setTotal(0);
            return;
        }
        try {
            const { data } = await api.get('/cart');
            setItems(data.items);
            setTotal(data.total);
        } catch {
            // not logged in / network issue — leave cart empty rather than crash the app
        }
    }, [user]);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    async function addToCart(productId, quantity = 1) {
        await api.post('/cart', { productId, quantity });
        await refreshCart();
    }

    async function updateQuantity(cartItemId, quantity) {
        await api.put(`/cart/${cartItemId}`, { quantity });
        await refreshCart();
    }

    async function removeFromCart(cartItemId) {
        await api.delete(`/cart/${cartItemId}`);
        await refreshCart();
    }

    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ items, total, count, addToCart, updateQuantity, removeFromCart, refreshCart }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used inside a CartProvider');
    }
    return context;
}
