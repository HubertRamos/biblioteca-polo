import {
  ArrowLeftRight,
  BookMarked,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useLibrary } from '../hooks/useLibraryContext';
import { USER_ROLE_LABELS } from '../lib/formatters';

export type AppRoute =
  | 'catalog'
  | 'my_loans'
  | 'admin_dashboard'
  | 'admin_loans'
  | 'admin_books'
  | 'admin_readers'
  | 'admin_settings';

interface AppLayoutProps {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onExitToLogin: () => void;
  children: React.ReactNode;
}

export function AppLayout({
  activeRoute,
  onNavigate,
  onExitToLogin,
  children,
}: AppLayoutProps) {
  const { currentUser, logout, stats, settings } = useLibrary();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const handleLogout = () => {
    logout();
    onExitToLogin();
  };

  if (isAdmin) {
    const adminNav: {
      id: AppRoute;
      label: string;
      icon: typeof LayoutDashboard;
      badge?: number;
    }[] = [
      { id: 'admin_dashboard', label: 'Painel geral', icon: LayoutDashboard },
      {
        id: 'admin_loans',
        label: 'Empréstimos',
        icon: ArrowLeftRight,
        badge: stats.pendingRequests > 0 ? stats.pendingRequests : undefined,
      },
      { id: 'admin_books', label: 'Livros e exemplares', icon: BookMarked },
      { id: 'admin_readers', label: 'Leitores', icon: Users },
      { id: 'catalog', label: 'Catálogo público', icon: BookOpen },
      { id: 'admin_settings', label: 'Configurações', icon: Settings },
    ];

    const activeLabel =
      adminNav.find((item) => item.id === activeRoute)?.label ?? 'Painel';

    const SidebarContent = (
      <div className="flex h-full flex-col justify-between bg-white border-r border-stone-200">
        <div>
          <div className="border-b border-stone-200 px-5 py-5">
            <p className="font-serif text-base font-semibold tracking-tight text-stone-900">
              Biblioteca Escolar
            </p>
            <p className="mt-0.5 text-xs text-stone-500 truncate">
              {settings.schoolName}
            </p>
          </div>

          <nav className="space-y-1 p-3" aria-label="Navegação administrativa">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#14532D]/10 text-[#14532D]'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className="font-mono text-xs font-semibold tabular-nums text-[#B45309]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-stone-200 p-4">
          <div className="mb-3">
            <p className="text-xs font-semibold text-stone-900 truncate">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-stone-500 truncate">
              {USER_ROLE_LABELS[currentUser.role]}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Trocar perfil / Sair</span>
          </button>
        </div>
      </div>
    );

    return (
      <div className="flex min-h-screen bg-[#F8F7F4]">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-0 h-screen">{SidebarContent}</div>
        </aside>

        {/* Drawer Mobile */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 flex lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="fixed inset-0 bg-stone-900/40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-64 max-w-[80vw] h-full">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu"
                className="absolute right-3 top-4 rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
              {SidebarContent}
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-stone-200 bg-white/95 px-4 py-3.5 backdrop-blur-sm sm:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir navegação"
                className="rounded-lg border border-stone-200 p-2 text-stone-700 hover:bg-stone-50 lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 text-sm min-w-0">
                <span className="hidden sm:inline text-stone-400">
                  Administração
                </span>
                <span className="hidden sm:inline text-stone-300">/</span>
                <h1 className="font-sans text-sm font-semibold text-stone-900 truncate">
                  {activeLabel}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('admin_loans')}
                className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0"
              >
                Fila de empréstimos ({stats.pendingRequests + stats.approvedWaitingPickup})
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Layout para Aluno, Professor ou Visitante no Catálogo Público
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F7F4]">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="font-serif text-lg font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0"
          >
            Biblioteca Escolar Digital
          </button>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeRoute === 'catalog'
                  ? 'text-[#14532D] underline underline-offset-8 decoration-2'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Catálogo
            </button>
            {currentUser && (
              <button
                type="button"
                onClick={() => onNavigate('my_loans')}
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  activeRoute === 'my_loans'
                    ? 'text-[#14532D] underline underline-offset-8 decoration-2'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Meus Empréstimos
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0"
              >
                <span className="hidden sm:inline max-w-[140px] truncate">
                  {currentUser.name}
                </span>
                <LogOut className="h-3.5 w-3.5 text-stone-500" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onExitToLogin}
                className="rounded-lg bg-[#14532D] px-4 py-2 text-xs font-medium text-white hover:bg-[#114224] transition-colors whitespace-nowrap shrink-0"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-stone-200 bg-white py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 text-xs text-stone-500 sm:flex-row sm:items-center sm:px-8">
          <span>{settings.schoolName} · Acervo Escolar</span>
          <span>
            Prazo padrão de empréstimo: {settings.defaultLoanDays} dias corridos
          </span>
        </div>
      </footer>
    </div>
  );
}
