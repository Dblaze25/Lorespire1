import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 sm:py-6 overflow-y-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
