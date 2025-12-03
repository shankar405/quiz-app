export default function Button({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl text-white font-semibold 
      bg-gradient-to-r from-indigo-500 to-purple-600 
      hover:opacity-90 disabled:opacity-50 transition`}
    >
      {children}
    </button>
  );
}
