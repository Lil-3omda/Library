import React, { useState } from 'react';
import { Save, X, BookOpen } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types';
import { BarcodeInput } from '../Barcode/BarcodeInput';

interface BookFormProps {
  book?: Book;
  onClose: () => void;
}

export const BookForm: React.FC<BookFormProps> = ({ book, onClose }) => {
  const { addBook, updateBook, categories, findBookByBarcode, findBookByISBN } = useLibrary();
  const isEditing = !!book;

  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    category: book?.category || '',
    publisher: book?.publisher || '',
    publicationYear: book?.publicationYear || new Date().getFullYear(),
    totalCopies: book?.totalCopies || 1,
    availableCopies: book?.availableCopies || 1,
    barcode: book?.barcode || '',
    description: book?.description || '',
    location: book?.location || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    if (!barcode.trim()) return;
    
    setFormData(prev => ({ ...prev, barcode: barcode.trim() }));
    
    // Auto-fill if this is a new book and we can find data by barcode
    if (!isEditing && barcode.trim() !== book?.barcode) {
      try {
        const existingBook = await findBookByBarcode(barcode.trim());
        if (existingBook) {
          setErrors(prev => ({ ...prev, barcode: 'A book with this barcode already exists' }));
        }
      } catch (error) {
        console.error('Error checking barcode:', error);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = 'ISBN is required';
    } else if (!/^(?:\d{10}|\d{13})$/.test(formData.isbn.replace(/[^0-9]/g, ''))) {
      newErrors.isbn = 'Please enter a valid 10 or 13 digit ISBN';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.publisher.trim()) {
      newErrors.publisher = 'Publisher is required';
    }

    if (formData.publicationYear < 1000 || formData.publicationYear > new Date().getFullYear() + 1) {
      newErrors.publicationYear = 'Please enter a valid publication year';
    }

    if (formData.totalCopies < 1) {
      newErrors.totalCopies = 'Total copies must be at least 1';
    }

    if (formData.availableCopies < 0 || formData.availableCopies > formData.totalCopies) {
      newErrors.availableCopies = 'Available copies must be between 0 and total copies';
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
      // Check for duplicates when adding new book
      if (!isEditing) {
        const existingByISBN = await findBookByISBN(formData.isbn);
        if (existingByISBN) {
          setErrors({ isbn: 'A book with this ISBN already exists' });
          setLoading(false);
          return;
        }

        if (formData.barcode) {
          const existingByBarcode = await findBookByBarcode(formData.barcode);
          if (existingByBarcode) {
            setErrors({ barcode: 'A book with this barcode already exists' });
            setLoading(false);
            return;
          }
        }
      }

      if (isEditing && book) {
        await updateBook(book.id, formData);
      } else {
        await addBook(formData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('فشل في حفظ الكتاب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Book' : 'Add New Book'}
            </h2>
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
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="أدخل عنوان الكتاب"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.author ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="أدخل اسم المؤلف"
                />
                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISBN *
                </label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => handleInputChange('isbn', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.isbn ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="أدخل الردمك (10 أو 13 رقم)"
                />
                {errors.isbn && <p className="text-red-500 text-sm mt-1">{errors.isbn}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                  <option value="Fiction">Fiction</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="Programming">Programming</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>
          </div>

          {/* Publication Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Publication Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publisher *
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => handleInputChange('publisher', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.publisher ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="أدخل اسم الناشر"
                />
                {errors.publisher && <p className="text-red-500 text-sm mt-1">{errors.publisher}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publication Year *
                </label>
                <input
                  type="number"
                  value={formData.publicationYear}
                  onChange={(e) => handleInputChange('publicationYear', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.publicationYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="أدخل سنة النشر"
                  min="1000"
                  max={new Date().getFullYear() + 1}
                />
                {errors.publicationYear && <p className="text-red-500 text-sm mt-1">{errors.publicationYear}</p>}
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Inventory</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Copies *
                </label>
                <input
                  type="number"
                  value={formData.totalCopies}
                  onChange={(e) => handleInputChange('totalCopies', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.totalCopies ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="عدد النسخ الإجمالي"
                  min="1"
                />
                {errors.totalCopies && <p className="text-red-500 text-sm mt-1">{errors.totalCopies}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Copies *
                </label>
                <input
                  type="number"
                  value={formData.availableCopies}
                  onChange={(e) => handleInputChange('availableCopies', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.availableCopies ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="عدد النسخ المتاحة"
                  min="0"
                  max={formData.totalCopies}
                />
                {errors.availableCopies && <p className="text-red-500 text-sm mt-1">{errors.availableCopies}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shelf Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مثال: أ1-الأدب، ب2-العلوم"
              />
            </div>
          </div>

          {/* Barcode */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">الباركود</h3>
            <BarcodeInput
              value={formData.barcode}
              onChange={(value) => handleInputChange('barcode', value)}
              onScan={handleBarcodeScanned}
              label="Barcode (Optional)"
              placeholder="امسح أو أدخل الباركود"
            />
            {errors.barcode && <p className="text-red-500 text-sm mt-1">{errors.barcode}</p>}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">الوصف</h3>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل وصف الكتاب (اختياري)"
            />
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
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? 'Update Book' : 'Add Book'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};