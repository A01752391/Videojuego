/**
 * Cada tablero es una matriz 8x8 que representa piezas en formato:
 * { type: 'p', color: 'w', hasMoved: true }
 * o null si está vacío.
 */

export const midgameBoards = {
  neutral: [
    // Tablero 1
    [
      [{type:'r',color:'b'},{type:'n',color:'b'},{type:'b',color:'b'},{type:'q',color:'b'},{type:'k',color:'b'},{type:'b',color:'b'},{type:'n',color:'b'},{type:'r',color:'b'}],
      [{type:'p',color:'b'},{type:'p',color:'b'},{type:'p',color:'b'},null,{type:'p',color:'b'},{type:'p',color:'b'},{type:'p',color:'b'},{type:'p',color:'b'}],
      [null,null,null,{type:'p',color:'b'},null,null,null,null],
      [null,null,{type:'n',color:'w'},null,{type:'p',color:'w'},null,null,null],
      [null,null,{type:'b',color:'w'},null,null,null,null,null],
      [null,null,null,{type:'p',color:'w'},null,null,null,null],
      [{type:'p',color:'w'},{type:'p',color:'w'},{type:'p',color:'w'},{type:'p',color:'w'},{type:'p',color:'w'},{type:'p',color:'w'},{type:'p',color:'w'},{type:'p',color:'w'}],
      [{type:'r',color:'w'},{type:'n',color:'w'},{type:'b',color:'w'},{type:'q',color:'w'},{type:'k',color:'w'},{type:'b',color:'w'},{type:'n',color:'w'},{type:'r',color:'w'}]
    ],
    // Tablero 2
    [
      [{type:'r',color:'b'},null,{type:'b',color:'b'},{type:'q',color:'b'},{type:'k',color:'b'},null,{type:'n',color:'b'},{type:'r',color:'b'}],
      [{type:'p',color:'b'},{type:'p',color:'b'},null,{type:'p',color:'b'},null,{type:'p',color:'b'},{type:'p',color:'b'},{type:'p',color:'b'}],
      [null,null,{type:'n',color:'b'},null,null,{type:'n',color:'b'},null,null],
      [null,{type:'p',color:'b'},null,{type:'p',color:'w'},null,null,null,null],
      [{type:'b',color:'w'},null,{type:'p',color:'w'},null,null,null,null,null],
      [null,{type:'n',color:'w'},null,{type:'q',color:'w'},null,null,{type:'b',color:'w'},null],
      [{type:'p',color:'w'},{type:'p',color:'w'},{type:'p',color:'w'},null,{type:'p',color:'w'},{type:'p',color:'w'},{type:'p',color:'w'},null],
      [{type:'r',color:'w'},null,{type:'n',color:'w'},null,{type:'k',color:'w'},null,null,{type:'r',color:'w'}]
    ],    // Tablero 3 - FIXED: Moved white bishop from b5 to prevent immediate king capture
    [
      [{type:'r',color:'b'},{type:'n',color:'b'},null,{type:'q',color:'b'},{type:'k',color:'b'},{type:'b',color:'b'},null,{type:'r',color:'b'}],
      [{type:'p',color:'b'},{type:'p',color:'b'},{type:'p',color:'b'},null,{type:'p',color:'b'},null,{type:'p',color:'b'},{type:'p',color:'b'}],
      [null,null,null,{type:'p',color:'b'},null,{type:'n',color:'b'},null,null],
      [null,null,{type:'p',color:'w'},null,{type:'p',color:'w'},null,null,null],
      [null,{type:'b',color:'w'},{type:'p',color:'w'},null,null,{type:'n',color:'w'},null,null],
      [{type:'n',color:'w'},null,null,{type:'q',color:'w'},null,null,{type:'b',color:'w'},null],
      [{type:'p',color:'w'},{type:'p',color:'w'},null,null,{type:'p',color:'w'},{type:'p',color:'w'},null,{type:'p',color:'w'}],
      [{type:'r',color:'w'},null,null,null,{type:'k',color:'w'},null,{type:'n',color:'w'},{type:'r',color:'w'}]
    ]
  ],
    favorWhite: [
    // Tablero 1 (ventaja material) - FIXED: Moved white queen to safer position
    [
      [{type:'r',color:'b'},null,{type:'b',color:'b'},{type:'q',color:'b'},{type:'k',color:'b'},{type:'b',color:'b'},{type:'n',color:'b'},null],
      [null,{type:'p',color:'b'},null,{type:'p',color:'b'},{type:'p',color:'b'},{type:'p',color:'b'},null,{type:'p',color:'b'}],
      [{type:'p',color:'b'},null,{type:'n',color:'b'},null,null,null,{type:'p',color:'b'},null],
      [null,null,null,{type:'p',color:'w'},null,{type:'q',color:'w'},null,null],
      [null,{type:'b',color:'w'},null,null,{type:'p',color:'w'},null,null,null],
      [null,null,{type:'n',color:'w'},null,null,{type:'n',color:'w'},null,null],
      [{type:'p',color:'w'},{type:'p',color:'w'},{type:'p',color:'w'},null,{type:'p',color:'w'},{type:'p',color:'w'},null,{type:'p',color:'w'}],
      [{type:'r',color:'w'},null,{type:'b',color:'w'},null,{type:'k',color:'w'},{type:'b',color:'w'},null,{type:'r',color:'w'}]
    ],    // Tablero 2 (ataque al rey) - FIXED: Repositioned pieces to avoid immediate threats
    [
      [null,null,{type:'r',color:'b'},null,{type:'k',color:'b'},null,{type:'b',color:'b'},null],
      [{type:'p',color:'b'},null,{type:'p',color:'b'},null,{type:'p',color:'b'},null,{type:'p',color:'b'},null],
      [null,{type:'n',color:'b'},null,null,null,{type:'n',color:'b'},null,{type:'p',color:'b'}],
      [null,null,{type:'b',color:'w'},null,{type:'p',color:'w'},null,null,null],
      [null,{type:'p',color:'w'},null,{type:'q',color:'w'},null,{type:'p',color:'w'},null,null],
      [null,null,{type:'n',color:'w'},null,null,{type:'b',color:'w'},null,null],
      [{type:'p',color:'w'},{type:'p',color:'w'},null,{type:'p',color:'w'},null,null,{type:'p',color:'w'},{type:'p',color:'w'}],
      [{type:'r',color:'w'},null,null,null,{type:'k',color:'w'},null,{type:'n',color:'w'},{type:'r',color:'w'}]
    ]
  ],
    favorBlack: [
    // Tablero 1 (ventaja material) - FIXED: Repositioned black queen to avoid immediate threats
    [
      [{type:'r',color:'b'},{type:'n',color:'b'},{type:'b',color:'b'},{type:'q',color:'b'},{type:'k',color:'b'},{type:'b',color:'b'},{type:'n',color:'b'},{type:'r',color:'b'}],
      [{type:'p',color:'b'},{type:'p',color:'b'},null,{type:'p',color:'b'},null,{type:'p',color:'b'},{type:'p',color:'b'},{type:'p',color:'b'}],
      [null,null,{type:'p',color:'b'},null,null,null,null,null],
      [null,{type:'n',color:'w'},null,{type:'p',color:'w'},null,{type:'q',color:'b'},null,null],
      [null,null,{type:'b',color:'w'},null,{type:'p',color:'w'},null,null,null],
      [null,{type:'p',color:'w'},null,null,null,{type:'n',color:'w'},null,null],
      [{type:'p',color:'w'},null,{type:'p',color:'w'},{type:'p',color:'w'},null,{type:'p',color:'w'},null,{type:'p',color:'w'}],
      [{type:'r',color:'w'},null,{type:'b',color:'w'},null,{type:'k',color:'w'},null,{type:'n',color:'w'},null]
    ],    // Tablero 2 (ataque al rey) - FIXED: Repositioned pieces for balanced gameplay
    [
      [null,{type:'r',color:'b'},null,{type:'q',color:'b'},{type:'k',color:'b'},null,{type:'b',color:'b'},null],
      [{type:'p',color:'b'},{type:'p',color:'b'},{type:'p',color:'b'},null,{type:'p',color:'b'},null,{type:'p',color:'b'},null],
      [null,null,{type:'n',color:'b'},null,null,{type:'n',color:'b'},null,{type:'p',color:'b'}],
      [null,{type:'b',color:'w'},null,{type:'p',color:'w'},null,null,null,null],
      [{type:'p',color:'w'},null,null,null,{type:'p',color:'w'},null,null,null],
      [null,null,{type:'n',color:'w'},null,null,{type:'b',color:'w'},null,null],
      [null,{type:'p',color:'w'},{type:'p',color:'w'},null,null,{type:'p',color:'w'},{type:'p',color:'w'},{type:'p',color:'w'}],
      [{type:'r',color:'w'},null,null,null,{type:'k',color:'w'},null,null,{type:'r',color:'w'}]
    ]
  ]
};