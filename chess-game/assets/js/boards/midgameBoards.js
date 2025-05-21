/**
 * Cada tablero es una matriz 8x8 que representa piezas en formato:
 * { type: 'p', color: 'w', hasMoved: true }
 * o null si está vacío.
 */

export const midgameBoards = {
  neutral: [
    // Tablero 1
    [
      [{type:'r',color:'b',hasMoved:true},null,{type:'b',color:'b',hasMoved:true},{type:'q',color:'b',hasMoved:true},{type:'k',color:'b',hasMoved:true},{type:'b',color:'b',hasMoved:true},null,{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,null,{type:'p',color:'b',hasMoved:true},null,null,null,null],
      [null,null,{type:'n',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,null,{type:'b',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,{type:'p',color:'w',hasMoved:true},null,null,null,null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,{type:'b',color:'w',hasMoved:true},null,{type:'k',color:'w',hasMoved:true},{type:'b',color:'w',hasMoved:true},null,{type:'r',color:'w',hasMoved:true}]
    ],
    // Tablero 2
    [
      [{type:'r',color:'b',hasMoved:true},null,{type:'n',color:'b',hasMoved:true},{type:'q',color:'b',hasMoved:true},{type:'k',color:'b',hasMoved:true},{type:'b',color:'b',hasMoved:true},null,{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,{type:'b',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,null,null,null],
      [null,null,null,{type:'n',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,null],
      [null,null,{type:'b',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,null,null,{type:'q',color:'w',hasMoved:true},null,null,{type:'n',color:'w',hasMoved:true},null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,{type:'k',color:'w',hasMoved:true},{type:'b',color:'w',hasMoved:true},null,{type:'r',color:'w',hasMoved:true}]
    ],
    // Tablero 3
    [
      [{type:'r',color:'b',hasMoved:true},null,{type:'b',color:'b',hasMoved:true},{type:'q',color:'b',hasMoved:true},null,{type:'b',color:'b',hasMoved:true},null,{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,null,{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,{type:'n',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,null,null,null],
      [null,{type:'b',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,null,null,null],
      [null,null,{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,null,null,{type:'q',color:'w',hasMoved:true},null,null,{type:'n',color:'w',hasMoved:true},null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,null,null,{type:'k',color:'w',hasMoved:true},{type:'b',color:'w',hasMoved:true},null,{type:'r',color:'w',hasMoved:true}]
    ],
    // Tablero 4
    [
      [{type:'r',color:'b',hasMoved:true},{type:'n',color:'b',hasMoved:true},null,{type:'q',color:'b',hasMoved:true},{type:'k',color:'b',hasMoved:true},null,{type:'n',color:'b',hasMoved:true},{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null],
      [null,{type:'b',color:'b',hasMoved:true},null,null,{type:'b',color:'b',hasMoved:true},null,null,null],
      [null,null,null,{type:'p',color:'w',hasMoved:true},null,null,{type:'n',color:'w',hasMoved:true},null],
      [null,null,{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,{type:'n',color:'w',hasMoved:true},null,{type:'b',color:'w',hasMoved:true},null,{type:'q',color:'w',hasMoved:true},null,null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,{type:'b',color:'w',hasMoved:true},null,{type:'k',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},{type:'r',color:'w',hasMoved:true}]
    ],
    // Tablero 5
    [
      [{type:'r',color:'b',hasMoved:true},{type:'n',color:'b',hasMoved:true},null,null,{type:'k',color:'b',hasMoved:true},null,{type:'b',color:'b',hasMoved:true},{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},null,null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,{type:'b',color:'b',hasMoved:true},null,null,{type:'n',color:'b',hasMoved:true},null,null],
      [null,null,{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,{type:'b',color:'w',hasMoved:true},null,null,null,{type:'n',color:'w',hasMoved:true},null,null],
      [null,null,null,{type:'q',color:'w',hasMoved:true},null,null,null,null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,{type:'k',color:'w',hasMoved:true},null,null,{type:'r',color:'w',hasMoved:true}]
    ],
  ],
  favorWhite: [
    // Tablero 1
    [
      [{type:'r',color:'b',hasMoved:true},null,null,{type:'q',color:'b',hasMoved:true},null,{type:'b',color:'b',hasMoved:true},{type:'n',color:'b',hasMoved:true},{type:'r',color:'b',hasMoved:true}],
      [null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,null,{type:'p',color:'b',hasMoved:true},null],
      [null,null,null,null,null,{type:'n',color:'b',hasMoved:true},null,null],
      [{type:'b',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},null,null,null,null],
      [null,{type:'p',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,{type:'n',color:'w',hasMoved:true},null,{type:'b',color:'w',hasMoved:true},null,{type:'q',color:'w',hasMoved:true},null,null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,{type:'k',color:'w',hasMoved:true},null,{type:'b',color:'w',hasMoved:true},{type:'r',color:'w',hasMoved:true}]
    ],
    // Tablero 2
    [
      [{type:'r',color:'b',hasMoved:true},{type:'n',color:'b',hasMoved:true},null,null,{type:'k',color:'b',hasMoved:true},null,null,{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,{type:'b',color:'b',hasMoved:true},null,null,{type:'n',color:'b',hasMoved:true},null,null],
      [null,{type:'b',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,null,{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [{type:'n',color:'w',hasMoved:true},null,null,{type:'q',color:'w',hasMoved:true},null,null,{type:'b',color:'w',hasMoved:true},null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,null,null,{type:'k',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},{type:'r',color:'w',hasMoved:true}]
    ]
    // Tablero 3
    [
      [{type:'r',color:'b',hasMoved:true},null,{type:'n',color:'b',hasMoved:true},null,{type:'k',color:'b',hasMoved:true},{type:'b',color:'b',hasMoved:true},null,{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,{type:'b',color:'b',hasMoved:true},null,null,{type:'n',color:'b',hasMoved:true},null,null],
      [null,null,null,{type:'p',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,null],
      [{type:'b',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [{type:'q',color:'w',hasMoved:true},null,null,{type:'b',color:'w',hasMoved:true},null,null,{type:'n',color:'w',hasMoved:true},null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null],
      [{type:'r',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,{type:'k',color:'w',hasMoved:true},null,null,{type:'r',color:'w',hasMoved:true}]
    ],
    // Tablero 4
    [
      [{type:'r',color:'b',hasMoved:true},{type:'n',color:'b',hasMoved:true},{type:'b',color:'b',hasMoved:true},null,{type:'k',color:'b',hasMoved:true},null,null,{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true}],
      [null,null,null,null,null,null,{type:'n',color:'b',hasMoved:true},null],
      [null,null,{type:'b',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,null,null,null],
      [null,null,null,{type:'p',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,null],
      [{type:'n',color:'w',hasMoved:true},null,null,{type:'q',color:'w',hasMoved:true},null,null,{type:'b',color:'w',hasMoved:true},null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,null,null,{type:'k',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},{type:'r',color:'w',hasMoved:true}]
    ],
    // Tablero 5
    [
      [{type:'r',color:'b',hasMoved:true},null,null,{type:'q',color:'b',hasMoved:true},null,{type:'b',color:'b',hasMoved:true},null,{type:'r',color:'b',hasMoved:true}],
      [null,{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,{type:'n',color:'b',hasMoved:true},null,null,{type:'n',color:'b',hasMoved:true},null,null],
      [null,null,null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,{type:'b',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,null,null,{type:'n',color:'w',hasMoved:true},null],
      [{type:'q',color:'w',hasMoved:true},null,null,{type:'b',color:'w',hasMoved:true},null,null,null,null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,{type:'k',color:'w',hasMoved:true},null,null,{type:'r',color:'w',hasMoved:true}]
    ]    
  ],
  favorBlack: [
    // Tablero 1
    [
      [{type:'r',color:'b',hasMoved:true},null,{type:'b',color:'b',hasMoved:true},{type:'q',color:'b',hasMoved:true},{type:'k',color:'b',hasMoved:true},{type:'b',color:'b',hasMoved:true},null,{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,{type:'n',color:'b',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,{type:'p',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [{type:'n',color:'w',hasMoved:true},null,null,null,null,null,{type:'b',color:'w',hasMoved:true},null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,{type:'k',color:'w',hasMoved:true},null,null,{type:'r',color:'w',hasMoved:true}]
    ],
    // Tablero 2
    [
      [{type:'r',color:'b',hasMoved:true},{type:'n',color:'b',hasMoved:true},null,null,{type:'k',color:'b',hasMoved:true},null,null,{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,{type:'b',color:'b',hasMoved:true},null,null,{type:'n',color:'b',hasMoved:true},null,null],
      [null,{type:'b',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,null,{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [{type:'n',color:'w',hasMoved:true},null,null,{type:'q',color:'w',hasMoved:true},null,null,{type:'b',color:'w',hasMoved:true},null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,null,null,{type:'k',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},{type:'r',color:'w',hasMoved:true}]
    ],
    // Tablero 3
    [
      [{type:'r',color:'b',hasMoved:true},null,{type:'n',color:'b',hasMoved:true},null,{type:'k',color:'b',hasMoved:true},{type:'b',color:'b',hasMoved:true},null,{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,{type:'b',color:'b',hasMoved:true},null,null,{type:'n',color:'b',hasMoved:true},null,null],
      [null,null,null,{type:'p',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,null],
      [{type:'b',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [{type:'q',color:'w',hasMoved:true},null,null,{type:'b',color:'w',hasMoved:true},null,null,{type:'n',color:'w',hasMoved:true},null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null],
      [{type:'r',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,{type:'k',color:'w',hasMoved:true},null,null,{type:'r',color:'w',hasMoved:true}]
    ],
    // Tablero 4
    [
      [{type:'r',color:'b',hasMoved:true},null,{type:'b',color:'b',hasMoved:true},{type:'q',color:'b',hasMoved:true},{type:'k',color:'b',hasMoved:true},{type:'b',color:'b',hasMoved:true},null,{type:'r',color:'b',hasMoved:true}],
      [{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,{type:'n',color:'b',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,{type:'p',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [{type:'n',color:'w',hasMoved:true},null,null,null,null,null,{type:'b',color:'w',hasMoved:true},null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,{type:'k',color:'w',hasMoved:true},null,null,{type:'r',color:'w',hasMoved:true}]
    ],
    // Tablero 5
    [
      [{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},null,{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true},{type:'p',color:'b',hasMoved:true}],
      [null,null,{type:'n',color:'b',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,{type:'p',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [{type:'n',color:'w',hasMoved:true},null,null,null,null,null,{type:'b',color:'w',hasMoved:true},null],
      [{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true},null,{type:'p',color:'w',hasMoved:true}],
      [{type:'r',color:'w',hasMoved:true},null,{type:'n',color:'w',hasMoved:true},null,{type:'k',color:'w',hasMoved:true},null,null,{type:'r',color:'w',hasMoved:true}]
    ]
  ]
};