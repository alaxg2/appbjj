import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Users, Award, CalendarDays, Trophy, Plus, Search, X,
  Pencil, Trash2, Check, Download, RotateCcw, Clock, MapPin, UserCheck, AlertCircle,
  Megaphone, Settings, LogOut, MessageCircle, KeyRound, Copy, ChevronLeft,
  Smartphone, Home, User, Pin, ShieldCheck, Upload, RefreshCw, Plug
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Regras de faixa                                                     */
/* ------------------------------------------------------------------ */

const FAIXAS = {
  branca:  { nome: 'Branca',  cor: '#F3F2ED', ponta: '#151515', grau: '#FFFFFF', contorno: true, mesesGrau: 3, aulasGrau: 24, mesesFaixa: 12, aulasFaixa: 96 },
  cinza:   { nome: 'Cinza',   cor: '#8D948F', ponta: '#151515', grau: '#FFFFFF', mesesGrau: 3, aulasGrau: 24, mesesFaixa: 12, aulasFaixa: 90 },
  amarela: { nome: 'Amarela', cor: '#E0BA21', ponta: '#151515', grau: '#FFFFFF', mesesGrau: 4, aulasGrau: 30, mesesFaixa: 18, aulasFaixa: 120 },
  laranja: { nome: 'Laranja', cor: '#DB7222', ponta: '#151515', grau: '#FFFFFF', mesesGrau: 4, aulasGrau: 30, mesesFaixa: 18, aulasFaixa: 120 },
  verde:   { nome: 'Verde',   cor: '#2C7D4E', ponta: '#151515', grau: '#FFFFFF', mesesGrau: 4, aulasGrau: 30, mesesFaixa: 24, aulasFaixa: 150 },
  azul:    { nome: 'Azul',    cor: '#1C5A9E', ponta: '#151515', grau: '#FFFFFF', mesesGrau: 6, aulasGrau: 48, mesesFaixa: 24, aulasFaixa: 210 },
  roxa:    { nome: 'Roxa',    cor: '#5E2C86', ponta: '#151515', grau: '#FFFFFF', mesesGrau: 6, aulasGrau: 48, mesesFaixa: 18, aulasFaixa: 170 },
  marrom:  { nome: 'Marrom',  cor: '#59381F', ponta: '#151515', grau: '#FFFFFF', mesesGrau: 6, aulasGrau: 48, mesesFaixa: 12, aulasFaixa: 130 },
  preta:   { nome: 'Preta',   cor: '#161616', ponta: '#A81F12', grau: '#FFFFFF', mesesGrau: 36, aulasGrau: 0, mesesFaixa: null, aulasFaixa: null },
};

const ORDEM_ADULTO = ['branca', 'azul', 'roxa', 'marrom', 'preta'];
const ORDEM_INFANTIL = ['branca', 'cinza', 'amarela', 'laranja', 'verde'];
const ORDEM_MURAL = ['preta', 'marrom', 'roxa', 'azul', 'verde', 'laranja', 'amarela', 'cinza', 'branca'];

const IDADE_MINIMA = { cinza: 4, amarela: 7, laranja: 10, verde: 13, azul: 16, roxa: 16, marrom: 18, preta: 19 };

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const NIVEIS = ['Fundamentos', 'Todos os níveis', 'Avançado', 'No-gi', 'Infantil', 'Feminino'];
const TIPOS_EVENTO = ['Campeonato', 'Seminário', 'Graduação', 'Open mat', 'Social'];
const PLANOS = ['Mensal 2x', 'Mensal 3x', 'Ilimitado', 'Anual', 'Kids'];

const SEXOS = ['Feminino', 'Masculino', 'Prefiro não informar'];

const TEXTO_IMAGEM = 'Declaro para os devidos fins que autorizo a utilização de minha imagem, em caráter gratuito, pela Fundação Catarinense de Assistência Social — FUCAS. Esta autorização se refere a fotos ou imagens em vídeo, com ou sem captação de som, produzidas pela própria FUCAS, para uso restritamente educativo, para serem veiculadas em mídias eletrônicas da instituição.';

const PLANILHA_URL = 'https://script.google.com/macros/s/AKfycbzDN0lQ8lC8R46TxchIzIvmQoE19Rd6Gb-B0khcEKlO_KtfjhD81xdcUgCGCs7MvKwyRg/exec';

const CHAVE = 'academia_jj:estado_v1';
const CHAVE_SESSAO = 'academia_jj:sessao';

/* ------------------------------------------------------------------ */
/* Utilidades de data                                                  */
/* ------------------------------------------------------------------ */

const iso = (d = new Date()) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

const paraData = (s) => {
  if (!s) return new Date();
  const [a, m, d] = s.split('-').map(Number);
  return new Date(a, m - 1, d);
};

const somaMeses = (n, base = new Date()) => {
  const d = new Date(base.getFullYear(), base.getMonth() + n, base.getDate());
  return iso(d);
};

const somaDias = (n, base = new Date()) => {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
  return iso(d);
};

const mesesEntre = (inicio, fim = iso()) => {
  if (!inicio) return 0;
  const a = paraData(inicio), b = paraData(fim);
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
};

const idade = (nascimento) => {
  if (!nascimento) return 0;
  const n = paraData(nascimento), h = new Date();
  let i = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) i -= 1;
  return i;
};

const dataBR = (s) => (s ? s.split('-').reverse().join('/') : '—');

const duracao = (meses) => {
  if (meses < 1) return 'menos de 1 mês';
  if (meses < 12) return meses + (meses === 1 ? ' mês' : ' meses');
  const anos = Math.floor(meses / 12), resto = meses % 12;
  const parteAnos = anos + (anos === 1 ? ' ano' : ' anos');
  if (!resto) return parteAnos;
  return parteAnos + ' e ' + resto + (resto === 1 ? ' mês' : ' meses');
};

const uid = () => Math.random().toString(36).slice(2, 10);

const semAcento = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const soDigitos = (t) => (t || '').replace(/\D/g, '');

const gerarLogin = (nome, usados = []) => {
  const partes = semAcento(nome).trim().toLowerCase().split(/\s+/).filter(Boolean);
  let base = ((partes[0] || 'aluno') + (partes.length > 1 ? '.' + partes[partes.length - 1] : '')).replace(/[^a-z.]/g, '');
  let login = base, n = 2;
  while (usados.includes(login)) { login = base + n; n += 1; }
  return login;
};

const gerarSenha = () => {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ', numeros = '23456789';
  let s = '';
  for (let i = 0; i < 3; i += 1) s += letras[Math.floor(Math.random() * letras.length)];
  for (let i = 0; i < 3; i += 1) s += numeros[Math.floor(Math.random() * numeros.length)];
  return s;
};

const linkWhats = (numero, texto) => {
  let n = soDigitos(numero);
  if (!n) return null;
  if (n.length <= 11) n = '55' + n;
  return 'https://wa.me/' + n + (texto ? '?text=' + encodeURIComponent(texto) : '');
};

const mensagemAcesso = (aluno, config) => [
  'Olá, ' + aluno.nome.split(' ')[0] + '! Seu acesso ao app da ' + config.nome + ' já está liberado.',
  '',
  'Login: ' + aluno.login,
  'Senha: ' + aluno.senha,
  config.linkApp ? 'App: ' + config.linkApp : '',
  '',
  config.grupoWhats ? 'Entre também no grupo da academia: ' + config.grupoWhats : '',
  'No app você acompanha a agenda de treinos, os eventos, os avisos e a sua evolução de faixa.',
].filter(Boolean).join('\n');

const abrir = (url) => { if (url) window.open(url, '_blank', 'noopener'); };

const paraPlanilha = (estado) => ({
  config: {
    nome: estado.config.nome,
    grupoWhats: estado.config.grupoWhats,
    linkApp: estado.config.linkApp,
    admin: estado.config.admin,
    logo: estado.config.logo && estado.config.logo.length < 45000 ? estado.config.logo : '',
  },
  alunos: estado.alunos,
  turmas: estado.turmas,
  eventos: estado.eventos,
  informativos: estado.informativos,
});

const chamarPlanilha = async (url, opcoes) => {
  let r;
  try {
    r = await fetch(url, opcoes);
  } catch (e) {
    throw new Error('Não alcancei o endereço. Pode ser a janela onde o app está rodando bloqueando a conexão, ou falta de internet.');
  }
  const texto = await r.text();
  if (r.status === 404) throw new Error('O Google respondeu 404: a implantação não existe ou foi publicada sem o código. Salve o script e crie uma nova implantação.');
  if (r.status === 401 || r.status === 403) throw new Error('Acesso negado: republique a implantação com "Qualquer pessoa" em quem pode acessar.');
  if (!r.ok) throw new Error('O Google respondeu com o código ' + r.status + '.');
  if (texto.trim().startsWith('<')) throw new Error('Veio uma página do Google em vez de dados, normalmente tela de login: republique com acesso para "Qualquer pessoa".');
  let j;
  try { j = JSON.parse(texto); } catch (e) { throw new Error('A resposta não veio em formato de dados.'); }
  if (!j.ok) throw new Error(j.erro === 'Token invalido' ? 'O token do app não confere com o do script.' : (j.erro || 'A planilha recusou o pedido.'));
  return j;
};

const lerPlanilha = async (cfg) => {
  const url = cfg.url + (cfg.url.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(cfg.token || '');
  const j = await chamarPlanilha(url, { method: 'GET' });
  return j.dados;
};

const gravarPlanilha = async (cfg, estado) => chamarPlanilha(cfg.url, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify({ token: cfg.token || '', dados: paraPlanilha(estado) }),
});

const agora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/* ------------------------------------------------------------------ */
/* Regras de graduação                                                 */
/* ------------------------------------------------------------------ */

const proximaFaixa = (aluno) => {
  if (aluno.categoria === 'infantil') {
    if (aluno.faixa === 'verde') return 'azul';
    const i = ORDEM_INFANTIL.indexOf(aluno.faixa);
    return i >= 0 && i < ORDEM_INFANTIL.length - 1 ? ORDEM_INFANTIL[i + 1] : null;
  }
  const i = ORDEM_ADULTO.indexOf(aluno.faixa);
  return i >= 0 && i < ORDEM_ADULTO.length - 1 ? ORDEM_ADULTO[i + 1] : null;
};

const presencasDesde = (aluno, data) => (aluno.presencas || []).filter((p) => p >= data).length;

const requisitos = (aluno) => {
  const f = FAIXAS[aluno.faixa];
  if (!f) return null;

  if (aluno.graus < 4) {
    const mesesFeitos = mesesEntre(aluno.desdeGrau);
    const aulasFeitas = presencasDesde(aluno, aluno.desdeGrau);
    const r = {
      tipo: 'grau',
      alvo: (aluno.graus + 1) + 'º grau',
      mesesNec: f.mesesGrau, mesesFeitos,
      aulasNec: f.aulasGrau, aulasFeitas,
      idadeNec: 0, idadeAtual: idade(aluno.nascimento),
    };
    r.apto = mesesFeitos >= r.mesesNec && aulasFeitas >= r.aulasNec;
    r.progresso = media(mesesFeitos / r.mesesNec, r.aulasNec ? aulasFeitas / r.aulasNec : 1);
    return r;
  }

  const prox = proximaFaixa(aluno);
  if (!prox || f.mesesFaixa == null) return null;

  const mesesFeitos = mesesEntre(aluno.desdeFaixa);
  const aulasFeitas = presencasDesde(aluno, aluno.desdeFaixa);
  const idadeNec = IDADE_MINIMA[prox] || 0;
  const idadeAtual = idade(aluno.nascimento);
  const r = {
    tipo: 'faixa', alvo: 'faixa ' + FAIXAS[prox].nome, faixaAlvo: prox,
    mesesNec: f.mesesFaixa, mesesFeitos,
    aulasNec: f.aulasFaixa, aulasFeitas,
    idadeNec, idadeAtual,
  };
  r.apto = mesesFeitos >= r.mesesNec && aulasFeitas >= r.aulasNec && idadeAtual >= idadeNec;
  r.progresso = media(mesesFeitos / r.mesesNec, aulasFeitas / r.aulasNec);
  return r;
};

const media = (a, b) => Math.min(1, (Math.min(1, a) + Math.min(1, b)) / 2);

/* ------------------------------------------------------------------ */
/* Dados de exemplo                                                    */
/* ------------------------------------------------------------------ */

function gerarPresencas(desde, porSemana) {
  const limite = somaMeses(-24);
  const inicio = paraData(desde > limite ? desde : limite);
  const hoje = new Date();
  const lista = [];
  const chance = porSemana / 5;
  for (let d = new Date(inicio); d <= hoje; d.setDate(d.getDate() + 1)) {
    const dia = d.getDay();
    if (dia === 0) continue;
    if (dia === 6 && Math.random() > 0.35) continue;
    if (dia !== 6 && Math.random() > chance) continue;
    lista.push(iso(d));
  }
  return lista;
}

function novoAluno(base) {
  const a = {
    id: uid(), telefone: '', whatsapp: '', email: '', plano: 'Mensal 3x', status: 'ativo', obs: '',
    naturalidade: '', sexo: '', cpf: '', endereco: '', bairro: '', cep: '',
    respNome: '', respCpf: '', respTelefone: '',
    medicamentos: '', alergias: '', planoSaude: '',
    autorizaImagem: false, autorizadoEm: '', login: '', senha: '',
    presencas: [], historico: [], ...base,
  };
  if (!a.whatsapp) a.whatsapp = a.telefone;
  if (!a.login) a.login = gerarLogin(a.nome);
  if (!a.senha) a.senha = gerarSenha();
  a.presencas = a.presencas.length ? a.presencas : gerarPresencas(a.desdeFaixa, base.frequencia || 3);
  delete a.frequencia;
  a.historico = a.historico.length ? a.historico : [
    { id: uid(), data: a.desdeFaixa, tipo: 'faixa', faixa: a.faixa, graus: 0, obs: 'Graduado para faixa ' + FAIXAS[a.faixa].nome.toLowerCase() },
  ];
  return a;
}

