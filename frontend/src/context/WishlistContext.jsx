import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const { user } = useAuth();
    const [items, setItems] = useState([]);

    const refreshWishlist = useCallback(async () => {
        if (!user) {
            setItems([]);
            return;
        }
        try {
            const { data } = await api.get('/wishlist');
            setItems(data.items);
        } catch {
            // not logged in / network issue — leave wishlist empty rather than crash the app
        }
    }, [user]);

    useEffect(() => {
        refreshWishlist();
    }, [refreshWishlist]);

    async function addToWishlist(productId) {
        await api.post('/wishlist', { productId });
        await refreshWishlist();
    }

    async function removeFromWishlist(productId) {
        await api.delete(`/wishlist/${productId}`);
        await refreshWishlist();
    }

    function isWishlisted(productId) {
        return items.some((item) => item.product_id === productId);
    }

    return (
        <WishlistContext.Provider
            value={{ items, count: items.length, addToWishlist, removeFromWishlist, isWishlisted, refreshWishlist }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used inside a WishlistProvider');
    }
    return context;
}
