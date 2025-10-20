// Configurações da API
const API_CONFIG = {
  baseUrl: "https://204.199.43.30:4333/WebAPIAgentControl",
  credentials: {
    username: "api_token",
    password: "olos@123",
    grant_type: "password",
    client_id: "e9b9383e437b4bf284553c2f8af3ea82",
    client_secret: "MCZ0mUMHJp7ZL0bTGbY_FS8jQqhpH9mHFDmPP9jd8TQ",
  },
  agentCredentials: {
    login: "agente2_crm04",
    password: "7I4SCneW",
    forceLogout: true,
  },
};

// Função para obter o token de autenticação
async function getAuthToken() {
  try {
    const formData = new URLSearchParams();
    formData.append("username", API_CONFIG.credentials.username);
    formData.append("password", API_CONFIG.credentials.password);
    formData.append("grant_type", API_CONFIG.credentials.grant_type);
    formData.append("client_id", API_CONFIG.credentials.client_id);
    formData.append("client_secret", API_CONFIG.credentials.client_secret);

    const response = await fetch(`${API_CONFIG.baseUrl}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Erro na autenticação: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Token obtido com sucesso:", data);
    return data.access_token;
  } catch (error) {
    console.error("Erro ao obter token:", error);
    throw error;
  }
}

// Função para autenticar o agente
async function authenticateAgent(token) {
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/AgentCommand/AgentAuthentication`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "api-olos/1.0",
        },
        body: JSON.stringify({
          Login: API_CONFIG.agentCredentials.login,
          Password: API_CONFIG.agentCredentials.password,
          ForceLogout: API_CONFIG.agentCredentials.forceLogout,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erro na autenticação do agente: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Agente autenticado com sucesso:", data);
    return data;
  } catch (error) {
    console.error("Erro ao autenticar agente:", error);
    throw error;
  }
}

// Função principal que executa os dois métodos em sequência
async function executeApiMethods() {
  try {
    console.log("Iniciando processo de autenticação...");

    // Passo 1: Obter token de autenticação
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Token não foi obtido");
    }

    console.log("Token obtido, procedendo com autenticação do agente...");

    // Passo 2: Autenticar agente usando o token
    const agentAuthResult = await authenticateAgent(token);

    console.log("Processo completo executado com sucesso!");
    return {
      success: true,
      token: token,
      agentAuth: agentAuthResult,
    };
  } catch (error) {
    console.error("Erro no processo:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Função para atualizar a interface com o resultado
function updateUI(result) {
  const resultDiv = document.getElementById("api-result");
  if (!resultDiv) return;

  if (result.success) {
    resultDiv.innerHTML = `
            <div class="alert alert-success">
                <h5>✅ API executada com sucesso!</h5>
                <p><strong>Token obtido:</strong> ${
                  result.token ? result.token.substring(0, 20) + "..." : "N/A"
                }</p>
                <p><strong>Resultado da autenticação:</strong></p>
                <pre>${JSON.stringify(result.agentAuth, null, 2)}</pre>
            </div>
        `;
  } else {
    resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <h5>❌ Erro na execução da API</h5>
                <p>${result.error}</p>
            </div>
        `;
  }
}

// Função para executar e atualizar a UI
async function executeAndUpdateUI() {
  const button = document.getElementById("execute-api-btn");
  const resultDiv = document.getElementById("api-result");

  // Mostrar loading
  if (button) {
    button.disabled = true;
    button.textContent = "Executando...";
  }

  if (resultDiv) {
    resultDiv.innerHTML = `
            <div class="alert alert-info">
                <p>🔄 Executando chamadas da API...</p>
            </div>
        `;
  }

  try {
    const result = await executeApiMethods();
    updateUI(result);
  } finally {
    // Restaurar botão
    if (button) {
      button.disabled = false;
      button.textContent = "Executar API";
    }
  }
}

// Expor funções globalmente para uso na página
window.apiMethods = {
  executeApiMethods,
  executeAndUpdateUI,
  getAuthToken,
  authenticateAgent,
};
