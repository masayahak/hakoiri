import { useState, useRef, useCallback, useEffect } from "react";
import { Piece, DragState } from "@/types";
import {
  BOARD_LAYOUT,
  COLS,
  ROWS,
  THRESHOLD,
  createInitialPieces,
} from "@/lib/constants";

type GameLogicReturn = {
  pieces: Piece[];
  selectedId: number | null;
  elapsed: number;
  isCleared: boolean;
  message: string;
  handlePointerDown: (e: React.PointerEvent, piece: Piece) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  initGame: () => void;
  containerProps: {
    style: { width: number; height: number };
    onPointerUp: () => void;
  };
};

export const useGameLogic = (): GameLogicReturn => {
  const [pieces, setPieces] = useState<Piece[]>(createInitialPieces());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isCleared, setIsCleared] = useState(false);
  const [message, setMessage] = useState("");

  const dragState = useRef<DragState>({ pieceId: null, startX: 0, startY: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    if (isCleared) return;
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer, isCleared]);

  const initGame = () => {
    setPieces(createInitialPieces());
    setElapsed(0);
    setIsCleared(false);
    setMessage("");
    setSelectedId(null);
    startTimer();
  };

  const checkCollision = (
    target: Piece,
    newX: number,
    newY: number,
    allPieces: Piece[]
  ): { allowed: boolean; cleared: boolean; msg?: string } => {
    if (newX < 0 || newX + target.width > COLS)
      return { allowed: false, cleared: false };
    if (newY < 0 || newY + target.height > ROWS)
      return { allowed: false, cleared: false };

    for (let y = 0; y < target.height; y++) {
      for (let x = 0; x < target.width; x++) {
        if (BOARD_LAYOUT[newY + y][newX + x] === 1)
          return { allowed: false, cleared: false };
      }
    }

    let inExit = false;
    for (let y = 0; y < target.height; y++) {
      for (let x = 0; x < target.width; x++) {
        if (BOARD_LAYOUT[newY + y][newX + x] === 9) inExit = true;
      }
    }

    if (inExit) {
      if (target.name === "娘") {
        return { allowed: true, cleared: true };
      } else {
        return {
          allowed: false,
          cleared: false,
          msg: "玄関を出てよいのは娘だけ",
        };
      }
    }

    const collision = allPieces.some((p) => {
      if (p.id === target.id) return false;
      const overlapX = newX < p.x + p.width && newX + target.width > p.x;
      const overlapY = newY < p.y + p.height && newY + target.height > p.y;
      return overlapX && overlapY;
    });

    if (collision) return { allowed: false, cleared: false };

    return { allowed: true, cleared: false };
  };

  const movePiece = (dx: number, dy: number) => {
    if (!selectedId || isCleared) return;

    const target = pieces.find((p) => p.id === selectedId);
    if (!target) return;

    const newX = target.x + dx;
    const newY = target.y + dy;

    const result = checkCollision(target, newX, newY, pieces);

    if (result.msg) setMessage(result.msg);
    else if (!isCleared) setMessage("");

    if (result.allowed) {
      if (result.cleared) {
        setIsCleared(true);
        stopTimer();
        setMessage("🎉クリア🎉");
      }

      setPieces((prevPieces) =>
        prevPieces.map((p) =>
          p.id === target.id ? { ...p, x: newX, y: newY } : p
        )
      );
    }
  };

  const handlePointerDown = (e: React.PointerEvent, piece: Piece) => {
    setSelectedId(piece.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      pieceId: piece.id,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const { pieceId, startX, startY } = dragState.current;
    if (pieceId === null) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    let dx = 0;
    let dy = 0;

    if (Math.abs(currentX - startX) > THRESHOLD) {
      dx = currentX > startX ? 1 : -1;
      dragState.current.startX = currentX;
    }
    if (Math.abs(currentY - startY) > THRESHOLD) {
      dy = currentY > startY ? 1 : -1;
      dragState.current.startY = currentY;
    }

    if (dx !== 0 || dy !== 0) {
      movePiece(dx, dy);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragState.current = { pieceId: null, startX: 0, startY: 0 };
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return {
    pieces,
    selectedId,
    elapsed,
    isCleared,
    message,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    initGame,
    containerProps: {
      style: { width: COLS * 50, height: ROWS * 50 },
      onPointerUp: () => {
        dragState.current.pieceId = null;
      },
    },
  };
};
