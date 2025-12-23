import { useGameLogic } from "@/hooks/useGameLogic";
import { BOARD_LAYOUT, ROWS, COLS } from "@/lib/constants";
import { Piece } from "./Piece";

export const Board = () => {
  const {
    pieces,
    selectedId,
    elapsed,
    isCleared,
    message,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    initGame,
    containerProps,
  } = useGameLogic();

  return (
    <div className="flex flex-col items-center">
      {/* Status Bar */}
      <div className="flex items-center gap-6 mb-4 bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200">
        {isCleared && (
          <span className="text-xl font-bold text-red-500 animate-bounce">
            🎉クリア🎉
          </span>
        )}
        <span className="font-mono text-lg text-gray-700">
          経過時間: {elapsed} 秒
        </span>
        <button
          onClick={initGame}
          className="px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 active:scale-95 transition-transform"
        >
          リセット
        </button>
      </div>

      {/* Game Board */}
      <div
        className="relative bg-amber-100 rounded-lg shadow-2xl overflow-hidden border-8 border-neutral-500 box-content"
        style={containerProps.style}
        onPointerUp={containerProps.onPointerUp}
      >
        {/* Background Grid */}
        <div
          className="grid w-full h-full absolute top-0 left-0 pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          }}
        >
          {BOARD_LAYOUT.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`
                flex items-center justify-center text-xs text-gray-400
                ${cell === 1 ? "bg-stone-600 border border-stone-600" : ""}
                ${cell === 9 ? "bg-red-100/50" : ""}
              `}
              >
                {cell === 9 && (
                  <span className="text-neutral-800/50 font-bold">玄関</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pieces */}
        {pieces.map((p) => (
          <Piece
            key={p.id}
            piece={p}
            isSelected={selectedId === p.id}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        ))}
      </div>

      {/* Message Area */}
      <div className="h-8 mt-4">
        {message && (
          <div className="text-red-600 font-bold bg-red-50 px-4 py-1 rounded animate-pulse">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
