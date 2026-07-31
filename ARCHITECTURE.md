# Arquitetura do Editor de Livros Digitais Interativos

## 1. Visão geral

Este projeto é um editor visual para criação de livros digitais interativos, com foco inicial em conteúdos de educação musical.

A solução completa terá duas áreas:

1. **Editor de livros digitais** — prioridade atual.
2. **Hub de publicação e acesso** — etapa futura.

O editor permite organizar conteúdos em rolagem contínua, utilizando blocos modulares. O livro é salvo como estrutura editável e posteriormente poderá gerar uma saída HTML.

O objetivo central é permitir que uma professora crie materiais interativos sem editar código.

---

## 2. Princípios do produto

### 2.1 O editor deve parecer um livro, não um formulário

O conteúdo tem prioridade visual. Ferramentas e configurações aparecem apenas quando necessárias.

### 2.2 Edite o conteúdo no próprio conteúdo

Textos, títulos, perguntas e alternativas devem ser editados diretamente no local em que aparecem.

### 2.3 Edite o comportamento no Inspector

Configurações que não fazem parte do conteúdo visível ficam no Painel de Propriedades.

Exemplos:

- alinhamento;
- hierarquia;
- resposta correta;
- feedback;
- quantidade de oitavas;
- exibição de nomes;
- tamanho e ajuste de imagens.

### 2.4 Componentes devem ser modulares

Cada bloco deve possuir sua própria pasta, tipos, configuração, visualização, edição e propriedades.

Um bloco não deve depender da implementação interna de outro.

### 2.5 Alterações pequenas e isoladas

Mudanças feitas por IA devem ter escopo limitado, preservar a arquitetura atual e evitar alterações em arquivos não relacionados.

---

## 3. Estrutura principal do editor

O editor possui três áreas:

```text
Biblioteca de blocos | Livro | Inspector
```

### Biblioteca

Lista os blocos disponíveis por meio do Block Registry.

### Livro

Área central com rolagem contínua. Mostra os blocos na ordem do conteúdo.

### Inspector

Mostra propriedades do bloco selecionado.

Ao clicar em uma área vazia, a seleção é limpa.

---

## 4. Block Registry

O editor não conhece diretamente cada tipo de bloco.

Todos os blocos são registrados em um catálogo central.

Cada definição pode fornecer:

```ts
type BlockDefinition = {
  type: string;
  name: string;
  icon: string;
  createBlock: () => BookBlock;
  ViewComponent: React.ComponentType<any>;
  InlineEditComponent?: React.ComponentType<any>;
  PropertiesComponent?: React.ComponentType<any>;
  QuizAttachmentComponent?: React.ComponentType<any>;
  QuizAttachmentEditComponent?: React.ComponentType<any>;
  capabilities?: {
    canAttachToQuiz?: boolean;
  };
};
```

O Registry é utilizado para:

- montar a biblioteca lateral;
- criar novos blocos;
- renderizar o modo Editar;
- renderizar o modo Visualizar;
- mostrar propriedades no Inspector;
- identificar quais blocos podem ser anexados ao Quiz;
- resolver a visualização de blocos anexados.

Novos blocos não devem exigir alteração no editor central.

---

## 5. Modos de renderização

Cada bloco pode ter diferentes faces.

### ViewComponent

Renderização final no modo Visualizar.

Não apresenta controles de autoria.

### InlineEditComponent

Edição direta no conteúdo do bloco.

Utilizado quando a autoria faz sentido no próprio objeto.

Exemplos:

- Título;
- Texto;
- Quiz;
- Piano independente.

### PropertiesComponent

Configurações exibidas no Inspector.

### QuizAttachmentComponent

Visualização compacta ou estática quando o bloco está dentro de um Quiz.

### QuizAttachmentEditComponent

Editor do bloco anexado, aberto em modal.

Este componente deve reutilizar a lógica interna do bloco sempre que possível.

---

## 6. Estrutura do documento

O livro mantém todos os blocos em uma única coleção.

```ts
type Book = {
  id: string;
  title: string;
  blocks: BookBlock[];
};
```

Um bloco pode estar:

- na raiz do livro;
- anexado a um slot de Quiz.

O bloco mantém sempre:

- o mesmo ID;
- o mesmo conteúdo;
- as mesmas configurações.

Não há cópia nem sincronização paralela.

A mudança é apenas de localização.

---

