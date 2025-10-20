/**
 * Olos Integration Library
 * Biblioteca para integração com WebAPIAgentControl
 * Versão: 1.0.0
 * Autor: DefyIt Tecnologia da Informação
 * Revisor: Ricardo Carrer
 * Data: 2024-06-26
 */

class OlosIntegration {
  constructor(config = {}) {
    // Configurações padrão de desenvolvimento
    this.config = {
      baseUrl: config.baseUrl || "https://179.190.9.244:4333", //179.190.9.244 //204.199.43.30
      tokenEndpoint: config.tokenEndpoint || "/WebAPIAgentControl/token",
      credentials: {
        username: config.username || "api_token",
        password: config.password || "olos@123",
        grant_type: config.grant_type || "password",
        client_id: config.client_id || "e9b9383e437b4bf284553c2f8af3ea82",
        client_secret:
          config.client_secret || "MCZ0mUMHJp7ZL0bTGbY_FS8jQqhpH9mHFDmPP9jd8TQ",
      },
      timeout: config.timeout || 30000, // 30 segundos
      debug: config.debug || true,
    };

    // Armazenar token atual
    this.currentToken = null;
    this.tokenExpiration = null;

    // Inicializar tabela de event types
    this.initializeEventTypes();
    this.initializeAgentStatuses();
  }

  /**
   * Inicializar mapeamento de Event Types
   */
  initializeEventTypes() {
    /**
     * Mapeamento completo de Event Types do sistema Olos
     * Índice corresponde ao eventTypeId numérico retornado pela API
     */
    this.eventTypes = {
      0: "Nothing",
      1: "LoginCCM",
      2: "LogoutCCM",
      3: "LoginCampaign",
      4: "LogoutCampaign",
      5: "ChangeStatus",
      6: "ScreenPop",
      7: "ChangeStatusFail",
      8: "DispositionRequestFail",
      9: "LoginCCMFail",
      10: "LoginCampaignFail",
      11: "LogoutCCMFail",
      12: "LogoutCampaignFail",
      13: "OnlineCampaignChangeStatusId",
      14: "PassCode",
      15: "NewChat",
      16: "NewChatMsg",
      17: "EndChat",
      18: "NewMessage",
      19: "ConsultingRequestFail",
      20: "ActiveCall",
      21: "ManualCallRequestFail",
      22: "ChangeManualCallState",
      23: "RedialRequestFail",
      24: "RedialSuccess",
      25: "ListActiveCalls",
      26: "PrivateCallbackFail",
      27: "ThirdPartyScreenPop",
      28: "ChangePreviewCallState",
      29: "ChangePreviewCallResult",
      30: "CustomerClosureConfirmation",
      31: "PreviewDnisLocateResult",
      32: "BlindTransferRequestFail",
      33: "SendMsgToSupervisorFail",
      34: "NewMsgFromSupervisor",
      35: "ConferenceRequestAccepted",
      36: "ParticipantJoinedConference",
      37: "ParticipantLeftConference",
      38: "ConferenceRequestFail",
      39: "StopConferenceRequestAccepted",
      40: "StopConferenceRequestFail",
      41: "ConferencePaused",
      42: "ConferenceResumed",
      43: "LogoutReason",
      44: "ScreenPopPossibleCustomers",
      45: "SetCurrentCustomerFail",
      46: "SetCurrentCustomerSuccess",
      47: "PauseRecordingResponse",
      48: "ResumeRecordingResponse",
      49: "RecordStateNotify",
      50: "ExtendWrapTimeoutResponse",
      51: "DisableHeartbeatControlResponse",
      52: "AgentCallConnected",
      53: "AgentCallDisconnected",
      54: "ConnectAgentLoginCallFail",
      55: "DropAgentLoginCallFail",
      56: "ThirdPartyEvent",
      57: "Não Mapeado",
    };

    // Criar mapeamento reverso (nome -> id) para facilidade de uso
    this.eventTypeNames = {};
    Object.entries(this.eventTypes).forEach(([id, name]) => {
      this.eventTypeNames[name] = parseInt(id);
    });

    // Sistema de callbacks para eventos
    this.eventCallbacks = new Map();
    this.globalEventCallback = null;
  }

  /**
   * Inicializar mapeamento dos status de agentes do sistema Olos
   */
  initializeAgentStatuses() {
    this.agentStatuses = {
      0: "Nothing",
      1: "Idle",
      2: "Talking",
      3: "Wrap",
      4: "Pause",
      5: "Ending",
      6: "TalkingWithPause",
      7: "WrapWithPause",
      8: "TalkingWithEnding",
      9: "WrapWithEnding",
      10: "Consulting",
      11: "Chat",
      12: "ChatWithPause",
      13: "ChatWithEnding",
      14: "ConsultingWithPause",
      15: "ConsultingWithEnding",
      16: "Transfering",
      17: "Holding",
      18: "HoldingWithPause",
      19: "HoldingWithEnding",
      20: "ManualCall",
      21: "TalkingWithManualCall",
      22: "WrapWithManualCall",
      23: "ConsultingWithManualCall",
      24: "HoldingWithManualCall",
      25: "Redial",
      26: "PrivateCallback",
      27: "TalkingWithPrivateCallback",
      28: "WrapWithPrivateCallback",
      29: "ManualcallWithPrivateCallback",
      30: "ConsultingWithEndingWithPrivateCallback",
      31: "HoldingWithPrivateCallback",
      32: "ThirdPartyCampaign",
      33: "PersonalCall",
      34: "TalkingWithPersonalCall",
      35: "WrapWithPersonalCall",
      36: "ManualcallWithPersonalCall",
      37: "ConsultingWithPersonalCall",
      38: "HoldingWithPersonalCall",
      39: "PersonalCallWithPause",
      40: "PersonalCallWithEnding",
      41: "Analyzing",
      42: "Attempting",
      43: "Waiting",
      44: "AnalyzingWithPause",
      45: "AnalyzingWithEnding",
      46: "AnalyzingWithPrivateCallback",
      47: "AnalyzingWithPersonalCall",
      48: "AttemptingWithPause",
      49: "AttemptingWithEnding",
      50: "AttemptingWithPersonalCall",
      51: "AttemptingWithPrivateCallback",
      52: "AfterAttempting",
      53: "AfterAttemptWithPersonalCall",
      54: "RedialWithPersonalCall",
      55: "InConference",
      56: "InConferenceWithPause",
      57: "InConferenceWithEnding",
      58: "InConferenceWithManualCall",
      59: "InConferenceWithPrivateCallback",
      60: "InConferenceWithPersonalCall",
      61: "Reading",
      62: "Pausing",
      63: "RedialWithPrivateCallback",
    };

    this.agentStatusNames = {};
    Object.entries(this.agentStatuses).forEach(([id, name]) => {
      this.agentStatusNames[name] = parseInt(id, 10);
    });
  }

  /**
   * Registrar callback para um tipo de evento específico
   * @param {string|number} eventType - Nome do evento (ex: 'PassCode') ou ID numérico
   * @param {Function} callback - Função a ser chamada quando o evento ocorrer
   * @returns {boolean} - True se o callback foi registrado com sucesso
   */
  registerEventCallback(eventType, callback) {
    try {
      console.log("[DEBUG] registerEventCallback chamado:", {
        eventType,
        callbackType: typeof callback,
      });

      if (typeof callback !== "function") {
        throw new Error("Callback deve ser uma função");
      }

      // Converter nome do evento para ID se necessário
      let eventId;
      if (typeof eventType === "string") {
        eventId = this.eventTypeNames[eventType];
        console.log(
          "[DEBUG] Convertendo nome para ID:",
          eventType,
          "→",
          eventId
        );
        if (eventId === undefined) {
          throw new Error(`Tipo de evento '${eventType}' não encontrado`);
        }
      } else if (typeof eventType === "number") {
        eventId = eventType;
        console.log("[DEBUG] Usando ID numérico:", eventId);
        if (!this.eventTypes[eventId]) {
          throw new Error(`ID de evento '${eventType}' não encontrado`);
        }
      } else {
        throw new Error("Tipo de evento deve ser string ou número");
      }

      console.log(
        "[DEBUG] Registrando callback para eventId:",
        eventId,
        "nome:",
        this.eventTypes[eventId]
      );
      this.eventCallbacks.set(eventId, callback);

      console.log(
        "[DEBUG] Callbacks após registro:",
        Array.from(this.eventCallbacks.keys())
      );

      this.log(
        `Callback registrado para evento: ${this.eventTypes[eventId]} (ID: ${eventId})`
      );
      return true;
    } catch (error) {
      console.error("[DEBUG] Erro ao registrar callback:", error);
      this.logError("Erro ao registrar callback de evento", error);
      return false;
    }
  }

  /**
   * Registrar callback global para todos os eventos
   * @param {Function} callback - Função a ser chamada para qualquer evento
   * @returns {boolean} - True se o callback foi registrado com sucesso
   */
  registerGlobalEventCallback(callback) {
    try {
      if (typeof callback !== "function") {
        throw new Error("Callback deve ser uma função");
      }

      this.globalEventCallback = callback;
      this.log("Callback global de eventos registrado");
      return true;
    } catch (error) {
      this.logError("Erro ao registrar callback global de evento", error);
      return false;
    }
  }

  /**
   * Remover callback de um tipo de evento específico
   * @param {string|number} eventType - Nome do evento ou ID numérico
   * @returns {boolean} - True se o callback foi removido com sucesso
   */
  removeEventCallback(eventType) {
    try {
      // Converter nome do evento para ID se necessário
      let eventId;
      if (typeof eventType === "string") {
        eventId = this.eventTypeNames[eventType];
        if (eventId === undefined) {
          throw new Error(`Tipo de evento '${eventType}' não encontrado`);
        }
      } else if (typeof eventType === "number") {
        eventId = eventType;
      } else {
        throw new Error("Tipo de evento deve ser string ou número");
      }

      const removed = this.eventCallbacks.delete(eventId);
      if (removed) {
        this.log(
          `Callback removido para evento: ${
            this.eventTypes[eventId] || eventId
          }`
        );
      }
      return removed;
    } catch (error) {
      this.logError("Erro ao remover callback de evento", error);
      return false;
    }
  }

  /**
   * Remover callback global
   */
  removeGlobalEventCallback() {
    this.globalEventCallback = null;
    this.log("Callback global de eventos removido");
  }

