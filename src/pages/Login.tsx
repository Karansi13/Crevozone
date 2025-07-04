import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { motion } from 'framer-motion';

const ADMIN_EMAILS = ['drsoourabhrungta@rungta.org'];

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const extractErpId = (email: string): string | null => {
    if (!email.endsWith('@rungta.org')) return null;
    const erpId = email.split('@')[0];
    return /^\d+$/.test(erpId) ? erpId : null;
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      const erpId = extractErpId(user.email); // Optional, can remove if not needed
  
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          erpId: erpId, 
          skills: [],
          availability: [],
          experience: 'beginner',
          interests: [],
          bio: '',
          createdAt: new Date().toISOString(),
        });
  
        await fetch('https://email-microservice-crevozone.onrender.com/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, name: user.displayName }),
        });
      } else {
        const userData = userDoc.data();
        if (!userData.erpId) {
          await setDoc(doc(db, 'users', user.uid), {
            ...userData,
            erpId: erpId
          }, { merge: true });
        }
      }
  
      navigate('/profile');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 ">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full bg-white rounded-3xl shadow-lg overflow-hidden opacity-100"
      >
        <div className="p-8 text-center">
        <div className="flex items-center justify-center space-x-10">
        <motion.img
          src="/images/Crevo.png"
          alt="Crevo Logo"
          className="w-32"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>
          <motion.h1
            className="text-3xl font-bold text-gray-800 mt-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to Crevo
          </motion.h1>
          <motion.p
            className="text-gray-500 mt-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Sign in to find your perfect team!
          </motion.p>
        </div>

        <div className="p-6">
          <motion.button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full px-6 py-3 bg-white text-black border border-black rounded-lg shadow-md hover:bg-gray-100 transition disabled:opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-3 text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="h-5 w-5 mr-3"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.14 0 5.72 1.08 7.71 2.85l5.77-5.77C34.41 3.98 29.49 2 24 2 14.82 2 7.34 7.79 4.48 15.22l6.92 5.37C12.7 15.15 17.92 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.5 24c0-1.64-.14-3.21-.4-4.74H24v9.54h12.7c-.55 2.89-2.27 5.34-4.85 7l7.48 5.8C42.68 37.18 46.5 31.1 46.5 24z"
                />
                <path
                  fill="#4CAF50"
                  d="M9.4 28.59c-.67-1.95-1.05-4.03-1.05-6.09 0-2.11.39-4.13 1.08-6.01L2.5 10.22C.91 13.59 0 17.19 0 21c0 3.81.91 7.41 2.5 10.78l6.9-5.37z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 46c5.97 0 11.03-1.97 14.7-5.33l-7.48-5.8c-2.05 1.36-4.7 2.15-7.22 2.15-6.06 0-11.25-4.03-13.11-9.58l-6.92 5.37C7.34 40.21 14.82 46 24 46z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
            )}
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </motion.button>

          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-sm text-red-600 bg-red-100 p-2 rounded-md"
            >
              {error}
            </motion.div>
          )}
        </div>

        <motion.div
          className="border-t border-gray-200 p-6 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Crevo is powered by Google Sign-In. We do not store any passwords.{' '}
          {/* By signing in, you agree to our{' '} */}
          {/* <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>. */}
        </motion.div>
      </motion.div>
    </div>
  );
}