## 7. Blocos raiz e blocos anexados

Os utilitários compartilhados ficam em:

```text
src/components/blocks/quizAttachmentSlots.ts
```

Funções principais:

```ts
getQuizAttachedBlockIds(blocks)
getRootBlocks(blocks)
detachBlockFromAllQuizSlots(blocks, blockId)
```

### getQuizAttachedBlockIds

Retorna os IDs validamente anexados aos Quizzes.

Um anexo só é válido quando:

- o ID existe;
- o tipo possui `canAttachToQuiz`;
- o tipo possui `QuizAttachmentComponent`.

### getRootBlocks

Retorna os blocos que devem aparecer no fluxo principal do livro.

### detachBlockFromAllQuizSlots

Remove a referência de um bloco de qualquer slot de Quiz.

Será utilizada antes de mover um bloco para outro destino.

### Regra de localização

Um bloco ocupa apenas um lugar por vez:

```text
Raiz OU Quiz
```

Nunca os dois simultaneamente.

---

## 8. Blocos anexáveis ao Quiz

Apenas estes tipos podem ser anexados:

- Imagem;
- Piano;
- Pauta, futuramente.

Não podem ser anexados:

- Título;
- Texto;
- Quiz;
- outros blocos.

Cada Quiz possui:

- zero ou um bloco na pergunta;
- zero ou um bloco em cada alternativa.

Não existe aninhamento recursivo.

Um bloco anexado não recebe filhos.

---

## 9. Modelo do Quiz

O Quiz possui:

- pergunta;
- alternativas;
- resposta correta;
- feedback de acerto;
- feedback de erro;
- slots opcionais de bloco.

Estrutura conceitual:

```ts
type QuizContent = {
  question: string;
  questionBlockId?: string;
  alternatives: QuizAlternative[];
};

type QuizAlternative = {
  id: string;
  text?: string;
  blockId?: string;
};
```

### Autoria inline

No próprio bloco são editados:

- pergunta;
- texto das alternativas;
- adicionar alternativa;
- remover alternativa;
- reorganizar alternativas;
- recursos anexados.

### Inspector

Ficam no Inspector:

- resposta correta;
- feedback de acerto;
- feedback de erro;
- propriedades gerais de apresentação.

### Modo Visualizar

O aluno pode:

- selecionar uma alternativa;
- verificar a resposta;
- receber feedback;
- tentar novamente.

O estado do aluno é temporário e não altera o conteúdo autoral.

---

## 10. Slot genérico de recurso do Quiz

O botão específico de imagem deve evoluir para:

```text
+ Adicionar recurso
```

O seletor deve listar dinamicamente os blocos que possuem:

```ts
capabilities.canAttachToQuiz === true
```

Atualmente:

- Imagem;
- Piano.

Futuramente:

- Pauta.

### Slot vazio

Mostra o botão para adicionar recurso.

### Slot preenchido

Mostra:

- prévia do bloco;
- editar;
- mover para fora.

### Criação pelo botão +

Ao selecionar um tipo:

1. criar um bloco real pela função registrada no Registry;
2. adicionar o bloco à coleção global;
3. associar o ID ao slot;
4. abrir o editor em modal;
5. não renderizar o bloco na raiz enquanto estiver anexado.

### Movimento para fora

Ao mover para fora:

1. limpar a referência do slot;
2. manter o bloco no documento;
3. devolver o bloco à raiz;
4. preservar ID, conteúdo e configurações.

---

## 11. Modal de edição

O editor possui um componente reutilizável:

```text
src/components/editor/ModalDialog.tsx
```

Ele oferece:

- backdrop;
- fechamento por clique externo;
- fechamento por Esc;
- focus trap;
- retorno de foco;
- bloqueio do scroll de fundo.

Blocos anexados ao Quiz devem ser editados em modal.

### Imagem anexada

O modal permite:

- URL;
- upload local;
- texto alternativo;
- substituição;
- remoção;
- propriedades relevantes.

### Piano anexado

O modal permite:

- marcar e desmarcar notas;
- quantidade de oitavas;
- mostrar ou ocultar nomes;
- editar o mesmo bloco global.

A prévia dentro do Quiz é estática.

---

## 12. Imagens

A lógica compartilhada de imagem fica em:

```text
src/components/blocks/imageSource.ts
```

Ela centraliza:

