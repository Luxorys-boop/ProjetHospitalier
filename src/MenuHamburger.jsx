import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './MenuHamburger.css';

function MenuHamburger() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="hamburger-container">
      {!isOpen && (
        <button className="hamburger-icon" onClick={toggleMenu}>
          ☰
        </button>
      )}
      {isOpen && (
        <div className="menu-sidebar">
          <button className="close-icon" onClick={toggleMenu}>
            X
          </button>
          <ul className="menu-list">
            <li>
              <Link to="/" onClick={toggleMenu}>Accueil</Link>
            </li>
            <li>
              <Link to="/cycles" onClick={toggleMenu}>Cycles</Link>
            </li>
            <li>
              <Link to="/shifts" onClick={toggleMenu}>Shifts</Link>
            </li>
            <li>
              <Link to="/indicateurs" onClick={toggleMenu}>Indicateurs</Link>
            </li>
            <li>
              <Link to="/contraintes" onClick={toggleMenu}>Contraintes</Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default MenuHamburger;