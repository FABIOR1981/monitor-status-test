#!/usr/bin/env pwsh
<#
    Script: apply-vscode-config.ps1
    Copies files from VSC_extensions into the repo root (overwrites existing files only if confirmed).
    Usage: Open PowerShell from repo root and run: `./VSC_scripts/apply-vscode-config.ps1`.
#>

param(
    [switch]$Force
)

$srcDir = Join-Path -Path (Get-Location) -ChildPath "VSC_extensions"
if (-not (Test-Path $srcDir)) {
    Write-Host "VSC_extensions directory not found at $srcDir" -ForegroundColor Red
    return
}

$filesToCopy = @(
    ".eslintrc.json",
    ".prettierrc",
    ".eslintignore",
    "extensions.json",
    "settings.json"
)

foreach ($file in $filesToCopy) {
    $srcPath = Join-Path $srcDir $file
    if (-not (Test-Path $srcPath)) { continue }
    $destName = $file -replace '^extensions.json$','.vscode/extensions.json' -replace '^settings.json$','.vscode/settings.json'
    $destPath = Join-Path (Get-Location) $destName

    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }

    if ((Test-Path $destPath) -and -not $Force) {
        $choice = Read-Host "File '$destPath' already exists. Overwrite? (Y/N)"
        if ($choice -notmatch '^[Yy]') {
            Write-Host "Skipped $destPath"
            continue
        }
    }
    Copy-Item -Path $srcPath -Destination $destPath -Force
    Write-Host "Copied $srcPath -> $destPath"
}

Write-Host "VSC configuration files applied." -ForegroundColor Green
