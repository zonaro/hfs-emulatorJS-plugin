# 🔄 Fluxo de Funcionamento do Plugin

## Arquitetura do Plugin

```
┌─────────────────────────────────────────────────────────────────┐
│                      HFS (HTTP File Server)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐          ┌───────────────────────┐   │
│  │    Backend (Node.js)  │          │   Frontend (Browser)   │   │
│  │                       │          │                        │   │
│  │  ┌────────────────┐  │          │  ┌──────────────────┐ │   │
│  │  │  plugin.js     │  │◄────────►│  │  emulator.js     │ │   │
│  │  │                │  │          │  │                  │ │   │
│  │  │ • Configuração │  │          │  │ • Menu de arquivo│ │   │
│  │  │ • API          │  │          │  │ • File Show      │ │   │
│  │  │ • Eventos      │  │          │  │ • Preview        │ │   │
│  │  └────────────────┘  │          │  └──────────────────┘ │   │
│  │                       │          │                        │   │
│  └──────────────────────┘          └───────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Carrega
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              EmulatorJS (CDN)                                    │
│              https://cdn.emulatorjs.org/                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • 23+ Emuladores (NES, SNES, PS1, etc)                │   │
│  │  • Loader.js (gerenciador de cores)                    │   │
│  │  • Cores do MAME, Libretro                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Uso - Jogar um Jogo

```
1. USUÁRIO CLICA EM UMA ROM
   ├─ Clique duplo ou menu "Emular"
   └─ Arquivo: game.nes

        ▼

2. PLUGIN DETECTA O ARQUIVO
   ├─ Extensão: .nes
   ├─ Sistema mapeado: NES
   ├─ Nome amigável: "NES/Famicom"
   └─ Configuração: Permitido?

        ▼

3. ABRE INTERFACE DO EMULADOR
   ├─ Modal integrado (useEmbeddedUI=true)
   │  └─ Dialog dentro do HFS
   │     └─ iframe carregando emulador
   │
   └─ Nova aba (useEmbeddedUI=false)
      └─ window.open()
         └─ Página HTML dedicada

        ▼

4. CARREGA EMULADORJS
   ├─ Script: loader.js do CDN
   ├─ Versão: stable/latest/nightly
   ├─ Core: nes (núcleo de emulação)
   └─ Path: https://cdn.emulatorjs.org/stable/data/

        ▼

5. CARREGA A ROM
   ├─ URL: /path/to/game.nes
   ├─ Método: Fetch do arquivo
   ├─ Processamento: Core processa bytes
   └─ Resultado: Jogo pronto para jogar

        ▼

6. RENDERIZA TELA DO JOGO
   ├─ Canvas HTML5
   ├─ WebGL (aceleração)
   ├─ Audio Web Audio API
   └─ Input: Teclado/Gamepad

        ▼

7. USUÁRIO JOGA
   ├─ Controles mapeados
   ├─ Estados salvos (localStorage)
   ├─ Pausar/Resumir
   └─ Menu do emulador

        ▼

8. SAIR DO EMULADOR
   ├─ Fechar modal/aba
   ├─ Salvo automático
   └─ Volta ao HFS
```

## Estrutura de Dados - DirEntry

Quando um arquivo é clicado, HFS passa um `DirEntry`:

```javascript
{
  name: "Super Mario Bros.nes",      // Nome completo do arquivo
  uri: "/games/nes/Super Mario Bros.nes",  // URI completa
  isFolder: false,                    // É pasta?
  ext: "nes",                         // Extensão (sem ponto)
  s: 40976,                           // Tamanho em bytes
  m: 2026-01-03T10:30:00Z,           // Data modificação
  cantOpen: false,                    // Pode abrir?
  
  // Métodos disponíveis:
  getNext(),           // Próximo arquivo
  getPrevious(),       // Arquivo anterior
  getNextFiltered(),   // Próximo (filtrado)
  getPreviousFiltered(),  // Anterior (filtrado)
  getDefaultIcon()     // Ícone padrão
}
```

## Ciclo de Vida do Plugin

```
┌─────────────────────┐
│   HFS Inicia        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Plugin encontrado em .hfs/plugins/  │
│     emulatorJS-plugin/               │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Carrega plugin.js                  │
│  ├─ Verifica apiRequired (8.23+)   │
│  ├─ Executa exports.init()          │
│  └─ Registra event handlers         │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Carrega Frontend                   │
│  ├─ frontend_js (emulator.js)       │
│  ├─ frontend_css (emulator.css)     │
│  └─ Registra hooks HFS.onEvent      │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Plugin Ativo                       │
│  ├─ Aguarda interação do usuário    │
│  └─ Pronto para emular              │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┬──────────────┐
    │             │              │
    ▼             ▼              ▼
