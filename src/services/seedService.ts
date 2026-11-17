import { addDaysToISO, getNowISO, subtractDaysFromNowISO } from '../lib/formatters';
import { STORAGE_KEYS, storageDriver } from '../lib/storage';
import { repositories } from '../repositories';
import { DEFAULT_LIBRARY_SETTINGS } from '../repositories/localRepositories';
import {
  ActivityEvent,
  Book,
  BookCopy,
  Loan,
  Reader,
} from '../types/library';

function buildInitialData(): {
  books: Book[];
  copies: BookCopy[];
  readers: Reader[];
  loans: Loan[];
  activities: ActivityEvent[];
} {
  const now = getNowISO();
  const basePast = subtractDaysFromNowISO(20);

  const books: Book[] = [
    {
      id: 'book_dom_casmurro',
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      isbn: '978-85-359-0277-8',
      publisher: 'Companhia das Letras',
      publicationYear: 2016,
      category: 'Literatura Brasileira',
      description:
        'Narrado por Bento Santiago na velhice, o romance revisita as memórias de infância, o seminário e o casamento com Capitu, construindo um dos maiores enigmas da literatura brasileira.',
      coverUrl: '/src/assets/images/cover_literatura_classica_1794882663679.jpg',
      accentColor: '#14532D',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_vidas_secas',
      title: 'Vidas Secas',
      author: 'Graciliano Ramos',
      isbn: '978-85-01-06506-3',
      publisher: 'Editora Record',
      publicationYear: 2019,
      category: 'Literatura Brasileira',
      description:
        'Retrato comovente da família de retirantes nordestinos formada por Fabiano, Sinhá Vitória, os dois filhos e a cadela Baleia em busca de sobrevivência no sertão.',
      accentColor: '#78350F',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_quarto_despejo',
      title: 'Quarto de Despejo: Diário de uma Favelada',
      author: 'Carolina Maria de Jesus',
      isbn: '978-85-08-16779-1',
      publisher: 'Editora Ática',
      publicationYear: 2014,
      category: 'Literatura Brasileira',
      description:
        'Diário real escrito entre 1955 e 1960 por Carolina Maria de Jesus na comunidade do Canindé, em São Paulo. Documento histórico e literário fundamental do século XX.',
      accentColor: '#3F3F46',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_cortico',
      title: 'O Cortiço',
      author: 'Aluísio Azevedo',
      isbn: '978-85-254-2055-8',
      publisher: 'L&PM Editores',
      publicationYear: 2018,
      category: 'Literatura Brasileira',
      description:
        'Obra-prima do Naturalismo brasileiro que acompanha o cotidiano coletivo de uma habitação popular no Rio de Janeiro do século XIX sob o comando de João Romão.',
      accentColor: '#1E3A8A',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_1984',
      title: '1984',
      author: 'George Orwell',
      isbn: '978-85-359-1484-9',
      publisher: 'Companhia das Letras',
      publicationYear: 2009,
      category: 'Literatura Estrangeira',
      description:
        'Distopia clássica sobre Winston Smith, funcionário do Ministério da Verdade que ousa questionar a vigilância absoluta e a manipulação linguística do Grande Irmão.',
      coverUrl: '/src/assets/images/cover_ficcao_moderna_1794882665128.jpg',
      accentColor: '#1E293B',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_pequeno_principe',
      title: 'O Pequeno Príncipe',
      author: 'Antoine de Saint-Exupéry',
      isbn: '978-85-220-0523-9',
      publisher: 'Agir Editora',
      publicationYear: 2015,
      category: 'Literatura Estrangeira',
      description:
        'Fábula poética sobre amizade, responsabilidade e olhar crítico diante do mundo adulto, narrada por um aviador perdido no deserto do Saara.',
      accentColor: '#0F766E',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_origem_especies',
      title: 'A Origem das Espécies',
      author: 'Charles Darwin',
      isbn: '978-85-723-2945-3',
      publisher: 'Martin Claret',
      publicationYear: 2018,
      category: 'Ciências & Biologia',
      description:
        'Texto fundador da biologia evolutiva moderna que apresenta a teoria da seleção natural e a ancestralidade comum dos seres vivos a partir de observações de campo.',
      coverUrl: '/src/assets/images/cover_ciencias_biologia_1794882663944.jpg',
      accentColor: '#115E59',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_cosmos',
      title: 'Cosmos',
      author: 'Carl Sagan',
      isbn: '978-85-359-2988-1',
      publisher: 'Companhia das Letras',
      publicationYear: 2017,
      category: 'Ciências & Biologia',
      description:
        'Jornada pela história da astronomia, evolução cósmica e método científico, conectando descobertas da física e da biologia à trajetória humana.',
      accentColor: '#1D4ED8',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_homem_calculava',
      title: 'O Homem que Calculava',
      author: 'Malba Tahan',
      isbn: '978-85-01-06851-4',
      publisher: 'Editora Record',
      publicationYear: 2020,
      category: 'Matemática & Lógica',
      description:
        'As aventuras do calculista Beremiz Samir resolvendo dilemas matemáticos, enigmas de lógica e partilhas impossíveis através do raciocínio criativo.',
      accentColor: '#9A3412',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_raizes_brasil',
      title: 'Raízes do Brasil',
      author: 'Sérgio Buarque de Holanda',
      isbn: '978-85-359-2548-7',
      publisher: 'Companhia das Letras',
      publicationYear: 2015,
      category: 'História & Humanidades',
      description:
        'Ensaio clássico de interpretação histórica e sociológica da formação da sociedade brasileira, analisando a herança ibérica e o conceito de homem cordial.',
      coverUrl: '/src/assets/images/cover_historia_sociedade_1794882664033.jpg',
      accentColor: '#1E3A8A',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_sapiens',
      title: 'Sapiens: Uma Breve História da Humanidade',
      author: 'Yuval Noah Harari',
      isbn: '978-85-254-3218-6',
      publisher: 'L&PM Editores',
      publicationYear: 2018,
      category: 'História & Humanidades',
      description:
        'Síntese acessível das revoluções cognitiva, agrícola e científica que transformaram o Homo sapiens no principal agente de mudança do planeta.',
      accentColor: '#57534E',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_entendendo_algoritmos',
      title: 'Entendendo Algoritmos',
      author: 'Aditya Y. Bhargava',
      isbn: '978-85-7522-563-9',
      publisher: 'Novatec Editora',
      publicationYear: 2017,
      category: 'Tecnologia & Programação',
      description:
        'Guia ilustrado e intuitivo sobre busca binária, ordenação, recursão, tabelas hash, grafos e programação dinâmica com exemplos práticos em Python.',
      coverUrl: '/src/assets/images/cover_tecnologia_algoritmos_1794882664445.jpg',
      accentColor: '#1E40AF',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_codigo_limpo',
      title: 'Código Limpo: Habilidades Práticas do Agile Software',
      author: 'Robert C. Martin',
      isbn: '978-85-7608-267-5',
      publisher: 'Alta Books',
      publicationYear: 2012,
      category: 'Tecnologia & Programação',
      description:
        'Referência essencial de engenharia de software sobre legibilidade, nomeação, refatoração, testes automatizados e organização modular de código.',
      accentColor: '#0F172A',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'book_etica_nicomaco',
      title: 'Ética a Nicômaco',
      author: 'Aristóteles',
      isbn: '978-85-7283-892-4',
      publisher: 'Edipro',
      publicationYear: 2014,
      category: 'Filosofia & Sociologia',
      description:
        'Tratado filosófico clássico sobre virtude, justiça, prudência e a busca pela eudaimonia (florescimento humano) na vida em comunidade.',
      coverUrl: '/src/assets/images/cover_filosofia_ensaio_1794882665116.jpg',
      accentColor: '#78350F',
      createdAt: basePast,
      updatedAt: basePast,
    },
  ];

  // Exemplares físicos distribuídos entre os 14 livros (30 exemplares no total)
  const copies: BookCopy[] = [
    // Dom Casmurro (3 exemplares: 1 emprestado, 2 disponíveis)
    { id: 'copy_dc_1', bookId: 'book_dom_casmurro', assetCode: 'PAT-00101', condition: 'excellent', status: 'loaned', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_dc_2', bookId: 'book_dom_casmurro', assetCode: 'PAT-00102', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_dc_3', bookId: 'book_dom_casmurro', assetCode: 'PAT-00103', condition: 'fair', status: 'available', createdAt: basePast, updatedAt: basePast },

    // Vidas Secas (2 exemplares: ambos disponíveis)
    { id: 'copy_vs_1', bookId: 'book_vidas_secas', assetCode: 'PAT-00104', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_vs_2', bookId: 'book_vidas_secas', assetCode: 'PAT-00105', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },

    // Quarto de Despejo (2 exemplares: 1 emprestado atrasado, 1 disponível)
    { id: 'copy_qd_1', bookId: 'book_quarto_despejo', assetCode: 'PAT-00106', condition: 'excellent', status: 'loaned', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_qd_2', bookId: 'book_quarto_despejo', assetCode: 'PAT-00107', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },

    // O Cortiço (2 exemplares: 1 disponível, 1 manutenção)
    { id: 'copy_oc_1', bookId: 'book_cortico', assetCode: 'PAT-00108', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_oc_2', bookId: 'book_cortico', assetCode: 'PAT-00109', condition: 'damaged', status: 'maintenance', notes: 'Lombada sendo restaurada', createdAt: basePast, updatedAt: basePast },

    // 1984 (3 exemplares: 1 emprestado, 2 disponíveis)
    { id: 'copy_1984_1', bookId: 'book_1984', assetCode: 'PAT-00110', condition: 'excellent', status: 'loaned', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_1984_2', bookId: 'book_1984', assetCode: 'PAT-00111', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_1984_3', bookId: 'book_1984', assetCode: 'PAT-00112', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },

    // O Pequeno Príncipe (2 exemplares: disponíveis)
    { id: 'copy_pp_1', bookId: 'book_pequeno_principe', assetCode: 'PAT-00113', condition: 'excellent', status: 'available', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_pp_2', bookId: 'book_pequeno_principe', assetCode: 'PAT-00114', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },

    // A Origem das Espécies (2 exemplares: disponíveis)
    { id: 'copy_oe_1', bookId: 'book_origem_especies', assetCode: 'PAT-00115', condition: 'excellent', status: 'available', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_oe_2', bookId: 'book_origem_especies', assetCode: 'PAT-00116', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },

    // Cosmos (2 exemplares: disponíveis)
    { id: 'copy_co_1', bookId: 'book_cosmos', assetCode: 'PAT-00117', condition: 'excellent', status: 'available', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_co_2', bookId: 'book_cosmos', assetCode: 'PAT-00118', condition: 'fair', status: 'available', createdAt: basePast, updatedAt: basePast },

    // O Homem que Calculava (2 exemplares: disponíveis)
    { id: 'copy_hc_1', bookId: 'book_homem_calculava', assetCode: 'PAT-00119', condition: 'excellent', status: 'available', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_hc_2', bookId: 'book_homem_calculava', assetCode: 'PAT-00120', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },

    // Raízes do Brasil (2 exemplares: disponíveis)
    { id: 'copy_rb_1', bookId: 'book_raizes_brasil', assetCode: 'PAT-00121', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_rb_2', bookId: 'book_raizes_brasil', assetCode: 'PAT-00122', condition: 'fair', status: 'available', createdAt: basePast, updatedAt: basePast },

    // Sapiens (2 exemplares: 1 emprestado atrasado, 1 disponível)
    { id: 'copy_sa_1', bookId: 'book_sapiens', assetCode: 'PAT-00123', condition: 'excellent', status: 'loaned', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_sa_2', bookId: 'book_sapiens', assetCode: 'PAT-00124', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },

    // Entendendo Algoritmos (2 exemplares: disponíveis)
    { id: 'copy_ea_1', bookId: 'book_entendendo_algoritmos', assetCode: 'PAT-00125', condition: 'excellent', status: 'available', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_ea_2', bookId: 'book_entendendo_algoritmos', assetCode: 'PAT-00126', condition: 'excellent', status: 'available', createdAt: basePast, updatedAt: basePast },

    // Código Limpo (2 exemplares: 1 emprestado, 1 manutenção — sem disponível no momento!)
    { id: 'copy_cl_1', bookId: 'book_codigo_limpo', assetCode: 'PAT-00127', condition: 'good', status: 'loaned', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_cl_2', bookId: 'book_codigo_limpo', assetCode: 'PAT-00128', condition: 'fair', status: 'maintenance', notes: 'Reparo na capa', createdAt: basePast, updatedAt: basePast },

    // Ética a Nicômaco (2 exemplares: disponíveis)
    { id: 'copy_en_1', bookId: 'book_etica_nicomaco', assetCode: 'PAT-00129', condition: 'excellent', status: 'available', createdAt: basePast, updatedAt: basePast },
    { id: 'copy_en_2', bookId: 'book_etica_nicomaco', assetCode: 'PAT-00130', condition: 'good', status: 'available', createdAt: basePast, updatedAt: basePast },
  ];

  // 10 Leitores cadastrados (alunos e professores)
  const readers: Reader[] = [
    {
      id: 'reader_lucas',
      fullName: 'Lucas Mendes Ferreira',
      registrationNumber: 'ALU-2026014',
      email: 'lucas.ferreira@escola.edu.br',
      type: 'student',
      departmentOrClass: '3º Ano A — Ensino Médio',
      status: 'active',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'reader_sofia',
      fullName: 'Sofia Andrade Costa',
      registrationNumber: 'ALU-2026029',
      email: 'sofia.costa@escola.edu.br',
      type: 'student',
      departmentOrClass: '2º Ano B — Ensino Médio',
      status: 'active',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'reader_ricardo',
      fullName: 'Prof. Ricardo Alencar Silva',
      registrationNumber: 'PROF-1042',
      email: 'ricardo.alencar@escola.edu.br',
      type: 'teacher',
      departmentOrClass: 'Linguagens e Literatura',
      status: 'active',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'reader_beatriz',
      fullName: 'Beatriz Nogueira Lima',
      registrationNumber: 'ALU-2026051',
      email: 'beatriz.lima@escola.edu.br',
      type: 'student',
      departmentOrClass: '1º Ano A — Ensino Médio',
      status: 'active',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'reader_gabriel',
      fullName: 'Gabriel Martins Rocha',
      registrationNumber: 'ALU-2026078',
      email: 'gabriel.rocha@escola.edu.br',
      type: 'student',
      departmentOrClass: '3º Ano C — Técnico em Informática',
      status: 'active',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'reader_mariana',
      fullName: 'Profa. Mariana Duarte Tavares',
      registrationNumber: 'PROF-1089',
      email: 'mariana.tavares@escola.edu.br',
      type: 'teacher',
      departmentOrClass: 'Ciências da Natureza e Biologia',
      status: 'active',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'reader_pedro',
      fullName: 'Pedro Henrique Campos',
      registrationNumber: 'ALU-2026093',
      email: 'pedro.campos@escola.edu.br',
      type: 'student',
      departmentOrClass: '9º Ano B — Ensino Fundamental',
      status: 'active',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'reader_clara',
      fullName: 'Clara Ribeiro Azevedo',
      registrationNumber: 'ALU-2026105',
      email: 'clara.azevedo@escola.edu.br',
      type: 'student',
      departmentOrClass: '2º Ano A — Ensino Médio',
      status: 'active',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'reader_eduardo',
      fullName: 'Prof. Eduardo Vasconcelos Pinto',
      registrationNumber: 'PROF-1114',
      email: 'eduardo.pinto@escola.edu.br',
      type: 'teacher',
      departmentOrClass: 'História e Filosofia',
      status: 'active',
      createdAt: basePast,
      updatedAt: basePast,
    },
    {
      id: 'reader_tiago_inativo',
      fullName: 'Tiago Oliveira (Egresso 2025)',
      registrationNumber: 'ALU-2025198',
      email: 'tiago.oliveira@escola.edu.br',
      type: 'student',
      departmentOrClass: 'Turma Concluída — 2025',
      status: 'inactive',
      createdAt: basePast,
      updatedAt: basePast,
    },
  ];

  // Empréstimos demonstrando todos os estados e cenários
  const d12 = subtractDaysFromNowISO(12);
  const d10 = subtractDaysFromNowISO(10);
  const d9 = subtractDaysFromNowISO(9);
  const d5 = subtractDaysFromNowISO(5);
  const d4 = subtractDaysFromNowISO(4);
  const d3 = subtractDaysFromNowISO(3);
  const d2 = subtractDaysFromNowISO(2);
  const d1 = subtractDaysFromNowISO(1);

  const loans: Loan[] = [
    // 1) Empréstimo ativo atrasado (retirado há 12 dias, prazo 7 dias -> atrasado há 5 dias)
    {
      id: 'loan_active_overdue_1',
      bookId: 'book_quarto_despejo',
      copyId: 'copy_qd_1',
      readerId: 'reader_beatriz',
      bookTitle: 'Quarto de Despejo: Diário de uma Favelada',
      bookAuthor: 'Carolina Maria de Jesus',
      copyCode: 'PAT-00106',
      readerName: 'Beatriz Nogueira Lima',
      readerRegistration: 'ALU-2026051',
      readerType: 'student',
      status: 'active',
      requestedAt: subtractDaysFromNowISO(13),
      approvedAt: d12,
      approvedBy: 'Helena Vasconcelos',
      pickupDate: d12,
      dueDate: addDaysToISO(d12, 7),
      updatedAt: d12,
    },
    // 2) Empréstimo ativo atrasado (retirado há 10 dias, prazo 7 dias -> atrasado há 3 dias)
    {
      id: 'loan_active_overdue_2',
      bookId: 'book_sapiens',
      copyId: 'copy_sa_1',
      readerId: 'reader_pedro',
      bookTitle: 'Sapiens: Uma Breve História da Humanidade',
      bookAuthor: 'Yuval Noah Harari',
      copyCode: 'PAT-00123',
      readerName: 'Pedro Henrique Campos',
      readerRegistration: 'ALU-2026093',
      readerType: 'student',
      status: 'active',
      requestedAt: subtractDaysFromNowISO(11),
      approvedAt: d10,
      approvedBy: 'Helena Vasconcelos',
      pickupDate: d10,
      dueDate: addDaysToISO(d10, 7),
      updatedAt: d10,
    },
    // 3) Empréstimo ativo no prazo (retirado há 3 dias, vence em 4 dias) — do Lucas (usuário demo aluno)
    {
      id: 'loan_active_ok_1',
      bookId: 'book_dom_casmurro',
      copyId: 'copy_dc_1',
      readerId: 'reader_lucas',
      bookTitle: 'Dom Casmurro',
      bookAuthor: 'Machado de Assis',
      copyCode: 'PAT-00101',
      readerName: 'Lucas Mendes Ferreira',
      readerRegistration: 'ALU-2026014',
      readerType: 'student',
      status: 'active',
      requestedAt: d4,
      approvedAt: d3,
      approvedBy: 'Helena Vasconcelos',
      pickupDate: d3,
      dueDate: addDaysToISO(d3, 7),
      notes: 'Leitura para seminário de Literatura Brasileira.',
      updatedAt: d3,
    },
    // 4) Empréstimo ativo no prazo (retirado há 2 dias)
    {
      id: 'loan_active_ok_2',
      bookId: 'book_1984',
      copyId: 'copy_1984_1',
      readerId: 'reader_clara',
      bookTitle: '1984',
      bookAuthor: 'George Orwell',
      copyCode: 'PAT-00110',
      readerName: 'Clara Ribeiro Azevedo',
      readerRegistration: 'ALU-2026105',
      readerType: 'student',
      status: 'active',
      requestedAt: d3,
      approvedAt: d2,
      approvedBy: 'Helena Vasconcelos',
      pickupDate: d2,
      dueDate: addDaysToISO(d2, 7),
      updatedAt: d2,
    },
    // 5) Empréstimo ativo no prazo (Código Limpo - último exemplar em circulação)
    {
      id: 'loan_active_ok_3',
      bookId: 'book_codigo_limpo',
      copyId: 'copy_cl_1',
      readerId: 'reader_gabriel',
      bookTitle: 'Código Limpo: Habilidades Práticas do Agile Software',
      bookAuthor: 'Robert C. Martin',
      copyCode: 'PAT-00127',
      readerName: 'Gabriel Martins Rocha',
      readerRegistration: 'ALU-2026078',
      readerType: 'student',
      status: 'active',
      requestedAt: d2,
      approvedAt: d1,
      approvedBy: 'Helena Vasconcelos',
      pickupDate: d1,
      dueDate: addDaysToISO(d1, 7),
      updatedAt: d1,
    },
    // 6) Solicitação aprovada aguardando retirada física (não iniciou contagem!)
    {
      id: 'loan_approved_1',
      bookId: 'book_raizes_brasil',
      readerId: 'reader_ricardo',
      bookTitle: 'Raízes do Brasil',
      bookAuthor: 'Sérgio Buarque de Holanda',
      readerName: 'Prof. Ricardo Alencar Silva',
      readerRegistration: 'PROF-1042',
      readerType: 'teacher',
      status: 'approved',
      requestedAt: d2,
      approvedAt: d1,
      approvedBy: 'Helena Vasconcelos',
      notes: 'Material de apoio para aula do 3º ano.',
      updatedAt: d1,
    },
    // 7) Solicitação aprovada aguardando retirada física
    {
      id: 'loan_approved_2',
      bookId: 'book_origem_especies',
      readerId: 'reader_mariana',
      bookTitle: 'A Origem das Espécies',
      bookAuthor: 'Charles Darwin',
      readerName: 'Profa. Mariana Duarte Tavares',
      readerRegistration: 'PROF-1089',
      readerType: 'teacher',
      status: 'approved',
      requestedAt: d2,
      approvedAt: d1,
      approvedBy: 'Helena Vasconcelos',
      updatedAt: d1,
    },
    // 8) Solicitação pendente
    {
      id: 'loan_pending_1',
      bookId: 'book_entendendo_algoritmos',
      readerId: 'reader_gabriel',
      bookTitle: 'Entendendo Algoritmos',
      bookAuthor: 'Aditya Y. Bhargava',
      readerName: 'Gabriel Martins Rocha',
      readerRegistration: 'ALU-2026078',
      readerType: 'student',
      status: 'pending',
      requestedAt: d1,
      notes: 'Preparação para Olimpíada Brasileira de Informática.',
      updatedAt: d1,
    },
    // 9) Solicitação pendente (Sofia)
    {
      id: 'loan_pending_2',
      bookId: 'book_etica_nicomaco',
      readerId: 'reader_sofia',
      bookTitle: 'Ética a Nicômaco',
      bookAuthor: 'Aristóteles',
      readerName: 'Sofia Andrade Costa',
      readerRegistration: 'ALU-2026029',
      readerType: 'student',
      status: 'pending',
      requestedAt: now,
      updatedAt: now,
    },
    // 10) Solicitação pendente (Prof. Eduardo)
    {
      id: 'loan_pending_3',
      bookId: 'book_vidas_secas',
      readerId: 'reader_eduardo',
      bookTitle: 'Vidas Secas',
      bookAuthor: 'Graciliano Ramos',
      readerName: 'Prof. Eduardo Vasconcelos Pinto',
      readerRegistration: 'PROF-1114',
      readerType: 'teacher',
      status: 'pending',
      requestedAt: now,
      updatedAt: now,
    },
    // 11) Histórico devolvido (Lucas)
    {
      id: 'loan_returned_1',
      bookId: 'book_homem_calculava',
      copyId: 'copy_hc_1',
      readerId: 'reader_lucas',
      bookTitle: 'O Homem que Calculava',
      bookAuthor: 'Malba Tahan',
      copyCode: 'PAT-00119',
      readerName: 'Lucas Mendes Ferreira',
      readerRegistration: 'ALU-2026014',
      readerType: 'student',
      status: 'returned',
      requestedAt: subtractDaysFromNowISO(18),
      approvedAt: subtractDaysFromNowISO(17),
      approvedBy: 'Helena Vasconcelos',
      pickupDate: subtractDaysFromNowISO(17),
      dueDate: subtractDaysFromNowISO(10),
      returnDate: subtractDaysFromNowISO(11),
      returnedTo: 'Helena Vasconcelos',
      updatedAt: subtractDaysFromNowISO(11),
    },
    // 12) Histórico devolvido (Prof. Ricardo)
    {
      id: 'loan_returned_2',
      bookId: 'book_cortico',
      copyId: 'copy_oc_1',
      readerId: 'reader_ricardo',
      bookTitle: 'O Cortiço',
      bookAuthor: 'Aluísio Azevedo',
      copyCode: 'PAT-00108',
      readerName: 'Prof. Ricardo Alencar Silva',
      readerRegistration: 'PROF-1042',
      readerType: 'teacher',
      status: 'returned',
      requestedAt: subtractDaysFromNowISO(15),
      approvedAt: subtractDaysFromNowISO(14),
      approvedBy: 'Helena Vasconcelos',
      pickupDate: subtractDaysFromNowISO(14),
      dueDate: subtractDaysFromNowISO(7),
      returnDate: d9,
      returnedTo: 'Helena Vasconcelos',
      updatedAt: d9,
    },
    // 13) Histórico devolvido de leitor desativado (comprova preservação do histórico)
    {
      id: 'loan_returned_3',
      bookId: 'book_cosmos',
      copyId: 'copy_co_1',
      readerId: 'reader_tiago_inativo',
      bookTitle: 'Cosmos',
      bookAuthor: 'Carl Sagan',
      copyCode: 'PAT-00117',
      readerName: 'Tiago Oliveira (Egresso 2025)',
      readerRegistration: 'ALU-2025198',
      readerType: 'student',
      status: 'returned',
      requestedAt: subtractDaysFromNowISO(19),
      approvedAt: subtractDaysFromNowISO(18),
      approvedBy: 'Helena Vasconcelos',
      pickupDate: subtractDaysFromNowISO(18),
      dueDate: subtractDaysFromNowISO(11),
      returnDate: d12,
      returnedTo: 'Helena Vasconcelos',
      updatedAt: d12,
    },
    // 14) Solicitação rejeitada
    {
      id: 'loan_rejected_1',
      bookId: 'book_codigo_limpo',
      readerId: 'reader_pedro',
      bookTitle: 'Código Limpo: Habilidades Práticas do Agile Software',
      bookAuthor: 'Robert C. Martin',
      readerName: 'Pedro Henrique Campos',
      readerRegistration: 'ALU-2026093',
      readerType: 'student',
      status: 'rejected',
      requestedAt: d5,
      rejectedAt: d4,
      rejectionReason: 'Leitor já possui empréstimo em atraso pendente de devolução.',
      updatedAt: d4,
    },
  ];

  const activities: ActivityEvent[] = [
    {
      id: 'act_1',
      loanId: 'loan_pending_2',
      type: 'loan_requested',
      title: 'Nova solicitação de empréstimo',
      description: 'Sofia Andrade Costa solicitou "Ética a Nicômaco".',
      actorName: 'Sofia Andrade Costa',
      createdAt: now,
    },
    {
      id: 'act_2',
      loanId: 'loan_active_ok_3',
      type: 'loan_pickup',
      title: 'Retirada confirmada',
      description: 'Gabriel Martins Rocha retirou "Código Limpo" (PAT-00127).',
      actorName: 'Helena Vasconcelos',
      createdAt: d1,
    },
    {
      id: 'act_3',
      loanId: 'loan_approved_1',
      type: 'loan_approved',
      title: 'Solicitação aprovada',
      description: 'Pedido de Prof. Ricardo Alencar Silva para "Raízes do Brasil" aprovado.',
      actorName: 'Helena Vasconcelos',
      createdAt: d1,
    },
    {
      id: 'act_4',
      loanId: 'loan_active_ok_1',
      type: 'loan_pickup',
      title: 'Retirada confirmada',
      description: 'Lucas Mendes Ferreira retirou "Dom Casmurro" (PAT-00101).',
      actorName: 'Helena Vasconcelos',
      createdAt: d3,
    },
    {
      id: 'act_5',
      loanId: 'loan_returned_2',
      type: 'loan_returned',
      title: 'Devolução registrada',
      description: 'Prof. Ricardo Alencar Silva devolveu "O Cortiço" (PAT-00108).',
      actorName: 'Helena Vasconcelos',
      createdAt: d9,
    },
  ];

  return { books, copies, readers, loans, activities };
}

export const seedService = {
  ensureSeeded(): void {
    const alreadySeeded = storageDriver.getItem<boolean>(STORAGE_KEYS.SEEDED);
    const existingBooks = repositories.books.findAll();

    if (alreadySeeded && existingBooks.length > 0) {
      return;
    }

    this.resetDemoData();
  },

  resetDemoData(): void {
    const data = buildInitialData();
    repositories.books.saveAll(data.books);
    repositories.copies.saveAll(data.copies);
    repositories.readers.saveAll(data.readers);
    repositories.loans.saveAll(data.loans);
    repositories.activities.saveAll(data.activities);
    repositories.settings.save({
      ...DEFAULT_LIBRARY_SETTINGS,
      updatedAt: getNowISO(),
    });
    storageDriver.setItem(STORAGE_KEYS.SEEDED, true);
  },
};
