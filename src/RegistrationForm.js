import { useState } from "react";
import "./RegistrationForm.css";
import { useNavigate } from "react-router-dom";
function RegisterForm() {

  const [formData, setFormData] = useState({
    name: "",
    batch: "",
    email: ""
  });

  const [specialID, setSpecialID] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.name || !formData.batch || !formData.email) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const API = "http://localhost:3000";
      const response = await fetch(`${API}/register`, {
      
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success === false) {
        setMessage(data.message);
        setLoading(false);
        return;
      }

      setSpecialID(data.id);
      localStorage.setItem("userID", data.id);

      setMessage("Registered succesfully")

      setTimeout(() => {
        navigate("/payment")
      }, 1500);

      setFormData({
        name: "",
        batch: "",
        email: ""
      });

      setLoading(false);

    } catch (error) {
      console.error(error);
      setMessage("Error submitting form");
      setLoading(false);
    }
  };

  return (
  <div className="container">
    <div className="card">
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
        />

        <input
          name="batch"
          value={formData.batch}
          onChange={handleChange}
          placeholder="Batch"
        />

        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Register"}
        </button>
      </form>

      {message && <p className="registerNote">{message}</p>}
      {specialID && <div className="registerId">Your ID: {specialID}</div>}
    </div>
  </div>
);
}

export default RegisterForm;