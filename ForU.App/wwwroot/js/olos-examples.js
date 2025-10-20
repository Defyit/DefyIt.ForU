/**
 * Exemplos de Uso - Olos Integration Library
 * Este arquivo demonstra diferentes formas de usar a biblioteca
 */

// ================================
// EXEMPLO 1: Uso Básico
// ================================

async function exemploBasico() {
  // Usando a instância global padrão
  const resultado = await window.olosApi.getToken();

  if (resultado.success) {
    console.log("Token obtido:", resultado.token);
    console.log("Expira em:", resultado.expiresIn, "segundos");
  } else {
    console.error("Erro:", resultado.error);
  }
}

// ================================
// EXEMPLO 2: Instância Personalizada
// ================================

async function exemploInstanciaPersonalizada() {
  // Criar nova instância com configurações personalizadas
  const minhaIntegracao = new OlosIntegration({
    baseUrl: "https://204.199.43.30:4333",
    username: "meu_usuario_personalizado",
    password: "minha_senha_personalizada",
    debug: false,
    timeout: 60000, // 60 segundos
  });

  const resultado = await minhaIntegracao.getToken();
  console.log("Resultado da instância personalizada:", resultado);
}

// ================================
// EXEMPLO 3: Credenciais Dinâmicas
// ================================

async function exemploCredenciaisDinamicas() {
  // Credenciais diferentes para esta requisição específica
  const credenciaisPersonalizadas = {
    username: "usuario_especifico",
    password: "senha_especifica",
    client_id: "client_id_especifico",
  };

  const resultado = await window.olosApi.getToken(credenciaisPersonalizadas);
  console.log("Resultado com credenciais dinâmicas:", resultado);
}

// ================================
// EXEMPLO 4: Gerenciamento de Token com Cache
// ================================

async function exemploGerenciamentoToken() {
  console.log("=== Teste de Gerenciamento de Token ===");

  // 1. Obter token pela primeira vez
  console.log("1. Primeira requisição...");
  let resultado = await window.olosApi.getValidToken();
  console.log(
    "Resultado:",
    resultado.fromCache ? "Do cache" : "Nova requisição"
  );

  // 2. Tentar obter novamente (deve vir do cache)
  console.log("2. Segunda requisição...");
  resultado = await window.olosApi.getValidToken();
  console.log(
    "Resultado:",
    resultado.fromCache ? "Do cache" : "Nova requisição"
  );

  // 3. Verificar informações do token
  const info = window.olosApi.getTokenInfo();
  console.log("3. Info do token:", info);

  // 4. Limpar token e obter novamente
  console.log("4. Limpando token...");
  window.olosApi.clearToken();
  resultado = await window.olosApi.getValidToken();
  console.log(
    "Resultado após limpeza:",
    resultado.fromCache ? "Do cache" : "Nova requisição"
  );
}

// ================================
// EXEMPLO 5: Tratamento de Erros
// ================================

async function exemploTratamentoErros() {
  try {
    // Configurar credenciais inválidas para teste de erro
    const credenciaisInvalidas = {
      username: "usuario_inexistente",
      password: "senha_errada",
    };

    const resultado = await window.olosApi.getToken(credenciaisInvalidas);

    if (!resultado.success) {
      switch (resultado.errorType) {
        case "timeout":
          console.log("Erro de timeout:", resultado.error);
          break;
        case "request_error":
          console.log("Erro na requisição:", resultado.error);
          break;
        default:
          console.log("Erro desconhecido:", resultado.error);
      }
    }
  } catch (error) {
    console.error("Erro não tratado:", error);
  }
}

// ================================
// EXEMPLO 6: Configuração Dinâmica
// ================================

function exemploConfiguracaoDinamica() {
  // Atualizar configurações em tempo de execução
  window.olosApi.updateConfig({
    debug: false,
    timeout: 45000,
    credentials: {
      username: "novo_usuario",
    },
  });

  console.log("Configurações atualizadas:", window.olosApi.config);
}

