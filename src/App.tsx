import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CityModal } from './components/CityModal';
import { CatalogueScreen } from './screens/CatalogueScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { HampersScreen } from './screens/HampersScreen';
import { OrderTrackingScreen } from './screens/OrderTrackingScreen';
import { OrderConfirmationScreen } from './screens/OrderConfirmationScreen';
import { ConciergeScreen } from './screens/ConciergeScreen';
import { MerchantConsoleScreen } from './screens/MerchantConsoleScreen';
import { CustomerAuthScreen } from './screens/CustomerAuthScreen';
import { AdminAuthScreen } from './screens/AdminAuthScreen';
import { CustomerProfileScreen } from './screens/CustomerProfileScreen';

const MainLayout: React.FC = () => {
  const { currentScreen, isAdminAuthenticated } = useApp();
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);

  // Protected Admin Check: If trying to access admin without authentication, render AdminAuthScreen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'catalogue':
      case 'home':
        return <CatalogueScreen onOpenCityModal={() => setIsCityModalOpen(true)} />;
      case 'pdp':
        return <ProductDetailScreen />;
      case 'checkout':
      case 'cart':
        return <CheckoutScreen />;
      case 'hampers':
        return <HampersScreen />;
      case 'tracking':
        return <OrderTrackingScreen />;
      case 'confirmation':
        return <OrderConfirmationScreen />;
      case 'concierge':
        return <ConciergeScreen />;
      case 'login':
        return <CustomerAuthScreen />;
      case 'profile':
        return <CustomerProfileScreen />;
      case 'admin-login':
        return <AdminAuthScreen />;
      case 'admin':
        return isAdminAuthenticated ? <MerchantConsoleScreen /> : <AdminAuthScreen />;
      default:
        return <CatalogueScreen onOpenCityModal={() => setIsCityModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#201a16] flex flex-col font-jakarta">
      {/* Show custom Header on standard screens, PDP has its own contextual nav, Admin has its own dock */}
      {currentScreen !== 'pdp' && currentScreen !== 'admin' && currentScreen !== 'checkout' && (
        <Header onOpenCityModal={() => setIsCityModalOpen(true)} />
      )}

      {/* Main Screen Router */}
      <div className="flex-1">{renderScreen()}</div>

      {/* Bottom Navigation for customer browsing screens */}
      {currentScreen !== 'pdp' && currentScreen !== 'checkout' && currentScreen !== 'admin' && (
        <BottomNav />
      )}

      {/* Floating WhatsApp Quick Action Button (Direct standard wa.me link) */}
      {currentScreen !== 'admin' && (
        <aside aria-label="WhatsApp Support" className="fixed bottom-20 right-4 z-40">
          <a
            href="https://wa.me/917993785371?text=Hello%20Deepam%20Royal%20Sparks%2C%20I%20have%20an%20inquiry%20regarding%20crackers."
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Direct WhatsApp Chat with +91 79937 85371"
            className="w-12 h-12 bg-[#25D366] hover:bg-[#1ebc57] text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border-2 border-white cursor-pointer"
            title="Chat with us on WhatsApp (+91 79937 85371)"
          >
            <span className="material-symbols-outlined text-[26px]">chat</span>
          </a>
        </aside>
      )}

      {/* City Switcher Modal */}
      <CityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
