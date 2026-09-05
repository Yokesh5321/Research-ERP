// Main App

import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '13px',
              borderRadius: '6px',
              padding: '10px 14px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
