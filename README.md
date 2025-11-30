
# Flappy Cats

## 1. Description

### • What is our game about?:

Inspired by Flappy Bird, our game features a personalized and playful twist: the main character is our own cats. Instead of flapping wings, each cat floats using a balloon. The goal is simple but challenging : survive as long as possible, avoid obstacles, collect stars, manage lives, and maintain control as the difficulty increases over time.

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
• Difficulty naturally increases over time (smaller gaps, faster scrolling, more obstacles).  
• Occasionally, collecting a star may trigger a random power-up:  
  - Invincibility (5 seconds)  
  - Slow-motion mode (5 seconds)  
  *Only one is chosen randomly when triggered.*

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
- Increase score.  
- Trigger visual sparkle effect and sound.  
- Occasionally activate a random power-up (5 seconds):  
  • Invincibility  
  • Slow motion  

**Hearts:**  
- Instantly restore one life (up to a max of 3).

### Track health and lives
- Start with 3 lives.  
- Lose 1 life when hitting a pillar.  
- Lives are shown on screen (heart icons).  
- If lives reach 0, the player loses.

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
![State Diagram](<img width="1126" height="881" alt="StateDiagram" src="https://github.com/user-attachments/assets/20363539-e075-431e-9b1f-036b0d83277a" />)

- **Entity/Player State Diagram**  
![Entity/Player Diagram](<img width="1259" height="853" alt="EntityPlayerDiagram" src="https://github.com/user-attachments/assets/d38476f9-ee15-4bdf-a220-50a287b23cec" />)

- **Class Diagram**
![Class Diagram](<img width="1412" height="882" alt="ClassDiagram" src="https://github.com/user-attachments/assets/733aa0af-60d9-4504-bbd2-a46ca735e86f" />)

---

## 4. Wireframes
![Title](<img width="658" height="250" alt="FlappyCat" src="https://github.com/user-attachments/assets/63ec8aad-5e14-4bd3-a337-bfe8f7dab6be" />)


![GameScreen](<img width="1246" height="1250" alt="GameScreen" src="https://github.com/user-attachments/assets/46593fc7-5d42-4ed4-bf31-816f277e7d02" />)


![ScoreScreen](<img width="1257" height="1255" alt="ScoreScreen" src="https://github.com/user-attachments/assets/bd06cf52-2222-4205-9b21-0028d6c395f1" />)

![MotyaCharacter](<img width="457" height="546" alt="Motya" src="https://github.com/user-attachments/assets/6487535a-2f0b-4c31-a304-1893eb92257f" />)

![WeightedCharacter](<img width="1252" height="863" alt="WeightedCharacter" src="https://github.com/user-attachments/assets/e3fef3df-cf2c-4e25-8903-215e76b74204" />)
Weighted character, bigger too

![CharacterSelection](![CharacterScreen](https://github.com/user-attachments/assets/f14116a9-7255-43fc-ac36-9b89a786f566))


---

## 5. Assets Plan

### Images / Sprites
- Player (cat floating with balloon) -> provided by student  
- Pipes -> custom simple green pixel pipes  
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
