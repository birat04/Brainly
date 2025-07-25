
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { Dashboard } from './pages/Dashboard';

function NotFound() {
  return <div className="flex h-screen items-center justify-center text-2xl">404 - Page Not Found</div>;
}

function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/" element={<Navigate to="/signin" replace />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
  </BrowserRouter>
}

export default App;
