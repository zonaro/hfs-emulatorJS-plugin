# Script para copiar arquivos do /dist para o diretorio de plugins do HFS

$ErrorActionPreference = "Stop"

$sourceDir = Join-Path $PSScriptRoot "dist"
$destDir = "D:\hfs\plugins\emulatorJS-plugin"

Write-Host "=== Deploy EmulatorJS Plugin ===" -ForegroundColor Cyan
Write-Host "Origem: $sourceDir" -ForegroundColor Yellow
Write-Host "Destino: $destDir" -ForegroundColor Yellow

# Verifica se o diretorio de origem existe
if (-not (Test-Path $sourceDir)) {
    Write-Host "ERRO: Diretorio de origem nao encontrado: $sourceDir" -ForegroundColor Red
    exit 1
}

# Cria o diretorio de destino se nao existir
if (-not (Test-Path $destDir)) {
    Write-Host "Criando diretorio de destino..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

try { 
    # Copia os arquivos
    Write-Host "Copiando arquivos..." -ForegroundColor Yellow
    Copy-Item -Path "$sourceDir\*" -Destination $destDir -Recurse -Force
    
    Write-Host ""
    Write-Host "Deploy concluido com sucesso!" -ForegroundColor Green
    Write-Host "Plugin copiado para: $destDir" -ForegroundColor Green
    
}
catch {
    Write-Host ""
    Write-Host "ERRO durante o deploy: $_" -ForegroundColor Red
    exit 1
}
