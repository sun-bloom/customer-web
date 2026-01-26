import React, { useEffect, useState } from 'react';

export default function CartBadge() {
    const [count, setCount] = useState(0);

    // In a real app, we'd subscribe to cart state changes here
    // For now, just a placeholder or read from localStorage if it exists
    useEffect(() => {
        // Week 3: Implement cart logic
        const cart = localStorage.getItem('cart');
        if (cart) {
            try {
                const items = JSON.parse(cart);
                setCount(items.reduce((acc: number, item: any) => acc + item.quantity, 0));
            } catch (e) {
                setCount(0);
            }
        }
    }, []);

    return (
        <a href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {count > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {count}
                </span>
            )}
        </a>
    );
}
