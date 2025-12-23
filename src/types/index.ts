export type Piece = {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorClass: string;
};

export type DragState = {
  pieceId: number | null;
  startX: number;
  startY: number;
};
