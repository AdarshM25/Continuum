export default function Header({ onLogout }) {
  return (
    <div className="header">
      <h1>CONTINUUM</h1>
      {onLogout && (
        <button className="btn" onClick={onLogout}>
          Log out
        </button>
      )}
    </div>
  );
}