// ================================
// EXEMPLO 7: Uso em Formulário
// ================================

async function exemploFormulario() {
  // Simular dados de um formulário
  const dadosFormulario = {
    usuario: document.getElementById("usuario")?.value || "api_token",
    senha: document.getElementById("senha")?.value || "olos@123",
    clientId:
      document.getElementById("clientId")?.value ||
      "e9b9383e437b4bf284553c2f8af3ea82",
  };

  // Usar dados do formulário
  const resultado = await window.olosApi.getToken({
    username: dadosFormulario.usuario,
    password: dadosFormulario.senha,
    client_id: dadosFormulario.clientId,
  });

  // Atualizar interface com resultado
  if (resultado.success) {
    // Sucesso - atualizar UI
    console.log("Login realizado com sucesso!");
    // Aqui você atualizaria a interface do usuário
  } else {
    // Erro - mostrar mensagem
    console.error("Falha no login:", resultado.error);
    // Aqui você mostraria a mensagem de erro na interface
  }
}

// ================================
// EXEMPLO 8: Uso com Async/Await em Função
// ================================

class MinhaAplicacao {
  constructor() {
    this.olosApi = new OlosIntegration({
      debug: true,
    });
  }

  async inicializar() {
    console.log("Inicializando aplicação...");

    try {
      const tokenResult = await this.olosApi.getToken();

      if (tokenResult.success) {
        console.log("Aplicação inicializada com sucesso!");
        this.token = tokenResult.token;
        return true;
      } else {
        console.error("Falha na inicialização:", tokenResult.error);
        return false;
      }
    } catch (error) {
      console.error("Erro crítico na inicialização:", error);
      return false;
    }
  }

  async executarAcao() {
    // Garantir que temos um token válido antes de executar ação
    if (!this.olosApi.isTokenValid()) {
      console.log("Token inválido, renovando...");
      const resultado = await this.olosApi.getValidToken();
      if (!resultado.success) {
        throw new Error("Não foi possível renovar o token");
      }
      this.token = resultado.token;
    }

    console.log("Executando ação com token válido...");
    // Aqui você faria outras chamadas de API usando o token
  }
}

// ================================
// EXEMPLO DE USO PRÁTICO
// ================================

// Para usar na página web:
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Página carregada, testando integração...");

  // Teste básico
  await exemploBasico();

  // Teste de gerenciamento de token
  // await exemploGerenciamentoToken();

  // Inicializar aplicação
  // const app = new MinhaAplicacao();
  // await app.inicializar();
});

// Exportar exemplos para uso global
window.exemploOlos = {
  basico: exemploBasico,
  instanciaPersonalizada: exemploInstanciaPersonalizada,
  credenciaisDinamicas: exemploCredenciaisDinamicas,
  gerenciamentoToken: exemploGerenciamentoToken,
  tratamentoErros: exemploTratamentoErros,
  configuracaoDinamica: exemploConfiguracaoDinamica,
  formulario: exemploFormulario,
  MinhaAplicacao,
  // NOVOS EXEMPLOS DE AGENTE
  autenticacaoAgente: exemploAutenticacaoAgente,
  processoCompleto: exemploProcessoCompleto,
  integracaoCompleta: exemploIntegracaoCompleta,
  formularioCompleto: exemploFormularioCompleto,
  aplicacaoComAgente: AplicacaoComAgente,
};

// ================================
// NOVOS EXEMPLOS - AUTENTICAÇÃO DE AGENTE
// ================================

// ================================
// EXEMPLO 9: Autenticação Básica de Agente
// ================================

async function exemploAutenticacaoAgente() {
  console.log("=== Exemplo de Autenticação de Agente ===");

  try {
    // Primeiro obter um token válido
    const tokenResult = await window.olosApi.getValidToken();

    if (!tokenResult.success) {
      console.error("Erro ao obter token:", tokenResult.error);
      return;
    }

    console.log("Token obtido, autenticando agente...");

    // Autenticar agente
    const agentResult = await window.olosApi.authenticateAgent(
      "agente2_crm04", // login
      "7I4SCneW", // password
      true // forceLogout
    );

    if (agentResult.success) {
      console.log("Agente autenticado com sucesso!");
      console.log("Agent ID:", agentResult.agentId);
      console.log("Login:", agentResult.login);
    } else {
      console.error("Erro na autenticação:", agentResult.error);
    }
  } catch (error) {
    console.error("Erro no exemplo:", error);
  }
}

