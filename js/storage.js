// Firebase SDK Imports (using CDN for ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  deleteDoc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// --- Firebase Configuration ---
// TO USER: Replace these with your actual Firebase project config.
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

let db, auth;
let isFirebaseEnabled = false;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseEnabled = true;
  console.log("Firebase initialized successfully.");
} catch (e) {
  console.warn("Firebase not configured. Falling back to LocalStorage mode for demo.");
}

// Fallback LocalStorage Logic
const getLocal = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const saveLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const Storage = {
  // Authentication
  async login(email, password) {
    if (!isFirebaseEnabled) {
      // Demo login for when Firebase is not yet set up
      if (email === 'admin' && password === 'admin123') {
        const user = { uid: 'demo-admin', name: '최고관리자 (데모)', role: 'ADMIN' };
        sessionStorage.setItem('awcfis_user', JSON.stringify(user));
        return user;
      }
      throw new Error("데모 모드에서는 admin/admin123으로 접속하세요.");
    }

    const fullEmail = email.includes('@') ? email : `${email}@awcfis.com`;
    const userCredential = await signInWithEmailAndPassword(auth, fullEmail, password);
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    const userData = userDoc.data();
    
    const sessionUser = {
      uid: userCredential.user.uid,
      name: userData?.name || '사용자',
      role: userData?.role || 'OWNER'
    };
    
    sessionStorage.setItem('awcfis_user', JSON.stringify(sessionUser));
    return sessionUser;
  },
  
  // ... (rest of methods with similar fallback logic)

  getUser() {
    const user = sessionStorage.getItem('awcfis_user');
    return user ? JSON.parse(user) : null;
  },

  async logout() {
    await signOut(auth);
    sessionStorage.removeItem('awcfis_user');
    window.location.href = 'index.html';
  },

  // Users (Firestore)
  async getUsers() {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async saveUser(user) {
    // In a real app, you'd use Firebase Auth to create the user, 
    // but for this prototype, we'll store user metadata in Firestore.
    // NOTE: Real passwords should NEVER be stored in plain text in Firestore.
    // This is for demonstration of the flow.
    const userRef = doc(collection(db, "users"));
    await setDoc(userRef, {
      username: user.username,
      password: user.password, // Only for prototype logic
      name: user.name,
      role: user.role,
      createdAt: serverTimestamp()
    });
    return { success: true, id: userRef.id };
  },

  async deleteUser(userId) {
    await deleteDoc(doc(db, "users", userId));
  },

  // Inspection Items (Firestore)
  async getItems() {
    const snapshot = await getDocs(collection(db, "items"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async saveItem(item) {
    const itemRef = collection(db, "items");
    await addDoc(itemRef, {
      ...item,
      createdAt: serverTimestamp()
    });
    return { success: true };
  },

  async deleteItem(itemId) {
    await deleteDoc(doc(db, "items", itemId));
  },

  // Reports (Firestore)
  async getReports() {
    const q = query(collection(db, "reports"), where("is_virtual", "==", false), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async saveReport(report) {
    const reportRef = collection(db, "reports");
    await addDoc(reportRef, {
      ...report,
      date: new Date().toISOString(), // Using ISO string for easier JS sorting
      serverDate: serverTimestamp()
    });
    return { success: true };
  },

  // Virtual Assessments
  async getVirtualReports(userId) {
    const q = query(
      collection(db, "reports"), 
      where("farm_id", "==", userId), 
      where("is_virtual", "==", true),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
