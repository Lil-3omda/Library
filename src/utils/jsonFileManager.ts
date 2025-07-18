import { Product, Sale, Category } from '../types';

export interface JSONData {
  products?: Product[];
  sales?: Sale[];
  categories?: Category[];
  lastUpdated?: string;
}

export class JSONFileManager {
  private static instance: JSONFileManager;
  
  private constructor() {}
  
  static getInstance(): JSONFileManager {
    if (!JSONFileManager.instance) {
      JSONFileManager.instance = new JSONFileManager();
    }
    return JSONFileManager.instance;
  }

  // Save data to localStorage with JSON structure
  saveToStorage(key: string, data: any): void {
    try {
      const jsonData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(jsonData));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }

  // Load data from localStorage
  loadFromStorage(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error loading from localStorage key "${key}":`, error);
      return null;
    }
  }

  // Auto-save all data types
  autoSave(products: Product[], sales: Sale[], categories: Category[]): void {
    this.saveToStorage('products_json', { products });
    this.saveToStorage('sales_json', { sales });
    this.saveToStorage('categories_json', { categories });
  }

  // Export data as downloadable JSON file
  exportJSON(data: any, filename: string): void {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
    }
  }

  // Import data from JSON file
  importJSON(file: File): Promise<JSONData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  // Generate backup filename with timestamp
  generateBackupFilename(prefix: string = 'backup'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}_${timestamp}.json`;
  }

  // Validate JSON data structure
  validateJSONData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    // Check if it has at least one of the expected properties
    const hasValidStructure = data.products || data.sales || data.categories;
    
    if (data.products && !Array.isArray(data.products)) return false;
    if (data.sales && !Array.isArray(data.sales)) return false;
    if (data.categories && !Array.isArray(data.categories)) return false;
    
    return hasValidStructure;
  }

  // Get all stored JSON data
  getAllStoredData(): JSONData {
    const products = this.loadFromStorage('products_json')?.products || [];
    const sales = this.loadFromStorage('sales_json')?.sales || [];
    const categories = this.loadFromStorage('categories_json')?.categories || [];
    
    return {
      products,
      sales,
      categories,
      lastUpdated: new Date().toISOString()
    };
  }

  // Clear all stored data
  clearAllData(): void {
    localStorage.removeItem('products_json');
    localStorage.removeItem('sales_json');
    localStorage.removeItem('categories_json');
    localStorage.removeItem('inventory_products');
    localStorage.removeItem('inventory_sales');
    localStorage.removeItem('inventory_categories');
  }
}