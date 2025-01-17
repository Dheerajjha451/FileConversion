import { Analytics } from "@vercel/analytics/react"
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { FilesProvider } from './Context/files.jsx'

createRoot(document.getElementById('root')).render(
    <FilesProvider>
        <Analytics/>
        <App />
    </FilesProvider>
)
