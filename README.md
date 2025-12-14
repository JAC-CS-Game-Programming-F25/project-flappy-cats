
# Flappy Cats

## 1. Description

### • What is our game about?:

Inspired by Flappy Bird, our game features a personalized and playful twist: the main character is our own cats. Instead of flapping wings, each cat floats using a balloon. The goal is simple but challenging : survive as long as possible, avoid obstacles, collect stars, manage lives, and maintain control. The difficulty varies based on which cat you choose, some cats are harder to control while others are easier.

### • Who is the player? What are they doing?

The player controls one of several cats, each with different physical properties (weight and size) that impact gameplay difficulty. The cat moves upward by tapping the spacebar, and gravity continuously pulls it downward. The player must time their taps carefully to navigate through gaps between pillars, avoid collisions, and aim to achieve the highest possible score.  
The longer the player survives, the higher their score. There is no final level : it is an endless challenge.

### Genre
The game is an endless runner that focuses on arcade-style timing and precision mechanics, challenging the player to navigate through obstacles with careful, well-timed movements.

### Control scheme

#### • How the player controls the game.

**SPACEBAR** -> Moves the cat upward  
**Gravity** -> Pulls the cat downward  
**P** -> Pauses the game (resuming triggers a 3-second countdown)

### Gameplay / game loop

• The player repeatedly taps the spacebar to stay airborne.  
• Avoid hitting the pillars while navigating through narrow gaps.  
• Collect stars to increase score.  
• Collect hearts to regain lost lives.  
• Survive as long as possible : the game has no win state, only a high score to beat.  
• Difficulty varies based on the cat you choose, each cat offers a different challenge level, with some being harder to control and others being easier.  
• Occasionally, you can encounter a power-up:
  - Invincibility (5 seconds)  
  - Slow-motion mode (5 seconds)  

### Cat Selection System

At the start of the game, the player chooses a cat. Each cat offers a different gameplay experience:  
**Light cat** -> rises faster, easier to float but harder to control  
**Heavy cat** -> falls faster, harder to keep up but more stable  
**Big cat** -> larger hitbox makes the game more challenging  
**Small cat** -> smaller hitbox, slightly easier to fit through gaps  

These variations allow players to choose a character that matches their preferred difficulty and playstyle.

---

## 2. Requirements (Player Abilities)

The player should be able to:

### Choose their cat character
- Select from multiple cats, each with unique weight/size affecting difficulty.  
- Selected cat appears during gameplay and persists until changed.

### Control movement (flying)
- SPACEBAR moves upward.  
- Gravity pulls the cat down.  
- Maintain precise height control to avoid pillars.

### Navigate obstacles
- Fly through gaps without touching pillars.  
- React to dynamically generated pillar layouts.

### Collect items
**Stars:**  
- Trigger sound effect when collected.  

**Hearts:**  
- Instantly restore one life (up to a max of 3).

### Track health and lives
- Start with 3 lives.  
- Lose 1 life when hitting a pillar or falling down on the bottom of the screen.  
- Lives are shown on screen (heart icons).  
- If lives reach 0, the player loses.

### Power-Ups (Entities)

Power-ups are **visible collectible objects**, not triggered by stars.

**Types (each lasts 5 seconds):**
- **InvinciblePowerUp** → collisions do not hurt the player  
- **SlowPowerUp** → temporarily slows down the game  

**These are implemented using inheritance:**
- **PowerUp** (parent class)  
  - InvinciblePowerUp  
  - SlowPowerUp

Each subclass defines its own behavior.

### Lose the game
Hitting 0 lives displays a **Game Over screen** including:  
- Final score  
- Stars collected  
- Restart option  
- Option to return to the main menu  

### High score system
- Highest score is permanently saved (local storage).  
- High score persists across sessions.

### Pause and resume
- Press **P** to pause.  
- Pause menu appears.  
- Resuming plays a 3-second countdown.

### Persistence
The game includes full state persistence if:  
- The player refreshes the page  
- The browser tab is closed and reopened  
- The computer sleeps  

The game loads exactly as it was, including:  
- Cat position  
- Pipe positions  
- Current score and collected stars  
- Current lives  
- Active power-ups (with remaining time)  
- Which cat was selected  
- Pause state if relevant  

This ensures the player can resume seamlessly.

---

## 3. Diagrams

- **State Diagram**  
<img width="1126" height="881" alt="image" src="https://github.com/user-attachments/assets/d75cae30-2084-407c-83f9-6bfa885f911e" />


- **Entity/Player State Diagram**  
<img width="1259" height="853" alt="image" src="https://github.com/user-attachments/assets/93b2ba5a-91a8-4107-b893-bb5a2e7d08f6" />


- **Class Diagram**
<img width="2616" height="1840" alt="classDiagram (2)" src="https://github.com/user-attachments/assets/6cab55d8-6d45-4a80-ab45-1f97b175aca7" />


---

## 4. Wireframes
<img width="658" height="250" alt="image" src="https://github.com/user-attachments/assets/c45e3fd5-4621-4986-a1e2-5b9cbe97f7ab" />


<img width="1246" height="1250" alt="GameScreen" src="https://github.com/user-attachments/assets/46593fc7-5d42-4ed4-bf31-816f277e7d02" />


<img width="1257" height="1255" alt="ScoreScreen" src="https://github.com/user-attachments/assets/bd06cf52-2222-4205-9b21-0028d6c395f1" />

<img width="457" height="546" alt="Motya" src="https://github.com/user-attachments/assets/6487535a-2f0b-4c31-a304-1893eb92257f" />

<img width="1252" height="863" alt="WeightedCharacter" src="https://github.com/user-attachments/assets/e3fef3df-cf2c-4e25-8903-215e76b74204" />
Weighted character, bigger too

<br>

<img width="480" height="289" alt="image" src="https://github.com/user-attachments/assets/24ad29e1-d045-4475-ae40-6a209ef89b0e" />


---

## 5. Assets Plan

### Images / Sprites
- Player (cat floating with balloon) -> provided by student  
- Pipes ->  simple green pixel pipes  
- Stars -> collectible gold stars  
- Background -> sky + clouds (pixel art)

**Sources:**  
- Student-created sprites  
- Free-to-use pixel art textures from:  
  https://itch.io/game-assets/free  
  https://opengameart.org/

### Fonts
- Pixel font (from Dafont.com)  
- Simple retro bitmap fonts for UI

### Sounds
All sounds from freesound.org and jsfxr online:  
- Flap sound  
- Pipe pass “ding”  
- Collect star sparkle  
- Game over “thud”

### References
- Flappy Bird GDD community breakdowns  
- Sounds from jsfxr online
- Instructor sample proposal (Pokémon TCG)  
- Pixel assets from itch.io and OpenGameArt
