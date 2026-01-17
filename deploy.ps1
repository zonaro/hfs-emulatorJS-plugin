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

# Remove a pasta 'public' do destino, se existir
$publicDir = Join-Path $destDir "public"
if (Test-Path $publicDir) {
    Write-Host "Removendo pasta 'public' do destino..." -ForegroundColor Yellow
    Remove-Item -Path $publicDir -Recurse -Force
}

try { 
    # Copia os arquivos
    Write-Host "Copiando arquivos..." -ForegroundColor Yellow
    Copy-Item -Path "$sourceDir\*" -Destination $destDir -Recurse -Force
    
    Write-Host ""
    Write-Host "Deploy concluido com sucesso!" -ForegroundColor Green
    Write-Host "Plugin copiado para: $destDir" -ForegroundColor Green
    Write-Host ""

    # Lista os arquivos e pastas do destino
    Write-Host "Arquivos no destino:" -ForegroundColor Cyan
    Get-ChildItem -Recurse -Force $destDir | Select-Object FullName
    
}
catch {
    Write-Host ""
    Write-Host "ERRO durante o deploy: $_" -ForegroundColor Red
    exit 1
}

