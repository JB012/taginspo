import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './routes/Home.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route } from "react-router";
import Gallery from './routes/Gallery.tsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider signUpForceRedirectUrl={'/gallery'} signInForceRedirectUrl={'/gallery'} publishableKey={PUBLISHABLE_KEY}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/gallery' element={<Gallery />} />
          </Routes>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
