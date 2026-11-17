import { generateId, getNowISO } from '../lib/formatters';
import { repositories } from '../repositories';
import { Reader, ReaderStatus, ReaderType } from '../types/library';

export interface CreateReaderInput {
  fullName: string;
  registrationNumber: string;
  email: string;
  type: ReaderType;
  departmentOrClass?: string;
}

export interface UpdateReaderInput extends CreateReaderInput {
  status: ReaderStatus;
}

export const readerService = {
  listReaders(): Reader[] {
    return repositories.readers
      .findAll()
      .slice()
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'pt-BR'));
  },

  getReaderById(readerId: string): Reader | null {
    return repositories.readers.findById(readerId);
  },

  createReader(input: CreateReaderInput, actorName = 'Bibliotecário'): Reader {
    if (!input.fullName.trim()) {
      throw new Error('O nome completo do leitor é obrigatório.');
    }
    if (!input.registrationNumber.trim()) {
      throw new Error('A matrícula é obrigatória.');
    }
    if (!input.email.trim() || !input.email.includes('@')) {
      throw new Error('Informe um e-mail válido.');
    }

    if (repositories.readers.findByRegistration(input.registrationNumber)) {
      throw new Error(
        `Já existe um leitor cadastrado com a matrícula "${input.registrationNumber.trim()}".`
      );
    }

    if (repositories.readers.findByEmail(input.email)) {
      throw new Error(`Já existe um leitor cadastrado com o e-mail "${input.email.trim()}".`);
    }

    const now = getNowISO();
    const reader: Reader = {
      id: generateId('reader'),
      fullName: input.fullName.trim(),
      registrationNumber: input.registrationNumber.trim().toUpperCase(),
      email: input.email.trim().toLowerCase(),
      type: input.type,
      departmentOrClass: input.departmentOrClass?.trim() || undefined,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    repositories.readers.save(reader);

    repositories.activities.add({
      id: generateId('act'),
      type: 'reader_created',
      title: 'Novo leitor cadastrado',
      description: `${reader.fullName} (${reader.registrationNumber}) cadastrado.`,
      actorName,
      createdAt: now,
    });

    return reader;
  },

  updateReader(readerId: string, input: UpdateReaderInput): Reader {
    const existing = repositories.readers.findById(readerId);
    if (!existing) {
      throw new Error('Leitor não encontrado.');
    }

    if (!input.fullName.trim()) {
      throw new Error('O nome completo do leitor é obrigatório.');
    }
    if (!input.registrationNumber.trim()) {
      throw new Error('A matrícula é obrigatória.');
    }
    if (!input.email.trim() || !input.email.includes('@')) {
      throw new Error('Informe um e-mail válido.');
    }

    const dupReg = repositories.readers.findByRegistration(input.registrationNumber);
    if (dupReg && dupReg.id !== readerId) {
      throw new Error(
        `A matrícula "${input.registrationNumber.trim()}" já pertence a outro leitor.`
      );
    }

    const dupEmail = repositories.readers.findByEmail(input.email);
    if (dupEmail && dupEmail.id !== readerId) {
      throw new Error(`O e-mail "${input.email.trim()}" já está em uso por outro leitor.`);
    }

    const updated: Reader = {
      ...existing,
      fullName: input.fullName.trim(),
      registrationNumber: input.registrationNumber.trim().toUpperCase(),
      email: input.email.trim().toLowerCase(),
      type: input.type,
      departmentOrClass: input.departmentOrClass?.trim() || undefined,
      status: input.status,
      updatedAt: getNowISO(),
    };

    return repositories.readers.save(updated);
  },

  toggleStatus(readerId: string): Reader {
    const existing = repositories.readers.findById(readerId);
    if (!existing) {
      throw new Error('Leitor não encontrado.');
    }

    const nextStatus: ReaderStatus = existing.status === 'active' ? 'inactive' : 'active';
    const updated: Reader = {
      ...existing,
      status: nextStatus,
      updatedAt: getNowISO(),
    };
    return repositories.readers.save(updated);
  },

  deleteReader(readerId: string): void {
    const existing = repositories.readers.findById(readerId);
    if (!existing) {
      throw new Error('Leitor não encontrado.');
    }

    const readerLoans = repositories.loans.findByReaderId(readerId);
    const hasActiveLoans = readerLoans.some((l) => l.status === 'active');

    if (hasActiveLoans) {
      throw new Error(
        'Não é possível excluir um leitor com empréstimos ativos. Utilize a opção de desativar o cadastro.'
      );
    }

    const hasPendingOrApproved = readerLoans.some(
      (l) => l.status === 'pending' || l.status === 'approved'
    );
    if (hasPendingOrApproved) {
      throw new Error(
        'O leitor possui solicitações pendentes ou aprovadas em aberto. Cancele ou conclua antes de excluir, ou apenas desative o cadastro.'
      );
    }

    repositories.readers.delete(readerId);
  },
};
