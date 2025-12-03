export default function Card({ children }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 
    shadow-2xl rounded-2xl p-6 text-white max-w-xl mx-auto">
      {children}
    </div>
  );
}
