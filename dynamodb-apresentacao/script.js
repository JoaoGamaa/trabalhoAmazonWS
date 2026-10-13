'use strict';

// Conteúdo resumido do PDF do Grupo G3. Uma seção corresponde a um slide.
const slides = Array.from(document.querySelectorAll('.slide'));
const byId = (id) => document.getElementById(id);
let currentSlide = 0;
let currentCommand = 0;
let toastTimer;

const talks = [
  {
    text: 'Nosso grupo vai apresentar o Amazon DynamoDB, um banco de dados não relacional da AWS. Vamos explicar suas características, os principais usos e uma prática com Docker.',
    context: 'Contexto: apresente o tema e o Grupo G3. Não é necessário ler todos os tópicos da tela.'
  },
  {
    text: 'O DynamoDB armazena dados como itens e atributos. As chaves determinam como encontramos cada registro. Na prática, usamos curso e matrícula para identificar os alunos. A AWS administra a infraestrutura, e o serviço também oferece índices, backups e transações.',
    context: 'Contexto: use o exemplo de João para explicar a chave de partição e a chave de ordenação.'
  },
  {
    text: 'O DynamoDB foi influenciado pelo sistema interno Dynamo, apresentado em 2007. O serviço público foi lançado em 2012 e recebeu novos recursos, como tabelas globais e transações ACID. Dynamo e DynamoDB são sistemas diferentes.',
    context: 'Contexto: destaque o lançamento em 2012 e a evolução dos recursos, sem decorar todas as datas.'
  },
  {
    text: 'Disney+, Samsung Cloud e Mercado Livre têm casos de uso documentados. O Disney+ guarda informações de conteúdo e ações dos usuários. A Samsung organiza metadados de arquivos, e o Mercado Livre utiliza o serviço em grande escala. São usos específicos dentro dessas empresas.',
    context: 'Contexto: explique que usar DynamoDB não significa substituir todos os bancos da empresa.'
  },
  {
    text: 'Ele é vantajoso quando sabemos como os dados serão consultados e precisamos de grande escala. Um exemplo é buscar o carrinho pelo identificador do usuário. A capacidade sob demanda ajuda com o tráfego variável, e a infraestrutura gerenciada reduz o trabalho de administração.',
    context: 'Contexto: relacione a escolha do banco ao tipo de consulta, e não apenas ao volume de dados.'
  },
  {
    text: 'O DynamoDB pode ser menos adequado para muitas junções e relatórios com buscas imprevisíveis. Cada item tem limite de 400 KB, e as transações também têm limites. Por isso, arquivos grandes, custos e a dependência da AWS precisam ser considerados.',
    context: 'Contexto: o banco tem transações ACID; a limitação é a abrangência e o tamanho dessas operações.'
  },
  {
    text: 'Na prática, executamos o DynamoDB Local com Docker e criamos uma tabela de alunos. Inserimos João e Maria, consultamos os registros e atualizamos a idade de João para 23. Depois excluímos Maria e removemos a tabela. Todos os comandos apontam para o banco local.',
    context: 'Contexto: escolha as etapas no terminal da tela. GetItem busca uma chave completa; Query consulta a partição do curso; Scan percorre a tabela.'
  },
  {
    text: 'Concluímos que o DynamoDB é uma boa opção para aplicações com consultas bem definidas e necessidade de escala. A escolha exige planejar as chaves, os índices e os custos, considerando também as limitações das consultas.',
    context: 'Contexto: finalize retomando a ideia principal e abra espaço para perguntas.'
  }
];

// O caractere de continuação do PowerShell é o acento grave (backtick).
const continuation = ' ' + String.fromCharCode(96) + '\n  ';
const ps = (parts) => parts.join(continuation);
const endpoint = '--endpoint-url http://localhost:8000';
const table = '--table-name AlunosG3DynamoDB';
const jsonFile = (name, content) => ["@'", JSON.stringify(content, null, 2), "'@ | Set-Content -Encoding ascii " + name].join('\n');

