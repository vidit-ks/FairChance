import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid #2d2d2d' }
      }} />
      <AppRoutes />
    </>
  );
}

export default App;