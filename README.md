# EmulatorJS Plugin para HFS

Um plugin para [HFS (HTTP File Server)](https://github.com/rejetto/hfs) que integra o [EmulatorJS](https://emulatorjs.org/) permitindo executar ROMs de diversos consoles retro diretamente no navegador.

## 🎮 Recursos

- ✅ Suporte para múltiplos sistemas (NES, SNES, Mega Drive, PlayStation, e mais)
- ✅ Integração transparente com HFS
- ✅ Interface modal integrada ou em nova aba
- ✅ Menu de contexto para abrir jogos
- ✅ Suporte para múltiplas versões do EmulatorJS (stable, latest, nightly)
- ✅ Configurável via painel de admin do HFS

## 🎯 Sistemas Suportados

### Nintendo
- NES/Famicom (`.nes`, `.fds`)
- SNES (`.snes`, `.smc`)
- Game Boy (`.gb`)
- Game Boy Color (`.gbc`)
- Game Boy Advance (`.gba`)
- Nintendo 64 (`.n64`, `.z64`)
- Nintendo DS (`.nds`)
- Virtual Boy (`.vb`)

### Sega
- Mega Drive (`.gen`, `.md`, `.smd`)
- Game Gear (`.gg`)
- Master System (`.sms`)
- Saturn (`.sat`)
- Sega 32X (`.32x`)

### Atari
- Atari 2600 (`.a26`)
- Atari 5200 (`.a52`)
- Atari 7800 (`.a78`)
- Lynx (`.lnx`)
- Jaguar (`.j64`)

### Outros
- PlayStation (`.cue`, `.cimg`)
- PlayStation Portable (`.pbp`)
- Arcade/MAME (`.zip`)
- Commodore 64 (`.prg`, `.d64`)
- Commodore Amiga (`.adf`)
- Commodore VIC-20 (`.tap`)
- ColecoVision (`.col`)

## 📦 Instalação

1. Copie a pasta `emulatorJS-plugin` para `.hfs/plugins/`
   ```bash
   cp -r emulatorJS-plugin ~/.hfs/plugins/
   ```

2. Reinicie o HFS ou aguarde o recarregamento automático

3. Acesse o painel de administração do HFS para configurar o plugin

## ⚙️ Configuração

No painel de administração do HFS, você encontrará as seguintes opções:

### Ativar EmulatorJS
- Ativa/desativa o plugin completamente

### Versão do EmulatorJS
- **Estável** (`stable`): Versão mais estável e testada
- **Última** (`latest`): Código mais recente com cores estáveis
- **Nightly** (`nightly`): Código e cores mais recentes (alpha)

### Sistemas Habilitados
- Lista de sistemas que podem ser emulados (configurável)

### Usar UI incorporada
- ✅ Abre o emulador em um modal dentro do HFS
- ❌ Abre o emulador em uma nova aba do navegador

### Mostrar botão no menu de arquivo
- Exibe a opção "Emular" no menu de contexto dos arquivos

## 🎮 Uso

### Via Menu de Contexto
1. Navegue até uma pasta contendo ROMs
2. Clique com botão direito em um arquivo ROM suportado
3. Selecione "Emular (Nome do Sistema)"

### Via Preview
1. Clique no arquivo ROM para ver o preview
2. Clique no botão "Abrir no Emulador"

## 🔧 Estrutura do Plugin

```
emulatorJS-plugin/
├── plugin.js          # Backend do plugin
├── public/
│   ├── emulator.js   # Frontend/lógica do emulador
│   └── emulator.css  # Estilos
└── README.md         # Este arquivo
```

## 📝 Extensões Suportadas

O plugin reconhece automaticamente as extensões de arquivo e mapeia para o sistema apropriado:

| Extensão | Sistema |
|----------|---------|
| .nes, .fds | NES |
| .snes, .smc | SNES |
| .gb, .gbc | Game Boy |
| .gba | Game Boy Advance |
| .n64, .z64 | Nintendo 64 |
| .nds | Nintendo DS |
| .gen, .md, .smd | Mega Drive |
| .gg | Game Gear |
| .cue, .cimg | PlayStation |
| .pbp | PSP |
| .zip | Arcade/MAME |
| .prg, .d64 | Commodore 64 |

## 🌐 CDN do EmulatorJS

O plugin usa o CDN oficial do EmulatorJS em `https://cdn.emulatorjs.org/`.

As versões disponíveis são:
- `stable`: Versão estável (padrão)
- `latest`: Último código com cores estáveis
- `nightly`: Código e cores mais recentes

## 📋 Requisitos

- HFS v0.51.0 ou superior (API v8.65+)
- Navegador moderno com suporte a WebGL
- Conexão com internet para carregar EmulatorJS via CDN

## 🐛 Troubleshooting

### Emulador não carrega
- Verifique sua conexão com a internet (EmulatorJS é carregado do CDN)
- Tente mudar a versão do EmulatorJS nas configurações
- Verifique o console do navegador (F12) para erros

### Arquivo não é reconhecido
- Certifique-se de que a extensão do arquivo está correta
- Verifique a lista de extensões suportadas acima

### Controles não funcionam
- Consulte a documentação do EmulatorJS em https://emulatorjs.org/docs/

## 📄 Licença

Este plugin segue a mesma licença do HFS.

## 🔗 Recursos Úteis

- [HFS - HTTP File Server](https://github.com/rejetto/hfs)
- [EmulatorJS](https://emulatorjs.org/)
- [Documentação de Plugins HFS](https://github.com/rejetto/hfs/blob/main/dev-plugins.md)

## 💬 Suporte

Para reportar problemas ou sugerir melhorias, abra uma issue no repositório.

## 🎉 Funcionalidades Futuras

- [ ] Suporte para saves sincronizados
- [ ] Interface de seleção de núcleos personalizados
- [ ] Suporte para multiplayer online
- [ ] Gestor de ROMs integrado
- [ ] Temas personalizados para o emulador

---

**Versão**: 1.0  
**Última atualização**: Janeiro 2026