┌────────────┐┌────────────┐┌──────────────┐
│Clique no   ││Clique menu ││File Show     │
│arquivo     ││contexto    ││(preview)     │
└────────────┘└────────────┘└──────────────┘
    │             │              │
    └─────────────┼──────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │ Emulador Abre       │
        │ (Modal ou nova aba) │
        └─────────────────────┘
```

## Fluxo de Comunicação Backend ↔ Frontend

```
Backend (Node.js - plugin.js)          Frontend (Browser - emulator.js)
         │                                      │
         │                                      │
         │  exports.init()                      │
         ├──────────────────────────────────────>
         │  Registra handlers e config         │
         │                                      │
         │<─ frontend_js/frontend_css ─────────┤
         │  Carrega arquivos                    │
         │                                      │
         │  Config salvo em config.yaml         │
         │<─ HFS.getPluginConfig() ────────────┤
         │  Lê configuração                     │
         │                                      │
         │  Usuário clica arquivo               │
         │<─ HFS.onEvent('fileMenu') ──────────┤
         │  Adiciona menu "Emular"              │
         │                                      │
         │                                      │  Usuário seleciona "Emular"
         │<─ openGameInEmulator() ─────────────┤
         │  Processa ROM                        │
         │                                      │
         │                                      │  ↓ Carrega EmulatorJS
         │                                      │  HFS.loadScript(cdnUrl)
         │                                      │  ↓ Cria iframe/modal
         │  API Calls (se necessário)           │  ↓ Renderiza jogo
         │<────────────────────────────────────>│
         │                                      │
         │  Usuário sai                         │
         │<─ Modal fecha ─────────────────────┤
         │  Volta ao HFS                        │
```

## Estados do Plugin

```
┌─────────────────────────────────────────────────────────────┐
│                   ESTADOS DO PLUGIN                          │
└─────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │  DESATIVADO  │  (enabled: false)
  │              │
  │ Usuário não   │
  │ vê opção      │
  │ "Emular"      │
  └──────────────┘
         │
         │ Admin ativa plugin
         ▼
  ┌──────────────┐
  │   ATIVO      │  (enabled: true)
  │              │
  │ Menu "Emular" │
  │ aparece       │
  └──────────────┘
         │
         ▼ Clique em ROM
  ┌──────────────┐
  │   EMULANDO   │  (Jogo executando)
  │              │
  │ Modal/aba     │
  │ com jogo      │
  └──────────────┘
         │
         │ Fecha modal/aba
         ▼
  ┌──────────────┐
  │   ATIVO      │  (Volta ao HFS)
  │              │
  └──────────────┘

Transições adicionais:
├─ Erro ao carregar → Exibe mensagem
├─ Arquivo inválido → Toast de erro
└─ Sucesso → Emulator inicia normalmente
```

## Mapeamento Arquivo → Sistema

```
USUÁRIO TEM: Super_Mario.nes

1. EXTRAIR EXTENSÃO
   ├─ filename: "Super_Mario.nes"
   ├─ split('.') → ["Super_Mario", "nes"]
   ├─ pop() → "nes"
   ├─ toLowerCase() → "nes"
   └─ ext = "nes"

        ▼

2. CONSULTAR MAPA (SYSTEM_MAP)
   ├─ Procurar "nes" em SYSTEM_MAP
   ├─ Encontrou: { system: 'nes', name: 'NES/Famicom' }
   └─ systemInfo = resultado

        ▼

3. VERIFICAR SUPORTE
   ├─ Sistema suportado? SIM
   ├─ Habilitado? SIM
   ├─ Arquivo válido? SIM
   └─ Prosseguir com emulação

        ▼

4. ABRIR EMULADOR
   ├─ Criar página HTML
   ├─ Carregar EmulatorJS (CDN)
   ├─ Configurar sistema: 'nes'
   ├─ Apontar para ROM: "Super_Mario.nes"
   └─ Renderizar no canvas
```

---

**Diagrama Atualizado**: Janeiro 2026
