
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Background refetch settings
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      
      // Retry settings
      retry: (failureCount, error:any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Cache settings
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      // Retry settings for mutations
      retry: (failureCount, error:any) => {
        // Don't retry mutations on client errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry only once for server errors
        return failureCount < 1;
      },
    },
  },
});

// Custom error handler for global error logging
queryClient.setMutationDefaults(['form-create'], {
  onError: (error) => {
    console.error('Global mutation error:', error);
  },
});

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools in development */}
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position={"bottom-right" as any}
          buttonPosition="bottom-right"
        />
    </QueryClientProvider>
  );
};

export default QueryProvider;

// Export queryClient for use in other parts of the app if needed
export { queryClient };