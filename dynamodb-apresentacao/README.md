# Apresentação Amazon DynamoDB — Grupo G3

Apresentação web em HTML, CSS e JavaScript, baseada no trabalho em PDF do grupo.
São **8 slides**: capa, um slide para cada um dos seis tópicos do trabalho e conclusão.

## Abrir no computador

Extraia o ZIP e abra o arquivo `index.html` no navegador. Não é preciso instalar dependências.
Mantenha os arquivos e a pasta `assets` juntos.

## Publicar na Vercel

1. Extraia o ZIP.
2. Crie um repositório no GitHub e envie o conteúdo da pasta `dynamodb-apresentacao`.
3. Na Vercel, escolha **Add New → Project** e importe esse repositório.
4. Selecione **Framework Preset: Other**.
5. Use a pasta que contém `index.html` como **Root Directory**.
6. Deixe o **Build Command** vazio. O `vercel.json` já define o diretório de saída como `.`.
7. Clique em **Deploy**.

Também é possível usar a Vercel CLI, se já estiver instalada e autenticada: execute `vercel --prod` dentro da pasta do projeto.

Documentação oficial consultada:
- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/project-configuration/vercel-json
- https://vercel.com/docs/deployments/overview

## Apresentar

- **← / →**, **Page Up / Page Down** ou os botões: trocar slide.
- **Espaço**: avançar.
- **F**: entrar ou sair da tela cheia; **F11** também pode ser usado no navegador.
- **N**: abrir a fala curta do slide.
- **O**: abrir a lista de tópicos.
- **1 a 8**: ir diretamente para um slide.
- **Home / End**: ir para o primeiro ou último slide.
- **Esc**: fechar uma janela.
- Em telas menores, use os botões ou deslize horizontalmente.
- Para imprimir, use **Ctrl+P** e habilite gráficos de fundo. O slide da prática imprime a etapa selecionada.

As falas aparecem na mesma tela quando abertas. Se estiver projetando essa tela, abra-as apenas quando quiser que o público também as veja.

## Conteúdo

1. Capa: Amazon DynamoDB.
2. Principais características.
3. Histórico de desenvolvimento.
4. Utilização por empresas.
5. Quando é vantajoso em relação a um banco relacional.
6. Situações em que é desaconselhável.
7. Parte prática: DynamoDB Local com Docker.
8. Conclusão.

O slide da prática tem um seletor com dez etapas, comandos copiáveis e capturas originais do PDF.
A opção **Fontes** abre as referências e o trabalho completo.

## Executar os comandos da prática

Os comandos mostrados na apresentação são para **Windows PowerShell**.
A apresentação apenas exibe os comandos; eles não são executados pelo site ou pela Vercel.

Tenha Docker em execução e AWS CLI instalada. Abra o PowerShell em uma pasta gravável e siga as etapas na ordem.
As credenciais fictícias da etapa 2 são usadas pelo DynamoDB Local, sem acesso a uma conta AWS.
Todos os comandos do banco usam `--endpoint-url http://localhost:8000`.

Na criação da tabela, `PAY_PER_REQUEST` reproduz o parâmetro do PDF; o ambiente continua sendo o DynamoDB Local.
Na prática, execute cada etapa uma vez. Se o contêiner já existir, use `docker start dynamodb-local` em vez de criá-lo novamente.
Ao terminar, a etapa 10 remove a tabela. Para parar o contêiner depois dos testes: `docker stop dynamodb-local`.

Documentação complementar:
https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html

## Editar

- `index.html`: títulos e conteúdo dos slides.
- `styles.css`: cores, fontes, layout, impressão e adaptação a telas menores.
- `script.js`: navegação, falas e comandos.
- `vercel.json`: configuração de publicação.
- `assets/`: PDF e capturas originais da prática.

O projeto usa fontes locais do sistema e não depende de serviços externos para funcionar.
Os links de referências abrem sites da AWS.
