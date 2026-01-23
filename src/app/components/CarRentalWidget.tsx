import { useEffect } from 'react';

export function CarRentalWidget() {
  useEffect(() => {
    // Criar o script do widget de aluguel de carros
    const script = document.createElement('script');
    script.src = 'https://tpwidg.com/content?trs=491435&shmarker=698211.698211&locale=pt_BR&powered_by=true&border_radius=6&plain=true&show_logo=true&color_background=%23FFFFFFff&color_button=%2300AEFFff&color_text=%23000000&color_input_text=%23000000&color_button_text=%23ffffff&promo_id=4480&campaign_id=10';
    script.async = true;
    script.charset = 'utf-8';
    
    const widgetContainer = document.getElementById('car-rental-widget-container');
    if (widgetContainer) {
      widgetContainer.appendChild(script);
    }

    return () => {
      if (widgetContainer && widgetContainer.contains(script)) {
        widgetContainer.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 px-1">
        🚗 Aluguel de Carros
      </h2>
      <div 
        id="car-rental-widget-container" 
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      />
    </div>
  );
}