const joao = {curso:{S:'Sistemas de Informacao'},matricula:{S:'A001'},nome:{S:'Joao'},idade:{N:'22'}};
const maria = {curso:{S:'Sistemas de Informacao'},matricula:{S:'A002'},nome:{S:'Maria'},idade:{N:'21'}};
const keyJoao = {curso:{S:'Sistemas de Informacao'},matricula:{S:'A001'}};
const keyMaria = {curso:{S:'Sistemas de Informacao'},matricula:{S:'A002'}};
const commands = [
  {
    title: '1. Iniciar o Docker',
    description: 'Requer Docker em execução. O contêiner expõe o DynamoDB Local na porta 8000.',
    code: ps(['docker run -d --name dynamodb-local','-p 8000:8000 amazon/dynamodb-local'])
  },
  {
    title: '2. Preparar a AWS CLI',
    description: 'Requer AWS CLI instalada. Credenciais fictícias, usadas apenas nesta sessão local do PowerShell.',
    code: [
      '$env:AWS_ACCESS_KEY_ID = "local"',
      '$env:AWS_SECRET_ACCESS_KEY = "local"',
      '$env:AWS_DEFAULT_REGION = "us-east-1"',
      '$env:AWS_PAGER = ""',
      'Remove-Item Env:AWS_SESSION_TOKEN -ErrorAction SilentlyContinue',
      '',
      'aws dynamodb list-tables ' + endpoint
    ].join('\n')
  },
  {
    title: '3. Criar a tabela',
    description: 'Curso é a chave de partição; matrícula é a chave de ordenação. Os dois atributos são texto (S).',
    code: ps(['aws dynamodb create-table',table,'--attribute-definitions AttributeName=curso,AttributeType=S AttributeName=matricula,AttributeType=S','--key-schema AttributeName=curso,KeyType=HASH AttributeName=matricula,KeyType=RANGE','--billing-mode PAY_PER_REQUEST',endpoint])
  },
  {
    title: '4. Inserir João e Maria',
    description: 'Cria os arquivos JSON e insere os dois alunos. A condição impede substituir um item com a mesma chave.',
    code: [
      jsonFile('joao.json',joao),
      ps(['aws dynamodb put-item',table,'--item file://joao.json','--condition-expression "attribute_not_exists(matricula)"',endpoint]),
      '',
      jsonFile('maria.json',maria),
      ps(['aws dynamodb put-item',table,'--item file://maria.json','--condition-expression "attribute_not_exists(matricula)"',endpoint])
    ].join('\n\n')
  },
  {
    title: '5. Consultar João',
    description: 'GetItem encontra um aluno pela chave completa. A leitura forte é solicitada por --consistent-read.',
    code: [
      jsonFile('chave-joao.json',keyJoao),
      ps(['aws dynamodb get-item',table,'--key file://chave-joao.json','--consistent-read',endpoint])
    ].join('\n\n')
  },
  {
    title: '6. Atualizar a idade',
    description: 'Altera a idade de João de 22 para 23 anos e retorna os atributos atualizados.',
    code: [
      jsonFile('atualizacao.json',{':novaIdade':{N:'23'}}),
      ps(['aws dynamodb update-item',table,'--key file://chave-joao.json','--update-expression "SET idade = :novaIdade"','--expression-attribute-values file://atualizacao.json','--return-values ALL_NEW',endpoint])
    ].join('\n\n')
  },
  {
    title: '7. Listar todos os alunos',
    description: 'Scan percorre a tabela. Nesta prática pequena, permite conferir os dois alunos.',
    code: ps(['aws dynamodb scan',table,endpoint])
  },
  {
    title: '8. Excluir Maria',
    description: 'Remove o registro identificado por curso e matrícula. ALL_OLD retorna os dados do item removido.',
    code: [
      jsonFile('chave-maria.json',keyMaria),
      ps(['aws dynamodb delete-item',table,'--key file://chave-maria.json','--return-values ALL_OLD',endpoint])
    ].join('\n\n')
  },
  {
    title: '9. Consultar o curso',
    description: 'Query consulta a chave de partição curso. Após a exclusão de Maria, o resultado contém apenas João.',
    code: [
      jsonFile('consulta.json',{':c':{S:'Sistemas de Informacao'}}),
      ps(['aws dynamodb query',table,'--key-condition-expression "curso = :c"','--expression-attribute-values file://consulta.json',endpoint])
    ].join('\n\n')
  },
  {
    title: '10. Encerrar a prática',
    description: 'Exclui a tabela de teste e lista as tabelas restantes no ambiente local.',
    code: [
      ps(['aws dynamodb delete-table',table,endpoint]),
      'aws dynamodb list-tables ' + endpoint
    ].join('\n\n')
  }
];

