/**
 * Sistema de Atendimento - Ficha do Cliente
 * Versão: 2.0
 * Data: Janeiro 2025
 */

// ===== CONFIGURAÇÕES GLOBAIS =====
const APP_CONFIG = {
  api: {
    baseUrl: "https://webhook.defyit.com.br/webhook/picpay/atendimento",
    assistenteUrl: "https://webhook.defyit.com.br/webhook/assistente",
    username: "defyit",
    password: "Defy#2013",
  },
  ui: {
    animationDuration: 300,
    toastDelay: 3000,
  },
  agente: {
    id: "1",
    nome: "Ronaldo",
  },
};

// ===== CLASSE PRINCIPAL =====
class FichaCliente {
  constructor() {
    this.timers = {
      atendimento: 0,
      ligacao: 0,
    };
    this.state = {
      abordagemCompleta: false,
      abasHabilitadas: ["pills-abordagem-tab", "pills-chat-tab"],
      // ✅ NOVO - Flag para controlar se está saindo legitimamente
      isLegitimateExit: false,
    };
    this.chatState = {
      messageCounter: 0,
      isWaitingResponse: false,
    };

    this.init();
  }

  // ===== INICIALIZAÇÃO =====
  init() {
    this.setupEventListeners();
    this.setupTheme();
    this.setupMasks();
    this.setupTimers();
    this.setupKeyboardShortcuts();
    this.preencheDadosIniciais();
    this.setupChat();
    this.setupValidation();
    this.habilitarChatInicial();
    this.blockPageRefresh();
    this.setupTabNavigation();
  }

  // ✅ NOVO MÉTODO - Configurar navegação por Tab
  setupTabNavigation() {
    // 1. Remover forms da ordem de navegação
    this.excludeFormsFromTabOrder();

    // 2. Configurar ordem personalizada de navegação
    this.setupCustomTabOrder();

    // 3. Interceptar navegação por Tab
    this.interceptTabNavigation();
  }

