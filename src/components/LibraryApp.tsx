import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './Layout/Header';
import { Sidebar } from './Layout/Sidebar';
import { Dashboard } from './Dashboard/Dashboard';
import { BookList } from './Books/BookList';
import { BookForm } from './Books/BookForm';
import { UserList } from './Users/UserList';
import { BorrowList } from './Borrows/BorrowList';
import { BorrowForm } from './Borrows/BorrowForm';
import { DataManagement } from './Settings/DataManagement';
import { BarcodeTestPage } from './TestBarcode/BarcodeTestPage';

export const LibraryApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showBorrowForm, setShowBorrowForm] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'books':
        return <BookList onAddBook={() => setShowAddBook(true)} />;
      case 'users':
        return <UserList />;
      case 'borrows':
        return <BorrowList onAddBorrow={() => setShowBorrowForm(true)} />;
      case 'settings':
        return <DataManagement />;
      case 'barcode-test':
        return <BarcodeTestPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      {showAddBook && (
        <BookForm onClose={() => setShowAddBook(false)} />
      )}
      
      {showBorrowForm && (
        <BorrowForm onClose={() => setShowBorrowForm(false)} />
      )}
    </div>
  );
};