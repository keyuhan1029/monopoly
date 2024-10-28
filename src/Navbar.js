import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h1>Monopoly</h1>
      </div>
      <div className="nav-item links">
        <Link to="/">Home</Link>
        <Link to="/MonopolyGame/">MonopolyGame</Link>
        <Link to="/GameRoom/">GameRoom</Link>
      </div>
    </nav>
  );
}

export default Navbar;