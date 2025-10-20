document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("themeToggle");
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const currentTheme = savedTheme || systemTheme;

  htmlElement.setAttribute("data-bs-theme", currentTheme);

  function toggleTheme() {
    const currentTheme = htmlElement.getAttribute("data-bs-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    htmlElement.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    window.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: { theme: newTheme },
      })
    );
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function (e) {
      if (!localStorage.getItem("theme")) {
        const newTheme = e.matches ? "dark" : "light";
        htmlElement.setAttribute("data-bs-theme", newTheme);
        window.dispatchEvent(
          new CustomEvent("themeChanged", {
            detail: { theme: newTheme },
          })
        );
      }
    });
});

// Sistema de Dropdown do Discador
document.addEventListener("DOMContentLoaded", function () {
  const discadorItems = document.querySelectorAll("[data-action]");

  // Adicionar event listeners para os itens do dropdown
  discadorItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      const action = this.getAttribute("data-action");

      // Executar ação baseada na seleção
      switch (action) {
        case "iniciar":
          console.log("Iniciar discador");
          // Aqui vai a lógica para iniciar o discador
          break;
        case "pausar":
          console.log("Pausar discador");
          // Aqui vai a lógica para pausar o discador
          break;
        case "desconectar":
          console.log("Desconectar discador");
          // Aqui vai a lógica para desconectar o discador
          break;
      }

      // Trigger para outros componentes que dependem da ação do discador
      window.dispatchEvent(
        new CustomEvent("discadorAction", {
          detail: { action: action },
        })
      );
    });
  });
});
