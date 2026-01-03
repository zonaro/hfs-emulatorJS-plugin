# 🔍 Checklist de Verificação - EmulatorJS Embutido

## ✅ Arquivos Instalados

Verifique que estes arquivos/pastas existem:

- [ ] `d:\hfs\plugins\emulatorJS-plugin\public\emulatorjs-data\loader.js`
- [ ] `d:\hfs\plugins\emulatorJS-plugin\public\emulatorjs-data\cores\` (com 187 arquivos .data)
- [ ] `d:\hfs\plugins\emulatorJS-plugin\public\emulatorjs-data\compression\`
- [ ] `d:\hfs\plugins\emulatorJS-plugin\public\emulatorjs-data\localization\`
- [ ] `d:\hfs\plugins\emulatorJS-plugin\public\emulatorjs-data\src\`

## ✅ Código Atualizado

- [ ] `plugin.js` - Middleware adicionado para servir `/emulatorjs-data/`
- [ ] `emulator_page.html` - `EJS_pathtodata` configurado como `/emulatorjs-data/`

## 🧪 Teste Rápido no PowerShell

Execute este comando para verificar que os arquivos estão no lugar:

```powershell
# Verificar loader.js
Test-Path "d:\hfs\plugins\emulatorJS-plugin\public\emulatorjs-data\loader.js"
# Deve retornar: True

# Contar cores
(Get-ChildItem "d:\hfs\plugins\emulatorJS-plugin\public\emulatorjs-data\cores" -Filter "*.data").Count
# Deve retornar: 187

# Tamanho total
$size = (Get-ChildItem "d:\hfs\plugins\emulatorJS-plugin\public\emulatorjs-data" -Recurse | Measure-Object -Property Length -Sum).Sum
[math]::Round($size / 1MB, 2)
# Deve retornar: ~284 MB
```

## 🌐 Teste no Navegador

Depois de reiniciar o HFS:

1. **Teste de acesso ao loader.js:**
   - Abra: `http://localhost:porta/emulatorjs-data/loader.js`
   - Deve mostrar o código JavaScript do loader

2. **Teste de acesso aos cores:**
   - Abra: `http://localhost:porta/emulatorjs-data/cores/fceumm-wasm.data`
   - Deve fazer download do arquivo (binário)

3. **Teste com ROM:**
   - Navegue até um arquivo `.nes` ou `.gb`
   - Clique no menu do arquivo (⋮)
   - Selecione "🎮 Jogar"
   - O emulador deve abrir e carregar o jogo

## 🐛 Troubleshooting

### Erro: Cannot find emulatorjs-data
**Solução:** Reinicie o servidor HFS após a instalação

### Erro: 404 ao carregar loader.js
**Solução:** Verifique que o middleware foi adicionado corretamente em plugin.js

### Erro: ROM não carrega
**Solução:** 
- Verifique se a extensão do arquivo está em SYSTEM_MAP
- Veja o console do navegador (F12) para erros específicos
- Confirme que o arquivo ROM é válido

### Emulador abre mas tela preta
**Solução:**
- Alguns cores precisam de BIOS (PlayStation, Saturn, etc.)
- Verifique a documentação do EmulatorJS sobre BIOS necessárias

## 📊 Status dos Componentes

| Componente | Status | Tamanho |
|------------|--------|---------|
| loader.js | ✅ | ~500 KB |
| Cores (187 arquivos) | ✅ | ~280 MB |
| Compression | ✅ | ~1 MB |
| Localization | ✅ | <1 MB |
| Source | ✅ | ~2 MB |

## 🎯 Conclusão

Se todos os itens acima estiverem OK, o plugin está 100% funcional offline!

**Versão:** 1.0 - Embutido Local  
**Data:** 3 de janeiro de 2026  
**Fonte:** https://github.com/EmulatorJS/EmulatorJS
