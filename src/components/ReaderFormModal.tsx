import { useEffect, useState } from 'react';
import { useLibrary } from '../hooks/useLibraryContext';
import { Reader, ReaderStatus, ReaderType } from '../types/library';
import { Modal } from './Modal';

interface ReaderFormModalProps {
  open: boolean;
  editingReader: Reader | null;
  onClose: () => void;
}

export function ReaderFormModal({
  open,
  editingReader,
  onClose,
}: ReaderFormModalProps) {
  const { createReader, updateReader } = useLibrary();

  const [fullName, setFullName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<ReaderType>('student');
  const [departmentOrClass, setDepartmentOrClass] = useState('');
  const [status, setStatus] = useState<ReaderStatus>('active');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
    if (editingReader) {
      setFullName(editingReader.fullName);
      setRegistrationNumber(editingReader.registrationNumber);
      setEmail(editingReader.email);
      setType(editingReader.type);
      setDepartmentOrClass(editingReader.departmentOrClass ?? '');
      setStatus(editingReader.status);
    } else {
      setFullName('');
      setRegistrationNumber('');
      setEmail('');
      setType('student');
      setDepartmentOrClass('');
      setStatus('active');
    }
  }, [open, editingReader]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editingReader) {
        updateReader(editingReader.id, {
          fullName,
          registrationNumber,
          email,
          type,
          departmentOrClass,
          status,
        });
      } else {
        createReader({
          fullName,
          registrationNumber,
          email,
          type,
          departmentOrClass,
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Não foi possível salvar o leitor.'
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingReader ? 'Editar Cadastro de Leitor' : 'Novo Leitor'}
      subtitle="Cadastre alunos ou professores habilitados a solicitar empréstimos."
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-stone-700">
            Nome completo *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ex.: Mariana Soares Alves"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-stone-700">
              Tipo de leitor *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ReaderType)}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
            >
              <option value="student">Aluno</option>
              <option value="teacher">Professor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700">
              Matrícula *
            </label>
            <input
              type="text"
              required
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder={type === 'student' ? 'ALU-2026120' : 'PROF-1150'}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 font-mono text-xs text-stone-900 focus:border-[#14532D] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700">
            E-mail institucional *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@escola.edu.br"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={editingReader ? '' : 'sm:col-span-2'}>
            <label className="block text-xs font-medium text-stone-700">
              {type === 'student'
                ? 'Turma / Série (opcional)'
                : 'Departamento / Área (opcional)'}
            </label>
            <input
              type="text"
              value={departmentOrClass}
              onChange={(e) => setDepartmentOrClass(e.target.value)}
              placeholder={
                type === 'student'
                  ? 'Ex.: 2º Ano A — Ensino Médio'
                  : 'Ex.: Ciências Humanas'
              }
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
            />
          </div>

          {editingReader && (
            <div>
              <label className="block text-xs font-medium text-stone-700">
                Status do cadastro
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReaderStatus)}
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Desativado</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#114224]"
          >
            {editingReader ? 'Salvar alterações' : 'Cadastrar leitor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
