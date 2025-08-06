import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProductList } from './components/Products/ProductList';
import { ProductForm } from './components/Products/ProductForm';
import { SalesList } from './components/Sales/SalesList';
import { QuickSale } from './components/Sales/QuickSale';
import { LowStockAlert } from './components/LowStock/LowStockAlert';
import { DataManagement } from './components/Settings/DataManagement';
import { BarcodeTestPage } from './components/TestBarcode/BarcodeTestPage';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductList />;
      case 'add-product':
        setShowAddProduct(true);
        setActiveTab('products');
        return <ProductList />;
      case 'quick-sale':
        return <QuickSale />;
      case 'sales':
        return <SalesList />;
      case 'low-stock':
        return <LowStockAlert />;
      case 'settings':
        return <DataManagement />;
      case 'barcode-test':
        return <BarcodeTestPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100 flex" dir="rtl">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>

        {showAddProduct && (
          <ProductForm onClose={() => setShowAddProduct(false)} />
        )}
      </div>
    </AppProvider>
  );
}

export default App;