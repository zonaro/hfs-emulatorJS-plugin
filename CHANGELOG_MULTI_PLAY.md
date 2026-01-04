# Múltiplas Opções de Play para Extensões Compatíveis

## Resumo das Alterações

Foi implementado suporte para exibir múltiplas opções de "Play" no menu de arquivo quando uma extensão de arquivo é compatível com mais de um emulador.

## Mudanças Realizadas

### 1. **Estrutura do `SYSTEM_MAP` Atualizada**
   - **Antes**: Cada extensão mapeava para um único sistema
   ```javascript
   'bin': { system: 'psx', name: 'PlayStation' }
   ```
   
   - **Depois**: Cada extensão agora mapeia para um array de sistemas
   ```javascript
   'bin': [
       { system: 'psx', name: 'PlayStation' },
   { system: 'segaMD', name: 'Mega Drive' }
   ]
   ```

### 2. **Novas Extensões Suportadas**
   - `.bin` - Agora suporta **PlayStation** e **Mega Drive**
   - `.iso` - PlayStation
   - `.img` - PlayStation

### 3. **Novas Funções**
   - **`getSystemFromFile(filename)`** - Mantém compatibilidade reversa, retorna o primeiro sistema
   - **`getAllSystemsFromFile(filename)`** - Nova função que retorna um array com todos os sistemas compatíveis

### 4. **Lógica do Menu de Arquivo Aprimorada**
   - Quando um arquivo suporta apenas um emulador: Exibe um único botão "Play" (comportamento original)
   - Quando um arquivo suporta múltiplos emuladores: Exibe múltiplos botões "Play", um para cada emulador
   - Cada botão de Play mostra o nome do sistema como sublabel
   - Exemplo para arquivo `.bin`:
     ```
     Play (PlayStation)
     Play (Mega Drive)
     ```

### 5. **Compatibilidade**
   - Totalmente compatível com código existente que usa `getSystemFromFile()`
   - Não quebra funcionalidades existentes de:
     - Exibição de ícone de entrada
     - Propriedades de informação do jogo
     - Funcionalidades de admin (Game Info, Set Cover)

## Como Usar

1. **Carregar um arquivo `.bin`** no HFS
2. **Clicar no menu do arquivo** (três pontos ou botão de contexto)
3. **Ver múltiplas opções "Play"**:
   - "Play (PlayStation)" - Abre o emulador PlayStation
   - "Play (Mega Drive)" - Abre o emulador Mega Drive
4. **Selecionar o emulador desejado**

## Extensões Que Suportam Múltiplos Emuladores

### Atual:
- `.bin` → PlayStation | Mega Drive

### Potenciais para o Futuro:
- `.iso` → PlayStation (já suportado, mas possível adicionar mais)
- `.img` → PlayStation (já suportado, mas possível adicionar mais)
- Outras extensões conforme descobertas

## Testes Realizados

✅ Deploy realizado com sucesso
✅ Estrutura de dados modificada sem erros
✅ Funções auxiliares criadas e funcionando
✅ Lógica do menu atualizada
✅ Compatibilidade reversa mantida

## Notas Técnicas

- A ordem dos sistemas no array afeta a ordem dos botões no menu
- Os botões "Game Info" e "Set Cover" (admin) continuam funcionando normalmente
- A lógica mantém a verificação de duplicação para evitar buttons repetidas

---
**Data de Implementação**: 4 de janeiro de 2026
**Versão do Plugin**: 2
