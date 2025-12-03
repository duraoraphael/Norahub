import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Capa from './pages/Capa';
import Tutoriais from './pages/Tutoriais';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import EsqueceuSenha from './pages/EsqueceuSenha';
import SolicitacaoCompras from './pages/SolicitacaoCompras';
import SelecaoProjeto from './pages/SelecaoProjeto';
import PainelProjeto from './pages/PainelProjeto'; // 1. Importar
import AdminDashboard from './pages/AdminDashboard';
import AdminSelection from './pages/AdminSelection';
import AprovacaoCompras from './pages/AprovacaoCompras';
import Perfil from './pages/Perfil';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Capa />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
        <Route path="/tutoriais" element={<Tutoriais />} />

        <Route path="/selecao-projeto" element={<SelecaoProjeto />} />
        
        {/* 2. Nova Rota */}
        <Route path="/painel-projeto" element={<PainelProjeto />} />

        <Route path="/solicitacao-compras" element={<SolicitacaoCompras />} />
        <Route path="/aprovacao-compras" element={<AprovacaoCompras />} />

        <Route path="/admin-selection" element={<PrivateRoute requiredRole="admin"><AdminSelection /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;