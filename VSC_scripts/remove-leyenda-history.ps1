#!/usr/bin/env pwsh
<#
    Script de ayuda para eliminar `js/leyenda_i18n_core.js` del historial Git.
    Este script **NO** realizará cambios destructivos sin confirmación.
    Uso: Ejecutar en la raíz del repo. Requiere `git` y `git-filter-repo` o `bfg` para borrar historial.
#>

param(
    [string]$targetFile = "js/leyenda_i18n_core.js",
    [switch]$Force
)

function Ensure-CleanWorkingTree {
    $status = git status --porcelain
    if ($status) {
        Write-Host "El árbol de trabajo no está limpio. Por favor, commitea o stash tus cambios antes de continuar." -ForegroundColor Yellow
        return $false
    }
    return $true
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git no encontrado. Instala git antes de continuar." -ForegroundColor Red
    exit 1
}

if (-not (Ensure-CleanWorkingTree)) { exit 1 }

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "En branch: $branch"

if (-not $Force) {
    $confirm = Read-Host "Este script prepara comandos para borrar HISTORY. Continúo? (Y/N)"
    if ($confirm -notmatch '^[Yy]') { Write-Host "Abortado"; exit 0 }
}

Write-Host "Creando backup de branch en 'backup/remove-leyenda-backup'..."
git checkout -b backup/remove-leyenda-backup
git push -u origin backup/remove-leyenda-backup
git checkout $branch

if (Get-Command git-filter-repo -ErrorAction SilentlyContinue) {
    Write-Host "Ejecutando git-filter-repo para eliminar $targetFile del historial (solo si confirma)."
    $cmd = "git filter-repo --invert-paths --path $targetFile"
    Write-Host "Comando: $cmd"
    if ($Force -or (Read-Host 'Ejecutar ahora (Y/N)?') -match '^[Yy]') { Invoke-Expression $cmd }
} else {
    Write-Host "git-filter-repo no encontrado. Puedes instalarlo y ejecutar la siguiente instrucción manualmente:" -ForegroundColor Yellow
    Write-Host "  git filter-repo --invert-paths --path $targetFile"
    Write-Host "Alternativa (BFG): git clone --mirror <repo> && bfg --delete-files $targetFile && git reflog expire --expire=now --all && git gc --prune=now --aggressive" -ForegroundColor Yellow
}

Write-Host "Notas:
 - Después de reescribir history, deberás forzar push: git push origin --force --all
 - Informa a colaboradores y haz backup de tus ramas remotas antes de forzar push." -ForegroundColor Cyan
