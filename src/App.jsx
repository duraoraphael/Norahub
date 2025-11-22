import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Capa from './pages/Capa';
import Tutoriais from './pages/Tutoriais';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import EsqueceuSenha from './pages/EsqueceuSenha';
import SolicitacaoCompras from './pages/SolicitacaoCompras';
import AprovacaoCompras from './pages/AprovacaoCompras';
import AdminDashboard from './pages/AdminDashboard';
import AdminSelection from './pages/AdminSelection';
import MinhasSolicitacoes from './pages/MinhasSolicitacoes';
import Perfil from './pages/Perfil';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Capa />} />
        <Route path="/tutoriais" element={<Tutoriais />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />

        <Route path="/solicitacao-compras" element={<PrivateRoute requiredRole="solicitante"><SolicitacaoCompras /></PrivateRoute>} />
        <Route path="/minhas-solicitacoes" element={<PrivateRoute requiredRole="solicitante"><MinhasSolicitacoes /></PrivateRoute>} />
        <Route path="/aprovacao-compras" element={<PrivateRoute requiredRole="comprador"><AprovacaoCompras /></PrivateRoute>} />
        <Route path="/admin-selection" element={<PrivateRoute requiredRole="admin"><AdminSelection /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;