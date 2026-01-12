# Script para baixar ícones do RetroArch Assets
# URL base do repositório GitHub
$baseUrl = "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png"
$destFolder = "S:\hfs-emulatorJS-plugin\dist\public\console-icons"

# Criar pasta de destino se não existir
if (-not (Test-Path $destFolder)) {
    New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
}

# Mapeamento de ícones do GitHub para o padrão do projeto
# Formato: @{origem = 'Nome do arquivo no GitHub (sem .png)'; destino = 'Nome final no projeto'}
$iconMappings = @(
    # Nintendo Systems
    @{origem = 'Nintendo - Nintendo 3DS'; destino = '3DS_-_Nintendo_-_Nintendo_3DS.png'}
    @{origem = 'Nintendo - GameCube'; destino = 'GC_-_Nintendo_-_GameCube.png'}
    @{origem = 'Nintendo - Nintendo Entertainment System'; destino = 'NES_-_Nintendo_-_Nintendo_Entertainment_System.png'}
    @{origem = 'Nintendo - Super Nintendo Entertainment System'; destino = 'SNES_-_Nintendo_-_Super_Nintendo_Entertainment_System.png'}
    @{origem = 'Nintendo - Nintendo 64'; destino = 'N64_-_Nintendo_-_Nintendo_64.png'}
    @{origem = 'Nintendo - Game Boy'; destino = 'GB_-_Nintendo_-_Game_Boy.png'}
    @{origem = 'Nintendo - Game Boy Color'; destino = 'GBC_-_Nintendo_-_Game_Boy_Color.png'}
    @{origem = 'Nintendo - Game Boy Advance'; destino = 'GBA_-_Nintendo_-_Game_Boy_Advance.png'}
    @{origem = 'Nintendo - Nintendo DS'; destino = 'NDS_-_Nintendo_-_Nintendo_DS.png'}
    @{origem = 'Nintendo - Virtual Boy'; destino = 'VB_-_Nintendo_-_Virtual_Boy.png'}
    @{origem = 'Nintendo - Wii'; destino = 'WII_-_Nintendo_-_Wii.png'}
    
    # Sega Systems
    @{origem = 'Sega - Mega Drive - Genesis'; destino = 'MD_-_Sega_-_Mega_Drive.png'}
    @{origem = 'Sega - Master System - Mark III'; destino = 'MS_-_Sega_-_Master_System.png'}
    @{origem = 'Sega - Game Gear'; destino = 'GG_-_Sega_-_Game_Gear.png'}
    @{origem = 'Sega - Mega-CD - Sega CD'; destino = 'SEGACD_-_Sega_-_Sega_CD.png'}
    @{origem = 'Sega - 32X'; destino = '32X_-_Sega_-_32X.png'}
    @{origem = 'Sega - Saturn'; destino = 'SAT_-_Sega_-_Saturn.png'}
    @{origem = 'Sega - Dreamcast'; destino = 'DC_-_Sega_-_Dreamcast.png'}
    
    # Sony Systems
    @{origem = 'Sony - PlayStation'; destino = 'PSX_-_Sony_-_PlayStation.png'}
    @{origem = 'Sony - PlayStation Portable'; destino = 'PSP_-_Sony_-_PlayStation_Portable.png'}
    @{origem = 'Sony - PlayStation 2'; destino = 'PS2_-_Sony_-_PlayStation_2.png'}
    @{origem = 'Sony - PlayStation 3'; destino = 'PS3_-_Sony_-_PlayStation_3.png'}
    @{origem = 'Sony - PlayStation 4'; destino = 'PS4_-_Sony_-_PlayStation_4.png'}
    @{origem = 'Sony - PlayStation Vita'; destino = 'PSVITA_-_Sony_-_PlayStation_Vita.png'}
    
    # Atari Systems
    @{origem = 'Atari - 2600'; destino = 'A2600_-_Atari_-_Atari_2600.png'}
    @{origem = 'Atari - 5200'; destino = 'A5200_-_Atari_-_Atari_5200.png'}
    @{origem = 'Atari - 7800'; destino = 'A7800_-_Atari_-_Atari_7800.png'}
    @{origem = 'Atari - Lynx'; destino = 'LYNX_-_Atari_-_Lynx.png'}
    @{origem = 'Atari - Jaguar'; destino = 'JAG_-_Atari_-_Jaguar.png'}
    @{origem = 'Atari - Jaguar CD'; destino = 'JAGCD_-_Atari_-_Jaguar_CD.png'}
    
    # Arcade
    @{origem = 'FBNeo - Arcade Games'; destino = 'ARC_-_FBNeo_-_Arcade.png'}
    @{origem = 'MAME'; destino = 'MAME_-_MAME_-_Arcade.png'}
    @{origem = 'MAME 2003'; destino = 'MAME2003_-_MAME_-_Arcade.png'}
    
    # Commodore
    @{origem = 'Commodore - 64'; destino = 'VICE64_-_Commodore_-_C64.png'}
    @{origem = 'Commodore - 128'; destino = 'VICE128_-_Commodore_-_C128.png'}
    @{origem = 'Commodore - Amiga'; destino = 'AMIGA_-_Commodore_-_Amiga.png'}
    @{origem = 'Commodore - VIC-20'; destino = 'VIC20_-_Commodore_-_VIC-20.png'}
    
    # Other Systems
    @{origem = 'The 3DO Company - 3DO'; destino = '3DO_-_Panasonic_-_3DO.png'}
    @{origem = 'Coleco - ColecoVision'; destino = 'COLECO_-_Coleco_-_ColecoVision.png'}
    @{origem = 'NEC - PC Engine - TurboGrafx 16'; destino = 'PCE_-_NEC_-_PC_Engine.png'}
    @{origem = 'NEC - PC-FX'; destino = 'PCFX_-_NEC_-_PC-FX.png'}
    @{origem = 'SNK - Neo Geo Pocket'; destino = 'NGP_-_SNK_-_Neo_Geo_Pocket.png'}
    @{origem = 'SNK - Neo Geo Pocket Color'; destino = 'NGPC_-_SNK_-_Neo_Geo_Pocket_Color.png'}
    @{origem = 'Bandai - WonderSwan'; destino = 'WS_-_Bandai_-_WonderSwan.png'}
    @{origem = 'Bandai - WonderSwan Color'; destino = 'WSC_-_Bandai_-_WonderSwan_Color.png'}
    @{origem = 'DOS'; destino = 'DOS_-_Microsoft_-_DOS.png'}
    @{origem = 'Microsoft - MSX'; destino = 'MSX_-_Microsoft_-_MSX.png'}
    @{origem = 'Microsoft - MSX2'; destino = 'MSX2_-_Microsoft_-_MSX2.png'}
    @{origem = 'Microsoft - Xbox'; destino = 'XBOX_-_Microsoft_-_Xbox.png'}
    @{origem = 'Microsoft - Xbox 360'; destino = 'XBOX360_-_Microsoft_-_Xbox_360.png'}
    @{origem = 'Microsoft - Xbox One'; destino = 'XBOXONE_-_Microsoft_-_Xbox_One.png'}
    @{origem = 'SNK - Neo Geo'; destino = 'NEOGEO_-_SNK_-_Neo_Geo.png'}
    @{origem = 'SNK - Neo Geo CD'; destino = 'NEOGEOCD_-_SNK_-_Neo_Geo_CD.png'}
    @{origem = 'Capcom - CP System I'; destino = 'CPS1_-_Capcom_-_CP_System_I.png'}
    @{origem = 'Capcom - CP System II'; destino = 'CPS2_-_Capcom_-_CP_System_II.png'}
    @{origem = 'Capcom - CP System III'; destino = 'CPS3_-_Capcom_-_CP_System_III.png'}
    @{origem = 'ScummVM'; destino = 'SCUMMVM_-_ScummVM.png'}
    @{origem = 'Nintendo - Pokemon Mini'; destino = 'POKEMINI_-_Nintendo_-_Pokemon_Mini.png'}
    @{origem = 'Nintendo - Satellaview'; destino = 'SATELLAVIEW_-_Nintendo_-_Satellaview.png'}
    @{origem = 'GCE - Vectrex'; destino = 'VECTREX_-_GCE_-_Vectrex.png'}
    @{origem = 'Sega - SG-1000'; destino = 'SG1000_-_Sega_-_SG-1000.png'}
    @{origem = 'Sega - PICO'; destino = 'PICO_-_Sega_-_PICO.png'}
    @{origem = 'NEC - PC-98'; destino = 'PC98_-_NEC_-_PC-98.png'}
    @{origem = 'Sharp - X68000'; destino = 'X68000_-_Sharp_-_X68000.png'}
    @{origem = 'Sinclair - ZX Spectrum'; destino = 'ZX_-_Sinclair_-_ZX_Spectrum.png'}
    @{origem = 'Amstrad - CPC'; destino = 'CPC_-_Amstrad_-_CPC.png'}
)

