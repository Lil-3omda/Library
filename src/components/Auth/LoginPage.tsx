import React, { useState } from 'react';
import { LogIn, Package, Key, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSeedData, setShowSeedData] = useState(false);
  
  const { login, createAdminUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.message || 'فشل في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeedData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await createAdminUser();
      setShowSeedData(false);
      alert('تم إنشاء البيانات التجريبية بنجاح! يمكنك الآن تسجيل الدخول باستخدام admin@library.com / Admin123');
    } catch (error: any) {
      setError(error.message || 'فشل في إنشاء البيانات التجريبية');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@library.com');
    setPassword('Admin123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
          <Package className="w-12 h-12 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">نظام إدارة القرطاسية</h1>
          <p className="text-blue-100 mt-1">بوابة الدخول الآمنة</p>
        </div>

        {/* Login Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* Demo/Test Section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-3">
              <strong>النمط التجريبي:</strong>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded border transition-colors"
              >
تعبئة بيانات المدير
              </button>
              
              <button
                type="button"
                onClick={() => setShowSeedData(!showSeedData)}
                className="text-sm bg-green-100 hover:bg-green-200 text-green-800 py-2 px-3 rounded border transition-colors"
              >
{showSeedData ? 'إخفاء' : 'عرض'} خيارات البيانات التجريبية
              </button>
            </div>

            {showSeedData && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 mb-2">
                  إنشاء حساب مدير تجريبي وبيانات تجريبية:
                </p>
                <button
                  onClick={handleCreateSeedData}
                  disabled={loading}
                  className="w-full text-sm bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded disabled:opacity-50"
                >
إنشاء البيانات التجريبية
                </button>
                <div className="mt-2 text-xs text-yellow-700">
                  <strong>المدير:</strong> admin@library.com / Admin123
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};