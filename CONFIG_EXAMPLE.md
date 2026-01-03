# Configuração do EmulatorJS Plugin para HFS

Exemplo de como a configuração aparecerá no `config.yaml` do HFS após usar o plugin:

```yaml
plugins_config:
  emulatorJS-plugin:
    enabled: true
    emulatorsJsVersion: stable
    useEmbeddedUI: true
    showFileMenu: true
    enabledSystems:
      - system: nes
        enabled: true
      - system: snes
        enabled: true
      - system: gba
        enabled: true
      - system: megadrive
        enabled: true
      - system: n64
        enabled: true
      - system: psx
        enabled: true
      - system: arcade
        enabled: true
```

## Explicação das Opções

### `enabled`
- **Tipo**: `boolean`
- **Padrão**: `true`
- **Descrição**: Ativa ou desativa o plugin completamente

### `emulatorsJsVersion`
- **Tipo**: `string`
- **Padrão**: `stable`
- **Opções**: `stable`, `latest`, `nightly`
- **Descrição**: 
  - `stable`: Versão mais testada e confiável (recomendado)
  - `latest`: Código recente com cores estáveis
  - `nightly`: Código experimental com cores mais novas

### `useEmbeddedUI`
- **Tipo**: `boolean`
- **Padrão**: `true`
- **Descrição**: Se `true`, abre o emulador em modal integrado. Se `false`, abre em nova aba

### `showFileMenu`
- **Tipo**: `boolean`
- **Padrão**: `true`
- **Descrição**: Mostra opção "Emular" no menu de contexto dos arquivos

### `enabledSystems`
- **Tipo**: `array de objetos`
- **Padrão**: `[]` (todos os sistemas habilitados)
- **Descrição**: Lista de sistemas que podem ser emulados
  - `system`: ID do sistema
  - `enabled`: Se está habilitado

## Todos os Sistemas Disponíveis

```yaml
enabledSystems:
  # Nintendo
  - system: nes
    enabled: true
  - system: snes
    enabled: true
  - system: gb
    enabled: true
  - system: gbc
    enabled: true
  - system: gba
    enabled: true
  - system: n64
    enabled: true
  - system: ds
    enabled: true
  - system: vb
    enabled: true
  
  # Sega
  - system: megadrive
    enabled: true
  - system: gamegear
    enabled: true
  - system: mastersystem
    enabled: true
  - system: saturn
    enabled: true
  - system: sega32x
    enabled: true
  
  # Atari
  - system: atarivcs
    enabled: true
  - system: atari5200
    enabled: true
  - system: atari7800
    enabled: true
  - system: lynx
    enabled: true
  - system: jaguar
    enabled: true
  
  # Outros
  - system: psx
    enabled: true
  - system: psp
    enabled: true
  - system: arcade
    enabled: true
  - system: c64
    enabled: true
  - system: amiga
    enabled: true
  - system: vic20
    enabled: true
  - system: colecovision
    enabled: true
```

## Configuração Mínima

Se você quer apenas os sistemas mais populares:

```yaml
plugins_config:
  emulatorJS-plugin:
    enabled: true
    emulatorsJsVersion: stable
    useEmbeddedUI: true
    showFileMenu: true
```

## Configuração Completa

Para máximo controle:

```yaml
plugins_config:
  emulatorJS-plugin:
    enabled: true
    emulatorsJsVersion: latest
    useEmbeddedUI: true
    showFileMenu: true
    enabledSystems:
      - system: nes
        enabled: true
      - system: snes
        enabled: true
      - system: gba
        enabled: true
      - system: n64
        enabled: true
      - system: megadrive
        enabled: true
      - system: psx
        enabled: false  # Desabilitar PlayStation
      - system: arcade
        enabled: true
```

---

**Nota**: Você não precisa editar este arquivo manualmente! 
Use o painel de administração do HFS para configurar o plugin.
