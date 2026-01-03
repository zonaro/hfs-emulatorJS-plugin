# 📑 Índice do Plugin EmulatorJS para HFS

Bem-vindo! Este é um plugin completo para integrar o EmulatorJS com o HFS.

## 📂 Estrutura do Projeto

```
emulatorJS-plugin/
├── 📄 plugin.js              ← Backend do plugin (HFS)
├── 📁 public/
│   ├── 📄 emulator.js       ← Frontend/lógica do emulador
│   └── 📄 emulator.css      ← Estilos do emulador
├── 📄 package.json          ← Informações do pacote
├── 📄 README.md             ← Documentação completa
├── 📄 QUICK_START.md        ← Guia rápido de início
├── 📄 FOLDER_STRUCTURE.md   ← Como organizar ROMs
├── 📄 CONFIG_EXAMPLE.md     ← Exemplos de configuração
└── 📄 DEVELOPMENT.md        ← Desenvolvimento e troubleshooting
```

## 🚀 Começar Rapidamente

### 1. Instalação (2 minutos)
```bash
# Copie a pasta para plugins do HFS
cp -r emulatorJS-plugin ~/.hfs/plugins/

# Windows
Copy-Item -Path ".\emulatorJS-plugin" -Destination "$env:APPDATA\.hfs\plugins\" -Recurse
```

### 2. Reinicie HFS e pronto!
- O plugin aparecerá no painel admin
- Configure as opções básicas
- Comece a emular!

👉 **Leia [QUICK_START.md](QUICK_START.md) para instruções detalhadas**

## 📚 Documentação

| Arquivo | Propósito |
|---------|-----------|
| [README.md](README.md) | Documentação completa, features e requisitos |
| [QUICK_START.md](QUICK_START.md) | Guia passo-a-passo para começar |
| [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) | Como organizar suas ROMs e arquivos |
| [CONFIG_EXAMPLE.md](CONFIG_EXAMPLE.md) | Exemplos de configuração do plugin |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Desenvolvimento, debugging e troubleshooting |

## 🎮 Recursos

✅ **23+ sistemas suportados**
- Nintendo (NES, SNES, N64, Game Boy, DS, etc.)
- Sega (Genesis, Saturn, Game Gear, etc.)
- Atari (2600, 5200, 7800, Lynx, Jaguar)
- PlayStation, PSP, Arcade, Commodore, e mais!

✅ **Múltiplos modos**
- Modal integrado no HFS
- Abre em nova aba
- Menu de contexto com um clique

✅ **Altamente configurável**
- Ativar/desativar sistemas
- Escolher versão do EmulatorJS (stable, latest, nightly)
- Customizar UI

✅ **Sem dependências externas**
- Usa CDN do EmulatorJS
- Funciona completamente no navegador

## 🎯 Próximos Passos

1. **Novo ao plugin?** → Leia [QUICK_START.md](QUICK_START.md)
2. **Organizar ROMs?** → Consulte [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)
3. **Configurar?** → Veja [CONFIG_EXAMPLE.md](CONFIG_EXAMPLE.md)
4. **Desenvolvimento?** → Acesse [DEVELOPMENT.md](DEVELOPMENT.md)
5. **Precisa de ajuda?** → Verifique [README.md](README.md#-troubleshooting)

## ⚡ Funcionalidades Principais

### Jogar Imediatamente
```
1. Coloque ROMs em uma pasta do HFS
2. Clique com botão direito no arquivo
3. Selecione "Emular (Sistema)"
4. Jogue!
```

### Sistemas Suportados
```
Nintendo: NES, SNES, GB, GBC, GBA, N64, DS, VB
Sega: Genesis, Saturn, Game Gear, Master System, 32X
Atari: 2600, 5200, 7800, Lynx, Jaguar
Outros: PS1, PSP, Arcade, C64, Amiga, ColecoVision
```

### Configuração Simples
```
Admin Panel → EmulatorJS Plugin → Configure tudo via UI
Sem edição manual de arquivos necessária!
```

## 🔗 Links Úteis

- 🌐 [EmulatorJS Oficial](https://emulatorjs.org/)
- 📖 [Documentação EmulatorJS](https://emulatorjs.org/docs/)
- 💬 [Discord EmulatorJS](https://discord.gg/6akryGkETU)
- 🐙 [HFS GitHub](https://github.com/rejetto/hfs)

## 📝 Versão

**v1.0.0** - Janeiro 2026

## 📄 Licença

GPL-3.0 (Compatível com HFS)

---

## ❓ Dúvidas Frequentes

### P: Preciso de BIOS para jogar?
R: Alguns sistemas sim (PS1, Saturn). EmulatorJS tenta baixar automaticamente ou você pode adicionar.

### P: Posso jogar multiplayer online?
R: No momento, apenas local. Multiplayer online está planejado para futuras versões.

### P: Meus saves são sincronizados?
R: Sim, EmulatorJS salva no localStorage do navegador.

### P: Qual versão do EmulatorJS devo usar?
R: Use `stable` para confiabilidade máxima. `latest` tem recuros mais novos, `nightly` é experimental.

### P: Funciona em dispositivos móveis?
R: Sim, com suporte a touch e gamepad.

---

## 🚨 Precisa de Ajuda?

1. Verifique [DEVELOPMENT.md](DEVELOPMENT.md#-troubleshooting) para problemas comuns
2. Consulte [README.md](README.md) para documentação completa
3. Abra uma issue no repositório

**Pronto para jogar?** 🎮 Comece com [QUICK_START.md](QUICK_START.md)!
