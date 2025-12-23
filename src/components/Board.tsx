import { Piece as PieceType } from "@/types";
import { BOARD_LAYOUT, ROWS, COLS } from "@/lib/constants";
import { Piece } from "./Piece";

type BoardProps = {
  pieces: PieceType[];
  selectedId: number | null;
  containerProps: {
    style: { width: number; height: number };
    onPointerUp: () => void;
  };
  handlePointerDown: (e: React.PointerEvent, piece: PieceType) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
};

export const Board = ({
  pieces,
  selectedId,
  containerProps,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
}: BoardProps) => {
  return (
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
  );
};
