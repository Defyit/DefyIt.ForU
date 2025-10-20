using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace DefyIt.ForU.App.Pages.Account
{
    [Authorize] // Só permite acesso para usuários autenticados
    public class PerfilModel : PageModel
    {
        public void OnGet()
        {
            // A página automaticamente exibe as informações do usuário autenticado
            // através dos Claims armazenados no cookie de autenticação
        }
    }
}