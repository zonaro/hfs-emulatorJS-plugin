# 🤝 Suporte e Comunidade

## 📞 Canais de Suporte

### 1. Documentação Integrada
Começe sempre pelos documentos inclusos:

**Para Iniciantes**
- [QUICK_START.md](QUICK_START.md) - 5 minutos
- [README.md](README.md) - Completo
- [WELCOME.txt](WELCOME.txt) - Visual

**Para Problemas**
- [DEVELOPMENT.md](DEVELOPMENT.md#-troubleshooting) - Troubleshooting
- [TIPS_TRICKS.md](TIPS_TRICKS.md#-problemas-comuns) - Dicas
- [TESTING.md](TESTING.md) - Testes

**Para Configuração**
- [CONFIG_EXAMPLE.md](CONFIG_EXAMPLE.md) - Exemplos
- [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) - Organização
- [ARCHITECTURE.md](ARCHITECTURE.md) - Técnico

### 2. Console do Navegador (DevTools)
```javascript
// Abra com F12 e procure:

// Verifique configuração
HFS.getPluginConfig()

// Verifique se EmulatorJS carregou
window.EJS

// Verifique mapeamento
console.log('Sistema detectado:', systemInfo)

// Procure por erros
// (vermelho = erro, amarelo = aviso)
```

### 3. Comunidades Relacionadas

**EmulatorJS**
- 🌐 [Site Oficial](https://emulatorjs.org/)
- 📚 [Documentação](https://emulatorjs.org/docs/)
- 💬 [Discord](https://discord.gg/6akryGkETU)
- 🐙 [GitHub](https://github.com/EmulatorJS/EmulatorJS)

**HFS**
- 🐙 [GitHub](https://github.com/rejetto/hfs)
- 📖 [Dev Guide](https://github.com/rejetto/hfs/blob/main/dev-plugins.md)
- 💬 [Discussions](https://github.com/rejetto/hfs/discussions)
- 📋 [Issues](https://github.com/rejetto/hfs/issues)

**Emulação em Geral**
- 🎮 [Reddit r/emulation](https://reddit.com/r/emulation)
- 🎮 [RetroArch](https://www.retroarch.com/)
- 🎮 [MAME Project](https://www.mamedev.org/)

---

## ❓ FAQ - Perguntas Frequentes

### Instalação

**P: Onde coloco a pasta do plugin?**
A: Em `~/.hfs/plugins/` (Linux/Mac) ou `%APPDATA%\.hfs\plugins\` (Windows)

**P: O plugin aparece como desinstalar?**
A: Sim, se não aparecer, verifique:
1. Se `plugin.js` existe na raiz
2. Se HFS foi reiniciado
3. Limpe cache do navegador

**P: Preciso de mais alguma dependência?**
A: Não, o plugin é auto-suficiente!

### Uso

**P: Como adiciono uma nova extensão?**
A: Edite `SYSTEM_MAP` em `plugin.js` e `emulator.js`

**P: Posso bloquear alguns sistemas?**
A: Sim, na configuração do admin

**P: Como mudo a versão do EmulatorJS?**
A: Admin → Configuração → "Versão do EmulatorJS"

### Problemas

**P: Emulador não abre**
A: Veja [DEVELOPMENT.md#-troubleshooting](DEVELOPMENT.md#-troubleshooting)

**P: Áudio não funciona**
A: Verifique volume, tente outra versão do EmulatorJS

**P: Jogo é muito lento**
A: Use versão `stable`, feche outras abas

**P: Extensão não é reconhecida**
A: Verifique a lista em [README.md](README.md#-extensões-suportadas)

---

## 🐛 Reportando Problemas

### Informações Úteis

Ao reportar um problema, inclua:

```
1. Versão do HFS
   └─ Admin → Sobre → Versão

2. Sistema Operacional
   └─ Windows 10, Linux Ubuntu 20.04, Mac OS 12

3. Navegador e Versão
   └─ Chrome 120, Firefox 121, Safari 17

4. Arquivo ROM testado
   └─ Nome: mario.nes
   └─ Tamanho: 40 KB
   └─ Origem: ROM legal

5. Passos para reproduzir
   └─ 1. Coloquei ROM em /games/
   └─ 2. Cliquei em "Emular"
   └─ 3. Jogo não apareceu

6. Erro no Console (F12)
   └─ Copie a mensagem de erro

7. O que você esperava
   └─ Jogo deveria renderizar

8. O que aconteceu
   └─ Tela ficou em branco
```

### Onde Reportar

**Para bugs do plugin:**
1. Verifique se é problema do plugin (não EmulatorJS)
2. Leia [DEVELOPMENT.md#-troubleshooting](DEVELOPMENT.md#-troubleshooting)
3. Teste com versão stable do EmulatorJS
4. Se persistir, abra issue no repositório do plugin

**Para problemas do EmulatorJS:**
→ [GitHub Issues EmulatorJS](https://github.com/EmulatorJS/EmulatorJS/issues)

**Para problemas do HFS:**
→ [GitHub Issues HFS](https://github.com/rejetto/hfs/issues)

---

## 💡 Dicas para Auto-Resolução

### Antes de Reportar, Tente:

1. **Limpar Cache**
   ```
   Ctrl+Shift+Delete → Limpar tudo → OK
   ```

2. **Reiniciar HFS**
   ```bash
   # Encerre HFS completamente
   # Aguarde 5 segundos
   # Reinicie HFS
   ```

3. **Testar Outra ROM**
   ```
   ROM1 não funciona?
   → Teste ROM2
   → Se ROM2 funciona, problema é a ROM1
   ```

4. **Trocar Versão EmulatorJS**
   ```
   stable → latest → nightly (ou vice-versa)
   ```

5. **Desabilitar Extensões**
   ```
   Navegador: Ctrl+Shift+A → Desabilite extensões
   ```

6. **Testar Navegador Diferente**
   ```
   Chrome problema? → Teste Firefox
   ```

7. **Verificar Console**
   ```
   F12 → Console → Procure por erros (vermelho)
   ```

---

## 📚 Leitura Recomendada

### Ordem de Leitura por Nível

**Iniciante**
1. [WELCOME.txt](WELCOME.txt) - 30 seg
2. [QUICK_START.md](QUICK_START.md) - 5 min
3. [TIPS_TRICKS.md](TIPS_TRICKS.md) - 15 min

**Intermediário**
1. [README.md](README.md) - 10 min
2. [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) - 10 min
3. [CONFIG_EXAMPLE.md](CONFIG_EXAMPLE.md) - 5 min

**Avançado**
1. [ARCHITECTURE.md](ARCHITECTURE.md) - 15 min
2. [DEVELOPMENT.md](DEVELOPMENT.md) - 20 min
3. [Código fonte] - conforme necessário

---

## 🎓 Aprendendo EmulatorJS

Se quiser aprender mais sobre EmulatorJS:

1. **Documentação Oficial**
   - Visite https://emulatorjs.org/docs/

2. **YouTube Tutorials**
   - Procure "EmulatorJS tutorial"

3. **Exemplos**
   - https://emulatorjs.org/ (demo)

4. **GitHub**
   - https://github.com/EmulatorJS/EmulatorJS/

---

## 💬 Comunidade

### Participar

**Discord EmulatorJS**
- Junte-se ao servidor
- Faça perguntas
- Compartilhe suas coleções
- Ajude outros usuários

**Reddit r/emulation**
- Perguntas sobre emulação
- Discussões sobre ROMs
- Recomendações

**HFS Discussions**
- Perguntas sobre HFS
- Sugestões de plugin
- Colaboração

---

## 🔄 Mantendo Atualizado

### Verificar Atualizações

```
EmulatorJS:
1. Verifique versão no seu plugin
2. Visite https://emulatorjs.org/docs/
3. Veja release notes
4. Se novo, mude versão: latest → nightly

HFS:
1. Admin → Sobre
2. Clique em "Verificar atualizações"
3. Se houver, atualize

Plugin:
1. Verifique seu repositório
2. Se houver update, reimporte
```

---

## 🚀 Melhorando o Plugin

### Contribuir

Se quer melhorar o plugin:

1. **Fork no GitHub**
   - Clone o repositório

2. **Faça mudanças**
   - Edit em ambiente local
   - Teste completamente

3. **Submeta Pull Request**
   - Descreva suas mudanças
   - Reference issues relacionadas

4. **Aguarde review**
   - Trabalhe com maintainers
   - Faça ajustes se necessário

---

## 📊 Estatísticas de Uso

Se quiser saber como muitos usam:

- Baixe contador de GitHub
- Verifique releases
- Leia discussions
- Acompanhe issues

---

## 🎁 Agradecimentos

### Créditos

- **HFS** - HTTP File Server excelente
- **EmulatorJS** - Emulador fantástico
- **RetroArch** - Cores de emulação
- **Comunidade** - Suporte e feedback

---

## 📝 Notas Finais

### Lembre-se

✅ **Sempre leia a documentação primeiro**
- 90% dos problemas estão documentados

✅ **Use o DevTools (F12)**
- Fornece pistas valiosas

✅ **Teste uma coisa de cada vez**
- Facilita localizar o problema

✅ **Seja específico ao reportar**
- Inclua contexto e passos

✅ **Respeite a comunidade**
- Seja educado, ajude outros

---

## 🎊 Conclusão

Você tem suporte completo através de:
- 📖 Documentação detalhada incluída
- 🌐 Comunidades online ativas
- 💬 Canais Discord/Reddit
- 🐙 GitHub para colaboração
- 📚 Muitos tutoriais disponíveis

**Não hesite em pedir ajuda!**

---

**Data**: 3 de janeiro de 2026
**Versão**: 1.0.0
**Status**: Suporte Completo Disponível
