import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

// const ADMIN_EMAILS = ['karan.kalsi@rungta.org'];
const ADMIN_EMAILS = ['drsoourabhrungta@rungta.org']

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean; 
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        if (!user.email.endsWith('')) {
          toast.error('Login with your College account(rungta.org)', { position: 'top-right'});
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
        } else {
          setUser(user);
          setIsAdmin(ADMIN_EMAILS.includes(user.email)); 
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => useContext(AuthContext);