<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';
import { Navbar } from './components';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  RestaurantPage,
  CartPage,
  CheckoutPage,
  OrdersPage,
  OrderDetailPage,
  ProfilePage,
} from './pages';

function App() {
  const { setUser } = useStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
=======
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';
import { Navbar } from './components';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  RestaurantPage,
  CartPage,
  CheckoutPage,
  OrdersPage,
  OrderDetailPage,
  ProfilePage,
  ReviewPage,
  RestaurantDashboard,
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/src/App.tsx
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/src/App.tsx
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/src/App.tsx
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/src/App.tsx
=======
  DriverDashboard,
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/src/App.tsx
=======
  DriverDashboard,
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/src/App.tsx
=======
  DriverDashboard,
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/src/App.tsx
=======
  DriverDashboard,
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/src/App.tsx
} from './pages';

function App() {
  const { setUser } = useStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/:id/review" element={<ReviewPage />} />
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/src/App.tsx
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/src/App.tsx
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/src/App.tsx
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/src/App.tsx
=======
          <Route path="/dashboard/driver" element={<DriverDashboard />} />
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/src/App.tsx
=======
          <Route path="/dashboard/driver" element={<DriverDashboard />} />
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/src/App.tsx
=======
          <Route path="/dashboard/driver" element={<DriverDashboard />} />
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/src/App.tsx
=======
          <Route path="/dashboard/driver" element={<DriverDashboard />} />
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/src/App.tsx
          <Route path="/dashboard/restaurant" element={<RestaurantDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/src/App.tsx
