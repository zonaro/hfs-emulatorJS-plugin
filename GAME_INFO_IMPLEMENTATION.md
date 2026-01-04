# Implementação de Informações de Jogos do IGDB

## 📋 Resumo

Foi implementada uma nova funcionalidade que permite exibir **informações detalhadas sobre os jogos** quando o usuário clica em um arquivo ROM. As informações são obtidas diretamente da API do IGDB (Internet Game Database) e incluem uma ampla gama de dados sobre cada jogo.

## 🎯 Funcionalidades Implementadas

### 1. **Busca de Informações Completas do Jogo**
Quando o usuário clica na opção "Game Info" no menu de arquivo, um modal é exibido com um campo de busca. O sistema:
- Busca jogos no IGDB por nome
- Filtra automaticamente o nome do arquivo para melhor resultado
- Exibe os resultados com todas as informações disponíveis

### 2. **Dados Exibidos para Cada Jogo**

O modal mostra as seguintes informações (quando disponíveis):

#### 📊 Ratings e Avaliações
- **Avaliação de Usuários**: Nota de 0-100 dos usuários do IGDB
- **Avaliação de Críticos**: Agregação de notas de críticos profissionais

#### 📝 Informações Básicas
- **Nome do Jogo**: Título completo
- **Resumo**: Descrição do jogo
- **Nomes Alternativos**: Títulos alternativos ou títulos em outras regiões

#### 🎮 Informações Técnicas
- **Gêneros**: Tipos de jogo (Action, RPG, Strategy, etc.)
- **Plataformas**: Consoles/PCs onde o jogo foi lançado
- **Modos de Jogo**: Single Player, Multiplayer, Co-op, etc.
- **Perspectivas de Jogador**: First-person, Third-person, Top-down, etc.
- **Motores de Jogo**: Engine utilizados (Unreal, Unity, etc.)

#### 🎨 Aspectos Criativos
- **Temas**: Temas do jogo (Medieval, Cyberpunk, Horror, etc.)
- **Palavras-chave**: Tags relacionadas ao jogo
- **Vídeos**: Links para trailers e videos relacionados

#### 🌐 Idiomas e Acessibilidade
- **Idiomas Suportados**: Legendas, áudio e interface em diferentes idiomas

#### 👥 Equipe e Créditos
- **Desenvolvedoras**: Empresas que desenvolveram o jogo
- **Publicadoras**: Empresas que publicaram o jogo
- **Classificações Etárias**: ESRB, PEGI, etc.

#### 📅 Data de Lançamento
- **Data Original de Lançamento**: Quando o jogo foi lançado pela primeira vez
- **Datas por Região**: Datas de lançamento em diferentes regiões

#### 🖼️ Capa do Jogo
- Uma imagem da capa oficial é exibida para referência visual

## 🎯 Como Usar

### Acessar as Informações do Jogo

1. **Abrir o HFS Admin Panel**
   - Vá para `http://localhost:80/admin` (ou seu IP/porta do HFS)

2. **Navegar para uma pasta com ROMs**
   - Clique direito em qualquer arquivo ROM suportado

3. **Selecionar "Game Info"**
   - No menu de contexto, aparecerá a opção "Game Info" com a etiqueta "View IGDB details"

4. **Buscar o Jogo**
   - O modal abrirá com um campo de busca preenchido automaticamente com o nome do arquivo
   - Ele já fará uma busca automática se o nome tiver mais de 2 caracteres
   - Você pode modificar o nome e fazer uma nova busca (após digitar 3 caracteres)

5. **Ver Detalhes**
   - Clique em qualquer resultado para selecioná-lo
   - Todos os dados disponíveis serão exibidos no item selecionado
   - A capa do jogo será mostrada como referência visual

## 🔧 Mudanças Técnicas

### Backend (plugin.js)

#### Novas Funções:
1. **`searchGameInfo(gameName)`**
   - Busca jogos no IGDB com dados completos
   - Retorna informações em um objeto estruturado
   - Trata erros de conexão e parsing

2. **API REST `searchGameInfo`**
   - Novo endpoint customizado
   - Recebe: `{ gameName: string }`
   - Retorna: `{ success: boolean, results: array }`

#### Query IGDB Expandida:
```
search "gameName"; 
fields name,cover.image_id,rating,aggregated_rating,summary,
release_dates.human,genres.name,platforms.name,first_release_date,
game_modes.name,themes.name,involved_companies.company.name,
involved_companies.developer,involved_companies.publisher,
game_engines.name,language_supports.language.name,
player_perspectives.name,keywords.name,alternative_names.name,
age_ratings.rating_category.name,videos.name,videos.video_id; 
limit 20;
```

### Frontend (emulator.js)

#### Novas Funções:
1. **`openGameInfoModal(entry)`**
   - Cria e exibe um modal com busca de informações
   - Implementa auto-busca baseado no nome do arquivo
   - Exibe resultados em formato de card
   - Gerencia seleção de jogo

#### Novo Item de Menu:
- **"Game Info"** (antes de "Set Cover")
  - Ícone: `info`
  - Sublabel: "View IGDB details"
  - Disponível em todos os arquivos ROM suportados

#### Estilização:
- Design responsivo com grid layout
- Informações organizadas em dois colunas
- Imagens com fallback automático
- Hover effects para melhor UX

## 📊 Campos Disponíveis

| Campo | Tipo | Fonte |
|-------|------|-------|
| name | String | Título do jogo |
| rating | Number | Avaliação de usuários (0-100) |
| aggregated_rating | Number | Avaliação agregada de críticos |
| summary | String | Descrição do jogo |
| genres | Array | Gêneros do jogo |
| platforms | Array | Plataformas de lançamento |
| game_modes | Array | Modos de jogo suportados |
| themes | Array | Temas do jogo |
| developers | Array | Empresas desenvolvedoras |
| publishers | Array | Empresas publicadoras |
| game_engines | Array | Motores de jogo utilizados |
| languages | Array | Idiomas suportados |
| player_perspectives | Array | Perspectivas do jogador |
| keywords | Array | Tags/palavras-chave |
| age_ratings | Array | Classificações etárias |
| alternative_names | Array | Títulos alternativos |
| cover | Image | Capa do jogo |
| videos | Array | Vídeos relacionados |

## ⚙️ Requisitos

- **API IGDB configurada**: Cliente ID e Secret devem estar configurados no Admin Panel
- **Conexão de internet**: Para buscar dados do IGDB
- **ROM suportado**: Funciona com todos os sistemas emulados

## 🚀 Próximas Melhorias Possíveis

1. **Cache local** de informações buscadas
2. **Integração com reviews** para exibir críticas
3. **Sugestão de jogos similares**
4. **Download automático de capas** baseado nas informações
5. **Histórico de buscas** recentes
6. **Modo escuro** para o modal
7. **Exportação de dados** do jogo (metadados)

## 📝 Notas Importantes

- As informações são buscadas **em tempo real** da API IGDB
- O rate limit do IGDB é de **4 requisições por segundo**
- Os dados são precisos até a última atualização no IGDB
- Nem todos os jogos antigos têm todas as informações disponíveis
- A API é **gratuita** para uso não-comercial

## 🔒 Segurança

- As credenciais do IGDB não são expostas no frontend
- As requisições são feitas através do backend do HFS
- Nenhum dado pessoal é armazenado localmente

---

**Implementado em**: 4 de janeiro de 2026  
**Status**: ✅ Completo e Deployado
