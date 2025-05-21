/**
 * Cada tablero es una matriz 8x8 que representa piezas en formato:
 * { type: 'p', color: 'w', hasMoved: true }
 * o null si está vacío.
 */

export const midgameBoards = {
  neutral: [
    // Tablero 1
    [
      [null,null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,{type:'p',color:'b',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,{type:'n',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,{type:'p',color:'w',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 2
    [
      [null,null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,null,{type:'b',color:'b',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,{type:'q',color:'w',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,{type:'p',color:'w',hasMoved:true},null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 3
    [
      [{type:'r',color:'b',hasMoved:true},null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,{type:'n',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,{type:'b',color:'w',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 4
    [
      [null,null,{type:'n',color:'b',hasMoved:true},null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,null,null,null,{type:'p',color:'b',hasMoved:true},null,null],
      [null,null,null,null,null,null,null,null],
      [{type:'p',color:'w',hasMoved:true},null,null,null,null,null,null,null],
      [null,null,{type:'q',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 5
    [
      [null,null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,{type:'n',color:'b',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,{type:'p',color:'w',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,null,null,null,{type:'q',color:'w',hasMoved:true},null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 6
    [
      [{type:'r',color:'b',hasMoved:true},null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,null,null,{type:'b',color:'b',hasMoved:true},null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,{type:'n',color:'w',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,{type:'p',color:'w',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 7
    [
      [null,null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,{type:'q',color:'b',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [{type:'p',color:'w',hasMoved:true},null,null,null,null,null,null,null],
      [null,null,{type:'n',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ]
  ],
  favorWhite: [
    // Tablero 1
    [
      [null,null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,{type:'r',color:'b',hasMoved:true},null,null,null,null,null],
      [null,null,null,{type:'n',color:'b',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [{type:'q',color:'w',hasMoved:true},null,null,{type:'p',color:'w',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,{type:'b',color:'w',hasMoved:true},null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 2
    [
      [{type:'n',color:'b',hasMoved:true},null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,null,{type:'p',color:'b',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,{type:'q',color:'w',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,null,{type:'b',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 3
    [
      [null,null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [{type:'b',color:'b',hasMoved:true},null,null,null,null,null,null,null],
      [null,{type:'p',color:'b',hasMoved:true},null,null,null,null,null,null],
      [null,null,{type:'n',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,{type:'q',color:'w',hasMoved:true},null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 4
    [
      [null,null,{type:'r',color:'b',hasMoved:true},null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,null,null,null,null,null,null],
      [{type:'q',color:'w',hasMoved:true},null,null,null,null,null,null,null],
      [null,null,null,{type:'p',color:'w',hasMoved:true},null,null,null,null],
      [null,{type:'n',color:'w',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 5
    [
      [{type:'r',color:'b',hasMoved:true},null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,null,null,{type:'p',color:'b',hasMoved:true},null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,{type:'q',color:'w',hasMoved:true},null,null,null,null,null,null],
      [null,null,{type:'b',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 6
    [
      [null,null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [{type:'q',color:'w',hasMoved:true},null,null,null,null,null,null,null],
      [null,null,{type:'p',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,{type:'n',color:'w',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,{type:'b',color:'w',hasMoved:true},null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 7
    [
      [null,null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [{type:'r',color:'b',hasMoved:true},null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,{type:'q',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,{type:'p',color:'w',hasMoved:true},null,null,null],
      [null,null,null,{type:'n',color:'w',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ]
  ],
  favorBlack: [
    // Tablero 1
    [
      [null,null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,{type:'q',color:'b',hasMoved:true},null,null,null,null,null,null],
      [null,null,{type:'p',color:'b',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [{type:'r',color:'b',hasMoved:true},null,null,null,null,null,null,null],
      [null,null,null,null,null,null,{type:'n',color:'w',hasMoved:true},null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 2
    [
      [null,null,{type:'r',color:'b',hasMoved:true},null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,null,null,null,{type:'q',color:'b',hasMoved:true},null,null],
      [null,null,null,null,null,null,null,null],
      [null,{type:'p',color:'b',hasMoved:true},null,null,null,null,null,null],
      [null,null,{type:'n',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 3
    [
      [{type:'b',color:'b',hasMoved:true},null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,{type:'p',color:'b',hasMoved:true},null,null,null,null,null],
      [null,null,null,{type:'q',color:'b',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,{type:'n',color:'w',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 4
    [
      [null,null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,{type:'r',color:'b',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,null,{type:'q',color:'b',hasMoved:true},null,null,null],
      [null,null,null,null,null,null,null,null],
      [{type:'b',color:'b',hasMoved:true},null,null,null,null,null,null,null],
      [null,null,null,{type:'n',color:'w',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 5
    [
      [{type:'q',color:'b',hasMoved:true},null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,{type:'p',color:'b',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,{type:'r',color:'b',hasMoved:true},null,null,null,null],
      [null,null,{type:'n',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 6
    [
      [null,null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,null,{type:'r',color:'b',hasMoved:true},null,null,null,null,null],
      [null,{type:'b',color:'b',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,{type:'q',color:'b',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,null,{type:'n',color:'w',hasMoved:true},null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ],
    // Tablero 7
    [
      [{type:'r',color:'b',hasMoved:true},null,null,null,{type:'k',color:'b',hasMoved:false},null,null,null],
      [null,{type:'q',color:'b',hasMoved:true},null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [{type:'p',color:'b',hasMoved:true},null,null,null,null,null,null,null],
      [null,null,{type:'b',color:'w',hasMoved:true},null,null,null,null,null],
      [null,null,null,{type:'n',color:'w',hasMoved:true},null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,{type:'k',color:'w',hasMoved:false},null,null,null]
    ]
  ]
};