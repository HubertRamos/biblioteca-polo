import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const icon =
          toast.variant === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
          ) : toast.variant === 'error' ? (
            <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
          ) : (
            <Info className="h-4 w-4 text-[#14532D] shrink-0 mt-0.5" />
          );

        const borderTone =
          toast.variant === 'error'
            ? 'border-red-200 bg-white'
            : toast.variant === 'success'
            ? 'border-emerald-200 bg-white'
            : 'border-stone-200 bg-white';

        return (
          <div
            key={toast.id}
            role="status"
            className={`flex items-start gap-3 rounded-lg border p-3.5 shadow-md transition-all ${borderTone}`}
          >
            {icon}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-stone-900">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Fechar notificação"
              className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
