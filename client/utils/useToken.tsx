import {useAuth} from '@clerk/clerk-react'
import { useEffect, useState } from 'react';

export default function useToken() {
  const { getToken } = useAuth();
  const [token, setToken] = useState("");
  
  useEffect(() => {
    getToken({skipCache: true}).then((token) => {
      if (token !== null) {
        setToken(token);
      }
    })
  }, [getToken]);

  return token;
}