- origem por URL;
- arquivo local;
- IndexedDB;
- validação;
- resolução de mídia;
- fallback;
- texto alternativo.

Não deve existir uma segunda implementação de upload dentro de outros blocos.

### Presets

Imagens devem usar presets controlados, evitando tamanhos livres.

No Quiz:

- imagem da pergunta possui tamanho próprio;
- imagens das alternativas usam configuração geral;
- `contain` é o padrão;
- `cover` é opcional.

---

## 13. Bloco Piano

O Piano é um componente pedagógico, não um instrumento completo.

### Estado atual

Modo implementado:

```text
display
```

Permite:

- 1, 2 ou 3 oitavas;
- marcar e desmarcar teclas;
- mostrar ou ocultar nomes;
- persistir notas destacadas;
- visualização estática quando anexado ao Quiz.

### Music Core

Fica em:

```text
src/music/
```

Arquivos atuais:

```text
src/music/notes.ts
src/music/piano.ts
```

Responsabilidades:

- representação de notas;
- parsing;
- conversão para posição semitonal;
- geração das teclas;
- identificação musical estável;
- detecção de teclas pretas.

A UI do Piano não deve conter regras musicais.

### IDs musicais

Notas são armazenadas como:

```text
C3
F#3
A4
```

Mesmo sem áudio, a oitava continua presente internamente.

### Redimensionamento

Uma oitava não deve ocupar toda a largura do container.

O teclado deve:

- manter proporção;
- centralizar quando menor;
- reduzir em telas estreitas;
- compartilhar regras de dimensão em um único local.

### Futuro

O Piano poderá evoluir para:

- áudio;
- exercício;
- resposta correta;
- acordes;
- escalas;
- comparação.

---

## 14. Tipografia

Título e Texto compartilham a lógica tipográfica em:

```text
src/components/blocks/typography.ts
```

Propriedades atuais:

- alinhamento;
- negrito;
- itálico;
- hierarquia do Título.

Editar e Visualizar devem utilizar a mesma base de apresentação.

---

## 15. Ícones

Ícones internos ficam em:

```text
src/components/editor/EditorIcon.tsx
```

Regras:

- SVG interno;
- `currentColor`;
- tamanho consistente;
- decorativo quando o botão já possui `aria-label`;
- tooltip;
- foco visível;
- sem dependência externa apenas para ícones.

---

## 16. Persistência

### Livro

O conteúdo autoral é salvo pelo fluxo atual do livro em `localStorage`.

### Arquivos locais

Imagens são armazenadas em IndexedDB.

O bloco salva apenas a referência persistente.

### Estado do aluno

Não deve ser salvo dentro do conteúdo autoral.

Exemplos:

- alternativa selecionada;
- resposta correta ou incorreta;
- tecla pressionada temporariamente.

---

## 17. Modo Editar e modo Visualizar

### Editar

- blocos selecionáveis;
- edição inline;
- Inspector;
- ações de autoria;
- reordenação;
- anexos editados em modal.

### Visualizar

- aparência final do livro;
- sem bordas de autoria;
- sem handles;
- sem ações;
- largura máxima de leitura;
- margens responsivas;
- blocos interativos executam apenas o comportamento do aluno.

---

## 18. Regras de segurança arquitetural

- Não alterar o editor central para adicionar um novo bloco.
- Não duplicar lógica compartilhada.
- Não criar cópias ao anexar blocos ao Quiz.
- Não permitir o mesmo bloco em dois slots.
- Não permitir Quiz dentro de Quiz.
- Não permitir Texto ou Título dentro de Quiz.
- Não criar árvore genérica recursiva.
- Não remover blocos do array global apenas porque estão anexados.
- Referências inválidas não podem esconder blocos da raiz.
- Mudanças devem ser pequenas e validadas com build.

---

## 19. Próxima sprint

### Slot genérico de recurso no Quiz

Implementar:

- substituir botão específico de imagem por `+ Adicionar recurso`;
- listar Imagem e Piano pelo Registry;
- criar bloco real e associar ao slot;
- abrir edição em modal;
- exibir prévia estática;
- permitir mover o mesmo bloco para fora;
- preservar quizzes antigos;
- manter um recurso por slot.

Ainda não é necessário implementar drag and drop completo.

O botão `+` será a primeira forma de criar e anexar recursos.

O drag and drop será adicionado depois como uma segunda entrada para o mesmo sistema de slots.
