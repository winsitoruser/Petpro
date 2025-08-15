import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SessionProvider } from 'next-auth/react';
import { SocketProvider } from '@/contexts/SocketContext';
import { store } from '@/store';
import MainLayout from '@/layouts/MainLayout';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
            <MainLayout>
              <Component {...pageProps} />
              <ToastContainer position="top-right" autoClose={5000} />
            </MainLayout>
          </SocketProvider>
        </QueryClientProvider>
      </Provider>
    </SessionProvider>
  );
}
