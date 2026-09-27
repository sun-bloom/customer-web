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
      className="group relative h-60 sm:h-68 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs hover:shadow-md border border-[#DFC598]/50 hover:border-[#DFC598] transition-all duration-300 block"
    >
      <img
        src={category.image || fallbackImg}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2D0D19]/90 via-[#3D1220]/35 to-transparent flex flex-col justify-end p-5 sm:p-6">
        <span className="text-[10px] uppercase tracking-[0.24em] text-[#DFC598] font-medium mb-1">
          Atelier Realm
        </span>
        <h3 className="font-heading text-lg sm:text-xl font-normal text-[#FFF9FA] group-hover:text-[#DFC598] transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs text-[#E8D0D6] line-clamp-1 mt-0.5 font-light">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
};

