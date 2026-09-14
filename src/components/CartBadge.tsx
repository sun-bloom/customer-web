import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { $cartCount, initCart, openCart } from '../stores/cartStore';

export default function CartBadge() {
  const count = useStore($cartCount);

  useEffect(() => {
    initCart();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openCart();
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-200/50 rounded-full transition-all cursor-pointer"
      aria-label="View Shopping Bag"
      title="Shopping Bag"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
      {count > 0 && (
        <span
          id="cart-badge"
          className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-stone-950 bg-[#C5A059] rounded-full shadow-2xs"
        >
          {count}
        </span>
      )}
    </button>
  );
}
