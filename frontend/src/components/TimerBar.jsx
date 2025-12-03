export default function TimerBar({ percent }) {
  return (
    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
      <div
        className="h-2 bg-green-400 transition-all"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}
