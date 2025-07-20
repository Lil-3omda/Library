import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Product, Sale, Category } from '../types';
import { defaultCategories } from '../data/categories';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { JSONFileManager } from '../utils/jsonFileManager';

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
  addBulkSales: (sales: Array<Omit<Sale, 'id' | 'date'>>) => void;
  getLowStockProducts: () => Product[];
  findProductByBarcode: (barcode: string) => Product | undefined;
  exportToJSON: () => void;
  importFromJSON: (jsonData: any) => void;
  isLoading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useLocalStorage<Product[]>('inventory_products', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('inventory_sales', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('inventory_categories', defaultCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jsonManager = JSONFileManager.getInstance();

  // Auto-save to JSON files whenever data changes
  useEffect(() => {
    jsonManager.autoSave(products, sales, categories);
  }, [products, sales, categories]);

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
    
    // Update product quantity - fix the closure issue
    setProducts(prev => prev.map(product => 
      product.id === saleData.productId 
        ? { ...product, quantity: product.quantity - saleData.quantity, updatedAt: new Date().toISOString() }
        : product
    ));
  };

  const addBulkSales = (salesData: Array<Omit<Sale, 'id' | 'date'>>) => {
    const now = new Date().toISOString();
    const newSales: Sale[] = salesData.map((sale, index) => ({
      ...sale,
      id: (Date.now() + index).toString(),
      date: now,
    }));
    
    setSales(prev => [...prev, ...newSales]);
    
    // Update product quantities for all items in bulk
    setProducts(prev => prev.map(product => {
      const saleForProduct = salesData.find(sale => sale.productId === product.id);
      if (saleForProduct) {
        return {
          ...product,
          quantity: product.quantity - saleForProduct.quantity,
          updatedAt: now
        };
      }
      return product;
    }));
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.quantity <= product.minQuantity);
  };

  const findProductByBarcode = (barcode: string) => {
    return products.find(product => product.barcode === barcode);
  };

  const exportToJSON = () => {
    const data = {
      products: products,
      sales: sales,
      categories: categories,
      exportDate: new Date().toISOString()
    };
    
    const filename = jsonManager.generateBackupFilename('inventory_backup');
    jsonManager.exportJSON(data, filename);
  };

  const importFromJSON = (jsonData: any) => {
    try {
      if (!jsonManager.validateJSONData(jsonData)) {
        setError('ملف JSON غير صالح');
        return;
      }
      
      if (jsonData.products) {
        setProducts(jsonData.products);
      }
      if (jsonData.sales) {
        setSales(jsonData.sales);
      }
      if (jsonData.categories) {
        setCategories(jsonData.categories);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error importing JSON data:', error);
      setError('خطأ في استيراد البيانات');
    }
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
      addBulkSales,
      getLowStockProducts,
      findProductByBarcode,
      exportToJSON,
      importFromJSON,
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