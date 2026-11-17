import { STORAGE_KEYS, storageDriver } from '../lib/storage';
import { repositories } from '../repositories';
import { DemoUser, UserRole } from '../types/library';

/**
 * AVISO DE ARQUITETURA (MVP):
 * Esta autenticação é PROVISÓRIA e simulada localmente apenas para demonstração.
 * Em produção, este serviço deverá ser substituído pela integração oficial com Supabase Auth
 * (supabase.auth.signInWithPassword / signOut / onAuthStateChange).
 */
export const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo_admin_helena',
    name: 'Helena Vasconcelos',
    email: 'biblioteca@escola.edu.br',
    role: 'admin',
    subtitle: 'Bibliotecária Responsável · Gestão completa do acervo e circulação',
  },
  {
    id: 'demo_student_lucas',
    name: 'Lucas Mendes Ferreira',
    email: 'lucas.ferreira@escola.edu.br',
    role: 'student',
    readerId: 'reader_lucas',
    subtitle: 'Aluno · 3º Ano A — Ensino Médio · Matrícula ALU-2026014',
  },
  {
    id: 'demo_student_sofia',
    name: 'Sofia Andrade Costa',
    email: 'sofia.costa@escola.edu.br',
    role: 'student',
    readerId: 'reader_sofia',
    subtitle: 'Aluna · 2º Ano B — Ensino Médio · Matrícula ALU-2026029',
  },
  {
    id: 'demo_teacher_ricardo',
    name: 'Prof. Ricardo Alencar Silva',
    email: 'ricardo.alencar@escola.edu.br',
    role: 'teacher',
    readerId: 'reader_ricardo',
    subtitle: 'Professor · Linguagens e Literatura · Matrícula PROF-1042',
  },
];

export const authService = {
  getDemoUsers(): DemoUser[] {
    return DEMO_USERS;
  },

  getCurrentUser(): DemoUser | null {
    const savedId = storageDriver.getItem<string>(STORAGE_KEYS.SESSION);
    if (!savedId) return null;
    const found = DEMO_USERS.find((u) => u.id === savedId) ?? null;
    if (!found) return null;

    // Se o usuário estiver vinculado a um leitor, sincroniza nome atualizado caso tenha sido editado
    if (found.readerId) {
      const reader = repositories.readers.findById(found.readerId);
      if (reader) {
        return {
          ...found,
          name: reader.fullName,
          email: reader.email,
        };
      }
    }
    return found;
  },

  loginAsDemoUser(userId: string): DemoUser {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (!user) {
      throw new Error('Perfil de demonstração não encontrado.');
    }
    storageDriver.setItem(STORAGE_KEYS.SESSION, user.id);
    return this.getCurrentUser() ?? user;
  },

  loginByRole(role: UserRole): DemoUser {
    const user = DEMO_USERS.find((u) => u.role === role);
    if (!user) {
      throw new Error('Nenhum usuário de demonstração configurado para este perfil.');
    }
    return this.loginAsDemoUser(user.id);
  },

  logout(): void {
    storageDriver.removeItem(STORAGE_KEYS.SESSION);
  },
};
