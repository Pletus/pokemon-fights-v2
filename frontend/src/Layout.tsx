// Layout.tsx
import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "./assets/imgs/pokemon-23.svg";
import facebook from "./assets/icons/facebook-50.png";
import instagram from "./assets/icons/instagram-50.png";
import tiktok from "./assets/icons/tiktok-50.png";
import youtube from "./assets/icons/youtube-50.png";
import "./App.css";

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className="nav-color shadow-md sticky top-0 z-50">
        <nav className="container mx-auto flex items-center justify-between p-4 md:p-6">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="Pokemon Logo" className="w-32" />
          </div>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8 font-semibold text-gray-700">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "text-blue-500" : "hover:text-blue-500"
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pokedex"
                className={({ isActive }) =>
                  isActive ? "text-blue-500" : "hover:text-blue-500"
                }
              >
                Pokédex
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/fight"
                className={({ isActive }) =>
                  isActive ? "text-blue-500" : "hover:text-blue-500"
                }
              >
                Fight
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/FightResults"
                className={({ isActive }) =>
                  isActive ? "text-blue-500" : "hover:text-blue-500"
                }
              >
                Fight Results
              </NavLink>
            </li>
          </ul>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <ul
          className={`md:hidden nav-color shadow-md flex flex-col gap-4 p-6 text-gray-700 font-semibold transition-all duration-300 ${
            isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <li>
            <NavLink
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "hover:text-blue-500"
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/pokedex"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "hover:text-blue-500"
              }
            >
              Pokédex
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/fight"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "hover:text-blue-500"
              }
            >
              Fight
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/FightResults"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "hover:text-blue-500"
              }
            >
              Fight Results
            </NavLink>
          </li>
        </ul>
      </header>

      <main className="container mx-auto">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <img src={logo} alt="Pokemon Logo" className="w-48" />

          <div className="flex flex-col gap-1 md:items-start text-center md:text-left">
            <h4 className="font-bold text-lg">Company</h4>
            <p>Kopernikusstraße 16</p>
            <p>15430, Berlin</p>
            <p>Germany</p>
          </div>

          <div className="flex flex-col gap-2 items-center">
            <h4 className="font-bold text-lg">Contact Us</h4>
            <div className="flex gap-4 mt-2">
              <img src={facebook} alt="Facebook" className="w-8 h-8" />
              <img src={instagram} alt="Instagram" className="w-8 h-8" />
              <img src={tiktok} alt="TikTok" className="w-8 h-8" />
              <img src={youtube} alt="YouTube" className="w-8 h-8" />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Layout;
