import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "./assets/imgs/pokeball.svg";
import pokemon from "./assets/imgs/pokemon-23.svg";
import facebook from "./assets/icons/facebook-50.png";
import instagram from "./assets/icons/instagram-50.png";
import tiktok from "./assets/icons/tiktok-50.png";
import youtube from "./assets/icons/youtube-50.png";
import "./App.css";

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-blue-500" : "hover:text-blue-500";

  return (
    <>
      {/* Header & Nav */}
      <header className="nav-color shadow-md relative">
        <nav className="container mx-auto flex justify-between items-center h-20 md:h-24 px-4 md:px-12">
          {/* Logo */}
          <div className="flex items-center h-full">
            <img src={logo} alt="Pokemon Logo" className="w-16" />
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-10 font-semibold text-gray-700 h-full">
            <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
            <li><NavLink to="/pokedex" className={linkClass}>Pokédex</NavLink></li>
            <li><NavLink to="/fight" className={linkClass}>Fight</NavLink></li>
            <li><NavLink to="/fightResults" className={linkClass}>Fight Results</NavLink></li>
            <li><NavLink to="/minigames" className={linkClass}>Mini-games</NavLink></li>
          </ul>

          {/* Mobile Toggle */}
          <button
            className="md:hidden flex items-center justify-center h-full text-gray-700"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 w-full z-50 transition-all duration-300 overflow-hidden ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col items-center gap-4 py-6 text-gray-700 font-semibold bg-nav-color shadow-md">
            <li className="w-full text-center">
              <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={linkClass}>
                Home
              </NavLink>
            </li>
            <li className="w-full text-center">
              <NavLink to="/pokedex" onClick={() => setIsMenuOpen(false)} className={linkClass}>
                Pokédex
              </NavLink>
            </li>
            <li className="w-full text-center">
              <NavLink to="/fight" onClick={() => setIsMenuOpen(false)} className={linkClass}>
                Fight
              </NavLink>
            </li>
            <li className="w-full text-center">
              <NavLink to="/fightResults" onClick={() => setIsMenuOpen(false)} className={linkClass}>
                Fight Results
              </NavLink>
            </li>
            <li className="w-full text-center">
              <NavLink to="/minigames" onClick={() => setIsMenuOpen(false)} className={linkClass}>
                Mini-games
              </NavLink>
            </li>
          </ul>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-8 py-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-center md:justify-between items-center md:items-start gap-10 md:gap-20">
          {/* Footer Logo */}
          <div className="flex justify-center md:justify-start w-full md:w-auto">
            <img src={pokemon} alt="Pokemon Logo" className="w-48 md:w-56" />
          </div>

          {/* Company Info */}
          <div className="flex flex-col gap-2 text-center md:text-left w-full md:w-auto">
            <h4 className="font-bold text-xl md:text-lg">Company</h4>
            <p className="text-gray-300">Kopernikusstraße 16</p>
            <p className="text-gray-300">15430, Berlin</p>
            <p className="text-gray-300">Germany</p>
          </div>

          {/* Contact / Socials */}
          <div className="flex flex-col items-center md:items-start gap-3 w-full md:w-auto">
            <h4 className="font-bold text-xl md:text-lg">Contact Us</h4>
            <div className="flex gap-4 mt-1 justify-center md:justify-start">
              <img src={facebook} alt="Facebook" className="w-8 h-8 hover:scale-110 transition-transform" />
              <img src={instagram} alt="Instagram" className="w-8 h-8 hover:scale-110 transition-transform" />
              <img src={tiktok} alt="TikTok" className="w-8 h-8 hover:scale-110 transition-transform" />
              <img src={youtube} alt="YouTube" className="w-8 h-8 hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Layout;



