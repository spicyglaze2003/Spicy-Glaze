export default function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white shadow-sm">
      <div className="aspect-square animate-shimmer rounded-3xl" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-20 animate-shimmer rounded-full" />
        <div className="h-5 w-3/4 animate-shimmer rounded-full" />
        <div className="h-4 w-1/2 animate-shimmer rounded-full" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 w-16 animate-shimmer rounded-full" />
          <div className="h-8 w-20 animate-shimmer rounded-full" />
        </div>
      </div>
    </div>
  );
}
