import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Bell, Search, LayoutDashboard } from 'lucide-react';
import { useStore, getCartItemCount } from '../store/useStore';
import { signOut } from '../lib/supabase';
import { NotificationBell } from './NotificationBell';
import { useState } from 'react';

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, cart, searchQuery, setSearchQuery, setUser } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItemCount = getCartItemCount(cart);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900">FoodHub</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'customer' && <NotificationBell user={user} />}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-500"
                  >
                    <User className="w-6 h-6" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                      <div className="px-4 py-2 border-b">
                        <p className="font-medium">{user?.full_name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      {user?.role === 'restaurant' && (
                        <Link
                          to="/dashboard/restaurant"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Restaurant Dashboard</span>
                        </Link>
                      )}
                      {user?.role === 'driver' && (
                        <Link
                          to="/dashboard/driver"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Driver Dashboard</span>
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-500 font-medium"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
