import { useEffect, useRef } from 'react';

export function FlightWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Evita carregar o script mais de uma vez
    if (document.querySelector('script[data-flight-widget]')) {
      return;
    }

    const script = document.createElement('a');
    script.setAttribute('alt', 'VDP - AEREO MELHORPREÇO');
    script.setAttribute('width', '300');
    script.setAttribute('height', '100');
    script.setAttribute('style', 'height: 100px; width: 300px');
    script.setAttribute('href', 'https://www.vaidepromo.com.br/?utm_medium=afiliado&pcrid=13647&utm_source=banner&pcrtt=parceiros_banner160');

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">
        ✈️ Buscar Voos
      </h2>
      <a 
        target="_blank" 
        rel="noopener noreferrer" 
        href="https://www.vaidepromo.com.br/?utm_medium=afiliado&pcrid=13647&utm_source=banner&pcrtt=parceiros_banner160"
      >
        <img
          alt="VDP - AEREO MELHORPREÇO"
          width="200"
          height="100%"
          style={{ height: '200px', width: '100%' }}
          src="https://storage.googleapis.com/parceirospromo/content/banner/9ca2fe4f-e2c1-457f-a128-bb0c0ff06266/Passagem-aérea-com-o-melhor-preço300-x-100-Aéreo.png"
        />
      </a>

    </div>
  );
}
