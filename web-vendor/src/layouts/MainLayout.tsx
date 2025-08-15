import React, { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useRouter } from 'next/router';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const isAuthPage = router.pathname.includes('/auth/');
  
  // For auth pages, use a simplified layout without sidebar
  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header simple />
        <main className="flex-grow">
          {children}
        </main>
        <Footer simple />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex">
        <Sidebar />
        <main className="flex-grow p-6 bg-gray-50">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