  /**
   * Disparar callbacks para um evento
   * @param {Object} eventData - Dados do evento
   * @private
   */
  _triggerEventCallbacks(eventData) {
    try {
      const eventType = eventData.agentEventType;
      console.log("[DEBUG] _triggerEventCallbacks chamado:", {
        eventType,
        eventData,
      });

      if (eventType === undefined || eventType === null) {
        console.log("[DEBUG] Evento sem tipo válido, cancelando callbacks");
        return;
      }

      // Debug: verificar callbacks registrados
      console.log(
        "[DEBUG] Callbacks registrados:",
        Array.from(this.eventCallbacks.keys())
      );
      console.log(
        "[DEBUG] Procurando callback para eventType:",
        eventType,
        "tipo:",
        typeof eventType
      );

      // Preparar dados do evento para o callback
      let resolvedEventTypeName;
      let resolvedEventTypeId;

      if (typeof eventType === "string") {
        // Se eventType é string (nome do evento), já temos o nome
        resolvedEventTypeName = eventType;
        // Buscar o ID correspondente
        resolvedEventTypeId = this.eventTypeNames[eventType];
      } else if (typeof eventType === "number") {
        // Se eventType é número (ID), buscar o nome
        resolvedEventTypeName =
          this.eventTypes[eventType] || `Evento Desconhecido(${eventType})`;
        resolvedEventTypeId = eventType;
      } else {
        // Caso não seja nem string nem número
        resolvedEventTypeName = `Evento Desconhecido(${eventType})`;
        resolvedEventTypeId = eventType;
      }

      const callbackData = {
        eventType: resolvedEventTypeId || eventType,
        eventTypeName: resolvedEventTypeName,
        eventObject: eventData.eventObject,
        fullEvent: eventData,
        timestamp: new Date().toISOString(),
      };

      // Disparar callback específico se existir
      // Procurar callback - testar tanto ID numérico quanto nome string
      let specificCallback = null;

      if (typeof eventType === "string") {
        // Se eventType é string (nome do evento), buscar pelo ID correspondente
        const eventId = this.eventTypeNames[eventType];
        console.log(
          "[DEBUG] Convertendo nome para ID:",
          eventType,
          "→",
          eventId
        );
        if (eventId !== undefined) {
          specificCallback = this.eventCallbacks.get(eventId);
          console.log(
            "[DEBUG] Callback encontrado por ID:",
            !!specificCallback
          );
        }

        // Também tentar buscar diretamente pelo nome (fallback)
        if (!specificCallback) {
          specificCallback = this.eventCallbacks.get(eventType);
          console.log(
            "[DEBUG] Callback encontrado por nome:",
            !!specificCallback
          );
        }
      } else if (typeof eventType === "number") {
        // Se eventType é número, buscar diretamente
        specificCallback = this.eventCallbacks.get(eventType);
        console.log(
          "[DEBUG] Callback encontrado por número:",
          !!specificCallback
        );
      }

      console.log(
        "[DEBUG] Callback específico encontrado:",
        !!specificCallback
      );

      if (specificCallback) {
        try {
          console.log(
            "[DEBUG] Disparando callback específico para:",
            callbackData.eventTypeName
          );
          this.log(
            `Disparando callback específico para evento: ${callbackData.eventTypeName}`
          );
          specificCallback(callbackData);
        } catch (callbackError) {
          console.error("[DEBUG] Erro no callback específico:", callbackError);
          this.logError(
            `Erro no callback específico para evento ${callbackData.eventTypeName}`,
            callbackError
          );
        }
      }

      // Disparar callback global se existir
      if (this.globalEventCallback) {
        try {
          console.log("[DEBUG] Disparando callback global");
          this.globalEventCallback(callbackData);
        } catch (callbackError) {
          console.error("[DEBUG] Erro no callback global:", callbackError);
          this.logError("Erro no callback global de evento", callbackError);
        }
      } else {
        console.log("[DEBUG] Nenhum callback global registrado");
      }
    } catch (error) {
      console.error("[DEBUG] Erro geral em _triggerEventCallbacks:", error);
      this.logError("Erro ao disparar callbacks de evento", error);
    }
  }

  /**
   * Listar callbacks registrados
   * @returns {Object} - Objeto com informações sobre callbacks registrados
   */
  listEventCallbacks() {
    const registeredCallbacks = {};

    this.eventCallbacks.forEach((callback, eventId) => {
      registeredCallbacks[eventId] = {
        eventName:
          this.eventTypes[eventId] || `Evento Desconhecido(${eventId})`,
        hasCallback: true,
      };
    });

    return {
      specificCallbacks: registeredCallbacks,
      specificCallbacksCount: this.eventCallbacks.size,
      hasGlobalCallback: this.globalEventCallback !== null,
      totalCallbacks:
        this.eventCallbacks.size + (this.globalEventCallback ? 1 : 0),
    };
  }

  /**
   * Função para logging baseada na configuração debug
   */
  log(message, data = null) {
    if (this.config.debug) {
      if (data) {
        console.log(`[OlosIntegration] ${message}`, data);
      } else {
        console.log(`[OlosIntegration] ${message}`);
      }
    }
  }

  /**
   * Função para logging de erros
   */
  logError(message, error = null) {
    if (error) {
      console.error(`[OlosIntegration ERROR] ${message}`, error);
    } else {
      console.error(`[OlosIntegration ERROR] ${message}`);
    }
  }

