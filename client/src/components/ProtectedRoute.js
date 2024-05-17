"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; 

const ProtectedRoute = ({ children }) => {
  const router = useRouter();

  function isAuthenticated () {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem("token") : null;
    return !!token;
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, []);

  return isAuthenticated() ? children : null;
};

export default ProtectedRoute;
