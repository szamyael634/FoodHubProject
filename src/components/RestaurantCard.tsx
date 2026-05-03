import { Link } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';
import type { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="card group hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!restaurant.is_open && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Closed</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-1">{restaurant.cuisine_type}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{restaurant.delivery_time} min</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>${restaurant.delivery_fee.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
