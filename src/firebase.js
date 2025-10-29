// -- Importing Firebase --
import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail
} from "firebase/auth";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion,
} from "firebase/firestore";

// --- Firebase config ---
const firebaseConfig = {
    apiKey: "AIzaSyBTy0tRrYfIvPYhZ-k49IsU_IS9WuTVxKA",
    authDomain: "singatrain.firebaseapp.com",
    projectId: "singatrain",
    storageBucket: "singatrain.firebasestorage.app",
    messagingSenderId: "773752736023",
    appId: "1:773752736023:web:456315abd28b9854058f52",
    measurementId: "G-ZQHSRHNBCB"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- AUTH FUNCTIONS ---

export async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        // prevent Firebase from logging noisy POST 400 errors
        console.error = () => { }; // temporarily disable console.error
        setTimeout(() => (console.error = console.__proto__.error)); // restore it immediately after

        let message = "";
        switch (error.code) {
            case "auth/email-already-in-use":
                message = "This email is already registered.";
                break;
            case "auth/invalid-email":
                message = "Please enter a valid email address.";
                break;
            case "auth/weak-password":
                message = "Password should be at least 6 characters.";
                break;
            default:
                message = "An unexpected error occurred during registration.";
        }
        return { success: false, message };
    }
}

export async function loginUser(email, password) {
    if (!email || !password) {
        return { success: false, message: "Please enter both email and password." };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        let message = "";
        switch (error.code) {
            case "auth/invalid-email":
                message = "Please enter a valid email address.";
                break;
            case "auth/user-not-found":
                message = "No account found with this email.";
                break;
            case "auth/wrong-password":
                message = "Incorrect password. Please try again.";
                break;
            default:
                message = "Login failed. Please check your details and try again.";
        }
        return { success: false, message };
    }
}


export async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return handleFirebaseError(error);
    }
}

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return handleFirebaseError(error);
    }
}

export const observeAuth = (callback) => {
    try {
        return onAuthStateChanged(auth, callback);
    } catch (error) {
        console.warn("Auth observer failed:", error.message);
    }
};

// --- FIRESTORE FUNCTIONS ---

export async function saveProfileName(uid, name) {
    try {
        await setDoc(doc(db, "users", uid), { name }, { merge: true });
        return { success: true };
    } catch (error) {
        return handleFirebaseError(error);
    }
}

export async function initUserData(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
            const initData = {
                name: "Anonymous",
                email: user.email,
                created_at: new Date(),
                favorite_stations: [],
            };
            await setDoc(userRef, initData);
            return initData;
        }
        return snap.data();
    } catch (error) {
        return handleFirebaseError(error);
    }
}

export async function getFavorites(uid) {
    try {
        const snap = await getDoc(doc(db, "users", uid));
        return snap.exists() ? snap.data().favorite_stations || [] : [];
    } catch (error) {
        return [];
    }
}

export async function addFavorite(uid, station) {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, { favorite_stations: arrayUnion(station) });
        return { success: true };
    } catch (error) {
        return handleFirebaseError(error);
    }
}

export async function removeFavorite(uid, updatedFavorites) {
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, { favorite_stations: updatedFavorites }, { merge: true });
        return { success: true };
    } catch (error) {
        return handleFirebaseError(error);
    }
}

// --- UNIFIED ERROR HANDLER ---
function handleFirebaseError(error) {
    // No console errors — only return structured info
    const firebaseErrorMessages = {
        "auth/invalid-email": "Invalid email address.",
        "auth/user-not-found": "No user found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/weak-password": "Password should be at least 6 characters.",
        "auth/email-already-in-use": "This email is already registered.",
        "auth/network-request-failed": "Network error. Please check your connection.",
        "permission-denied": "You do not have permission to perform this action.",
    };

    return {
        success: false,
        code: error.code,
        message: firebaseErrorMessages[error.code] || "An unexpected error occurred.",
    };
}

export { auth, db };