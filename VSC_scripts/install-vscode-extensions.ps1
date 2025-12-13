#!/usr/bin/env pwsh
<#
    Script to install recommended VS Code extensions listed in .vscode/extensions.json
    Usage: Open PowerShell and run `./VSC_scripts/install-vscode-extensions.ps1` from repo root.
    Add `-ApplyConfig` to copy config files from `VSC_extensions` to the repo root.
#>

param(
    [string]$extensionsFile = ".vscode/extensions.json",
    [switch]$ApplyConfig
)

if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
    Write-Host "VS Code 'code' CLI not found. Please install it from VS Code: Command Palette -> 'Install code in PATH'" -ForegroundColor Yellow
    return
}

if (-not (Test-Path $extensionsFile)) {
    Write-Host "Could not find $extensionsFile" -ForegroundColor Red
    return
}

$json = Get-Content $extensionsFile -Raw | ConvertFrom-Json

foreach ($ext in $json.recommendations) {
    Write-Host "Installing extension: $ext"
    code --install-extension $ext --force
}

Write-Host "Installed extensions complete." -ForegroundColor Green

if ($ApplyConfig) {
    $applyScript = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'apply-vscode-config.ps1'
    if (Test-Path $applyScript) {
        Write-Host "Applying VS Code config copies from VSC_extensions..."
        & $applyScript -Force
    } else {
        Write-Host "apply-vscode-config.ps1 not found; cannot apply config files." -ForegroundColor Yellow
    }
}
