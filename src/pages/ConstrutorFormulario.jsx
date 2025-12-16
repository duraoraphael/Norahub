import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Eye, Settings, FileText, Download, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../services/firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function ConstrutorFormulario() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card, projeto } = location.state || {};
  const { userProfile, currentUser } = useAuth();

  // Configurações do EmailJS
  // ⚠️ DESABILITADO: Configure suas próprias credenciais em https://www.emailjs.com/
  // Para habilitar notificações por email:
  // 1. Crie conta grátis em https://www.emailjs.com/
  // 2. Adicione um serviço de email (Gmail, Outlook, etc)
  // 3. Crie um template com as variáveis: to_email, form_name, user_name, project_name, response_data, submission_date
  // 4. Substitua as credenciais abaixo
  const EMAILJS_CONFIG = {
    publicKey: '60DpU5tNSFx8C_WGu',
    serviceId: 'service_gtuf3ho',
    templateId: 'template_w2u8w77'
  };
  
  const [mode, setMode] = useState('preview'); // Começa no modo preview para usuários normais
  const [formFields, setFormFields] = useState([]);
  const [formResponses, setFormResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState({});
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationEmails, setNotificationEmails] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Verificar permissões de edição
  const isAdmin = userProfile?.funcao === 'admin';
  const isGerente = typeof userProfile?.funcao === 'string' && userProfile.funcao.toLowerCase().includes('gerente');

  useEffect(() => {
    if (!card || !projeto) {
      navigate(-1);
      return;
    }
    checkEditPermission();
    loadFormFields();
  }, [card, projeto, userProfile]);

  const checkEditPermission = () => {
    // Admin e gerentes podem editar
    if (isAdmin || isGerente) {
      setCanEdit(true);
      setMode('builder'); // Iniciam no modo de edição
    } else {
      setCanEdit(false);
      setMode('preview'); // Colaboradores iniciam no modo de resposta
    }
  };

  const loadFormFields = async () => {
    setLoading(true);
    try {
      // Buscar campos salvos do formulário
      const projetoDoc = await getDoc(doc(db, 'projetos', projeto.id));
      const projetoData = projetoDoc.data();
      const cardData = projetoData.extras?.find(e => e.name === card.name);
      
      if (cardData) {
        if (cardData.formFields) {
          setFormFields(cardData.formFields);
        }
        if (cardData.formResponses) {
          setFormResponses(cardData.formResponses);
        }
        if (cardData.emailNotifications !== undefined) {
          setEmailNotifications(cardData.emailNotifications);
        }
        if (cardData.notificationEmails) {
          setNotificationEmails(cardData.notificationEmails);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmailNotification = async (responseName, responseData) => {
    if (!emailNotifications || !notificationEmails.trim()) return;

    const emails = notificationEmails.split(',').map(e => e.trim()).filter(e => e);
    if (emails.length === 0) return;

    // Verificar se EmailJS está configurado
    if (!EMAILJS_CONFIG.publicKey || !EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId) {
      console.warn('⚠️ EmailJS não configurado. Notificação por email desabilitada.');
      showToast('⚠️ Notificações por email não estão configuradas. Resposta salva com sucesso!', 'success');
      return;
    }

    try {
      console.log('📧 Iniciando envio de notificações...');
      console.log('Destinatários:', emails);
      
      // Formatar respostas do formulário
      let formattedResponses = '';
      formFields.forEach(field => {
        const answer = responseData.answers[field.id];
        let answerText = '';
        
        if (field.type === 'file' && Array.isArray(answer) && answer[0]?.url) {
          answerText = answer.map(file => `📎 ${file.name}: ${file.url}`).join('\n');
        } else if (Array.isArray(answer)) {
          answerText = answer.join(', ');
        } else {
          answerText = answer || '-';
        }
        
        formattedResponses += `\n${field.label}:\n${answerText}\n`;
      });

      // Enviar email para cada destinatário
      const sendPromises = emails.map(async (email) => {
        const templateParams = {
          to_email: email,
          to_name: email.split('@')[0], // Nome do destinatário
          reply_to: email, // Email de resposta
          form_name: card.name,
          user_name: responseName,
          project_name: projeto.nome || 'NoraHub',
          response_data: formattedResponses,
          submission_date: new Date(responseData.submittedAt).toLocaleString('pt-BR')
        };

        console.log(`📧 Enviando email para ${email}...`);
        console.log('Template params:', templateParams);
        console.log('Config:', {
          service_id: EMAILJS_CONFIG.serviceId,
          template_id: EMAILJS_CONFIG.templateId,
          user_id: EMAILJS_CONFIG.publicKey
        });

        try {
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              service_id: EMAILJS_CONFIG.serviceId,
              template_id: EMAILJS_CONFIG.templateId,
              user_id: EMAILJS_CONFIG.publicKey,
              template_params: templateParams
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erro ${response.status}:`, errorText);
            throw new Error(`EmailJS retornou erro ${response.status}: ${errorText}`);
          }
        } catch (fetchError) {
          console.error(`Erro de rede ao enviar para ${email}:`, fetchError);
          throw new Error(`Erro ao conectar com EmailJS: ${fetchError.message}`);
        }

        console.log(`✅ Email enviado com sucesso para ${email}`);
        return email;
      });

      await Promise.all(sendPromises);
      console.log('✅ Emails enviados com sucesso para:', emails);
      showToast(`✅ Notificação enviada para ${emails.length} email(s)`, 'success');
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      console.error('Detalhes completos do erro:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      showToast(`❌ Erro: ${error.message}`, 'error');
    }
  };

  const submitResponse = async () => {
    // Validar campos obrigatórios
    const missingFields = formFields.filter(f => {
      if (!f.required) return false;
      const value = currentResponse[f.id];
      if (!value) return true;
      if (f.type === 'file' && Array.isArray(value)) return value.length === 0;
      return false;
    });
    if (missingFields.length > 0) {
      showToast('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    setSaving(true);
    try {
      const projetoDoc = await getDoc(doc(db, 'projetos', projeto.id));
      const projetoData = projetoDoc.data();
      
      const responseId = Date.now();
      const processedAnswers = { ...currentResponse };

      // Processar uploads de arquivos
      for (const [fieldId, value] of Object.entries(currentResponse)) {
        const field = formFields.find(f => f.id.toString() === fieldId.toString());
        if (field && field.type === 'file' && Array.isArray(value) && value.length > 0) {
          try {
            const uploadedUrls = [];
            for (const file of value) {
              if (file instanceof File) {
                const storagePath = `projetos/${projeto.id}/forms/${card.name}/responses/${responseId}/${file.name}`;
                const storageRef = ref(storage, storagePath);
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);
                uploadedUrls.push({ name: file.name, url: downloadURL, type: file.type });
              }
            }
            processedAnswers[fieldId] = uploadedUrls;
          } catch (uploadError) {
            console.error('Erro ao fazer upload dos arquivos:', uploadError);
            showToast('Erro ao fazer upload dos arquivos', 'error');
            setSaving(false);
            return;
          }
        }
      }
      
      const newResponse = {
        id: responseId,
        submittedAt: new Date().toISOString(),
        submittedBy: currentUser.email,
        userName: userProfile?.nome || currentUser.displayName || 'Anônimo',
        answers: processedAnswers
      };

      const updatedExtras = projetoData.extras.map(e => 
        e.name === card.name 
          ? { 
              ...e, 
              formResponses: [...(e.formResponses || []), newResponse]
            } 
          : e
      );

      await updateDoc(doc(db, 'projetos', projeto.id), {
        extras: updatedExtras,
        updatedAt: new Date()
      });

      showToast('Resposta enviada com sucesso!', 'success');
      
      // Enviar notificação por email se configurado
      console.log('🔔 Verificando notificações...');
      console.log('Email notifications ativo:', emailNotifications);
      console.log('Emails configurados:', notificationEmails);
      
      if (emailNotifications && notificationEmails) {
        await sendEmailNotification(
          newResponse.userName,
          newResponse
        );
      } else {
        console.log('⚠️ Notificações não configuradas ou desativadas');
      }
      
      setCurrentResponse({});
      await loadFormFields();
      setMode('responses');
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      showToast('Erro ao enviar resposta', 'error');
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    if (formResponses.length === 0) {
      showToast('Nenhuma resposta para exportar', 'error');
      return;
    }

    // Criar cabeçalho CSV
    const headers = ['Data/Hora', 'Usuário', ...formFields.map(f => f.label)];
    
    // Criar linhas CSV
    const rows = formResponses.map(response => [
      new Date(response.submittedAt).toLocaleString('pt-BR'),
      response.userName,
      ...formFields.map(f => {
        const answer = response.answers[f.id];
        if (f.type === 'file' && Array.isArray(answer) && answer[0]?.url) {
          return answer.map(file => file.url).join('; ');
        }
        return Array.isArray(answer) ? answer.join('; ') : (answer || '');
      })
    ]);

    // Combinar tudo
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${card.name}_respostas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showToast('Arquivo CSV baixado!', 'success');
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const addField = () => {
    setFormFields([...formFields, {
      id: Date.now(),
      label: '',
      type: 'text',
      required: false,
      options: []
    }]);
  };

  const updateField = (id, key, value) => {
    setFormFields(formFields.map(f => 
      f.id === id ? { ...f, [key]: value } : f
    ));
  };

  const removeField = (id) => {
    setFormFields(formFields.filter(f => f.id !== id));
  };

  const saveForm = async () => {
    if (formFields.length === 0) {
      showToast('Adicione pelo menos um campo ao formulário', 'error');
      return;
    }

    setSaving(true);
    try {
      const projetoDoc = await getDoc(doc(db, 'projetos', projeto.id));
      const projetoData = projetoDoc.data();
      
      const updatedExtras = projetoData.extras.map(e => 
        e.name === card.name 
          ? { ...e, formFields, emailNotifications, notificationEmails } 
          : e
      );

      await updateDoc(doc(db, 'projetos', projeto.id), {
        extras: updatedExtras,
        updatedAt: new Date()
      });

      showToast('Formulário salvo com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      showToast('Erro ao salvar formulário', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fieldTypes = [
    { value: 'text', label: 'Texto curto' },
    { value: 'textarea', label: 'Texto longo' },
    { value: 'number', label: 'Número' },
    { value: 'email', label: 'E-mail' },
    { value: 'tel', label: 'Telefone' },
    { value: 'date', label: 'Data' },
    { value: 'file', label: 'Upload de Arquivo/Foto' },
    { value: 'select', label: 'Seleção única' },
    { value: 'checkbox', label: 'Múltipla escolha' },
    { value: 'radio', label: 'Escolha única (opções)' }
  ];

  if (!card || !projeto) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Carregando formulário...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] bg-gray-50">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="w-full flex items-center justify-between py-3 md:py-6 px-3 md:px-8 border-b border-gray-200 bg-white min-h-[56px]">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 md:gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-xs md:text-sm shrink-0"
        >
          <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden xs:inline">Voltar</span>
        </button>
        
        <h1 className="text-sm md:text-xl lg:text-2xl font-bold text-gray-800 absolute left-1/2 transform -translate-x-1/2 max-w-[50%] truncate">{card.name}</h1>
        
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={() => setMode('builder')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium text-sm ${
                mode === 'builder' ? 'bg-[#57B952] text-white border-[#57B952]' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Settings size={16} /> Editar
            </button>
          )}

          <button
            onClick={() => setMode('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium text-sm ${
              mode === 'preview' ? 'bg-[#57B952] text-white border-[#57B952]' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Eye size={16} /> Preencher
          </button>

          {canEdit && (
            <button
              onClick={() => setMode('responses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium text-sm ${
                mode === 'responses' ? 'bg-[#57B952] text-white border-[#57B952]' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FileText size={16} /> Respostas ({formResponses.length})
            </button>
          )}
          
          {mode === 'builder' && canEdit && (
            <button
              onClick={saveForm}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              <Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-3 md:p-8">
        {mode === 'builder' ? (
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Construtor de Formulário</h2>
              <button
                onClick={addField}
                className="flex items-center gap-2 bg-[#57B952] hover:bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg transition-colors font-medium text-sm w-full sm:w-auto justify-center"
              >
                <Plus size={16} /> Adicionar Campo
              </button>
            </div>

            {/* Configurações de Notificação */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="font-medium text-gray-700">📧 Ativar notificações por email</span>
                </label>
              </div>
              {emailNotifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Emails para notificação (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="email1@exemplo.com, email2@exemplo.com"
                    value={notificationEmails}
                    onChange={(e) => setNotificationEmails(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Estes emails receberão uma notificação sempre que alguém responder o formulário
                  </p>
                </div>
              )}
            </div>

            {formFields.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>Nenhum campo adicionado ainda</p>
                <p className="text-sm mt-2">Clique em "Adicionar Campo" para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formFields.map((field, idx) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-600">Campo {idx + 1}</span>
                      <button
                        onClick={() => removeField(field.id)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Rótulo / Pergunta</label>
                        <input
                          type="text"
                          placeholder="Ex: Qual seu nome?"
                          value={field.label}
                          onChange={(e) => updateField(field.id, 'label', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#57B952] outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Campo</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#57B952] outline-none text-sm"
                        >
                          {fieldTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                            className="w-4 h-4 text-[#57B952] focus:ring-[#57B952] rounded"
                          />
                          <span className="text-sm text-gray-700">Campo obrigatório</span>
                        </label>
                      </div>

                      {(['select', 'radio', 'checkbox'].includes(field.type)) && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Opções (separadas por vírgula)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Sim, Não, Talvez"
                            value={field.options.join(', ')}
                            onChange={(e) => updateField(field.id, 'options', e.target.value.split(',').map(o => o.trim()))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#57B952] outline-none text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : mode === 'preview' ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{card.name}</h2>
            <p className="text-gray-600 mb-8">{card.description || 'Preencha os campos abaixo'}</p>

            {formFields.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>Nenhum campo foi criado ainda</p>
                <p className="text-sm mt-2">Vá para "Editar" para adicionar campos</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        rows="4"
                        placeholder="Sua resposta..."
                        value={currentResponse[field.id] || ''}
                        onChange={(e) => setCurrentResponse({...currentResponse, [field.id]: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#57B952] outline-none"
                      />
                    ) : field.type === 'select' ? (
                      <select 
                        value={currentResponse[field.id] || ''}
                        onChange={(e) => setCurrentResponse({...currentResponse, [field.id]: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#57B952] outline-none"
                      >
                        <option value="">Selecione...</option>
                        {field.options.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'radio' ? (
                      <div className="space-y-2">
                        {field.options.map((opt, i) => (
                          <label key={i} className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name={`field-${field.id}`} 
                              value={opt}
                              checked={currentResponse[field.id] === opt}
                              onChange={(e) => setCurrentResponse({...currentResponse, [field.id]: e.target.value})}
                              className="text-[#57B952]" 
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <div className="space-y-2">
                        {field.options.map((opt, i) => (
                          <label key={i} className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              value={opt}
                              checked={(currentResponse[field.id] || []).includes(opt)}
                              onChange={(e) => {
                                const current = currentResponse[field.id] || [];
                                const updated = e.target.checked
                                  ? [...current, opt]
                                  : current.filter(v => v !== opt);
                                setCurrentResponse({...currentResponse, [field.id]: updated});
                              }}
                              className="text-[#57B952] rounded" 
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'file' ? (
                      <div className="space-y-3">
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('border-[#57B952]', 'bg-green-50');
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove('border-[#57B952]', 'bg-green-50');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-[#57B952]', 'bg-green-50');
                            const files = Array.from(e.dataTransfer.files);
                            const validFiles = files.filter(file => {
                              if (file.size > 10 * 1024 * 1024) {
                                showToast(`Arquivo ${file.name} muito grande! Máximo: 10MB`, 'error');
                                return false;
                              }
                              return true;
                            });
                            if (validFiles.length > 0) {
                              const current = currentResponse[field.id] || [];
                              setCurrentResponse({...currentResponse, [field.id]: [...current, ...validFiles]});
                            }
                          }}
                          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all hover:border-[#57B952] hover:bg-green-50 cursor-pointer"
                        >
                          <input
                            type="file"
                            id={`file-${field.id}`}
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              const validFiles = files.filter(file => {
                                if (file.size > 10 * 1024 * 1024) {
                                  showToast(`Arquivo ${file.name} muito grande! Máximo: 10MB`, 'error');
                                  return false;
                                }
                                return true;
                              });
                              if (validFiles.length > 0) {
                                const current = currentResponse[field.id] || [];
                                setCurrentResponse({...currentResponse, [field.id]: [...current, ...validFiles]});
                              }
                            }}
                            className="hidden"
                          />
                          <label htmlFor={`file-${field.id}`} className="cursor-pointer">
                            <Upload className="mx-auto mb-3 text-[#57B952]" size={40} />
                            <p className="text-gray-700 font-medium mb-1">Clique ou arraste arquivos aqui</p>
                            <p className="text-sm text-gray-500">Suporta imagens, PDFs e documentos (máx 10MB cada)</p>
                          </label>
                        </div>

                        {/* Preview dos arquivos */}
                        {currentResponse[field.id] && currentResponse[field.id].length > 0 && (
                          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {currentResponse[field.id].map((file, idx) => (
                              <div key={idx} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                                  {file.type?.startsWith('image/') ? (
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-3">
                                      <FileText size={32} className="text-gray-400 mb-2" />
                                      <p className="text-xs text-gray-600 text-center truncate w-full">{file.name}</p>
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = currentResponse[field.id].filter((_, i) => i !== idx);
                                    setCurrentResponse({...currentResponse, [field.id]: updated});
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                >
                                  <X size={16} />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-xs text-white truncate">{file.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        placeholder="Sua resposta..."
                        value={currentResponse[field.id] || ''}
                        onChange={(e) => setCurrentResponse({...currentResponse, [field.id]: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#57B952] outline-none"
                      />
                    )}
                  </div>
                ))}

                <button 
                  onClick={submitResponse}
                  disabled={saving}
                  className="w-full bg-[#57B952] hover:bg-green-600 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enviando...' : 'Enviar Respostas'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Respostas Recebidas ({formResponses.length})
              </h2>
              {formResponses.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 bg-[#57B952] hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  <Download size={16} /> Exportar CSV
                </button>
              )}
            </div>

            {formResponses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>Nenhuma resposta recebida ainda</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formResponses.map((response, idx) => (
                  <div key={response.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-800">{response.userName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(response.submittedAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Resposta #{idx + 1}</span>
                    </div>

                    <div className="space-y-3">
                      {formFields.map(field => {
                        const answer = response.answers[field.id];
                        const isFileField = field.type === 'file';
                        const isFileArray = isFileField && Array.isArray(answer) && answer.length > 0 && typeof answer[0] === 'object';
                        
                        return (
                          <div key={field.id}>
                            <p className="text-sm font-medium text-gray-600 mb-2">{field.label}</p>
                            {isFileArray ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {answer.map((file, idx) => (
                                  <a
                                    key={idx}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-[#57B952] transition-all"
                                  >
                                    {file.type?.startsWith('image/') ? (
                                      <img
                                        src={file.url}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center p-3">
                                        <FileText size={32} className="text-gray-400 mb-2" />
                                        <p className="text-xs text-gray-600 text-center truncate w-full">{file.name}</p>
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                      <Download className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                      <p className="text-xs text-white truncate">{file.name}</p>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-800 mt-1">
                                {Array.isArray(answer) 
                                  ? answer.join(', ') 
                                  : answer || '-'}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ConstrutorFormulario;
