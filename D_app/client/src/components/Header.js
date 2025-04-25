import React from 'react';

function Header({ account }) {
  return (
    <nav className="navbar navbar-dark bg-dark">
      <div className="container">
        <span className="navbar-brand">Hotel Booking DApp</span>
        <span className="text-white">{account}</span>
      </div>
    </nav>
  );
}

export default Header;