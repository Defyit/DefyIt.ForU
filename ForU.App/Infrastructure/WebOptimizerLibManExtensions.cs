using System.Text.Json;
using WebOptimizer;
using Microsoft.AspNetCore.Hosting;

namespace DefyIt.ForU.App.Infrastructure;

public static class WebOptimizerLibManExtensions
{
    /// <summary>
    /// Lê o libman.json e monta /bundles/app.css e /bundles/app.js automaticamente.
    /// </summary>
    public static void AddBundlesFromLibMan(
        this IAssetPipeline pipeline,
        IWebHostEnvironment env,
        string? libmanJsonPath = null,
        IEnumerable<string>? extraCss = null,
        IEnumerable<string>? extraJs = null,
        bool autoDiscoverMinified = true)
    {
        libmanJsonPath ??= Path.Combine(env.ContentRootPath, "libman.json");
        if (!File.Exists(libmanJsonPath)) return;

        using var doc = JsonDocument.Parse(File.ReadAllText(libmanJsonPath));
        if (!doc.RootElement.TryGetProperty("libraries", out var libraries)) return;

        var cssFiles = new List<string>();
        var jsFiles  = new List<string>();

        string ToWebPath(string absPath)
        {
            var root = Path.GetFullPath(env.WebRootPath).TrimEnd(Path.DirectorySeparatorChar);
            var abs  = Path.GetFullPath(absPath);
            var rel  = abs.Replace(root, "").Replace("\\", "/");
            return rel.StartsWith("/") ? rel : "/" + rel;
        }

        foreach (var lib in libraries.EnumerateArray())
        {
            var dest = lib.GetProperty("destination").GetString()!;
            // dest já costuma vir como "wwwroot/..." no libman. Mapeia corretamente:
            var destRelToWwwroot = dest.Replace("\\", "/")
                                       .Replace("wwwroot/", "", StringComparison.OrdinalIgnoreCase)
                                       .TrimStart('/', '\\');
            var destAbs = Path.Combine(env.WebRootPath, destRelToWwwroot);

            var explicitFiles = lib.TryGetProperty("files", out var filesProp)
                ? filesProp.EnumerateArray().Select(f => f.GetString()!).ToArray()
                : Array.Empty<string>();

            foreach (var rel in explicitFiles)
            {
                var abs = Path.Combine(destAbs, rel);
                if (!File.Exists(abs)) continue;

                if (abs.EndsWith(".css", StringComparison.OrdinalIgnoreCase))
                    cssFiles.Add(ToWebPath(abs));
                else if (abs.EndsWith(".js", StringComparison.OrdinalIgnoreCase))
                    jsFiles.Add(ToWebPath(abs));
            }

            if (autoDiscoverMinified && Directory.Exists(destAbs))
            {
                var declared = new HashSet<string>(explicitFiles.Select(f => f.Replace("\\", "/")), StringComparer.OrdinalIgnoreCase);

                foreach (var abs in Directory.EnumerateFiles(destAbs, "*.min.css", SearchOption.AllDirectories))
                {
                    var relFromDest = abs.Substring(destAbs.Length).TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                                         .Replace("\\", "/");
                    if (!declared.Contains(relFromDest))
                        cssFiles.Add(ToWebPath(abs));
                }

                foreach (var abs in Directory.EnumerateFiles(destAbs, "*.min.js", SearchOption.AllDirectories))
                {
                    var relFromDest = abs.Substring(destAbs.Length).TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                                         .Replace("\\", "/");
                    if (!declared.Contains(relFromDest))
                        jsFiles.Add(ToWebPath(abs));
                }
            }
        }

        if (extraCss != null)
            cssFiles.AddRange(extraCss.Where(p => File.Exists(Path.Combine(env.WebRootPath, p.TrimStart('/')))));
        if (extraJs != null)
            jsFiles.AddRange(extraJs.Where(p => File.Exists(Path.Combine(env.WebRootPath, p.TrimStart('/')))));

        cssFiles = cssFiles.Distinct().ToList();
        jsFiles  = jsFiles.Distinct().ToList();

        // Cria bundles com minificação baseada no ambiente
        if (cssFiles.Count > 0) 
        {
            var cssBundle = pipeline.AddCssBundle("/bundles/app.css", cssFiles.ToArray());
            if (env.IsProduction())
            {
                cssBundle.MinifyCss();
            }
        }
        
        if (jsFiles.Count > 0) 
        {
            var jsBundle = pipeline.AddJavaScriptBundle("/bundles/app.js", jsFiles.ToArray());
            if (env.IsProduction())
            {
                jsBundle.MinifyJavaScript();
            }
        }
    }
}
