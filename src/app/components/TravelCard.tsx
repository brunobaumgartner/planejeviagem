interface TravelCardProps {
  imageUrl: string;
  title?: string;
  price?: string;
}

export function TravelCard({ imageUrl, title, price }: TravelCardProps) {
  return (
    <div className="flex-shrink-0 w-32 h-32 bg-sky-200 rounded-lg overflow-hidden relative cursor-pointer hover:scale-105 transition-transform">
      <img 
        src={imageUrl} 
        alt={title || "Opção de viagem"} 
        className="w-full h-full object-cover"
      />
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-white text-xs font-medium">{title}</p>
          {price && <p className="text-white text-xs">{price}</p>}
        </div>
      )}
    </div>
  );
}
