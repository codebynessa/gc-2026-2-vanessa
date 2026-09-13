// Agenda de Consultas — versão 1.0.0
// As consultas ficam no localStorage do navegador. Nada sai da máquina.

const CHAVE = "agenda-consultas";

const formulario = document.getElementById("formulario");
const mensagem = document.getElementById("mensagem");
const lista = document.getElementById("lista");
const aviso = document.getElementById("aviso");

// O localStorage nem sempre esta disponivel: abrindo o arquivo direto do disco
// (file://), em aba anonima, ou com o navegador bloqueando dados de site, o
// acesso lanca excecao. Quando isso acontece a agenda continua funcionando na
// memoria; so nao guarda ao fechar a pagina.
let memoria = [];
let temArmazenamento = true;

function semArmazenamento() {
  temArmazenamento = false;
  if (aviso) aviso.hidden = false;
}

function carregar() {
  if (!temArmazenamento) return memoria;
  try {
    const salvo = localStorage.getItem(CHAVE);
    return salvo ? JSON.parse(salvo) : [];
  } catch (erro) {
    semArmazenamento();
    return memoria;
  }
}

function salvar(consultas) {
  memoria = consultas;
  if (!temArmazenamento) return;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(consultas));
  } catch (erro) {
    semArmazenamento();
  }
}

function horarioOcupado(consultas, nova) {
  return consultas.some(
    (c) => c.data === nova.data && c.hora === nova.hora && c.profissional === nova.profissional
  );
}

function renderizar() {
  const consultas = carregar().sort((a, b) =>
    (a.data + a.hora).localeCompare(b.data + b.hora)
  );

  lista.innerHTML = "";

  if (consultas.length === 0) {
    lista.innerHTML = '<tr><td colspan="4" class="vazio">Nenhuma consulta agendada.</td></tr>';
    return;
  }

  for (const c of consultas) {
    const linha = document.createElement("tr");
    linha.innerHTML = `<td>${c.data}</td><td>${c.hora}</td><td>${c.profissional}</td><td>${c.paciente}</td>`;
    lista.appendChild(linha);
  }
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nova = {
    paciente: document.getElementById("paciente").value.trim(),
    profissional: document.getElementById("profissional").value,
    data: document.getElementById("data").value,
    hora: document.getElementById("hora").value,
  };
  const quando = new Date(`${nova.data}T${nova.hora}`);
  if (quando < new Date()) {
    const dataBr = nova.data.split("-").reverse().join("/");
    mensagem.textContent = `Data passada: ${dataBr} às ${nova.hora} já aconteceu. Escolha uma data futura.`;
    return;
  }

  const consultas = carregar();
  if (horarioOcupado(consultas, nova)) {
    const dataBr = nova.data.split("-").reverse().join("/");
    mensagem.textContent = `Horário indisponível: ${nova.profissional} já tem consulta em ${dataBr} às ${nova.hora}. Escolha outro horário.`;
    return;
  }

  consultas.push(nova);
  salvar(consultas);
  mensagem.textContent = "Consulta agendada.";
  formulario.reset();
  renderizar();
});

renderizar();
