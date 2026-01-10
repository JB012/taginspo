import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './routes/Home.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route } from "react-router";
import Gallery from './routes/Gallery.tsx'
import EditImage from './routes/EditImage.tsx'
import EditTag from './routes/EditTag.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const URL = import.meta.env.VITE_DEFAULT_URL
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10 //10 minutes
    }
  }
});

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider signUpForceRedirectUrl={URL} signInForceRedirectUrl={URL} publishableKey={PUBLISHABLE_KEY}>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/gallery' element={<Gallery />} />
              <Route path='/addimage' element={<EditImage />} />
              <Route path='/editimage/:id' element={< EditImage />} />
              <Route path='/addtag' element={< EditTag />} />
              <Route path='/edittag/:id' element={< EditTag />} />
            </Routes>
          </QueryClientProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
