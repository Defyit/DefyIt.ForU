document.addEventListener("DOMContentLoaded", function () {
  var btnOlosConectar = document.getElementById("btnOlosConectar"); // Conectar Olos
  var btnOlosChamadaManual = document.getElementById("btnOlosChamadaManual"); // Chamada Manual
  var btnOlosPausar = document.getElementById("btnOlosPausar"); // Pausar
  var statusBadge = document.getElementById("statusBadge");

  // ========================================
  // CONFIGURAÇÃO DA INTEGRAÇÃO OLOS
  // ========================================

  // Configurações da API
  const API_CONFIG = {
    baseUrl: "https://179.190.9.244:4333",
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

  // Instanciar integração Olos
  let olosClient = null;
  let currentAgentId = null;
  let eventPolling = null;

  // Inicializar cliente Olos
  function initializeOlosClient() {
    if (!olosClient) {
      olosClient = new OlosIntegration({
        baseUrl: API_CONFIG.baseUrl,
        credentials: API_CONFIG.credentials,
        debug: true,
      });

      // Registrar callback global para todos os eventos
      olosClient.registerGlobalEventCallback(function (eventData) {
        console.log("📢 [OLOS EVENT]", {
          type: eventData.eventTypeName,
          id: eventData.eventType,
          timestamp: eventData.timestamp,
          data: eventData,
        });

        // TODO: Processar eventos específicos aqui
        // Ex: ScreenPop, PassCode, ActiveCall, etc.
      });

      console.log("✅ Cliente Olos inicializado com sucesso");
    }
    return olosClient;
  }

  // Função para conectar ao Olos
  async function connectToOlos() {
    try {
      console.log("🔄 Iniciando conexão com Olos...");

      // Inicializar cliente
      const client = initializeOlosClient();

      // Autenticar agente
      console.log("🔐 Autenticando agente:", API_CONFIG.agentCredentials.login);
      const authResult = await client.authenticateAgent(
        API_CONFIG.agentCredentials.login,
        API_CONFIG.agentCredentials.password,
        API_CONFIG.agentCredentials.forceLogout
      );

      if (!authResult.success) {
        throw new Error(authResult.error || "Falha na autenticação");
      }

      currentAgentId = authResult.agentId;
      console.log(
        "✅ Agente autenticado com sucesso! AgentId:",
        currentAgentId
      );

      // Salvar agentId no sessionStorage
      const state = JSON.parse(
        sessionStorage.getItem("olosAgentState") || "{}"
      );
      state.agentId = currentAgentId;
      state.agentLogin = API_CONFIG.agentCredentials.login;
      sessionStorage.setItem("olosAgentState", JSON.stringify(state));

      // Iniciar polling de eventos
      console.log("🔄 Iniciando polling de eventos...");
      eventPolling = client.startEventPolling(currentAgentId, 2000);

      return {
        success: true,
        agentId: currentAgentId,
        message: "Conectado com sucesso ao Olos",
      };
    } catch (error) {
      console.error("❌ Erro ao conectar ao Olos:", error);
      throw error;
    }
  }

  // Função para desconectar do Olos
  async function disconnectFromOlos() {
    try {
      console.log("🔄 Iniciando desconexão do Olos...");

      if (eventPolling) {
        console.log("⏹️ Parando polling de eventos...");
        olosClient.stopEventPolling();
        eventPolling = null;
      }

      if (currentAgentId && olosClient) {
        console.log("👋 Fazendo logout do agente:", currentAgentId);
        const logoutResult = await olosClient.agentLogout(currentAgentId);

        if (logoutResult.success) {
          console.log("✅ Logout realizado com sucesso");
        } else {
          console.warn("⚠️ Falha no logout:", logoutResult.error);
        }
      }

      currentAgentId = null;

      return {
        success: true,
        message: "Desconectado do Olos",
      };
    } catch (error) {
      console.error("❌ Erro ao desconectar do Olos:", error);
      throw error;
    }
  }

  // ========================================
  // PERSISTÊNCIA DO ESTADO COM SESSION STORAGE
  // ========================================

  const STORAGE_KEY = "olosAgentState";

  // Função para salvar o estado
  function saveAgentState() {
    const state = {
      isConnected: btnOlosConectar.checked,
      isPaused: btnOlosPausar.checked,
      isManualCall: btnOlosChamadaManual.checked,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log("Estado salvo:", state);
  }

  // Função para carregar o estado
  function loadAgentState() {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        console.log("Estado carregado:", state);

        // Restaurar estado dos checkboxes
        btnOlosConectar.checked = state.isConnected || false;
        btnOlosPausar.checked = state.isPaused || false;
        btnOlosChamadaManual.checked = state.isManualCall || false;

        // Restaurar estado dos botões disabled
        btnOlosPausar.disabled = !state.isConnected;
        btnOlosChamadaManual.disabled = !state.isPaused;

        return state;
      }
    } catch (error) {
      console.error("Erro ao carregar estado:", error);
    }
    return null;
  }

  // Função para limpar o estado
  function clearAgentState() {
    sessionStorage.removeItem(STORAGE_KEY);
    console.log("Estado limpo");
  }

  // Carregar estado salvo ao iniciar
  const savedState = loadAgentState();

  // ========================================
  // CONTROLE DO TIMER DE STATUS
  // ========================================

  let timerInterval = null;
  let timerSeconds = 0;
  const statusTimeElement = document.getElementById("statusTime");

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function startTimer() {
    if (timerInterval) return; // Já está rodando

    console.log("⏱️ Timer iniciado");
    timerInterval = setInterval(() => {
      timerSeconds++;
      statusTimeElement.textContent = formatTime(timerSeconds);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      console.log("⏹️ Timer parado");
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resetTimer() {
    console.log("🔄 Timer resetado");
    stopTimer();
    timerSeconds = 0;
    statusTimeElement.textContent = "00:00:00";
  }

  function shouldTimerRun() {
    // Timer roda apenas quando:
    // - Está conectado E (em pausa OU aguardando chamada OU em chamada manual)
    // Timer NÃO roda quando desconectado

    const isConnected = btnOlosConectar && btnOlosConectar.checked;

    if (!isConnected) {
      console.log("⏱️ Timer NÃO deve rodar - Desconectado");
      return false;
    }

    console.log("⏱️ Timer deve rodar - Conectado");
    return true;
  }

  function updateTimer() {
    if (shouldTimerRun()) {
      startTimer();
    } else {
      resetTimer();
    }
  }

  // Garantir que o timer inicia resetado
  resetTimer();

  function updateStatusBadge() {
    if (btnOlosConectar.checked) {
      if (btnOlosPausar.checked) {
        if (btnOlosChamadaManual.checked) {
          statusBadge.textContent = "Em Chamada Manual";
          statusBadge.className = "badge text-bg-info px-3 py-2";
        } else {
          statusBadge.textContent = "Em Pausa";
          statusBadge.className = "badge text-bg-warning px-3 py-2";
        }
      } else if (btnOlosChamadaManual.checked) {
        statusBadge.textContent = "Em Chamada Manual";
        statusBadge.className = "badge text-bg-info px-3 py-2";
      } else {
        statusBadge.textContent = "Aguardando Chamada";
        statusBadge.className = "badge text-bg-primary px-3 py-2";
      }
    } else {
      statusBadge.textContent = "Desconectado";
      statusBadge.className = "badge text-bg-danger px-3 py-2";
    }

    // Atualizar timer baseado no estado
    updateTimer();
  }

  btnOlosConectar.addEventListener("change", function (e) {
    const isConnecting = this.checked;

    if (isConnecting) {
      // Prevenir a mudança imediata
      this.checked = false;

      // Mostrar confirmação
      Swal.fire({
        title: "Conectar ao Olos?",
        text: "Deseja realmente conectar ao sistema Olos?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#2AD03D",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, conectar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // Usuário confirmou - conectar
          // Mostrar loading
          Swal.fire({
            title: "Conectando...",
            text: "Autenticando agente no Olos",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Conectar ao Olos
          connectToOlos()
            .then((result) => {
              btnOlosConectar.checked = true;
              btnOlosPausar.disabled = false;
              updateStatusBadge();
              saveAgentState();

              Swal.fire({
                title: "Conectado!",
                html: `<p>Conexão com Olos estabelecida com sucesso.</p><small>AgentId: ${result.agentId}</small>`,
                icon: "success",
                timer: 3000,
                showConfirmButton: false,
                allowOutsideClick: false,
              });
            })
            .catch((error) => {
              Swal.fire({
                title: "Erro na Conexão",
                text: error.message || "Não foi possível conectar ao Olos",
                icon: "error",
                confirmButtonColor: "#dc3545",
                allowOutsideClick: false,
              });
            });
        }
      });
    } else {
      // Desconectando - pedir confirmação
      this.checked = true; // Manter marcado temporariamente

      Swal.fire({
        title: "Desconectar do Olos?",
        text: "Tem certeza que deseja desconectar do sistema Olos?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, desconectar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // Usuário confirmou - desconectar
          // Mostrar loading
          Swal.fire({
            title: "Desconectando...",
            text: "Encerrando sessão no Olos",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Desconectar do Olos
          disconnectFromOlos()
            .then((result) => {
              btnOlosConectar.checked = false;
              btnOlosPausar.disabled = true;
              btnOlosPausar.checked = false;
              btnOlosChamadaManual.disabled = true;
              btnOlosChamadaManual.checked = false;
              updateStatusBadge();
              clearAgentState();

              Swal.fire({
                title: "Desconectado",
                text: "Você foi desconectado do Olos.",
                icon: "info",
                timer: 2000,
                showConfirmButton: false,
                allowOutsideClick: false,
              });
            })
            .catch((error) => {
              console.error("Erro ao desconectar:", error);
              // Mesmo com erro, desconectar localmente
              btnOlosConectar.checked = false;
              btnOlosPausar.disabled = true;
              btnOlosPausar.checked = false;
              btnOlosChamadaManual.disabled = true;
              btnOlosChamadaManual.checked = false;
              updateStatusBadge();
              clearAgentState();

              Swal.fire({
                title: "Desconectado",
                text: "Sessão encerrada localmente.",
                icon: "info",
                timer: 2000,
                showConfirmButton: false,
                allowOutsideClick: false,
              });
            });
        }
        // Se cancelar, mantém conectado (checked = true já foi definido)
      });
    }
  });

  btnOlosPausar.addEventListener("change", function (e) {
    const isPausing = this.checked;

    if (isPausing) {
      // Prevenir a mudança imediata
      this.checked = false;

      // Mostrar confirmação
      Swal.fire({
        title: "Pausar atendimento?",
        text: "Você não receberá novas chamadas enquanto estiver em pausa.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2AD03D",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, pausar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // Usuário confirmou - pausar
          btnOlosPausar.checked = true;
          btnOlosChamadaManual.disabled = false;
          updateStatusBadge();
          saveAgentState(); // 💾 Salvar estado

          Swal.fire({
            title: "Em Pausa",
            text: "Você está em pausa e não receberá chamadas.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false,
            allowOutsideClick: false,
          });
        }
      });
    } else {
      // Sair da pausa - pedir confirmação
      this.checked = true; // Manter marcado temporariamente

      Swal.fire({
        title: "Sair da pausa?",
        text: "Deseja voltar a receber chamadas?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, sair da pausa",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // Usuário confirmou - sair da pausa
          btnOlosPausar.checked = false;
          btnOlosChamadaManual.disabled = true;
          btnOlosChamadaManual.checked = false;
          updateStatusBadge();
          saveAgentState(); // 💾 Salvar estado

          Swal.fire({
            title: "Pausa Encerrada",
            text: "Você voltará a receber chamadas.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            allowOutsideClick: false,
          });
        }
        // Se cancelar, mantém em pausa (checked = true já foi definido)
      });
    }
  });

  btnOlosChamadaManual.addEventListener("change", function (e) {
    const isStartingManualCall = this.checked;

    if (isStartingManualCall) {
      // Prevenir a mudança imediata
      this.checked = false;

      // Mostrar confirmação
      Swal.fire({
        title: "Iniciar chamada manual?",
        text: "Deseja iniciar uma chamada manual?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#2AD03D",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, iniciar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // Usuário confirmou - iniciar chamada manual
          btnOlosChamadaManual.checked = true;
          updateStatusBadge();
          saveAgentState(); // 💾 Salvar estado

          Swal.fire({
            title: "Chamada Manual Iniciada",
            text: "Digite o número para realizar a chamada.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            allowOutsideClick: false,
          });
        }
      });
    } else {
      // Finalizar chamada manual - pedir confirmação
      this.checked = true; // Manter marcado temporariamente

      Swal.fire({
        title: "Finalizar chamada manual?",
        text: "Deseja realmente finalizar a chamada manual?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, finalizar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // Usuário confirmou - finalizar chamada manual
          btnOlosChamadaManual.checked = false;
          updateStatusBadge();
          saveAgentState(); // 💾 Salvar estado

          Swal.fire({
            title: "Chamada Finalizada",
            text: "A chamada manual foi encerrada.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false,
            allowOutsideClick: false,
          });
        }
        // Se cancelar, mantém em chamada manual (checked = true já foi definido)
      });
    }
  });

  updateStatusBadge();
});
