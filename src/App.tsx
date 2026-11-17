import { useEffect, useState } from 'react';
import { AppLayout, AppRoute } from './components/AppLayout';
import { ToastContainer } from './components/ToastContainer';
import { LibraryProvider, useLibrary } from './hooks/useLibraryContext';
import { ToastProvider } from './hooks/useToast';
import { AdminBooksPage } from './pages/AdminBooksPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoansPage } from './pages/AdminLoansPage';
import { AdminReadersPage } from './pages/AdminReadersPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { CatalogPage } from './pages/CatalogPage';
import { LoginPage } from './pages/LoginPage';
import { MyLoansPage } from './pages/MyLoansPage';
import { DemoUser } from './types/library';

function AppRouter() {
  const { currentUser } = useLibrary();
  const [browsingPublicCatalog, setBrowsingPublicCatalog] = useState(false);
  const [route, setRoute] = useState<AppRoute>(() =>
    currentUser?.role === 'admin' ? 'admin_dashboard' : 'catalog'
  );

  // Sincroniza rota padrão quando o usuário restaura ou troca de perfil
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') {
      if (route === 'my_loans') setRoute('admin_dashboard');
    } else {
      if (route.startsWith('admin_')) setRoute('catalog');
    }
  }, [currentUser, route]);

  const handleLoggedIn = (user: DemoUser) => {
    setBrowsingPublicCatalog(false);
    setRoute(user.role === 'admin' ? 'admin_dashboard' : 'catalog');
  };

  if (!currentUser && !browsingPublicCatalog) {
    return (
      <LoginPage
        onLoggedIn={handleLoggedIn}
        onBrowsePublicCatalog={() => {
          setBrowsingPublicCatalog(true);
          setRoute('catalog');
        }}
      />
    );
  }

  const renderPage = () => {
    if (currentUser?.role === 'admin') {
      switch (route) {
        case 'admin_dashboard':
          return <AdminDashboardPage onNavigate={setRoute} />;
        case 'admin_loans':
          return <AdminLoansPage />;
        case 'admin_books':
          return <AdminBooksPage />;
        case 'admin_readers':
          return <AdminReadersPage />;
        case 'admin_settings':
          return <AdminSettingsPage />;
        case 'catalog':
          return <CatalogPage />;
        default:
          return <AdminDashboardPage onNavigate={setRoute} />;
      }
    }

    if (currentUser && route === 'my_loans') {
      return <MyLoansPage onGoToCatalog={() => setRoute('catalog')} />;
    }

    return <CatalogPage />;
  };

  return (
    <AppLayout
      activeRoute={route}
      onNavigate={setRoute}
      onExitToLogin={() => {
        setBrowsingPublicCatalog(false);
      }}
    >
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LibraryProvider>
        <AppRouter />
        <ToastContainer />
      </LibraryProvider>
    </ToastProvider>
  );
}
