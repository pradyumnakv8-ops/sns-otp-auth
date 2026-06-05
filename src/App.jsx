import { BrowserRouter } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import AppRoutes         from './routes/AppRoutes'

/**
 * App.jsx
 * BrowserRouter must wrap AuthProvider because AuthProvider
 * uses useNavigate (which requires a Router context).
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
