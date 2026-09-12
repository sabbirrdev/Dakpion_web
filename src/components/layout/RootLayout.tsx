import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ToastStack } from '../shared/ToastStack';

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <ToastStack />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
