import { Plus, Minus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateCartItemQuantity, removeFromCart } = useStore();

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-100">
      <img
        src={item.menu_item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
        alt={item.menu_item.name}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{item.menu_item.name}</h4>
        <p className="text-gray-500 text-sm">${item.menu_item.price.toFixed(2)} each</p>
        {item.special_instructions && (
          <p className="text-gray-400 text-xs mt-1">{item.special_instructions}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => updateCartItemQuantity(item.menu_item.id, item.quantity - 1)}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => updateCartItemQuantity(item.menu_item.id, item.quantity + 1)}
          className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="text-right">
        <p className="font-semibold">${(item.menu_item.price * item.quantity).toFixed(2)}</p>
        <button
          onClick={() => removeFromCart(item.menu_item.id)}
          className="text-red-500 hover:text-red-600 p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
