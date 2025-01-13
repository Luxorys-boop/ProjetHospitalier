import React from 'react';
import MenuHamburger from './MenuHamburger.jsx'; // Import du menu hamburger
import './Layout.css'; // Style global pour le layout

function Layout({ children }) {
  return (
    <div className="layout">
      <MenuHamburger />
      <div className="content">
        {children}
      </div>
    </div>
  );
}

export default Layout;