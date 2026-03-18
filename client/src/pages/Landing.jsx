import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";



export default function Landing() {
  const { setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <>
    <Navbar/>

    <div className="relative min-h-screen bg-gradient-to-br from-bgStart to-bgEnd flex items-center justify-center overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl -top-40 -left-40"></div>
      <div className="absolute w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl bottom-0 right-0"></div>

      {/* Main Card */}
      <div className="relative backdrop-blur-2xl bg-glass border border-glassBorder shadow-[0_20px_80px_rgba(0,0,0,0.6)] rounded-3xl p-12 w-[450px] text-textMain">

        <h1 className="text-4xl font-bold text-textMain mb-4 text-center tracking-tight">
          Rental Platform
        </h1>

        <p className="text-textMuted text-center mb-8">
          Premium property management experience
        </p>

        <button onClick={()=>navigate("/products")}  className="w-full bg-primary hover:scale-105 transform transition rounded-xl py-3 font-semibold text-white shadow-lg">
          Get Started
        </button>


      </div>
    </div>
    </>
  );
}