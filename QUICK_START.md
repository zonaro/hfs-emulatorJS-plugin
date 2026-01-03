# Guia de Início Rápido

## 1️⃣ Instalação Rápida

### Windows
```bash
# Copie a pasta emulatorJS-plugin para:
# C:\Users\SEU_USUARIO\.hfs\plugins\

# Ou use este comando no PowerShell:
Copy-Item -Path ".\emulatorJS-plugin" -Destination "$env:APPDATA\.hfs\plugins\" -Recurse
```

### Linux/Mac
```bash
# Copie a pasta para:
# ~/.hfs/plugins/

cp -r emulatorJS-plugin ~/.hfs/plugins/
```

## 2️⃣ Verificar Instalação

1. Abra o painel de administração do HFS
2. Procure por "EmulatorJS" na lista de plugins
3. Verifique se está marcado como "Instalado"

## 3️⃣ Configurar o Plugin

1. Acesse **Painel Administrativo** → **Configuração**
2. Procure por **EmulatorJS Plugin**
3. Configure as opções:
   - ✅ **Ativar EmulatorJS**: Marque para ativar
   - 📦 **Versão**: Escolha `stable` (recomendado)
   - 🎮 **Mostrar botão no menu**: Marque para ver opção "Emular"
   - 📱 **UI incorporada**: Marque para abrir no modal

## 4️⃣ Adicionar ROMs

1. Crie uma pasta para suas ROMs (ex: `/games`)
2. Organize as ROMs por sistema:
   ```
   games/
   ├── nes/
   │   ├── game1.nes
   │   └── game2.nes
   ├── snes/
   │   ├── mario.smc
   │   └── sonic.snes
   └── n64/
       ├── zelda.z64
       └── mario.n64
   ```

## 5️⃣ Jogar

### Via Menu de Contexto
1. Navegue até a pasta com as ROMs
2. Clique com botão direito no arquivo
3. Selecione "Emular (Sistema)"
4. O jogo abrirá no emulador!

### Via Preview
1. Clique no arquivo ROM
2. No painel de preview, clique em "Abrir no Emulador"

## 🎮 Controles Padrão

Os controles variam por sistema, mas geralmente:

| Tecla | Função |
|-------|--------|
| Setas | Movimento |
| Z | Botão A / Confirmar |
| X | Botão B / Cancelar |
| Enter | Start |
| Shift | Select |
| Espaço | Pause |

Para controles personalizados, consulte as opções dentro do emulador.

## ⚙️ Dicas e Truques

### Para melhor performance
- Use a versão **stable** do EmulatorJS
- Feche outras abas/aplicações
- Limpe o cache do navegador se houver lag

### Para diferentes resoluções
- O emulador se adapta ao tamanho da tela
- Em celulares, vire a tela para modo paisagem

### Salvar progresso
- EmulatorJS salva automaticamente no navegador (localStorage)
- Use **Save State** dentro do emulador para salvar rápido
- Use **Load State** para carregar salvos

## 🆘 Problemas Comuns

### "Arquivo não é reconhecido"
- Certifique-se que a extensão está correta (`.nes`, `.snes`, etc.)
- Verifique se o tipo de arquivo é suportado

### "Emulador não abre"
- Verifique sua conexão com internet
- Tente recarregar a página (F5)
- Mude a versão do EmulatorJS nas configurações

### "Áudio não funciona"
- Verifique o volume do navegador
- Tente usar a versão `latest` ou `nightly`
- Consule as configurações de áudio dentro do emulador

### "Controles não respondem"
- Clique dentro da tela do emulador para ativar
- Configure os controles nas opções do emulador
- Use gamepad USB se disponível

## 📚 Documentação Completa

Para mais informações, consulte [README.md](README.md)

## 🔗 Links Úteis

- [EmulatorJS Oficial](https://emulatorjs.org/)
- [HFS GitHub](https://github.com/rejetto/hfs)
- [Documentação EmulatorJS](https://emulatorjs.org/docs/)

---

**Pronto para jogar!** 🎮
