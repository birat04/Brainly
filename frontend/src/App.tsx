
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import { Dashboard } from './pages/Dashboard';

function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/signup" element={<SignUp />} />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/dashboard" element={<Dashboard />} />

  </Routes>
  </BrowserRouter>
}

export default App;
