# Library Management System

A modern, web-based library management system built with React, TypeScript, Firebase, and Tailwind CSS. Features barcode scanning, user management, book borrowing, and real-time data synchronization.

## 🚀 Features

### 🔹 Barcode Scanner Integration
- **Physical Device Support**: Works with Panzer USB barcode scanner (acts as keyboard input)
- **Automatic Field Population**: Scanned barcodes automatically fill book ID/ISBN fields
- **Test Mode**: Manual input and "Simulate Scan" for testing without physical device
- **Mock Barcodes**: Pre-configured test barcodes linked to sample books

### 🔹 Authentication & User Management
- **Firebase Authentication**: Secure login system
- **Admin Account**: Pre-configured admin@library.com / Admin123
- **User Roles**: Admin access control
- **Automatic Redirect**: Login page with redirect to dashboard

### 🔹 Persistent Data Storage
- **Firebase Firestore**: NoSQL cloud database for all data
- **Real-time Sync**: Data updates in real-time across all clients
- **Data Persistence**: Information survives deployments and refreshes
- **Offline Capability**: Local caching for temporary offline access

### 🔹 Library Management
- **Book Inventory**: Add, edit, delete books with barcode support
- **Member Management**: Track library members with different membership types
- **Borrowing System**: Check out and return books with due dates
- **Category Management**: Organize books by categories
- **Low Stock Alerts**: Automatic notifications for books with few copies

### 🔹 Testing & Debug Features
- **Debug Mode**: Special testing interface for barcode functionality
- **Sample Data**: One-click seed data creation for testing
- **Mock Barcodes**: Pre-configured test barcodes for popular books
- **Simulation Tools**: Test barcode scanning without physical scanner

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Firebase (Authentication + Firestore)
- **Hosting**: Firebase Hosting
- **Barcode**: USB scanner support (keyboard emulation)

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### 1. Clone & Install
```bash
git clone <repository-url>
cd library-management-system
npm install
```

### 2. Firebase Setup
```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select:
# - Hosting: Configure files for Firebase Hosting
# - Firestore: Configure security rules and indexes
# - Authentication: Configure authentication
```

### 3. Firebase Configuration
Update `/src/config/firebase.ts` with your Firebase project config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. Firestore Security Rules
Update `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Enable Authentication
In Firebase Console:
- Go to Authentication > Sign-in method
- Enable "Email/Password"

## 🚀 Development

### Local Development
```bash
npm run dev
```
Access the app at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Firebase Deployment
```bash
# Deploy to Firebase Hosting
npm run firebase:deploy

# Test locally before deploy
npm run firebase:serve
```

## 🔧 Usage Guide

### Initial Setup
1. **Create Admin Account**: 
   - Open the app and go to login page
   - Click "Show Seed Data Options"
   - Click "Create Seed Data" to create admin account and sample data
   - Login with: `admin@library.com` / `Admin123`

2. **Add Sample Data**:
   - Go to Settings > Sample Data
   - Click "Create Sample Data" to add books, categories, and members

### Barcode Scanner Setup
1. **Physical Scanner**:
   - Connect Panzer USB barcode scanner
   - Scanner will act as keyboard input
   - Focus on barcode input field and scan

2. **Test Mode**:
   - Use "Test Mode" section in barcode input
   - Try pre-configured sample barcodes:
     - `9780140449136` - The Odyssey
     - `9780061120084` - To Kill a Mockingbird
     - `9780451524935` - 1984
     - `9780743273565` - The Great Gatsby
     - `9780547928227` - The Hobbit

### Daily Operations
1. **Adding Books**: Books > Add Book (with barcode support)
2. **Managing Members**: Members > Add Member
3. **Book Loans**: Borrowing > New Loan (scan barcode to select book)
4. **Returns**: Borrowing > Return Book
5. **Reports**: Dashboard shows key metrics and alerts

## 🧪 Testing

### Barcode Testing
- Use the "Barcode Test" page for comprehensive testing
- Test with and without physical scanner
- Try all sample barcodes
- Verify auto-population of book fields

### Database Testing
- Create/edit/delete books, members, and loans
- Verify data persistence after page refresh
- Test real-time updates in multiple browser tabs

## 📚 API Documentation

### Main Data Models

#### Book
```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
  barcode?: string;
  description?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### User (Library Member)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membershipType: 'student' | 'teacher' | 'public';
  membershipDate: string;
  status: 'active' | 'suspended' | 'expired';
  maxBooksAllowed: number;
  createdAt: string;
  updatedAt: string;
}
```

#### Borrow Record
```typescript
interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  fineAmount?: number;
  notes?: string;
}
```

## 🔒 Security

- Firebase Authentication for secure access
- Firestore security rules require authentication
- Admin-only access to sensitive operations
- Real-time data validation

## 🚨 Troubleshooting

### Common Issues

1. **Barcode Scanner Not Working**:
   - Ensure scanner is configured for keyboard emulation
   - Test in notepad to verify scanner output
   - Check USB connection and drivers

2. **Firebase Connection Issues**:
   - Verify Firebase config in `/src/config/firebase.ts`
   - Check Firebase project settings
   - Ensure Firestore and Auth are enabled

3. **Data Not Persisting**:
   - Check Firestore security rules
   - Verify user authentication
   - Check browser console for errors

4. **Build/Deploy Issues**:
   - Run `npm run build` locally first
   - Check for TypeScript errors
   - Verify Firebase CLI is logged in

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review Firebase console for errors
- Check browser developer tools console

## 🎯 Demo Credentials

- **Admin Account**: admin@library.com / Admin123
- **Sample Books**: Available after running seed data
- **Test Barcodes**: See usage guide above

---

**Built with ❤️ for modern library management**