// ================================
// EXEMPLO 10: Processo Completo (Token + Agente)
// ================================

async function exemploProcessoCompleto() {
  console.log("=== Exemplo de Processo Completo ===");

  try {
    // Executar processo completo em uma única chamada
    const result = await window.olosApi.authenticateAgentComplete(
      "agente2_crm04", // login
      "7I4SCneW", // password
      true // forceLogout
    );

    if (result.success) {
      console.log("Processo completo executado com sucesso!");
      console.log("Token:", result.token.substring(0, 20) + "...");
      console.log("Token do cache:", result.tokenFromCache);
      console.log("Agent ID:", result.agentId);
      console.log("Completado em:", result.completedAt);

      // Acessar dados detalhados de cada passo
      console.log("Detalhes do token:", result.steps.token);
      console.log("Detalhes da autenticação:", result.steps.agentAuth);
    } else {
      console.error("Erro no processo:", result.error);
      console.error("Falha no passo:", result.step);
    }
  } catch (error) {
    console.error("Erro no exemplo:", error);
  }
}

// ================================
// EXEMPLO 11: Integração Completa com Credenciais Personalizadas
// ================================

async function exemploIntegracaoCompleta() {
  console.log("=== Exemplo de Integração Completa ===");

  try {
    // Credenciais personalizadas para o token (se necessário)
    const credenciaisCustom = {
      username: "api_token_especial",
      password: "senha_especial",
    };

    // Processo completo com credenciais personalizadas
    const result = await window.olosApi.authenticateAgentComplete(
      "meu_agente_login", // login do agente
      "minha_senha_agente", // senha do agente
      true, // force logout
      credenciaisCustom // credenciais personalizadas para token
    );

    if (result.success) {
      console.log("Integração completa bem-sucedida!");

      // Agora você pode usar tanto o token quanto o agentId
      // para outras operações
      localStorage.setItem("olos_token", result.token);
      localStorage.setItem("olos_agent_id", result.agentId);
    } else {
      console.error("Falha na integração:", result.error);

      // Tratamento específico por tipo de erro
      switch (result.errorType) {
        case "token_error":
          console.log("Problema na obtenção do token");
          break;
        case "agent_auth_error":
          console.log("Problema na autenticação do agente");
          break;
        default:
          console.log("Erro geral no processo");
      }
    }
  } catch (error) {
    console.error("Erro crítico:", error);
  }
}

// ================================
// EXEMPLO 12: Formulário Completo com Agente
// ================================

async function exemploFormularioCompleto() {
  console.log("=== Exemplo de Formulário Completo ===");

  // Simular dados de formulário
  const dadosFormulario = {
    // Dados para token
    tokenUser: document.getElementById("token-user")?.value || "api_token",
    tokenPassword:
      document.getElementById("token-password")?.value || "olos@123",

    // Dados para agente
    agentLogin:
      document.getElementById("agent-login")?.value || "agente2_crm04",
    agentPassword:
      document.getElementById("agent-password")?.value || "7I4SCneW",
    forceLogout: document.getElementById("force-logout")?.checked || true,
  };

  try {
    // Mostrar loading na interface
    mostrarLoading("Autenticando...");

    // Executar processo completo
    const result = await window.olosApi.authenticateAgentComplete(
      dadosFormulario.agentLogin,
      dadosFormulario.agentPassword,
      dadosFormulario.forceLogout,
      {
        username: dadosFormulario.tokenUser,
        password: dadosFormulario.tokenPassword,
      }
    );

    // Atualizar interface com resultado
    if (result.success) {
      mostrarSucesso(`
                Autenticação realizada com sucesso!<br>
                Agent ID: ${result.agentId}<br>
                Token obtido: ${
                  result.tokenFromCache ? "do cache" : "novo token"
                }
            `);

      // Habilitar funcionalidades que dependem de autenticação
      habilitarRecursosAutenticados(result);
    } else {
      mostrarErro(`Falha na autenticação: ${result.error}`);
    }
  } catch (error) {
    mostrarErro(`Erro crítico: ${error.message}`);
  } finally {
    esconderLoading();
  }
}

