"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// ================================================================
//                            駒の定義
// ================================================================
// 駒
type Piece = {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorClass: string;
};

// 駒の初期配置
// prettier-ignore
const createInitialPieces = (): Piece[] => [
{ id: 1, name: '父', x: 2, y: 1, width: 1, height: 2, colorClass: 'bg-blue-600' },
  { id: 2, name: '娘', x: 3, y: 1, width: 2, height: 2, colorClass: 'bg-pink-400' },
  { id: 3, name: '母', x: 5, y: 1, width: 1, height: 2, colorClass: 'bg-red-500' },
  { id: 4, name: '手代', x: 1, y: 3, width: 1, height: 1, colorClass: 'bg-green-600' },
  { id: 5, name: '大番頭', x: 2, y: 3, width: 4, height: 1, colorClass: 'bg-purple-600' },
  { id: 6, name: '兄嫁', x: 6, y: 3, width: 1, height: 1, colorClass: 'bg-yellow-500 text-black' },
  { id: 7, name: '丁稚', x: 1, y: 4, width: 1, height: 1, colorClass: 'bg-gray-400 text-black' },
  { id: 8, name: '女中', x: 2, y: 4, width: 2, height: 1, colorClass: 'bg-orange-400 text-black' },
  { id: 9, name: '番頭', x: 4, y: 4, width: 2, height: 1, colorClass: 'bg-indigo-600' },
  { id: 10, name: '丁稚', x: 6, y: 4, width: 1, height: 1, colorClass: 'bg-gray-400 text-black' },
  { id: 11, name: '番犬', x: 1, y: 5, width: 1, height: 1, colorClass: 'bg-stone-500' },
  { id: 12, name: '祖父', x: 2, y: 5, width: 2, height: 1, colorClass: 'bg-teal-700' },
  { id: 13, name: '祖母', x: 4, y: 5, width: 2, height: 1, colorClass: 'bg-teal-600' },
  { id: 14, name: '丁稚', x: 6, y: 5, width: 1, height: 1, colorClass: 'bg-gray-400 text-black' },
];

// 駒の移動用
type DragState = {
  pieceId: number | null;
  startX: number;
  startY: number;
};

// ================================================================
//                            盤面
// ================================================================
// 盤面用定数
const CELL_SIZE = 50;
const THRESHOLD = CELL_SIZE / 2; // 移動判定の閾値(px)

// 盤面定義 (0=空, 1=壁, 9=出口)
const BOARD_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 9, 9, 1, 1, 1],
];

const ROWS = BOARD_LAYOUT.length;
const COLS = BOARD_LAYOUT[0].length;

// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
//                    メインロジック
// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
export default function ShelteredDaughter() {
  // useState：値が変更されたら画面は再描画
  const [pieces, setPieces] = useState<Piece[]>(createInitialPieces()); //駒の初期配置
  const [selectedId, setSelectedId] = useState<number | null>(null); //選択中の駒
  const [elapsed, setElapsed] = useState(0); // タイマーカウント表示
  const [isCleared, setIsCleared] = useState(false); // ゲームクリア判定
  const [message, setMessage] = useState(""); // メッセージ

  // useRef：値が変更されても画面は再描画したくない
  const dragState = useRef<DragState>({ pieceId: null, startX: 0, startY: 0 }); //ドラッグの開始位置保存
  const timerRef = useRef<NodeJS.Timeout | null>(null); //内部的なタイマー

  // ----------------------------------------------------------------------------------
  // useEffectの実行対象として監視されるので作り直さないようにuseCallbackでキャッシュ化
  // ----------------------------------------------------------------------------------
  // タイマー停止
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // タイマー開始
  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, [stopTimer]);

  // ----------------------------------------------------------------------------------
  // useEffect：コンポーネントの 開始時／終了時 処理の定義
  // ----------------------------------------------------------------------------------
  useEffect(
    () => {
      // ①【開始の合図】
      // コンポーネントが表示されたら、まずこれをやれ！
      if (isCleared) return;
      startTimer();

      // ②【終了の合図】（ここが一番特殊！）
      // コンポーネントが消える時（または再実行の前）に、これをやれ！
      return () => stopTimer();
    },
    // ③【監視リスト】
    // 開始時、終了時に実行する関数が変わったら、もう一度開始処理と終了処理をやり直せ
    [startTimer, stopTimer, isCleared]
  );

  // ----------------------------------------------------------------------------------
  // リセットボタン
  // ----------------------------------------------------------------------------------
  const initGame = () => {
    setPieces(createInitialPieces());
    setElapsed(0);
    setIsCleared(false);
    setMessage("");
    setSelectedId(null);
    startTimer();
  };

  // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  //                    ゲームロジック
  // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■

  // ----------------------------------------------------------------------------------
  // 衝突判定
  // ----------------------------------------------------------------------------------
  const checkCollision = (
    target: Piece,
    newX: number,
    newY: number,
    allPieces: Piece[]
  ): { allowed: boolean; cleared: boolean; msg?: string } => {
    // 1. 盤外チェック
    if (newX < 0 || newX + target.width > COLS)
      return { allowed: false, cleared: false };
    if (newY < 0 || newY + target.height > ROWS)
      return { allowed: false, cleared: false };

    // 2. 壁チェック
    for (let y = 0; y < target.height; y++) {
      for (let x = 0; x < target.width; x++) {
        if (BOARD_LAYOUT[newY + y][newX + x] === 1)
          return { allowed: false, cleared: false };
      }
    }

    // 3. 出口チェック
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

    // 4. 他の駒との衝突チェック
    const collision = allPieces.some((p) => {
      if (p.id === target.id) return false; // 自分自身は除外
      const overlapX = newX < p.x + p.width && newX + target.width > p.x;
      const overlapY = newY < p.y + p.height && newY + target.height > p.y;
      return overlapX && overlapY;
    });

    if (collision) return { allowed: false, cleared: false };

    return { allowed: true, cleared: false };
  };

  // ----------------------------------------------------------------------------------
  // 駒移動処理
  // ----------------------------------------------------------------------------------
  const movePiece = (dx: number, dy: number) => {
    if (!selectedId || isCleared) return;

    // 現在の pieces ステートを使って判定対象を取得
    const target = pieces.find((p) => p.id === selectedId);
    if (!target) return;

    const newX = target.x + dx;
    const newY = target.y + dy;

    // ★重要: setPiecesの外で判定を行う
    // (Reactのイベントハンドラ内なので、最新の pieces を参照できます)
    const result = checkCollision(target, newX, newY, pieces);

    // メッセージ更新
    if (result.msg) setMessage(result.msg);
    else if (!isCleared) setMessage("");

    // 移動可能な場合
    if (result.allowed) {
      // ★クリア判定とタイマー停止をここで行う
      if (result.cleared) {
        setIsCleared(true);
        stopTimer();
        setMessage("🎉クリア🎉");
      }

      // 最後に駒の位置を更新
      setPieces((prevPieces) =>
        prevPieces.map((p) =>
          p.id === target.id ? { ...p, x: newX, y: newY } : p
        )
      );
    }
  };
  // ----------------------------------------------------------------------------------
  //            イベントハンドラ (Pointer Eventsでマウス/タッチ両対応)
  // ----------------------------------------------------------------------------------

  // -------- 駒を選択 --------
  const handlePointerDown = (e: React.PointerEvent, piece: Piece) => {
    // 選択状態の更新
    setSelectedId(piece.id);

    // ドラッグ開始
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      pieceId: piece.id,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  // -------- 駒を移動 --------
  const handlePointerMove = (e: React.PointerEvent) => {
    const { pieceId, startX, startY } = dragState.current;
    if (pieceId === null) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    // 移動判定
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

  // -------- 駒移動を確定 --------
  const handlePointerUp = (e: React.PointerEvent) => {
    dragState.current = { pieceId: null, startX: 0, startY: 0 };
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // ----------------------------------------------------------------------------------
  //            HTML
  // ----------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans select-none">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          箱入り娘(大家族)
        </h1>
        <p className="text-gray-600">「娘だけ」を玄関から出してね！</p>
      </header>

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

      {/* Game Board Container */}
      <div
        className="relative bg-amber-100 rounded-lg shadow-2xl overflow-hidden border-8 border-amber-900 box-content"
        style={{ width: COLS * CELL_SIZE, height: ROWS * CELL_SIZE }}
        // 盤面全体でイベントを受け取る必要はないが、ドラッグ外れ防止のためコンテナにもガードを入れる
        onPointerUp={() => {
          dragState.current.pieceId = null;
        }}
      >
        {/* 背景グリッド (壁と床) */}
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
                  ${cell === 1 ? "bg-amber-900 border border-amber-800" : ""}
                  ${cell === 9 ? "bg-red-100/50" : ""}
                `}
              >
                {cell === 9 && (
                  <span className="text-red-900/50 font-bold">玄関</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* 駒の描画 */}
        {pieces.map((p) => (
          <div
            key={p.id}
            onPointerDown={(e) => handlePointerDown(e, p)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`
              absolute flex items-center justify-center
              border-2 border-white/30 rounded shadow-md
              cursor-grab active:cursor-grabbing touch-none
              transition-all duration-100
              text-white font-bold text-sm
              ${p.colorClass}
              ${
                selectedId === p.id
                  ? "ring-2 ring-yellow-400 z-10 brightness-110"
                  : "z-0"
              }
            `}
            style={{
              left: p.x * CELL_SIZE,
              top: p.y * CELL_SIZE,
              width: p.width * CELL_SIZE,
              height: p.height * CELL_SIZE,
            }}
          >
            {p.name}
          </div>
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

      {/* Footer */}
      <footer className="mt-8 mb-4 text-lg text-center text-gray-800">
        <div className="mb-2">
          <span>Developed by </span>
          <a
            href="https://hakamata-soft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline font-medium"
          >
            HakamataSoft
          </a>
        </div>

        <div className="flex text-xs items-center justify-center gap-2">
          <span className="text-gray-800">Powered by</span>
          {/* Next.js のブランドカラー (黒/白) */}
          <span className="bg-black text-white px-2 py-0.5 rounded font-bold">
            Next.js
          </span>
          <span className="text-gray-800">&</span>
          {/* Tailwind CSS のブランドカラー (シアン) */}
          <span className="bg-cyan-500 text-white px-2 py-0.5 rounded font-bold">Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}
