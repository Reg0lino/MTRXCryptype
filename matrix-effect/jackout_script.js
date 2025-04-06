// jackout_script.js
// Handles the upward gold rain effect for the win sequence.

(function() {
    // Basic console fallback
    window.console = window.console || { log: function() {}, error: function() {}, warn: function() {} };
    console.log(">>> jackout_script.js v1.1.18-SyntaxRestore3 STARTING <<<"); // Version Bump + Restore

    // --- States ---
    const STATE_INTRO = 0;
    const STATE_RAIN = 1;

    // Link Movement Phases
    const LINK_PHASE_STATIC = 0;
    const LINK_PHASE_BOUNCING_SLOW = 1;
    const LINK_PHASE_BOUNCING_FAST_LINEAR = 2;
    const LINK_PHASE_BOUNCING_FAST_CIRCULAR = 3;

    // --- Essential Elements Check ---
    const canvas = document.getElementById('goldRainCanvas');
    const tryAgainLink = document.getElementById('tryAgainLink');
    const introCursor = document.getElementById('introCursor');
    if (!canvas || !tryAgainLink || !introCursor) { console.error("FATAL: Essential HTML element(s) not found. Check IDs: goldRainCanvas, tryAgainLink, introCursor"); alert("CRITICAL ERROR: Essential HTML element(s) not found."); return; }
    let ctx;
    try { ctx = canvas.getContext('2d', { alpha: false }); if (!ctx) throw new Error("Canvas 2D context not supported/unavailable."); console.log("   Canvas context acquired."); canvas.style.opacity = '0'; introCursor.style.opacity = '0'; tryAgainLink.style.display = 'none'; tryAgainLink.textContent = ''; } catch (e) { console.error("FATAL: Could not get 2D context.", e); alert(`CRITICAL GRAPHICS ERROR: ${e.message}. Check console (F12).`); try { document.body.style.backgroundColor = '#100'; document.body.innerHTML = `<div style='color:#fdd;font-family:monospace;padding:30px;font-size:16px;'><h2>FATAL ERROR</h2><p>Could not initialize graphics (Canvas Context).</p><p><b>Error:</b> ${e.message}</p></div>`; } catch {} return; }

    // --- Animation Frame ID ---
    let animationFrameId = null;

    // ===============================================================
    // SECTION: Constants Definitions (Full list restored)
    // ===============================================================
    // --- Timing ---
    const LINK_APPEAR_DELAY = 15000;
    const WIN_TRY_AGAIN_TEXT = "TRY AGAIN?";
    const LINK_START_BOUNCING_DELAY = 15000;
    const LINK_START_FAST_BOUNCE_DELAY = 15000;
    const LINK_FAST_BOUNCE_DURATION = 20000;
    const LINK_CIRCULAR_PHASE_MIN_TIME = 3000;
    const LINK_CIRCULAR_PHASE_MAX_TIME = 6000;
    const LINK_TYPE_SPEED_MIN = 60;
    const LINK_TYPE_SPEED_MAX = 120;
    const CURSOR_BLINK_RATE = 530;
    const CURSOR_SHIMMER_SPEED = 0.005;
    const CURSOR_SHIMMER_MIN_OPACITY = 0.5;
    const CURSOR_SHIMMER_MAX_OPACITY = 1.0;
    const CURSOR_SHIMMER_MIN_BLUR = 5;
    const CURSOR_SHIMMER_MAX_BLUR = 18;
    // REMOVED: LINK_CURSOR_BLINK_RATE

    // --- Visual Effects ---
    const BG_PULSE_SPEED = 0.0005;
    const BG_PULSE_MIN_ALPHA = 0.03;
    const BG_PULSE_MAX_ALPHA = 0.08;

    // --- Link Movement ---
    const LINK_INITIAL_BOTTOM_PERCENT = 8;
    const LINK_SPEED_SLOW = 2.5;
    const LINK_SPEED_FAST_BASE = 5.0;
    const LINK_SPEED_FAST_VARIATION = 2.0;
    const LINK_ERRATIC_FACTOR = 0.5;
    const LINK_CIRCULAR_RADIUS = 70;
    const LINK_CIRCULAR_SPEED_FACTOR = 0.10;

    // --- Upward Gold Rain ---
    const WIN_RAIN_HUE = 55;
    const WIN_RAIN_LEAD_BRIGHTNESS = `hsl(${WIN_RAIN_HUE}, 100%, 75%)`;
    const WIN_RAIN_BASE_TRAIL_LIGHTNESS = 40;
    const WIN_RAIN_TRAIL_BRIGHTNESS_FACTOR = 25;
    const WIN_RAIN_SPAWN_RATE = 1.5;
    const WIN_RAIN_COLUMN_MULTIPLIER = 0.75;
    const WIN_RAIN_FADE_FACTOR = 0.06;
    const WIN_RAIN_BASE_SPEED = 3.0;
    const WIN_RAIN_SPEED_VARIATION = 9.0;
    const WIN_RAIN_CHAR_SHIMMER_CHANCE = 0.008;
    const WIN_RAIN_CHAR_SHIMMER_DURATION = 1500;
    const WIN_RAIN_CHAR_SHIMMER_INTENSITY = 15;
    const EXTRA_SPEED_BOOST = 4.0;
    const EXTRA_SPEED_CHANCE = 0.08;
    const MIN_FONT_SIZE = 10;
    const MAX_FONT_SIZE = 22;
    const INITIAL_CHARS_OFFSCREEN = 10;

    // --- Character Sets ---
    const katakana = 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ'; const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; const nums = '0123456789'; const symbols = '+-*=<>()[]!?@#$&|:.;^~_'; const characterPool = (katakana + latin + nums + symbols).split('');
    // --- Audio ---
    const AUDIO_PATH = 'SFX/'; const SOUND_FILES = { open2: 'open2.mp3' }; const WIN_SOUND_VOLUME = 0.8;

    // ===============================================================
    // SECTION: State Variables (Unchanged)
    // ===============================================================
    let currentState = STATE_INTRO; let triggerRainStart = false; let width, height; let streams = {}; let globalApproxColumnWidth = 0; let globalNumColumns = 0; let startTime = 0; let linkAppearTime = 0; let linkFinishTypingTime = 0; let linkStartBounceTime = 0; let linkStartFastBounceTime = 0; let linkShown = false; let isLinkTyping = false; let linkTargetText = WIN_TRY_AGAIN_TEXT; let linkTypedText = ""; let linkCurrentCharIndex = 0; let linkNextTypeTime = 0; let linkMovementPhase = LINK_PHASE_STATIC; let linkBaseX = 0; let linkBaseY = 0; let linkOffsetX = 0; let linkOffsetY = 0; let linkVelocityX = 0; let linkVelocityY = 0;
    // REMOVED link cursor vars
    let linkFastPhaseEndTime = 0; let linkCircularStartTime = 0; let linkCircularEndTime = 0; let linkCircularAngle = 0; let linkCircularCenterX = 0; let linkCircularCenterY = 0; let sounds = {}; let lastCursorToggleTime = 0; let isCursorVisible = true; let introClickListenerAdded = false; let rainStreamCount = 0;

    // ===============================================================
    // SECTION: Audio Helper Functions
    // ===============================================================
     function loadSounds() { console.log("--- jackout: loadSounds() ---"); console.log(`   Expecting sounds in: ${AUDIO_PATH}`); if (!AUDIO_PATH || AUDIO_PATH.length === 0) { console.error("   AUDIO_PATH empty!"); return; } for (const key in SOUND_FILES) { try { const filePath = AUDIO_PATH + SOUND_FILES[key]; const audio = new Audio(filePath); audio.preload = 'auto'; audio.onerror = (e) => { console.error(`ERROR loading sound '${key}': Path='${audio.src}'`, e.target.error); }; sounds[key] = audio; } catch (e) { console.error(`Failed to create Audio for ${key}:`, e); } } console.log("--- jackout: Sound loading initiated ---"); }
     function playSound(soundName, volume = 1.0, loop = false) { const sound = sounds[soundName]; if (sound) { try { sound.volume = Math.max(0, Math.min(1, volume)); sound.loop = loop; if (!loop && sound.currentTime > 0.1 && !sound.paused) { sound.currentTime = 0; } const playPromise = sound.play(); if (playPromise !== undefined) { playPromise.then(_ => {}).catch(error => { if (error.name !== 'NotAllowedError') { console.error(`Error playing sound ${soundName}:`, error); } else { console.warn(`Autoplay prevented for ${soundName}. Needs user interaction.`); } }); } } catch (e) { console.error(`Exception playing sound ${soundName}:`, e); } } else { console.warn(`Sound not found: ${soundName}`); } }

    // ===============================================================
    // SECTION: Helper Functions
    // ===============================================================
    function getRandomChar(pool = characterPool) { return pool[Math.floor(Math.random() * pool.length)]; }

    // ===============================================================
    // SECTION: Character & Stream classes
    // ===============================================================
      class Character { constructor(x, y, speed, fontSize, value, isHead = false) { this.x = x; this.y = y; this.speed = speed; this.fontSize = fontSize; this.value = value || getRandomChar(); this.isHead = isHead; this.brightness = isHead ? 1.0 : (0.1 + Math.random() * 0.5); this.switchShimmering = false; this.switchShimmerTime = 0; this.isGoldShimmering = false; this.goldShimmerEndTime = 0; this.fadeFactor = WIN_RAIN_FADE_FACTOR; this.hue = WIN_RAIN_HUE; this.leadBrightness = WIN_RAIN_LEAD_BRIGHTNESS; this.trailLightness = WIN_RAIN_BASE_TRAIL_LIGHTNESS; this.trailBrightFactor = WIN_RAIN_TRAIL_BRIGHTNESS_FACTOR; } update(now) { this.y -= this.speed; if (this.switchShimmering) { this.switchShimmerTime--; if (this.switchShimmerTime <= 0) { this.switchShimmering = false; if (!this.isHead) this.brightness = Math.max(0, this.brightness - this.fadeFactor * 2); } else { this.brightness = 1.0; } } else { if (!this.isHead) { this.brightness = Math.max(0, this.brightness - this.fadeFactor * 1.5); } if (!this.isHead && Math.random() < 0.005) { this.switchShimmering = true; this.switchShimmerTime = Math.random() * 15 + 5; } } if (this.isGoldShimmering && now >= this.goldShimmerEndTime) { this.isGoldShimmering = false; } if (!this.isHead && !this.isGoldShimmering && !this.switchShimmering && Math.random() < WIN_RAIN_CHAR_SHIMMER_CHANCE) { this.isGoldShimmering = true; this.goldShimmerEndTime = now + WIN_RAIN_CHAR_SHIMMER_DURATION; } } draw(ctx, now) { if (!ctx || this.brightness < 0.01 || isNaN(this.x) || isNaN(this.y)) return; let color; let baseLightness = this.trailLightness + (this.brightness * this.trailBrightFactor); if (this.isGoldShimmering) { const timeRemainingRatio = Math.max(0, (this.goldShimmerEndTime - now) / WIN_RAIN_CHAR_SHIMMER_DURATION); const shimmerPulse = Math.sin(timeRemainingRatio * Math.PI); baseLightness += shimmerPulse * WIN_RAIN_CHAR_SHIMMER_INTENSITY; } if (this.isHead) { color = this.leadBrightness; } else { const l = Math.max(10, Math.min(95, baseLightness)); color = `hsl(${this.hue}, 100%, ${l}%)`; } try { ctx.fillStyle = color; ctx.font = `${this.fontSize}px monospace`; ctx.fillText(this.value, this.x, this.y); } catch (e) { console.warn("Char draw fillText error:", e); } if (this.switchShimmering && Math.random() < 0.5) { this.value = getRandomChar(); } } }
      class Stream { constructor(x, streamHeight) { if (isNaN(x) || isNaN(streamHeight) || streamHeight <= 0) { throw new Error(`Invalid Stream args: x=${x}, h=${streamHeight}`); } this.x = x; this.streamHeight = streamHeight; this.isUpward = true; this.characters = []; this.baseFontSize = Math.floor(Math.random()*(MAX_FONT_SIZE-MIN_FONT_SIZE+1))+MIN_FONT_SIZE; if (isNaN(this.baseFontSize) || this.baseFontSize <= 0) { this.baseFontSize = Math.max(1, ((MIN_FONT_SIZE+MAX_FONT_SIZE)/2)); } this.speed = WIN_RAIN_BASE_SPEED + Math.random() * WIN_RAIN_SPEED_VARIATION; if (Math.random() < EXTRA_SPEED_CHANCE) { this.speed += EXTRA_SPEED_BOOST * (Math.random() + 0.5); } this.speed = Math.max(0.5, this.speed); this.totalChars = (this.baseFontSize > 0) ? Math.floor(((Math.random()*(this.streamHeight*0.6/this.baseFontSize)+(this.streamHeight*0.3/this.baseFontSize))*1.0)+INITIAL_CHARS_OFFSCREEN) : INITIAL_CHARS_OFFSCREEN; this.totalChars = Math.max(5, this.totalChars); let initialY = this.streamHeight + this.baseFontSize * INITIAL_CHARS_OFFSCREEN; const yIncrement = this.baseFontSize * -1; for (let i = 0; i < INITIAL_CHARS_OFFSCREEN; i++) { const isHead = (i === 0); try { const newChar = new Character(this.x, initialY + (i * yIncrement), this.speed, this.baseFontSize, null, isHead); this.characters.push(newChar); } catch (e) { console.error("Error creating initial character:", e); } } if (this.characters.length > 0 && this.characters[0]) { this.characters[0].isHead = true; this.characters[0].brightness = 1.0; } } spawnNewCharacter() { if (!this.characters.length) return; const headChar = this.characters[0]; if (!headChar) return; const spawnY = this.streamHeight + this.baseFontSize; const spawnThreshold = this.streamHeight - (this.baseFontSize * (1.0 + Math.random()*0.6)); if (headChar.y < spawnThreshold) { try { const newChar = new Character(this.x, spawnY, this.speed, this.baseFontSize, null, true); if (headChar) { headChar.isHead = false; } this.characters.unshift(newChar); if (this.characters.length > this.totalChars * 1.5) { this.characters.length = Math.floor(this.totalChars * 1.2); } } catch(e) { console.error("Error spawning new char:", e); } } } updateAndDraw(ctx, now) { if (!ctx) { return false; } for (let i = this.characters.length - 1; i >= 0; i--) { const char = this.characters[i]; if (!char) { this.characters.splice(i, 1); continue; } try { char.update(now); if (char.fontSize > 0 && !isNaN(char.fontSize)) { char.draw(ctx, now); } else { console.warn("Skip char draw - invalid font:", char); this.characters.splice(i, 1); continue; } } catch(e) { console.error("Error update/draw char:", e, char); this.characters.splice(i, 1); continue; } const removeThreshold = 0 - char.fontSize * 4; if (char.y < removeThreshold && char.brightness < 0.01 && !char.isGoldShimmering && !char.switchShimmering) { this.characters.splice(i, 1); } } this.spawnNewCharacter(); return false; } }

    // ===============================================================
    // SECTION: Link Cursor and Movement Logic
    // ===============================================================
    // REMOVED: start/stopLinkCursorBlinking functions
    function initializeLinkPosition() { if(!tryAgainLink||!width||!height)return;linkBaseY=height*(1-LINK_INITIAL_BOTTOM_PERCENT/100)-(tryAgainLink.offsetHeight/2);linkBaseX=width/2-(tryAgainLink.offsetWidth/2);linkOffsetX=0;linkOffsetY=0;tryAgainLink.style.left=`${linkBaseX}px`;tryAgainLink.style.top=`${linkBaseY}px`;tryAgainLink.style.transform=`translate(0px, 0px)`;console.log(`   jackout: Link BASE position set to X: ${linkBaseX.toFixed(0)}, Y: ${linkBaseY.toFixed(0)}`); }
    function updateLinkMovement(now) { if(!tryAgainLink||linkMovementPhase===LINK_PHASE_STATIC||!width||!height)return;const linkWidth=tryAgainLink.offsetWidth;const linkHeight=tryAgainLink.offsetHeight;let currentSpeed;if(linkMovementPhase===LINK_PHASE_BOUNCING_FAST_LINEAR&&now>=linkCircularStartTime&&now<linkFastPhaseEndTime){linkMovementPhase=LINK_PHASE_BOUNCING_FAST_CIRCULAR;linkCircularAngle=Math.atan2(linkVelocityY,linkVelocityX);linkCircularCenterX=linkOffsetX;linkCircularCenterY=linkOffsetY;console.log("   Entering circular bounce");}else if(linkMovementPhase===LINK_PHASE_BOUNCING_FAST_CIRCULAR&&now>=linkCircularEndTime){linkMovementPhase=LINK_PHASE_BOUNCING_FAST_LINEAR;const exitAngle=linkCircularAngle+(LINK_CIRCULAR_SPEED_FACTOR*(now-linkCircularStartTime));currentSpeed=LINK_SPEED_FAST_BASE+(Math.random()*LINK_SPEED_FAST_VARIATION)-(LINK_SPEED_FAST_VARIATION/2);linkVelocityX=Math.cos(exitAngle)*currentSpeed;linkVelocityY=Math.sin(exitAngle)*currentSpeed;linkCircularStartTime=now+Math.random()*(LINK_FAST_BOUNCE_DURATION/4);linkCircularEndTime=linkCircularStartTime+LINK_CIRCULAR_PHASE_MIN_TIME+Math.random()*(LINK_CIRCULAR_PHASE_MAX_TIME-LINK_CIRCULAR_PHASE_MIN_TIME);console.log("   Exiting circular bounce, next possible at:",linkCircularStartTime);}let targetOffsetX=linkOffsetX;let targetOffsetY=linkOffsetY;if(linkMovementPhase===LINK_PHASE_BOUNCING_SLOW||linkMovementPhase===LINK_PHASE_BOUNCING_FAST_LINEAR){currentSpeed=(linkMovementPhase===LINK_PHASE_BOUNCING_SLOW)?LINK_SPEED_SLOW:LINK_SPEED_FAST_BASE+(Math.random()*LINK_SPEED_FAST_VARIATION)-(LINK_SPEED_FAST_VARIATION/2);const currentAbsX=linkBaseX+linkOffsetX;const currentAbsY=linkBaseY+linkOffsetY;if(currentAbsX<=0||currentAbsX+linkWidth>=width){linkVelocityX*=-1;if(linkMovementPhase!==LINK_PHASE_BOUNCING_SLOW)linkVelocityX+=(Math.random()-0.5)*LINK_ERRATIC_FACTOR;targetOffsetX=(currentAbsX<=0)?(-linkBaseX+1):(width-linkBaseX-linkWidth-1);}if(currentAbsY<=0||currentAbsY+linkHeight>=height){linkVelocityY*=-1;if(linkMovementPhase!==LINK_PHASE_BOUNCING_SLOW)linkVelocityY+=(Math.random()-0.5)*LINK_ERRATIC_FACTOR;targetOffsetY=(currentAbsY<=0)?(-linkBaseY+1):(height-linkBaseY-linkHeight-1);}const magnitude=Math.sqrt(linkVelocityX*linkVelocityX+linkVelocityY*linkVelocityY);if(magnitude>0&&magnitude!==currentSpeed){linkVelocityX=(linkVelocityX/magnitude)*currentSpeed;linkVelocityY=(linkVelocityY/magnitude)*currentSpeed;}if(linkMovementPhase===LINK_PHASE_BOUNCING_FAST_LINEAR){linkVelocityX+=(Math.random()-0.5)*LINK_ERRATIC_FACTOR*0.6;linkVelocityY+=(Math.random()-0.5)*LINK_ERRATIC_FACTOR*0.6;}targetOffsetX+=linkVelocityX;targetOffsetY+=linkVelocityY;}else if(linkMovementPhase===LINK_PHASE_BOUNCING_FAST_CIRCULAR){linkCircularAngle+=LINK_CIRCULAR_SPEED_FACTOR;targetOffsetX=linkCircularCenterX+Math.cos(linkCircularAngle)*LINK_CIRCULAR_RADIUS;targetOffsetY=linkCircularCenterY+Math.sin(linkCircularAngle)*LINK_CIRCULAR_RADIUS;const currentAbsX=linkBaseX+targetOffsetX;const currentAbsY=linkBaseY+targetOffsetY;if(currentAbsX<=0||currentAbsX+linkWidth>=width){targetOffsetX=(currentAbsX<=0)?-linkBaseX:width-linkBaseX-linkWidth;linkCircularCenterX=targetOffsetX-Math.cos(linkCircularAngle)*LINK_CIRCULAR_RADIUS;}if(currentAbsY<=0||currentAbsY+linkHeight>=height){targetOffsetY=(currentAbsY<=0)?-linkBaseY:height-linkBaseY-linkHeight;linkCircularCenterY=targetOffsetY-Math.sin(linkCircularAngle)*LINK_CIRCULAR_RADIUS;}}linkOffsetX=targetOffsetX;linkOffsetY=targetOffsetY;tryAgainLink.style.transform=`translate(${linkOffsetX.toFixed(1)}px, ${linkOffsetY.toFixed(1)}px)`; }

    // ===============================================================
    // SECTION: Setup Function
    // ===============================================================
    function setup() { console.log("   jackout: setup() - Running..."); try { loadSounds(); width = window.innerWidth; height = window.innerHeight; if (width <= 0 || height <= 0) { width = 300; height = 300; } canvas.width = width; canvas.height = height;
        // This requires MIN_FONT_SIZE and MAX_FONT_SIZE - Should work now
        const avgFontSize = (MIN_FONT_SIZE + MAX_FONT_SIZE) / 2;
        globalApproxColumnWidth = avgFontSize * WIN_RAIN_COLUMN_MULTIPLIER; globalNumColumns = globalApproxColumnWidth > 0 ? Math.ceil(width / globalApproxColumnWidth) : 0; console.log(`   jackout: setup - Calculated ${globalNumColumns} columns`); if(ctx) ctx.clearRect(0, 0, width, height); currentState = STATE_INTRO; triggerRainStart = false; streams = {}; linkShown = false; isLinkTyping = false; linkTypedText = ""; linkCurrentCharIndex = 0; linkMovementPhase = LINK_PHASE_STATIC; linkFinishTypingTime = 0; linkStartBounceTime = 0; linkStartFastBounceTime = 0; linkFastPhaseEndTime = 0; linkCircularStartTime = 0; linkCircularEndTime = 0;
        // REMOVED: stopLinkCursorBlinking();
        lastCursorToggleTime = performance.now(); isCursorVisible = true; rainStreamCount = 0; canvas.style.opacity = '0'; introCursor.style.opacity = '1'; if (tryAgainLink) { tryAgainLink.style.display = 'none'; tryAgainLink.textContent = ''; } addEventListeners(); console.log(`   jackout: setup() - COMPLETE. Current State: INTRO.`); if (!animationFrameId) { animationFrameId = requestAnimationFrame(animate); } } catch (e) { console.error("   jackout: setup() - ERROR:", e); try { if(ctx && width && height) { ctx.fillStyle = 'darkred'; ctx.fillRect(0, 0, width, height); ctx.fillStyle = 'white'; ctx.font = '16px monospace'; ctx.textAlign = 'center'; ctx.fillText("SETUP ERROR", width / 2, height / 2 - 10); ctx.fillText(e.message || 'Unknown Error', width / 2, height / 2 + 10); } } catch {} throw e; } }


    // ===============================================================
    // SECTION: Main Animation Loop
    // ===============================================================
    function animate() { const now = performance.now(); try { if (currentState === STATE_INTRO && triggerRainStart) { console.log(">>> Animate Loop: Triggering Rain Start Logic <<<"); currentState = STATE_RAIN; triggerRainStart = false; introCursor.style.opacity = '0'; introCursor.style.display = 'none'; if (canvas) { canvas.style.opacity = '1'; console.log("   Set canvas opacity to 1"); if(ctx) ctx.clearRect(0,0,width,height); } playSound('open2', WIN_SOUND_VOLUME); startTime = performance.now(); linkAppearTime = startTime + LINK_APPEAR_DELAY; linkShown = false; isLinkTyping = false; linkMovementPhase = LINK_PHASE_STATIC; linkFinishTypingTime = 0; linkStartBounceTime = 0; linkStartFastBounceTime = 0; linkFastPhaseEndTime = 0; linkCircularStartTime = 0; linkCircularEndTime = 0; console.log("   Rain Start Logic Complete. New state:", currentState); } if (currentState === STATE_INTRO) { if (!triggerRainStart) { if (now - lastCursorToggleTime > CURSOR_BLINK_RATE) { isCursorVisible = !isCursorVisible; introCursor.style.opacity = isCursorVisible ? '1' : '0'; lastCursorToggleTime = now; } if (isCursorVisible) { const shimmerValue = (Math.sin(now * CURSOR_SHIMMER_SPEED) + 1) / 2; const glowOpacity = CURSOR_SHIMMER_MIN_OPACITY + shimmerValue * (CURSOR_SHIMMER_MAX_OPACITY - CURSOR_SHIMMER_MIN_OPACITY); const glowBlur = CURSOR_SHIMMER_MIN_BLUR + shimmerValue * (CURSOR_SHIMMER_MAX_BLUR - CURSOR_SHIMMER_MIN_BLUR); introCursor.style.textShadow = `0 0 ${glowBlur.toFixed(1)}px hsla(${WIN_RAIN_HUE}, 100%, 75%, ${glowOpacity.toFixed(2)})`; } else { introCursor.style.textShadow = 'none'; } } } else if (currentState === STATE_RAIN) { if (!ctx) { console.error("!CTX in STATE_RAIN"); if (animationFrameId) cancelAnimationFrame(animationFrameId); return; } const bgPulseValue = (Math.sin(now * BG_PULSE_SPEED) + 1) / 2; const bgAlpha = BG_PULSE_MIN_ALPHA + bgPulseValue * (BG_PULSE_MAX_ALPHA - BG_PULSE_MIN_ALPHA); ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha.toFixed(3)})`; ctx.fillRect(0, 0, width, height); let streamsToDelete = []; if (globalNumColumns > 0 && width > 0 && height > 0) { for (let i = 0; i < globalNumColumns; i++) { const colIndex = i.toString(); if (!streams[colIndex] && Math.random() < WIN_RAIN_SPAWN_RATE) { const colX = i * globalApproxColumnWidth + (Math.random() * globalApproxColumnWidth * 0.5 - globalApproxColumnWidth * 0.25); if (!isNaN(colX)) { try { streams[colIndex] = new Stream(colX, height); rainStreamCount++; } catch (e) { console.warn(`Error CREATING gold stream at col ${i}:`, e); } } } } for (const columnIndex in streams) { if (!Object.prototype.hasOwnProperty.call(streams, columnIndex)) continue; const stream = streams[columnIndex]; if (stream && typeof stream.updateAndDraw === 'function') { try { stream.updateAndDraw(ctx, now); } catch (streamErr) { console.error(`Error DRAWING gold stream ${columnIndex}:`, streamErr); streamsToDelete.push(columnIndex); } } else { console.warn(`Invalid gold stream at ${columnIndex}, removing.`); streamsToDelete.push(columnIndex); } } } streamsToDelete.forEach(key => { delete streams[key]; rainStreamCount--; }); if (!linkShown && now >= linkAppearTime) { linkShown = true; isLinkTyping = true; linkTypedText = ""; linkCurrentCharIndex = 0; linkTargetText = WIN_TRY_AGAIN_TEXT; linkNextTypeTime = now + LINK_TYPE_SPEED_MIN + Math.random() * (LINK_TYPE_SPEED_MAX - LINK_TYPE_SPEED_MIN); if (tryAgainLink) { initializeLinkPosition(); tryAgainLink.textContent = ''; tryAgainLink.style.display = 'block'; console.log("   jackout: 'TRY AGAIN?' link period started. Typing..."); } } if (linkFinishTypingTime > 0) { if (linkMovementPhase === LINK_PHASE_STATIC && now >= linkStartBounceTime) { linkMovementPhase = LINK_PHASE_BOUNCING_SLOW; const angle = Math.random() * Math.PI * 2; linkVelocityX = Math.cos(angle) * LINK_SPEED_SLOW; linkVelocityY = Math.sin(angle) * LINK_SPEED_SLOW; console.log("   jackout: Link entering SLOW bounce phase."); /* stopLinkCursorBlinking(); */ } if (linkMovementPhase === LINK_PHASE_BOUNCING_SLOW && now >= linkStartFastBounceTime) { linkMovementPhase = LINK_PHASE_BOUNCING_FAST_LINEAR; linkFastPhaseEndTime = now + LINK_FAST_BOUNCE_DURATION; linkCircularStartTime = now + Math.random() * (LINK_FAST_BOUNCE_DURATION / 3); linkCircularEndTime = linkCircularStartTime + LINK_CIRCULAR_PHASE_MIN_TIME + Math.random() * (LINK_CIRCULAR_PHASE_MAX_TIME - LINK_CIRCULAR_PHASE_MIN_TIME); const magnitude = Math.sqrt(linkVelocityX * linkVelocityX + linkVelocityY * linkVelocityY); const initialFastSpeed = LINK_SPEED_FAST_BASE + (Math.random() * LINK_SPEED_FAST_VARIATION) - (LINK_SPEED_FAST_VARIATION / 2); if (magnitude > 0) { linkVelocityX = (linkVelocityX / magnitude) * initialFastSpeed; linkVelocityY = (linkVelocityY / magnitude) * initialFastSpeed; } else { const angle = Math.random() * Math.PI * 2; linkVelocityX = Math.cos(angle) * initialFastSpeed; linkVelocityY = Math.sin(angle) * initialFastSpeed; } console.log("   jackout: Link entering FAST bounce phase (Linear). Next circular possible at:", linkCircularStartTime); } if ((linkMovementPhase === LINK_PHASE_BOUNCING_FAST_LINEAR || linkMovementPhase === LINK_PHASE_BOUNCING_FAST_CIRCULAR) && now >= linkFastPhaseEndTime) { linkMovementPhase = LINK_PHASE_BOUNCING_SLOW; const magnitude = Math.sqrt(linkVelocityX * linkVelocityX + linkVelocityY * linkVelocityY); if (magnitude > 0) { linkVelocityX = (linkVelocityX / magnitude) * LINK_SPEED_SLOW; linkVelocityY = (linkVelocityY / magnitude) * LINK_SPEED_SLOW; } else { const angle = Math.random() * Math.PI * 2; linkVelocityX = Math.cos(angle) * LINK_SPEED_SLOW; linkVelocityY = Math.sin(angle) * LINK_SPEED_SLOW;} console.log("    jackout: Fast bounce duration ended, reverting to SLOW bounce."); } } if (isLinkTyping && now >= linkNextTypeTime) { if (linkCurrentCharIndex < linkTargetText.length) { linkTypedText += linkTargetText[linkCurrentCharIndex]; if (tryAgainLink) tryAgainLink.textContent = linkTypedText; linkCurrentCharIndex++; if (linkCurrentCharIndex < linkTargetText.length) { linkNextTypeTime = now + LINK_TYPE_SPEED_MIN + Math.random() * (LINK_TYPE_SPEED_MAX - LINK_TYPE_SPEED_MIN); } else { isLinkTyping = false; linkFinishTypingTime = now; linkStartBounceTime = linkFinishTypingTime + LINK_START_BOUNCING_DELAY; linkStartFastBounceTime = linkStartBounceTime + LINK_START_FAST_BOUNCE_DELAY; /* startLinkCursorBlinking(); */ console.log("   jackout: Link typing complete. Bounce scheduled."); } } else { isLinkTyping = false; } } updateLinkMovement(now); } } catch (e) { console.error("jackout: animate() - CRITICAL ERROR:", e); if (e.stack) console.error(e.stack); try { ctx.fillStyle='darkred';ctx.fillRect(0,0,width,height); ctx.fillStyle='white'; ctx.font='16px monospace'; ctx.textAlign='center'; ctx.fillText("ANIMATION ERROR", width/2, height/2-10); ctx.fillText(e.message || 'Unknown Error', width / 2, height / 2 + 10); } catch {} if (animationFrameId) cancelAnimationFrame(animationFrameId); return; } animationFrameId = requestAnimationFrame(animate); }

    // ===============================================================
    // SECTION: Event Listeners
    // ===============================================================
    let resizeTimer; function handleResize() { console.log(">>> jackout: Event: Window resize."); clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { console.log("   jackout: Resizing canvas..."); if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; console.log("   jackout: Animation stopped for resize."); } /* stopLinkCursorBlinking(); */ try { width = window.innerWidth; height = window.innerHeight; if (width <= 0 || height <= 0) { width = 300; height = 300; } canvas.width = width; canvas.height = height; const avgFontSize = (MIN_FONT_SIZE + MAX_FONT_SIZE) / 2; globalApproxColumnWidth = avgFontSize * WIN_RAIN_COLUMN_MULTIPLIER; globalNumColumns = globalApproxColumnWidth > 0 ? Math.ceil(width / globalApproxColumnWidth) : 0; console.log(`   jackout: resize - Recalculated ${globalNumColumns} columns`); streams = {}; rainStreamCount = 0; if (linkShown && tryAgainLink) { setTimeout(initializeLinkPosition, 50); } if (!animationFrameId) { animationFrameId = requestAnimationFrame(animate); console.log("   jackout: Animation restarted after resize."); } } catch (resizeError) { console.error("   jackout: Error during resize handling:", resizeError); } }, 250); }
    function handleIntroClick(event) { console.log(">>> handleIntroClick function CALLED <<<"); console.log(`   Current state: ${currentState}, Trigger flag: ${triggerRainStart}`); if (currentState !== STATE_INTRO || triggerRainStart) { console.log("   Intro click ignored (wrong state or already triggered)."); return; } console.log("   Setting triggerRainStart flag to true."); triggerRainStart = true; if (introCursor) { introCursor.removeEventListener('click', handleIntroClick); console.log("   Removed intro click listener from #introCursor."); } introClickListenerAdded = false; }
    function addEventListeners() { console.log("   jackout: Adding event listeners..."); window.addEventListener('resize', handleResize); if (introCursor && !introClickListenerAdded) { introCursor.addEventListener('click', handleIntroClick); introClickListenerAdded = true; console.log("   jackout: Added intro click listener to #introCursor."); } else if (!introCursor) { console.error("   jackout: Could not find #introCursor to attach listener!"); } else { console.log("   jackout: Intro click listener already added."); } }

    // ===============================================================
    // SECTION: Initial Start
    // ===============================================================
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', setup); }
    else { setup(); }

    console.log(">>> jackout_script.js END <<<");

})(); // End IIFE