/**
 * Serviço de resumo e análise de documentos
 * Integra com Gemini AI para processar arquivos
 */

// Função auxiliar para retry com backoff exponencial
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Se for erro 429, aguardar e tentar novamente
      if (response.status === 429) {
        const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`⏳ Rate limit atingido. Aguardando ${waitTime/1000}s antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Se não for 429, retornar resposta (seja sucesso ou outro erro)
      return response;
    } catch (error) {
      // Se for último retry, lançar erro
      if (i === maxRetries - 1) throw error;
      
      // Aguardar antes de tentar novamente
      const waitTime = Math.pow(2, i) * 1000;
      console.log(`⚠️ Erro na tentativa ${i + 1}. Aguardando ${waitTime/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Número máximo de tentativas excedido');
};

// Resumir documento usando Gemini
export const summarizeDocument = async (fileContent, fileName, apiKey) => {
  try {
    // Tentar v1 primeiro, depois v1beta
    const endpoints = [
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    ];
    
    const prompt = `Analise o seguinte documento e forneça um resumo detalhado:

**Arquivo:** ${fileName}

**Conteúdo:**
${fileContent.substring(0, 8000)} ${fileContent.length > 8000 ? '...[conteúdo truncado]' : ''}

Forneça:
1. **Resumo executivo** (2-3 parágrafos)
2. **Pontos principais** (lista com bullets)
3. **Dados importantes** (números, datas, valores)
4. **Conclusões/Recomendações**

Seja objetivo e direto.`;

    let lastError;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Tentando endpoint: ${endpoint}`);
        const url = `${endpoint}?key=${apiKey}`;
        
        const response = await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048
            }
          })
        }, 3);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API retornou ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!summary) {
          throw new Error('Resposta da API não contém resumo');
        }

        console.log('✅ Resumo gerado com sucesso!');
        return {
          success: true,
          summary,
          fileName,
          generatedAt: new Date().toISOString()
        };
      } catch (error) {
        console.warn(`❌ Falha no endpoint ${endpoint}:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error('❌ Erro ao resumir documento:', error);
    
    // Mensagens de erro mais amigáveis
    let errorMessage = error.message;
    if (error.message.includes('429')) {
      errorMessage = 'Limite de requisições atingido. Por favor, aguarde alguns segundos e tente novamente.';
    } else if (error.message.includes('403')) {
      errorMessage = 'Chave API inválida ou sem permissões. Verifique sua configuração.';
    } else if (error.message.includes('404')) {
      errorMessage = 'Modelo não encontrado. A API key pode não ter acesso a este modelo.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Analisar planilha/dados usando Gemini
export const analyzeSpreadsheet = async (data, fileName, apiKey) => {
  try {
    const endpoints = [
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    ];
    
    // Converter dados para texto estruturado
    let dataText = '';
    if (Array.isArray(data)) {
      dataText = JSON.stringify(data, null, 2);
    } else if (typeof data === 'string') {
      dataText = data;
    } else {
      dataText = JSON.stringify(data, null, 2);
    }

    const prompt = `Analise os seguintes dados da planilha e forneça insights:

**Arquivo:** ${fileName}

**Dados:**
${dataText.substring(0, 10000)} ${dataText.length > 10000 ? '...(truncado)' : ''}

Forneça:
1. **Visão geral dos dados**
2. **Estatísticas principais** (médias, totais, etc)
3. **Tendências identificadas**
4. **Anomalias ou pontos de atenção**
5. **Recomendações baseadas nos dados**

Seja específico e use números quando possível.`;

    let lastError;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Analisando planilha com: ${endpoint}`);
        const url = `${endpoint}?key=${apiKey}`;
        
        const response = await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048
            }
          })
        }, 3);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API retornou ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        const analysis = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!analysis) {
          throw new Error('Resposta da API não contém análise');
        }

        console.log('✅ Análise gerada com sucesso!');
        return {
          success: true,
          analysis,
          fileName,
          generatedAt: new Date().toISOString()
        };
      } catch (error) {
        console.warn(`❌ Falha no endpoint ${endpoint}:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error('❌ Erro ao analisar planilha:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('429')) {
      errorMessage = 'Limite de requisições atingido. Aguarde 1 minuto e tente novamente.';
    } else if (error.message.includes('403')) {
      errorMessage = 'Chave API inválida ou sem permissões.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Extrair texto de PDF (simplificado - usa fetch do conteúdo)
export const extractTextFromPDF = async (pdfUrl) => {
  try {
    // Para PDF, idealmente usar uma biblioteca como pdf.js
    // Por enquanto, retorna instruções
    return {
      success: false,
      message: 'Extração de PDF requer biblioteca adicional. Use texto copiado ou converta para TXT.'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// OCR simulado (detecta se arquivo é imagem)
export const performOCR = async (imageUrl, apiKey) => {
  try {
    // Tentar v1 (gemini-1.5-flash com visão)
    const endpoints = [
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    ];
    
    const prompt = `Extraia TODO o texto visível nesta imagem. 
Transcreva exatamente como aparece, mantendo formatação e estrutura.
Se for documento, tabela ou planilha, preserve a organização dos dados.`;

    console.log('🔄 Convertendo imagem para base64...');
    const { base64, mimeType } = await urlToBase64(imageUrl);
    
    let lastError;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 OCR com endpoint: ${endpoint}`);
        const url = `${endpoint}?key=${apiKey}`;
        
        const response = await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048
            }
          })
        }, 3);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API retornou ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!extractedText) {
          throw new Error('Resposta da API não contém texto extraído');
        }

        console.log('✅ OCR concluído com sucesso!');
        return {
          success: true,
          text: extractedText,
          imageUrl,
          generatedAt: new Date().toISOString()
        };
      } catch (error) {
        console.warn(`❌ Falha no endpoint ${endpoint}:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error('❌ Erro no OCR:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('429')) {
      errorMessage = 'Limite de requisições atingido. Aguarde 1 minuto e tente novamente.';
    } else if (error.message.includes('403')) {
      errorMessage = 'Chave API inválida ou sem permissões para OCR.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Converter URL de imagem para base64
async function urlToBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const mimeType = blob.type || inferMimeFromUrl(url);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve({ base64, mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao converter URL para base64:', error);
    throw error;
  }
}

function inferMimeFromUrl(url) {
  try {
    const lower = String(url).toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    return 'image/jpeg';
  } catch {
    return 'image/jpeg';
  }
}

// Analisar projeto (estatísticas e insights)
export const analyzeProject = async (projectData, apiKey) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const projectInfo = {
      name: projectData.nome,
      cardsCount: projectData.cards?.length || 0,
      filesCount: projectData.arquivos?.length || 0,
      createdAt: projectData.dataCriacao,
      status: projectData.status,
      members: projectData.membros?.length || 0
    };

    const prompt = `Analise o projeto e forneça insights:

**Dados do Projeto:**
${JSON.stringify(projectInfo, null, 2)}

Forneça:
1. **Análise de atividade** (baseado em números)
2. **Status geral** (organização, completude)
3. **Sugestões de melhoria**
4. **Pontos de atenção**
5. **Próximos passos recomendados**`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return {
      success: true,
      analysis,
      projectName: projectData.nome,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao analisar projeto:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
