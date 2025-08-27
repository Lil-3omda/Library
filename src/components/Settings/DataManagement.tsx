import React, { useRef, useState } from 'react';
import { Download, Upload, Database, FileText, Sprout, BookOpen } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export function DataManagement() {
  const { books, borrowRecords, categories, createSeedData } = useLibrary();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateSeedData = async () => {
    if (!window.confirm('This will create sample books and members. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      await createSeedData();
      alert('Sample data created successfully!');
    } catch (error) {
      console.error('Error creating seed data:', error);
      alert('Failed to create seed data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        // TODO: Implement import for library data
        alert('Import functionality will be implemented with Firebase integration!');
      } catch (error) {
        alert('Error reading file. Make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadJSONFile = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportBooks = () => {
    const data = {
      books: books,
      lastUpdated: new Date().toISOString()
    };
    downloadJSONFile(data, `books_${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportBorrows = () => {
    const data = {
      borrowRecords: borrowRecords,
      lastUpdated: new Date().toISOString()
    };
    downloadJSONFile(data, `borrows_${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportCategories = () => {
    const data = {
      categories: categories,
      lastUpdated: new Date().toISOString()
    };
    downloadJSONFile(data, `categories_${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportAllData = () => {
    const data = {
      books: books,
      borrowRecords: borrowRecords,
      categories: categories,
      lastUpdated: new Date().toISOString()
    };
    downloadJSONFile(data, `library_data_${new Date().toISOString().split('T')[0]}.json`);
  };

  return (
    <div className="space-y-6">
      {/* Seed Data Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sprout className="w-6 h-6" />
          Sample Data
        </h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 mb-3">
            Create sample books, categories, and library members for testing and demonstration purposes.
          </p>
          <button
            onClick={handleCreateSeedData}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Sprout className="w-4 h-4" />
            )}
            {loading ? 'Creating...' : 'Create Sample Data'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-6 h-6" />
          Data Management
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Export Data</h3>
            
            <div className="space-y-3">
              <button
                onClick={exportAllData}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export All Library Data
              </button>
              
              <button
                onClick={exportBooks}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Export Books Only
              </button>
              
              <button
                onClick={exportBorrows}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Export Borrow Records
              </button>
              
              <button
                onClick={exportCategories}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Export Categories
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Import Data</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors mx-auto"
              >
                <Upload className="w-4 h-4" />
                Choose JSON File
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Select a JSON file to import data
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Importing data will replace current data. Make sure to backup first.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{books.length}</div>
            <div className="text-sm text-blue-800">Books</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{borrowRecords.length}</div>
            <div className="text-sm text-green-800">Borrow Records</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
            <div className="text-sm text-purple-800">Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
}