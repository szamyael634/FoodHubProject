import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { useStore, getCartItemCount } from '../store/useStore';
import { MenuItemCard } from '../components';
import { getRestaurantById, getMenuItems } from '../services';

export function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const { cart, setSelectedRestaurant, setMenuItems, menuItems, selectedRestaurant } = useStore();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const cartItemCount = getCartItemCount(cart);

  useEffect(() => {
    if (id) {
      fetchRestaurant(id);
    }
  }, [id]);

  const fetchRestaurant = async (restaurantId: string) => {
    setLoading(true);
    try {
      const restaurant = await getRestaurantById(restaurantId);
      const items = await getMenuItems(restaurantId);

      setSelectedRestaurant(restaurant);
      setMenuItems(items);
    } catch (err) {
      console.error('Error fetching restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(menuItems.map((item) => item.category))];

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter((item) => item.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!selectedRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Restaurant not found</p>
          <Link to="/" className="text-primary-500 hover:text-primary-600 mt-2 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="relative h-64">
        <img
          src={selectedRestaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
          alt={selectedRestaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link
          to="/"
          className="absolute top-4 left-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <div className="card p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedRestaurant.name}</h1>
          <p className="text-gray-500 mb-4">{selectedRestaurant.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-1 text-gray-600">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{selectedRestaurant.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{selectedRestaurant.delivery_time} min</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{selectedRestaurant.address}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{selectedRestaurant.phone}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Delivery Fee</span>
              <p className="font-semibold">${selectedRestaurant.delivery_fee.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Cuisine</span>
              <p className="font-semibold">{selectedRestaurant.cuisine_type}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {cartItemCount > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-primary-500 text-white py-4 px-6 rounded-full shadow-lg flex items-center justify-between hover:bg-primary-600 transition-colors z-50"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="font-bold">{cartItemCount}</span>
            </div>
            <span className="font-medium">View Cart</span>
          </div>
          <span className="font-bold">→</span>
        </Link>
      )}
    </div>
  );
}
