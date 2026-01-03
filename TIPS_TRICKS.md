# 💡 Dicas e Truques do Plugin EmulatorJS

## 🎮 Dicas de Jogo

### Controles Melhores
- **Use teclado numérico** para mapeamento automático em alguns jogos
- **Conecte um gamepad USB** para melhor experiência
- **Configure personalizado** no menu do emulador se os padrões não funcionarem

### Performance Otimizada
```
Performance Máxima:
├─ Versão: stable (não nightly)
├─ Janela: Modo tela cheia (F11)
├─ Abas: Feche outras abas abertas
├─ Extensões: Desative extensões do navegador
└─ Cache: Limpe cache antes de jogar
```

### Salvar Progresso
```
Salvar Estado (Save State):
├─ Método 1: F1 (slot automático)
├─ Método 2: Menu emulador → Save State
├─ Método 3: Atalhos personalizados
└─ Armazenado: localStorage do navegador

Carregar Estado (Load State):
├─ Método 1: F5 (slot automático)
├─ Método 2: Menu emulador → Load State
└─ Atalho: Rápido e instantâneo
```

### Dicas por Sistema

#### 🔴 NES/Famicom
- Use versão `stable` do EmulatorJS
- Alguns jogos precisam de reset após carregar
- Padrão de cores pode variar (NTSC vs PAL)

#### 🟣 SNES
- Melhor performance que N64
- Save States funcionam muito bem
- Alguns jogos com chip especial podem ter problemas

#### 💙 Game Boy
- Funciona perfeitamente em dispositivos móveis
- Qualidade similar ao Game Boy Color
- Ótimo para jogar em qualquer lugar

#### 🟡 N64
- Mais pesado computacionalmente
- Use GPU dedicada se possível
- Alguns jogos com gráficos específicos podem ter artefatos

#### 🔵 Mega Drive
- Muito estável em todas as versões
- Suporte Bluetooth para controle
- Compatibilidade excelente

#### 🔴 PlayStation 1
- Precisa de BIOS (EmulatorJS tenta baixar)
- Mais pesado (requer navegador moderno)
- CUE sheets devem estar no mesmo diretório

#### 🟠 Arcade/MAME
- ZIPs devem conter os arquivos corretos
- Diferentes versões de MAME têm compatibilidades diferentes
- Joystick recomendado

## 🛠️ Dicas de Configuração

### Organização Ideal de Pastas

```
Estrutura Recomendada:
├── 0️⃣ Início Rápido (Favoritos)
│   ├── Mario.nes
│   ├── Zelda.smc
│   └── Sonic.gen
│
├── 1️⃣ Clássicos
│   ├── NES/
│   ├── SNES/
│   └── Genesis/
│
├── 2️⃣ Ação
│   └── [Seus jogos de ação]
│
├── 3️⃣ RPG
│   └── [Seus jogos de RPG]
│
└── 4️⃣ Outros
    └── [Arcade, Atari, etc]
```

**Vantagem**: Números ajudam na ordenação alfabética

### Nomeação Consistente

✅ Bom:
```
Super_Mario_Bros_3_(NES).nes
The_Legend_of_Zelda_ALTTP_(SNES).smc
Sonic_The_Hedgehog_2_(Genesis).gen
```

❌ Evitar:
```
SMB3.nes
ALTTP.smc
Sonic2.gen
```

**Razão**: Nomes descritivos tornam mais fácil encontrar jogos

## 📱 Dicas Mobile

### Otimizações para Smartphone

```
Para Melhor Experiência em Mobile:
├─ Vire a tela para paisagem
├─ Use navegador Chrome ou Firefox
├─ Desative extensões
├─ Feche outras abas
├─ Use WiFi em vez de dados
├─ Conecte headphone para melhor áudio
└─ Gamepad Bluetooth é opcional
```

### Configuração para Tablet

- Melhor suporte que smartphone
- Tela maior = melhor controle
- Considere usar suporte de tablet
- Teclado bluetooth opcional

## 🔧 Dicas de Troubleshooting

### "Jogo é muito lento"
```
Soluções:
1. Troque para versão 'stable' do EmulatorJS
2. Feche outras abas/aplicações
3. Aumente o zoom do navegador se ajuda
4. Tente desabilitar shaders
5. Use modo de compatibilidade
```

