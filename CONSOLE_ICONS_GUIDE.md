# Guia de Ícones de Console

## Funcionalidade

O plugin EmulatorJS agora suporta ícones personalizados para pastas que contêm ROMs de jogos. Quando uma pasta contém arquivos compatíveis com emuladores, administradores podem definir um ícone de console para identificar visualmente o tipo de jogos naquela pasta.

## Como Usar

### 1. Detecção Automática

O plugin detecta automaticamente pastas que contêm arquivos de ROM compatíveis (NES, SNES, N64, PlayStation, etc.). Quando uma pasta é detectada como contendo ROMs, um item de menu adicional aparece para administradores.

### 2. Definir Ícone de Console

1. Navegue até uma pasta que contenha ROMs
2. Clique com o botão direito na pasta (ou use o menu de contexto)
3. Selecione **"Set Console Icon"**
4. Escolha o ícone apropriado da galeria
5. O ícone será aplicado imediatamente

### 3. Ícones Disponíveis

Os ícones incluídos são do projeto [RetroArch Assets](https://github.com/libretro/retroarch-assets) e incluem:

- Nintendo Entertainment System (NES)
- Super Nintendo (SNES)
- Nintendo 64
- Game Boy Advance
- Nintendo DS
- Sony PlayStation
- Sega Mega Drive / Genesis
- Sega Saturn
- Sega Game Gear
- Sega Master System
- Atari 2600
- Arcade / MAME

## Detalhes Técnicos

### Armazenamento

- Ícones ficam em: `plugins/emulatorJS-plugin/public/console-icons/`
- Mapeamentos pasta → ícone ficam em: `plugins/emulatorJS-plugin/folder-icons/icon-mappings.json`

### Estrutura do Mapeamento

```json
{
  "/path/to/nes/games": "Nintendo - Nintendo Entertainment System.png",
  "/path/to/snes/games": "Nintendo - Super Nintendo Entertainment System.png"
}
```

### APIs Disponíveis

#### Backend (customRest)

- **`getAvailableIcons()`**: Lista todos os ícones disponíveis
- **`setFolderIcon({ folderPath, iconName })`**: Define ícone para uma pasta
- **`getFolderIcon({ folderPath })`**: Obtém ícone de uma pasta

#### Frontend

- **`folderHasCompatibleRoms(folderUri)`**: Verifica se pasta tem ROMs
- **`openIconSelectionModal(folderEntry)`**: Abre modal de seleção

## Adicionar Novos Ícones

Para adicionar novos ícones de console:

1. Baixe ícones PNG do repositório RetroArch Assets
2. Coloque-os em: `dist/public/console-icons/`
3. Execute o deploy
4. Os novos ícones aparecerão automaticamente no seletor

Exemplo de download via PowerShell:

```powershell
$baseUrl = 'https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/'
$icon = 'Sega - Dreamcast.png'
$destPath = 's:\hfs-emulatorJS-plugin\dist\public\console-icons'
Invoke-WebRequest -Uri ($baseUrl + [uri]::EscapeDataString($icon)) -OutFile (Join-Path $destPath $icon)
```

## Requisitos

- Permissões de administrador no HFS
- Plugin EmulatorJS versão 2+
- Pasta deve conter pelo menos um arquivo ROM compatível

## Comportamento

- **Detecção**: Automática ao abrir menu de contexto
- **Aplicação**: Instantânea após seleção
- **Persistência**: Mapeamentos são salvos permanentemente
- **Remoção**: Atualmente não há opção de remover (planejado para próxima versão)

## Solução de Problemas

### Ícone não aparece

1. Verifique se você é administrador
2. Confirme que a pasta contém ROMs compatíveis
3. Recarregue a página (F5)
4. Verifique logs do console do navegador

### Modal não abre

1. Verifique permissões de administrador
2. Confirme que há ícones em `console-icons/`
3. Verifique console do navegador por erros

### Ícones não listados

1. Confirme que os arquivos PNG estão em `dist/public/console-icons/`
2. Execute o deploy novamente
3. Reinicie o HFS se necessário

## Melhorias Futuras

- [ ] Opção para remover ícone customizado
- [ ] Upload de ícones personalizados
- [ ] Detecção automática de console por maioria de ROMs
- [ ] Pré-visualização do ícone ao passar o mouse
- [ ] Gerenciamento em lote de ícones