function dadosExemplo() {
  const alunos = [
    novoAluno({ nome: 'Rafael Andrade', nascimento: '1989-04-12', categoria: 'adulto', faixa: 'preta', graus: 2, inicio: '2009-03-02', desdeFaixa: somaMeses(-96), desdeGrau: somaMeses(-30), plano: 'Ilimitado', telefone: '(48) 99114-2210', email: 'rafael@exemplo.com', frequencia: 4, obs: 'Professor responsável pela turma avançada.' }),
    novoAluno({ nome: 'Juliana Moraes', nascimento: '1993-09-30', categoria: 'adulto', faixa: 'marrom', graus: 4, inicio: '2014-06-10', desdeFaixa: somaMeses(-14), desdeGrau: somaMeses(-7), plano: 'Ilimitado', telefone: '(48) 99820-4471', email: 'juliana@exemplo.com', frequencia: 4 }),
    novoAluno({ nome: 'Bruno Tavares', nascimento: '1995-01-22', categoria: 'adulto', faixa: 'roxa', graus: 2, inicio: '2016-02-15', desdeFaixa: somaMeses(-15), desdeGrau: somaMeses(-8), plano: 'Mensal 3x', telefone: '(48) 99663-0182', frequencia: 3 }),
    novoAluno({ nome: 'Carla Nunes', nascimento: '1991-11-05', categoria: 'adulto', faixa: 'roxa', graus: 0, inicio: '2017-08-01', desdeFaixa: somaMeses(-4), desdeGrau: somaMeses(-4), plano: 'Mensal 2x', frequencia: 2 }),
    novoAluno({ nome: 'Thiago Beltrão', nascimento: '1997-07-19', categoria: 'adulto', faixa: 'azul', graus: 4, inicio: '2019-09-12', desdeFaixa: somaMeses(-26), desdeGrau: somaMeses(-7), plano: 'Ilimitado', telefone: '(48) 99187-7745', frequencia: 4 }),
    novoAluno({ nome: 'Diego Ferraz', nascimento: '1990-03-08', categoria: 'adulto', faixa: 'azul', graus: 3, inicio: '2020-01-20', desdeFaixa: somaMeses(-19), desdeGrau: somaMeses(-5), plano: 'Mensal 3x', frequencia: 3 }),
    novoAluno({ nome: 'Marina Lopes', nascimento: '1999-12-01', categoria: 'adulto', faixa: 'azul', graus: 1, inicio: '2021-05-03', desdeFaixa: somaMeses(-10), desdeGrau: somaMeses(-4), plano: 'Mensal 2x', frequencia: 2 }),
    novoAluno({ nome: 'Ana Paula Ribeiro', nascimento: '1996-06-23', categoria: 'adulto', faixa: 'branca', graus: 4, inicio: somaMeses(-13), desdeFaixa: somaMeses(-13), desdeGrau: somaMeses(-4), plano: 'Mensal 3x', telefone: '(48) 99501-3390', frequencia: 4 }),
    novoAluno({ nome: 'Lucas Vasques', nascimento: '2001-02-14', categoria: 'adulto', faixa: 'branca', graus: 2, inicio: somaMeses(-8), desdeFaixa: somaMeses(-8), desdeGrau: somaMeses(-3), plano: 'Mensal 2x', frequencia: 3 }),
    novoAluno({ nome: 'Priscila Gomes', nascimento: '1994-10-09', categoria: 'adulto', faixa: 'branca', graus: 1, inicio: somaMeses(-5), desdeFaixa: somaMeses(-5), desdeGrau: somaMeses(-2), plano: 'Mensal 2x', frequencia: 2 }),
    novoAluno({ nome: 'Gustavo Lima', nascimento: '2003-08-27', categoria: 'adulto', faixa: 'branca', graus: 0, inicio: somaMeses(-1), desdeFaixa: somaMeses(-1), desdeGrau: somaMeses(-1), plano: 'Mensal 2x', frequencia: 2 }),
    novoAluno({ nome: 'Fernando Sales', nascimento: '1988-05-16', categoria: 'adulto', faixa: 'azul', graus: 2, inicio: '2018-04-04', desdeFaixa: somaMeses(-30), desdeGrau: somaMeses(-16), plano: 'Mensal 2x', status: 'inativo', frequencia: 1, obs: 'Afastado por lesão no joelho desde março.' }),
    novoAluno({ nome: 'Pedro Henrique Souza', nascimento: '2017-01-30', categoria: 'infantil', faixa: 'cinza', graus: 2, inicio: somaMeses(-20), desdeFaixa: somaMeses(-11), desdeGrau: somaMeses(-4), plano: 'Kids', telefone: '(48) 99777-1145', obs: 'Responsável: Camila Souza.', frequencia: 2 }),
    novoAluno({ nome: 'Isabela Ramos', nascimento: '2014-04-18', categoria: 'infantil', faixa: 'amarela', graus: 1, inicio: somaMeses(-30), desdeFaixa: somaMeses(-13), desdeGrau: somaMeses(-5), plano: 'Kids', telefone: '(48) 99204-6688', obs: 'Responsável: Marcos Ramos.', frequencia: 3 }),
  ];

  const turmas = [
    { id: uid(), titulo: 'Fundamentos', dias: [1, 3, 5], inicio: '06:30', fim: '07:30', professor: 'Rafael Andrade', nivel: 'Fundamentos' },
    { id: uid(), titulo: 'Treino do meio-dia', dias: [2, 4], inicio: '12:00', fim: '13:00', professor: 'Juliana Moraes', nivel: 'Todos os níveis' },
    { id: uid(), titulo: 'Kids', dias: [1, 3, 5], inicio: '17:30', fim: '18:20', professor: 'Juliana Moraes', nivel: 'Infantil' },
    { id: uid(), titulo: 'Turma geral', dias: [1, 2, 3, 4], inicio: '19:30', fim: '20:45', professor: 'Rafael Andrade', nivel: 'Todos os níveis' },
    { id: uid(), titulo: 'Avançado', dias: [2, 4], inicio: '20:45', fim: '22:00', professor: 'Rafael Andrade', nivel: 'Avançado' },
    { id: uid(), titulo: 'No-gi', dias: [5], inicio: '19:30', fim: '20:45', professor: 'Bruno Tavares', nivel: 'No-gi' },
    { id: uid(), titulo: 'Open mat', dias: [6], inicio: '10:00', fim: '12:00', professor: 'Aberto', nivel: 'Todos os níveis' },
  ];

  const eventos = [
    { id: uid(), titulo: 'Seminário de guarda de laço', data: somaDias(12), tipo: 'Seminário', local: 'Tatame principal', hora: '14:00', descricao: 'Convidado faixa-preta. Aberto a partir da faixa azul.' },
    { id: uid(), titulo: 'Copa Regional de Jiu-Jitsu', data: somaDias(33), tipo: 'Campeonato', local: 'Ginásio municipal', hora: '08:00', descricao: 'Inscrições até uma semana antes. Pesagem no dia.' },
    { id: uid(), titulo: 'Graduação de fim de temporada', data: somaDias(74), tipo: 'Graduação', local: 'Academia', hora: '19:00', descricao: 'Entrega de faixas e graus. Confraternização depois.' },
    { id: uid(), titulo: 'Open mat beneficente', data: somaDias(-9), tipo: 'Open mat', local: 'Academia', hora: '10:00', descricao: 'Entrada com 1 kg de alimento.' },
  ];

  const informativos = [
    { id: uid(), titulo: 'Graduação de dezembro: como se preparar', texto: 'Quem for graduar precisa estar com a mensalidade em dia e comparecer de kimono branco. A lista dos graduados sai duas semanas antes.', data: somaDias(-2), fixado: true },
    { id: uid(), titulo: 'Sábado sem treino no feriado', texto: 'Não teremos open mat no sábado de feriado. Voltamos no horário normal na semana seguinte.', data: somaDias(-8), fixado: false },
    { id: uid(), titulo: 'Lavagem do tatame', texto: 'O tatame passa por higienização toda primeira segunda-feira do mês, antes da aula das 6h30. Chegue com 10 minutos de antecedência.', data: somaDias(-16), fixado: false },
  ];

  return {
    config: {
      nome: 'Jiu-Jitsu Para Cristo', logo: null, grupoWhats: '', linkApp: '',
      admin: { usuario: 'admin', senha: 'admin123' },
      planilha: { url: PLANILHA_URL, token: '' },
    },
    alunos, turmas, eventos, informativos,
  };
}

/* ------------------------------------------------------------------ */
/* Componentes visuais                                                 */
/* ------------------------------------------------------------------ */

function Faixa({ faixa, graus = 0, altura = 16, largura = '100%', titulo }) {
  const f = FAIXAS[faixa] || FAIXAS.branca;
  return (
    <div
      className={'faixa' + (f.contorno ? ' faixa-clara' : '')}
      style={{ height: altura, width: largura, background: f.cor }}
      title={titulo || f.nome + (graus ? ' · ' + graus + 'º grau' : '')}
      role="img"
      aria-label={'Faixa ' + f.nome.toLowerCase() + (graus ? ', ' + graus + ' graus' : '')}
    >
      <span className="faixa-ponta" style={{ background: f.ponta }}>
        {Array.from({ length: graus }).map((_, i) => (
          <span key={i} className="grau" style={{ background: f.grau }} />
        ))}
      </span>
    </div>
  );
}

function Emblema({ nome, logo, aoTrocar }) {
  const ref = React.useRef(null);
  const iniciais = (nome || '')
    .split(/[\s-]+/).filter((p) => p.length > 2 && !['para', 'academia', 'jiu', 'jitsu', 'team', 'clube'].includes(p.toLowerCase()))
    .slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'JJ';

  const escolher = (e) => {
    const arq = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!arq) return;
    if (arq.size > 1500000) return aoTrocar(null, 'Imagem grande demais. Use um arquivo de até 1,5 MB.');
    const leitor = new FileReader();
    leitor.onload = () => aoTrocar(leitor.result);
    leitor.onerror = () => aoTrocar(null, 'Não consegui ler esse arquivo.');
    leitor.readAsDataURL(arq);
  };

  return (
    <>
      <button className="emblema-botao" onClick={() => ref.current && ref.current.click()} title="Trocar o logo da academia" aria-label="Trocar o logo da academia">
        {logo ? <img src={logo} alt="" /> : (
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="32" cy="32" r="23.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <text x="32" y="40" textAnchor="middle" fontFamily="'Barlow Condensed',Arial,sans-serif" fontSize="23" fontWeight="700" fill="currentColor">{iniciais}</text>
          </svg>
        )}
      </button>
      <input ref={ref} type="file" accept="image/*" onChange={escolher} style={{ display: 'none' }} />
    </>
  );
}

function Barra({ valor, alerta }) {
  return (
    <div className="barra">
      <span className="barra-preenchida" style={{ width: Math.round(Math.min(1, valor) * 100) + '%', background: alerta ? 'var(--ouro)' : 'var(--mat-3)' }} />
    </div>
  );
}

function Modal({ titulo, children, aoFechar, largo }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aoFechar]);
  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div className={'modal' + (largo ? ' modal-largo' : '')} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-topo">
          <h2>{titulo}</h2>
          <button className="icone" onClick={aoFechar} aria-label="Fechar"><X size={18} /></button>
        </div>
        <div className="modal-corpo">{children}</div>
      </div>
    </div>
  );
}

function Campo({ rotulo, children, largura }) {
  return (
    <label className="campo" style={largura ? { gridColumn: 'span ' + largura } : undefined}>
      <span>{rotulo}</span>
      {children}
    </label>
  );
}

