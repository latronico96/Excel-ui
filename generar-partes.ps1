
$ErrorActionPreference = "Stop"

# Ejecutar desde la raíz del proyecto Excel-ui.
$Root = (Get-Location).Path
$OutputDir = Join-Path $Root "review-parts"
$MaxChars = 25000

$Files = @(
    "package.json",
    "prisma7.config.ts",
    "vitest.config.ts",
    "tsconfig.json",
    "eslint.config.mjs",
    ".eslintrc.json",
    "prisma/schema.prisma",
    "server/services/workspace-permissions.ts",
    "server/services/workspace.service.ts",
    "server/services/movimientos.service.ts",
    "app/api/movimientos/route.ts",
    "app/api/espacios/route.ts",
    "app/api/espacios/activo/route.ts",
    "app/api/configuracion/route.ts",
    "app/api/medios-pago/route.ts",
    "app/api/tipos-gasto/route.ts",
    "app/api/gastos-mensuales/route.ts",
    "tests/finance.test.ts",
    "tests/movimientos.save.test.ts",
    "tests/movimientos.update.test.ts",
    "tests/movimientos.delete.test.ts"
)

# Agregar otros tests existentes, sin duplicar los anteriores.
if (Test-Path (Join-Path $Root "tests")) {
    Get-ChildItem (Join-Path $Root "tests") -File -Recurse |
        Where-Object {
            $_.Extension -in @(".ts", ".tsx", ".js", ".jsx")
        } |
        ForEach-Object {
            $relative = $_.FullName.Substring($Root.Length).TrimStart('\', '/')
            if ($Files -notcontains $relative) {
                $Files += $relative
            }
        }
}

# Limpiar solamente los archivos generados por este script.
if (Test-Path $OutputDir) {
    Remove-Item (Join-Path $OutputDir "parte-*.txt") `
        -Force -ErrorAction SilentlyContinue
} else {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$Parts = [System.Collections.Generic.List[string]]::new()
$CurrentPart = ""
$PartNumber = 1

foreach ($RelativePath in $Files) {
    $FullPath = Join-Path $Root $RelativePath

    if (-not (Test-Path $FullPath -PathType Leaf)) {
        continue
    }

    # Nunca incluir archivos de entorno ni credenciales.
    $name = [IO.Path]::GetFileName($RelativePath)
    if ($name -match '^\.env($|\.)' -or
        $name -match '(^|\.)(pem|key|p12|pfx)$') {
        continue
    }

    $Content = Get-Content -LiteralPath $FullPath -Raw

    # Enmascarar valores de variables que parezcan secretos.
    $Content = [regex]::Replace(
        $Content,
        '(?im)^(\s*(?:DATABASE_URL|DIRECT_URL|NEXTAUTH_SECRET|AUTH_SECRET|API_KEY|ACCESS_TOKEN|SECRET_KEY|PASSWORD|TOKEN)\s*=\s*).+$',
        '$1[REDACTED]'
    )

    $Block = "`r`n" + ("=" * 72) +
        "`r`nARCHIVO: $RelativePath`r`n" +
        ("=" * 72) + "`r`n" + $Content + "`r`n"

    # Si un archivo es demasiado grande, dividir su contenido.
    if ($Block.Length -gt $MaxChars) {
        if ($CurrentPart.Length -gt 0) {
            $Parts.Add($CurrentPart)
            $CurrentPart = ""
        }

        $ChunkSize = $MaxChars - 500
        for ($i = 0; $i -lt $Block.Length; $i += $ChunkSize) {
            $end = [Math]::Min($i + $ChunkSize, $Block.Length)
            $chunk = $Block.Substring($i, $end - $i)
            $Parts.Add("ARCHIVO GRANDE; FRAGMENTO DESDE CARACTER $i`r`n$chunk")
        }
        continue
    }

    if (($CurrentPart.Length + $Block.Length) -gt $MaxChars) {
        $Parts.Add($CurrentPart)
        $CurrentPart = ""
    }

    $CurrentPart += $Block
}

if ($CurrentPart.Length -gt 0) {
    $Parts.Add($CurrentPart)
}

for ($i = 0; $i -lt $Parts.Count; $i++) {
    $FileName = "parte-{0:D2}.txt" -f ($i + 1)
    $Path = Join-Path $OutputDir $FileName

    Set-Content -LiteralPath $Path -Value $Parts[$i] -Encoding UTF8
    Write-Host "Generado: $Path"
}

Write-Host ""
Write-Host "Total de partes: $($Parts.Count)"
Write-Host "Carpeta: $OutputDir"
Write-Host "Revisa los archivos antes de compartirlos."
