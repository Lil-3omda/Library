import React, { createContext, useContext, ReactNode, useState } from 'react';
import { Product, Sale, Category } from '../types';
import { defaultCategories } from '../data/categories';

interface AppContextType {
  products: Product[];
  setProducts: (products: Product[] | ((prev: Product[]) => Product[])) => void;
  sales: Sale[];
  setSales: (sales: Sale[] | ((prev: Sale[]) => Sale[])) => void;
  categories: Category[];
  setCategories: (categories: Category[] | ((prev: Category[]) => Category[])) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  getLowStockProducts: () => Product[];
  isLoading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id 
        ? { ...product, ...productData, updatedAt: new Date().toISOString() }
        : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'date'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setSales(prev => [...prev, newSale]);
    
    // Update product quantity
    updateProduct(saleData.productId, {
      quantity: products.find(p => p.id === saleData.productId)!.quantity - saleData.quantity
    });
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.quantity <= product.minQuantity);
  };

  return (
    <AppContext.Provider value={{
      products,
      setProducts,
      sales,
      setSales,
      categories,
      setCategories,
      addProduct,
      updateProduct,
      deleteProduct,
      addSale,
      getLowStockProducts,
      isLoading,
      error,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}