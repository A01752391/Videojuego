export function getSymbol(piece) {
  const symbols = {
    p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  };
  return piece.color === 'w'
    ? symbols[piece.type].toUpperCase()
    : symbols[piece.type];
}

export function coordsToAlgebraic(r, c) {
  return String.fromCharCode(97 + c) + (8 - r);
}

export function getPieceImageClass(piece) {
    return `piece-${piece.color}-${piece.type}`;
}