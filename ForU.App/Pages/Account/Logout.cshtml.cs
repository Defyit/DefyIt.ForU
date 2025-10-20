using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace DefyIt.ForU.App.Pages.Account
{
    public class LogoutModel : PageModel
    {
        public async Task<IActionResult> OnGetAsync()
        {
            // Fazer logout (remover cookie de autenticação)
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            
            // Redirecionar para página de login
            return RedirectToPage("/Account/Login");
        }

        public async Task<IActionResult> OnPostAsync()
        {
            // Fazer logout (remover cookie de autenticação)
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            
            // Redirecionar para página de login
            return RedirectToPage("/Account/Login");
        }
    }
}