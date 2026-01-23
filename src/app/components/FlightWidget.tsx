import { useEffect, useRef } from 'react';

export function FlightWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
  if (!containerRef.current) return;

  // Evita duplicar o script
  if (document.querySelector('script[src*="tpwidg.com"]')) return;

  const script = document.createElement('script');
  script.src = 'https://tpwidg.com/content?currency=brl&trs=491435&shmarker=698211.698211&powered_by=true&locale=pt&searchUrl=www.aviasales.pt%2Fsearch&primary_override=%2332a8dd&color_button=%2332a8dd&color_icons=%2332a8dd&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4&color_focused=%2332a8dd&border_radius=8&no_labels=true&plain=true&promo_id=7879&campaign_id=100';
  script.async = true;

  containerRef.current.appendChild(script);
}, []);


  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">
        ✈️ Buscar Voos
      </h2>
      <div 
        ref={containerRef}
        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200"
      />
    </div>
  );
}
