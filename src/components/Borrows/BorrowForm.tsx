import React, { useState } from 'react';
import { Save, X, BookOpen, User, Calendar } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { BarcodeInput } from '../Barcode/BarcodeInput';

interface BorrowFormProps {
  onClose: () => void;
}

export const BorrowForm: React.FC<BorrowFormProps> = ({ onClose }) => {
  const { books, libraryUsers, borrowBook, findBookByBarcode } = useLibrary();
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default due date to 2 weeks from now
  React.useEffect(() => {
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    setDueDate(twoWeeksFromNow.toISOString().split('T')[0]);
  }, []);

  const handleBarcodeScanned = async (scannedBarcode: string) => {
    if (!scannedBarcode.trim()) return;
    
    setBarcode(scannedBarcode);
    
    try {
      const book = await findBookByBarcode(scannedBarcode);
      if (book) {
        setSelectedBookId(book.id);
        setErrors(prev => ({ ...prev, book: '' }));
      } else {
        setErrors(prev => ({ ...prev, book: 'No book found with this barcode' }));
        setSelectedBookId('');
      }
    } catch (error) {
      console.error('Error finding book by barcode:', error);
      setErrors(prev => ({ ...prev, book: 'Error searching for book' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedBookId) {
      newErrors.book = 'Please select a book';
    } else {
      const book = books.find(b => b.id === selectedBookId);
      if (book && book.availableCopies <= 0) {
        newErrors.book = 'This book is not available for borrowing';
      }
    }

    if (!selectedUserId) {
      newErrors.user = 'Please select a member';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Please set a due date';
    } else {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (due <= today) {
        newErrors.dueDate = 'Due date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await borrowBook(selectedBookId, selectedUserId, dueDate);
      onClose();
    } catch (error) {
      console.error('Error creating borrow record:', error);
      alert('فشل في إنشاء سجل الإعارة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const availableBooks = books.filter(book => book.availableCopies > 0);
  const activeUsers = libraryUsers.filter(user => user.status === 'active');

  const selectedBook = books.find(b => b.id === selectedBookId);
  const selectedUser = libraryUsers.find(u => u.id === selectedUserId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">New Book Loan</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Book Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select Book</h3>
            
            {/* Barcode Scanner */}
            <div>
              <BarcodeInput
                value={barcode}
                onChange={setBarcode}
                onScan={handleBarcodeScanned}
                label="مسح باركود الكتاب (اختياري)"
                placeholder="امسح الباركود لاختيار الكتاب تلقائيا"
              />
            </div>

            {/* Manual Book Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Select Book Manually *
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => {
                  setSelectedBookId(e.target.value);
                  setErrors(prev => ({ ...prev, book: '' }));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.book ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a book...</option>
                {availableBooks.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} by {book.author} (Available: {book.availableCopies})
                  </option>
                ))}
              </select>
              {errors.book && <p className="text-red-500 text-sm mt-1">{errors.book}</p>}
            </div>

            {/* Selected Book Details */}
            {selectedBook && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Selected Book:</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Title:</strong> {selectedBook.title}</p>
                  <p><strong>Author:</strong> {selectedBook.author}</p>
                  <p><strong>ISBN:</strong> {selectedBook.isbn}</p>
                  <p><strong>Available Copies:</strong> {selectedBook.availableCopies}/{selectedBook.totalCopies}</p>
                  {selectedBook.location && <p><strong>Location:</strong> {selectedBook.location}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Member Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select Member</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Library Member *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setErrors(prev => ({ ...prev, user: '' }));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.user ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a member...</option>
                {activeUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) - {user.membershipType}
                  </option>
                ))}
              </select>
              {errors.user && <p className="text-red-500 text-sm mt-1">{errors.user}</p>}
            </div>

            {/* Selected User Details */}
            {selectedUser && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Selected Member:</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Type:</strong> {selectedUser.membershipType}</p>
                  <p><strong>Max Books:</strong> {selectedUser.maxBooksAllowed}</p>
                </div>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Loan Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    setErrors(prev => ({ ...prev, dueDate: '' }));
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedBookId || !selectedUserId}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Loan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};