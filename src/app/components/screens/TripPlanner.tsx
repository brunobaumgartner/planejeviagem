import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TripBudgetPlanner, SearchData } from '../TripBudgetPlanner';
import { TripResults } from '../TripResults';
import { useNavigation } from '@/app/context/NavigationContext';

export function TripPlanner() {
  const { setCurrentScreen } = useNavigation();
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (data: SearchData) => {
    console.log('[TripPlanner] Search data:', data);
    setSearchData(data);
    setShowResults(true);
  };

  const handleSelectDestination = (destination: string) => {
    console.log('[TripPlanner] Selected destination:', destination);
    
    // Save to localStorage and navigate to trips screen
    localStorage.setItem('trip_suggestion', JSON.stringify({
      destination: destination,
      days: searchData?.days || 7,
      budget: searchData?.budget || 0,
    }));
    
    setCurrentScreen('trips');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
    } else {
      setCurrentScreen('home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {showResults ? 'Resultados' : 'Planejar Viagem'}
            </h1>
            <p className="text-sm text-gray-600">
              {showResults 
                ? 'Veja as opções disponíveis'
                : 'Descubra seu próximo destino'}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!showResults ? (
          <TripBudgetPlanner onSearch={handleSearch} />
        ) : searchData && (
          <TripResults
            searchType={searchData.searchType}
            budget={searchData.budget}
            destination={searchData.destination}
            origin={searchData.origin}
            days={searchData.days}
            currency={searchData.currency}
            onSelectDestination={handleSelectDestination}
          />
        )}
      </main>
    </div>
  );
}