  // ✅ NOVO MÉTODO - Excluir forms da navegação Tab
  excludeFormsFromTabOrder() {
    // Todos os formulários recebem tabindex="-1"
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      form.setAttribute("tabindex", "-1");

      // Garantir que não sejam focáveis
      form.addEventListener("focus", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Focar no primeiro campo focável dentro do form
        const firstFocusable = this.getFirstFocusableElement(form);
        if (firstFocusable) {
          firstFocusable.focus();
        }
      });
    });

    // Elementos que também devem ser excluídos da navegação
    const excludeSelectors = [
      "form", // Formulários
      ".nav-link.disabled", // Links desabilitados
      ".btn:disabled", // Botões desabilitados
      ".card-header", // Cabeçalhos de cards
      ".card-body", // Corpos de cards (containers)
      ".offcanvas-header", // Cabeçalhos de offcanvas
      ".row", // Containers Bootstrap
      ".col, .col-*", // Colunas Bootstrap
      ".container", // Containers
      ".d-none", // Elementos ocultos
      "[hidden]", // Elementos hidden
      ".tab-pane:not(.active)", // Abas não ativas
    ];

    excludeSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (
          !element.hasAttribute("tabindex") &&
          !this.isInteractiveElement(element)
        ) {
          element.setAttribute("tabindex", "-1");
        }
      });
    });
  }

  // ✅ NOVO MÉTODO - Verificar se elemento é interativo
  isInteractiveElement(element) {
    const interactiveTags = ["INPUT", "BUTTON", "SELECT", "TEXTAREA", "A"];
    const interactiveRoles = ["button", "link", "menuitem", "tab"];

    return (
      interactiveTags.includes(element.tagName) ||
      interactiveRoles.includes(element.getAttribute("role")) ||
      element.hasAttribute("onclick") ||
      element.hasAttribute("href")
    );
  }

  // ✅ NOVO MÉTODO - Configurar ordem personalizada
  setupCustomTabOrder() {
    // Definir ordem lógica de navegação por aba
    const tabOrders = {
      "pills-abordagem": this.getAbordagemTabOrder(),
      "pills-chat": this.getChatTabOrder(),
      "pills-ficha-dados": this.getDadosTabOrder(),
      "pills-endereco": this.getEnderecoTabOrder(),
      "pills-script": this.getScriptTabOrder(),
      "pills-resumo": this.getResumoTabOrder(),
      "pills-mailing": this.getMailingTabOrder(),
      "pills-produtos": this.getProdutosTabOrder(),
      "pills-adicionais": this.getAdicionaisTabOrder(),
      "pills-cobranca": this.getCobrancaTabOrder(),
    };

    // Aplicar tabindex baseado na ordem definida
    Object.entries(tabOrders).forEach(([tabId, order]) => {
      const tabPane = document.getElementById(tabId);
      if (tabPane) {
        order.forEach((selector, index) => {
          const element = tabPane.querySelector(selector);
          if (element && !element.disabled && !element.readOnly) {
            element.setAttribute("tabindex", (index + 1).toString());
          }
        });
      }
    });
  }

  // ✅ NOVOS MÉTODOS - Ordem de navegação por aba
  getAbordagemTabOrder() {
    return ["#nomeAbordagem", "#telefoneAbordagem", 'button[type="submit"]'];
  }

  getChatTabOrder() {
    return ['input[type="text"]', 'button[type="button"]'];
  }

  getDadosTabOrder() {
    return [
      "#nome",
      "#cpf",
      "#dataNascimento",
      "#email",
      "#celular",
      "#whatsapp",
      "#outroTelefone",
    ];
  }

  getEnderecoTabOrder() {
    return [
      "#endereco",
      "#numero",
      "#complemento",
      "#bairro",
      "#cidade",
      "#estado",
      "#cep",
    ];
  }

  getScriptTabOrder() {
    return [
      // Adicionar seletores específicos do script quando necessário
      "button",
      "input",
      "select",
      "textarea",
    ];
  }

  getResumoTabOrder() {
    return [
      // Elementos interativos do resumo
      "button",
      'input[type="checkbox"]',
    ];
  }

  getMailingTabOrder() {
    return [
      // Elementos do mailing
      "input",
      "select",
      "button",
    ];
  }

  getProdutosTabOrder() {
    return [
      // Elementos de produtos
      "select",
      "input",
      "button",
    ];
  }

  getAdicionaisTabOrder() {
    return [
      // Elementos adicionais
      "input",
      "select",
      "button",
    ];
  }

  getCobrancaTabOrder() {
    return [
      "#nomeCartao",
      "#numeroCartao",
      "#validadeCartao",
      "#cvvCartao",
      "#parcelas",
      'button[type="submit"]',
    ];
  }

  // ✅ NOVO MÉTODO - Interceptar navegação Tab
  interceptTabNavigation() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        // Permitir navegação normal - o tabindex já controla a ordem
        return;
      }
    });

    // Interceptar foco em elementos não desejados
    document.addEventListener("focusin", (e) => {
      const element = e.target;

      // Se o elemento tem tabindex="-1", redirecionar foco
      if (element.getAttribute("tabindex") === "-1") {
        e.preventDefault();
        e.stopPropagation();

        // Encontrar próximo elemento focável válido
        const nextFocusable = this.getNextFocusableElement(element);
        if (nextFocusable) {
          nextFocusable.focus();
        }
      }
    });
  }

  // ✅ NOVO MÉTODO - Encontrar primeiro elemento focável
  getFirstFocusableElement(container) {
    const focusableSelectors = [
      'input:not([disabled]):not([readonly]):not([type="hidden"])',
      "select:not([disabled])",
      "textarea:not([disabled]):not([readonly])",
      "button:not([disabled])",
      'a[href]:not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    for (const selector of focusableSelectors) {
      const element = container.querySelector(selector);
      if (element && this.isElementVisible(element)) {
        return element;
      }
    }

    return null;
  }

  // ✅ NOVO MÉTODO - Encontrar próximo elemento focável
  getNextFocusableElement(currentElement) {
    const activeTabPane = document.querySelector(".tab-pane.active");
    if (!activeTabPane) return null;

    const focusableElements = activeTabPane.querySelectorAll(
      'input:not([disabled]):not([readonly]):not([type="hidden"]), ' +
        "select:not([disabled]), " +
        "textarea:not([disabled]):not([readonly]), " +
        "button:not([disabled]), " +
        'a[href]:not([tabindex="-1"]), ' +
        '[tabindex]:not([tabindex="-1"])'
    );

    const visibleElements = Array.from(focusableElements)
      .filter((el) => this.isElementVisible(el))
      .sort((a, b) => {
        const aIndex = parseInt(a.getAttribute("tabindex") || "0");
        const bIndex = parseInt(b.getAttribute("tabindex") || "0");
        return aIndex - bIndex;
      });

    return visibleElements[0] || null;
  }

  // ✅ NOVO MÉTODO - Verificar se elemento está visível
  isElementVisible(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      !element.hasAttribute("hidden") &&
      !element.closest(".d-none") &&
      !element.closest("[hidden]")
    );
  }

  // ✅ NOVO MÉTODO - Atualizar ordem Tab quando aba muda
  updateTabOrderOnTabChange() {
    // Observer para mudanças de aba ativa
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          mutation.target.classList.contains("active")
        ) {
          // Reconfigurar ordem de navegação para nova aba ativa
          setTimeout(() => {
            this.setupCustomTabOrder();
          }, 100);
        }
      });
    });

    // Observar mudanças nas abas
    const tabPanes = document.querySelectorAll(".tab-pane");
    tabPanes.forEach((pane) => {
      observer.observe(pane, {
        attributes: true,
        attributeFilter: ["class"],
      });
    });
  }

  // ✅ MÉTODO ATUALIZADO - Incluir configuração de Tab
  init() {
    this.setupEventListeners();
    this.setupTheme();
    this.setupMasks();
    this.setupTimers();
    this.setupKeyboardShortcuts();
    this.preencheDadosIniciais();
    this.setupChat();
    this.setupValidation();
    this.habilitarChatInicial();
    this.blockPageRefresh();
    this.setupTabNavigation(); // ✅ ADICIONADO
    this.updateTabOrderOnTabChange(); // ✅ ADICIONADO
  }

  // ===== INICIALIZAÇÃO ATUALIZADA =====
  blockPageRefresh() {
    // 1. Bloquear F5, Ctrl+R, Ctrl+F5
    document.addEventListener("keydown", (e) => {
      // F5 ou Ctrl+R
      if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+F5 (hard refresh)
      if (e.ctrlKey && e.key === "F5") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+R (another refresh combination)
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });

    // 2. ✅ ATUALIZADO - Bloquear navegação apenas se não for saída legítima
    window.addEventListener("beforeunload", (e) => {
      // ✅ NOVO - Permitir saída se foi marcada como legítima
      if (this.state.isLegitimateExit) {
        return; // Não bloquear a saída
      }

      // Verificar se há dados não salvos
      if (this.hasUnsavedData()) {
        const message =
          "Você tem dados não salvos. Tem certeza que deseja sair?";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    });

    // 3. ✅ ATUALIZADO - Bloquear botão voltar apenas se não for saída legítima
    window.addEventListener("popstate", (e) => {
      // ✅ NOVO - Permitir navegação se for saída legítima
      if (this.state.isLegitimateExit) {
        return; // Permitir navegação
      }

      e.preventDefault();
      // Recolocar a página no histórico
      window.history.pushState(null, null, window.location.pathname);
    });

    // 4. Adicionar entrada no histórico para capturar tentativas de voltar
    window.history.pushState(null, null, window.location.pathname);

    // 5. Bloquear clique direito (opcional - pode ser muito restritivo)
    // document.addEventListener('contextmenu', (e) => {
    //   e.preventDefault();
    //   this.showToastNotification('Menu de contexto desabilitado durante o atendimento', 'warning');
    // });

    // 6. Bloquear DevTools (Ctrl+Shift+I, F12)
    document.addEventListener("keydown", (e) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        this.showToastNotification(
          "DevTools bloqueado durante o atendimento",
          "warning"
        );
        return false;
      }

      // Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        this.showToastNotification(
          "DevTools bloqueado durante o atendimento",
          "warning"
        );
        return false;
      }

      // Ctrl+U (view source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        this.showToastNotification(
          "Visualizar código fonte bloqueado",
          "warning"
        );
        return false;
      }
    });

    // 7. Detectar quando a página perde/ganha foco (aba foi trocada)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        console.log("⚠️ Página perdeu foco - usuário pode ter trocado de aba");
        // Opcional: pausar timers ou mostrar aviso
        // this.pauseTimers();
      } else {
        console.log("✅ Página ganhou foco novamente");
        // this.resumeTimers();
      }
    });
  }

  // ✅ NOVO MÉTODO - Marcar saída como legítima
  allowLegitimateExit() {
    this.state.isLegitimateExit = true;
    console.log("✅ Saída legítima permitida - bloqueios removidos");
  }

  // ✅ NOVO MÉTODO - Cancelar saída legítima (caso necessário)
  cancelLegitimateExit() {
    this.state.isLegitimateExit = false;
    console.log("⚠️ Saída legítima cancelada - bloqueios reativados");
  }

  // ✅ MÉTODO ATUALIZADO - Verificar dados não salvos
  hasUnsavedData() {
    // ✅ NOVO - Se é saída legítima, não há dados "não salvos"
    if (this.state.isLegitimateExit) {
      return false;
    }

    // Verificar se há dados digitados em campos principais
    const camposImportantes = [
      "nome",
      "cpf",
      "email",
      "endereco",
      "numeroCartao",
      "nomeAbordagem",
      "telefoneAbordagem",
    ];

    return camposImportantes.some((campo) => {
      const input = document.getElementById(campo);
      return input && input.value.trim().length > 0 && !input.readOnly;
    });
  }

  // ===== ENVIO DE DADOS ATUALIZADO =====
  async enviarDados(status) {
    try {
      if (!this.validarCamposObrigatorios(status)) return;

      const confirmResult = await this.showSweetAlertConfirmation(
        "Confirmar Envio",
        `Deseja realmente ${this.getStatusText(status)}?`
      );

      if (!confirmResult.isConfirmed) return;

      this.showSweetAlertLoading("Enviando dados...");

      const payload = this.construirPayload(status);
      this.logAbasIncluidas(payload);

      const response = await this.sendToAPI(payload);

      this.hideSweetAlertLoading();

      await Swal.fire({
        title: "Dados enviados com sucesso!",
        text: `${this.getStatusText(status)} realizado com sucesso!`,
        icon: "success",
        confirmButtonText: "Voltar ao Atendimento",
        confirmButtonColor: "#198754",
        timer: 2000,
        timerProgressBar: true,
        background:
          document.documentElement.getAttribute("data-bs-theme") === "dark"
            ? "#212529"
            : "#ffffff",
        color:
          document.documentElement.getAttribute("data-bs-theme") === "dark"
            ? "#ffffff"
            : "#212529",
      });

      const activeOffcanvas = document.querySelector(".offcanvas.show");
      if (activeOffcanvas) {
        const offcanvasInstance =
          bootstrap.Offcanvas.getInstance(activeOffcanvas);
        if (offcanvasInstance) {
          offcanvasInstance.hide();
        }
      }

      // ✅ NOVO - Permitir saída legítima antes do redirecionamento
      this.allowLegitimateExit();

      setTimeout(() => {
        window.location.href = "atendimento.html";
      }, 300);
    } catch (error) {
      this.hideSweetAlertLoading();
      this.showSweetAlertModal(`Erro: ${error.message}`, "error");

      // ✅ NOVO - Em caso de erro, manter os bloqueios ativos
      this.cancelLegitimateExit();
    }
  }

  // ✅ NOVO MÉTODO - Permitir redirecionamento sem bloqueios
  redirectTo(url) {
    this.allowLegitimateExit();
    window.location.href = url;
  }

  // ✅ NOVO MÉTODO - Recarregar página sem bloqueios (caso necessário)
  reloadPage() {
    this.allowLegitimateExit();
    window.location.reload();
  }

  habilitarChatInicial() {
    const chatTab = document.getElementById("nav-item-chat");
    if (chatTab) {
      chatTab.classList.remove("d-none");
    }
    this.atualizarContadorAbas();
  }

  // ===== SISTEMA DE VALIDAÇÃO VISUAL =====
  setupValidation() {
    this.setupRealTimeValidation();
    this.setupBlurValidation();
    this.setupInputValidation();
  }

  setupRealTimeValidation() {
    const requiredFields = [
      "nome",
      "cpf",
      "dataNascimento",
      "email",
      "endereco",
      "numero",
      "bairro",
      "cidade",
      "estado",
      "cep",
      "nomeCartao",
      "numeroCartao",
      "validadeCartao",
      "cvvCartao",
    ];

    requiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener("input", () => this.validateField(field));
        field.addEventListener("blur", () => this.validateField(field));
        field.addEventListener("focus", () => this.clearFieldValidation(field));
      }
    });
  }

  setupBlurValidation() {
    // CPF - validação específica
    const cpfField = document.getElementById("cpf");
    if (cpfField) {
      cpfField.addEventListener("blur", (e) => {
        const cpf = e.target.value.replace(/\D/g, "");
        if (cpf.length === 11) {
          if (this.validarCPF(cpf)) {
            this.setFieldValid(e.target, "CPF válido");
          } else {
            this.setFieldInvalid(e.target, "CPF inválido");
          }
        } else if (cpf.length > 0) {
          this.setFieldInvalid(e.target, "CPF deve ter 11 dígitos");
        }
      });
    }

    // Email - validação específica
    const emailField = document.getElementById("email");
    if (emailField) {
      emailField.addEventListener("blur", (e) => {
        const email = e.target.value.trim();
        if (email.length > 0) {
          if (this.validarEmail(email)) {
            this.setFieldValid(e.target, "E-mail válido");
          } else {
            this.setFieldInvalid(e.target, "E-mail inválido");
          }
        }
      });
    }

    // CEP - validação específica
    const cepField = document.getElementById("cep");
    if (cepField) {
      cepField.addEventListener("blur", (e) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
          this.setFieldValid(e.target, "CEP válido");
        } else if (cep.length > 0) {
          this.setFieldInvalid(e.target, "CEP deve ter 8 dígitos");
        }
      });
    }
  }

  setupInputValidation() {
    const phoneFields = ["celular", "whatsapp", "outroTelefone"];
    phoneFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener("blur", (e) => {
          const phone = e.target.value.replace(/\D/g, "");
          if (phone.length >= 10 && phone.length <= 11) {
            this.setFieldValid(e.target, "Telefone válido");
          } else if (phone.length > 0) {
            this.setFieldInvalid(e.target, "Telefone inválido");
          }
        });
      }
    });
  }

  validateField(field) {
    if (!field) return;

    const value = field.value.trim();
    const isRequired = field.hasAttribute("required");

    if (isRequired && !value) {
      this.setFieldInvalid(field, "Este campo é obrigatório");
      return false;
    }

    if (!isRequired && !value) {
      this.clearFieldValidation(field);
      return true;
    }

    if (value) {
      this.setFieldValid(field);
      return true;
    }

    return true;
  }

  setFieldValid(field, message = "Campo válido") {
    this.clearFieldValidation(field);
    field.classList.add("is-valid");
    field.classList.remove("is-invalid");
    field.title = message;
    this.createValidationFeedback(field, "valid", message);
  }

  setFieldInvalid(field, message = "Campo inválido") {
    this.clearFieldValidation(field);
    field.classList.add("is-invalid");
    field.classList.remove("is-valid");
    field.title = message;
    this.createValidationFeedback(field, "invalid", message);
  }

  clearFieldValidation(field) {
    if (!field) return;

    field.classList.remove("is-valid", "is-invalid");
    field.title = "";

    const existingFeedback = field.parentElement.querySelector(
      ".invalid-feedback, .valid-feedback"
    );
    if (existingFeedback) {
      existingFeedback.remove();
    }
  }

  createValidationFeedback(field, type, message) {
    const existingFeedback = field.parentElement.querySelector(
      ".invalid-feedback, .valid-feedback"
    );
    if (existingFeedback) {
      existingFeedback.remove();
    }

    const feedback = document.createElement("div");
    feedback.className = `${type}-feedback`;
    feedback.textContent = message;
    field.parentElement.appendChild(feedback);
  }

  // ===== VALIDADORES ESPECÍFICOS =====
  validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ===== CONFIGURAÇÃO DE EVENTOS =====
  setupEventListeners() {
    const formAbordagem = document.getElementById("formAbordagem");
    if (formAbordagem) {
      formAbordagem.addEventListener("submit", (e) => this.handleAbordagem(e));
    }

    const formCobranca = document.getElementById("formCobranca");
    if (formCobranca) {
      formCobranca.addEventListener("submit", (e) => this.handleCobranca(e));
    }

    this.configurarDropdownSucesso();
  }

  configurarDropdownSucesso() {
    setTimeout(() => {
      const elementosClicaveis = document.querySelectorAll(
        ".footer-btn-success, #dropdown-sucesso .dropdown-item"
      );

      elementosClicaveis.forEach((elemento) => {
        elemento.addEventListener("click", (e) => {
          e.preventDefault();
          if (!this.state.abordagemCompleta) {
            this.showToastNotification(
              "Complete a abordagem primeiro!",
              "warning"
            );
            return;
          }
          this.enviarDados("sucesso");
        });
      });
    }, 1000);
  }

  // ===== MANIPULAÇÃO DE FORMULÁRIOS =====
  handleAbordagem(e) {
    e.preventDefault();

    const nome = document.getElementById("nomeAbordagem").value.trim();
    const telefone = document.getElementById("telefoneAbordagem").value.trim();

    if (!nome || !telefone) {
      this.showToastNotification(
        "Preencha todos os campos da abordagem",
        "error"
      );
      return;
    }

    localStorage.setItem("abordagem_nome", nome);
    localStorage.setItem("abordagem_telefone", telefone);

    console.log("✅ Abordagem completa - habilitando funcionalidades...");

    this.state.abordagemCompleta = true;

    this.showToastNotification("Dados da abordagem confirmados!", "success");

    this.habilitarTodasAsAbas();

    setTimeout(() => {
      const proximaAba = document.getElementById("pills-ficha-dados-tab");
      if (proximaAba) proximaAba.click();
    }, 500);
  }

  handleCobranca(e) {
    e.preventDefault();
    this.showToastNotification("Dados de pagamento processados!", "success");
  }

  // ===== SISTEMA DE ABAS =====
  habilitarTodasAsAbas() {
    console.log("🔓 Habilitando todas as abas...");

    const abasOcultas = [
      "nav-item-dados",
      "nav-item-endereco",
      "nav-item-script",
      "nav-item-resumo",
      "nav-item-mailing",
      "nav-item-produtos",
      "nav-item-adicionais",
      "nav-item-cobranca",
    ];

    abasOcultas.forEach((abaId) => {
      const elemento = document.getElementById(abaId);
      if (elemento) {
        elemento.classList.remove("d-none");
        this.state.abasHabilitadas.push(abaId);
        console.log(`✅ Aba habilitada: ${abaId}`);
      }
    });

    this.habilitarBotaoSucesso();
    this.atualizarContadorAbas();

    console.log("✅ Todas as abas foram habilitadas");
  }

  habilitarBotaoSucesso() {
    const sucessoContainer = document.getElementById("dropdown-sucesso");
    const sucessoDropdown = sucessoContainer?.querySelector(
      ".footer-btn-success"
    );

    console.log("🔓 Habilitando botão de sucesso...");
    console.log("- Container encontrado:", !!sucessoContainer);
    console.log("- Botão encontrado:", !!sucessoDropdown);

    if (sucessoContainer) {
      sucessoContainer.classList.remove("d-none");
      console.log("✅ Container de sucesso visível");
    }

    if (sucessoDropdown) {
      sucessoDropdown.disabled = false;
      sucessoDropdown.classList.add("sucesso-habilitado");
      sucessoDropdown.title = "Registrar sucesso (Ctrl + S) - HABILITADO";
      console.log("✅ Botão de sucesso habilitado");
    }

    this.setupSucessoClick();
  }

  updateShortcutFeedback(action) {
    const messages = {
      //success: "🎯 Atalho Ctrl + S agora está disponível!",
      disabled: "⚠️ Atalho Ctrl + S temporariamente desabilitado",
    };

    if (messages[action]) {
      setTimeout(() => {
        this.showToastNotification(
          messages[action],
          action === "success" ? "success" : "info"
        );
      }, 500);
    }
  }

  // ===== NAVEGAÇÃO =====
  setupTabNavigation() {
    const btnAnterior = document.getElementById("btnAnteriorFooter");
    const btnProximo = document.getElementById("btnProximoFooter");

    if (btnAnterior)
      btnAnterior.addEventListener("click", () => this.mudarAba(-1));
    if (btnProximo)
      btnProximo.addEventListener("click", () => this.mudarAba(1));
  }

  mudarAba(direcao) {
    const tabs = Array.from(
      document.querySelectorAll("#pills-tab .nav-link:not(.disabled)")
    ).filter((tab) => !tab.closest(".nav-item").classList.contains("d-none"));

    const atual = tabs.findIndex((tab) => tab.classList.contains("active"));
    const proximoIndex = atual + direcao;

    if (proximoIndex >= 0 && proximoIndex < tabs.length) {
      tabs[proximoIndex].click();
      this.atualizarContadorAbas();
    }
  }

  atualizarContadorAbas() {
    const tabs = Array.from(
      document.querySelectorAll("#pills-tab .nav-link:not(.disabled)")
    ).filter((tab) => !tab.closest(".nav-item").classList.contains("d-none"));

    const abaAtualElement = document.getElementById("abaAtual");
    const totalAbasElement = document.getElementById("totalAbas");

    if (abaAtualElement && totalAbasElement) {
      const abaAtiva = tabs.findIndex((tab) =>
        tab.classList.contains("active")
      );
      abaAtualElement.textContent = abaAtiva + 1;
      totalAbasElement.textContent = tabs.length;
    }
  }

  debugSucessoButton() {
    console.log("🔍 === DEBUG BOTÃO SUCESSO ===");
    console.log(
      "- this.state.abordagemCompleta:",
      this.state.abordagemCompleta
    );

    const sucessoContainer = document.getElementById("dropdown-sucesso");
    const sucessoDropdown = document.querySelector(".footer-btn-success");

    console.log("- Container existe:", !!sucessoContainer);
    if (sucessoContainer) {
      console.log("- Container classes:", sucessoContainer.className);
      console.log(
        "- Container visível:",
        !sucessoContainer.classList.contains("d-none")
      );
    }

    console.log("- Botão existe:", !!sucessoDropdown);
    if (sucessoDropdown) {
      console.log("- Botão classes:", sucessoDropdown.className);
      console.log("- Botão disabled:", sucessoDropdown.disabled);
      console.log(
        "- Tem classe sucesso-habilitado:",
        sucessoDropdown.classList.contains("sucesso-habilitado")
      );
    }
    console.log("=== FIM DEBUG ===");
  }

  debugCurrentState() {
    console.log("🔍 Estado atual do sistema:");
    console.log("- Abordagem completa:", this.state.abordagemCompleta);

    const sucessoContainer = document.getElementById("dropdown-sucesso");
    const sucessoDropdown = document.querySelector(".footer-btn-success");

    console.log(
      "- Container sucesso visível:",
      sucessoContainer && !sucessoContainer.classList.contains("d-none")
    );
    console.log(
      "- Botão sucesso habilitado:",
      sucessoDropdown && !sucessoDropdown.disabled
    );
    console.log(
      "- Botão tem classe habilitada:",
      sucessoDropdown &&
        sucessoDropdown.classList.contains("sucesso-habilitado")
    );
  }

  // ✅ NOVO MÉTODO - Mostrar atalhos disponíveis
  showKeyboardShortcuts() {
    const isAbordagemCompleta = this.state.abordagemCompleta;
    const sucessoStatus = isAbordagemCompleta
      ? '<span class="text-success">✅ Disponível</span>'
      : '<span class="text-warning">⚠️ Requer abordagem</span>';

    const shortcuts = [
      { key: "Ctrl + →", action: "Próxima aba", icon: "bi-arrow-right" },
      { key: "Ctrl + ←", action: "Aba anterior", icon: "bi-arrow-left" },
      {
        key: "Ctrl + P",
        action: "Confirmar abordagem",
        icon: "bi-check-circle",
      },
      {
        key: "Ctrl + G",
        action: "Agendar atendimento",
        icon: "bi-calendar-event",
      },
      { key: "Ctrl + F", action: "Registrar recusa", icon: "bi-x-circle" },
      {
        key: "Ctrl + S",
        action: "Registrar sucesso",
        icon: "bi-check-circle-fill",
      },
      { key: "Ctrl + M", action: "Trocar tema", icon: "bi-palette" }, // ✅ NOVO
      {
        key: "Ctrl + Enter",
        action: "Enviar formulário ativo",
        icon: "bi-send",
      },
    ];

    const shortcutsList = shortcuts
      .map(
        (s) => `
        <div class="d-flex align-items-center justify-content-between mb-2 p-2 bg-light rounded">
          <div class="d-flex align-items-center">
            <i class="bi ${s.icon} text-primary me-3"></i>
            <span class="fw-medium">${s.action}</span>
          </div>
          <kbd class="bg-secondary text-white px-2 py-1 rounded">${s.key}</kbd>
        </div>
      `
      )
      .join("");

    Swal.fire({
      title: "⌨️ Atalhos de Teclado",
      html: `
        <div class="text-start">
          <p class="text-muted mb-3">Use estes atalhos para navegar mais rapidamente:</p>
          ${shortcutsList}
          <div class="mt-3 p-2 bg-info bg-opacity-10 rounded">
            <small class="text-info">
              <i class="bi bi-info-circle"></i>
              Pressione <kbd>Ctrl + M</kbd> a qualquer momento para alternar entre tema claro e escuro.
            </small>
          </div>
        </div>
      `,
      confirmButtonText: "Entendi",
      confirmButtonColor: "#0d6efd",
      width: "500px",
      background:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#212529"
          : "#ffffff",
      color:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#ffffff"
          : "#212529",
    });
  }

  // ===== ATALHOS DE TECLADO =====
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (!e || !e.key) return;

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (!ctrl) return;

      const shortcuts = {
        arrowright: () => this.mudarAba(1),
        arrowleft: () => this.mudarAba(-1),
        p: () => this.triggerAbordagem(),
        g: () => this.openOffcanvas("offcanvasAgendamento"),
        f: () => this.openOffcanvas("offcanvasRecusar"),
        s: () => this.handleSucessoWithValidation(),
        m: () => this.toggleTheme(),
        enter: () => this.submitActiveForm(),
        h: () => this.showKeyboardShortcuts(),
      };

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    });
  }

  triggerAbordagem() {
    const formAbordagem = document.getElementById("formAbordagem");
    const submitBtn = formAbordagem?.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.offsetParent !== null) {
      console.log("🚀 Executando abordagem via atalho Ctrl + P");
      submitBtn.click();
    } else {
      this.showToastNotification(
        "⚠️ Formulário de abordagem não está disponível!",
        "warning"
      );
    }
  }

  openOffcanvas(id) {
    const offcanvas = document.getElementById(id);
    if (offcanvas) {
      new bootstrap.Offcanvas(offcanvas).show();
    }
  }

  handleSucessoWithValidation() {
    console.log("🔍 Verificando validação do sucesso...");
    console.log("- Abordagem completa:", this.state.abordagemCompleta);

    // Verificar se a abordagem foi completa
    if (!this.state.abordagemCompleta) {
      this.showToastNotification(
        "⚠️ Complete a abordagem primeiro para habilitar o sucesso!",
        "warning"
      );
      return;
    }

    // Verificar se o botão de sucesso está habilitado
    const sucessoDropdown = document.querySelector(".footer-btn-success");
    const sucessoContainer = document.getElementById("dropdown-sucesso");

    console.log("- Container sucesso existe:", !!sucessoContainer);
    console.log(
      "- Container sucesso visível:",
      sucessoContainer && !sucessoContainer.classList.contains("d-none")
    );
    console.log("- Botão sucesso existe:", !!sucessoDropdown);
    console.log(
      "- Botão sucesso habilitado:",
      sucessoDropdown && !sucessoDropdown.disabled
    );

    // Verificar se o container está visível
    if (sucessoContainer && sucessoContainer.classList.contains("d-none")) {
      console.log("❌ Container de sucesso está oculto");
      this.showToastNotification(
        "⚠️ Botão de sucesso não está disponível ainda!",
        "warning"
      );
      return;
    }

    // Verificar se o botão está desabilitado
    if (sucessoDropdown && sucessoDropdown.disabled) {
      console.log("❌ Botão de sucesso está desabilitado");
      this.showToastNotification(
        "⚠️ Complete a abordagem primeiro para habilitar o sucesso!",
        "warning"
      );
      return;
    }
    // Se chegou até aqui, pode executar o sucesso
    this.handleSucesso();
  }

  handleSucesso() {
    console.log("🎯 Executando handleSucesso...");

    // Verificação final simples
    if (this.state.abordagemCompleta) {
      console.log("✅ Executando sucesso - abordagem está completa");
      this.enviarDados("sucesso");
    } else {
      console.log("❌ Sucesso bloqueado - abordagem não completa");
      this.showToastNotification("⚠️ Complete a abordagem primeiro!", "error");
    }
  }

  submitActiveForm() {
    const activeTabPane = document.querySelector(".tab-pane.active");
    const activeForm = activeTabPane?.querySelector("form");
    const submitBtn = activeForm?.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  }

  // ===== MÁSCARAS DE ENTRADA =====
  setupMasks() {
    this.setupCPFMask();
    this.setupPhoneMask();
    this.setupCardMasks();
    this.setupCEPMask();
    this.setupCEPAutocomplete();
  }

  // ✅ NOVO MÉTODO - Configurar autocomplete de CEP
  setupCEPAutocomplete() {
    console.log("Configurando autocomplete de CEP...");
    const cepInput = document.getElementById("cep");
    if (cepInput) {
      // cepInput.addEventListener("blur", (e) => {
      //   const cep = e.target.value.replace(/\D/g, "");
      //   if (cep.length === 8) {
      //     this.buscarCep(cep);
      //   }
      // });

      // Também buscar quando usuario digitar 8 dígitos
      cepInput.addEventListener("input", (e) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
          // Pequeno delay para evitar muitas consultas
          clearTimeout(this.cepTimeout);
          this.cepTimeout = setTimeout(() => {
            this.buscarCep(cep);
          }, 500);
        }
      });
    }
  }

  // ✅ NOVA FUNÇÃO - Buscar dados do CEP
  async buscarCep(cep) {
    try {
      console.log(cep);

      // Validar CEP
      if (!cep || cep.length !== 8) {
        this.showToastNotification("CEP deve ter 8 dígitos", "warning");
        return;
      }

      // Mostrar loading
      this.setCEPLoading(true);

      // Buscar na API do ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status}`);
      }

      const dados = await response.json();

      // Verificar se CEP foi encontrado
      if (dados.erro) {
        throw new Error("CEP não encontrado");
      }

      // Preencher campos automaticamente
      this.preencherDadosCep(dados);

      // Feedback de sucesso
      this.showToastNotification(
        `📍 Endereço encontrado: ${dados.localidade} - ${dados.uf}`,
        "success"
      );

      // Focar no próximo campo (número se estiver vazio)
      const numeroField = document.getElementById("numero");
      if (numeroField && !numeroField.value.trim()) {
        setTimeout(() => {
          numeroField.focus();
        }, 100);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);

      this.showToastNotification(
        `❌ Erro ao buscar CEP: ${error.message}`,
        "error"
      );

      // Limpar campos em caso de erro
      this.limparCamposCep();
    } finally {
      this.setCEPLoading(false);
    }
  }

  // ✅ NOVO MÉTODO - Preencher campos com dados do CEP
  preencherDadosCep(dados) {
    const campos = {
      endereco: dados.logradouro || "",
      bairro: dados.bairro || "",
      cidade: dados.localidade || "",
      estado: dados.uf || "",
    };

    Object.entries(campos).forEach(([id, valor]) => {
      const campo = document.getElementById(id);
      if (campo && valor) {
        campo.value = valor;

        // Aplicar validação visual
        this.setFieldValid(campo, "Preenchido automaticamente");

        // Animação sutil para mostrar que foi preenchido
        campo.style.backgroundColor = "rgba(25, 135, 84, 0.1)";
        setTimeout(() => {
          campo.style.backgroundColor = "";
        }, 2000);
      }
    });
  }
  // ✅ NOVO MÉTODO - Limpar campos do endereço
  limparCamposCep() {
    const campos = ["endereco", "bairro", "cidade", "estado"];

    campos.forEach((id) => {
      const campo = document.getElementById(id);
      if (campo) {
        campo.value = "";
        this.clearFieldValidation(campo);
      }
    });
  }

  // ✅ NOVO MÉTODO - Loading no campo CEP
  setCEPLoading(loading) {
    const cepField = document.getElementById("cep");
    const cepContainer = cepField?.parentElement;

    if (!cepField) return;

    if (loading) {
      // Desabilitar campo temporariamente
      cepField.disabled = true;

      // Criar indicador de loading
      let loadingIndicator = document.getElementById("cep-loading");
      if (!loadingIndicator) {
        loadingIndicator = document.createElement("div");
        loadingIndicator.id = "cep-loading";
        loadingIndicator.className =
          "position-absolute end-0 top-50 translate-middle-y me-2";
        loadingIndicator.style.zIndex = "10";
        loadingIndicator.innerHTML = `
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Buscando...</span>
          </div>
        `;

        if (cepContainer) {
          cepContainer.style.position = "relative";
          cepContainer.appendChild(loadingIndicator);
        }
      }
    } else {
      // Reabilitar campo
      cepField.disabled = false;

      // Remover indicador de loading
      const loadingIndicator = document.getElementById("cep-loading");
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
    }
  }

  setupCEPMask() {
    const cepInput = document.getElementById("cep");
    if (cepInput) {
      cepInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 8) value = value.substring(0, 8);
        if (value.length > 5) value = value.replace(/(\d{5})(\d)/, "$1-$2");
        e.target.value = value;
      });

      // ✅ MELHORAR placeholder e título
      cepInput.placeholder = "00000-000";
      cepInput.title = "Digite o CEP para buscar o endereço automaticamente";
    }
  }

  setupCPFMask() {
    const cpfInputs = document.querySelectorAll('[id*="cpf"], [id*="Cpf"]');
    cpfInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        e.target.value = value;
      });
    });
  }

  setupPhoneMask() {
    const phoneInputs = document.querySelectorAll(
      '[id*="telefone"], [id*="celular"], [id*="whatsapp"]'
    );
    phoneInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        value = value.replace(/(\d{2})(\d)/, "($1) $2");
        value = value.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
        e.target.value = value;
      });
    });
  }

  setupCardMasks() {
    // Número do cartão
    const numeroCartao = document.getElementById("numeroCartao");
    if (numeroCartao) {
      numeroCartao.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 16) value = value.substring(0, 16);
        value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
        e.target.value = value;
      });

      numeroCartao.addEventListener("blur", (e) => {
        this.detectCardBrand(e.target.value.replace(/\s/g, ""));

        const numero = e.target.value.replace(/\D/g, "");
        if (numero.length >= 13 && numero.length <= 19) {
          this.setFieldValid(e.target, "Número do cartão válido");
        } else if (numero.length > 0) {
          this.setFieldInvalid(e.target, "Número do cartão inválido");
        }
      });
    }

    // Validade
    const validadeCartao = document.getElementById("validadeCartao");
    if (validadeCartao) {
      validadeCartao.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) value = value.substring(0, 4);
        if (value.length >= 2) value = value.replace(/(\d{2})(\d)/, "$1/$2");
        e.target.value = value;
      });

      validadeCartao.addEventListener("blur", (e) => {
        const valor = e.target.value;
        if (valor.length === 5) {
          const mes = parseInt(valor.substring(0, 2));
          const ano = parseInt(valor.substring(3, 5));
          const anoAtual = new Date().getFullYear() % 100;

          if (mes < 1 || mes > 12) {
            this.setFieldInvalid(
              e.target,
              "Mês inválido! Digite um mês entre 01 e 12."
            );
          } else if (ano < anoAtual) {
            this.setFieldInvalid(
              e.target,
              "Cartão vencido! Verifique a validade."
            );
          } else {
            this.setFieldValid(e.target, "Validade do cartão válida");
          }
        } else if (valor.length > 0) {
          this.setFieldInvalid(e.target, "Digite a validade no formato MM/AA");
        }
      });
    }

    // CVV
    const cvvCartao = document.getElementById("cvvCartao");
    if (cvvCartao) {
      cvvCartao.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) value = value.substring(0, 4);
        e.target.value = value;
      });

      cvvCartao.addEventListener("blur", (e) => {
        const valor = e.target.value;
        if (valor.length >= 3 && valor.length <= 4) {
          this.setFieldValid(e.target, "CVV válido");
        } else if (valor.length > 0) {
          this.setFieldInvalid(e.target, "CVV deve ter 3 ou 4 dígitos");
        }
      });
    }

    // Nome no cartão
    const nomeCartao = document.getElementById("nomeCartao");
    if (nomeCartao) {
      nomeCartao.addEventListener("input", (e) => {
        let value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
        value = value.toUpperCase();
        if (value.length > 30) value = value.substring(0, 30);
        e.target.value = value;
      });

      nomeCartao.addEventListener("blur", (e) => {
        const valor = e.target.value.trim();
        if (valor.length >= 2) {
          this.setFieldValid(e.target, "Nome no cartão válido");
        } else if (valor.length > 0) {
          this.setFieldInvalid(e.target, "Nome muito curto");
        }
      });
    }
  }

  // setupCEPMask() {
  //   const cepInput = document.getElementById("cep");
  //   if (cepInput) {
  //     cepInput.addEventListener("input", (e) => {
  //       let value = e.target.value.replace(/\D/g, "");
  //       if (value.length > 8) value = value.substring(0, 8);
  //       if (value.length > 5) value = value.replace(/(\d{5})(\d)/, "$1-$2");
  //       e.target.value = value;
  //     });
  //   }
  // }

  // ===== DETECÇÃO DE BANDEIRA =====
  detectCardBrand(numero) {
    if (!numero || numero.length < 4) return;

    const brands = {
      visa: { pattern: /^4/, color: "#1a1f71" },
      mastercard: { pattern: /^5[1-5]|^2[2-7]/, color: "#eb001b" },
      amex: { pattern: /^3[47]/, color: "#006fcf" },
      diners: { pattern: /^3[068]|^30[0-5]/, color: "#0079be" },
      elo: {
        pattern:
          /^(4011|4312|4389|4514|4573|5041|5066|5067|6277|6362|6363|6516|6550)/,
        color: "#ffcb05",
      },
      hipercard: { pattern: /^606282/, color: "#c41e3a" },
    };

    let detectedBrand = "Desconhecida";
    let brandColor = "#6c757d";

    for (const [brand, config] of Object.entries(brands)) {
      if (config.pattern.test(numero)) {
        detectedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
        brandColor = config.color;
        break;
      }
    }

    this.showCardBrand(detectedBrand, brandColor);
  }

  showCardBrand(brand, color) {
    let brandElement = document.getElementById("bandeiraCartao");

    if (!brandElement) {
      const container = document.getElementById("numeroCartao").parentElement;
      brandElement = document.createElement("span");
      brandElement.id = "bandeiraCartao";
      brandElement.className = "badge position-absolute";
      brandElement.style.cssText =
        "top: 8px; right: 8px; font-size: 10px; z-index: 10;";
      container.style.position = "relative";
      container.appendChild(brandElement);
    }

    brandElement.textContent = brand;
    brandElement.style.backgroundColor = color;
    brandElement.style.color = brand === "Elo" ? "#000" : "#fff";
    brandElement.style.display =
      brand !== "Desconhecida" ? "inline-block" : "none";
  }

  // ===== SISTEMA DE TEMAS =====
  setupTheme() {
    const themeToggle = document.getElementById("themeToggle");
    const htmlElement = document.documentElement;

    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    htmlElement.setAttribute("data-bs-theme", savedTheme);

    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggleTheme());
    }
  }

  toggleTheme() {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    htmlElement.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  // ✅ NOVO MÉTODO - Atualizar ícone do tema
  updateThemeIcon(theme) {
    const themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;

    const icon = themeToggle.querySelector("i");
    if (icon) {
      if (theme === "dark") {
        icon.className = "bi bi-sun-fill";
        themeToggle.title = "Alternar para tema claro (Ctrl + M)";
      } else {
        icon.className = "bi bi-moon-fill";
        themeToggle.title = "Alternar para tema escuro (Ctrl + M)";
      }
    }
  }

  // ===== TIMERS =====
  setupTimers() {
    setInterval(() => {
      if (!this.timersPaused) {
        this.timers.atendimento++;
        const timerElement = document.getElementById("tempoAtendimento");
        if (timerElement) {
          timerElement.textContent = this.formatTime(this.timers.atendimento);
        }
      }
    }, 1000);

    setInterval(() => {
      if (!this.timersPaused) {
        this.timers.ligacao++;
        const tempoLigacaoInput = document.getElementById("tempoLigacao");
        if (tempoLigacaoInput) {
          tempoLigacaoInput.value = this.timers.ligacao;
        }
      }
    }, 1000);
  }

  formatTime(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const min = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${min}:${sec}`;
  }

  // ===== VALIDAÇÃO =====
  validarCamposObrigatorios(status) {
    const validator = new FormValidator();

    validator.setFieldValid = (field, message) =>
      this.setFieldValid(field, message);
    validator.setFieldInvalid = (field, message) =>
      this.setFieldInvalid(field, message);
    validator.clearFieldValidation = (field) =>
      this.clearFieldValidation(field);
    validator.createValidationFeedback = (field, type, message) =>
      this.createValidationFeedback(field, type, message);

    return validator.validate(status);
  }

  // ===== ENVIO DE DADOS =====
  async enviarDados(status) {
    try {
      if (!this.validarCamposObrigatorios(status)) return;

      const confirmResult = await this.showSweetAlertConfirmation(
        "Confirmar Envio",
        `Deseja realmente ${this.getStatusText(status)}?`
      );

      if (!confirmResult.isConfirmed) return;

      this.showSweetAlertLoading("Enviando dados...");

      const payload = this.construirPayload(status);
      this.logAbasIncluidas(payload);

      const response = await this.sendToAPI(payload);

      this.hideSweetAlertLoading();

      await Swal.fire({
        title: "Dados enviados com sucesso!",
        text: `${this.getStatusText(status)} realizado com sucesso!`,
        icon: "success",
        confirmButtonText: "Voltar ao Atendimento",
        confirmButtonColor: "#198754",
        timer: 2000,
        timerProgressBar: true,
        background:
          document.documentElement.getAttribute("data-bs-theme") === "dark"
            ? "#212529"
            : "#ffffff",
        color:
          document.documentElement.getAttribute("data-bs-theme") === "dark"
            ? "#ffffff"
            : "#212529",
      });

      const activeOffcanvas = document.querySelector(".offcanvas.show");
      if (activeOffcanvas) {
        const offcanvasInstance =
          bootstrap.Offcanvas.getInstance(activeOffcanvas);
        if (offcanvasInstance) {
          offcanvasInstance.hide();
        }
      }

      // ✅ NOVO - Permitir saída legítima antes do redirecionamento
      this.allowLegitimateExit();

      setTimeout(() => {
        window.location.href = "atendimento.html";
      }, 300);
    } catch (error) {
      this.hideSweetAlertLoading();
      this.showSweetAlertModal(`Erro: ${error.message}`, "error");

      // ✅ NOVO - Em caso de erro, manter os bloqueios ativos
      this.cancelLegitimateExit();
    }
  }

  getStatusText(status) {
    const texts = {
      sucesso: "registrar o sucesso",
      agenda: "realizar o agendamento",
      recusa: "registrar a recusa",
    };
    return texts[status] || "salvar os dados";
  }

  construirPayload(status) {
    console.log("🔧 Construindo payload para status:", status);

    const payload = {
      // ===== DADOS BÁSICOS =====
      clienteHash: "MTIzNDU2MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkw",
      timestamp: new Date().toISOString(),
      status: status,
      agente: {
        id: APP_CONFIG.agente.id,
        nome: APP_CONFIG.agente.nome,
      },
      discador: {
        chamadaId: "call_789456123",
        gravacaoUrl: "https://gravacoes.exemplo.com/audio/123456789.mp3",
        tempoLigacao: 9,
        tipoDiscador: "OLOS",
      },
      tempoAtendimento: this.formatTime(this.timers.atendimento),
      tempoLigacao: this.timers.ligacao,

      // ===== ABORDAGEM (SEMPRE INCLUÍDO) =====
      abordagem: {
        nome:
          localStorage.getItem("abordagem_nome") ||
          document.getElementById("nomeAbordagem")?.value ||
          "",
        telefone:
          localStorage.getItem("abordagem_telefone") ||
          document.getElementById("telefoneAbordagem")?.value ||
          "",
        timestamp: new Date().toISOString(),
      },
    };

    // ===== DADOS PESSOAIS =====
    if (this.isTabVisible("nav-item-dados")) {
      payload.dadosPessoais = {
        nome: this.getFieldValue("nome"),
        cpf: this.getFieldValue("cpf"),
        dataNascimento: this.getFieldValue("dataNascimento"),
        email: this.getFieldValue("email"),
        celular: this.getFieldValue("celular"),
        whatsapp: this.getFieldValue("whatsapp"),
        outroTelefone: this.getFieldValue("outroTelefone"),
      };
      console.log("✅ Incluído: Dados Pessoais");
    }

    // ===== ENDEREÇO =====
    if (this.isTabVisible("nav-item-endereco")) {
      payload.endereco = {
        logradouro: this.getFieldValue("endereco"),
        numero: this.getFieldValue("numero"),
        complemento: this.getFieldValue("complemento"),
        bairro: this.getFieldValue("bairro"),
        cidade: this.getFieldValue("cidade"),
        estado: this.getFieldValue("estado"),
        cep: this.getFieldValue("cep"),
      };
      console.log("✅ Incluído: Endereço");
    }

    // ===== PRODUTOS =====
    if (this.isTabVisible("nav-item-produtos")) {
      payload.produtos = this.extractProdutos();
      console.log("✅ Incluído: Produtos");
    }

    // ===== ADICIONAIS =====
    if (this.isTabVisible("nav-item-adicionais")) {
      payload.adicionais = this.extractAdicionais();
      console.log("✅ Incluído: Adicionais");
    }

    // ===== COBRANÇA =====
    if (this.isTabVisible("nav-item-cobranca")) {
      payload.cobranca = {
        nomeCartao: this.getFieldValue("nomeCartao"),
        numeroCartao: this.getFieldValue("numeroCartao"),
        validadeCartao: this.getFieldValue("validadeCartao"),
        cvvCartao: this.getFieldValue("cvvCartao"),
        parcelas: this.getFieldValue("parcelas"),
      };
      console.log("✅ Incluído: Cobrança");
    }

    // ===== AGENDAMENTO (SE FOR AGENDA) =====
    if (status === "agenda") {
      payload.agendamento = {
        tipo: this.getFieldValue("tipoAgendamento"),
        data: this.getFieldValue("agendamentoData"),
        hora: this.getFieldValue("agendamentoHora"),
        observacao: this.getFieldValue("agendamentoObservacao"),
      };
      console.log("✅ Incluído: Agendamento");
    }

    // ===== RECUSA (SE FOR RECUSA) =====
    if (status === "recusa") {
      payload.recusa = {
        motivo: this.getFieldValue("motivoContato"),
        tabulacao: this.getFieldValue("tabulacaoContato"),
        observacao: this.getFieldValue("recusaObservacao"),
      };
      console.log("✅ Incluído: Recusa");
    }

    console.log("📦 Payload construído:", payload);
    return payload;
  }

  // ===== MÉTODOS AUXILIARES PARA PAYLOAD =====
  getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value.trim() : "";
  }

  isTabVisible(tabId) {
    const tab = document.getElementById(tabId);
    return tab && !tab.classList.contains("d-none");
  }

  extractProdutos() {
    const produtos = [];

    // Buscar todos os selects de produto na aba
    const produtoSelects = document.querySelectorAll("#pills-produtos select");

    produtoSelects.forEach((select, index) => {
      if (select.value && select.value !== "" && select.value !== "Selecione") {
        produtos.push({
          id: index + 1,
          nome: select.options[select.selectedIndex].text,
          valor: select.value,
        });
      }
    });

    // Se não encontrou selects, buscar por inputs ou outros campos
    if (produtos.length === 0) {
      const produtoInputs = document.querySelectorAll(
        "#pills-produtos input[type='text']"
      );
      produtoInputs.forEach((input, index) => {
        if (input.value.trim()) {
          produtos.push({
            id: index + 1,
            nome: input.value.trim(),
            valor: input.dataset.valor || "0",
          });
        }
      });
    }

    return produtos.length > 0 ? produtos : null;
  }

  extractAdicionais() {
    const adicionais = {};

    // Buscar todos os inputs na aba adicionais
    const adicionalInputs = document.querySelectorAll(
      "#pills-adicionais input, #pills-adicionais select, #pills-adicionais textarea"
    );

    adicionalInputs.forEach((input) => {
      if (input.value && input.value.trim() !== "" && input.id) {
        adicionais[input.id] =
          input.type === "checkbox" ? input.checked : input.value.trim();
      }
    });

    return Object.keys(adicionais).length > 0 ? adicionais : null;
  }

  logAbasIncluidas(payload) {
    const abasIncluidas = ["Abordagem"];

    if (payload.dadosPessoais) abasIncluidas.push("Dados Pessoais");
    if (payload.endereco) abasIncluidas.push("Endereço");
    if (payload.produtos) abasIncluidas.push("Produtos");
    if (payload.adicionais) abasIncluidas.push("Adicionais");
    if (payload.cobranca) abasIncluidas.push("Cobrança");
    if (payload.agendamento) abasIncluidas.push("Agendamento");
    if (payload.recusa) abasIncluidas.push("Recusa");

    console.log("📋 Abas incluídas no JSON:", abasIncluidas.join(", "));
    console.log("📊 Total de seções enviadas:", abasIncluidas.length);
    console.log(
      "📦 Tamanho do payload:",
      JSON.stringify(payload).length,
      "caracteres"
    );
  }
  async sendToAPI(payload) {
    console.log("🚀 Enviando payload para API...");
    console.log("📡 URL:", APP_CONFIG.api.baseUrl);
    console.log("👤 Username:", APP_CONFIG.api.username);
    console.log("📦 Payload size:", JSON.stringify(payload).length, "bytes");

    const credentials = btoa(
      `${APP_CONFIG.api.username}:${APP_CONFIG.api.password}`
    );
    try {
      const response = await fetch(APP_CONFIG.api.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📨 Response Status:", response.status);
      console.log(
        "📨 Response Headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro da API:", errorText);
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }
      return response.json();
    } catch (error) {
      console.error("❌ Erro no envio:", error);
      // Log adicional para debug
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.error("💡 Possível problema de CORS ou conectividade");
      }

      throw error;
    }
  }

  // ===== MÉTODO DE DEBUG PARA PAYLOAD =====
  debugPayload(status = "sucesso") {
    console.log("🐛 === DEBUG PAYLOAD ===");

    try {
      const payload = this.construirPayload(status);
      console.log("✅ Payload construído com sucesso:");
      console.table(payload);

      // Verificar se payload tem dados essenciais
      if (!payload.abordagem || !payload.abordagem.nome) {
        console.warn("⚠️ Atenção: Dados de abordagem não encontrados");
      }

      // Mostrar tamanho do JSON
      const jsonString = JSON.stringify(payload);
      console.log("📏 Tamanho do JSON:", jsonString.length, "caracteres");

      // Validar JSON
      try {
        JSON.parse(jsonString);
        console.log("✅ JSON é válido");
      } catch (jsonError) {
        console.error("❌ JSON inválido:", jsonError);
      }

      return payload;
    } catch (error) {
      console.error("❌ Erro ao construir payload:", error);
      return null;
    }
  }

  // ===== UTILITÁRIOS DE UI =====
  showToastNotification(mensagem, tipo) {
    const toastContainer =
      document.getElementById("toastContainer") || this.createToastContainer();

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white bg-${
      tipo === "success" ? "success" : "danger"
    } border-0`;
    toast.setAttribute("role", "alert");
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-${
            tipo === "success" ? "check-circle" : "exclamation-circle"
          } me-2"></i>
          ${mensagem}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
    bsToast.show();

    toast.addEventListener("hidden.bs.toast", () => {
      toast.remove();
    });
  }

  createToastContainer() {
    const container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container position-fixed top-0 end-0 p-3";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
    return container;
  }

  showSweetAlertModal(mensagem, tipo = "info", titulo = null) {
    const config = {
      success: {
        icon: "success",
        iconColor: "#198754",
        title: titulo || "Sucesso!",
        confirmButtonColor: "#198754",
        timer: 3000,
      },
      error: {
        icon: "error",
        iconColor: "#dc3545",
        title: titulo || "Erro!",
        confirmButtonColor: "#dc3545",
        timer: null,
      },
      warning: {
        icon: "warning",
        iconColor: "#ffc107",
        title: titulo || "Atenção!",
        confirmButtonColor: "#ffc107",
        timer: 4000,
      },
      info: {
        icon: "info",
        iconColor: "#0dcaf0",
        title: titulo || "Informação",
        confirmButtonColor: "#0dcaf0",
        timer: 3000,
      },
    };

    const currentConfig = config[tipo] || config.info;

    Swal.fire({
      title: currentConfig.title,
      text: mensagem,
      icon: currentConfig.icon,
      iconColor: currentConfig.iconColor,
      confirmButtonText: "OK",
      confirmButtonColor: currentConfig.confirmButtonColor,
      timer: currentConfig.timer,
      timerProgressBar: currentConfig.timer ? true : false,
      showCloseButton: true,
      background:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#212529"
          : "#ffffff",
      color:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#ffffff"
          : "#212529",
      customClass: {
        popup: "swal-popup-custom",
        title: "swal-title-custom",
        content: "swal-content-custom",
        confirmButton: "swal-button-custom",
      },
    });
  }

  showSweetAlertConfirmation(titulo, mensagem) {
    return Swal.fire({
      title: titulo,
      text: mensagem,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sim, confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d",
      reverseButtons: true,
      background:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#212529"
          : "#ffffff",
      color:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#ffffff"
          : "#212529",
    });
  }

  showSweetAlertLoading(message = "Carregando...") {
    Swal.fire({
      title: message,
      text: "Por favor, aguarde...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
      background:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#212529"
          : "#ffffff",
      color:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#ffffff"
          : "#212529",
    });
  }

  hideSweetAlertLoading() {
    Swal.close();
  }

  preencheDadosIniciais() {
    const dados = {
      nome: "RICARDO CARRER",
      celular: "(11) 99999-9999",
    };

    Object.entries(dados).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input && !input.value) {
        input.value = value;
      }
    });
  }

  // ===== CHAT =====
  setupChat() {
    const chatInput = document.querySelector('#pills-chat input[type="text"]');
    const chatSendBtn = document.querySelector("#pills-chat button");

    if (chatSendBtn && chatInput) {
      chatSendBtn.addEventListener("click", () => this.sendChatMessage());
      chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendChatMessage();
        }
      });
    }

    this.initializeChatWelcome();
  }

  initializeChatWelcome() {
    setTimeout(() => {
      this.addChatMessage(
        "Olá! Sou o Assistente Virtual. Estou aqui para ajudá-lo durante o atendimento. Digite suas dúvidas ou solicite orientações.",
        "assistente",
        true
      );
    }, 1000);
  }

  async sendChatMessage() {
    const chatInput = document.querySelector('#pills-chat input[type="text"]');
    const message = chatInput.value.trim();
    if (!message || this.chatState.isWaitingResponse) return;

    this.setChatLoading(true);
    this.addChatMessage(message, "user");
    chatInput.value = "";

    try {
      const response = await this.sendToAssistenteAPI(message);

      setTimeout(() => {
        this.addChatMessage(response, "assistente");
        this.setChatLoading(false);
      }, 800);
    } catch (error) {
      console.error("Erro na API do assistente:", error);

      setTimeout(() => {
        this.addChatMessage(
          "Desculpe, não foi possível processar sua mensagem no momento. Tente novamente em alguns instantes.",
          "assistente",
          false,
          true
        );
        this.setChatLoading(false);
      }, 500);
    }
  }

  async sendToAssistenteAPI(message) {
    const clienteId = document.getElementById("clienteId")?.value || "unknown";
    const clienteNome =
      document.getElementById("nomeAbordagem")?.value ||
      document.getElementById("nome")?.value ||
      "Cliente";
    const clienteTelefone =
      document.getElementById("telefoneAbordagem")?.value ||
      document.getElementById("celular")?.value ||
      "";

    const payload = {
      messageId: clienteId,
      content: message,
      fromUserId: APP_CONFIG.agente.id,
      fromUserName: APP_CONFIG.agente.nome,
      context: {
        clienteNome: clienteNome,
        clienteTelefone: clienteTelefone,
        abaAtiva: this.getActiveTabName(),
        tempoAtendimento: this.formatTime(this.timers.atendimento),
      },
    };

    const credentials = btoa(
      `${APP_CONFIG.api.username}:${APP_CONFIG.api.password}`
    );

    const response = await fetch(APP_CONFIG.api.assistenteUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
        Accept: "application/json, text/plain",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const jsonResponse = await response.json();
      return (
        jsonResponse.message ||
        jsonResponse.content ||
        jsonResponse.text ||
        "Resposta recebida"
      );
    } else {
      return await response.text();
    }
  }

  addChatMessage(message, sender = "user", isWelcome = false, isError = false) {
    const chatBody = document.querySelector("#pills-chat .card-body");
    if (!chatBody) return;

    const emptyMessage = chatBody.querySelector(".text-muted");
    if (emptyMessage && emptyMessage.textContent.includes("Nenhuma mensagem")) {
      emptyMessage.remove();
    }

    const timestamp = new Date().toLocaleTimeString();
    this.chatState.messageCounter++;

    let messageClass = "";
    let alignment = "";
    let avatar = "";
    let senderName = "";

    switch (sender) {
      case "user":
        messageClass = "bg-primary text-white";
        alignment = "ms-auto text-end";
        avatar = '<i class="bi bi-person-circle fs-5 text-primary"></i>';
        senderName = APP_CONFIG.agente.nome;
        break;

      case "assistente":
        messageClass = isError
          ? "bg-danger text-white"
          : "bg-secondary text-white";
        alignment = "me-auto text-start";
        avatar = '<i class="bi bi-robot fs-5 text-success"></i>';
        senderName = "Assistente Virtual";
        break;
    }

    const messageHtml = `
      <div class="message-container mb-3 d-flex ${
        alignment === "ms-auto text-end" ? "flex-row-reverse" : "flex-row"
      } align-items-start" 
           data-message-id="${this.chatState.messageCounter}">
        <div class="avatar-container me-2 ms-2 flex-shrink-0">
          ${avatar}
        </div>
        <div class="message-content" style="max-width: 75%;">
          <div class="message-header mb-1">
            <small class="text-muted fw-bold">${senderName}</small>
            <small class="text-muted ms-2">${timestamp}</small>
          </div>
          <div class="message-bubble ${messageClass} p-2 rounded-3 shadow-sm">
            ${this.formatChatMessage(message)}
          </div>
        </div>
      </div>
    `;

    chatBody.insertAdjacentHTML("beforeend", messageHtml);
    this.scrollChatToBottom();

    if (sender === "assistente" && !isWelcome) {
      this.animateMessageAppearance();
    }
  }

  formatChatMessage(message) {
    return message
      .replace(/\n/g, "<br>")
      .replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" class="text-white text-decoration-underline">$1</a>'
      )
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
  }

  setChatLoading(loading) {
    const chatInput = document.querySelector('#pills-chat input[type="text"]');
    const chatSendBtn = document.querySelector("#pills-chat button");

    this.chatState.isWaitingResponse = loading;

    if (chatInput) {
      chatInput.disabled = loading;
      chatInput.placeholder = loading
        ? "Aguardando resposta..."
        : "Digite sua mensagem...";
    }

    if (chatSendBtn) {
      chatSendBtn.disabled = loading;
      chatSendBtn.innerHTML = loading
        ? '<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>'
        : '<i class="bi bi-send"></i>';
    }

    if (loading) {
      this.showTypingIndicator();
    } else {
      this.hideTypingIndicator();
    }
  }

  showTypingIndicator() {
    const chatBody = document.querySelector("#pills-chat .card-body");
    if (!chatBody) return;

    const typingHtml = `
      <div class="typing-indicator d-flex align-items-center mb-2" id="typingIndicator">
        <div class="avatar-container me-2 flex-shrink-0">
          <i class="bi bi-robot fs-5 text-success"></i>
        </div>
        <div class="typing-bubble bg-light text-dark p-2 rounded-3">
          <div class="typing-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <small class="text-muted ms-2">Assistente está digitando...</small>
        </div>
      </div>
    `;

    chatBody.insertAdjacentHTML("beforeend", typingHtml);
    this.scrollChatToBottom();
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById("typingIndicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  scrollChatToBottom() {
    const chatBody = document.querySelector("#pills-chat .card-body");
    if (chatBody) {
      chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  animateMessageAppearance() {
    const lastMessage = document.querySelector("[data-message-id]:last-child");
    if (lastMessage) {
      lastMessage.style.opacity = "0";
      lastMessage.style.transform = "translateY(20px)";

      setTimeout(() => {
        lastMessage.style.transition = "all 0.3s ease";
        lastMessage.style.opacity = "1";
        lastMessage.style.transform = "translateY(0)";
      }, 100);
    }
  }

  getActiveTabName() {
    const activeTab = document.querySelector("#pills-tab .nav-link.active");
    if (activeTab) {
      return activeTab.textContent.trim();
    }
    return "Desconhecido";
  }
}

// ===== CLASSE DE VALIDAÇÃO DE FORMULÁRIOS =====
class FormValidator {
  validate(status) {
    const validators = {
      sucesso: () => this.validateSucesso(),
      agenda: () => this.validateAgenda(),
      recusa: () => this.validateRecusa(),
    };

    return validators[status] ? validators[status]() : true;
  }

  validateSucesso() {
    const camposInvalidos = [];

    if (this.isTabVisible("nav-item-dados")) {
      this.validateDadosPessoais(camposInvalidos);
    }

    if (this.isTabVisible("nav-item-endereco")) {
      this.validateEndereco(camposInvalidos);
    }

    if (this.isTabVisible("nav-item-cobranca")) {
      this.validateCobranca(camposInvalidos);
    }

    if (camposInvalidos.length > 0) {
      this.showValidationError(camposInvalidos);
      return false;
    }

    return true;
  }

  validateAgenda() {
    const campos = ["agendamentoData", "agendamentoHora", "tipoAgendamento"];
    return this.validateRequiredFields(campos);
  }

  validateRecusa() {
    const campos = ["motivoContato", "tabulacaoContato"];
    return this.validateRequiredFields(campos);
  }

  isTabVisible(tabId) {
    const tab = document.getElementById(tabId);
    return tab && !tab.classList.contains("d-none");
  }

  validateDadosPessoais(errors) {
    const campos = ["nome", "cpf", "dataNascimento", "email"];
    campos.forEach((campo) => {
      const input = document.getElementById(campo);
      if (!input?.value?.trim()) {
        const labelText = this.getLabelText(input);
        errors.push(`${labelText} (Dados Pessoais)`);
        this.setFieldInvalid(input, "Este campo é obrigatório");
      } else {
        this.setFieldValid(input);
      }
    });
  }

  validateEndereco(errors) {
    const campos = ["endereco", "numero", "bairro", "cidade", "estado", "cep"];
    campos.forEach((campo) => {
      const input = document.getElementById(campo);
      if (!input?.value?.trim()) {
        const labelText = this.getLabelText(input);
        errors.push(`${labelText} (Endereço)`);
        this.setFieldInvalid(input, "Este campo é obrigatório");
      } else {
        this.setFieldValid(input);
      }
    });
  }

  validateCobranca(errors) {
    const campos = [
      "nomeCartao",
      "numeroCartao",
      "validadeCartao",
      "cvvCartao",
    ];
    campos.forEach((campo) => {
      const input = document.getElementById(campo);
      if (!input?.value?.trim()) {
        const labelText = this.getLabelText(input);
        errors.push(`${labelText} (Cobrança)`);
        this.setFieldInvalid(input, "Este campo é obrigatório");
      } else {
        this.setFieldValid(input);
      }
    });

    const parcelas = document.getElementById("parcelas");
    if (!parcelas?.value || parcelas.value === "Selecione") {
      const labelText = this.getLabelText(parcelas);
      errors.push(`${labelText} (Cobrança)`);
      this.setFieldInvalid(parcelas, "Selecione uma opção");
    } else {
      this.setFieldValid(parcelas);
    }
  }

  validateRequiredFields(campos) {
    const invalidos = [];

    campos.forEach((campo) => {
      const input = document.getElementById(campo);
      const isEmpty = !input?.value?.trim() || input.selectedIndex === 0;

      if (isEmpty) {
        const labelText = this.getLabelText(input);
        invalidos.push(labelText);
        this.setFieldInvalid(input, "Este campo é obrigatório");
      } else {
        this.setFieldValid(input);
      }
    });

    if (invalidos.length > 0) {
      this.showValidationError(invalidos);
      return false;
    }

    return true;
  }

  getLabelText(input) {
    if (!input) return "Campo desconhecido";

    let labelText = "";

    const associatedLabel = document.querySelector(`label[for="${input.id}"]`);
    if (associatedLabel) {
      labelText = this.cleanLabelText(associatedLabel.textContent);
    }

    if (!labelText) {
      const parentLabel = input.parentElement.querySelector("label");
      if (parentLabel) {
        labelText = this.cleanLabelText(parentLabel.textContent);
      }
    }

    if (!labelText) {
      const previousLabel = input.previousElementSibling;
      if (previousLabel && previousLabel.tagName === "LABEL") {
        labelText = this.cleanLabelText(previousLabel.textContent);
      }
    }

    if (!labelText && input.placeholder) {
      labelText = input.placeholder;
    }

    if (!labelText) {
      labelText = this.formatFieldName(input.id);
    }

    return labelText || "Campo obrigatório";
  }

  cleanLabelText(text) {
    if (!text) return "";

    return text
      .trim()
      .replace(/\*\s*$/, "")
      .replace(/[\:\*\!]\s*$/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  formatFieldName(id) {
    if (!id) return "Campo";

    const translations = {
      nome: "Nome",
      cpf: "CPF",
      dataNascimento: "Data de Nascimento",
      email: "E-mail",
      celular: "Celular",
      whatsapp: "WhatsApp",
      outroTelefone: "Outro Telefone",
      endereco: "Endereço",
      numero: "Número",
      complemento: "Complemento",
      bairro: "Bairro",
      cidade: "Cidade",
      estado: "Estado",
      cep: "CEP",
      nomeCartao: "Nome no Cartão",
      numeroCartao: "Número do Cartão",
      validadeCartao: "Validade do Cartão",
      cvvCartao: "CVV",
      parcelas: "Parcelamento",
      tipoAgendamento: "Tipo de Agendamento",
      agendamentoData: "Data do Agendamento",
      agendamentoHora: "Hora do Agendamento",
      agendamentoObservacao: "Observação do Agendamento",
      motivoContato: "Motivo do Contato",
      tabulacaoContato: "Tabulação do Contato",
      recusaObservacao: "Observação da Recusa",
    };

    if (translations[id]) {
      return translations[id];
    }

    return id
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  showValidationError(campos) {
    let message;

    if (Array.isArray(campos) && campos.length > 0) {
      const listaFormatada = campos.map((campo) => `• ${campo}`).join("<br>");

      message = `
        <div style="text-align: left; margin: 10px 0;">
          <p><strong>Os seguintes campos são obrigatórios:</strong></p>
          <div style="margin-left: 10px; color: var(--bs-danger);">
            ${listaFormatada}
          </div>
          <p style="margin-top: 15px; font-size: 14px; color: var(--bs-secondary-color);">
            <i class="bi bi-info-circle"></i> 
            Por favor, preencha todos os campos marcados e tente novamente.
          </p>
        </div>
      `;
    } else {
      message = `
        <div style="text-align: center;">
          <p>Alguns campos obrigatórios não foram preenchidos.</p>
          <p style="font-size: 14px; color: var(--bs-secondary-color);">
            Verifique o formulário e tente novamente.
          </p>
        </div>
      `;
    }

    Swal.fire({
      title: "Campos Obrigatórios",
      html: message,
      icon: "warning",
      confirmButtonText: "OK, vou corrigir",
      confirmButtonColor: "#ffc107",
      background:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#212529"
          : "#ffffff",
      color:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#ffffff"
          : "#212529",
      customClass: {
        popup: "swal-popup-custom",
        title: "swal-title-custom",
        htmlContainer: "swal-content-custom",
        confirmButton: "swal-button-custom",
      },
    });

    setTimeout(() => {
      const firstInvalidField = document.querySelector(".is-invalid");
      if (firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 500);
  }

  // Métodos serão injetados pela classe principal
  setFieldValid(field, message) {}
  setFieldInvalid(field, message) {}
  clearFieldValidation(field) {}
  createValidationFeedback(field, type, message) {}
}

// ===== CLASSE PAYLOAD BUILDER =====
class PayloadBuilder {
  build(status) {
    // Implementação do payload builder
    return {};
  }
}

// ✅ FUNÇÃO GLOBAL
window.buscarCep = function (cep) {
  if (window.fichaCliente) {
    return window.fichaCliente.buscarCep(cep);
  } else {
    console.warn("FichaCliente não está inicializada");
  }
};

window.debugFicha = function () {
  if (window.fichaCliente) {
    window.fichaCliente.debugCurrentState();
    window.fichaCliente.debugSucessoButton();
  }
};

window.testSucesso = function () {
  if (window.fichaCliente) {
    console.log("🧪 Testando sucesso manualmente...");
    window.fichaCliente.handleSucessoWithValidation();
  }
};

window.forceSucesso = function () {
  if (window.fichaCliente) {
    console.log("🔧 Forçando habilitação do sucesso...");
    window.fichaCliente.state.abordagemCompleta = true;
    window.fichaCliente.habilitarBotaoSucesso();
    console.log("✅ Sucesso forçado");
  }
};

// ===== FUNÇÃO GLOBAL PARA ENVIO DE DADOS =====
function enviarDados(status) {
  if (window.fichaCliente) {
    window.fichaCliente.enviarDados(status);
  }
}

// ===== INICIALIZAÇÃO ATUALIZADA =====
document.addEventListener("DOMContentLoaded", () => {
  // Adicionar estado no histórico
  window.history.pushState(null, null, window.location.pathname);

  // ✅ ATUALIZADO - Interceptar tentativas de sair da página
  window.addEventListener("beforeunload", (e) => {
    // Verificar se a instância existe e se é saída legítima
    if (window.fichaCliente && window.fichaCliente.state.isLegitimateExit) {
      return; // Permitir saída
    }

    const message = "Atendimento em andamento. Tem certeza que deseja sair?";
    e.preventDefault();
    e.returnValue = message;
    return message;
  });

  window.fichaCliente = new FichaCliente();
});

// ✅ ATUALIZADO - Bloquear F5 globalmente apenas se não for saída legítima
document.addEventListener("keydown", (e) => {
  if (e.key === "F5" || (e.ctrlKey && (e.key === "r" || e.key === "R"))) {
    // Verificar se é saída legítima
    if (window.fichaCliente && window.fichaCliente.state.isLegitimateExit) {
      return; // Permitir refresh se for saída legítima
    }

    e.preventDefault();
    console.log("🛡️ Refresh bloqueado globalmente");
    return false;
  }
});

// ===== FUNÇÕES GLOBAIS ATUALIZADAS =====
window.debugPayload = function (status = "sucesso") {
  if (window.fichaCliente) {
    return window.fichaCliente.debugPayload(status);
  }
};

window.testAPI = async function (status = "sucesso") {
  if (window.fichaCliente) {
    console.log("🧪 Testando API...");
    try {
      const payload = window.fichaCliente.construirPayload(status);
      console.log("📦 Payload construído:", payload);

      const response = await window.fichaCliente.sendToAPI(payload);
      console.log("✅ Teste da API bem-sucedido:", response);
      return response;
    } catch (error) {
      console.error("❌ Teste da API falhou:", error);
      return null;
    }
  }
};

// ✅ NOVA FUNÇÃO GLOBAL - Permitir redirecionamento
window.allowExit = function () {
  if (window.fichaCliente) {
    window.fichaCliente.allowLegitimateExit();
  }
};

// ✅ NOVA FUNÇÃO GLOBAL - Redirecionar sem bloqueios
window.redirectTo = function (url) {
  if (window.fichaCliente) {
    window.fichaCliente.redirectTo(url);
  } else {
    window.location.href = url;
  }
};
