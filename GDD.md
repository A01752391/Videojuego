# **Pawned**

## _Game Design Document_

---

##### **Team name:**

ADA

##### **Authors:**

- Miranda Urban Solano A01752391
- Luis Santiago Lopez A01785755
- Luis Leonardo Rodríguez Gálvez A01029331
- Santino Matias Im A01029622

##

## _Index_

---

1. [Index](#index)
2. [Game Design](#game-design)
   1. [Summary](#summary)
   2. [Gameplay](#gameplay)
   3. [Mindset](#mindset)
3. [Technical](#technical)
   1. [Screens](#screens)
   2. [Controls](#controls)
   3. [Mechanics](#mechanics)
4. [Level Design](#level-design)
   1. [Themes](#themes)
      1. Board
         1. Ambient
         2. Interactive
      2. Pieces
         1. Ambient
         2. Interactive
   2. [Game Flow](#game-flow)
5. [Development](#development)
   1. [Abstract Classes](#abstract-classes--components)
   2. [Derived Classes](#derived-classes--component-compositions)
6. [Graphics](#graphics)
   1. [Style Attributes](#style-attributes)
   2. [Graphics Needed](#graphics-needed)
7. [Sounds/Music](#soundsmusic)
   1. [Style Attributes](#style-attributes-1)
   2. [Sounds Needed](#sounds-needed)
   3. [Music Needed](#music-needed)
8. [Schedule](#schedule)

## _Game Design_

---

### **Summary**

This is a chess-roguelike local two player game on which the pieces of the chess board are in mid-game status, which means that the pieces are already developed and ready to attack each other. Each piece capture has a specific amount of points the player should reach to get a completely random powerup. The powerups are triggered by the user so they can use them when most convenient. The game is based on a best-of 3 system so when any of the players reach two wins the run is over.

### **Gameplay**

The gameplay involves the traditional chess moves over the board, until power ups are acquired. The powerups can be general (for every piece of your control) or even be applicable to the opponents pieces. This is the factor of the game that will add uncertainty and a more fresh experience each run. Powerups can affect the board, exchange pieces, disappear pieces, etc.
The goal of the game is to beat the other player and gain points after each capture to be awarded power ups for any-round use and get to the highest score possible.
To overcome the challenges, the player should focus on adaptability, turn management, and long-term planning. When receiveing a powerup, the player should decide on a conservative or aggressive approach, to attack the opposing pieces with the powerup. Overall, success depends on managing resources wisely, and making calculated sacrifices when necessary.

### **Mindset**

The game is intended to provoke a mindset of a frenetic and randomized gameplay, where the only limit is the combination of the powerups and how they are used, and adventurous tension by creating an atmosphere of constantly adapting to unpredictable situations while seeking creative ways to overcome them. However, the unlockable power-ups allow players to feel progressively stronger with each milestone of points reached. This balances the emotions that are provoked through the design.

## _Technical_

---

### **Screens**

1. Title Screen
   1. Options
2. Play
3. Game
   1. Pause
   2. Quit
4. Powerup award (when the score is reached)
5. End screen
   1. Winning screen
   2. Losing screen

### **Controls**

The player will interact with the game moving pieces by clicking on them, and then selecting a valid square, following traditional chess movement rules. Each time a piece is selected or clicked upon, the squares where the piece can move will be lighted up.

The basic trigger events are the following:

- Left click: select/move piece.
- Right click: view piece info (abilities, stats).
- Key Esq: Open menu (continue, new run, main menu).

The triggerable in-game events:
- Power-up spawn: select a power-up to apply it to a single piece.


### **Mechanics**

- *Standard Chess Moves:* click to select a piece, then click a highlighted legal square to move or capture.  
- *Scoring:* capture value = classic chess points (Pawn = 1, Knight/Bishop = 3, Rook = 5, Queen = 9; checkmate grants +12).  
- *Superpower Spawns:* upon crossing each threshold, the player is awarded one powerup to use in-game when desired. The powerup will appear on the game's screen.
- *Activation:* on your turn, select a power, then click its target on board.  
- *Two Rounds:*  
  1. *Round 1:* standard mid‑game setup—race for points and powers.  
  2. *Round 2:* fresh mid‑game layout where the trailing player receives an *advantaged formation*:  
     - +2 advanced pawns on the third rank,  
     - +1 additional minor piece (Knight or Bishop) placed to control the center,  
     - +1 free superpower token in inventory at start.  
- *Victory:* highest cumulative points after Round 2; if tied, next capture wins.


## _Level Design_

---

_(Note : These sections can safely be skipped if they&#39;re not relevant, or you&#39;d rather go about it another way. For most games, at least one of them should be useful. But I&#39;ll understand if you don&#39;t want to use them. It&#39;ll only hurt my feelings a little bit.)_

### **Themes**

1. Board
   1. Mood
      1. Supernatural, playful, chaotic.
   2. Objects
      1. _Ambient_
         1. Hand-painted look
         2. Fairytale aesthetic
         3. Dim lighting
      2. _Interactive_
         1. Pieces
         2. Tiles
2. Pieces
   1. Mood
      1. Spectral, theatrical, ghostly.
   2. Objects
      1. _Ambient_
         1. Each piece has its own personality
         2. Uncanny touches
         3. Bizarre looks
      2. _Interactive_
         1. King
         2. Queen
         3. Rook
         4. Bishop
         5. Knight
         6. Pawn

### **Game Flow**

1. A standard mid‑game layout is generated randomly and the target score for the round is displayed.
2. Player moves using chess logic.
3. Capture pieces to gain points.
4. According to the points gained, power-ups are displayed.
5. Use any power-ups if available.
6. Next round begins, same logic, but with a new board, applying dynamic layout favoring trailing players (advanced pawns, central minor piece, bonus power).
7. Repeat until victory or sudden‑death.


## _Development_

---

### **Abstract Classes / Components**

1. BasePhysics
   1. BasePlayer
   2. BaseEnemy
   3. BaseObject
2. BaseObstacle
3. BaseInteractable

_(example)_

### **Derived Classes / Component Compositions**

1. BasePlayer
   1. PlayerMain
   2. PlayerUnlockable
2. BaseEnemy
   1. EnemyWolf
   2. EnemyGoblin
   3. EnemyGuard (may drop key)
   4. EnemyGiantRat
   5. EnemyPrisoner
3. BaseObject
   1. ObjectRock (pick-up-able, throwable)
   2. ObjectChest (pick-up-able, throwable, spits gold coins with key)
   3. ObjectGoldCoin (cha-ching!)
   4. ObjectKey (pick-up-able, throwable)
4. BaseObstacle
   1. ObstacleWindow (destroyed with rock)
   2. ObstacleWall
   3. ObstacleGate (watches to see if certain buttons are pressed)
5. BaseInteractable
   1. InteractableButton

_(example)_

## _Graphics_

**Game logo**
![Game logo.](Imagenes/Logo.jpg)

**Game board**
![Game board.](Imagenes/Tablero.jpg)

**Pieces/Characters**
![Game characters.](Imagenes/Piezas.jpg)

---

### **Style Attributes**

What kinds of colors will you be using? Do you have a limited palette to work with? A post-processed HSV map/image? Consistency is key for immersion.

What kind of graphic style are you going for? Cartoony? Pixel-y? Cute? How, specifically? Solid, thick outlines with flat hues? Non-black outlines with limited tints/shades? Emphasize smooth curvatures over sharp angles? Describe a set of general rules depicting your style here.

Well-designed feedback, both good (e.g. leveling up) and bad (e.g. being hit), are great for teaching the player how to play through trial and error, instead of scripting a lengthy tutorial. What kind of visual feedback are you going to use to let the player know they&#39;re interacting with something? That they \*can\* interact with something?

### **Graphics Needed**

1. Characters
   1. Human-like
      1. Goblin (idle, walking, throwing)
      2. Guard (idle, walking, stabbing)
      3. Prisoner (walking, running)
   2. Other
      1. Wolf (idle, walking, running)
      2. Giant Rat (idle, scurrying)
2. Blocks
   1. Dirt
   2. Dirt/Grass
   3. Stone Block
   4. Stone Bricks
   5. Tiled Floor
   6. Weathered Stone Block
   7. Weathered Stone Bricks
3. Ambient
   1. Tall Grass
   2. Rodent (idle, scurrying)
   3. Torch
   4. Armored Suit
   5. Chains (matching Weathered Stone Bricks)
   6. Blood stains (matching Weathered Stone Bricks)
4. Other
   1. Chest
   2. Door (matching Stone Bricks)
   3. Gate
   4. Button (matching Weathered Stone Bricks)

_(example)_

## _Sounds/Music_

---

### **Style Attributes**


- *Effects:* whimsical and percussive—light “clicks,” playful “pops,” energetic “zaps.”  
- *Music:* upbeat, loopable tracks with quirky melodies (e.g. marimba, xylophone, light synth), rising in intensity as power thresholds approach.

### **Sounds Needed**

1. Move click  
2. Capture bite  
3. Power spawn zap  
4. Power collect pop  
5. Power activate whoosh  
6. Round transition jingle  
7. Victory/death fanfare  

### **Music Needed**

1. *Main Loop:* light, catchy motif  
2. *Tension Build:* rhythmic swell on spawns  
3. *Finale:* triumphant brass/synth flourish 

## _Schedule_

---

1. *Week 1:* grid & piece movement, highlights  
2. *Week 2:* capture scoring & UI  
3. *Week 3:* threshold detection & power spawn  
4. *Week 4:* implement each power effect  
5. *Week 5:* round transitions & summaries  
6. *Week 6:* handicap layout for Round 2 favoring trailing player  
7. *Week 7:* integrate final graphics & animations  
8. *Week 8:* add SFX & music  
9. *Week 9:* playtesting & balancing  
10. *Week 10:* polish, bug fixes, final build  

