import React, { useState } from 'react';
import { Search, Plus, RotateCcw, Calendar, User, BookOpen } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { BorrowRecord } from '../../types';

interface BorrowListProps {
  onAddBorrow: () => void;
}

export const BorrowList: React.FC<BorrowListProps> = ({ onAddBorrow }) => {
  const { borrowRecords, returnBook } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filter borrow records
  const filteredBorrows = borrowRecords.filter(borrow => {
    const matchesSearch = 
      borrow.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrow.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || borrow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleReturn = async (borrowRecord: BorrowRecord) => {
    if (window.confirm(`Return "${borrowRecord.bookTitle}" for ${borrowRecord.userName}?`)) {
      try {
        await returnBook(borrowRecord.id);
      } catch (error) {
        console.error('Error returning book:', error);
        alert('Failed to return book');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'borrowed': return 'text-blue-600 bg-blue-50';
      case 'returned': return 'text-green-600 bg-green-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Borrowing Records</h1>
          <p className="text-gray-600">Track book loans and returns</p>
        </div>
        <button
          onClick={onAddBorrow}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Loan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by book title or member name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="borrowed">Currently Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Loans</p>
              <p className="text-2xl font-bold text-gray-900">{borrowRecords.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold">📖</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Currently Out</p>
              <p className="text-2xl font-bold text-blue-600">
                {borrowRecords.filter(b => b.status === 'borrowed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Returned</p>
              <p className="text-2xl font-bold text-green-600">
                {borrowRecords.filter(b => b.status === 'returned').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {borrowRecords.filter(b => b.status === 'borrowed' && isOverdue(b.dueDate)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Records Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book & Member
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBorrows.map((borrow) => (
                <tr key={borrow.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{borrow.bookTitle}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {borrow.userName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        Borrowed: {new Date(borrow.borrowDate).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        Due: {new Date(borrow.dueDate).toLocaleDateString()}
                        {borrow.status === 'borrowed' && isOverdue(borrow.dueDate) && (
                          <span className="text-red-600 font-medium ml-2">
                            ({getDaysOverdue(borrow.dueDate)} days overdue)
                          </span>
                        )}
                      </div>
                      {borrow.returnDate && (
                        <div className="text-green-600">
                          Returned: {new Date(borrow.returnDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      borrow.status === 'borrowed' && isOverdue(borrow.dueDate) 
                        ? 'text-red-600 bg-red-50' 
                        : getStatusColor(borrow.status)
                    }`}>
                      {borrow.status === 'borrowed' && isOverdue(borrow.dueDate) 
                        ? 'Overdue' 
                        : borrow.status.charAt(0).toUpperCase() + borrow.status.slice(1)
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {borrow.status === 'borrowed' && (
                      <button
                        onClick={() => handleReturn(borrow)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Return Book
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBorrows.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No borrow records found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter 
              ? "Try adjusting your search criteria" 
              : "Start by creating a new loan"
            }
          </p>
        </div>
      )}
    </div>
  );
};