  /**
   * Obter token de autenticação
   * @param {Object} customCredentials - Credenciais personalizadas (opcional)
   * @returns {Promise<Object>} - Objeto com token e informações
   */
  async getToken(customCredentials = {}) {
    try {
      this.log("Iniciando obtenção de token...");

      // Mesclar credenciais personalizadas com as padrão
      const credentials = {
        ...this.config.credentials,
        ...customCredentials,
      };

      // Preparar dados do formulário
      const formData = new URLSearchParams();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);
      formData.append("grant_type", credentials.grant_type);
      formData.append("client_id", credentials.client_id);
      formData.append("client_secret", credentials.client_secret);

      this.log("Enviando requisição para obter token...", {
        url: `${this.config.baseUrl}${this.config.tokenEndpoint}`,
        credentials: {
          username: credentials.username,
          grant_type: credentials.grant_type,
          client_id: credentials.client_id,
          // Não loggar senha e client_secret por segurança
        },
      });

      // Fazer a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}${this.config.tokenEndpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(`Resposta recebida - Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const tokenData = await response.json();

      this.log("Token obtido com sucesso", {
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
      });

      // Armazenar token e calcular expiração
      this.currentToken = tokenData.access_token;
      if (tokenData.expires_in) {
        this.tokenExpiration = new Date(
          Date.now() + tokenData.expires_in * 1000
        );
        this.log(`Token expira em: ${this.tokenExpiration.toLocaleString()}`);
      }

      return {
        success: true,
        token: tokenData.access_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
        fullResponse: tokenData,
        obtainedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao obter token", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "request_error",
        details: error,
      };
    }
  }

  /**
   * Verificar se o token atual ainda é válido
   * @returns {boolean}
   */
  isTokenValid() {
    if (!this.currentToken) {
      return false;
    }

    if (this.tokenExpiration) {
      const now = new Date();
      const timeUntilExpiration =
        this.tokenExpiration.getTime() - now.getTime();

      // Considerar inválido se expira em menos de 5 minutos
      if (timeUntilExpiration < 5 * 60 * 1000) {
        this.log("Token próximo ao vencimento, será renovado");
        return false;
      }
    }

    return true;
  }

  /**
   * Obter token válido (reutiliza se ainda válido, senão obtém novo)
   * @param {Object} customCredentials - Credenciais personalizadas (opcional)
   * @returns {Promise<Object>}
   */
  async getValidToken(customCredentials = {}) {
    if (this.isTokenValid()) {
      this.log("Reutilizando token válido existente");
      return {
        success: true,
        token: this.currentToken,
        fromCache: true,
      };
    }

    this.log("Obtendo novo token...");
    return await this.getToken(customCredentials);
  }

  /**
   * Autenticar agente no sistema
   * @param {string} login - Login do agente
   * @param {string} password - Senha do agente
   * @param {boolean} forceLogout - Forçar logout se já autenticado (padrão: true)
   * @param {string} customToken - Token personalizado (opcional, usa o atual se não informado)
   * @returns {Promise<Object>} - Resultado da autenticação
   */
  async authenticateAgent(
    login,
    password,
    forceLogout = true,
    customToken = null
  ) {
    try {
      this.log("Iniciando autenticação de agente...", {
        login: login,
        forceLogout: forceLogout,
      });

      // Usar token fornecido ou obter um válido
      let token = customToken;
      if (!token) {
        const tokenResult = await this.getValidToken();
        if (!tokenResult.success) {
          throw new Error(`Falha ao obter token: ${tokenResult.error}`);
        }
        token = tokenResult.token;
      }

      // Preparar payload
      const payload = {
        Login: login,
        Password: password,
        ForceLogout: forceLogout,
      };

      this.log("Enviando requisição de autenticação do agente...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/AgentAuthentication`,
        login: login,
        forceLogout: forceLogout,
      });

      // Fazer a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/AgentAuthentication`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da autenticação recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const agentData = await response.json();

      this.log("Agente autenticado com sucesso", {
        agentId: agentData.AgentId,
      });

      return {
        success: true,
        agentId: agentData.agentId,
        login: login,
        fullResponse: agentData,
        authenticatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao autenticar agente", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na autenticação do agente",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "authentication_error",
        details: error,
      };
    }
  }

  /**
   * Autenticar agente no sistema com pausa (ReasonCode)
   * @param {string} login - Login do agente
   * @param {string} password - Senha do agente
   * @param {string} reasonCode - Código da razão para pausa
   * @param {boolean} forceLogout - Forçar logout se já autenticado (padrão: true)
   * @param {string} customToken - Token personalizado (opcional, usa o atual se não informado)
   * @returns {Promise<Object>} - Resultado da autenticação com pausa
   */
  async authenticateAgentWithPause(
    login,
    password,
    reasonCode,
    forceLogout = true,
    customToken = null
  ) {
    try {
      this.log("Iniciando autenticação de agente com pausa...", {
        login: login,
        reasonCode: reasonCode,
        forceLogout: forceLogout,
      });

      // Usar token fornecido ou obter um válido
      let token = customToken;
      if (!token) {
        const tokenResult = await this.getValidToken();
        if (!tokenResult.success) {
          throw new Error(`Falha ao obter token: ${tokenResult.error}`);
        }
        token = tokenResult.token;
      }

      // Preparar payload
      const payload = {
        Login: login,
        Password: password,
        ReasonCode: reasonCode,
        ForceLogout: forceLogout,
      };

      this.log("Enviando requisição de autenticação do agente com pausa...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/AgentAuthenticationWithPause`,
        login: login,
        reasonCode: reasonCode,
        forceLogout: forceLogout,
      });

      // Fazer a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/AgentAuthenticationWithPause`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da autenticação com pausa recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const agentData = await response.json();

      this.log("Agente autenticado com pausa com sucesso", {
        agentId: agentData.AgentId,
        reasonCode: reasonCode,
      });

      return {
        success: true,
        agentId: agentData.agentId,
        login: login,
        reasonCode: reasonCode,
        fullResponse: agentData,
        authenticatedAt: new Date().toISOString(),
        withPause: true,
      };
    } catch (error) {
      this.logError("Erro ao autenticar agente com pausa", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na autenticação do agente com pausa",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "authentication_with_pause_error",
        details: error,
      };
    }
  }

  /**
   * Fazer logout do agente no sistema
   * @param {number} agentId - ID do agente
   * @param {string} customToken - Token personalizado (opcional, usa o atual se não informado)
   * @returns {Promise<Object>} - Resultado do logout
   */
  async agentLogout(agentId, customToken = null) {
    try {
      this.log("Iniciando logout de agente...", {
        agentId: agentId,
      });

      // Usar token fornecido ou obter um válido
      let token = customToken;
      if (!token) {
        const tokenResult = await this.getValidToken();
        if (!tokenResult.success) {
          throw new Error(`Falha ao obter token: ${tokenResult.error}`);
        }
        token = tokenResult.token;
      }

      // Verificar se agentId foi fornecido
      if (!agentId) {
        throw new Error("AgentId é obrigatório");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
      };

      this.log("Enviando requisição de logout do agente...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/AgentLogout`,
        agentId: agentId,
      });

      // Fazer a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/AgentLogout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(`Resposta do logout recebida - Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const logoutData = await response.json();

      this.log("Logout do agente realizado com sucesso", {
        agentId: agentId,
        state: logoutData.State,
      });

      return {
        success: true,
        agentId: agentId,
        state: logoutData.State,
        fullResponse: logoutData,
        loggedOutAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao fazer logout do agente", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout no logout do agente",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "logout_error",
        details: error,
      };
    }
  }

  /**
   * Realizar hangup (desligar) de uma chamada
   * @param {number} agentId - ID do agente
   * @param {number} callId - ID da chamada
   * @param {string} customToken - Token personalizado (opcional, usa o atual se não informado)
   * @returns {Promise<Object>} - Resultado da requisição de hangup
   */
  async hangupRequest(agentId, callId, customToken = null) {
    try {
      this.log("Iniciando requisição de hangup...", {
        agentId: agentId,
        callId: callId,
      });

      // Usar token fornecido ou obter um válido
      let token = customToken;
      if (!token) {
        const tokenResult = await this.getValidToken();
        if (!tokenResult.success) {
          throw new Error(`Falha ao obter token: ${tokenResult.error}`);
        }
        token = tokenResult.token;
      }

      // Validar parâmetros obrigatórios
      if (!agentId) {
        throw new Error("AgentId é obrigatório");
      }

      if (!callId) {
        throw new Error("CallId é obrigatório");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
        CallId: callId,
      };

      this.log("Enviando requisição de hangup...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/HangupRequest`,
        agentId: agentId,
        callId: callId,
      });

      // Fazer a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/HangupRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de hangup recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const hangupData = await response.json();

      this.log("Hangup realizado com sucesso", {
        agentId: agentId,
        callId: callId,
        state: hangupData.State,
      });

      return {
        success: true,
        agentId: agentId,
        callId: callId,
        state: hangupData.State,
        fullResponse: hangupData,
        executedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao realizar hangup", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de hangup",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "hangup_error",
        details: error,
      };
    }
  }

  /**
   * Requisitar estado de chamada manual
   * @param {number} agentId - ID do agente
   * @param {string} customToken - Token personalizado (opcional, usa o atual se não informado)
   * @returns {Promise<Object>} - Resultado da requisição de estado de chamada manual
   */
  async manualCallStateRequest(agentId, customToken = null) {
    try {
      this.log("Iniciando requisição de estado de chamada manual...", {
        agentId: agentId,
      });

      // Usar token fornecido ou obter um válido
      let token = customToken;
      if (!token) {
        const tokenResult = await this.getValidToken();
        if (!tokenResult.success) {
          throw new Error(`Falha ao obter token: ${tokenResult.error}`);
        }
        token = tokenResult.token;
      }

      // Validar parâmetros obrigatórios
      if (!agentId) {
        throw new Error("AgentId é obrigatório");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
      };

      this.log("Enviando requisição de estado de chamada manual...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ManualCallStateRequest`,
        agentId: agentId,
      });

      // Fazer a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ManualCallStateRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de estado de chamada manual recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const stateData = await response.json();

      this.log("Estado de chamada manual obtido com sucesso", {
        agentId: agentId,
        state: stateData.State,
      });

      return {
        success: true,
        agentId: agentId,
        state: stateData.State,
        fullResponse: stateData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao obter estado de chamada manual", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de estado de chamada manual",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "manual_call_state_error",
        details: error,
      };
    }
  }

  /**
   * Fazer rediscagem para um agente
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da rediscagem
   */
  async redialRequest(agentId, customToken = null) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
      };

      this.log("Enviando requisição de rediscagem...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/RedialRequest`,
        agentId: agentId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/RedialRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de rediscagem recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const redialData = await response.json();

      this.log("Rediscagem realizada com sucesso", {
        agentId: agentId,
        state: redialData.State,
      });

      return {
        success: true,
        agentId: agentId,
        state: redialData.State,
        fullResponse: redialData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao executar rediscagem", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de rediscagem",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "redial_error",
        details: error,
      };
    }
  }

  /**
   * Fazer rediscagem com número de telefone específico
   * @param {string} ddi - Código DDI (Discagem Direta Internacional)
   * @param {string} phoneNumber - Número de telefone
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da rediscagem com telefone
   */
  async redialRequestWithPhone(ddi, phoneNumber, agentId, customToken = null) {
    try {
      // Validar parâmetros obrigatórios
      if (!ddi || typeof ddi !== "string") {
        throw new Error("DDI é obrigatório e deve ser uma string");
      }

      if (!phoneNumber || typeof phoneNumber !== "string") {
        throw new Error("PhoneNumber é obrigatório e deve ser uma string");
      }

      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        DDI: ddi,
        PhoneNumber: phoneNumber,
        AgentId: agentId,
      };

      this.log("Enviando requisição de rediscagem com telefone...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/RedialRequestWithPhone`,
        ddi: ddi,
        phoneNumber: phoneNumber,
        agentId: agentId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/RedialRequestWithPhone`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de rediscagem com telefone recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const redialData = await response.json();

      this.log("Rediscagem com telefone realizada com sucesso", {
        ddi: ddi,
        phoneNumber: phoneNumber,
        agentId: agentId,
        state: redialData.State,
      });

      return {
        success: true,
        ddi: ddi,
        phoneNumber: phoneNumber,
        agentId: agentId,
        state: redialData.State,
        fullResponse: redialData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao executar rediscagem com telefone", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de rediscagem com telefone",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "redial_with_phone_error",
        details: error,
      };
    }
  }

  /**
   * Desligar chamada e aplicar código de disposição
   * @param {string} dispositionCode - Código de disposição
   * @param {number} agentId - ID do agente
   * @param {number} callId - ID da chamada
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de desligamento com disposição
   */
  async hangupAndDispositionCallByCode(
    dispositionCode,
    agentId,
    callId,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!dispositionCode || typeof dispositionCode !== "string") {
        throw new Error("DispositionCode é obrigatório e deve ser uma string");
      }

      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!callId || typeof callId !== "number") {
        throw new Error("CallId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        DispositionCode: dispositionCode,
        AgentId: agentId,
        CallId: callId,
      };

      this.log("Enviando requisição de desligamento com disposição...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/HangupAndDispositionCallByCode`,
        dispositionCode: dispositionCode,
        agentId: agentId,
        callId: callId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/HangupAndDispositionCallByCode`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de desligamento com disposição recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const hangupData = await response.json();

      this.log("Desligamento com disposição realizado com sucesso", {
        dispositionCode: dispositionCode,
        agentId: agentId,
        callId: callId,
        state: hangupData.State,
      });

      return {
        success: true,
        dispositionCode: dispositionCode,
        agentId: agentId,
        callId: callId,
        state: hangupData.State,
        fullResponse: hangupData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao executar desligamento com disposição", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de desligamento com disposição",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "hangup_disposition_error",
        details: error,
      };
    }
  }

  /**
   * Aplicar código de disposição a uma chamada sem desligar
   * @param {string} dispositionCode - Código de disposição
   * @param {number} agentId - ID do agente
   * @param {number} callId - ID da chamada
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de disposição
   */
  async dispositionCallByCode(
    dispositionCode,
    agentId,
    callId,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!dispositionCode || typeof dispositionCode !== "string") {
        throw new Error("DispositionCode é obrigatório e deve ser uma string");
      }

      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!callId || typeof callId !== "number") {
        throw new Error("CallId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        DispositionCode: dispositionCode,
        AgentId: agentId,
        CallId: callId,
      };

      this.log("Enviando requisição de disposição de chamada...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/DispositionCallByCode`,
        dispositionCode: dispositionCode,
        agentId: agentId,
        callId: callId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/DispositionCallByCode`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de disposição de chamada recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const dispositionData = await response.json();

      this.log("Disposição de chamada realizada com sucesso", {
        dispositionCode: dispositionCode,
        agentId: agentId,
        callId: callId,
        state: dispositionData.State,
      });

      return {
        success: true,
        dispositionCode: dispositionCode,
        agentId: agentId,
        callId: callId,
        state: dispositionData.State,
        fullResponse: dispositionData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao executar disposição de chamada", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de disposição de chamada",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "disposition_error",
        details: error,
      };
    }
  }

  /**
   * Colocar agente em estado idle (pausa saída)
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de idle
   */
  async agentIdleRequest(agentId, customToken = null) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
      };

      this.log("Enviando requisição de agente idle...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/AgentIdleRequest`,
        agentId: agentId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/AgentIdleRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de agente idle recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const idleData = await response.json();

      this.log("Agente colocado em estado idle com sucesso", {
        agentId: agentId,
        state: idleData.State,
      });

      return {
        success: true,
        agentId: agentId,
        state: idleData.State,
        fullResponse: idleData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao colocar agente em estado idle", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de agente idle",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "agent_idle_error",
        details: error,
      };
    }
  }

  /**
   * Colocar agente em pausa com código de motivo
   * @param {string} reasonCode - Código do motivo da pausa
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de pausa com motivo
   */
  async agentReasonRequestByCode(reasonCode, agentId, customToken = null) {
    try {
      // Validar parâmetros obrigatórios
      if (!reasonCode || typeof reasonCode !== "string") {
        throw new Error("ReasonCode é obrigatório e deve ser uma string");
      }

      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        ReasonCode: reasonCode,
        AgentId: agentId,
      };

      this.log("Enviando requisição de pausa com código de motivo...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/AgentReasonRequestByCode`,
        reasonCode: reasonCode,
        agentId: agentId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/AgentReasonRequestByCode`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de pausa com código de motivo recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const reasonData = await response.json();

      this.log("Agente colocado em pausa com código de motivo com sucesso", {
        reasonCode: reasonCode,
        agentId: agentId,
        state: reasonData.State,
      });

      return {
        success: true,
        reasonCode: reasonCode,
        agentId: agentId,
        state: reasonData.State,
        fullResponse: reasonData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError(
        "Erro ao colocar agente em pausa com código de motivo",
        error
      );

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de pausa com código de motivo",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "agent_reason_error",
        details: error,
      };
    }
  }

  /**
   * Finalizar estado de chamada manual
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de finalização de chamada manual
   */
  async endManualCallStateRequest(agentId, customToken = null) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
      };

      this.log("Enviando requisição de finalização de chamada manual...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/EndManualCallStateRequest`,
        agentId: agentId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/EndManualCallStateRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de finalização de chamada manual recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const endCallData = await response.json();

      this.log("Finalização de chamada manual realizada com sucesso", {
        agentId: agentId,
        state: endCallData.State,
      });

      return {
        success: true,
        agentId: agentId,
        state: endCallData.State,
        fullResponse: endCallData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao finalizar chamada manual", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de finalização de chamada manual",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "end_manual_call_error",
        details: error,
      };
    }
  }

  /**
   * Realizar transferência cega para número externo
   * @param {string} phoneNumber - Número de telefone para transferir
   * @param {number} agentId - ID do agente
   * @param {string|null} uui - User-to-User Information (opcional)
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de transferência cega
   */
  async blindTransferCallRequest(
    phoneNumber,
    agentId,
    uui = null,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!phoneNumber || typeof phoneNumber !== "string") {
        throw new Error("PhoneNumber é obrigatório e deve ser uma string");
      }

      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        PhoneNumber: phoneNumber,
        AgentId: agentId,
      };

      // Adicionar UUI se fornecido
      if (uui) {
        payload.Uui = uui;
      }

      this.log("Enviando requisição de transferência cega...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/BlindTransferCallRequest`,
        phoneNumber: phoneNumber,
        agentId: agentId,
        uui: uui,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/BlindTransferCallRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de transferência cega recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const transferData = await response.json();

      this.log("Transferência cega realizada com sucesso", {
        phoneNumber: phoneNumber,
        agentId: agentId,
        uui: uui,
        state: transferData.State,
      });

      return {
        success: true,
        phoneNumber: phoneNumber,
        agentId: agentId,
        uui: uui,
        state: transferData.State,
        fullResponse: transferData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao realizar transferência cega", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de transferência cega",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "blind_transfer_error",
        details: error,
      };
    }
  }

  /**
   * Solicitar conferência entre todas as chamadas ativas do agente
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de conferência
   */
  async conferenceRequest(agentId, customToken = null) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
      };

      this.log("Enviando requisição de conferência...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ConferenceRequest`,
        agentId: agentId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ConferenceRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de conferência recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const conferenceData = await response.json();

      this.log("Conferência solicitada com sucesso", {
        agentId: agentId,
        state: conferenceData.State,
      });

      return {
        success: true,
        agentId: agentId,
        state: conferenceData.State,
        fullResponse: conferenceData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao solicitar conferência", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de conferência",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "conference_error",
        details: error,
      };
    }
  }

  /**
   * Solicitar chamada pessoal para um agente específico
   * @param {number} agentId - ID do agente que está fazendo a solicitação
   * @param {number} transferAgentId - ID do agente para transferir (opcional)
   * @param {string} transferLogin - Login do agente para transferir (opcional)
   * @param {string|null} uui - User-to-User Information (opcional)
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de chamada pessoal
   */
  async consultingAgentRequest(
    agentId,
    transferAgentId = null,
    transferLogin = null,
    uui = null,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Validar que pelo menos TransferAgentId ou TransferLogin foi fornecido
      if (!transferAgentId && !transferLogin) {
        throw new Error("TransferAgentId ou TransferLogin deve ser fornecido");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
      };

      // Adicionar parâmetros opcionais se fornecidos
      if (transferAgentId) {
        payload.TransferAgentId = transferAgentId;
      }

      if (transferLogin) {
        payload.TransferLogin = transferLogin;
      }

      if (uui) {
        payload.Uui = uui;
      }

      this.log("Enviando requisição de chamada pessoal...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ConsultingAgentRequest`,
        agentId: agentId,
        transferAgentId: transferAgentId,
        transferLogin: transferLogin,
        uui: uui,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ConsultingAgentRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de chamada pessoal recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const consultingData = await response.json();

      this.log("Chamada pessoal solicitada com sucesso", {
        agentId: agentId,
        transferAgentId: transferAgentId,
        transferLogin: transferLogin,
        uui: uui,
        state: consultingData.State,
      });

      return {
        success: true,
        agentId: agentId,
        transferAgentId: transferAgentId,
        transferLogin: transferLogin,
        uui: uui,
        state: consultingData.State,
        fullResponse: consultingData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao solicitar chamada pessoal", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de chamada pessoal",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "consulting_agent_error",
        details: error,
      };
    }
  }

  /**
   * Transferência para campanha ou número externo
   * @param {number} agentId - ID do agente
   * @param {string|null} phoneNumber - Número de telefone para transferir (opcional)
   * @param {number|null} campaignId - ID da campanha para transferir (opcional)
   * @param {string|null} uui - User-to-User Information (opcional)
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de consulta/transferência
   */
  async consultingRequest(
    agentId,
    phoneNumber = null,
    campaignId = null,
    uui = null,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Validar que pelo menos PhoneNumber ou CampaignId foi fornecido
      if (!phoneNumber && !campaignId) {
        throw new Error("PhoneNumber ou CampaignId deve ser fornecido");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
      };

      // Adicionar parâmetros opcionais se fornecidos
      if (phoneNumber) {
        payload.PhoneNumber = phoneNumber;
      }

      if (campaignId) {
        payload.CampaignId = campaignId;
      }

      if (uui) {
        payload.Uui = uui;
      }

      this.log("Enviando requisição de consulta/transferência...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ConsultingRequest`,
        agentId: agentId,
        phoneNumber: phoneNumber,
        campaignId: campaignId,
        uui: uui,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ConsultingRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de consulta/transferência recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const consultingData = await response.json();

      this.log("Consulta/transferência solicitada com sucesso", {
        agentId: agentId,
        phoneNumber: phoneNumber,
        campaignId: campaignId,
        uui: uui,
        state: consultingData.State,
      });

      return {
        success: true,
        agentId: agentId,
        phoneNumber: phoneNumber,
        campaignId: campaignId,
        uui: uui,
        state: consultingData.State,
        fullResponse: consultingData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao solicitar consulta/transferência", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de consulta/transferência",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "consulting_error",
        details: error,
      };
    }
  }

  /**
   * Transferência assistida para campanha
   * @param {number} agentId - ID do agente
   * @param {number} campaignId - ID da campanha para transferir
   * @param {number|null} transferAgentId - ID do agente para transferir (opcional)
   * @param {string|null} uui - User-to-User Information (opcional)
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de transferência assistida
   */
  async consultingAssistedCampaignRequest(
    agentId,
    campaignId,
    transferAgentId = null,
    uui = null,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!campaignId || typeof campaignId !== "number") {
        throw new Error("CampaignId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
        CampaignId: campaignId,
      };

      // Adicionar parâmetros opcionais se fornecidos
      if (transferAgentId) {
        payload.TransferAgentId = transferAgentId;
      }

      if (uui) {
        payload.Uui = uui;
      }

      this.log(
        "Enviando requisição de transferência assistida para campanha...",
        {
          url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ConsultingAssistedCampaignRequest`,
          agentId: agentId,
          campaignId: campaignId,
          transferAgentId: transferAgentId,
          uui: uui,
          payload: payload,
        }
      );

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ConsultingAssistedCampaignRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de transferência assistida recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const assistedData = await response.json();

      this.log("Transferência assistida para campanha solicitada com sucesso", {
        agentId: agentId,
        campaignId: campaignId,
        transferAgentId: transferAgentId,
        uui: uui,
        state: assistedData.State,
      });

      return {
        success: true,
        agentId: agentId,
        campaignId: campaignId,
        transferAgentId: transferAgentId,
        uui: uui,
        state: assistedData.State,
        fullResponse: assistedData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError(
        "Erro ao solicitar transferência assistida para campanha",
        error
      );

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de transferência assistida",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "consulting_assisted_error",
        details: error,
      };
    }
  }

  /**
   * Transferir chamada em consulta
   * @param {number} agentId - ID do agente
   * @param {number} callId - ID da chamada
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de transferência
   */
  async transferCallRequest(agentId, callId, customToken = null) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!callId || typeof callId !== "number") {
        throw new Error("CallId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
        CallId: callId,
      };

      this.log("Enviando requisição de transferência de chamada...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/TransferCallRequest`,
        agentId: agentId,
        callId: callId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/TransferCallRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de transferência de chamada recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const transferData = await response.json();

      this.log("Transferência de chamada realizada com sucesso", {
        agentId: agentId,
        callId: callId,
        state: transferData.State,
      });

      return {
        success: true,
        agentId: agentId,
        callId: callId,
        state: transferData.State,
        fullResponse: transferData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao transferir chamada", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de transferência de chamada",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "transfer_call_error",
        details: error,
      };
    }
  }

  /**
   * Transferência cega alternativa (ReferCallRequest)
   * @param {number} agentId - ID do agente
   * @param {string} phoneNumber - Número de telefone para transferir
   * @param {string|null} address - Endereço (opcional)
   * @param {string|null} uui - User-to-User Information (opcional)
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de transferência cega
   */
  async referCallRequest(
    agentId,
    phoneNumber,
    address = null,
    uui = null,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!phoneNumber || typeof phoneNumber !== "string") {
        throw new Error("PhoneNumber é obrigatório e deve ser uma string");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
        PhoneNumber: phoneNumber,
      };

      // Adicionar parâmetros opcionais se fornecidos
      if (address) {
        payload.Address = address;
      }

      if (uui) {
        payload.Uui = uui;
      }

      this.log("Enviando requisição de transferência cega (refer)...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ReferCallRequest`,
        agentId: agentId,
        phoneNumber: phoneNumber,
        address: address,
        uui: uui,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ReferCallRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de transferência cega (refer) recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const referData = await response.json();

      this.log("Transferência cega (refer) realizada com sucesso", {
        agentId: agentId,
        phoneNumber: phoneNumber,
        address: address,
        uui: uui,
        state: referData.State,
      });

      return {
        success: true,
        agentId: agentId,
        phoneNumber: phoneNumber,
        address: address,
        uui: uui,
        state: referData.State,
        fullResponse: referData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao realizar transferência cega (refer)", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de transferência cega (refer)",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "refer_call_error",
        details: error,
      };
    }
  }

  /**
   * Recuperar chamada
   * @param {number} agentId - ID do agente
   * @param {number} callId - ID da chamada
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de recuperação
   */
  async retrievesCall(agentId, callId, customToken = null) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!callId || typeof callId !== "number") {
        throw new Error("CallId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
        CallId: callId,
      };

      this.log("Enviando requisição de recuperação de chamada...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/RetrievesCall`,
        agentId: agentId,
        callId: callId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/RetrievesCall`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de recuperação de chamada recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const retrieveData = await response.json();

      this.log("Recuperação de chamada realizada com sucesso", {
        agentId: agentId,
        callId: callId,
        state: retrieveData.State,
      });

      return {
        success: true,
        agentId: agentId,
        callId: callId,
        state: retrieveData.State,
        fullResponse: retrieveData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao recuperar chamada", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de recuperação de chamada",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "retrieve_call_error",
        details: error,
      };
    }
  }

  /**
   * Parar conferência
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de parar conferência
   */
  async stopConferenceRequest(agentId, customToken = null) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
      };

      this.log("Enviando requisição para parar conferência...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/StopConferenceRequest`,
        agentId: agentId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/StopConferenceRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição para parar conferência recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const stopData = await response.json();

      this.log("Conferência parada com sucesso", {
        agentId: agentId,
        state: stopData.State,
      });

      return {
        success: true,
        agentId: agentId,
        state: stopData.State,
        fullResponse: stopData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao parar conferência", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição para parar conferência",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "stop_conference_error",
        details: error,
      };
    }
  }

  /**
   * Discagem manual
   * @param {number} agentId - ID do agente
   * @param {string} phoneNumber - Número de telefone para discar
   * @param {string|null} ddd - Código DDD (opcional)
   * @param {number|null} campaignId - ID da campanha (opcional)
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de discagem manual
   */
  async sendManualCallRequest(
    agentId,
    phoneNumber,
    ddd = null,
    campaignId = null,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!phoneNumber || typeof phoneNumber !== "string") {
        throw new Error("PhoneNumber é obrigatório e deve ser uma string");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
        PhoneNumber: phoneNumber,
      };

      // Adicionar parâmetros opcionais se fornecidos
      if (ddd) {
        payload.Ddd = ddd;
      }

      if (campaignId) {
        payload.CampaignId = campaignId;
      }

      this.log("Enviando requisição de discagem manual...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/SendManualCallRequest`,
        agentId: agentId,
        phoneNumber: phoneNumber,
        ddd: ddd,
        campaignId: campaignId,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/SendManualCallRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de discagem manual recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const manualCallData = await response.json();

      this.log("Discagem manual realizada com sucesso", {
        agentId: agentId,
        phoneNumber: phoneNumber,
        ddd: ddd,
        campaignId: campaignId,
        state: manualCallData.State,
      });

      return {
        success: true,
        agentId: agentId,
        phoneNumber: phoneNumber,
        ddd: ddd,
        campaignId: campaignId,
        state: manualCallData.State,
        fullResponse: manualCallData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao realizar discagem manual", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de discagem manual",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "manual_call_error",
        details: error,
      };
    }
  }

  /**
   * Chamada preview
   * @param {number} agentId - ID do agente
   * @param {string} phoneNumber - Número de telefone para discar
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de chamada preview
   */
  async sendPreviewCallRequest(agentId, phoneNumber, customToken = null) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!phoneNumber || typeof phoneNumber !== "string") {
        throw new Error("PhoneNumber é obrigatório e deve ser uma string");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
        PhoneNumber: phoneNumber,
      };

      this.log("Enviando requisição de chamada preview...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/SendPreviewCallRequest`,
        agentId: agentId,
        phoneNumber: phoneNumber,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/SendPreviewCallRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de chamada preview recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const previewData = await response.json();

      this.log("Chamada preview realizada com sucesso", {
        agentId: agentId,
        phoneNumber: phoneNumber,
        state: previewData.State,
      });

      return {
        success: true,
        agentId: agentId,
        phoneNumber: phoneNumber,
        state: previewData.State,
        fullResponse: previewData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao realizar chamada preview", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de chamada preview",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "preview_call_error",
        details: error,
      };
    }
  }

  /**
   * Disposição callback com código
   * @param {number} agentId - ID do agente
   * @param {number} callId - ID da chamada
   * @param {string} dispositionCode - Código da disposição
   * @param {string} phoneNumber - Número de telefone para callback
   * @param {string|null} year - Ano do agendamento (opcional)
   * @param {string|null} month - Mês do agendamento (opcional)
   * @param {string|null} day - Dia do agendamento (opcional)
   * @param {string|null} hour - Hora do agendamento (opcional)
   * @param {string|null} minute - Minuto do agendamento (opcional)
   * @param {boolean} specificAgent - Se deve ser agente específico (padrão: false)
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de disposição callback
   */
  async dispositionCallBackByCode(
    agentId,
    callId,
    dispositionCode,
    phoneNumber,
    year = null,
    month = null,
    day = null,
    hour = null,
    minute = null,
    specificAgent = false,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!callId || typeof callId !== "number") {
        throw new Error("CallId é obrigatório e deve ser um número");
      }

      if (!dispositionCode || typeof dispositionCode !== "string") {
        throw new Error("DispositionCode é obrigatório e deve ser uma string");
      }

      if (!phoneNumber || typeof phoneNumber !== "string") {
        throw new Error("PhoneNumber é obrigatório e deve ser uma string");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
        CallId: callId,
        DispositionCode: dispositionCode,
        PhoneNumber: phoneNumber,
        SpecificAgent: specificAgent,
      };

      // Adicionar parâmetros de agendamento se fornecidos
      if (year) payload.Year = year;
      if (month) payload.Month = month;
      if (day) payload.Day = day;
      if (hour) payload.Hour = hour;
      if (minute) payload.Minute = minute;

      this.log("Enviando requisição de disposição callback com código...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/DispositionCallBackByCode`,
        agentId: agentId,
        callId: callId,
        dispositionCode: dispositionCode,
        phoneNumber: phoneNumber,
        scheduling: { year, month, day, hour, minute },
        specificAgent: specificAgent,
        payload: payload,
      });

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/DispositionCallBackByCode`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de disposição callback com código recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const dispositionData = await response.json();

      this.log("Disposição callback com código realizada com sucesso", {
        agentId: agentId,
        callId: callId,
        dispositionCode: dispositionCode,
        phoneNumber: phoneNumber,
        scheduling: { year, month, day, hour, minute },
        specificAgent: specificAgent,
        state: dispositionData.State,
      });

      return {
        success: true,
        agentId: agentId,
        callId: callId,
        dispositionCode: dispositionCode,
        phoneNumber: phoneNumber,
        scheduling: {
          year: year,
          month: month,
          day: day,
          hour: hour,
          minute: minute,
        },
        specificAgent: specificAgent,
        state: dispositionData.State,
        fullResponse: dispositionData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao realizar disposição callback com código", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de disposição callback com código",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "disposition_callback_code_error",
        details: error,
      };
    }
  }

  /**
   * Desligar e disposição callback com código
   * @param {number} agentId - ID do agente
   * @param {number} callId - ID da chamada
   * @param {string} dispositionCode - Código da disposição
   * @param {string} phoneNumber - Número de telefone para callback
   * @param {string|null} year - Ano do agendamento (opcional)
   * @param {string|null} month - Mês do agendamento (opcional)
   * @param {string|null} day - Dia do agendamento (opcional)
   * @param {string|null} hour - Hora do agendamento (opcional)
   * @param {string|null} minute - Minuto do agendamento (opcional)
   * @param {boolean} specificAgent - Se deve ser agente específico (padrão: false)
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de hangup e disposição callback
   */
  async hangupAndDispositionCallBackByCode(
    agentId,
    callId,
    dispositionCode,
    phoneNumber,
    year = null,
    month = null,
    day = null,
    hour = null,
    minute = null,
    specificAgent = false,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!callId || typeof callId !== "number") {
        throw new Error("CallId é obrigatório e deve ser um número");
      }

      if (!dispositionCode || typeof dispositionCode !== "string") {
        throw new Error("DispositionCode é obrigatório e deve ser uma string");
      }

      if (!phoneNumber || typeof phoneNumber !== "string") {
        throw new Error("PhoneNumber é obrigatório e deve ser uma string");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
        CallId: callId,
        DispositionCode: dispositionCode,
        PhoneNumber: phoneNumber,
        SpecificAgent: specificAgent,
      };

      // Adicionar parâmetros de agendamento se fornecidos
      if (year) payload.Year = year;
      if (month) payload.Month = month;
      if (day) payload.Day = day;
      if (hour) payload.Hour = hour;
      if (minute) payload.Minute = minute;

      this.log(
        "Enviando requisição de hangup e disposição callback com código...",
        {
          url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/HangupAndDispositionCallBackByCode`,
          agentId: agentId,
          callId: callId,
          dispositionCode: dispositionCode,
          phoneNumber: phoneNumber,
          scheduling: { year, month, day, hour, minute },
          specificAgent: specificAgent,
          payload: payload,
        }
      );

      // Fazer a requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/HangupAndDispositionCallBackByCode`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de hangup e disposição callback com código recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const hangupDispositionData = await response.json();

      this.log(
        "Hangup e disposição callback com código realizada com sucesso",
        {
          agentId: agentId,
          callId: callId,
          dispositionCode: dispositionCode,
          phoneNumber: phoneNumber,
          scheduling: { year, month, day, hour, minute },
          specificAgent: specificAgent,
          state: hangupDispositionData.State,
        }
      );

      return {
        success: true,
        agentId: agentId,
        callId: callId,
        dispositionCode: dispositionCode,
        phoneNumber: phoneNumber,
        scheduling: {
          year: year,
          month: month,
          day: day,
          hour: hour,
          minute: minute,
        },
        specificAgent: specificAgent,
        state: hangupDispositionData.State,
        fullResponse: hangupDispositionData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError(
        "Erro ao realizar hangup e disposição callback com código",
        error
      );

      if (error.name === "AbortError") {
        return {
          success: false,
          error:
            "Timeout na requisição de hangup e disposição callback com código",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "hangup_disposition_callback_code_error",
        details: error,
      };
    }
  }

  /**
   * Atualizar dados da chamada
   * @param {number} agentId - ID do agente
   * @param {number} callId - ID da chamada
   * @param {string} campaignData - Dados da campanha
   * @param {string|null} customerId - ID do cliente (opcional)
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de atualização de dados da chamada
   */
  async updateCallData(
    agentId,
    callId,
    campaignData,
    customerId = null,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!callId || typeof callId !== "number") {
        throw new Error("CallId é obrigatório e deve ser um número");
      }

      if (!campaignData || typeof campaignData !== "string") {
        throw new Error("CampaignData é obrigatório e deve ser uma string");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
        CallId: callId,
        CampaignData: campaignData,
      };

      // Adicionar parâmetro opcional se fornecido
      if (customerId) {
        payload.CustomerId = customerId;
      }

      this.log("Enviando requisição de atualização de dados da chamada...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/UpdateCallData`,
        agentId: agentId,
        callId: callId,
        campaignData: campaignData,
        customerId: customerId,
        payload: payload,
      });

      // Fazer a requisição com timeout (PUT method)
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/UpdateCallData`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de atualização de dados da chamada recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const updateData = await response.json();

      this.log("Dados da chamada atualizados com sucesso", {
        agentId: agentId,
        callId: callId,
        campaignData: campaignData,
        customerId: customerId,
        state: updateData.State,
      });

      return {
        success: true,
        agentId: agentId,
        callId: callId,
        campaignData: campaignData,
        customerId: customerId,
        state: updateData.State,
        fullResponse: updateData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao atualizar dados da chamada", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de atualização de dados da chamada",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "update_call_data_error",
        details: error,
      };
    }
  }

  /**
   * Atualizar dados de mailing
   * @param {number} agentId - ID do agente
   * @param {number} campaignId - ID da campanha
   * @param {string} mailingName - Nome do mailing
   * @param {string} mailingData - Dados do mailing
   * @param {string|null} customerId - ID do cliente (opcional)
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Estado da operação de atualização de dados do mailing
   */
  async updateMailingData(
    agentId,
    campaignId,
    mailingName,
    mailingData,
    customerId = null,
    customToken = null
  ) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!campaignId || typeof campaignId !== "number") {
        throw new Error("CampaignId é obrigatório e deve ser um número");
      }

      if (!mailingName || typeof mailingName !== "string") {
        throw new Error("MailingName é obrigatório e deve ser uma string");
      }

      if (!mailingData || typeof mailingData !== "string") {
        throw new Error("MailingData é obrigatório e deve ser uma string");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload
      const payload = {
        AgentId: agentId,
        CampaignId: campaignId,
        MailingName: mailingName,
        MailingData: mailingData,
      };

      // Adicionar parâmetro opcional se fornecido
      if (customerId) {
        payload.CustomerId = customerId;
      }

      this.log("Enviando requisição de atualização de dados do mailing...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/UpdateMailingData`,
        agentId: agentId,
        campaignId: campaignId,
        mailingName: mailingName,
        mailingData: mailingData,
        customerId: customerId,
        payload: payload,
      });

      // Fazer a requisição com timeout (POST method)
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/UpdateMailingData`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de atualização de dados do mailing recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const updateMailingData = await response.json();

      this.log("Dados do mailing atualizados com sucesso", {
        agentId: agentId,
        campaignId: campaignId,
        mailingName: mailingName,
        mailingData: mailingData,
        customerId: customerId,
        state: updateMailingData.State,
      });

      return {
        success: true,
        agentId: agentId,
        campaignId: campaignId,
        mailingName: mailingName,
        mailingData: mailingData,
        customerId: customerId,
        state: updateMailingData.State,
        fullResponse: updateMailingData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao atualizar dados do mailing", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de atualização de dados do mailing",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "update_mailing_data_error",
        details: error,
      };
    }
  }

  /**
   * Obter todos os próximos eventos
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de eventos do agente
   */
  async getAllNextEvents(customToken = null) {
    try {
      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      this.log("Enviando requisição para obter todos os próximos eventos...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentEvent/GetAllNextEvents`,
      });

      // Fazer a requisição com timeout (GET method)
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentEvent/GetAllNextEvents`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de eventos recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const eventsData = await response.json();

      this.log("Eventos obtidos com sucesso", {
        eventsCount: eventsData ? eventsData.length : 0,
        hasEvents: eventsData && eventsData.length > 0,
      });

      // Processar eventos e mapear tipos se disponível
      const processedEvents = eventsData
        ? eventsData.map((event) => {
            const processedEvent = { ...event };

            // Adicionar nome do tipo de evento se tivermos mapeamento
            if (
              typeof event.AgentEventType === "number" &&
              this.eventTypeNames
            ) {
              processedEvent.EventTypeName =
                this.eventTypeNames[event.AgentEventType] ||
                `Evento Desconhecido ${event.AgentEventType}`;
            }

            return processedEvent;
          })
        : [];

      return {
        success: true,
        events: processedEvents,
        eventsCount: processedEvents.length,
        hasEvents: processedEvents.length > 0,
        fullResponse: eventsData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao obter próximos eventos", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de próximos eventos",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "get_all_next_events_error",
        details: error,
      };
    }
  }

  /**
   * Obter todos os próximos eventos com AgentId
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de eventos com informações de agente
   */
  async getAllNextEventsWithAgentId(customToken = null) {
    try {
      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      this.log("Enviando requisição para obter eventos com AgentId...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentEvent/GetAllNextEventsWithAgentId`,
      });

      // Fazer a requisição com timeout (GET method)
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentEvent/GetAllNextEventsWithAgentId`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      this.log(
        `Resposta da requisição de eventos com AgentId recebida - Status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const eventsData = await response.json();

      this.log("Eventos com AgentId obtidos com sucesso", {
        eventsCount: eventsData ? eventsData.length : 0,
        hasEvents: eventsData && eventsData.length > 0,
      });

      // Processar eventos e mapear tipos se disponível
      const processedEvents = eventsData
        ? eventsData.map((event) => {
            const processedEvent = { ...event };

            // Adicionar nome do tipo de evento se tivermos mapeamento
            if (
              typeof event.AgentEventType === "number" &&
              this.eventTypeNames
            ) {
              processedEvent.EventTypeName =
                this.eventTypeNames[event.AgentEventType] ||
                `Evento Desconhecido ${event.AgentEventType}`;
            }

            return processedEvent;
          })
        : [];

      // Agrupar eventos por AgentId para facilitar análise
      const eventsByAgent = processedEvents.reduce((acc, event) => {
        const agentId = event.AgentId;
        if (agentId) {
          if (!acc[agentId]) {
            acc[agentId] = [];
          }
          acc[agentId].push(event);
        }
        return acc;
      }, {});

      return {
        success: true,
        events: processedEvents,
        eventsByAgent: eventsByAgent,
        agentIds: Object.keys(eventsByAgent).map((id) => parseInt(id)),
        eventsCount: processedEvents.length,
        hasEvents: processedEvents.length > 0,
        fullResponse: eventsData,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao obter eventos com AgentId", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição de eventos com AgentId",
          errorType: "timeout",
          details: error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "get_all_next_events_with_agent_id_error",
        details: error,
      };
    }
  }

  /**
   * Listar chamadas ativas
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de chamadas ativas
   */
  async listActiveCalls(agentId, customToken = null) {
    try {
      // Validar parâmetros obrigatórios
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Obter token válido
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      // Preparar payload (POST method com DSAgentControl)
      const payload = {
        AgentId: agentId,
      };

      this.log("Enviando requisição para listar chamadas ativas...", {
        url: `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ListActiveCalls`,
        agentId: agentId,
      });

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ListActiveCalls`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      return {
        success: true,
        agentId: agentId,
        data: data,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao listar chamadas ativas", error);
      return {
        success: false,
        error: error.message,
        errorType: "list_active_calls_error",
        details: error,
      };
    }
  }

  /**
   * Listar chamadas
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de chamadas
   */
  async listCalls(agentId, customToken = null) {
    try {
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      const payload = { AgentId: agentId };

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ListCalls`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      return {
        success: true,
        agentId: agentId,
        data: data,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao listar chamadas", error);
      return {
        success: false,
        error: error.message,
        errorType: "list_calls_error",
        details: error,
      };
    }
  }

  /**
   * Listar agentes online disponíveis
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de agentes online disponíveis
   */
  async listAvailableOnlineAgents(agentId, customToken = null) {
    try {
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ListAvailableOnlineAgents?agentId=${agentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "olos-integration/1.0",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const agents = await response.json();

      return {
        success: true,
        agentId: agentId,
        agents: agents,
        agentsCount: agents ? agents.length : 0,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao listar agentes online disponíveis", error);
      return {
        success: false,
        error: error.message,
        errorType: "list_available_online_agents_error",
        details: error,
      };
    }
  }

  /**
   * Listar agentes online
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de agentes online
   */
  async listOnlineAgents(agentId, customToken = null) {
    try {
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      const payload = { AgentId: agentId };

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ListOnlineAgents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "olos-integration/1.0",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      return {
        success: true,
        agentId: agentId,
        data: data,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao listar agentes online", error);
      return {
        success: false,
        error: error.message,
        errorType: "list_online_agents_error",
        details: error,
      };
    }
  }

  /**
   * Listar agentes online na campanha
   * @param {number} campaignId - ID da campanha
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de agentes online na campanha
   */
  async listOnlineAgentsInCampaign(campaignId, customToken = null) {
    try {
      if (!campaignId || typeof campaignId !== "number") {
        throw new Error("CampaignId é obrigatório e deve ser um número");
      }

      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ListOnlineAgentsInCampaign?CampaignId=${campaignId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "olos-integration/1.0",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const agents = await response.json();

      return {
        success: true,
        campaignId: campaignId,
        agents: agents,
        agentsCount: agents ? agents.length : 0,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao listar agentes online na campanha", error);
      return {
        success: false,
        error: error.message,
        errorType: "list_online_agents_in_campaign_error",
        details: error,
      };
    }
  }

  /**
   * Listar agentes online com campanhas
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de agentes online com campanhas
   */
  async listAgentsOnlineWithCampaigns(agentId, customToken = null) {
    try {
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ListAgentsOnlineWithCampaigns?agentId=${agentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "olos-integration/1.0",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const agents = await response.json();

      return {
        success: true,
        agentId: agentId,
        agents: agents,
        agentsCount: agents ? agents.length : 0,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao listar agentes online com campanhas", error);
      return {
        success: false,
        error: error.message,
        errorType: "list_agents_online_with_campaigns_error",
        details: error,
      };
    }
  }

  /**
   * Listar campanhas e organizações
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de campanhas e organizações
   */
  async listCampaignCompany(customToken = null) {
    try {
      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ListCampaignCompany`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "olos-integration/1.0",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const companies = await response.json();

      return {
        success: true,
        companies: companies,
        companiesCount: companies ? companies.length : 0,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao listar campanhas e organizações", error);
      return {
        success: false,
        error: error.message,
        errorType: "list_campaign_company_error",
        details: error,
      };
    }
  }

  /**
   * Listar campanhas para consultoria
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de campanhas para consultoria
   */
  async listCampaignsToConsulting(agentId, customToken = null) {
    try {
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ListCampaignsToConsulting?AgentId=${agentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "olos-integration/1.0",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const campaigns = await response.json();

      return {
        success: true,
        agentId: agentId,
        campaigns: campaigns,
        campaignsCount: campaigns ? campaigns.length : 0,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao listar campanhas para consultoria", error);
      return {
        success: false,
        error: error.message,
        errorType: "list_campaigns_to_consulting_error",
        details: error,
      };
    }
  }

  /**
   * Listar disposições
   * @param {number} agentId - ID do agente
   * @param {number} campaignId - ID da campanha
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de disposições
   */
  async listDispositions(agentId, campaignId, customToken = null) {
    try {
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      if (!campaignId || typeof campaignId !== "number") {
        throw new Error("CampaignId é obrigatório e deve ser um número");
      }

      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ListDispositions?AgentId=${agentId}&CampaignId=${campaignId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "olos-integration/1.0",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const dispositions = await response.json();

      return {
        success: true,
        agentId: agentId,
        campaignId: campaignId,
        dispositions: dispositions,
        dispositionsCount: dispositions ? dispositions.length : 0,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao listar disposições", error);
      return {
        success: false,
        error: error.message,
        errorType: "list_dispositions_error",
        details: error,
      };
    }
  }

  /**
   * Listar motivos de pausa
   * @param {number} agentId - ID do agente
   * @param {string|null} customToken - Token personalizado (opcional)
   * @returns {Promise<Object>} - Lista de motivos de pausa
   */
  async listReasons(agentId, customToken = null) {
    try {
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      const token = customToken || (await this.getValidToken());
      if (!token) {
        throw new Error("Token de autenticação não disponível");
      }

      const response = await fetch(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentCommand/ListReasons?AgentId=${agentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "olos-integration/1.0",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const reasons = await response.json();

      return {
        success: true,
        agentId: agentId,
        reasons: reasons,
        reasonsCount: reasons ? reasons.length : 0,
        requestedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao listar motivos de pausa", error);
      return {
        success: false,
        error: error.message,
        errorType: "list_reasons_error",
        details: error,
      };
    }
  }

  /**
   * Processo completo: obter token e autenticar agente
   * @param {string} login - Login do agente
   * @param {string} password - Senha do agente
   * @param {boolean} forceLogout - Forçar logout se já autenticado (padrão: true)
   * @param {Object} customCredentials - Credenciais personalizadas para token (opcional)
   * @returns {Promise<Object>} - Resultado completo do processo
   */
  async authenticateAgentComplete(
    login,
    password,
    forceLogout = true,
    customCredentials = {}
  ) {
    try {
      this.log("Iniciando processo completo de autenticação...", {
        login: login,
        forceLogout: forceLogout,
      });

      // Passo 1: Obter token
      const tokenResult = await this.getValidToken(customCredentials);
      if (!tokenResult.success) {
        return {
          success: false,
          error: `Falha ao obter token: ${tokenResult.error}`,
          errorType: "token_error",
          step: "token",
        };
      }

      this.log("Token obtido, prosseguindo com autenticação do agente...");

      // Passo 2: Autenticar agente
      const authResult = await this.authenticateAgent(
        login,
        password,
        forceLogout,
        tokenResult.token
      );

      if (!authResult.success) {
        return {
          success: false,
          error: `Falha na autenticação do agente: ${authResult.error}`,
          errorType: "agent_auth_error",
          step: "agent_authentication",
          tokenInfo: {
            success: tokenResult.success,
            fromCache: tokenResult.fromCache,
          },
        };
      }

      this.log("Processo completo concluído com sucesso!");

      return {
        success: true,
        token: tokenResult.token,
        tokenFromCache: tokenResult.fromCache,
        agentId: authResult.agentId,
        agentLogin: authResult.login,
        completedAt: new Date().toISOString(),
        steps: {
          token: tokenResult,
          agentAuth: authResult,
        },
      };
    } catch (error) {
      this.logError("Erro no processo completo de autenticação", error);

      return {
        success: false,
        error: error.message,
        errorType: "complete_process_error",
        details: error,
      };
    }
  }

  /**
   * Obter próximo evento do agente
   * @param {number} agentId - ID do agente
   * @param {string} customToken - Token personalizado (opcional, usa o atual se não informado)
   * @returns {Promise<Object>} - Próximo evento do agente
   */
  async getNextEvent(agentId, customToken = null) {
    try {
      this.log(`Obtendo próximo evento para o agente ${agentId}...`);

      // Determinar qual token usar
      let token = customToken || this.currentToken;

      if (!token) {
        this.log("Token não encontrado, obtendo novo token...");
        const tokenResult = await this.getValidToken();
        if (!tokenResult.success) {
          throw new Error(tokenResult.error || "Falha ao obter token");
        }
        token = tokenResult.token;
      }

      // Verificar se agentId foi fornecido
      if (!agentId) {
        throw new Error("AgentId é obrigatório");
      }

      // Construir URL com parâmetros
      const url = new URL(
        `${this.config.baseUrl}/WebAPIAgentControl/AgentEvent/GetNextEvent`
      );
      url.searchParams.append("AgentId", agentId);

      this.log("Enviando requisição para obter próximo evento...", {
        url: url.toString(),
        agentId: agentId,
      });

      // Fazer a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      this.log(`Resposta recebida - Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const eventData = await response.json();

      // Disparar callbacks se o evento tem dados válidos
      if (eventData && eventData.agentEventType !== undefined) {
        this._triggerEventCallbacks(eventData);
      }

      // Formatar o evento com informações adicionais usando agentEventType
      const formattedEvent = eventData.agentEventType
        ? this.formatEventByType(
            eventData.agentEventType,
            eventData.eventObject
          )
        : null;

      this.log("Próximo evento obtido com sucesso", {
        eventType: eventData.agentEventType,
        hasEvent: !!eventData.eventObject,
        eventTypeName: formattedEvent ? formattedEvent.eventTypeName : "None",
        callbacksTriggered: eventData.agentEventType !== undefined,
      });

      return {
        success: true,
        event: eventData,
        formattedEvent: formattedEvent, // Evento formatado com nomes amigáveis
        agentId: agentId,
        eventType: eventData.agentEventType,
        eventObject: eventData.eventObject,
        receivedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError("Erro ao obter próximo evento", error);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na requisição",
          errorType: "timeout",
        };
      }

      return {
        success: false,
        error: error.message,
        errorType: "request_failed",
      };
    }
  }

  /**
   * Iniciar polling contínuo de eventos com callbacks automáticos
   * @param {number} agentId - ID do agente
   * @param {number} intervalMs - Intervalo em milissegundos para polling (padrão: 2000ms)
   * @param {Object} options - Opções adicionais
   * @returns {Object} - Objeto com controles do polling
   */
  startEventPolling(agentId, intervalMs = 2000, options = {}) {
    try {
      if (!agentId || typeof agentId !== "number") {
        throw new Error("AgentId é obrigatório e deve ser um número");
      }

      // Parar polling existente se houver
      if (this.pollingInterval) {
        this.stopEventPolling();
      }

      let isPolling = true;
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = options.maxErrors || 5;
      const stopOnMaxErrors = options.stopOnMaxErrors !== false; // default true

      this.log(
        `Iniciando polling de eventos para agente ${agentId} (intervalo: ${intervalMs}ms)`
      );

      const pollFunction = async () => {
        if (!isPolling) return;

        try {
          const result = await this.getNextEvent(agentId, options.customToken);

          if (result.success) {
            consecutiveErrors = 0; // Reset error counter on success

            // Callback de sucesso se fornecido
            if (options.onSuccess && typeof options.onSuccess === "function") {
              options.onSuccess(result);
            }
          } else {
            consecutiveErrors++;
            this.logError(
              `Erro no polling de eventos (${consecutiveErrors}/${maxConsecutiveErrors})`,
              result.error
            );

            // Callback de erro se fornecido
            if (options.onError && typeof options.onError === "function") {
              options.onError(result, consecutiveErrors);
            }

            // Parar se atingir máximo de erros consecutivos
            if (stopOnMaxErrors && consecutiveErrors >= maxConsecutiveErrors) {
              this.logError(
                `Máximo de erros consecutivos atingido (${maxConsecutiveErrors}). Parando polling.`
              );
              this.stopEventPolling();

              if (
                options.onMaxErrors &&
                typeof options.onMaxErrors === "function"
              ) {
                options.onMaxErrors(consecutiveErrors);
              }
              return;
            }
          }
        } catch (error) {
          consecutiveErrors++;
          this.logError(
            `Erro fatal no polling de eventos (${consecutiveErrors}/${maxConsecutiveErrors})`,
            error
          );

          if (stopOnMaxErrors && consecutiveErrors >= maxConsecutiveErrors) {
            this.logError(
              `Máximo de erros consecutivos atingido (${maxConsecutiveErrors}). Parando polling.`
            );
            this.stopEventPolling();
            return;
          }
        }

        // Agendar próximo polling se ainda estiver ativo
        if (isPolling) {
          this.pollingInterval = setTimeout(pollFunction, intervalMs);
        }
      };

      // Iniciar primeiro polling
      this.pollingInterval = setTimeout(pollFunction, 100); // Start quickly

      // Retornar controles
      const controls = {
        stop: () => {
          isPolling = false;
          this.stopEventPolling();
        },
        isActive: () => isPolling && this.pollingInterval !== null,
        getStats: () => ({
          agentId: agentId,
          intervalMs: intervalMs,
          isActive: isPolling && this.pollingInterval !== null,
          consecutiveErrors: consecutiveErrors,
          maxConsecutiveErrors: maxConsecutiveErrors,
          registeredCallbacks: this.listEventCallbacks(),
        }),
      };

      this.currentPollingControls = controls;
      return controls;
    } catch (error) {
      this.logError("Erro ao iniciar polling de eventos", error);
      return {
        stop: () => {},
        isActive: () => false,
        getStats: () => ({ error: error.message }),
      };
    }
  }

  /**
   * Parar polling de eventos
   */
  stopEventPolling() {
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
      this.log("Polling de eventos parado");
    }
  }

  /**
   * Limpar token armazenado
   */
  clearToken() {
    this.log("Limpando token armazenado");
    this.currentToken = null;
    this.tokenExpiration = null;
  }

  /**
   * Atualizar configurações
   * @param {Object} newConfig - Novas configurações
   */
  updateConfig(newConfig) {
    this.log("Atualizando configurações", newConfig);
    this.config = {
      ...this.config,
      ...newConfig,
      credentials: {
        ...this.config.credentials,
        ...(newConfig.credentials || {}),
      },
    };
  }

  /**
   * Obter nome do evento pelo ID
   * @param {number} eventTypeId - ID numérico do tipo de evento
   * @returns {string} - Nome do evento ou 'Unknown' se não encontrado
   */
  getEventTypeName(eventTypeId) {
    return (
      this.eventTypes[eventTypeId] || `Evento Desconhecido(${eventTypeId})`
    );
  }

  /**
   * Obter ID do evento pelo nome
   * @param {string} eventTypeName - Nome do tipo de evento
   * @returns {number|null} - ID numérico do evento ou null se não encontrado
   */
  getEventTypeId(eventTypeName) {
    return this.eventTypeNames[eventTypeName] || null;
  }

  /**
   * Verificar se um evento é relacionado ao login
   * @param {number} eventTypeId - ID do tipo de evento
   * @returns {boolean}
   */
  isLoginEvent(eventTypeId) {
    const loginEvents = [1, 3, 9, 10]; // LoginCCM, LoginCampaign, LoginCCMFail, LoginCampaignFail
    return loginEvents.includes(eventTypeId);
  }

  /**
   * Verificar se um evento é relacionado ao logout
   * @param {number} eventTypeId - ID do tipo de evento
   * @returns {boolean}
   */
  isLogoutEvent(eventTypeId) {
    const logoutEvents = [2, 4, 11, 12, 43]; // LogoutCCM, LogoutCampaign, LogoutCCMFail, LogoutCampaignFail, LogoutReason
    return logoutEvents.includes(eventTypeId);
  }

  /**
   * Verificar se um evento é relacionado a chamadas
   * @param {number} eventTypeId - ID do tipo de evento
   * @returns {boolean}
   */
  isCallEvent(eventTypeId) {
    const callEvents = [20, 21, 22, 23, 24, 25, 26, 28, 29, 52, 53, 54, 55];
    // ActiveCall, ManualCallRequestFail, ChangeManualCallState, RedialRequestFail,
    // RedialSuccess, ListActiveCalls, PrivateCallbackFail, ChangePreviewCallState,
    // ChangePreviewCallResult, AgentCallConnected, AgentCallDisconnected,
    // ConnectAgentLoginCallFail, DropAgentLoginCallFail
    return callEvents.includes(eventTypeId);
  }

  /**
   * Verificar se um evento é relacionado a chat
   * @param {number} eventTypeId - ID do tipo de evento
   * @returns {boolean}
   */
  isChatEvent(eventTypeId) {
    const chatEvents = [15, 16, 17]; // NewChat, NewChatMsg, EndChat
    return chatEvents.includes(eventTypeId);
  }

  /**
   * Verificar se um evento é de erro/falha
   * @param {number} eventTypeId - ID do tipo de evento
   * @returns {boolean}
   */
  isErrorEvent(eventTypeId) {
    const errorEvents = [
      7, 8, 9, 10, 11, 12, 19, 21, 23, 26, 32, 33, 38, 40, 45, 54, 55,
    ];
    // Todos os eventos que terminam com "Fail" ou são falhas
    return errorEvents.includes(eventTypeId);
  }

  /**
   * Obter categoria do evento
   * @param {number} eventTypeId - ID do tipo de evento
   * @returns {string} - Categoria do evento
   */
  getEventCategory(eventTypeId) {
    if (this.isLoginEvent(eventTypeId)) return "login";
    if (this.isLogoutEvent(eventTypeId)) return "logout";
    if (this.isCallEvent(eventTypeId)) return "call";
    if (this.isChatEvent(eventTypeId)) return "chat";
    if (this.isErrorEvent(eventTypeId)) return "error";
    if (eventTypeId === 5) return "status"; // ChangeStatus
    if (eventTypeId === 6) return "screenpop"; // ScreenPop
    return "system";
  }

  /**
   * Formatar evento para exibição amigável usando agentEventType
   * @param {string} agentEventType - Nome do tipo do evento da API (ex: "PassCode", "ScreenPop")
   * @param {Object} eventObject - Objeto do evento (opcional)
   * @returns {Object} - Evento formatado com informações adicionais
   */
  formatEventByType(agentEventType, eventObject = null) {
    // O agentEventType já vem como string, então vamos usá-lo diretamente
    const eventTypeName = agentEventType;
    const eventTypeId = this.getEventTypeId(eventTypeName); // Obter ID pelo nome

    return {
      ...(eventObject || {}),
      EventTypeId: eventTypeId, // ID numérico correspondente (pode ser null se não encontrado)
      agentEventType: agentEventType, // Nome original da API
      eventTypeName: eventTypeName, // Nome do evento (mesmo que agentEventType)
      category:
        eventTypeId !== null
          ? this.getEventCategory(eventTypeId)
          : "desconhecido",
      isError: eventTypeId !== null ? this.isErrorEvent(eventTypeId) : false,
      isLogin: eventTypeId !== null ? this.isLoginEvent(eventTypeId) : false,
      isLogout: eventTypeId !== null ? this.isLogoutEvent(eventTypeId) : false,
      isCall: eventTypeId !== null ? this.isCallEvent(eventTypeId) : false,
      isChat: eventTypeId !== null ? this.isChatEvent(eventTypeId) : false,
    };
  }

  /**
   * Formatar evento para exibição amigável
   * @param {Object} event - Objeto do evento da API
   * @returns {Object} - Evento formatado com informações adicionais
   */
  formatEvent(event) {
    if (!event || typeof event.EventTypeId === "undefined") {
      return {
        ...event,
        eventTypeName: "desconhecido",
        category: "desconhecido",
        isError: false,
      };
    }

    const eventTypeId = parseInt(event.EventTypeId);
    return {
      ...event,
      eventTypeName: this.getEventTypeName(eventTypeId),
      category: this.getEventCategory(eventTypeId),
      isError: this.isErrorEvent(eventTypeId),
      isLogin: this.isLoginEvent(eventTypeId),
      isLogout: this.isLogoutEvent(eventTypeId),
      isCall: this.isCallEvent(eventTypeId),
      isChat: this.isChatEvent(eventTypeId),
    };
  }

  /**
   * Listar todos os tipos de evento disponíveis
   * @returns {Array} - Array com todos os tipos de evento
   */
  getAllEventTypes() {
    return Object.entries(this.eventTypes).map(([id, name]) => ({
      id: parseInt(id),
      name: name,
      category: this.getEventCategory(parseInt(id)),
    }));
  }

  /**
   * Obter informações sobre o token atual
   * @returns {Object}
   */
  getTokenInfo() {
    return {
      hasToken: !!this.currentToken,
      isValid: this.isTokenValid(),
      expiration: this.tokenExpiration,
      token: this.currentToken
        ? `${this.currentToken.substring(0, 20)}...`
        : null,
    };
  }
}

// Criar instância global padrão
window.OlosIntegration = OlosIntegration;

// Para compatibilidade, também criar uma instância padrão
window.olosApi = new OlosIntegration();

// Exportar para uso como módulo se necessário
if (typeof module !== "undefined" && module.exports) {
  module.exports = OlosIntegration;
}
