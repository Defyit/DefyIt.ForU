//using JavaScriptEngineSwitcher.Extensions.MsDependencyInjection;
//using JavaScriptEngineSwitcher.Jint;

using WebOptimizer;
using DefyIt.ForU.App.Infrastructure;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

// builder.Services.AddJsEngineSwitcher(o =>
// {
//     o.AllowCurrentProperty = false;
//     o.DefaultEngineName = JintJsEngine.EngineName;
// }).AddJint();

builder.Services.AddWebOptimizer(pipeline =>
{
    

    pipeline.AddBundlesFromLibMan(
        builder.Environment,                               // passa o IWebHostEnvironment
        Path.Combine(builder.Environment.ContentRootPath, "libman.json"), // caminho do libman.json
        extraCss: new[] { "/css/app.css" },              // seus arquivos locais (opcional)
        extraJs:  new[] 
        { 
            "/js/app.js", 
            "/js/olos-integration.js",
            "/js/olos.js"
        },                // seus arquivos locais (opcional)
        autoDiscoverMinified: true                        // também pega *.min.css/js se não listados
    );
    
    // pipeline.AddScssBundle(
    //     "/bundles/bootstrap-custom.css",          // Saída exposta
    //     "scss/custom.scss"               // Fonte relativa ao wwwroot
    // );
   
    // OPÇÃO EXTRA: Minificar arquivos individuais sempre
    // pipeline.AddCssBundle("/css/custom.min.css", "/css/custom.css").MinifyCss();
    // pipeline.AddJavaScriptBundle("/js/custom.min.js", "/js/custom.js").MinifyJavaScript();
    
    // OPÇÃO EXTRA: Minificar com configurações personalizadas
    // pipeline.AddCssBundle("/css/styles.min.css", "/css/*.css")
    //     .MinifyCss(new NUglify.Css.CssSettings 
    //     { 
    //         CommentMode = NUglify.Css.CssComment.None 
    //     });
}, options => {
    // Habilita suporte para Tag Helpers asp-append-version
    options.EnableTagHelperBundling = true;
});

builder.Services.AddRazorPages();

// Configuração de autenticação
builder.Services.AddAuthentication("Cookies")
    .AddCookie("Cookies", options =>
    {
    options.LoginPath = "/Account/Login";
    options.LogoutPath = "/Account/Logout";
        options.AccessDeniedPath = "/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromHours(8); // 8 horas
        options.SlidingExpiration = true;
    });

builder.Services.AddAuthorization();


// Add services to the container.
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseWebOptimizer();

app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
