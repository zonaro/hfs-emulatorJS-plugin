# Desenvolvimento e Troubleshooting

## 🔧 Desenvolvimento Local

### Configurar ambiente de desenvolvimento

1. Clone o repositório do plugin:
```bash
git clone https://github.com/seu-usuario/hfs-emulatorjs-plugin.git
cd hfs-emulatorjs-plugin
```

2. Crie um link simbólico na pasta de plugins do HFS:

**Windows (PowerShell como Admin)**:
```powershell
New-Item -ItemType SymbolicLink -Path "C:\Users\SEU_USUARIO\.hfs\plugins\emulatorJS-plugin" -Target "$PWD\dist"
```

**Linux/Mac**:
```bash
ln -s $PWD/dist ~/.hfs/plugins/emulatorJS-plugin
```

3. Reinicie o HFS ou aguarde o recarregamento automático

4. As mudanças serão refletidas em tempo real!

## 🐛 Troubleshooting

### Problema: Plugin não aparece no painel admin

**Solução**:
1. Verifique se a pasta está em `.hfs/plugins/`
2. Certifique-se de que existe um arquivo `plugin.js` na raiz
3. Reinicie completamente o HFS
4. Limpe o cache do navegador (Ctrl+Shift+Delete)

### Problema: EmulatorJS não carrega

**Possíveis causas**:
- Sem conexão com internet (CDN não acessível)
- Bloqueio de CORS do navegador
- Versão incomtapível do EmulatorJS

**Solução**:
```javascript
// Verifique o console (F12) para erros
console.log('EmulatorJS URL:', window.EJS_pathtodata)

// Tente trocar a versão nas configurações
// stable → latest → nightly
```

### Problema: Arquivo não é reconhecido

**Debug**:
1. Abra o DevTools (F12)
2. Verifique a extensão do arquivo:
```javascript
const filename = "game.nes"
const ext = filename.split('.').pop().toLowerCase()
console.log('Extensão:', ext)
```

3. Verifique se está no mapeamento `SYSTEM_MAP`

**Solução**:
Adicione a extensão no arquivo `public/emulator.js`:
```javascript
const SYSTEM_MAP = {
  'sua_ext': { system: 'seu_sistema', name: 'Seu Sistema' },
  // ... resto do mapa
}
```

### Problema: Emulador está lento/lag

**Otimizações**:
1. Use versão `stable` em vez de `nightly`
2. Feche outras abas
3. Limpe cache do navegador
4. Desative extensões do navegador
5. Aumente o limite de memória do navegador

**Debug de performance**:
```javascript
// No console do emulador
console.time('emulator-load')
// ... executa
console.timeEnd('emulator-load')

// Ver FPS
// Geralmente há uma opção no menu do emulador
```

### Problema: Controles não funcionam

**Debug**:
```javascript
// Teste no console
document.addEventListener('keydown', (e) => {
  console.log('Tecla pressionada:', e.key, e.code)
})
```

**Soluções**:
1. Clique dentro da tela do emulador
2. Tente configurar os controles no menu
3. Use um gamepad USB
4. Verifique se há conflito com atalhos do navegador

### Problema: Áudio não funciona

**Debug**:
1. Verifique o volume do navegador e do sistema
2. Abra DevTools e procure por erros de áudio
3. Verifique se o áudio está habilitado na configuração

**Solução**:
```javascript
// Habilitar áudio explicitamente
window.EJS_defaultCoreSettings = {
  'audioEnabled': true,
  'volume': 1.0
}
```

### Problema: Game não inicia

**Verifique**:
1. Se o arquivo ROM é válido:
   - Não está corrompido
   - Extensão está correta
   - Tamanho está correto (não é um arquivo vazio)

2. Se o sistema está suportado:
   - Abra DevTools
   - Procure por mensagens de erro
   - Verifique compatibilidade do core

3. Se há BIOS necessária:
   - Alguns sistemas precisam de BIOS
   - EmulatorJS tenta baixar automaticamente
   - Pode precisar esperar alguns segundos

## 📊 Debugging Avançado

### Ativar logs detalhados

```javascript
// No console do navegador
localStorage.setItem('debug', 'emulatorjs:*')
location.reload()
```

### Verificar configurações do plugin

```javascript
// No console do navegador
console.log('Config:', HFS.getPluginConfig())
```

### Monitorar eventos do EmulatorJS

```javascript
// Adicione ao public/emulator.js
window.addEventListener('emulator-ready', (e) => {
  console.log('Emulador pronto:', e.detail)
})

window.addEventListener('emulator-error', (e) => {
  console.error('Erro no emulador:', e.detail)
})
```

## 🚀 Otimizações para Produção

### 1. Minificar arquivos

```bash
# Instale um minificador
npm install --save-dev uglify-js

# Minifique o JS
uglifyjs public/emulator.js -o public/emulator.min.js

# Minifique o CSS
npm install --save-dev csso-cli
csso public/emulator.css -o public/emulator.min.css
```

### 2. Usar versão estável do EmulatorJS

```javascript
// Sempre use 'stable' em produção
const emuVersion = 'stable'
```

### 3. Cachear scripts

```javascript
// Adicione cache-busting
const cacheVersion = '1.0.0'
const scriptUrl = `${cdnUrl}data/loader.js?v=${cacheVersion}`
```

### 4. Lazy loading

```javascript
// Carregue EmulatorJS apenas quando necessário
async function loadEmulatorJS() {
  if (!window.EJS) {
    await HFS.loadScript(cdnUrl + 'data/loader.js')
  }
}
```

## 📚 Referências de Código

### Adicionar novo sistema

1. Adicione ao mapeamento em `plugin.js` e `public/emulator.js`:
```javascript
'sua_ext': { system: 'seu_sistema', name: 'Seu Sistema' }
```

2. Certifique-se que EmulatorJS suporta o sistema:
- Visite https://emulatorjs.org/docs/

3. Teste com uma ROM real

### Modificar interface

Edite `public/emulator.js` e `public/emulator.css`:

```javascript
// Adicione novo botão ao menu
menu.push({
  id: 'custom-action',
  label: 'Minha Ação',
  icon: 'play',
  onClick: () => {
    // Sua lógica aqui
    return true
  }
})
```

### Adicionar configuração

No `plugin.js`, adicione à seção `config`:

```javascript
config: {
  minhaConfiguracao: {
    type: 'string',
    label: 'Minha Configuração',
    defaultValue: 'valor padrao',
    helperText: 'Descrição da configuração'
  }
}
```

Acesse depois:

```javascript
const valor = HFS.getPluginConfig('minhaConfiguracao')
```

## ✅ Checklist de Teste

Antes de liberar uma versão:

- [ ] Todos os sistemas funcionam
- [ ] Menu de contexto aparece
- [ ] Emulador abre em modal e em nova aba
- [ ] Controles funcionam
- [ ] Áudio funciona
- [ ] Save/Load funcionam
- [ ] Sem erros no console
- [ ] Sem memory leaks (DevTools)
- [ ] Responsivo em mobile
- [ ] Performance aceitável

---

**Última atualização**: Janeiro 2026
