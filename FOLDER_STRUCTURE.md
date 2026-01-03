<!-- Exemplo de como organizar arquivos de configuração -->
<!-- Este arquivo é apenas referência -->

# Estrutura Recomendada de Pastas para ROMs

```
.hfs/
├── config.yaml
└── plugins/
    └── emulatorJS-plugin/
        ├── plugin.js
        ├── public/
        │   ├── emulator.js
        │   └── emulator.css
        ├── README.md
        ├── QUICK_START.md
        └── package.json

# Em outra pasta para servir ROMs
games/
├── Nintendo/
│   ├── NES/
│   │   ├── Super Mario Bros.nes
│   │   ├── The Legend of Zelda.nes
│   │   └── Contra.nes
│   ├── SNES/
│   │   ├── The Legend of Zelda - A Link to the Past.smc
│   │   ├── Final Fantasy III.smc
│   │   └── Super Metroid.smc
│   ├── N64/
│   │   ├── The Legend of Zelda - Ocarina of Time.z64
│   │   ├── Super Mario 64.z64
│   │   └── Mario Kart 64.z64
│   └── Game Boy/
│       ├── The Legend of Zelda - Link's Awakening.gb
│       ├── Tetris.gb
│       └── Pokemon Red.gb
├── Sega/
│   ├── Mega Drive/
│   │   ├── Sonic the Hedgehog.gen
│   │   ├── Streets of Rage.gen
│   │   └── Phantasy Star IV.gen
│   └── Game Gear/
│       ├── Sonic Chaos.gg
│       └── Shinobi.gg
├── Atari/
│   ├── Atari 2600/
│   │   ├── Pac-Man.a26
│   │   ├── Space Invaders.a26
│   │   └── Breakout.a26
│   └── Lynx/
│       ├── Lynx Caliber 50.lnx
│       └── Blue Lightning.lnx
└── Outros/
    ├── Arcade/
    │   ├── pacman.zip
    │   ├── donkeykong.zip
    │   └── streetfighter.zip
    └── Commodore 64/
        ├── Boulder Dash.prg
        ├── Giana Sisters.prg
        └── The Great Giana Sisters.d64
```

## Como Configurar no HFS

1. Abra o painel administrativo do HFS
2. Configure as pastas que deseja servir
3. Marque a pasta `games/` como pública
4. Os usuários verão as ROMs e poderão emular diretamente!

## Organização por Plataforma vs Por Gênero

### Opção 1: Por Plataforma (Recomendado)
```
games/
├── Nintendo/
├── Sega/
└── Atari/
```

### Opção 2: Por Gênero
```
games/
├── RPG/
├── Platformer/
├── Fighting/
└── Sports/
```

### Opção 3: Misto
```
games/
├── Classics/
│   ├── Mario/
│   ├── Zelda/
│   └── Sonic/
├── Fighting/
└── Outros/
```

## Tamanho dos Arquivos

Aqui está uma orientação de tamanhos típicos:

| Sistema | Tamanho Típico | Extensão |
|---------|---------------|----------|
| NES | 16-768 KB | .nes |
| SNES | 256 KB - 4 MB | .smc, .snes |
| Game Boy | 32-1024 KB | .gb |
| N64 | 4-64 MB | .z64, .n64 |
| Mega Drive | 256 KB - 4 MB | .gen, .md |
| PlayStation | 500 MB - 900 MB | .cue, .bin |
| Arcade | 100 KB - 100 MB | .zip |

## Dicas de Organização

1. **Use nomes descritivos**: Deixe claro qual é o jogo
2. **Evite acentos**: Use `Mario` em vez de `Mário`
3. **Organize por série**: Coloque todos os Zeldas juntos
4. **Mantenha versões separadas**: NES vs SNES têm extensões diferentes
5. **Use CAPS para o início**: `Super Mario Bros` em vez de `super mario bros`

## Exemplo de Pasta Bem Organizada

```
games/
├── 1 - Classics/
│   ├── Mario/
│   │   ├── Super Mario Bros (NES).nes
│   │   ├── Super Mario Bros 2 (NES).nes
│   │   ├── Super Mario Bros 3 (NES).nes
│   │   ├── Super Mario World (SNES).smc
│   │   └── Super Mario 64 (N64).z64
│   ├── Zelda/
│   │   ├── The Legend of Zelda (NES).nes
│   │   ├── Zelda II (NES).nes
│   │   ├── A Link to the Past (SNES).smc
│   │   └── Ocarina of Time (N64).z64
│   └── Sonic/
│       ├── Sonic 1 (Genesis).gen
│       ├── Sonic 2 (Genesis).gen
│       └── Sonic 3 (Genesis).gen
├── 2 - Platformers/
└── 3 - RPGs/
```

---

**Dica**: Quanto melhor organizada a sua coleção, melhor a experiência de jogo!
