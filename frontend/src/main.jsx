import { Analytics } from "@vercel/analytics/react"
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { FilesProvider } from './Context/files.jsx'
import {HeroUIProvider } from '@heroui/react'
import { Toaster } from "sonner"

createRoot(document.getElementById('root')).render(
    <FilesProvider>
        <HeroUIProvider>
            <Analytics/>
            <App />
            <Toaster position="top-center" expand={true} richColors />
        </HeroUIProvider>
    </FilesProvider>
)
