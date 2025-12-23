import { Piece as PieceType } from "@/types";
import { CELL_SIZE } from "@/lib/constants";

type PieceProps = {
  piece: PieceType;
  isSelected: boolean;
  onPointerDown: (e: React.PointerEvent, piece: PieceType) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
};

export const Piece = ({
  piece,
  isSelected,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: PieceProps) => {
  return (
    <div
      onPointerDown={(e) => onPointerDown(e, piece)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={`
        absolute flex items-center justify-center
        border-2 border-white/30 rounded shadow-md
        cursor-grab active:cursor-grabbing touch-none
        transition-all duration-100
        text-white font-bold text-sm
        ${piece.colorClass}
        ${isSelected ? "ring-2 ring-yellow-400 z-10 brightness-110" : "z-0"}
      `}
      style={{
        left: piece.x * CELL_SIZE,
        top: piece.y * CELL_SIZE,
        width: piece.width * CELL_SIZE,
        height: piece.height * CELL_SIZE,
      }}
    >
      {piece.name}
    </div>
  );
};
