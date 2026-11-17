import { getNowISO } from '../lib/formatters';
import { repositories } from '../repositories';
import { LibrarySettings } from '../types/library';
import { seedService } from './seedService';

export const settingsService = {
  getSettings(): LibrarySettings {
    return repositories.settings.get();
  },

  updateSettings(input: {
    defaultLoanDays: number;
    schoolName: string;
  }): LibrarySettings {
    const days = Math.round(Number(input.defaultLoanDays));
    if (!Number.isFinite(days) || days < 1 || days > 60) {
      throw new Error('O prazo padrão de empréstimo deve estar entre 1 e 60 dias.');
    }

    const schoolName = input.schoolName.trim();
    if (!schoolName) {
      throw new Error('O nome da instituição é obrigatório.');
    }

    const updated: LibrarySettings = {
      defaultLoanDays: days,
      schoolName,
      updatedAt: getNowISO(),
    };

    return repositories.settings.save(updated);
  },

  restoreDemoData(): void {
    seedService.resetDemoData();
  },
};
