import { storageDriver } from '../lib/storage';
import {
  IActivityRepository,
  IBookRepository,
  ICopyRepository,
  ILoanRepository,
  IReaderRepository,
  ISettingsRepository,
} from './interfaces';
import {
  LocalActivityRepository,
  LocalBookRepository,
  LocalCopyRepository,
  LocalLoanRepository,
  LocalReaderRepository,
  LocalSettingsRepository,
} from './localRepositories';

export interface RepositoryRegistry {
  books: IBookRepository;
  copies: ICopyRepository;
  readers: IReaderRepository;
  loans: ILoanRepository;
  activities: IActivityRepository;
  settings: ISettingsRepository;
}

/**
 * Ponto único de injeção dos repositórios.
 * Na migração para Supabase, basta instanciar aqui os adaptadores Supabase
 * mantendo os mesmos serviços e componentes intactos.
 */
export const repositories: RepositoryRegistry = {
  books: new LocalBookRepository(storageDriver),
  copies: new LocalCopyRepository(storageDriver),
  readers: new LocalReaderRepository(storageDriver),
  loans: new LocalLoanRepository(storageDriver),
  activities: new LocalActivityRepository(storageDriver),
  settings: new LocalSettingsRepository(storageDriver),
};
