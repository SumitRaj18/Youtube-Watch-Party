import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; // 1. Import hooks
import Login from './pages/Login';
import Lobby from './pages/Lobby';
import Room from './pages/Room';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
<Toaster 

/>      <Routes>
        <Route path="/login" element={<Login setAuthToken={setToken} />} />
  <Route path="/register" element={<Register />} />
        <Route path="/" element={<Lobby /> } />
        <Route path="/room/:roomId" element={token ? <Room /> : <Navigate to="/login" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;