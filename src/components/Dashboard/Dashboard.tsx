import React from 'react';
import { BookOpen, Users, RotateCcw, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export function Dashboard() {
  const { books, libraryUsers, borrowRecords } = useLibrary();
  
  const totalBooks = books.length;
  const totalCopies = books.reduce((sum, book) => sum + book.totalCopies, 0);
  const availableCopies = books.reduce((sum, book) => sum + book.availableCopies, 0);
  const borrowedCopies = totalCopies - availableCopies;
  
  const totalMembers = libraryUsers.length;
  const activeMembers = libraryUsers.filter(user => user.status === 'active').length;
  
  const totalBorrows = borrowRecords.length;
  const activeBorrows = borrowRecords.filter(record => record.status === 'borrowed').length;
  const overdueBorrows = borrowRecords.filter(record => {
    return record.status === 'borrowed' && new Date(record.dueDate) < new Date();
  }).length;
  
  const lowStockBooks = books.filter(book => book.availableCopies < 2);
  
  const recentBorrows = borrowRecords
    .filter(record => record.status === 'borrowed')
    .slice(-5)
    .reverse();

  const statsCards = [
    {
      title: 'Total Books',
      value: totalBooks.toLocaleString(),
      subtitle: `${totalCopies} total copies`,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'Library Members',
      value: totalMembers.toLocaleString(),
      subtitle: `${activeMembers} active`,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Currently Borrowed',
      value: activeBorrows.toLocaleString(),
      subtitle: `${borrowedCopies} books out`,
      icon: RotateCcw,
      color: 'bg-purple-500',
    },
    {
      title: 'Alerts',
      value: (lowStockBooks.length + overdueBorrows).toLocaleString(),
      subtitle: `${lowStockBooks.length} low stock, ${overdueBorrows} overdue`,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Library Dashboard</h2>
        <p className="text-gray-600">Overview of library activities and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  {card.subtitle && <p className="text-xs text-gray-500">{card.subtitle}</p>}
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Borrowing Activity</h3>
          {recentBorrows.length > 0 ? (
            <div className="space-y-3">
              {recentBorrows.map((borrow) => (
                <div key={borrow.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{borrow.bookTitle}</p>
                    <p className="text-sm text-gray-500">
                      Borrowed by {borrow.userName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{new Date(borrow.borrowDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">Due: {new Date(borrow.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent borrowing activity</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock & Overdue Alerts</h3>
          {(lowStockBooks.length > 0 || overdueBorrows > 0) ? (
            <div className="space-y-3">
              {lowStockBooks.slice(0, 3).map((book) => (
                <div key={book.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-500">{book.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-yellow-600">{book.availableCopies} available</p>
                    <p className="text-sm text-gray-500">Low stock alert</p>
                  </div>
                </div>
              ))}
              {overdueBorrows > 0 && (
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-red-600">Overdue Books</p>
                      <p className="text-sm text-gray-500">Books past due date</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">{overdueBorrows} books</p>
                      <p className="text-sm text-gray-500">Need attention</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No alerts at this time</p>
          )}
        </div>
      </div>
    </div>
  );
}