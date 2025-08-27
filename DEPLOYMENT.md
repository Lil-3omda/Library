# 🚀 Deployment Guide for Library Management System

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase account created
- [ ] Git repository initialized

## Firebase Project Setup

### 1. Create Firebase Project
```bash
# Login to Firebase
firebase login

# Create new project (or use existing)
firebase projects:create library-management-demo
```

### 2. Initialize Firebase in Project
```bash
# In your project directory
firebase init

# Select the following:
# ✓ Firestore: Configure security rules and indexes
# ✓ Hosting: Configure files for Firebase Hosting
# ✓ Authentication (optional, for advanced setup)

# Choose options:
# - Use an existing project: library-management-demo
# - Firestore rules file: firestore.rules (already exists)
# - Firestore indexes file: firestore.indexes.json (already exists)
# - Public directory: dist
# - Single-page app: Yes
# - Set up automatic builds: No
```

### 3. Configure Firebase Authentication
In Firebase Console:
1. Go to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Save changes

### 4. Update Firebase Configuration
Edit `/src/config/firebase.ts` with your project details:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "library-management-demo.firebaseapp.com",
  projectId: "library-management-demo",
  storageBucket: "library-management-demo.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

**Get these values from:** Firebase Console > Project Settings > General > Your apps

## Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Test Locally (Optional)
```bash
npm run firebase:serve
```
Visit `http://localhost:5000` to test

### 4. Deploy to Firebase
```bash
npm run firebase:deploy
```

### 5. Post-Deployment Setup

#### Create Admin Account & Seed Data
1. Visit your deployed URL
2. Go to login page
3. Click "Show Seed Data Options"
4. Click "Create Seed Data"
5. Login with: `admin@library.com` / `Admin123`

#### Verify Features
- [ ] Login/logout works
- [ ] Sample books are visible
- [ ] Barcode test page functions
- [ ] Data persists after page refresh
- [ ] Real-time updates work

## Environment-Specific Configuration

### Development
```bash
npm run dev
# Runs on http://localhost:5173
```

### Production
```bash
npm run build
npm run firebase:deploy
# Deploys to: https://your-project.web.app
```

## Security Configuration

### Firestore Rules (firestore.rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require authentication for all operations
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Firebase Hosting (firebase.json)
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Testing Barcode Functionality

### With Physical Scanner
1. Connect Panzer USB barcode scanner
2. Ensure it's configured for keyboard emulation
3. Focus on barcode input field
4. Scan any book barcode

### Without Physical Scanner
1. Go to "Barcode Test" page
2. Use sample barcodes:
   - `9780140449136` (The Odyssey)
   - `9780061120084` (To Kill a Mockingbird)
   - `9780451524935` (1984)
   - `9780743273565` (The Great Gatsby)
   - `9780547928227` (The Hobbit)

## Troubleshooting

### Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Deployment Issues
```bash
# Check if logged in
firebase login:list

# Re-login if needed
firebase logout
firebase login

# Check project
firebase projects:list
firebase use your-project-id
```

### Data Not Persisting
1. Check Firebase Console > Firestore
2. Verify authentication is working
3. Check browser console for errors
4. Verify Firestore rules are correct

### Barcode Scanner Not Working
1. Test scanner in notepad first
2. Check USB connection
3. Verify scanner is in keyboard emulation mode
4. Try different USB ports

## Performance Optimization

### Code Splitting (Optional)
Add to `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          lucide: ['lucide-react']
        }
      }
    }
  }
});
```

### Lighthouse Scores
Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

## Monitoring & Analytics

### Firebase Analytics (Optional)
1. Enable Analytics in Firebase Console
2. Add analytics to firebase config
3. Track key events (logins, book additions, etc.)

### Error Monitoring
Monitor Firebase Console for:
- Authentication errors
- Firestore security rule violations
- Function errors

## Backup Strategy

### Data Export
```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/exports/$(date +%Y-%m-%d)
```

### Code Backup
```bash
# Regular git commits
git add .
git commit -m "Deploy version $(date +%Y-%m-%d)"
git push origin main
```

## Custom Domain (Optional)

1. Firebase Console > Hosting
2. Add custom domain
3. Follow DNS configuration steps
4. Wait for SSL certificate provisioning

## Final Verification Checklist

- [ ] Admin login works with seed data
- [ ] Books can be added/edited/deleted
- [ ] Members can be managed
- [ ] Borrowing system functions
- [ ] Barcode scanning works (with test mode)
- [ ] Data persists across sessions
- [ ] Responsive design works on mobile
- [ ] All navigation links function
- [ ] Error handling works appropriately
- [ ] Performance is acceptable
- [ ] SSL certificate is active
- [ ] Custom domain configured (if applicable)

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

🎉 **Congratulations!** Your Library Management System is now deployed and ready for use!