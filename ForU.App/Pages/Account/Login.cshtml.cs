using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Linq;

namespace DefyIt.ForU.App.Pages.Account
{
    public class LoginModel : PageModel
    {
        [BindProperty]
        [Required(ErrorMessage = "Usuário é obrigatória")]
        [Display(Name = "Usuário")]
        [StringLength(11, ErrorMessage = "Usuário deve ter no máximo 11 caracteres")]
        public string Matricula { get; set; } = string.Empty;

        [BindProperty]
        [Required(ErrorMessage = "Senha é obrigatória")]
        [DataType(DataType.Password)]
        [Display(Name = "Senha")]
        public string Senha { get; set; } = string.Empty;

        public string ErrorMessage { get; set; } = string.Empty;

        public void OnGet()
        {
            // Limpar mensagens de erro ao carregar a página
            ErrorMessage = string.Empty;
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            // Limpar matrícula para validação (apenas números)
            string matriculaLimpa = new string(Matricula.Where(char.IsDigit).ToArray());

            // Validar matrícula
            if (!ValidarMatricula(matriculaLimpa))
            {
                ErrorMessage = "Matrícula inválida. Deve conter apenas números e ter até 11 dígitos.";
                return Page();
            }

            // Aqui você implementaria a lógica de autenticação real
            // Por exemplo: consultar banco de dados, verificar senha hash, etc.
            
            // EXEMPLO TEMPORÁRIO - substituir pela sua lógica de autenticação
            var dadosUsuario = await AutenticarUsuario(matriculaLimpa, Senha);
            if (dadosUsuario != null)
            {
                // Criar claims do usuário com informações completas
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, dadosUsuario.Value.nome),
                    new Claim(ClaimTypes.NameIdentifier, matriculaLimpa),
                    new Claim("Matricula", matriculaLimpa),
                    new Claim("Operacao", dadosUsuario.Value.operacao),
                    new Claim("Perfil", dadosUsuario.Value.perfil)
                };

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true, // Cookie persistente
                    ExpiresUtc = DateTimeOffset.UtcNow.AddHours(8) // Expira em 8 horas
                };

                // Fazer login (criar cookie de autenticação)
                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, 
                    new ClaimsPrincipal(claimsIdentity), authProperties);

                // Redirecionar para página principal
                return RedirectToPage("/Index");
            }
            else
            {
                ErrorMessage = "Usuário ou senha incorretos. Tente novamente.";
                return Page();
            }
        }

        private bool ValidarMatricula(string matricula)
        {
            // Verificar se é uma string válida
            if (string.IsNullOrEmpty(matricula))
                return false;

            // Verificar se tem até 11 dígitos
            if (matricula.Length > 11)
                return false;

            // Verificar se contém apenas números
            if (!matricula.All(char.IsDigit))
                return false;

            // Verificar se não é uma sequência inválida (todos os dígitos iguais)
            if (matricula.Length > 1 && matricula.All(c => c == matricula[0]))
                return false;

            return true;
        }

        private async Task<(string senha, string operacao, string nome, string perfil)?> AutenticarUsuario(string matricula, string senha)
        {
            // IMPLEMENTAÇÃO TEMPORÁRIA PARA DEMONSTRAÇÃO
            // Substitua esta lógica pela sua implementação real de autenticação
            
            // Simular delay de autenticação
            await Task.Delay(500);

            // Exemplo de usuários válidos para teste
            // Estrutura: cod_usuario => (senha, operacao, nome, perfil)
            var usuariosValidos = new Dictionary<string, (string senha, string operacao, string nome, string perfil)>
            {
                { "1", ("sap", "PicPay", "Ricardo Carrer", "Operador") },     
                { "2", ("sap", "PicPay", "Maria do Carmo", "Master") },   
                { "3", ("sap", "PicPay", "Jorge Almeida", "Supervisor") },    
                { "4", ("sap", "PicPay", "Pedro Silva", "Auditor") }    
            };

            if (usuariosValidos.TryGetValue(matricula, out var dadosUsuario) && dadosUsuario.senha == senha)
            {
                return dadosUsuario;
            }

            return null;
            
            /* 
            IMPLEMENTAÇÃO REAL SERIA ALGO COMO:
            
            // Buscar usuário no banco de dados
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Matricula == matricula);
            
            if (usuario == null)
                return null;
            
            // Verificar senha hash
            if (BCrypt.Net.BCrypt.Verify(senha, usuario.SenhaHash))
            {
                return (usuario.Senha, usuario.Operacao, usuario.Nome, usuario.Perfil);
            }
            
            return null;
            */
        }
    }
}