### "Áudio travando"
```
Soluções:
1. Diminua o volume
2. Aumente a qualidade de áudio (menu)
3. Troque de navegador
4. Reinicie o HFS
5. Limpe cache do navegador
```

### "Controles mapeados errado"
```
Soluções:
1. Configure no menu do emulador
2. Use atalhos de teclado conhecidos
3. Teste com gamepad
4. Verifique conflitos com navegador
5. Desative recursos do navegador
```

### "Erro 'CORS' ou 'Arquivo não encontrado'"
```
Soluções:
1. Verifique se HFS está servindo a pasta
2. Teste o caminho manualmente
3. Certifique-se do nome do arquivo (maiúsculas)
4. Recrie o arquivo ROM
5. Use caminho absoluto, não relativo
```

## 🎯 Guia de Atalhos Úteis

### Teclado Padrão

| Tecla | Ação |
|-------|------|
| Setas | Movimento |
| Z | A / Confirmar |
| X | B / Cancelar |
| C | X |
| V | Y |
| Enter | Start |
| Shift | Select |
| Espaço | Pause |
| F1 | Save State (slot 1) |
| F2-F9 | Save State (slots 2-9) |
| F5 | Load State (slot 1) |
| Ctrl+F5 | Load State (outro slot) |
| F | Tela cheia |
| S | Screenshot |

### Atalhos do Navegador

| Tecla | Ação |
|-------|------|
| F5 | Recarregar página |
| Ctrl+W | Fechar aba |
| Ctrl+T | Nova aba |
| F11 | Tela cheia |
| F12 | DevTools |
| Ctrl+Shift+Delete | Limpar cache |

## 📊 Comparação de Versões do EmulatorJS

| Feature | stable | latest | nightly |
|---------|--------|--------|---------|
| Estabilidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Recursos | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Novidade | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Recomendado | ✅ | ✓ | ✗ |

**Recomendação**: Use `stable` para jogo normal, `latest` para novos recursos

## 🎮 Guia por Jogador

### Casual (Quer jogar rápido)
```
Passos:
1. Copie plugin em .hfs/plugins/
2. Inicie HFS
3. Coloque ROMs em pasta
4. Clique em ROM
5. Selecione "Emular"
6. Jogue!

Configuração: Deixe todas as opções padrão
```

### Entusiasta (Quer tudo customizado)
```
Passos:
1. Organizar ROMs por sistema
2. Configurar plugin no painel admin
3. Testar diferentes versões do EmulatorJS
4. Customizar controles por jogo
5. Criar lista de favoritos

Configuração: Personalize cada opção
```

### Desenvolvedor (Quer estender)
```
Passos:
1. Clone o repositório
2. Configure link simbólico em .hfs/plugins/
3. Edite arquivos localmente
4. Teste em tempo real
5. Submeta melhorias

Referência: Veja DEVELOPMENT.md
```

## 🚀 Otimizações Avançadas

### Precarregar EmulatorJS
```javascript
// No console do navegador
// Carrega o script antes de jogar
HFS.loadScript('https://cdn.emulatorjs.org/stable/data/loader.js')
```

### Usar Cache de Navegador
```javascript
// IndexedDB para salvar estados
// Mais espaço que localStorage
// Suportado pelo EmulatorJS
```

### Service Workers
```javascript
// Se o HFS suportar, cache offline
// Melhora performance drasticamente
// Funciona sem internet
```

## 📚 Recursos Úteis

### Sites Relacionados
- [EmulatorJS Docs](https://emulatorjs.org/docs/)
- [RetroArch Cores](https://buildbot.libretro.com/)
- [No-Intro ROMs Info](https://www.no-intro.org/)
- [MAME ROMs Info](https://www.mamedev.org/)

### Comunidades
- Discord EmulatorJS
- Reddit r/emulation
- GitHub Discussions (HFS)

### Ferramentas Úteis
- **ROM Manager**: Organizador de ROMs
- **RetroFront**: Interface unificada
- **Mednafen**: Emulador standalone de referência

---

**Última atualização**: Janeiro 2026
**Dica**: Explore o menu do EmulatorJS para mais opções!
