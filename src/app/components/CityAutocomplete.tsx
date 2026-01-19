import { useState, useRef, useEffect } from "react";

// Lista de cidades populares do mundo para autocomplete
const WORLD_CITIES = [
  // Brasil
  "São Paulo, Brasil", "Rio de Janeiro, Brasil", "Brasília, Brasil", "Salvador, Brasil",
  "Fortaleza, Brasil", "Belo Horizonte, Brasil", "Manaus, Brasil", "Curitiba, Brasil",
  "Recife, Brasil", "Porto Alegre, Brasil", "Belém, Brasil", "Goiânia, Brasil",
  "Guarulhos, Brasil", "Campinas, Brasil", "São Luís, Brasil", "Maceió, Brasil",
  "Natal, Brasil", "João Pessoa, Brasil", "Florianópolis, Brasil", "Vitória, Brasil",
  
  // Europa
  "Lisboa, Portugal", "Porto, Portugal", "Madrid, Espanha", "Barcelona, Espanha",
  "Paris, França", "Londres, Reino Unido", "Roma, Itália", "Milão, Itália",
  "Berlim, Alemanha", "Munique, Alemanha", "Amsterdã, Holanda", "Bruxelas, Bélgica",
  "Viena, Áustria", "Praga, República Tcheca", "Budapeste, Hungria", "Atenas, Grécia",
  "Dublin, Irlanda", "Copenhague, Dinamarca", "Estocolmo, Suécia", "Oslo, Noruega",
  "Helsinque, Finlândia", "Varsóvia, Polônia", "Zurique, Suíça", "Genebra, Suíça",
  
  // América do Norte
  "Nova York, Estados Unidos", "Los Angeles, Estados Unidos", "Chicago, Estados Unidos",
  "Miami, Estados Unidos", "São Francisco, Estados Unidos", "Las Vegas, Estados Unidos",
  "Washington, Estados Unidos", "Boston, Estados Unidos", "Seattle, Estados Unidos",
  "Orlando, Estados Unidos", "Toronto, Canadá", "Vancouver, Canadá", "Montreal, Canadá",
  "Cidade do México, México", "Cancún, México", "Guadalajara, México",
  
  // América do Sul
  "Buenos Aires, Argentina", "Córdoba, Argentina", "Mendoza, Argentina",
  "Santiago, Chile", "Lima, Peru", "Cusco, Peru", "Bogotá, Colômbia",
  "Cartagena, Colômbia", "Medellín, Colômbia", "Quito, Equador", "Montevidéu, Uruguai",
  "Caracas, Venezuela", "La Paz, Bolívia",
  
  // Ásia
  "Tóquio, Japão", "Osaka, Japão", "Kyoto, Japão", "Pequim, China", "Xangai, China",
  "Hong Kong, China", "Seul, Coreia do Sul", "Bangkok, Tailândia", "Singapura, Singapura",
  "Dubai, Emirados Árabes", "Abu Dhabi, Emirados Árabes", "Délhi, Índia", "Mumbai, Índia",
  "Istambul, Turquia", "Tel Aviv, Israel", "Jerusalém, Israel",
  
  // Oceania
  "Sydney, Austrália", "Melbourne, Austrália", "Brisbane, Austrália",
  "Auckland, Nova Zelândia", "Wellington, Nova Zelândia",
  
  // África
  "Cairo, Egito", "Cidade do Cabo, África do Sul", "Joanesburgo, África do Sul",
  "Marrakech, Marrocos", "Casablanca, Marrocos", "Nairobi, Quênia",
];

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (city: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function CityAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Ex: São Paulo, Brasil",
  label,
  required = false,
  className = "",
}: CityAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar cidades enquanto digita
  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (inputValue.length === 0) {
      setFilteredCities([]);
      setShowSuggestions(false);
      return;
    }

    // Filtrar cidades do mundo que contenham o texto digitado
    const filtered = WORLD_CITIES.filter(city =>
      city.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 10); // Limitar a 10 resultados

    setFilteredCities(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // Selecionar uma cidade das sugestões
  const handleSelectCity = (city: string) => {
    onChange(city);
    onSelect && onSelect(city);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && '*'}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        required={required}
      />
      {showSuggestions && filteredCities.length > 0 && (
        <div
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto rounded-xl"
          ref={suggestionsRef}
        >
          {filteredCities.map(city => (
            <div
              key={city}
              className="px-4 py-3 cursor-pointer hover:bg-sky-50 transition-colors text-sm border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelectCity(city)}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📍</span>
                <span className="text-gray-900">{city}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}