function Vazio({ titulo, texto, acao }) {
  return (
    <div className="vazio">
      <p className="vazio-titulo">{titulo}</p>
      <p className="vazio-texto">{texto}</p>
      {acao}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [semStorage, setSemStorage] = useState(false);
  const [sessao, setSessao] = useState(null);
  const [aba, setAba] = useState('inicio');
  const [aviso, setAviso] = useState('');
  const [sinc, setSinc] = useState({ estado: 'local' });
  const relogio = React.useRef(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      let estado = null;
      try {
        const r = await window.storage.get(CHAVE);
        estado = JSON.parse(r.value);
      } catch (e) {
        estado = null;
      }
      if (!estado) {
        estado = dadosExemplo();
        try { await window.storage.set(CHAVE, JSON.stringify(estado)); }
        catch (e) { if (vivo) setSemStorage(true); }
      }
      if (!estado.informativos) estado.informativos = [];
      if (!estado.config.admin) estado.config.admin = { usuario: 'admin', senha: 'admin123' };
      if (estado.config.grupoWhats === undefined) estado.config.grupoWhats = '';
      if (!estado.config.planilha) estado.config.planilha = { url: PLANILHA_URL, token: '' };
      if (!estado.config.planilha.url) estado.config.planilha.url = PLANILHA_URL;
      if (estado.config.linkApp === undefined) estado.config.linkApp = '';
      const usados = estado.alunos.filter((a) => a.login).map((a) => a.login);
      estado.alunos = estado.alunos.map((a) => {
        const whatsapp = a.whatsapp || a.telefone || '';
        if (a.login && a.senha) return { ...a, whatsapp };
        const login = a.login || gerarLogin(a.nome, usados);
        usados.push(login);
        return { ...a, login, senha: a.senha || gerarSenha(), whatsapp };
      });
      let ses = null;
      try { ses = JSON.parse((await window.storage.get(CHAVE_SESSAO)).value); } catch (e) { ses = null; }
      if (vivo) { setDados(estado); setSessao(ses); setCarregando(false); }

      const cfg = estado.config.planilha;
      if (vivo && cfg && cfg.url) {
        setSinc({ estado: 'lendo' });
        try {
          const remoto = await lerPlanilha(cfg);
          if (!vivo) return;
          const juntos = { ...remoto, config: { ...remoto.config, planilha: cfg, logo: remoto.config.logo || estado.config.logo } };
          setDados(juntos);
          setSinc({ estado: 'ok', quando: agora() });
          try { await window.storage.set(CHAVE, JSON.stringify(juntos)); } catch (err) { /* cache opcional */ }
        } catch (err) {
          if (vivo) setSinc({ estado: 'erro', msg: String(err.message || err) });
        }
      }
    })();
    return () => { vivo = false; };
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(''), 3200);
    return () => clearTimeout(t);
  }, [aviso]);

  const gravarLocal = (novo) => {
    setDados(novo);
    (async () => {
      try { await window.storage.set(CHAVE, JSON.stringify(novo)); }
      catch (e) { setSemStorage(true); }
    })();
  };

  const agendarEnvio = (novo) => {
    const cfg = novo.config.planilha;
    if (!cfg || !cfg.url) return;
    if (relogio.current) clearTimeout(relogio.current);
    setSinc({ estado: 'enviando' });
    relogio.current = setTimeout(async () => {
      try {
        await gravarPlanilha(cfg, novo);
        setSinc({ estado: 'ok', quando: agora() });
      } catch (e) {
        setSinc({ estado: 'erro', msg: String(e.message || e) });
      }
    }, 1500);
  };

  const salvar = (novo, msg) => {
    gravarLocal(novo);
    if (msg) setAviso(msg);
    agendarEnvio(novo);
  };

  const puxarDaPlanilha = async () => {
    const cfg = dados.config.planilha;
    if (!cfg.url) return setAviso('Informe primeiro o endereço da planilha.');
    setSinc({ estado: 'lendo' });
    try {
      const remoto = await lerPlanilha(cfg);
      const juntos = { ...remoto, config: { ...remoto.config, planilha: cfg, logo: remoto.config.logo || dados.config.logo } };
      gravarLocal(juntos);
      setSinc({ estado: 'ok', quando: agora() });
      setAviso('Dados carregados da planilha');
    } catch (e) {
      setSinc({ estado: 'erro', msg: String(e.message || e) });
      setAviso('Não consegui ler a planilha');
    }
  };

  const testarPlanilha = async () => {
    const cfg = dados.config.planilha;
    setSinc({ estado: 'lendo' });
    try {
      const remoto = await lerPlanilha(cfg);
      setSinc({ estado: 'ok', quando: agora() });
      setAviso('Conexão certa: ' + (remoto.alunos || []).length + ' alunos na planilha');
    } catch (e) {
      setSinc({ estado: 'erro', msg: String(e.message || e) });
      setAviso('Conexão falhou');
    }
  };

  const enviarParaPlanilha = async () => {
    const cfg = dados.config.planilha;
    if (!cfg.url) return setAviso('Informe primeiro o endereço da planilha.');
    setSinc({ estado: 'enviando' });
    try {
      await gravarPlanilha(cfg, dados);
      setSinc({ estado: 'ok', quando: agora() });
      setAviso('Planilha atualizada');
    } catch (e) {
      setSinc({ estado: 'erro', msg: String(e.message || e) });
      setAviso('Não consegui gravar na planilha');
    }
  };

  const atualizar = (chave, fn, msg) => salvar({ ...dados, [chave]: fn(dados[chave]) }, msg);

  const entrar = (nova) => {
    setSessao(nova);
    setAba('inicio');
    (async () => { try { await window.storage.set(CHAVE_SESSAO, JSON.stringify(nova)); } catch (e) { /* sessão só nesta janela */ } })();
  };

  const sair = () => {
    setSessao(null);
    (async () => { try { await window.storage.delete(CHAVE_SESSAO); } catch (e) { /* nada a limpar */ } })();
  };

  const exportar = () => {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academia-' + iso() + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (carregando) {
    return (
      <div className="app carregando">
        <Estilos />
        <p>Abrindo a academia…</p>
      </div>
    );
  }

  const alunoSessao = sessao && sessao.tipo === 'aluno' ? dados.alunos.find((a) => a.id === sessao.id) : null;

  if (!sessao || (sessao.tipo === 'aluno' && !alunoSessao)) {
    return (
      <div className="app app-login">
        <Estilos />
        <Login dados={dados} aoEntrar={entrar} />
      </div>
    );
  }

  if (sessao.tipo === 'aluno') {
    return (
      <div className="app app-palco">
        <Estilos />
        <MolduraAluno preview={sessao.preview} aoVoltar={() => entrar({ tipo: 'admin' })}>
          <AppAluno dados={dados} aluno={alunoSessao} aoSair={sair} />
        </MolduraAluno>
        {aviso && <div className="toast">{aviso}</div>}
      </div>
    );
  }

  const abas = [
    { id: 'inicio', rotulo: 'Painel', icone: LayoutDashboard },
    { id: 'alunos', rotulo: 'Alunos', icone: Users },
    { id: 'graduacao', rotulo: 'Graduação', icone: Award },
    { id: 'agenda', rotulo: 'Agenda', icone: CalendarDays },
    { id: 'eventos', rotulo: 'Eventos', icone: Trophy },
    { id: 'informativos', rotulo: 'Informativos', icone: Megaphone },
    { id: 'ajustes', rotulo: 'Ajustes', icone: Settings },
  ];

  return (
    <div className="app">
      <Estilos />

      <nav className="nav">
        <div className="nav-marca">
          <Emblema
            nome={dados.config.nome}
            logo={dados.config.logo}
            aoTrocar={(imagem, msg) => msg ? setAviso(msg) : salvar({ ...dados, config: { ...dados.config, logo: imagem } }, 'Logo atualizado')}
          />
          <div className="nav-marca-texto">
            <input
              value={dados.config.nome}
              onChange={(e) => salvar({ ...dados, config: { ...dados.config, nome: e.target.value } })}
              aria-label="Nome da academia"
              spellCheck={false}
            />
            <span className="nav-marca-sub">Painel do administrador</span>
          </div>
        </div>
        <div className="nav-lista">
          {abas.map((a) => {
            const Ic = a.icone;
            return (
              <button key={a.id} className={'nav-item' + (aba === a.id ? ' ativo' : '')} onClick={() => setAba(a.id)}>
                <Ic size={17} strokeWidth={1.9} />
                <span>{a.rotulo}</span>
              </button>
            );
          })}
        </div>
        <div className="nav-estado">
          <button className={'sinal sinal-' + sinc.estado} onClick={() => setAba('ajustes')} title={sinc.msg || ''}>
            <span className="ponto" />
            {sinc.estado === 'local' && 'Só neste dispositivo'}
            {sinc.estado === 'lendo' && 'Lendo a planilha…'}
            {sinc.estado === 'enviando' && 'Salvando na planilha…'}
            {sinc.estado === 'ok' && 'Planilha em dia' + (sinc.quando ? ' · ' + sinc.quando : '')}
            {sinc.estado === 'erro' && 'Planilha fora do ar'}
          </button>
        </div>
        <div className="nav-rodape">
          <span>{dados.alunos.filter((a) => a.status === 'ativo').length} alunos ativos</span>
          <button className="nav-sair" onClick={sair}><LogOut size={14} /> Sair</button>
        </div>
      </nav>

      <main className="conteudo">
        {semStorage && (
          <div className="alerta">
            <AlertCircle size={16} />
            <span>Não consegui gravar os dados neste navegador. As alterações valem só enquanto esta janela estiver aberta.</span>
          </div>
        )}

        {aba === 'inicio' && <Inicio dados={dados} atualizar={atualizar} irPara={setAba} />}
        {aba === 'alunos' && <Alunos dados={dados} atualizar={atualizar} aoPrever={(id) => entrar({ tipo: 'aluno', id, preview: true })} avisar={setAviso} />}
        {aba === 'graduacao' && <Graduacao dados={dados} atualizar={atualizar} />}
        {aba === 'agenda' && <Agenda dados={dados} atualizar={atualizar} />}
        {aba === 'eventos' && <Eventos dados={dados} atualizar={atualizar} />}
        {aba === 'informativos' && <Informativos dados={dados} atualizar={atualizar} />}
        {aba === 'ajustes' && (
          <Ajustes
            dados={dados} salvar={salvar} exportar={exportar} avisar={setAviso}
            sinc={sinc} aoPuxar={puxarDaPlanilha} aoEnviar={enviarParaPlanilha} aoTestar={testarPlanilha}
          />
        )}
      </main>

      {aviso && <div className="toast">{aviso}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Entrada                                                             */
/* ------------------------------------------------------------------ */

function Login({ dados, aoEntrar }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const exemplo = dados.alunos.find((a) => a.status === 'ativo');

  const tentar = () => {
    const u = usuario.trim().toLowerCase();
    const s = senha.trim();
    if (!u || !s) return setErro('Preencha usuário e senha.');
    const adm = dados.config.admin;
    if (u === String(adm.usuario).toLowerCase() && s === adm.senha) return aoEntrar({ tipo: 'admin' });
    const aluno = dados.alunos.find((a) =>
      String(a.login).toLowerCase() === u || (soDigitos(a.whatsapp) && soDigitos(a.whatsapp) === soDigitos(u)));
    if (aluno && String(aluno.senha).toUpperCase() === s.toUpperCase()) {
      if (aluno.status !== 'ativo') return setErro('Este cadastro está inativo. Procure a recepção da academia.');
      return aoEntrar({ tipo: 'aluno', id: aluno.id });
    }
    setErro('Login ou senha não conferem.');
  };

  const teclado = (e) => { if (e.key === 'Enter') tentar(); };

  return (
    <div className="login-caixa">
      <div className="login-marca">
        <div className="login-emblema">
          {dados.config.logo
            ? <img src={dados.config.logo} alt="" />
            : <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2.5" /><circle cx="32" cy="32" r="23.5" fill="none" stroke="currentColor" strokeWidth="1" /><text x="32" y="40" textAnchor="middle" fontFamily="'Barlow Condensed',Arial,sans-serif" fontSize="23" fontWeight="700" fill="currentColor">JJ</text></svg>}
        </div>
        <h1>{dados.config.nome}</h1>
        <p className="sub">Entre para ver treinos, eventos e a sua evolução.</p>
      </div>

      <div className="campo">
        <span>Login ou WhatsApp</span>
        <input value={usuario} onChange={(e) => setUsuario(e.target.value)} onKeyDown={teclado} autoFocus autoCapitalize="none" />
      </div>
      <div className="campo">
        <span>Senha</span>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={teclado} />
      </div>

      {erro && <p className="erro">{erro}</p>}

      <button className="btn btn-primario btn-largo" onClick={tentar}>Entrar</button>

      <p className="login-dica">
        Acessos deste piloto — administrador: <strong>{dados.config.admin.usuario} / {dados.config.admin.senha}</strong>
        {exemplo && <> · aluno: <strong>{exemplo.login} / {exemplo.senha}</strong></>}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ações compartilhadas                                                */
/* ------------------------------------------------------------------ */

function aplicarGrau(aluno) {
  const hoje = iso();
  return {
    ...aluno,
    graus: aluno.graus + 1,
    desdeGrau: hoje,
    historico: [{ id: uid(), data: hoje, tipo: 'grau', faixa: aluno.faixa, graus: aluno.graus + 1, obs: (aluno.graus + 1) + 'º grau na faixa ' + FAIXAS[aluno.faixa].nome.toLowerCase() }, ...aluno.historico],
  };
}

function aplicarFaixa(aluno, destino) {
  const hoje = iso();
  const categoria = destino === 'azul' && aluno.categoria === 'infantil' ? 'adulto' : aluno.categoria;
  return {
    ...aluno,
    faixa: destino, graus: 0, categoria, desdeFaixa: hoje, desdeGrau: hoje,
    historico: [{ id: uid(), data: hoje, tipo: 'faixa', faixa: destino, graus: 0, obs: 'Graduado para faixa ' + FAIXAS[destino].nome.toLowerCase() }, ...aluno.historico],
  };
}

/* ------------------------------------------------------------------ */
/* Painel                                                             */
/* ------------------------------------------------------------------ */

function Inicio({ dados, atualizar, irPara }) {
  const ativos = dados.alunos.filter((a) => a.status === 'ativo');
  const hoje = iso();
  const diaSemana = new Date().getDay();

  const mural = ORDEM_MURAL
    .map((f) => ({ faixa: f, total: ativos.filter((a) => a.faixa === f).length }))
    .filter((l) => l.total > 0);
  const maior = Math.max(1, ...mural.map((m) => m.total));

  const prontos = ativos.map((a) => ({ aluno: a, req: requisitos(a) })).filter((x) => x.req && x.req.apto);
  const desdeSemana = somaDias(-7);
  const presencasSemana = ativos.reduce((s, a) => s + presencasDesde(a, desdeSemana), 0);
  const novosMes = dados.alunos.filter((a) => a.inicio >= somaDias(-30)).length;

  const aulasHoje = dados.turmas.filter((t) => t.dias.includes(diaSemana)).sort((a, b) => a.inicio.localeCompare(b.inicio));
  const proximos = dados.eventos.filter((e) => e.data >= hoje).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 3);

  const [chamada, setChamada] = useState(null);

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1>{DIAS[diaSemana]}, {dataBR(hoje)}</h1>
          <p className="sub">Um resumo de quem está no tatame e de quem está perto da próxima graduação.</p>
        </div>
      </div>

      <section className="cartao mural">
        <div className="mural-topo">
          <h2 className="titulo-secao">Faixas na academia</h2>
          <span className="sub">{ativos.length} alunos ativos</span>
        </div>
        <div className="mural-lista">
          {mural.map((l) => (
            <div key={l.faixa} className="mural-linha">
              <span className="mural-nome">{FAIXAS[l.faixa].nome}</span>
              <div className="mural-trilho">
                <Faixa faixa={l.faixa} altura={22} largura={Math.max(14, (l.total / maior) * 100) + '%'} />
              </div>
              <span className="mural-total">{l.total}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grade-numeros">
        <Numero valor={ativos.length} rotulo="alunos ativos" />
        <Numero valor={presencasSemana} rotulo="presenças nos últimos 7 dias" />
        <Numero valor={novosMes} rotulo="matrículas no último mês" />
        <Numero valor={prontos.length} rotulo="prontos para graduar" destaque={prontos.length > 0} />
      </div>

      <div className="colunas">
        <section className="cartao">
          <h2 className="titulo-secao">Hoje no tatame</h2>
          {aulasHoje.length === 0 ? (
            <Vazio titulo="Sem aulas hoje" texto="Nenhuma turma cadastrada para este dia da semana." />
          ) : (
            <ul className="lista-limpa">
              {aulasHoje.map((t) => (
                <li key={t.id} className="aula-linha">
                  <span className="hora">{t.inicio}</span>
                  <span className="aula-info">
                    <strong>{t.titulo}</strong>
                    <span className="sub">{t.nivel} · {t.professor}</span>
                  </span>
                  <button className="btn btn-fantasma" onClick={() => setChamada(t)}>
                    <UserCheck size={15} /> Chamada
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="cartao">
          <h2 className="titulo-secao">Próximos eventos</h2>
          {proximos.length === 0 ? (
            <Vazio titulo="Agenda livre" texto="Nenhum evento marcado daqui pra frente." acao={<button className="btn btn-fantasma" onClick={() => irPara('eventos')}>Criar evento</button>} />
          ) : (
            <ul className="lista-limpa">
              {proximos.map((e) => (
                <li key={e.id} className="evento-linha">
                  <span className="data-bloco">
                    <strong>{e.data.slice(8, 10)}</strong>
                    <span>{['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][Number(e.data.slice(5, 7)) - 1]}</span>
                  </span>
                  <span className="aula-info">
                    <strong>{e.titulo}</strong>
                    <span className="sub">{e.tipo} · {e.local}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {prontos.length > 0 && (
        <section className="cartao">
          <h2 className="titulo-secao">Prontos para graduar</h2>
          <ul className="lista-limpa">
            {prontos.map(({ aluno, req }) => (
              <li key={aluno.id} className="pronto-linha">
                <Faixa faixa={aluno.faixa} graus={aluno.graus} largura={72} altura={14} />
                <span className="aula-info">
                  <strong>{aluno.nome}</strong>
                  <span className="sub">cumpriu os requisitos para {req.alvo}</span>
                </span>
                <button className="btn btn-fantasma" onClick={() => irPara('graduacao')}>Ver</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {chamada && (
        <ModalChamada turma={chamada} dados={dados} atualizar={atualizar} aoFechar={() => setChamada(null)} />
      )}
    </>
  );
}

function Numero({ valor, rotulo, destaque }) {
  return (
    <div className={'numero' + (destaque ? ' numero-destaque' : '')}>
      <strong>{valor}</strong>
      <span>{rotulo}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Alunos                                                              */
/* ------------------------------------------------------------------ */

function Alunos({ dados, atualizar, aoPrever, avisar }) {
  const [busca, setBusca] = useState('');
  const [filtroFaixa, setFiltroFaixa] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('ativo');
  const [editando, setEditando] = useState(null);
  const [detalhe, setDetalhe] = useState(null);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return dados.alunos
      .filter((a) => (filtroStatus === 'todos' ? true : a.status === filtroStatus))
      .filter((a) => (filtroFaixa === 'todas' ? true : a.faixa === filtroFaixa))
      .filter((a) => !termo || a.nome.toLowerCase().includes(termo))
      .sort((a, b) => ORDEM_MURAL.indexOf(a.faixa) - ORDEM_MURAL.indexOf(b.faixa) || b.graus - a.graus || a.nome.localeCompare(b.nome));
  }, [dados.alunos, busca, filtroFaixa, filtroStatus]);

  const alunoDetalhe = detalhe ? dados.alunos.find((a) => a.id === detalhe) : null;

  const salvarAluno = (aluno) => {
    atualizar('alunos', (lista) => (lista.some((a) => a.id === aluno.id) ? lista.map((a) => (a.id === aluno.id ? aluno : a)) : [...lista, aluno]), 'Aluno salvo');
    setEditando(null);
  };

  const loginsUsados = dados.alunos.map((a) => a.login);

  const remover = (id) => {
    atualizar('alunos', (l) => l.filter((a) => a.id !== id), 'Aluno removido');
    setDetalhe(null);
  };

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1>Alunos</h1>
          <p className="sub">Cadastro, frequência e histórico de cada um.</p>
        </div>
        <button className="btn btn-primario" onClick={() => setEditando({})}><Plus size={16} /> Novo aluno</button>
      </div>

      <div className="filtros">
        <div className="busca">
          <Search size={16} />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome" aria-label="Buscar aluno" />
        </div>
        <select value={filtroFaixa} onChange={(e) => setFiltroFaixa(e.target.value)} aria-label="Filtrar por faixa">
          <option value="todas">Todas as faixas</option>
          {ORDEM_MURAL.map((f) => <option key={f} value={f}>{FAIXAS[f].nome}</option>)}
        </select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} aria-label="Filtrar por situação">
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {lista.length === 0 ? (
        <div className="cartao">
          <Vazio titulo="Nenhum aluno por aqui" texto="Ajuste os filtros ou cadastre o primeiro aluno da academia." acao={<button className="btn btn-primario" onClick={() => setEditando({})}><Plus size={16} /> Novo aluno</button>} />
        </div>
      ) : (
        <div className="cartao sem-padding">
          <div className="tabela-topo">
            <span>Aluno</span><span>Faixa</span><span>Na faixa há</span><span>Aulas / 30 dias</span><span>Próxima graduação</span>
          </div>
          <ul className="tabela">
            {lista.map((a) => {
              const req = requisitos(a);
              return (
                <li key={a.id}>
                  <button className={'tabela-linha' + (a.status === 'inativo' ? ' inativo' : '')} onClick={() => setDetalhe(a.id)}>
                    <span className="celula-nome">
                      <strong>{a.nome}</strong>
                      <span className="sub">{a.plano}{a.status === 'inativo' ? ' · inativo' : ''}</span>
                    </span>
                    <span className="celula-faixa"><Faixa faixa={a.faixa} graus={a.graus} largura={84} altura={14} /></span>
                    <span className="celula-sub">{duracao(mesesEntre(a.desdeFaixa))}</span>
                    <span className="celula-sub">{presencasDesde(a, somaDias(-30))}</span>
                    <span className="celula-prog">
                      {req ? (
                        <>
                          <Barra valor={req.progresso} alerta={req.apto} />
                          <span className="sub">{req.apto ? 'apto a ' + req.alvo : req.alvo}</span>
                        </>
                      ) : <span className="sub">graduação manual</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {editando && <ModalAluno inicial={editando} loginsUsados={loginsUsados} aoSalvar={salvarAluno} aoFechar={() => setEditando(null)} />}

      {alunoDetalhe && (
        <PainelAluno
          aluno={alunoDetalhe}
          dados={dados}
          atualizar={atualizar}
          avisar={avisar}
          aoPrever={() => aoPrever(alunoDetalhe.id)}
          aoFechar={() => setDetalhe(null)}
          aoEditar={() => { setEditando(alunoDetalhe); setDetalhe(null); }}
          aoRemover={() => remover(alunoDetalhe.id)}
        />
      )}
    </>
  );
}

function ModalAluno({ inicial, loginsUsados = [], aoSalvar, aoFechar }) {
  const novo = !inicial.id;
  const [f, setF] = useState(() => ({
    nome: '', nascimento: '', naturalidade: '', sexo: '', cpf: '', telefone: '', whatsapp: '', email: '',
    endereco: '', bairro: '', cep: '', respNome: '', respCpf: '', respTelefone: '',
    medicamentos: '', alergias: '', planoSaude: '',
    autorizaImagem: false, autorizadoEm: '',
    plano: 'Mensal 3x', categoria: 'adulto', faixa: 'branca', graus: 0, status: 'ativo', obs: '',
    inicio: iso(), desdeFaixa: iso(), desdeGrau: iso(), login: '', senha: '',
    ...inicial,
  }));
  const [erro, setErro] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const anos = f.nascimento ? idade(f.nascimento) : null;
  const menor = anos !== null && anos < 18;

  const confirmar = () => {
    if (!f.nome.trim()) return setErro('Informe o nome completo do aluno.');
    if (!f.inicio) return setErro('Informe a data de início na academia.');
    if (!soDigitos(f.whatsapp)) return setErro('O WhatsApp é obrigatório: é por ele que o acesso ao app é enviado.');
    if (menor && !f.respNome.trim()) return setErro('Aluno menor de 18 anos precisa de responsável no cadastro.');

    const base = {
      ...f,
      nome: f.nome.trim(),
      graus: Number(f.graus),
      telefone: f.telefone || f.whatsapp,
      desdeFaixa: f.desdeFaixa || f.inicio,
      desdeGrau: f.desdeGrau || f.desdeFaixa || f.inicio,
      login: f.login || gerarLogin(f.nome, loginsUsados),
      senha: f.senha || gerarSenha(),
      autorizadoEm: f.autorizaImagem ? (f.autorizadoEm || iso()) : '',
    };
    aoSalvar(novo
      ? { id: uid(), presencas: [], historico: [{ id: uid(), data: base.desdeFaixa, tipo: 'faixa', faixa: base.faixa, graus: base.graus, obs: 'Cadastro inicial' }], ...base }
      : base);
  };

  const ordem = f.categoria === 'infantil' ? ORDEM_INFANTIL : ORDEM_ADULTO;

  return (
    <Modal titulo={novo ? 'Novo aluno' : 'Editar aluno'} aoFechar={aoFechar} largo>
      <h3 className="grupo-titulo">Dados pessoais</h3>
      <div className="grade-campos">
        <Campo rotulo="Nome completo" largura={2}><input value={f.nome} onChange={(e) => set('nome', e.target.value)} autoFocus /></Campo>
        <Campo rotulo="Data de nascimento"><input type="date" value={f.nascimento} onChange={(e) => set('nascimento', e.target.value)} /></Campo>
        <Campo rotulo="Idade"><input value={anos === null ? '' : anos + (anos === 1 ? ' ano' : ' anos')} readOnly placeholder="preenche sozinho" /></Campo>
        <Campo rotulo="Naturalidade"><input value={f.naturalidade} onChange={(e) => set('naturalidade', e.target.value)} placeholder="Cidade e estado" /></Campo>
        <Campo rotulo="Sexo">
          <select value={f.sexo} onChange={(e) => set('sexo', e.target.value)}>
            <option value="">Selecione</option>
            {SEXOS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Campo>
        <Campo rotulo="CPF"><input value={f.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="000.000.000-00" inputMode="numeric" /></Campo>
        <Campo rotulo="WhatsApp"><input value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="(48) 90000-0000" inputMode="tel" /></Campo>
        <Campo rotulo="Outro telefone"><input value={f.telefone} onChange={(e) => set('telefone', e.target.value)} inputMode="tel" /></Campo>
        <Campo rotulo="E-mail"><input value={f.email} onChange={(e) => set('email', e.target.value)} inputMode="email" /></Campo>
      </div>

      <h3 className="grupo-titulo">Endereço</h3>
      <div className="grade-campos">
        <Campo rotulo="Rua e número" largura={2}><input value={f.endereco} onChange={(e) => set('endereco', e.target.value)} /></Campo>
        <Campo rotulo="Bairro"><input value={f.bairro} onChange={(e) => set('bairro', e.target.value)} /></Campo>
        <Campo rotulo="CEP"><input value={f.cep} onChange={(e) => set('cep', e.target.value)} placeholder="00000-000" inputMode="numeric" /></Campo>
      </div>

      <h3 className="grupo-titulo">Responsável {menor ? '(obrigatório para menores de 18)' : '(se houver)'}</h3>
      <div className="grade-campos">
        <Campo rotulo="Nome do responsável" largura={2}><input value={f.respNome} onChange={(e) => set('respNome', e.target.value)} /></Campo>
        <Campo rotulo="CPF do responsável"><input value={f.respCpf} onChange={(e) => set('respCpf', e.target.value)} inputMode="numeric" /></Campo>
        <Campo rotulo="Telefone do responsável"><input value={f.respTelefone} onChange={(e) => set('respTelefone', e.target.value)} inputMode="tel" /></Campo>
      </div>

      <h3 className="grupo-titulo">Saúde</h3>
      <div className="grade-campos">
        <Campo rotulo="Faz uso de medicamentos? Quais?" largura={2}><input value={f.medicamentos} onChange={(e) => set('medicamentos', e.target.value)} placeholder="Não / descreva" /></Campo>
        <Campo rotulo="Tem alguma reação alérgica?" largura={2}><input value={f.alergias} onChange={(e) => set('alergias', e.target.value)} placeholder="Não / descreva" /></Campo>
        <Campo rotulo="Tem plano de saúde? Qual?" largura={2}><input value={f.planoSaude} onChange={(e) => set('planoSaude', e.target.value)} placeholder="Não / nome do plano" /></Campo>
      </div>

      <h3 className="grupo-titulo">Autorização de uso de imagem</h3>
      <div className="declaracao">
        <p>{TEXTO_IMAGEM}</p>
        <label className="marcador">
          <input type="checkbox" checked={!!f.autorizaImagem} onChange={(e) => set('autorizaImagem', e.target.checked)} />
          <span>{menor ? 'O responsável autoriza nos termos acima' : 'O aluno autoriza nos termos acima'}</span>
        </label>
        {f.autorizaImagem && f.autorizadoEm && <p className="sub">Autorizado em {dataBR(f.autorizadoEm)}.</p>}
      </div>

      <h3 className="grupo-titulo">Treino e matrícula</h3>
      <div className="grade-campos">
        <Campo rotulo="Turma">
          <select value={f.categoria} onChange={(e) => { const c = e.target.value; setF((s) => ({ ...s, categoria: c, faixa: (c === 'infantil' ? ORDEM_INFANTIL : ORDEM_ADULTO).includes(s.faixa) ? s.faixa : 'branca' })); }}>
            <option value="adulto">Adulto</option>
            <option value="infantil">Infantil</option>
          </select>
        </Campo>
        <Campo rotulo="Plano">
          <select value={f.plano} onChange={(e) => set('plano', e.target.value)}>{PLANOS.map((x) => <option key={x}>{x}</option>)}</select>
        </Campo>
        <Campo rotulo="Faixa">
          <select value={f.faixa} onChange={(e) => set('faixa', e.target.value)}>{ordem.map((b) => <option key={b} value={b}>{FAIXAS[b].nome}</option>)}</select>
        </Campo>
        <Campo rotulo="Graus">
          <select value={f.graus} onChange={(e) => set('graus', e.target.value)}>{[0, 1, 2, 3, 4].map((g) => <option key={g} value={g}>{g}</option>)}</select>
        </Campo>
        <Campo rotulo="Início na academia"><input type="date" value={f.inicio} onChange={(e) => set('inicio', e.target.value)} /></Campo>
        <Campo rotulo="Situação">
          <select value={f.status} onChange={(e) => set('status', e.target.value)}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </Campo>
        <Campo rotulo="Recebeu a faixa em"><input type="date" value={f.desdeFaixa} onChange={(e) => set('desdeFaixa', e.target.value)} /></Campo>
        <Campo rotulo="Último grau em"><input type="date" value={f.desdeGrau} onChange={(e) => set('desdeGrau', e.target.value)} /></Campo>
        <Campo rotulo="Observações" largura={2}>
          <textarea rows={2} value={f.obs} onChange={(e) => set('obs', e.target.value)} placeholder="Lesões, restrições de treino, histórico…" />
        </Campo>
      </div>

      <h3 className="grupo-titulo">Acesso ao app</h3>
      <div className="grade-campos">
        <Campo rotulo="Login"><input value={f.login} onChange={(e) => set('login', e.target.value)} placeholder={novo ? 'gerado automaticamente' : ''} autoCapitalize="none" /></Campo>
        <Campo rotulo="Senha">
          <span className="campo-com-botao">
            <input value={f.senha} onChange={(e) => set('senha', e.target.value)} placeholder={novo ? 'gerada automaticamente' : ''} />
            <button className="btn btn-fantasma btn-mini" onClick={() => set('senha', gerarSenha())}>Sortear</button>
          </span>
        </Campo>
      </div>

      <div className="previa">
        <span className="sub">Como aparece na lista</span>
        <Faixa faixa={f.faixa} graus={Number(f.graus)} largura={140} altura={18} />
      </div>

      {erro && <p className="erro">{erro}</p>}

      <div className="modal-acoes">
        <button className="btn btn-fantasma" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-primario" onClick={confirmar}>{novo ? 'Cadastrar aluno' : 'Salvar alterações'}</button>
      </div>
    </Modal>
  );
}

function PainelAluno({ aluno, dados, atualizar, aoFechar, aoEditar, aoRemover, aoPrever, avisar }) {
  const [confirmando, setConfirmando] = useState(false);
  const req = requisitos(aluno);
  const hoje = iso();
  const presenteHoje = (aluno.presencas || []).includes(hoje);

  const trocar = (novo, msg) => atualizar('alunos', (l) => l.map((a) => (a.id === novo.id ? novo : a)), msg);

  const registrarPresenca = () => {
    if (presenteHoje) return;
    trocar({ ...aluno, presencas: [...aluno.presencas, hoje] }, 'Presença registrada');
  };

  const enviarAcesso = () => {
    const url = linkWhats(aluno.whatsapp, mensagemAcesso(aluno, dados.config));
    if (!url) return avisar && avisar('Este aluno não tem WhatsApp cadastrado.');
    abrir(url);
  };

  const copiarAcesso = async () => {
    try {
      await navigator.clipboard.writeText(mensagemAcesso(aluno, dados.config));
      avisar && avisar('Mensagem de acesso copiada');
    } catch (e) {
      avisar && avisar('Copie manualmente: login ' + aluno.login + ', senha ' + aluno.senha);
    }
  };

  const ficha = [
    ['Nascimento', aluno.nascimento ? dataBR(aluno.nascimento) + ' · ' + idade(aluno.nascimento) + ' anos' : ''],
    ['Naturalidade', aluno.naturalidade],
    ['Sexo', aluno.sexo],
    ['CPF', aluno.cpf],
    ['WhatsApp', aluno.whatsapp],
    ['Outro telefone', aluno.telefone !== aluno.whatsapp ? aluno.telefone : ''],
    ['E-mail', aluno.email],
    ['Endereço', [aluno.endereco, aluno.bairro, aluno.cep].filter(Boolean).join(' · ')],
    ['Responsável', [aluno.respNome, aluno.respCpf, aluno.respTelefone].filter(Boolean).join(' · ')],
    ['Medicamentos', aluno.medicamentos],
    ['Alergias', aluno.alergias],
    ['Plano de saúde', aluno.planoSaude],
  ].filter((l) => l[1]);

  return (
    <Modal titulo={aluno.nome} aoFechar={aoFechar} largo>
      <div className="perfil-topo">
        <Faixa faixa={aluno.faixa} graus={aluno.graus} largura={200} altura={22} />
        <div className="perfil-meta">
          <span>{FAIXAS[aluno.faixa].nome}{aluno.graus ? ', ' + aluno.graus + 'º grau' : ''} · há {duracao(mesesEntre(aluno.desdeFaixa))}</span>
          <span className="sub">{aluno.plano} · na academia desde {dataBR(aluno.inicio)} · {aluno.status === 'ativo' ? 'ativo' : 'inativo'}</span>
        </div>
      </div>

      {aluno.obs && <p className="obs">{aluno.obs}</p>}

      <div className="acesso">
        <div className="acesso-dados">
          <strong>Acesso ao app</strong>
          <span className="sub">login <b>{aluno.login}</b> · senha <b>{aluno.senha}</b></span>
        </div>
        <div className="acoes">
          <button className="btn btn-primario" onClick={enviarAcesso}><MessageCircle size={15} /> Enviar pelo WhatsApp</button>
          <button className="btn btn-fantasma" onClick={copiarAcesso}><Copy size={15} /> Copiar mensagem</button>
          <button className="btn btn-fantasma" onClick={() => trocar({ ...aluno, senha: gerarSenha() }, 'Nova senha gerada')}><KeyRound size={15} /> Nova senha</button>
          <button className="btn btn-fantasma" onClick={aoPrever}><Smartphone size={15} /> Ver o app dele</button>
        </div>
      </div>

      <div className="perfil-grade">
        <div className="bloco">
          <span className="bloco-num">{presencasDesde(aluno, somaDias(-30))}</span>
          <span className="sub">aulas nos últimos 30 dias</span>
        </div>
        <div className="bloco">
          <span className="bloco-num">{presencasDesde(aluno, aluno.desdeFaixa)}</span>
          <span className="sub">aulas nesta faixa</span>
        </div>
        <div className="bloco">
          <span className="bloco-num">{(aluno.presencas || []).length}</span>
          <span className="sub">aulas no total</span>
        </div>
      </div>

      {req ? (
        <div className="requisito">
          <div className="requisito-topo">
            <strong>Caminho até {req.alvo}</strong>
            {req.apto && <span className="selo">requisitos cumpridos</span>}
          </div>
          <LinhaRequisito rotulo="Tempo" feito={req.mesesFeitos} nec={req.mesesNec} sufixo="meses" />
          {req.aulasNec > 0 && <LinhaRequisito rotulo="Aulas" feito={req.aulasFeitas} nec={req.aulasNec} sufixo="aulas" />}
          {req.idadeNec > 0 && <LinhaRequisito rotulo="Idade" feito={req.idadeAtual} nec={req.idadeNec} sufixo="anos" />}
          <div className="acoes">
            {req.tipo === 'grau' ? (
              <button className="btn btn-primario" onClick={() => trocar(aplicarGrau(aluno), 'Grau registrado')}>
                <Award size={15} /> Dar {req.alvo}
              </button>
            ) : (
              <button className="btn btn-primario" onClick={() => trocar(aplicarFaixa(aluno, req.faixaAlvo), 'Nova faixa registrada')}>
                <Award size={15} /> Graduar para {FAIXAS[req.faixaAlvo].nome.toLowerCase()}
              </button>
            )}
            <button className="btn btn-fantasma" onClick={registrarPresenca} disabled={presenteHoje}>
              <Check size={15} /> {presenteHoje ? 'Presente hoje' : 'Marcar presença de hoje'}
            </button>
          </div>
        </div>
      ) : (
        <div className="requisito">
          <strong>Faixa preta</strong>
          <p className="sub">Graus de faixa preta seguem o calendário do professor. Registre pelo botão de editar quando acontecer.</p>
        </div>
      )}

      <div className="historico">
        <h3 className="titulo-secao">Ficha de matrícula</h3>
        <dl className="ficha">
          {ficha.map(([r, v]) => (<React.Fragment key={r}><dt>{r}</dt><dd>{v}</dd></React.Fragment>))}
        </dl>
        <p className={'autorizacao' + (aluno.autorizaImagem ? ' ok' : '')}>
          <ShieldCheck size={15} />
          {aluno.autorizaImagem
            ? 'Autorizou o uso de imagem em ' + dataBR(aluno.autorizadoEm || aluno.inicio) + '.'
            : 'Não autorizou o uso de imagem.'}
        </p>
      </div>

      <div className="historico">
        <h3 className="titulo-secao">Histórico de graduações</h3>
        <ul className="linha-tempo">
          {aluno.historico.map((h) => (
            <li key={h.id}>
              <Faixa faixa={h.faixa} graus={h.graus} largura={56} altura={12} />
              <span className="aula-info">
                <strong>{h.obs}</strong>
                <span className="sub">{dataBR(h.data)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="modal-acoes espalhado">
        {confirmando ? (
          <span className="acoes">
            <span className="sub">Apagar o cadastro e todo o histórico?</span>
            <button className="btn btn-perigo" onClick={aoRemover}>Confirmar</button>
            <button className="btn btn-fantasma" onClick={() => setConfirmando(false)}>Cancelar</button>
          </span>
        ) : (
          <button className="btn btn-perigo" onClick={() => setConfirmando(true)}><Trash2 size={15} /> Remover</button>
        )}
        <button className="btn btn-fantasma" onClick={aoEditar}><Pencil size={15} /> Editar cadastro</button>
      </div>
    </Modal>
  );
}

function LinhaRequisito({ rotulo, feito, nec, sufixo }) {
  const ok = feito >= nec;
  return (
    <div className="req-linha">
      <span className="req-rotulo">{rotulo}</span>
      <Barra valor={nec ? feito / nec : 1} alerta={ok} />
      <span className={'req-valor' + (ok ? ' ok' : '')}>{feito} de {nec} {sufixo}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Graduação                                                           */
/* ------------------------------------------------------------------ */

function Graduacao({ dados, atualizar }) {
  const ativos = dados.alunos.filter((a) => a.status === 'ativo');
  const lista = ativos
    .map((a) => ({ aluno: a, req: requisitos(a) }))
    .filter((x) => x.req)
    .sort((a, b) => b.req.progresso - a.req.progresso);

  const aptos = lista.filter((x) => x.req.apto);
  const caminho = lista.filter((x) => !x.req.apto);

  const recentes = dados.alunos
    .flatMap((a) => a.historico.map((h) => ({ ...h, nome: a.nome })))
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 8);

  const graduar = ({ aluno, req }) => {
    const novo = req.tipo === 'grau' ? aplicarGrau(aluno) : aplicarFaixa(aluno, req.faixaAlvo);
    atualizar('alunos', (l) => l.map((a) => (a.id === novo.id ? novo : a)), 'Graduação registrada');
  };

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1>Graduação</h1>
          <p className="sub">Tempo de faixa e frequência definem quem está pronto. O professor decide.</p>
        </div>
      </div>

      <section className="cartao">
        <h2 className="titulo-secao">Prontos para graduar</h2>
        {aptos.length === 0 ? (
          <Vazio titulo="Ninguém fechou os requisitos ainda" texto="Conforme as presenças entram, os nomes aparecem aqui automaticamente." />
        ) : (
          <ul className="lista-limpa">
            {aptos.map((x) => (
              <li key={x.aluno.id} className="grad-linha">
                <Faixa faixa={x.aluno.faixa} graus={x.aluno.graus} largura={90} altura={16} />
                <span className="aula-info">
                  <strong>{x.aluno.nome}</strong>
                  <span className="sub">{x.req.mesesFeitos} meses · {x.req.aulasFeitas} aulas nesta faixa</span>
                </span>
                <button className="btn btn-primario" onClick={() => graduar(x)}>
                  <Award size={15} /> {x.req.tipo === 'grau' ? 'Dar ' + x.req.alvo : 'Graduar para ' + FAIXAS[x.req.faixaAlvo].nome.toLowerCase()}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cartao">
        <h2 className="titulo-secao">A caminho</h2>
        <ul className="lista-limpa">
          {caminho.map((x) => (
            <li key={x.aluno.id} className="grad-linha">
              <Faixa faixa={x.aluno.faixa} graus={x.aluno.graus} largura={90} altura={16} />
              <span className="aula-info">
                <strong>{x.aluno.nome}</strong>
                <span className="sub">falta {faltaTexto(x.req)} para {x.req.alvo}</span>
              </span>
              <span className="grad-barra"><Barra valor={x.req.progresso} /></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="cartao">
        <h2 className="titulo-secao">Últimas graduações</h2>
        <ul className="linha-tempo">
          {recentes.map((h) => (
            <li key={h.id}>
              <Faixa faixa={h.faixa} graus={h.graus} largura={56} altura={12} />
              <span className="aula-info">
                <strong>{h.nome}</strong>
                <span className="sub">{h.obs} · {dataBR(h.data)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function faltaTexto(req) {
  const partes = [];
  if (req.mesesFeitos < req.mesesNec) partes.push((req.mesesNec - req.mesesFeitos) + ' meses');
  if (req.aulasFeitas < req.aulasNec) partes.push((req.aulasNec - req.aulasFeitas) + ' aulas');
  if (req.idadeNec && req.idadeAtual < req.idadeNec) partes.push('idade mínima de ' + req.idadeNec + ' anos');
  return partes.join(' e ') || 'a decisão do professor';
}

/* ------------------------------------------------------------------ */
/* Agenda                                                              */
/* ------------------------------------------------------------------ */

function Agenda({ dados, atualizar }) {
  const [editando, setEditando] = useState(null);
  const [chamada, setChamada] = useState(null);
  const hojeDia = new Date().getDay();

  const salvarTurma = (t) => {
    atualizar('turmas', (l) => (l.some((x) => x.id === t.id) ? l.map((x) => (x.id === t.id ? t : x)) : [...l, t]), 'Turma salva');
    setEditando(null);
  };

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1>Agenda de treinos</h1>
          <p className="sub">A grade fixa da semana. Clique numa turma para fazer a chamada.</p>
        </div>
        <button className="btn btn-primario" onClick={() => setEditando({})}><Plus size={16} /> Nova turma</button>
      </div>

      <div className="semana">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => {
          const turmas = dados.turmas.filter((t) => t.dias.includes(d)).sort((a, b) => a.inicio.localeCompare(b.inicio));
          return (
            <div key={d} className={'dia' + (d === hojeDia ? ' dia-hoje' : '')}>
              <h3>{DIAS_CURTOS[d]}</h3>
              {turmas.length === 0 && <p className="dia-vazio">Sem treino</p>}
              {turmas.map((t) => (
                <div key={t.id} className="turma">
                  <span className="turma-hora">{t.inicio}–{t.fim}</span>
                  <strong>{t.titulo}</strong>
                  <span className="sub">{t.nivel}</span>
                  <span className="sub">{t.professor}</span>
                  <div className="turma-acoes">
                    <button className="btn btn-fantasma btn-mini" onClick={() => setChamada(t)}><UserCheck size={13} /> Chamada</button>
                    <button className="icone" onClick={() => setEditando(t)} aria-label={'Editar ' + t.titulo}><Pencil size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {editando && (
        <ModalTurma
          inicial={editando}
          aoSalvar={salvarTurma}
          aoRemover={() => { atualizar('turmas', (l) => l.filter((x) => x.id !== editando.id), 'Turma removida'); setEditando(null); }}
          aoFechar={() => setEditando(null)}
        />
      )}

      {chamada && <ModalChamada turma={chamada} dados={dados} atualizar={atualizar} aoFechar={() => setChamada(null)} />}
    </>
  );
}

function ModalTurma({ inicial, aoSalvar, aoRemover, aoFechar }) {
  const novo = !inicial.id;
  const [f, setF] = useState(() => ({ titulo: '', dias: [], inicio: '19:30', fim: '20:45', professor: '', nivel: 'Todos os níveis', ...inicial }));
  const [erro, setErro] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const alternarDia = (d) => set('dias', f.dias.includes(d) ? f.dias.filter((x) => x !== d) : [...f.dias, d].sort());

  const confirmar = () => {
    if (!f.titulo.trim()) return setErro('Dê um nome à turma.');
    if (!f.dias.length) return setErro('Escolha pelo menos um dia da semana.');
    aoSalvar({ id: inicial.id || uid(), ...f, titulo: f.titulo.trim() });
  };

  return (
    <Modal titulo={novo ? 'Nova turma' : 'Editar turma'} aoFechar={aoFechar}>
      <div className="grade-campos">
        <Campo rotulo="Nome da turma" largura={2}><input value={f.titulo} onChange={(e) => set('titulo', e.target.value)} autoFocus placeholder="Fundamentos, No-gi, Kids…" /></Campo>
        <Campo rotulo="Começa"><input type="time" value={f.inicio} onChange={(e) => set('inicio', e.target.value)} /></Campo>
        <Campo rotulo="Termina"><input type="time" value={f.fim} onChange={(e) => set('fim', e.target.value)} /></Campo>
        <Campo rotulo="Professor"><input value={f.professor} onChange={(e) => set('professor', e.target.value)} /></Campo>
        <Campo rotulo="Nível">
          <select value={f.nivel} onChange={(e) => set('nivel', e.target.value)}>
            {NIVEIS.map((n) => <option key={n}>{n}</option>)}
          </select>
        </Campo>
      </div>

      <div className="campo">
        <span>Dias da semana</span>
        <div className="dias-escolha">
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <button key={d} className={'dia-btn' + (f.dias.includes(d) ? ' ativo' : '')} onClick={() => alternarDia(d)} aria-pressed={f.dias.includes(d)}>
              {DIAS_CURTOS[d]}
            </button>
          ))}
        </div>
      </div>

      {erro && <p className="erro">{erro}</p>}

      <div className="modal-acoes espalhado">
        {!novo ? <button className="btn btn-perigo" onClick={aoRemover}><Trash2 size={15} /> Remover turma</button> : <span />}
        <span className="acoes">
          <button className="btn btn-fantasma" onClick={aoFechar}>Cancelar</button>
          <button className="btn btn-primario" onClick={confirmar}>Salvar turma</button>
        </span>
      </div>
    </Modal>
  );
}

function ModalChamada({ turma, dados, atualizar, aoFechar }) {
  const hoje = iso();
  const elegiveis = dados.alunos
    .filter((a) => a.status === 'ativo')
    .filter((a) => (turma.nivel === 'Infantil' ? a.categoria === 'infantil' : a.categoria === 'adulto'))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const [marcados, setMarcados] = useState(() => elegiveis.filter((a) => a.presencas.includes(hoje)).map((a) => a.id));

  const alternar = (id) => setMarcados((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  const confirmar = () => {
    atualizar('alunos', (lista) => lista.map((a) => {
      if (!elegiveis.some((e) => e.id === a.id)) return a;
      const tem = a.presencas.includes(hoje);
      const quer = marcados.includes(a.id);
      if (tem === quer) return a;
      return { ...a, presencas: quer ? [...a.presencas, hoje] : a.presencas.filter((p) => p !== hoje) };
    }), marcados.length + ' presenças registradas');
    aoFechar();
  };

  return (
    <Modal titulo={'Chamada · ' + turma.titulo} aoFechar={aoFechar}>
      <p className="sub">{DIAS[new Date().getDay()]}, {dataBR(hoje)} · {turma.inicio} às {turma.fim}</p>

      {elegiveis.length === 0 ? (
        <Vazio titulo="Nenhum aluno elegível" texto="Nenhum aluno ativo se encaixa nesta turma." />
      ) : (
        <ul className="chamada">
          {elegiveis.map((a) => (
            <li key={a.id}>
              <button className={'chamada-item' + (marcados.includes(a.id) ? ' presente' : '')} onClick={() => alternar(a.id)} aria-pressed={marcados.includes(a.id)}>
                <span className="caixa">{marcados.includes(a.id) && <Check size={13} strokeWidth={3} />}</span>
                <Faixa faixa={a.faixa} graus={a.graus} largura={52} altura={11} />
                <span>{a.nome}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="modal-acoes espalhado">
        <span className="sub">{marcados.length} de {elegiveis.length} no tatame</span>
        <span className="acoes">
          <button className="btn btn-fantasma" onClick={aoFechar}>Cancelar</button>
          <button className="btn btn-primario" onClick={confirmar}>Salvar chamada</button>
        </span>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Eventos                                                             */
/* ------------------------------------------------------------------ */

function Eventos({ dados, atualizar }) {
  const [editando, setEditando] = useState(null);
  const hoje = iso();
  const futuros = dados.eventos.filter((e) => e.data >= hoje).sort((a, b) => a.data.localeCompare(b.data));
  const passados = dados.eventos.filter((e) => e.data < hoje).sort((a, b) => b.data.localeCompare(a.data));

  const salvarEvento = (ev) => {
    atualizar('eventos', (l) => (l.some((x) => x.id === ev.id) ? l.map((x) => (x.id === ev.id ? ev : x)) : [...l, ev]), 'Evento salvo');
    setEditando(null);
  };

  const Cartao = ({ e, passado }) => (
    <div className={'evento' + (passado ? ' passado' : '')}>
      <span className="data-bloco grande">
        <strong>{e.data.slice(8, 10)}</strong>
        <span>{['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][Number(e.data.slice(5, 7)) - 1]}</span>
      </span>
      <div className="evento-corpo">
        <div className="evento-cabeca">
          <strong>{e.titulo}</strong>
          <span className="chip">{e.tipo}</span>
        </div>
        <p className="sub linha-icones">
          {e.hora && <span><Clock size={13} /> {e.hora}</span>}
          {e.local && <span><MapPin size={13} /> {e.local}</span>}
        </p>
        {e.descricao && <p className="evento-desc">{e.descricao}</p>}
      </div>
      <button className="icone" onClick={() => setEditando(e)} aria-label={'Editar ' + e.titulo}><Pencil size={14} /></button>
    </div>
  );

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1>Eventos</h1>
          <p className="sub">Campeonatos, seminários e graduações da academia.</p>
        </div>
        <button className="btn btn-primario" onClick={() => setEditando({})}><Plus size={16} /> Novo evento</button>
      </div>

      {futuros.length === 0 ? (
        <div className="cartao">
          <Vazio titulo="Nada marcado" texto="Cadastre o próximo campeonato ou seminário para os alunos se programarem." acao={<button className="btn btn-primario" onClick={() => setEditando({})}><Plus size={16} /> Novo evento</button>} />
        </div>
      ) : (
        <div className="cartao lista-eventos">
          {futuros.map((e) => <Cartao key={e.id} e={e} />)}
        </div>
      )}

      {passados.length > 0 && (
        <>
          <h2 className="titulo-secao solto">Já aconteceram</h2>
          <div className="cartao lista-eventos">
            {passados.map((e) => <Cartao key={e.id} e={e} passado />)}
          </div>
        </>
      )}

      {editando && (
        <ModalEvento
          inicial={editando}
          aoSalvar={salvarEvento}
          aoRemover={() => { atualizar('eventos', (l) => l.filter((x) => x.id !== editando.id), 'Evento removido'); setEditando(null); }}
          aoFechar={() => setEditando(null)}
        />
      )}
    </>
  );
}

function ModalEvento({ inicial, aoSalvar, aoRemover, aoFechar }) {
  const novo = !inicial.id;
  const [f, setF] = useState(() => ({ titulo: '', data: iso(), hora: '', tipo: 'Campeonato', local: '', descricao: '', ...inicial }));
  const [erro, setErro] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const confirmar = () => {
    if (!f.titulo.trim()) return setErro('Dê um nome ao evento.');
    if (!f.data) return setErro('Escolha a data do evento.');
    aoSalvar({ id: inicial.id || uid(), ...f, titulo: f.titulo.trim() });
  };

  return (
    <Modal titulo={novo ? 'Novo evento' : 'Editar evento'} aoFechar={aoFechar}>
      <div className="grade-campos">
        <Campo rotulo="Nome do evento" largura={2}><input value={f.titulo} onChange={(e) => set('titulo', e.target.value)} autoFocus /></Campo>
        <Campo rotulo="Data"><input type="date" value={f.data} onChange={(e) => set('data', e.target.value)} /></Campo>
        <Campo rotulo="Horário"><input type="time" value={f.hora} onChange={(e) => set('hora', e.target.value)} /></Campo>
        <Campo rotulo="Tipo">
          <select value={f.tipo} onChange={(e) => set('tipo', e.target.value)}>
            {TIPOS_EVENTO.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Local"><input value={f.local} onChange={(e) => set('local', e.target.value)} /></Campo>
        <Campo rotulo="Detalhes" largura={2}>
          <textarea rows={3} value={f.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Prazo de inscrição, categorias, valor…" />
        </Campo>
      </div>

      {erro && <p className="erro">{erro}</p>}

      <div className="modal-acoes espalhado">
        {!novo ? <button className="btn btn-perigo" onClick={aoRemover}><Trash2 size={15} /> Remover</button> : <span />}
        <span className="acoes">
          <button className="btn btn-fantasma" onClick={aoFechar}>Cancelar</button>
          <button className="btn btn-primario" onClick={confirmar}>Salvar evento</button>
        </span>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Informativos                                                        */
/* ------------------------------------------------------------------ */

function Informativos({ dados, atualizar }) {
  const [editando, setEditando] = useState(null);
  const lista = [...dados.informativos].sort((a, b) => (b.fixado === a.fixado ? b.data.localeCompare(a.data) : (b.fixado ? 1 : -1)));

  const salvarAviso = (av) => {
    atualizar('informativos', (l) => (l.some((x) => x.id === av.id) ? l.map((x) => (x.id === av.id ? av : x)) : [av, ...l]), 'Informativo publicado');
    setEditando(null);
  };

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1>Informativos</h1>
          <p className="sub">Avisos que aparecem na tela inicial do app de todo mundo.</p>
        </div>
        <button className="btn btn-primario" onClick={() => setEditando({})}><Plus size={16} /> Novo informativo</button>
      </div>

      {lista.length === 0 ? (
        <div className="cartao">
          <Vazio titulo="Nenhum aviso publicado" texto="Mudança de horário, feriado, prazo de inscrição: o que a turma precisa saber entra aqui." acao={<button className="btn btn-primario" onClick={() => setEditando({})}><Plus size={16} /> Novo informativo</button>} />
        </div>
      ) : (
        <div className="cartao lista-eventos">
          {lista.map((av) => (
            <div key={av.id} className="evento">
              <span className={'data-bloco grande' + (av.fixado ? ' fixado' : '')}>
                {av.fixado ? <Pin size={18} /> : <><strong>{av.data.slice(8, 10)}</strong><span>{['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][Number(av.data.slice(5, 7)) - 1]}</span></>}
              </span>
              <div className="evento-corpo">
                <div className="evento-cabeca">
                  <strong>{av.titulo}</strong>
                  {av.fixado && <span className="chip">fixado no topo</span>}
                </div>
                <p className="sub">publicado em {dataBR(av.data)}</p>
                <p className="evento-desc">{av.texto}</p>
                {dados.config.grupoWhats && (
                  <button className="btn btn-fantasma btn-mini espaco" onClick={() => abrir(dados.config.grupoWhats)}>
                    <MessageCircle size={13} /> Abrir o grupo para colar
                  </button>
                )}
              </div>
              <button className="icone" onClick={() => setEditando(av)} aria-label={'Editar ' + av.titulo}><Pencil size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {editando && (
        <ModalInformativo
          inicial={editando}
          aoSalvar={salvarAviso}
          aoRemover={() => { atualizar('informativos', (l) => l.filter((x) => x.id !== editando.id), 'Informativo removido'); setEditando(null); }}
          aoFechar={() => setEditando(null)}
        />
      )}
    </>
  );
}

function ModalInformativo({ inicial, aoSalvar, aoRemover, aoFechar }) {
  const novo = !inicial.id;
  const [f, setF] = useState(() => ({ titulo: '', texto: '', data: iso(), fixado: false, ...inicial }));
  const [erro, setErro] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const confirmar = () => {
    if (!f.titulo.trim()) return setErro('Escreva um título curto para o aviso.');
    if (!f.texto.trim()) return setErro('Escreva o conteúdo do aviso.');
    aoSalvar({ id: inicial.id || uid(), ...f, titulo: f.titulo.trim(), texto: f.texto.trim() });
  };

  return (
    <Modal titulo={novo ? 'Novo informativo' : 'Editar informativo'} aoFechar={aoFechar}>
      <div className="grade-campos">
        <Campo rotulo="Título" largura={2}><input value={f.titulo} onChange={(e) => set('titulo', e.target.value)} autoFocus placeholder="Sábado sem treino no feriado" /></Campo>
        <Campo rotulo="Texto" largura={2}><textarea rows={4} value={f.texto} onChange={(e) => set('texto', e.target.value)} /></Campo>
        <Campo rotulo="Data"><input type="date" value={f.data} onChange={(e) => set('data', e.target.value)} /></Campo>
      </div>
      <label className="marcador">
        <input type="checkbox" checked={!!f.fixado} onChange={(e) => set('fixado', e.target.checked)} />
        <span>Fixar no topo do app</span>
      </label>

      {erro && <p className="erro">{erro}</p>}

      <div className="modal-acoes espalhado">
        {!novo ? <button className="btn btn-perigo" onClick={aoRemover}><Trash2 size={15} /> Remover</button> : <span />}
        <span className="acoes">
          <button className="btn btn-fantasma" onClick={aoFechar}>Cancelar</button>
          <button className="btn btn-primario" onClick={confirmar}>Publicar</button>
        </span>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Ajustes                                                             */
/* ------------------------------------------------------------------ */

function Ajustes({ dados, salvar, exportar, avisar, sinc, aoPuxar, aoEnviar, aoTestar }) {
  const [confirmando, setConfirmando] = useState(false);
  const cfg = dados.config;
  const setCfg = (campo, valor) => salvar({ ...dados, config: { ...cfg, [campo]: valor } });
  const setAdmin = (campo, valor) => salvar({ ...dados, config: { ...cfg, admin: { ...cfg.admin, [campo]: valor } } });
  const setPlan = (campo, valor) => salvar({ ...dados, config: { ...cfg, planilha: { ...cfg.planilha, [campo]: valor } } });

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1>Ajustes</h1>
          <p className="sub">Identidade da academia, canais de contato e acesso do administrador.</p>
        </div>
      </div>

      <section className="cartao">
        <h2 className="titulo-secao">Identidade</h2>
        <div className="grade-campos">
          <Campo rotulo="Nome da academia" largura={2}><input value={cfg.nome} onChange={(e) => setCfg('nome', e.target.value)} /></Campo>
        </div>
        <div className="identidade">
          <Emblema nome={cfg.nome} logo={cfg.logo} aoTrocar={(img, msg) => msg ? avisar(msg) : setCfg('logo', img)} />
          <div>
            <strong>Logo</strong>
            <p className="sub">Clique no círculo para enviar a imagem. Ela aparece no menu, na tela de entrada e no app do aluno.</p>
            {cfg.logo && <button className="btn btn-fantasma btn-mini" onClick={() => setCfg('logo', null)}>Remover logo</button>}
          </div>
        </div>
      </section>

      <section className="cartao">
        <h2 className="titulo-secao">Links enviados no convite</h2>
        <div className="grade-campos">
          <Campo rotulo="Convite do grupo no WhatsApp" largura={2}>
            <input value={cfg.grupoWhats} onChange={(e) => setCfg('grupoWhats', e.target.value)} placeholder="https://chat.whatsapp.com/…" />
          </Campo>
          <Campo rotulo="Endereço do app" largura={2}>
            <input value={cfg.linkApp} onChange={(e) => setCfg('linkApp', e.target.value)} placeholder="https://…" />
          </Campo>
        </div>
        <p className="sub">Os dois entram automaticamente na mensagem de acesso que você dispara pelo WhatsApp na ficha de cada aluno.</p>
      </section>

      <section className="cartao">
        <h2 className="titulo-secao">Acesso do administrador</h2>
        <div className="grade-campos">
          <Campo rotulo="Usuário"><input value={cfg.admin.usuario} onChange={(e) => setAdmin('usuario', e.target.value)} autoCapitalize="none" /></Campo>
          <Campo rotulo="Senha"><input value={cfg.admin.senha} onChange={(e) => setAdmin('senha', e.target.value)} /></Campo>
        </div>
        <p className="sub">Troque a senha padrão antes de mostrar o piloto para a turma.</p>
      </section>

      <section className="cartao">
        <h2 className="titulo-secao">Planilha do Google</h2>
        <p className="sub">Com o endereço preenchido, cada alteração no app é gravada na planilha automaticamente, e a planilha passa a ser a fonte oficial dos dados.</p>
        <div className="grade-campos espaco">
          <Campo rotulo="Endereço do aplicativo da web (termina em /exec)" largura={2}>
            <input value={cfg.planilha.url} onChange={(e) => setPlan('url', e.target.value.trim())} placeholder="https://script.google.com/macros/s/…/exec" />
          </Campo>
          <Campo rotulo="Token combinado no script" largura={2}>
            <input value={cfg.planilha.token} onChange={(e) => setPlan('token', e.target.value.trim())} placeholder="o mesmo texto da linha TOKEN do Apps Script" />
          </Campo>
        </div>
        <div className={'estado-sinc estado-' + sinc.estado}>
          {sinc.estado === 'local' && 'Ainda sem planilha: os dados estão salvos apenas neste navegador.'}
          {sinc.estado === 'lendo' && 'Lendo a planilha…'}
          {sinc.estado === 'enviando' && 'Gravando na planilha…'}
          {sinc.estado === 'ok' && 'Última sincronização às ' + (sinc.quando || agora()) + '.'}
          {sinc.estado === 'erro' && ('Falha na conexão: ' + (sinc.msg || 'sem detalhes') + '.')}
        </div>
        <div className="acoes espaco">
          <button className="btn btn-primario" onClick={aoTestar}><Plug size={15} /> Testar conexão</button>
          <button className="btn btn-fantasma" onClick={aoEnviar}><Upload size={15} /> Enviar tudo para a planilha</button>
          <button className="btn btn-fantasma" onClick={aoPuxar}><RefreshCw size={15} /> Puxar da planilha</button>
        </div>
      </section>

      <section className="cartao cartao-dados">
        <div>
          <h2 className="titulo-secao">Cópia local</h2>
          <p className="sub">Tudo fica salvo neste app. Baixe uma cópia antes de testar mudanças grandes.</p>
        </div>
        <div className="acoes">
          <button className="btn btn-fantasma" onClick={exportar}><Download size={15} /> Baixar cópia</button>
          {confirmando ? (
            <>
              <span className="sub">Isso apaga tudo. Tem certeza?</span>
              <button className="btn btn-perigo" onClick={() => { salvar(dadosExemplo(), 'Dados de exemplo restaurados'); setConfirmando(false); }}>Sim, restaurar</button>
              <button className="btn btn-fantasma" onClick={() => setConfirmando(false)}>Cancelar</button>
            </>
          ) : (
            <button className="btn btn-fantasma" onClick={() => setConfirmando(true)}><RotateCcw size={15} /> Restaurar exemplo</button>
          )}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* App do aluno (celular)                                              */
/* ------------------------------------------------------------------ */

function MolduraAluno({ children, preview, aoVoltar }) {
  return (
    <div className="palco">
      {preview && (
        <button className="btn btn-claro" onClick={aoVoltar}><ChevronLeft size={15} /> Voltar ao painel</button>
      )}
      <div className="fone">{children}</div>
      <p className="palco-nota">Visão do aluno — no celular ocupa a tela inteira</p>
    </div>
  );
}

function AppAluno({ dados, aluno, aoSair }) {
  const [aba, setAba] = useState('inicio');
  const hoje = iso();
  const diaSemana = new Date().getDay();
  const req = requisitos(aluno);
  const primeiro = aluno.nome.split(' ')[0];

  const aulasHoje = dados.turmas.filter((t) => t.dias.includes(diaSemana)).sort((a, b) => a.inicio.localeCompare(b.inicio));
  const eventos = dados.eventos.filter((e) => e.data >= hoje).sort((a, b) => a.data.localeCompare(b.data));
  const avisos = [...dados.informativos].sort((a, b) => (b.fixado === a.fixado ? b.data.localeCompare(a.data) : (b.fixado ? 1 : -1)));

  const abas = [
    { id: 'inicio', rotulo: 'Início', icone: Home },
    { id: 'agenda', rotulo: 'Agenda', icone: CalendarDays },
    { id: 'eventos', rotulo: 'Eventos', icone: Trophy },
    { id: 'perfil', rotulo: 'Perfil', icone: User },
  ];

  return (
    <div className="fone-tela">
      <header className="fone-topo">
        <span className="fone-logo">
          {dados.config.logo ? <img src={dados.config.logo} alt="" /> : <span className="fone-logo-vazio">JJ</span>}
        </span>
        <span className="fone-nome">{dados.config.nome}</span>
        <button className="icone icone-claro" onClick={aoSair} aria-label="Sair"><LogOut size={16} /></button>
      </header>

      <div className="fone-corpo">
        {aba === 'inicio' && (
          <>
            <h2 className="m-saudacao">Oss, {primeiro}</h2>
            <div className="m-faixa">
              <Faixa faixa={aluno.faixa} graus={aluno.graus} altura={20} />
              <div className="m-faixa-info">
                <strong>{FAIXAS[aluno.faixa].nome}{aluno.graus ? ' · ' + aluno.graus + 'º grau' : ''}</strong>
                <span className="sub">{presencasDesde(aluno, somaDias(-30))} aulas nos últimos 30 dias</span>
              </div>
              {req && (
                <div className="m-progresso">
                  <Barra valor={req.progresso} alerta={req.apto} />
                  <span className="sub">{req.apto ? 'Você cumpriu os requisitos para ' + req.alvo : 'Falta ' + faltaTexto(req) + ' para ' + req.alvo}</span>
                </div>
              )}
            </div>

            <h3 className="m-titulo">Hoje</h3>
            {aulasHoje.length === 0 ? (
              <p className="m-vazio">Sem treino hoje. Aproveite para descansar.</p>
            ) : aulasHoje.map((t) => (
              <div key={t.id} className="m-item">
                <span className="hora">{t.inicio}</span>
                <span className="aula-info"><strong>{t.titulo}</strong><span className="sub">{t.nivel} · {t.professor}</span></span>
              </div>
            ))}

            <h3 className="m-titulo">Avisos</h3>
            {avisos.length === 0 ? <p className="m-vazio">Nenhum aviso no momento.</p> : avisos.map((av) => (
              <div key={av.id} className={'m-aviso' + (av.fixado ? ' fixado' : '')}>
                <strong>{av.titulo}</strong>
                <p>{av.texto}</p>
                <span className="sub">{dataBR(av.data)}</span>
              </div>
            ))}
          </>
        )}

        {aba === 'agenda' && (
          <>
            <h2 className="m-saudacao">Agenda de treinos</h2>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const turmas = dados.turmas.filter((t) => t.dias.includes(d)).sort((a, b) => a.inicio.localeCompare(b.inicio));
              if (!turmas.length) return null;
              return (
                <div key={d} className={'m-dia' + (d === diaSemana ? ' hoje' : '')}>
                  <h3 className="m-titulo">{DIAS[d]}{d === diaSemana ? ' · hoje' : ''}</h3>
                  {turmas.map((t) => (
                    <div key={t.id} className="m-item">
                      <span className="hora">{t.inicio}</span>
                      <span className="aula-info"><strong>{t.titulo}</strong><span className="sub">{t.nivel} · {t.professor} · até {t.fim}</span></span>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}

        {aba === 'eventos' && (
          <>
            <h2 className="m-saudacao">Próximos eventos</h2>
            {eventos.length === 0 ? <p className="m-vazio">Nada marcado por enquanto.</p> : eventos.map((e) => (
              <div key={e.id} className="m-evento">
                <span className="data-bloco">
                  <strong>{e.data.slice(8, 10)}</strong>
                  <span>{['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][Number(e.data.slice(5, 7)) - 1]}</span>
                </span>
                <div>
                  <strong>{e.titulo}</strong>
                  <p className="sub">{[e.tipo, e.hora, e.local].filter(Boolean).join(' · ')}</p>
                  {e.descricao && <p className="m-evento-desc">{e.descricao}</p>}
                </div>
              </div>
            ))}
          </>
        )}

        {aba === 'perfil' && (
          <>
            <h2 className="m-saudacao">{aluno.nome}</h2>
            <div className="m-faixa">
              <Faixa faixa={aluno.faixa} graus={aluno.graus} altura={20} />
              <div className="m-faixa-info">
                <strong>{FAIXAS[aluno.faixa].nome}{aluno.graus ? ' · ' + aluno.graus + 'º grau' : ''}</strong>
                <span className="sub">na faixa há {duracao(mesesEntre(aluno.desdeFaixa))}</span>
              </div>
            </div>

            <div className="m-numeros">
              <div><strong>{(aluno.presencas || []).length}</strong><span>aulas no total</span></div>
              <div><strong>{presencasDesde(aluno, aluno.desdeFaixa)}</strong><span>nesta faixa</span></div>
              <div><strong>{presencasDesde(aluno, somaDias(-30))}</strong><span>em 30 dias</span></div>
            </div>

            {req && (
              <>
                <h3 className="m-titulo">Próxima graduação</h3>
                <div className="m-req">
                  <LinhaRequisito rotulo="Tempo" feito={req.mesesFeitos} nec={req.mesesNec} sufixo="meses" />
                  {req.aulasNec > 0 && <LinhaRequisito rotulo="Aulas" feito={req.aulasFeitas} nec={req.aulasNec} sufixo="aulas" />}
                </div>
              </>
            )}

            <h3 className="m-titulo">Sua evolução</h3>
            <ul className="linha-tempo">
              {aluno.historico.map((h) => (
                <li key={h.id}>
                  <Faixa faixa={h.faixa} graus={h.graus} largura={56} altura={12} />
                  <span className="aula-info"><strong>{h.obs}</strong><span className="sub">{dataBR(h.data)}</span></span>
                </li>
              ))}
            </ul>

            <h3 className="m-titulo">Seus dados</h3>
            <p className="m-vazio">{[aluno.whatsapp, aluno.email, aluno.plano].filter(Boolean).join(' · ')}<br />Para corrigir qualquer informação, fale com a recepção.</p>

            {dados.config.grupoWhats && (
              <button className="btn btn-primario btn-largo" onClick={() => abrir(dados.config.grupoWhats)}>
                <MessageCircle size={16} /> Entrar no grupo da academia
              </button>
            )}
            <button className="btn btn-fantasma btn-largo" onClick={aoSair}><LogOut size={15} /> Sair da conta</button>
          </>
        )}
      </div>

      <nav className="fone-abas">
        {abas.map((a) => {
          const Ic = a.icone;
          return (
            <button key={a.id} className={'fone-aba' + (aba === a.id ? ' ativo' : '')} onClick={() => setAba(a.id)}>
              <Ic size={19} strokeWidth={1.9} />
              <span>{a.rotulo}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Estilos                                                             */
/* ------------------------------------------------------------------ */

function Estilos() {
  return <style>{CSS}</style>;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap');

.app *, .app *::before, .app *::after { box-sizing: border-box; }
.app {
  --grafite:#26272A; --grafite-2:#141517; --grafite-3:#3D3F43;
  --laranja:#EE7623; --laranja-forte:#D2650F; --laranja-texto:#B4570D; --laranja-claro:#FCEFE3;
  --canvas:#EDEDEA; --gi:#FFFFFF; --linha:#DBDBD5;
  --tinta:#1C1C1E; --tinta-2:#5B5C5F; --neutro:#9A9B9E;
  --cond:'Barlow Condensed','Arial Narrow',Arial,sans-serif;
  display:flex; min-height:100vh; background:var(--canvas); color:var(--tinta);
  font-family:'Barlow','Helvetica Neue',Arial,sans-serif; font-size:15px; line-height:1.45;
}
.app.carregando { align-items:center; justify-content:center; color:var(--tinta-2); }
.app button { font:inherit; cursor:pointer; }
.app :focus-visible { outline:2px solid var(--laranja); outline-offset:2px; border-radius:3px; }

/* navegação */
.nav { width:222px; flex:0 0 222px; background:var(--grafite); color:#C4C5C8; padding:20px 12px 16px;
  display:flex; flex-direction:column; position:sticky; top:0; height:100vh; }
.nav-marca { display:flex; align-items:center; gap:11px; padding:0 6px 16px; border-bottom:1px solid rgba(255,255,255,.12); margin-bottom:14px; }
.nav-marca-texto { min-width:0; }
.nav-marca input { background:none; border:0; color:#fff; font-family:var(--cond); font-size:20px; font-weight:600;
  width:100%; padding:0; line-height:1.1; }
.nav-marca-sub { display:block; font-size:11.5px; color:#8E8F93; margin-top:2px; }
.emblema-botao { width:44px; height:44px; flex:0 0 auto; border:0; padding:0; border-radius:50%; overflow:hidden;
  background:#fff; color:var(--grafite); display:flex; align-items:center; justify-content:center; }
.emblema-botao img, .emblema-botao svg { width:100%; height:100%; object-fit:contain; display:block; }
.emblema-botao:hover { box-shadow:0 0 0 2px var(--laranja); }
.nav-lista { display:flex; flex-direction:column; gap:2px; }
.nav-item { display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:9px 11px;
  border:0; border-radius:6px; background:none; color:#BFC0C3; font-size:14.5px; }
.nav-item:hover { background:rgba(255,255,255,.08); color:#fff; }
.nav-item.ativo { background:var(--gi); color:var(--grafite-2); font-weight:600; box-shadow:inset 3px 0 0 var(--laranja); }
.nav-rodape { margin-top:auto; padding:0 8px; font-size:12.5px; color:#8E8F93; }

/* conteúdo */
.conteudo { flex:1; min-width:0; padding:26px 32px 64px; max-width:1140px; }
.cabecalho { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; margin-bottom:20px; }
.app h1 { font-family:var(--cond); font-size:35px; font-weight:600; margin:0; line-height:1.05; }
.titulo-secao { font-family:var(--cond); font-size:19px; font-weight:600; margin:0 0 12px; }
.titulo-secao.solto { margin:26px 0 10px; }
.sub { color:var(--tinta-2); font-size:13.5px; margin:0; }
.app h2, .app h3 { margin:0; }

.cartao { background:var(--gi); border:1px solid var(--linha); border-radius:8px; padding:18px 20px; margin-bottom:16px; }
.cartao.sem-padding { padding:0; overflow:hidden; }
.colunas { display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start; }
.colunas .cartao { margin-bottom:16px; }

/* faixa */
.faixa { position:relative; display:flex; align-items:center; justify-content:flex-end; border-radius:2px;
  box-shadow:inset 0 -2px 4px rgba(0,0,0,.22), inset 0 2px 3px rgba(255,255,255,.12); flex:0 0 auto; }
.faixa::before { content:''; position:absolute; inset:0; border-radius:2px; opacity:.35;
  background:repeating-linear-gradient(90deg, rgba(0,0,0,.10) 0 1px, transparent 1px 4px); }
.faixa-clara { box-shadow:inset 0 0 0 1px rgba(0,0,0,.18), inset 0 -2px 4px rgba(0,0,0,.10); }
.faixa-ponta { position:relative; height:100%; width:30%; min-width:26px; max-width:64px; margin-right:7%;
  display:flex; align-items:center; justify-content:flex-start; gap:2.5px; padding:0 4px; border-radius:1px; }
.grau { width:2.5px; height:62%; border-radius:1px; }

/* mural */
.mural-topo { display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin-bottom:14px; }
.mural-lista { display:flex; flex-direction:column; gap:9px; }
.mural-linha { display:grid; grid-template-columns:76px 1fr 34px; align-items:center; gap:12px; }
.mural-nome { font-size:13.5px; color:var(--tinta-2); }
.mural-trilho { display:flex; }
.mural-total { font-family:var(--cond); font-size:20px; font-weight:600; text-align:right; }

/* números */
.grade-numeros { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; }
.numero { background:var(--gi); border:1px solid var(--linha); border-radius:8px; padding:14px 16px; }
.numero strong { display:block; font-family:var(--cond); font-size:34px; font-weight:600; line-height:1; }
.numero span { font-size:12.5px; color:var(--tinta-2); }
.numero-destaque { border-color:var(--laranja); }
.numero-destaque strong { color:var(--laranja-texto); }

/* listas */
.lista-limpa { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; }
.lista-limpa > li { display:flex; align-items:center; gap:12px; padding:10px 0; border-top:1px solid var(--linha); }
.lista-limpa > li:first-child { border-top:0; padding-top:2px; }
.aula-info { flex:1; min-width:0; display:flex; flex-direction:column; }
.aula-info strong { font-weight:500; }
.hora { font-family:var(--cond); font-size:19px; font-weight:600; width:52px; color:var(--laranja-texto); }
.data-bloco { display:flex; flex-direction:column; align-items:center; justify-content:center; width:44px; height:44px;
  background:var(--grafite); color:#fff; border-radius:6px; flex:0 0 auto; }
.data-bloco strong { font-family:var(--cond); font-size:20px; font-weight:600; line-height:1; }
.data-bloco span { font-size:11px; color:var(--laranja); }
.data-bloco.grande { width:52px; height:52px; }

/* tabela de alunos */
.tabela-topo, .tabela-linha { display:grid; grid-template-columns:1.6fr 110px 1.1fr .8fr 1.4fr; gap:14px; align-items:center; }
.tabela-topo { padding:11px 20px; font-size:12.5px; color:var(--tinta-2); background:#F5F5F2; border-bottom:1px solid var(--linha); }
.tabela { list-style:none; margin:0; padding:0; }
.tabela > li + li .tabela-linha { border-top:1px solid var(--linha); }
.tabela-linha { width:100%; text-align:left; background:none; border:0; padding:12px 20px; }
.tabela-linha:hover { background:#FBF5F0; }
.tabela-linha.inativo { opacity:.55; }
.celula-nome { display:flex; flex-direction:column; min-width:0; }
.celula-nome strong { font-weight:500; }
.celula-sub { font-size:13.5px; color:var(--tinta-2); }
.celula-prog { display:flex; flex-direction:column; gap:5px; }

/* barra */
.barra { height:5px; background:#E4E4DF; border-radius:3px; overflow:hidden; width:100%; }
.barra-preenchida { display:block; height:100%; border-radius:3px; }

/* botões */
.btn { display:inline-flex; align-items:center; gap:7px; padding:8px 14px; border-radius:6px; border:1px solid transparent; font-size:14px; }
.btn-primario { background:var(--laranja); color:#1C1C1E; font-weight:600; }
.btn-primario:hover { background:var(--laranja-forte); color:#fff; }
.btn-fantasma { background:transparent; border-color:var(--linha); color:var(--tinta); }
.btn-fantasma:hover { background:#F3F3F0; }
.btn-fantasma:disabled { opacity:.5; cursor:default; }
.btn-perigo { background:transparent; border-color:#D8C2B7; color:#9C3520; }
.btn-perigo:hover { background:#F7EBE6; }
.btn-mini { padding:4px 8px; font-size:12.5px; }
.icone { background:none; border:0; color:var(--tinta-2); padding:5px; border-radius:5px; display:inline-flex; }
.icone:hover { background:#EFEFEB; color:var(--tinta); }
.acoes { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

/* filtros */
.filtros { display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
.busca { display:flex; align-items:center; gap:8px; background:var(--gi); border:1px solid var(--linha); border-radius:6px; padding:0 10px; flex:1; min-width:200px; color:var(--tinta-2); }
.busca input { border:0; background:none; padding:9px 0; width:100%; font:inherit; color:var(--tinta); }
.busca input:focus { outline:none; }
.filtros select { background:var(--gi); border:1px solid var(--linha); border-radius:6px; padding:9px 10px; font:inherit; color:var(--tinta); }

/* campos */
.grade-campos { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.campo { display:flex; flex-direction:column; gap:5px; font-size:13px; color:var(--tinta-2); }
.campo input, .campo select, .campo textarea {
  font:inherit; font-size:14.5px; color:var(--tinta); background:#fff; border:1px solid var(--linha);
  border-radius:6px; padding:8px 10px; width:100%; }
.campo textarea { resize:vertical; }
.previa { display:flex; align-items:center; gap:12px; margin-top:16px; padding-top:14px; border-top:1px solid var(--linha); }
.erro { color:#9C3520; font-size:13.5px; margin:12px 0 0; }

/* modal */
.modal-fundo { position:fixed; inset:0; background:rgba(20,21,23,.5); display:flex; align-items:flex-start;
  justify-content:center; padding:36px 16px; overflow-y:auto; z-index:50; }
.modal { background:var(--gi); border-radius:10px; width:100%; max-width:560px; box-shadow:0 18px 50px rgba(20,21,23,.3); }
.modal-largo { max-width:720px; }
.modal-topo { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:16px 20px; border-bottom:1px solid var(--linha); }
.modal-topo h2 { font-family:var(--cond); font-size:23px; font-weight:600; }
.modal-corpo { padding:20px; }
.modal-acoes { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; padding-top:16px; border-top:1px solid var(--linha); align-items:center; flex-wrap:wrap; }
.modal-acoes.espalhado { justify-content:space-between; }

/* perfil do aluno */
.perfil-topo { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.perfil-meta { display:flex; flex-direction:column; }
.perfil-contato { display:flex; gap:14px; flex-wrap:wrap; font-size:13.5px; color:var(--tinta-2); margin-top:10px; }
.obs { background:#F6F6F3; border-left:3px solid var(--laranja); padding:9px 12px; border-radius:0 6px 6px 0; font-size:14px; margin:14px 0 0; }
.perfil-grade { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:18px 0; }
.bloco { background:#F5F5F2; border-radius:7px; padding:12px 14px; }
.bloco-num { display:block; font-family:var(--cond); font-size:27px; font-weight:600; line-height:1.1; }
.requisito { border:1px solid var(--linha); border-radius:8px; padding:16px; }
.requisito-topo { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px; }
.selo { background:var(--laranja-claro); color:var(--laranja-texto); font-size:12px; padding:3px 9px; border-radius:20px; }
.req-linha { display:grid; grid-template-columns:54px 1fr 128px; align-items:center; gap:10px; margin-bottom:8px; font-size:13.5px; }
.req-rotulo { color:var(--tinta-2); }
.req-valor { text-align:right; color:var(--tinta-2); }
.req-valor.ok { color:var(--laranja-texto); font-weight:500; }
.requisito .acoes { margin-top:14px; }
.historico { margin-top:22px; }
.linha-tempo { list-style:none; margin:0; padding:0; }
.linha-tempo li { display:flex; align-items:center; gap:12px; padding:9px 0; border-top:1px solid var(--linha); }
.linha-tempo li:first-child { border-top:0; }

/* graduação */
.grad-linha { gap:14px; }
.grad-barra { width:120px; }

/* agenda */
.semana { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; align-items:start; }
.dia { background:var(--gi); border:1px solid var(--linha); border-radius:8px; padding:12px 10px; min-height:120px; }
.dia h3 { font-family:var(--cond); font-size:16px; font-weight:600; color:var(--tinta-2); margin-bottom:8px; }
.dia-hoje { border-color:var(--laranja); box-shadow:0 0 0 1px var(--laranja); }
.dia-hoje h3 { color:var(--laranja-texto); }
.dia-vazio { font-size:13px; color:var(--neutro); margin:0; }
.turma { border-top:1px solid var(--linha); padding:9px 0; display:flex; flex-direction:column; gap:1px; font-size:13.5px; }
.turma:first-of-type { border-top:0; padding-top:0; }
.turma strong { font-weight:500; }
.turma-hora { font-family:var(--cond); font-size:15px; font-weight:600; color:var(--laranja-texto); }
.turma-acoes { display:flex; align-items:center; gap:4px; margin-top:6px; }

.dias-escolha { display:flex; gap:6px; flex-wrap:wrap; }
.dia-btn { border:1px solid var(--linha); background:#fff; border-radius:6px; padding:7px 11px; font-size:13.5px; color:var(--tinta); }
.dia-btn.ativo { background:var(--grafite); border-color:var(--grafite); color:#fff; }

/* chamada */
.chamada { list-style:none; margin:14px 0 0; padding:0; display:grid; grid-template-columns:1fr 1fr; gap:6px; }
.chamada-item { display:flex; align-items:center; gap:10px; width:100%; text-align:left; background:none;
  border:1px solid var(--linha); border-radius:6px; padding:8px 10px; font-size:14px; color:var(--tinta); }
.chamada-item.presente { border-color:var(--laranja); background:var(--laranja-claro); }
.caixa { width:17px; height:17px; border:1.5px solid var(--linha); border-radius:4px; display:flex; align-items:center;
  justify-content:center; color:#1C1C1E; flex:0 0 auto; }
.chamada-item.presente .caixa { background:var(--laranja); border-color:var(--laranja); }

/* eventos */
.lista-eventos { padding:4px 20px; }
.evento { display:flex; align-items:flex-start; gap:14px; padding:16px 0; border-top:1px solid var(--linha); }
.evento:first-child { border-top:0; }
.evento.passado { opacity:.55; }
.evento-corpo { flex:1; min-width:0; }
.evento-cabeca { display:flex; align-items:center; gap:9px; flex-wrap:wrap; }
.evento-cabeca strong { font-weight:500; font-size:16px; }
.chip { font-size:12px; background:#F0F0EC; color:var(--tinta-2); padding:2px 9px; border-radius:20px; }
.linha-icones { display:flex; gap:14px; flex-wrap:wrap; margin-top:3px; }
.linha-icones span { display:inline-flex; align-items:center; gap:4px; }
.evento-desc { font-size:14px; margin:7px 0 0; max-width:62ch; }

/* diversos */
.vazio { padding:18px 0; }
.vazio-titulo { font-weight:500; margin:0 0 3px; }
.vazio-texto { color:var(--tinta-2); font-size:13.5px; margin:0 0 12px; }
.cartao-dados { display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; }
.alerta { display:flex; align-items:center; gap:9px; background:var(--laranja-claro); border:1px solid #F0C69C; color:#8A4409;
  padding:10px 14px; border-radius:7px; margin-bottom:16px; font-size:13.5px; }
.toast { position:fixed; bottom:22px; left:50%; transform:translateX(-50%); background:var(--grafite-2); color:#fff;
  padding:10px 18px; border-radius:22px; font-size:14px; box-shadow:0 8px 24px rgba(20,21,23,.35); z-index:60; }
.pronto-linha { gap:12px; }

@media (max-width:1000px) {
  .grade-numeros { grid-template-columns:repeat(2,1fr); }
  .colunas { grid-template-columns:1fr; }
  .semana { grid-template-columns:repeat(2,1fr); }
  .tabela-topo { display:none; }
  .tabela-linha { grid-template-columns:1fr auto; row-gap:8px; }
  .celula-prog { grid-column:1 / -1; }
}
@media (max-width:760px) {
  .app { flex-direction:column; }
  .nav { position:fixed; bottom:0; left:0; width:100%; flex:none; height:auto; flex-direction:row;
    align-items:center; padding:6px 8px; z-index:40; }
  .nav-marca, .nav-rodape { display:none; }
  .nav-lista { flex-direction:row; width:100%; justify-content:space-around; }
  .nav-item { flex-direction:column; gap:3px; font-size:11px; padding:6px 4px; }
  .nav-item.ativo { box-shadow:inset 0 3px 0 var(--laranja); }
  .conteudo { padding:20px 16px 90px; }
  .grade-campos, .chamada, .perfil-grade { grid-template-columns:1fr; }
  .semana { grid-template-columns:1fr; }
  .app h1 { font-size:28px; }
}

/* entrada */
.app.app-login { align-items:center; justify-content:center; background:var(--grafite-2); padding:24px 16px; }
.login-caixa { background:var(--gi); border-radius:12px; padding:26px 24px 20px; width:100%; max-width:362px; box-shadow:0 20px 60px rgba(0,0,0,.45); }
.login-marca { text-align:center; margin-bottom:20px; }
.login-emblema { width:74px; height:74px; margin:0 auto 10px; color:var(--grafite); }
.login-emblema img, .login-emblema svg { width:100%; height:100%; object-fit:contain; border-radius:50%; display:block; }
.login-caixa h1 { font-size:26px; }
.login-caixa .campo { margin-bottom:12px; }
.btn-largo { width:100%; justify-content:center; margin-top:6px; }
.login-dica { margin:16px 0 0; font-size:12px; color:var(--tinta-2); text-align:center; line-height:1.6; }

/* rodapé do menu */
.nav-rodape { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.nav-sair { background:none; border:0; color:#BFC0C3; display:inline-flex; align-items:center; gap:5px; font-size:12.5px; padding:4px 6px; border-radius:5px; }
.nav-sair:hover { background:rgba(255,255,255,.1); color:#fff; }

/* formulário longo */
.grupo-titulo { font-family:var(--cond); font-size:16px; font-weight:600; color:var(--laranja-texto); margin:22px 0 10px; padding-bottom:5px; border-bottom:1px solid var(--linha); }
.modal-corpo > .grupo-titulo:first-child { margin-top:0; }
.campo input[readonly] { background:#F5F5F2; color:var(--tinta-2); }
.campo-com-botao { display:flex; gap:6px; align-items:center; }
.declaracao { background:#F7F7F4; border:1px solid var(--linha); border-radius:8px; padding:14px; font-size:13.5px; }
.declaracao p { margin:0; line-height:1.6; }
.marcador { display:flex; align-items:flex-start; gap:9px; font-size:14px; cursor:pointer; margin-top:10px; color:var(--tinta); }
.marcador input { width:17px; height:17px; margin:2px 0 0; accent-color:var(--laranja); flex:0 0 auto; }

/* acesso do aluno */
.acesso { display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap;
  background:var(--laranja-claro); border-radius:8px; padding:14px 16px; margin:16px 0; }
.acesso-dados strong { display:block; font-weight:600; }
.acesso-dados b { font-family:var(--cond); font-size:16px; letter-spacing:.03em; color:var(--tinta); }

/* ficha */
.ficha { display:grid; grid-template-columns:154px 1fr; gap:7px 14px; margin:0; font-size:14px; }
.ficha dt { color:var(--tinta-2); font-size:13.5px; }
.ficha dd { margin:0; }
.autorizacao { display:flex; align-items:center; gap:7px; font-size:13.5px; color:var(--tinta-2); margin:16px 0 0; }
.autorizacao.ok { color:var(--laranja-texto); }
.identidade { display:flex; align-items:center; gap:14px; margin-top:14px; }
.identidade .emblema-botao { background:var(--grafite); color:#fff; width:58px; height:58px; }
.espaco { margin-top:8px; }
.data-bloco.fixado { background:var(--laranja); color:#1C1C1E; }

/* palco e moldura do app */
.app.app-palco { flex-direction:column; align-items:center; justify-content:center; background:var(--grafite-2); padding:20px 16px; }
.palco { display:flex; flex-direction:column; align-items:center; gap:12px; width:100%; }
.btn-claro { background:rgba(255,255,255,.12); color:#fff; border:1px solid rgba(255,255,255,.22); }
.btn-claro:hover { background:rgba(255,255,255,.2); }
.palco-nota { color:#8E8F93; font-size:12.5px; margin:0; }
.fone { width:392px; max-width:100%; height:min(820px,86vh); background:var(--canvas); border-radius:30px;
  overflow:hidden; box-shadow:0 24px 70px rgba(0,0,0,.5); border:8px solid #0E0F11; display:flex; }

/* app do aluno */
.fone-tela { display:flex; flex-direction:column; width:100%; height:100%; background:var(--canvas); }
.fone-topo { display:flex; align-items:center; gap:10px; padding:13px 15px; background:var(--grafite); color:#fff; flex:0 0 auto; }
.fone-logo { width:30px; height:30px; border-radius:50%; background:#fff; color:var(--grafite); display:flex;
  align-items:center; justify-content:center; overflow:hidden; flex:0 0 auto; }
.fone-logo img { width:100%; height:100%; object-fit:contain; }
.fone-logo-vazio { font-family:var(--cond); font-weight:700; font-size:14px; }
.fone-nome { flex:1; font-family:var(--cond); font-size:18px; font-weight:600; min-width:0; }
.icone-claro { color:#BFC0C3; }
.icone-claro:hover { background:rgba(255,255,255,.12); color:#fff; }
.fone-corpo { flex:1; overflow-y:auto; padding:16px 15px 26px; }
.fone-abas { display:flex; background:var(--gi); border-top:1px solid var(--linha); flex:0 0 auto; }
.fone-aba { flex:1; background:none; border:0; padding:9px 4px 11px; display:flex; flex-direction:column;
  align-items:center; gap:3px; font-size:11px; color:var(--tinta-2); }
.fone-aba.ativo { color:var(--laranja-texto); font-weight:600; box-shadow:inset 0 3px 0 var(--laranja); }
.m-saudacao { font-family:var(--cond); font-size:26px; font-weight:600; margin:0 0 12px; }
.m-titulo { font-family:var(--cond); font-size:16px; font-weight:600; color:var(--tinta-2); margin:20px 0 8px; }
.m-faixa { background:var(--gi); border:1px solid var(--linha); border-radius:10px; padding:14px; }
.m-faixa-info { display:flex; flex-direction:column; margin-top:10px; }
.m-progresso { margin-top:12px; display:flex; flex-direction:column; gap:5px; }
.m-item { display:flex; align-items:center; gap:10px; background:var(--gi); border:1px solid var(--linha);
  border-radius:9px; padding:10px 12px; margin-bottom:7px; }
.m-vazio { font-size:13.5px; color:var(--tinta-2); margin:0; line-height:1.6; }
.m-aviso { background:var(--gi); border:1px solid var(--linha); border-radius:9px; padding:12px 13px; margin-bottom:8px; }
.m-aviso.fixado { border-color:var(--laranja); box-shadow:inset 3px 0 0 var(--laranja); }
.m-aviso strong { display:block; margin-bottom:4px; }
.m-aviso p { margin:0 0 6px; font-size:14px; line-height:1.5; }
.m-dia.hoje .m-titulo { color:var(--laranja-texto); }
.m-evento { display:flex; gap:12px; background:var(--gi); border:1px solid var(--linha); border-radius:9px; padding:12px; margin-bottom:8px; }
.m-evento strong { font-size:15px; }
.m-evento-desc { font-size:13.5px; margin:6px 0 0; line-height:1.5; }
.m-numeros { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:12px; }
.m-numeros div { background:var(--gi); border:1px solid var(--linha); border-radius:9px; padding:10px; text-align:center; }
.m-numeros strong { display:block; font-family:var(--cond); font-size:22px; font-weight:600; }
.m-numeros span { font-size:11px; color:var(--tinta-2); }
.m-req { background:var(--gi); border:1px solid var(--linha); border-radius:9px; padding:12px; }
.fone-corpo .btn-largo { margin-top:12px; }
.fone-corpo .req-linha { grid-template-columns:46px 1fr 98px; font-size:12.5px; }

@media (max-width:760px) {
  .app.app-palco { padding:0; }
  .palco-nota, .palco .btn-claro { display:none; }
  .fone { width:100%; height:100vh; border:0; border-radius:0; box-shadow:none; }
  .ficha { grid-template-columns:1fr; gap:1px; }
  .ficha dd { margin-bottom:9px; }
  .acesso { flex-direction:column; align-items:stretch; }
}

.nav-estado { padding:8px 6px 0; }
.sinal { display:flex; align-items:center; gap:7px; width:100%; background:none; border:0; color:#9FA0A4;
  font-size:12px; padding:5px 6px; border-radius:5px; text-align:left; }
.sinal:hover { background:rgba(255,255,255,.08); color:#fff; }
.ponto { width:7px; height:7px; border-radius:50%; background:#6F7175; flex:0 0 auto; }
.sinal-ok .ponto { background:#4FA96A; }
.sinal-erro .ponto { background:#D5533A; }
.sinal-enviando .ponto, .sinal-lendo .ponto { background:var(--laranja); }
.estado-sinc { font-size:13.5px; border-radius:7px; padding:9px 12px; margin-top:12px; background:#F3F3F0; color:var(--tinta-2); }
.estado-sinc.estado-ok { background:#ECF5EE; color:#2E6B41; }
.estado-sinc.estado-erro { background:#F9ECE8; color:#93331D; }

@media (prefers-reduced-motion:reduce) { .app * { transition:none !important; animation:none !important; } }
`;