// ================================
// EXEMPLO 13: Classe Aplicação com Agente
// ================================

class AplicacaoComAgente {
  constructor() {
    this.olosApi = new OlosIntegration({
      debug: true,
    });
    this.isAuthenticated = false;
    this.agentInfo = null;
  }

  async inicializar(agentLogin, agentPassword) {
    console.log("Inicializando aplicação com agente...");

    try {
      // Processo completo de autenticação
      const result = await this.olosApi.authenticateAgentComplete(
        agentLogin,
        agentPassword,
        true
      );

      if (result.success) {
        this.isAuthenticated = true;
        this.agentInfo = {
          agentId: result.agentId,
          login: result.agentLogin,
          token: result.token,
          authenticatedAt: result.completedAt,
        };

        console.log("Aplicação inicializada com sucesso!");
        console.log("Agent Info:", this.agentInfo);

        return true;
      } else {
        console.error("Falha na inicialização:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Erro crítico na inicialização:", error);
      return false;
    }
  }

  async executarComandoAgente(comando, dados = {}) {
    // Verificar se está autenticado
    if (!this.isAuthenticated) {
      throw new Error(
        "Aplicação não está autenticada. Execute inicializar() primeiro."
      );
    }

    // Verificar se token ainda é válido
    if (!this.olosApi.isTokenValid()) {
      console.log("Token expirado, renovando autenticação...");
      const renewed = await this.renovarAutenticacao();
      if (!renewed) {
        throw new Error("Não foi possível renovar a autenticação");
      }
    }

    console.log(`Executando comando: ${comando}`, dados);

    // Aqui você implementaria chamadas específicas para outros endpoints
    // usando this.agentInfo.token e this.agentInfo.agentId

    return {
      success: true,
      agentId: this.agentInfo.agentId,
      comando: comando,
      dados: dados,
      executadoEm: new Date().toISOString(),
    };
  }

  async renovarAutenticacao() {
    if (!this.agentInfo) {
      console.error("Sem informações de agente para renovar");
      return false;
    }

    console.log("Renovando autenticação...");

    const result = await this.olosApi.authenticateAgentComplete(
      this.agentInfo.login,
      "senha_salva_seguramente", // Em produção, implemente armazenamento seguro
      true
    );

    if (result.success) {
      this.agentInfo.token = result.token;
      this.agentInfo.authenticatedAt = result.completedAt;
      console.log("Autenticação renovada com sucesso");
      return true;
    }

    console.error("Falha na renovação:", result.error);
    this.isAuthenticated = false;
    return false;
  }

  getStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      agentInfo: this.agentInfo,
      tokenValid: this.olosApi.isTokenValid(),
      tokenInfo: this.olosApi.getTokenInfo(),
    };
  }

  desconectar() {
    this.isAuthenticated = false;
    this.agentInfo = null;
    this.olosApi.clearToken();
    console.log("Aplicação desconectada");
  }
}

// Funções auxiliares para os exemplos (simular interface)
function mostrarLoading(mensagem) {
  console.log(`🔄 Loading: ${mensagem}`);
}

function mostrarSucesso(mensagem) {
  console.log(`✅ Sucesso: ${mensagem}`);
}

function mostrarErro(mensagem) {
  console.error(`❌ Erro: ${mensagem}`);
}

function esconderLoading() {
  console.log("🔄 Loading finalizado");
}

function habilitarRecursosAutenticados(authResult) {
  console.log("🔓 Recursos autenticados habilitados:", authResult);
}