function showSlide(index, updateHash = true) {
  currentSlide = Math.min(Math.max(index, 0), slides.length - 1);
  slides.forEach((slide, i) => {
    slide.hidden = i !== currentSlide;
    slide.classList.toggle('is-active', i === currentSlide);
  });
  byId('slide-number').textContent = String(currentSlide + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
  byId('slide-topic').textContent = slides[currentSlide].dataset.topic;
  byId('previous-slide').disabled = currentSlide === 0;
  byId('next-slide').disabled = currentSlide === slides.length - 1;
  byId('progress-bar').style.width = ((currentSlide + 1) / slides.length * 100) + '%';
  document.querySelectorAll('[data-slide-index]').forEach((button) => {
    if (Number(button.dataset.slideIndex) === currentSlide) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  byId('slide-announcement').textContent = 'Slide ' + (currentSlide + 1) + ' de ' + slides.length + ': ' + slides[currentSlide].dataset.title;
  document.title = slides[currentSlide].dataset.title + ' · DynamoDB G3';
  if (updateHash) {
    try { window.history.replaceState(null, '', '#slide-' + (currentSlide + 1)); }
    catch { window.location.hash = 'slide-' + (currentSlide + 1); }
  }
  if (window.innerWidth < 900) window.scrollTo({top:0,behavior:'auto'});
  updateTalk();
}

function fromHash() {
  const match = window.location.hash.match(/^#slide-(\d+)$/);
  showSlide(match ? Number(match[1]) - 1 : 0, false);
}

function updateTalk() {
  byId('notes-index').textContent = 'Slide ' + (currentSlide + 1) + ' / ' + slides.length;
  byId('notes-title').textContent = slides[currentSlide].dataset.title;
  byId('notes-text').textContent = talks[currentSlide].text;
  byId('notes-context').textContent = talks[currentSlide].context;
}

function showCommand(index) {
  currentCommand = Math.min(Math.max(index, 0), commands.length - 1);
  byId('command-select').value = String(currentCommand);
  byId('command-code').textContent = commands[currentCommand].code;
  byId('command-description').textContent = commands[currentCommand].description;
  byId('command-count').textContent = 'Etapa ' + (currentCommand + 1) + ' de ' + commands.length;
  byId('previous-command').disabled = currentCommand === 0;
  byId('next-command').disabled = currentCommand === commands.length - 1;
  byId('command-code').parentElement.scrollTop = 0;
}

function fitStage() {
  if (window.innerWidth < 900) {
    document.documentElement.style.setProperty('--scale', '1');
    return;
  }
  const viewport = document.querySelector('.viewport');
  const scale = Math.min((viewport.clientWidth - 56) / 1600, (viewport.clientHeight - 16) / 900);
  document.documentElement.style.setProperty('--scale', String(Math.max(scale, .1)));
}

function openDialog(id) {
  const dialog = byId(id);
  if (dialog.open) dialog.close();
  else dialog.showModal();
}

function toast(message) {
  clearTimeout(toastTimer);
  byId('toast').textContent = message;
  byId('toast').hidden = false;
  toastTimer = setTimeout(() => { byId('toast').hidden = true; }, 2600);
}

async function copyCommand() {
  const text = commands[currentCommand].code;
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      if (!copied) throw new Error('Clipboard unavailable');
    }
    toast('Comandos copiados.');
  } catch {
    toast('Selecione o código e use Ctrl+C para copiar.');
  }
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else toast('Use a opção de tela cheia do navegador.');
  } catch { toast('Use F11 ou a opção de tela cheia do navegador.'); }
}

slides.forEach((slide, i) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'dot';
  dot.dataset.slideIndex = String(i);
  dot.setAttribute('aria-label', 'Slide ' + (i + 1) + ': ' + slide.dataset.title);
  dot.title = slide.dataset.title;
  dot.addEventListener('click', () => showSlide(i));
  byId('slide-dots').append(dot);
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'overview-item';
  item.dataset.slideIndex = String(i);
  const number = document.createElement('span');
  number.textContent = String(i + 1).padStart(2, '0');
  item.append(number, document.createTextNode(slide.dataset.title));
  item.addEventListener('click', () => { byId('overview-dialog').close(); showSlide(i); });
  byId('overview-list').append(item);
});

