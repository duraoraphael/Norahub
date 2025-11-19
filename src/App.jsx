import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Capa from './pages/capa';
import Tutoriais from './pages/Tutoriais';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import EsqueceuSenha from './pages/EsqueceuSenha';
import SolicitacaoCompras from './pages/SolicitacaoCompras';
import AprovacaoCompras from './pages/AprovacaoCompras'; // Importe a página

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Capa />} />
        <Route path="/tutoriais" element={<Tutoriais />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
        <Route path="/solicitacao-compras" element={<SolicitacaoCompras />} />
        
        {/* Nova Rota */}
        <Route path="/aprovacao-compras" element={<AprovacaoCompras />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;