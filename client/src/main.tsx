import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './routes/Home.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route } from "react-router";
import Gallery from './routes/Gallery.tsx'
import EditImage from './routes/EditImage.tsx'
import EditTag from './routes/EditTag.tsx'
import ViewImage from './routes/ViewImage.tsx'

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
            <Route path='/editimage' element={< EditImage />} />
            <Route path='/edittag' element={< EditTag />} />
            <Route path='/images/:id' element={<ViewImage />} />
          </Routes>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
