import React, { useState } from 'react';
import { Keyboard, BookOpen, Users, RotateCcw, CheckCircle, XCircle, TestTube, Database, Play, Trash2 } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { USBBarcodeInput } from '../Barcode/USBBarcodeInput';
import { BarcodeInput } from '../Barcode/BarcodeInput';

export function BarcodeTestPage() {
  const { books, findBookByBarcode, findBookByISBN } = useLibrary();
  const [testBarcode, setTestBarcode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [testResults, setTestResults] = useState<Array<{
    barcode: string;
    found: boolean;
    book?: any;
    timestamp: string;
    searchType: 'barcode' | 'isbn';
    searchTime: number;
  }>>([]);

  // Sample library barcodes for testing
  const sampleBarcodes = [
    { code: '9780140449136', title: 'The Odyssey', author: 'Homer', type: 'ISBN' },
    { code: '9780061120084', title: 'To Kill a Mockingbird', author: 'Harper Lee', type: 'ISBN' },
    { code: '9780451524935', title: '1984', author: 'George Orwell', type: 'ISBN' },
    { code: '9780743273565', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', type: 'ISBN' },
    { code: '9780547928227', title: 'The Hobbit', author: 'J.R.R. Tolkien', type: 'ISBN' },
    { code: 'LIB001234567', title: 'Custom Library Barcode', author: 'Test Author', type: 'Barcode' },
    { code: 'LIB987654321', title: 'Another Library Book', author: 'Another Author', type: 'Barcode' }
  ];

  // Performance test data
  const [performanceResults, setPerformanceResults] = useState<{
    searchTime: number;
    totalTests: number;
    successRate: number;
  } | null>(null);

  const handleBarcodeTest = async (barcode: string) => {
    if (!barcode.trim()) return;

    const startTime = performance.now();
    
    // Try to find by barcode first, then by ISBN
    let book = await findBookByBarcode(barcode.trim());
    let searchType: 'barcode' | 'isbn' = 'barcode';
    
    if (!book && /^\d{10}(\d{3})?$/.test(barcode.replace(/[^0-9]/g, ''))) {
      // If not found by barcode and looks like ISBN, try ISBN search
      book = await findBookByISBN(barcode.trim());
      searchType = 'isbn';
    }
    
    const endTime = performance.now();
    const searchTime = endTime - startTime;
    
    const result = {
      barcode: barcode.trim(),
      found: !!book,
      book: book,
      timestamp: new Date().toLocaleString(),
      searchType: searchType,
      searchTime: searchTime
    };
    
    setScanResult(result);
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
    
    console.log(`Barcode search completed in ${searchTime.toFixed(2)}ms via ${searchType}`);
  };

  const runPerformanceTest = async () => {
    const startTime = performance.now();
    let successCount = 0;
    const totalTests = sampleBarcodes.length;
    
    for (const sample of sampleBarcodes) {
      const book = await findBookByBarcode(sample.code) || await findBookByISBN(sample.code);
      if (book) successCount++;
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    setPerformanceResults({
      searchTime: totalTime,
      totalTests,
      successRate: (successCount / totalTests) * 100
    });
  };

  const clearResults = () => {
    setTestResults([]);
    setScanResult(null);
    setPerformanceResults(null);
    setTestBarcode('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <TestTube className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Barcode Testing Lab</h1>
            <p className="text-gray-600">Test barcode scanning functionality and performance</p>
          </div>
        </div>

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-700">Books in Database: <strong>{books.length}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-700">With Barcodes: <strong>{books.filter(b => b.barcode).length}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-700">Scanner Ready: <strong>USB/Keyboard Mode</strong></span>
          </div>
        </div>
      </div>

      {/* Testing Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Testing */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Keyboard className="w-6 h-6" />
            Manual Testing
          </h2>

          <div className="space-y-4">
            {/* USB Scanner Input */}
            <div>
              <USBBarcodeInput
                onBarcodeScanned={handleBarcodeTest}
                placeholder="ركز هنا وامسح باستخدام ماسح الباركود USB..."
                label="مدخل ماسح USB"
                autoFocus={false}
              />
            </div>

            {/* Enhanced Barcode Input */}
            <div>
              <BarcodeInput
                value={testBarcode}
                onChange={setTestBarcode}
                onScan={handleBarcodeTest}
                label="مدخل الباركود متعدد الأنماط"
                showTestMode={true}
              />
            </div>

            {/* Quick Test Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Tests:</label>
              <div className="grid grid-cols-2 gap-2">
                {sampleBarcodes.slice(0, 4).map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => handleBarcodeTest(sample.code)}
                    className="text-left p-2 border border-gray-200 rounded hover:bg-blue-50 text-xs transition-colors"
                  >
                    <div className="font-mono text-blue-600">{sample.code}</div>
                    <div className="text-gray-600 truncate">{sample.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Result */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TestTube className="w-6 h-6" />
            Test Result
          </h2>

          {scanResult ? (
            <div className={`p-4 rounded-lg border-2 ${scanResult.found ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                {scanResult.found ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <span className={`font-medium ${scanResult.found ? 'text-green-800' : 'text-red-800'}`}>
                  {scanResult.found ? 'Book Found!' : 'Book Not Found'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div><strong>Scanned Code:</strong> <code className="bg-white px-2 py-1 rounded">{scanResult.barcode}</code></div>
                <div><strong>Search Method:</strong> {scanResult.searchType.toUpperCase()}</div>
                <div><strong>Search Time:</strong> {scanResult.searchTime.toFixed(2)}ms</div>
                <div><strong>Timestamp:</strong> {scanResult.timestamp}</div>
                
                {scanResult.found && scanResult.book && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-900">{scanResult.book.title}</h4>
                    <p className="text-gray-600">by {scanResult.book.author}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div><strong>ISBN:</strong> {scanResult.book.isbn}</div>
                      <div><strong>Available:</strong> {scanResult.book.availableCopies}/{scanResult.book.totalCopies}</div>
                      <div><strong>Category:</strong> {scanResult.book.category}</div>
                      <div><strong>Location:</strong> {scanResult.book.location || 'Not specified'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TestTube className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Scan a barcode to see results here</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Testing */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Play className="w-6 h-6" />
            Performance Testing
          </h2>
          <div className="flex gap-2">
            <button
              onClick={runPerformanceTest}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Run Performance Test
            </button>
            <button
              onClick={clearResults}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Results
            </button>
          </div>
        </div>

        {performanceResults && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{performanceResults.searchTime.toFixed(2)}ms</div>
              <div className="text-sm text-blue-800">Total Search Time</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{performanceResults.totalTests}</div>
              <div className="text-sm text-green-800">Tests Performed</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{performanceResults.successRate.toFixed(1)}%</div>
              <div className="text-sm text-purple-800">Success Rate</div>
            </div>
          </div>
        )}

        {/* Sample Barcodes */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Sample Test Barcodes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleBarcodes.map((sample, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <div className="font-mono text-sm text-blue-600">{sample.code}</div>
                  <div className="text-sm text-gray-600">{sample.title} - {sample.author}</div>
                  <div className="text-xs text-gray-500">{sample.type}</div>
                </div>
                <button
                  onClick={() => handleBarcodeTest(sample.code)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  Test
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test History */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test History</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded border ${
                result.found ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center gap-3">
                  {result.found ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-mono text-sm">{result.barcode}</div>
                    {result.found && result.book && (
                      <div className="text-sm text-gray-600">{result.book.title}</div>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{result.searchType.toUpperCase()}</div>
                  <div>{result.searchTime.toFixed(2)}ms</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}