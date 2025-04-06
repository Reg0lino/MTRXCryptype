README - Matrix Feed Interface Game
How to Reach the End States:
There are now two possible endings:
Losing State: Occurs if the BIO bar reaches 99.5%. Fail green "Machine" message mini-games to increase BIO. Sequence (in matrixfeedinterface.html): Randomized fail text streams in over normal rain -> screen fades fully green (rain continues) -> slower white flashes (with sounds: zapglitch on 2nd, jackout on last; BG music stops) -> back to landing.html.
Winning State: Occurs if both CPU and MEM bars reach 99.5%. Succeed at yellow "Freedom" message mini-games to increase CPU/MEM. Sequence: Game stops, background music stops, browser redirects to jackout.html.
jackout.html Sequence: Shows a large, shimmering, blinking _ cursor positioned between the bottom and middle of the screen against a black background (system mouse cursor is visible). On first click: intro cursor disappears, dense upward gold rain with character shimmer effect starts + sound (open2.mp3), canvas fades in -> "TRY AGAIN?" link appears after 30 seconds (positioned higher than before, below intro cursor's original spot) -> clicking link goes back to landing.html.
Test Mode: To quickly test endings, press Left/Right arrow keys to manually decrease/increase CPU and MEM bars (only works when TEST_MODE_ENABLED is true in matrix_script.js and the UI is visible). A red "[TEST MODE ACTIVE]" indicator will appear in the top-right corner if enabled. Pressing Left/Right does not affect the BIO bar (for testing losing state, fail machine mini-games).
Overview
This document describes the interactive Matrix-themed interface powered by matrixfeedinterface.html and matrix_script.js. It features digital rain, a HUD, and a mini-game involving finding/capturing hidden messages. The winning sequence is handled by jackout.html, featuring an interactive intro before the gold rain. Note: jackout.html currently uses embedded CSS for debugging file loading issues.
Core Features
Digital Rain: Falling green characters background (matrixfeedinterface.html).
HUD/Top Panel: Displays system info (status, resources, difficulty). Shows test mode indicator if enabled.
Hidden Messages: Drifting "machine" (green) or "freedom" (yellow) text, revealed by magnifier.
Magnifier (Viewfinder): Mouse-controlled zoom area.
Typing Mini-Game:
Triggering: Auto for machine messages; click for freedom messages (under magnifier).
Gameplay: Magnifier freezes, showing locked message. Center UI bar shows pulsating target text and glitching user input with timer. Type letters only.
Difficulty: Adjustable (Slow/Normal/Fast) via Up/Down arrows; defaults to Normal (500ms/char).
Outcome: Success (freedom) increases CPU/MEM. Failure (machine) increases BIO.
Message Logging: Displays captured/failed messages.
Unique Messages: Drawn from large, unique pools that reset when exhausted.
Persistent Data Boxes: Spawn on message success/failure.
Ending Sequences:
Lose: High BIO -> Randomized fail text over rain -> green fade -> slower white flashes + sounds -> redirect to landing.html. (Handled in matrix_script.js)
Win: High CPU & MEM -> matrix_script.js stops, redirects to jackout.html. -> jackout.html shows intro cursor (system cursor visible) -> Click triggers upward gold rain (with char shimmer) + sound -> shows "TRY AGAIN?" link after 30s -> link redirects to landing.html. (Handled by jackout.html/jackout_script.js)
Audio: Background music (main interface), ambient SFX, event sounds (main interface), win sound (jackout.html on click).
Test Mode: Optional Left/Right arrow key controls for CPU/MEM bars in main interface.
Files
landing.html: The initial entry point page.
matrix_style.css: Styles for landing.html.
matrixfeedinterface.html: The main game interface page. Contains embedded CSS.
matrix_script.js: Core logic for the main game interface (rain, HUD, mini-game, lose sequence).
jackout.html: The winning sequence page (currently with embedded CSS).
jackout_style.css: Stylesheet for jackout.html (intended location, make sure filename/path match if re-linking).
jackout_script.js: Logic for the intro cursor, gold rain effect (with char shimmer), and "Try Again" link on jackout.html.
readme.txt: This file.
SFX/: Directory containing all sound files.
Changelog
(v13.11.5 - Jackout Polish)
UI (jackout.html/CSS): Made the default system mouse cursor visible on the jackout page.
Layout (jackout.html/CSS): Repositioned the initial blinking cursor (#introCursor) higher (approx 35% from bottom). Repositioned the "TRY AGAIN?" link higher (approx 15% from bottom).
Timing (jackout_script.js): Increased the delay before the "TRY AGAIN?" link appears to 30 seconds (LINK_APPEAR_DELAY).
README: Updated win sequence description.
(v13.11.4 - Jackout CSS Embed Debug)
Debug (jackout.html): Embedded the contents of jackout_style.css directly into jackout.html to bypass file loading errors.
README: Updated file description and changelog.
(v13.11.3 - Jackout CSS Fixes)
Fix (jackout_style.css): Applied styles to html and body to prevent scrollbars. Set canvas position: fixed.
README: Updated changelog.
(v13.11.2 - Jackout Intro & Polish)
Feature (jackout.html): Added intro sequence with blinking/shimmering cursor. Rain/sound now require click.
Fix (jackout.html/jackout_style.css): Addressed potential scrollbars/margins.
Feature (jackout_script.js): Implemented character shimmer in gold rain.
Refactor (jackout_script.js): Added state management. Added cursor logic. Added click handler.
HTML (jackout.html): Added introCursor element.
CSS (jackout_style.css): Added styles for #introCursor. Updated canvas opacity.
README: Updated descriptions.
(v13.11.1 - Syntax Fix)
Fix (matrix_script.js): Corrected SyntaxError: Missing catch or finally after try in drawMagnifyEffect.
Refinement: Updated version number.
(v13.11 - Win Sequence Refactor)
Refactor: Moved win sequence to jackout.html.
Main Script (matrix_script.js): Removed win logic. Redirect on win. Simplified classes.
New Files: Created jackout.html, jackout_style.css, jackout_script.js.
README: Updated descriptions, file list.
(v13.10)
Lose Sequence: Refined timing, audio, drawing logic.
Win Sequence: Increased gold rain density. Adjusted flash effect. Ensured correct audio timing.
Audio: Updated jackout.mp3 reference.
(v13.9)
Win Sequence: Increased gold rain density.
Lose Sequence: Randomized fail text. Adjusted rain/flash/audio timing.
Audio: Added jackout glitching.mp3. Added stopSound.
(v13.7)
Test Mode: Fixed controls. Added indicator.
Win Sequence: Tuned constants.
Content: Message pool review.
(v13.6)
Gameplay Tuning: Target text pulse. Adjusted difficulty.
Win Sequence: Alternating flash concept. Tuned density.
Content: Added messages.
Feature (Testing): Added TEST_MODE_ENABLED flag.
(v13.5)
Feature: Implemented Winning State sequence.
Logic: Separated triggers. Added win state flags/timers. Modified Stream/Character.
Audio: Added open2.mp3.
Refinement: Updated animate loop. Added winningStreams. Managed tryAgainLink.
(v13.4)
Gameplay Tuning: Target pulse. Adjusted difficulty.
Content: Added messages. Updated intro text.
(v13.3)
Gameplay Tuning: Reduced locked msg glitch. Adjusted speeds.
Content: Changed intro text. Added messages.
Audio Timing: BG music on first click.
(v13.2)
Content: Expanded message pools.
Code Structure: Added comments.
Documentation: Updated README.
(v13.1)
Fix: Freedom message click detection.
Verification: Confirmed locked text display & bar updates.
(v13.0)
Feature: Unique messages. Locked target display.
Content: Added lore messages.
--- END OF README.txt ---