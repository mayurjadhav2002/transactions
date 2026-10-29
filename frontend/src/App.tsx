import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { FinanceProvider } from "./context/FinanceContext";
import { AppRouters } from "./components/common/Routers";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FinanceProvider>
        <AppRouters />
      </FinanceProvider>
    </QueryClientProvider>
  );
}

export default App;
