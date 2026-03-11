import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "./Navbar.css";

export default function Navbar() {
  const { setTheme } = useContext(ThemeContext);

  return (
    <nav className="nav">
      <div className="navInner">

        {/* Logo */}
        <div className="logo">
          RentalHub
        </div>

        {/* Search */}
        <div className="searchWrap">
          <input
            type="text"
            placeholder="Search cameras, drones, tools..."
            className="searchInput"
          />
        </div>

        {/* Right Actions */}
        <div className="navActions">
          <button onClick={() => setTheme("default")}>Light</button>
          <button onClick={() => setTheme("corporate")}>Dark</button>
        </div>

      </div>
    </nav>
  );
}