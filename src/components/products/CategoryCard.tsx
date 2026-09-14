// src/components/products/CategoryCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const fallbackImg = 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800';

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.slug)}`}
      className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-2xs hover:shadow-gold transition-all duration-300 block"
    >
      <img
        src={category.image || fallbackImg}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#FEF3C7] font-medium mb-1">
          Collection
        </span>
        <h3 className="font-heading text-xl sm:text-2xl font-normal text-white group-hover:text-[#FEF3C7] transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs text-stone-300 line-clamp-1 mt-1 font-light">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
};
