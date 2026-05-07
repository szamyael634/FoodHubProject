import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';
import { RestaurantCard } from '../components';
import { getRestaurants } from '../services';

const cuisineTypes = ['All', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean'];

export function HomePage() {
  const { restaurants, setRestaurants, searchQuery, filters, setFilters } = useStore();
  const [loading, setLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      searchQuery === '' ||
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine_type.toLowerCase() === selectedCuisine.toLowerCase();

    const matchesRating = filters.rating === 0 || restaurant.rating >= filters.rating;

    return matchesSearch && matchesCuisine && matchesRating;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">What would you like to eat?</h1>
          <p className="text-lg opacity-90 mb-8">Order from your favorite restaurants</p>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for restaurants or cuisines..."
              value={searchQuery}
              onChange={(e) => useStore.getState().setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 shadow-lg focus:ring-2 focus:ring-primary-300 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filter:</span>
          </div>
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ rating: Number(e.target.value) })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value={0}>All Ratings</option>
            <option value={4}>4+ Stars</option>
            <option value={3}>3+ Stars</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {cuisineTypes.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCuisine === cuisine ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No restaurants found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