$totalIcons = $iconMappings.Count
$downloadedCount = 0
$skippedCount = 0
$errorCount = 0

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Download de Ícones RetroArch Assets" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total de ícones para baixar: $totalIcons" -ForegroundColor Yellow
Write-Host "Destino: $destFolder" -ForegroundColor Yellow
Write-Host ""

foreach ($mapping in $iconMappings) {
    $sourceFileName = "$($mapping.origem).png"
    $destFilePath = Join-Path $destFolder $mapping.destino
    $url = "$baseUrl/$([uri]::EscapeDataString($sourceFileName))"
    
    # Verificar se o arquivo já existe
    if (Test-Path $destFilePath) {
        Write-Host "[SKIP] $($mapping.destino) - já existe" -ForegroundColor DarkGray
        $skippedCount++
        continue
    }
    
    try {
        Write-Host "[DOWN] $($mapping.destino)..." -ForegroundColor Cyan -NoNewline
        
        # Baixar o arquivo
        Invoke-WebRequest -Uri $url -OutFile $destFilePath -ErrorAction Stop
        
        Write-Host " OK" -ForegroundColor Green
        $downloadedCount++
        
        # Pequeno delay para não sobrecarregar o servidor
        Start-Sleep -Milliseconds 100
    }
    catch {
        Write-Host " ERRO" -ForegroundColor Red
        Write-Host "  -> $($_.Exception.Message)" -ForegroundColor DarkRed
        $errorCount++
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Resumo do Download" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Baixados: $downloadedCount" -ForegroundColor Green
Write-Host "Ignorados (já existem): $skippedCount" -ForegroundColor Yellow
Write-Host "Erros: $errorCount" -ForegroundColor Red
Write-Host ""

if ($downloadedCount -gt 0) {
    Write-Host "Download concluído com sucesso!" -ForegroundColor Green
} elseif ($skippedCount -eq $totalIcons) {
    Write-Host "Todos os ícones já existem!" -ForegroundColor Yellow
} else {
    Write-Host "Processo concluído com alguns problemas." -ForegroundColor Yellow
}

Write-Host ""
