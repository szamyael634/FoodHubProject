import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import type { Order } from '../types';

interface OrderCardProps {
  order: Order;
}

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<Order['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OrderCard({ order }: OrderCardProps) {
  const orderDate = new Date(order.created_at);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link to={`/orders/${order.id}`} className="card hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm text-gray-500">
              {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="font-medium text-gray-900 mt-1">
              {itemCount} item{itemCount !== 1 ? 's' : ''} • ${order.total.toFixed(2)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{order.delivery_address}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}
