import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  title: string;
  author: string;
  publisher?: string;
  category?: string;
  coverUrl?: string;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PALETTE_BY_CATEGORY: Record<string, { bg: string; border: string; ink: string }> = {
  'Literatura Brasileira': { bg: '#F2EFE9', border: '#D6CEBE', ink: '#14532D' },
  'Literatura Estrangeira': { bg: '#ECEFF4', border: '#CBD5E1', ink: '#1E293B' },
  'Ciências & Biologia': { bg: '#ECF3F1', border: '#C7DBD5', ink: '#115E59' },
  'Matemática & Lógica': { bg: '#F5EFEA', border: '#DFCBBF', ink: '#9A3412' },
  'História & Humanidades': { bg: '#EEF0F4', border: '#CDD4DF', ink: '#1E3A8A' },
  'Tecnologia & Programação': { bg: '#EDF0F5', border: '#CBD2DF', ink: '#0F172A' },
  'Filosofia & Sociologia': { bg: '#F4F1EA', border: '#D9D0BF', ink: '#78350F' },
};

export function BookCover({
  title,
  author,
  publisher,
  category,
  coverUrl,
  accentColor,
  size = 'md',
}: BookCoverProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const palette = (category && PALETTE_BY_CATEGORY[category]) || {
    bg: '#F2EFE9',
    border: '#D6CEBE',
    ink: accentColor || '#1C1917',
  };

  const sizeClasses =
    size === 'sm'
      ? 'w-12 h-16 rounded'
      : size === 'lg'
      ? 'w-full aspect-[3/4] max-w-[260px] rounded-md'
      : 'w-full aspect-[3/4] rounded-md';

  if (coverUrl && !imgFailed) {
    return (
      <div
        className={`${sizeClasses} relative overflow-hidden border border-stone-200 bg-stone-100 shrink-0`}
      >
        <img
          src={coverUrl}
          alt={`Capa do livro ${title}`}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div
        style={{ backgroundColor: palette.bg, borderColor: palette.border }}
        className={`${sizeClasses} flex items-center justify-center border shrink-0`}
      >
        <BookOpen className="h-4 w-4" style={{ color: palette.ink }} />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: palette.bg,
        borderColor: palette.border,
      }}
      className={`${sizeClasses} relative flex flex-col justify-between border p-5 select-none overflow-hidden`}
    >
      {/* Linha sutil de lombada editorial */}
      <div
        className="absolute inset-y-0 left-2.5 w-px opacity-30"
        style={{ backgroundColor: palette.ink }}
      />

      <div className="pl-2">
        <p
          className="text-[11px] font-medium tracking-wider uppercase truncate opacity-75"
          style={{ color: palette.ink }}
        >
          {category || 'Acervo Escolar'}
        </p>
      </div>

      <div className="pl-2 my-auto py-3">
        <h4
          className={`font-serif font-semibold leading-snug line-clamp-4 ${
            size === 'lg' ? 'text-xl' : 'text-base'
          }`}
          style={{ color: '#1C1917' }}
        >
          {title}
        </h4>
        <div
          className="mt-2.5 h-px w-8 opacity-40"
          style={{ backgroundColor: palette.ink }}
        />
        <p className="mt-2 text-xs text-stone-600 line-clamp-2">{author}</p>
      </div>

      <div className="pl-2 flex items-center justify-between text-[11px] text-stone-500">
        <span className="truncate">{publisher || 'Edição Escolar'}</span>
      </div>
    </div>
  );
}