commands.forEach((command, i) => {
  const option = document.createElement('option');
  option.value = String(i);
  option.textContent = command.title;
  byId('command-select').append(option);
});

byId('previous-slide').addEventListener('click', () => showSlide(currentSlide - 1));
byId('next-slide').addEventListener('click', () => showSlide(currentSlide + 1));
byId('overview-button').addEventListener('click', () => openDialog('overview-dialog'));
byId('notes-button').addEventListener('click', () => openDialog('notes-dialog'));
byId('sources-button').addEventListener('click', () => openDialog('sources-dialog'));
byId('closing-source-button').addEventListener('click', () => openDialog('sources-dialog'));
byId('evidence-button').addEventListener('click', () => openDialog('evidence-dialog'));
byId('fullscreen-button').addEventListener('click', toggleFullscreen);
byId('copy-command').addEventListener('click', copyCommand);
byId('command-select').addEventListener('change', (event) => showCommand(Number(event.target.value)));
byId('previous-command').addEventListener('click', () => showCommand(currentCommand - 1));
byId('next-command').addEventListener('click', () => showCommand(currentCommand + 1));
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  if (document.querySelector('dialog[open]')) {
    if (event.key.toLowerCase() === 'n' && byId('notes-dialog').open) byId('notes-dialog').close();
    return;
  }
  if (event.target.closest('input,select,textarea,pre')) return;
  if (event.key === ' ' && event.target.closest('button,a')) return;
  const key = event.key.toLowerCase();
  if (['arrowright','arrowdown','pagedown',' '].includes(key)) { event.preventDefault(); showSlide(currentSlide + 1); }
  else if (['arrowleft','arrowup','pageup'].includes(key)) { event.preventDefault(); showSlide(currentSlide - 1); }
  else if (key === 'home') { event.preventDefault(); showSlide(0); }
  else if (key === 'end') { event.preventDefault(); showSlide(slides.length - 1); }
  else if (key === 'f') { event.preventDefault(); toggleFullscreen(); }
  else if (key === 'n') { event.preventDefault(); openDialog('notes-dialog'); }
  else if (key === 'o') { event.preventDefault(); openDialog('overview-dialog'); }
  else if (/^[1-8]$/.test(key)) showSlide(Number(key) - 1);
});

let touchStart = null;
const viewport = document.querySelector('.viewport');
viewport.addEventListener('touchstart', (event) => {
  if (event.target.closest('button,a,select,pre')) { touchStart = null; return; }
  touchStart = {x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY};
}, {passive:true});
viewport.addEventListener('touchend', (event) => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy) * 1.5) showSlide(currentSlide + (dx < 0 ? 1 : -1));
  touchStart = null;
}, {passive:true});

window.addEventListener('hashchange', fromHash);
window.addEventListener('resize', fitStage);
document.addEventListener('fullscreenchange', () => {
  const fullscreen = Boolean(document.fullscreenElement);
  byId('fullscreen-button').setAttribute('aria-label', fullscreen ? 'Sair da tela cheia' : 'Ativar tela cheia');
  fitStage();
});
showCommand(0);
fromHash();
fitStage();
