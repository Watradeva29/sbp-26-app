import { Routes, Route } from "react-router-dom";
import Invite from "./Invite";
import RegisterForm from "./RegistrationForm";
import Payment from "./Payment"; // make sure this exists
import Countdown from "./Countdown";
import AdminLogin from "./AdminLogin";
import Admin from "./Admin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Invite />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/countdown" element={<Countdown />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;