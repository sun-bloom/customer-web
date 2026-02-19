interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${variantClasses[variant]} ${className}`}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-48" variant="rectangular" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" variant="rectangular" />
        <Skeleton className="h-4 w-1/2" variant="rectangular" />
        <Skeleton className="h-6 w-1/3 mt-4" variant="rectangular" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-4 border-b">
      <Skeleton className="w-16 h-16" variant="rectangular" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" variant="rectangular" />
        <Skeleton className="h-3 w-1/2" variant="rectangular" />
      </div>
      <Skeleton className="h-4 w-16" variant="rectangular" />
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-40" variant="rectangular" />
      <div className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" variant="rectangular" />
        <Skeleton className="h-4 w-1/2" variant="rectangular" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" variant="rectangular" />
          <Skeleton className="h-4 w-24" variant="rectangular" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" variant="circular" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" variant="rectangular" />
        <Skeleton className="h-4 w-2/3" variant="rectangular" />
      </div>
    </div>
  );
}
