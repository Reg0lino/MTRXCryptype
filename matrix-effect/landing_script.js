// --- START OF FILE landing_script.js ---
// landing_script.js
(function() {
    // v23 - Fixed Line 1 typing/sound. Using specific sound.
    console.log("Landing page script running (v23)...");

    // --- Element References --- (Unchanged)
    const initialCursorElement = document.getElementById('initial-cursor'); /*...*/ const bodyElement = document.body;
    const line1Element = document.getElementById('line1'); const line2Container = document.getElementById('line2-container'); const line2Element = document.getElementById('line2'); const cursorElement = document.getElementById('cursor'); const centerCursorElement = document.getElementById('center-cursor'); const line3Container = document.getElementById('line3-container'); const line3Element = document.getElementById('line3'); const transitionOverlay = document.getElementById('transition-overlay'); const glitchOverlayElement = document.getElementById('glitch-overlay');


    // --- Text Content & Navigation --- (Unchanged)
    const line1Text = "AM I ALONE?"; const line2Text = "YOU ARE NOT ALONE"; const line3Text = "FOLLOW THE WHITE RABBIT"; const navigationTarget = "matrixfeedinterface.html";

    // --- Timing Constants --- (Unchanged)
    const initialBlinkInterval = 550; const slowTypeMinInterval = 150; const slowTypeMaxInterval = 400; const fastTypeInterval = 55; const line2StartDelay = 1500; const line2BlinkStartDelay = 500; const line2BlinkDuration = 4000; const line2BlinkInterval = 600; const centerCursorStartDelay = 100; const centerCursorBlinkDuration = 4000; const centerCursorBlinkInterval = 550; const line3StartDelay = 500; const fadeDuration = 500; const initialGlitchDuration = 600; const hoverGlitchDuration = 800; const clickGlitchDuration = 600; const flashInterval = 90; const flashCount = 2; const finalFadeDelay = 300; const glitchInterval = 50; const screenGlitchInterval = 60; const STRING_SOUND_DELAY = 75;


    // --- State Variables --- (Unchanged)
    const glitchChars = ['█', '▓', '▒', '░', '_', '^', '~', '*', ';', ':', '|', '/', '\\', '#', '$', '%', '&', '?', '!', '@'];
    let glitchIntervalId = null; let glitchTimeoutId = null; let screenGlitchIntervalId = null; let initialBlinkIntervalId = null; let line2BlinkIntervalId = null; let line2BlinkTimeoutId = null; let centerBlinkIntervalId = null; let centerBlinkTimeoutId = null; let originalLine3Text = ''; let isClickTransitionActive = false; let isHoverGlitching = false; let sequenceHasStarted = false;


    // --- Audio Setup --- (ADDED typechar2 as a distinct key)
    const audioFiles = {
        // ** NEW KEY for specific sound **
        typeCharSpecific: "SFX/typechar2.mp3", // For Line 1
        typestring2: "SFX/typestring2.mp3", // For Line 2 start
        line2Blink: "SFX/typechar3.mp3",    // For Line 2 blink
        centerBlink: "SFX/typechar2.mp3",   // For Center blink
        typestring1: "SFX/typestring1.mp3", // For Line 3 start
        glitch1: "SFX/glitch1.mp3",         // For Line 3 start
        glitch2: "SFX/glitch2.mp3",         // For Line 3 hover
        clickTransition: "SFX/loudglitch.mp3", // For Line 3 click
        // Removed typeCharLine1 as it's no longer used for random selection
    };
    const audioElements = {}; // To hold loaded elements

    // --- Audio Functions (loadAudio, playSound, playSoundInternal) ---
    // ...(Keep these functions exactly as in v22, they handle single/array keys fine)...
    function loadAudio() { console.log("AUDIO: Loading..."); for (const key in audioFiles) { if (Array.isArray(audioFiles[key])) { audioElements[key] = []; audioFiles[key].forEach((src, index) => { try { const audio = new Audio(src); audio.preload = "auto"; if (key === 'typeCharLine1') audio.volume = 0.6; if (key === 'line2Blink' || key === 'centerBlink') audio.volume = 0.5; audioElements[key].push(audio); } catch (e) { console.error(`AUDIO: Error loading ${key}[${index}] (${src}):`, e); } }); } else { try { const audio = new Audio(audioFiles[key]); audio.preload = "auto"; if (key === 'clickTransition') audio.volume = 0.8; if (key === 'typestring1' || key === 'typestring2' || key === 'typeCharSpecific') audio.volume = 0.7; if (key.includes('glitch')) audio.volume = 0.7; audioElements[key] = audio; } catch (e) { console.error(`AUDIO: Error loading ${key} (${audioFiles[key]}):`, e); } } } console.log("AUDIO: Loading attempted."); }
    function playSound(soundNameOrArrayKey) { let audioToPlay = null; if (Array.isArray(audioElements[soundNameOrArrayKey])) { const soundArray = audioElements[soundNameOrArrayKey]; if (soundArray.length > 0) { audioToPlay = soundArray[Math.floor(Math.random() * soundArray.length)]; } } else { audioToPlay = audioElements[soundNameOrArrayKey]; } if (audioToPlay && audioToPlay instanceof HTMLAudioElement) { if (audioToPlay.context && audioToPlay.context.state === 'suspended') { audioToPlay.context.resume().then(() => { playSoundInternal(audioToPlay); }).catch(e => {}); } else { playSoundInternal(audioToPlay); } } else { console.warn(`AUDIO: Sound not found: ${soundNameOrArrayKey}`) } }
    function playSoundInternal(audio) { try { audio.currentTime = 0; const playPromise = audio.play(); if (playPromise !== undefined) { playPromise.catch(error => { if (error.name !== 'NotAllowedError') { console.error(`AUDIO: Playback error for ${audio.src}:`, error); } }); } } catch (e) { console.error(`AUDIO: Exception during playback attempt for ${audio.src}:`, e); } }


    // --- Helper Functions ---
    // ...(Keep sleep, checkElement, setElementVisibility, hideElementInstantly)...
    // ...(typeWriter unchanged from v22 - logic is correct, just need to pass the right sound key)...
    // ...(glitchTextFn, startGlitch, stopGlitch unchanged)...
    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    function checkElement(element, name) { if (!element) { console.error(`${name} element not found! Check ID.`); return false; } if (typeof element.style === 'undefined') { console.error(`${name} exists but has no style?`, element); return false; } return true; }
    async function setElementVisibility(element, visible, isInstant = false) { const elementName = element ? (element.id || `(${element.tagName})`) : 'null'; if (!checkElement(element, `setElementVisibility(${elementName})`)) return; const duration = isInstant ? 0 : fadeDuration; element.style.transition = `opacity ${duration}ms ease-in-out`; if (visible) { element.classList.remove('hidden'); void element.offsetWidth; element.style.opacity = '1'; } else { element.style.opacity = '0'; await sleep(duration); element.classList.add('hidden'); } }
    function hideElementInstantly(element) { const elementName = element ? (element.id || `(${element.tagName})`) : 'null'; if (!checkElement(element, `hideElementInstantly(${elementName})`)) return; element.style.transition = 'none'; element.style.opacity = '0'; element.classList.add('hidden'); setTimeout(() => { if (element && element.style) element.style.transition = ''; }, 50); }
    function typeWriter(element, text, speedParam, isConstantSpeed, typeSoundKey = null) { return new Promise(resolve => { const elementName = element ? (element.id || `(${element.tagName})`) : 'null'; if (!checkElement(element, `typeWriter(${elementName})`)) { resolve(); return; } let i = 0; element.textContent = ''; element.style.opacity = '1'; function typeChar() { try { if (i < text.length) { element.textContent += text.charAt(i); if (typeSoundKey) { playSound(typeSoundKey); } i++; let interval = isConstantSpeed ? speedParam : speedParam + Math.random() * (slowTypeMaxInterval - slowTypeMinInterval); setTimeout(typeChar, Math.max(10, interval)); } else { resolve(); } } catch (error) { console.error(`Error during typeChar for ${elementName}:`, error); resolve(); } } setTimeout(typeChar, 50); }); }
    function glitchTextFn(text, intensity = 0.4, customGlitchChars = glitchChars) { if (typeof text !== 'string' || text.length === 0) return ''; const len = customGlitchChars.length; if (len === 0) return text; return text.split('').map(char => (Math.random() < intensity && char !== ' ' && char !== '\n') ? customGlitchChars[Math.floor(Math.random() * len)] : char).join(''); }
    function startGlitch(element, baseText, duration, intensity = 0.4) { if (!element || isClickTransitionActive) return; stopGlitch(element); element.classList.add('glitching'); originalLine3Text = baseText; glitchIntervalId = setInterval(() => { if (element && element.isConnected && !isClickTransitionActive) { try{ element.textContent = glitchTextFn(originalLine3Text, intensity); } catch(e){} } else { stopGlitch(element); } }, glitchInterval); glitchTimeoutId = setTimeout(() => { stopGlitch(element); }, duration); }
    function stopGlitch(element) { if (glitchIntervalId) { clearInterval(glitchIntervalId); glitchIntervalId = null; } if (glitchTimeoutId) { clearTimeout(glitchTimeoutId); glitchTimeoutId = null; } if (element && element.isConnected) { if (originalLine3Text && !isClickTransitionActive) element.textContent = originalLine3Text; element.classList.remove('glitching'); } }


    // --- Cursor Blinking Control --- (Unchanged)
    // ...(Keep startBlinking/stopBlinking)...
    function startBlinking(cursorEl, interval, soundKey = null) { stopBlinking(cursorEl); if (!cursorEl || !cursorEl.isConnected) return null; let isVisible = true; cursorEl.style.opacity = '1'; const blinker = () => { if (!cursorEl || !cursorEl.isConnected || (cursorEl.id === 'initial-cursor' && initialBlinkIntervalId !== intervalId) || (cursorEl.id === 'cursor' && line2BlinkIntervalId !== intervalId) || (cursorEl.id === 'center-cursor' && centerBlinkIntervalId !== intervalId) ) { stopBlinking(cursorEl); return; } isVisible = !isVisible; cursorEl.style.opacity = isVisible ? '1' : '0'; if (isVisible && soundKey) { playSound(soundKey); } }; const intervalId = setInterval(blinker, interval); if (cursorEl.id === 'initial-cursor') initialBlinkIntervalId = intervalId; else if (cursorEl.id === 'cursor') line2BlinkIntervalId = intervalId; else if (cursorEl.id === 'center-cursor') centerBlinkIntervalId = intervalId; return intervalId; }
    function stopBlinking(cursorEl) { let intervalIdToStop = null; if (!cursorEl) return; if (cursorEl.id === 'initial-cursor') { intervalIdToStop = initialBlinkIntervalId; initialBlinkIntervalId = null; } else if (cursorEl.id === 'cursor') { intervalIdToStop = line2BlinkIntervalId; line2BlinkIntervalId = null; if (line2BlinkTimeoutId) { clearTimeout(line2BlinkTimeoutId); line2BlinkTimeoutId = null;} } else if (cursorEl.id === 'center-cursor') { intervalIdToStop = centerBlinkIntervalId; centerBlinkIntervalId = null; if (centerBlinkTimeoutId) { clearTimeout(centerBlinkTimeoutId); centerBlinkTimeoutId = null;} } if (intervalIdToStop) { clearInterval(intervalIdToStop); } if (cursorEl.isConnected) { cursorEl.style.opacity = '0'; } }


    // --- Screen Glitch Functions --- (Unchanged)
    // ...(Keep generateScreenGlitchContent/startScreenGlitch/stopScreenGlitch)...
    function generateScreenGlitchContent(intensity = 0.05) { if (!glitchOverlayElement) return; const cols = Math.floor(window.innerWidth / 7); const rows = Math.floor(window.innerHeight / 9); const numChars = cols * rows; let glitchContent = ''; const glitchLen = glitchChars.length; for (let i = 0; i < numChars; i++) { if (Math.random() < intensity) { glitchContent += glitchChars[Math.floor(Math.random() * glitchLen)]; } else { glitchContent += ' '; } if (i > 0 && i % cols === 0 && Math.random() < 0.05) { glitchContent += '\n'; } } try{ glitchOverlayElement.textContent = glitchContent; } catch(e) {} }
    function startScreenGlitch() { if (!glitchOverlayElement || screenGlitchIntervalId || isClickTransitionActive) return; glitchOverlayElement.classList.remove('hidden'); glitchOverlayElement.style.opacity = '1'; glitchOverlayElement.classList.add('active'); screenGlitchIntervalId = setInterval(() => { generateScreenGlitchContent(0.02 + Math.random() * 0.08); }, screenGlitchInterval); }
    function stopScreenGlitch() { if (screenGlitchIntervalId) { clearInterval(screenGlitchIntervalId); screenGlitchIntervalId = null; } if (glitchOverlayElement) { glitchOverlayElement.style.opacity = '0'; setTimeout(() => { if (!screenGlitchIntervalId) { glitchOverlayElement.classList.add('hidden'); glitchOverlayElement.classList.remove('active'); glitchOverlayElement.textContent = ''; } }, 200); } }


    // --- Fullscreen Attempt --- (Unchanged)
    // ...(Keep requestFullscreen)...
    function requestFullscreen() { const elem = document.documentElement; if (elem.requestFullscreen) { elem.requestFullscreen().catch(err => {}); } else if (elem.webkitRequestFullscreen) { elem.webkitRequestFullscreen().catch(err => {}); } else if (elem.msRequestFullscreen) { elem.msRequestFullscreen().catch(err => {}); } else { /* console.warn("Fullscreen API not supported."); */ } }


    // --- Event Handlers for Line 3 --- (Unchanged)
    // ...(Keep handleLine3MouseEnter/Leave/Click)...
     function handleLine3MouseEnter() { if (!isClickTransitionActive && line3Element && line3Element.classList.contains('clickable')) { isHoverGlitching = true; playSound(Math.random() < 0.5 ? 'glitch1' : 'glitch2'); startGlitch(line3Element, line3Text, hoverGlitchDuration, 0.6); startScreenGlitch(); } }
     function handleLine3MouseLeave() { if (!isClickTransitionActive && line3Element && line3Element.classList.contains('clickable')) { isHoverGlitching = false; stopGlitch(line3Element); stopScreenGlitch(); } }
     async function handleLine3Click() { if (isClickTransitionActive || !line3Element || !line3Element.classList.contains('clickable')) { return; } isHoverGlitching = false; stopScreenGlitch(); stopGlitch(line3Element); isClickTransitionActive = true; line3Element.classList.remove('clickable'); line3Element.removeEventListener('mouseenter', handleLine3MouseEnter); line3Element.removeEventListener('mouseleave', handleLine3MouseLeave); line3Element.removeEventListener('click', handleLine3Click); playSound('clickTransition'); requestFullscreen(); try { startGlitch(line3Element, line3Text, clickGlitchDuration, 0.7); await sleep(clickGlitchDuration / 2); line3Element.classList.add('zooming'); await sleep(150); if (checkElement(transitionOverlay, "handleLine3Click (overlay)")) { transitionOverlay.style.transition = `opacity ${flashInterval / 2}ms linear`; await setElementVisibility(transitionOverlay, true, true); for (let i = 0; i < flashCount; i++) { transitionOverlay.style.opacity = '1'; await sleep(flashInterval); transitionOverlay.style.opacity = '0'; await sleep(flashInterval * 0.5); } transitionOverlay.style.opacity = '1'; await sleep(50); } else { console.warn("Transition overlay element not found! Skipping flashes."); await sleep(flashInterval * flashCount * 1.5); } if (checkElement(transitionOverlay, "handleLine3Click (overlay solid)")) { transitionOverlay.style.transition = `opacity ${finalFadeDelay}ms ease-in-out`; } await sleep(finalFadeDelay); if (typeof navigationTarget === 'string' && navigationTarget.endsWith('.html')) { window.location.href = navigationTarget; } else { console.error(`Navigation aborted: Invalid target: ${navigationTarget}`); if (line3Element) line3Element.textContent = "ERROR - BAD LINK"; isClickTransitionActive = false; } } catch (error) { console.error("ERROR during click transition:", error); if (line3Element) line3Element.textContent = "ERROR - NAV FAILED"; isClickTransitionActive = false; } }


    // --- Initial Click Handler --- (Play specific sound on click)
    function handleInitialClick(event) {
        if (sequenceHasStarted) { console.log("INIT: Click detected, but sequence already started. Ignoring."); return; }
        console.log("INIT: Initial click detected! Starting sequence...");
        sequenceHasStarted = true;
        bodyElement.removeEventListener('click', handleInitialClick);
        bodyElement.style.cursor = 'default';
        if (initialBlinkIntervalId) { stopBlinking(initialCursorElement); }
        hideElementInstantly(initialCursorElement);
        // Play the specific sound designated for Line 1 typing immediately
        playSound('typeCharSpecific');
        runSequence();
    }


    // --- Main Animation Sequence (runs *after* click) ---
    async function runSequence() {
        console.log("SEQUENCE: runSequence starting NOW.");
        const sequenceElements = [line1Element, line2Container, line2Element, cursorElement, centerCursorElement, line3Container, line3Element, transitionOverlay, glitchOverlayElement];
        const sequenceElementNames = ['line1', 'line2Container', 'line2', 'cursor', 'centerCursor', 'line3Container', 'line3', 'transitionOverlay', 'glitchOverlay'];
        if (!sequenceElements.every((el, i) => checkElement(el, `Sequence Check ${sequenceElementNames[i]}`))) {
             bodyElement.innerHTML = `<div style='color:red;'>ERROR: Required page element(s) missing. Check console (F12).</div>`; return;
        }

        try {
            console.log("SEQUENCE: Line 1 Start...");
            await setElementVisibility(line1Element, true, true);
            // --- Line 1: Type with specific char sound & variable speed ---
            console.log("AUDIO: Using typeCharSpecific for Line 1");
            await typeWriter(line1Element, line1Text, slowTypeMinInterval, false, 'typeCharSpecific'); // Use the specific sound key
            console.log("SEQUENCE: Line 1 Complete.");

            // --- Rest of sequence unchanged from v22 ---
            await sleep(line2StartDelay);
            console.log("SEQUENCE: Line 2 Start...");
            await setElementVisibility(line2Container, true, true);
            console.log("AUDIO: Triggering typestring2");
            playSound('typestring2'); // Play sound
            await sleep(STRING_SOUND_DELAY); // Wait
            await typeWriter(line2Element, line2Text, fastTypeInterval, true, null); // Type silently
            await setElementVisibility(cursorElement, true, true);
            console.log("SEQUENCE: Line 2 Complete. Starting blink...");
            await sleep(line2BlinkStartDelay);
            startBlinking(cursorElement, line2BlinkInterval, 'line2Blink'); // Uses typechar3
            line2BlinkTimeoutId = setTimeout(() => {
                if (!sequenceHasStarted) return;
                stopBlinking(cursorElement); console.log("SEQUENCE: Line 2 Blinking Complete.");
                console.log("SEQUENCE: Hiding Lines 1 & 2...");
                hideElementInstantly(line1Element); hideElementInstantly(line2Container);
                console.log("SEQUENCE: Lines 1 & 2 Hidden.");
                startCenterCursorSequence();
             }, line2BlinkDuration);

        } catch (error) { console.error("CRITICAL ERROR in main sequence:", error); bodyElement.innerHTML = `<div style='color:red;'>Sequence Error: ${error.message}. Check console (F12).</div>`; }
    }

     // --- Chained Sequences ---
     async function startCenterCursorSequence() {
         // ...(Unchanged)...
         if (!sequenceHasStarted) return; try { await sleep(centerCursorStartDelay); await setElementVisibility(centerCursorElement, true); startBlinking(centerCursorElement, centerCursorBlinkInterval, 'centerBlink'); centerBlinkTimeoutId = setTimeout(async () => { if (!sequenceHasStarted) return; stopBlinking(centerCursorElement); await setElementVisibility(centerCursorElement, false); await startLine3Sequence(); }, centerCursorBlinkDuration); } catch (error) { console.error("ERROR in center cursor sequence:", error); }
     }
     async function startLine3Sequence() {
          // ...(Unchanged)...
          if (!sequenceHasStarted) return; try { await sleep(line3StartDelay); console.log("SEQUENCE: Line 3 Start..."); await setElementVisibility(line3Container, true); console.log("AUDIO: Triggering typestring1 & glitch1"); playSound('typestring1'); playSound('glitch1'); await sleep(STRING_SOUND_DELAY); await typeWriter(line3Element, line3Text, fastTypeInterval, true, null); console.log("SEQUENCE: Line 3 Complete. Initial Glitching..."); startGlitch(line3Element, line3Text, initialGlitchDuration); await sleep(initialGlitchDuration + 100); console.log("SEQUENCE: Line 3 Ready for click."); line3Element.classList.add('clickable'); line3Element.addEventListener('mouseenter', handleLine3MouseEnter); line3Element.addEventListener('mouseleave', handleLine3MouseLeave); line3Element.addEventListener('click', handleLine3Click); console.log("DEBUG: Listeners added. Sequence setup finished."); } catch (error) { console.error("ERROR in line 3 sequence:", error); }
     }

    // --- Initialization (On DOM Load) --- (Unchanged)
    // ...(Keep DOMContentLoaded handler)...
    console.log("INIT: Adding DOMContentLoaded listener.");
    document.addEventListener('DOMContentLoaded', () => { console.log("INIT: DOMContentLoaded event fired."); if (!checkElement(initialCursorElement, "Init Check: initialCursor") || !checkElement(bodyElement, "Init Check: body")) { document.body.innerHTML = "<div style='color:red;'>ERROR: Initial page elements missing.</div>"; return; } const elementsToHideIds = ['line1', 'line2-container', 'cursor', 'center-cursor', 'line3-container', 'transition-overlay', 'glitch-overlay']; elementsToHideIds.forEach(id => { const el = document.getElementById(id); if(el) hideElementInstantly(el); else console.warn(`INIT: Element ${id} not found.`); }); if(line3Element) line3Element.textContent = ''; loadAudio(); setElementVisibility(initialCursorElement, true, true); startBlinking(initialCursorElement, initialBlinkInterval, null); bodyElement.addEventListener('click', handleInitialClick); bodyElement.style.cursor = 'pointer'; console.log("INIT: Setup complete. Waiting for click..."); });


    // --- ESC Key Listener --- (Unchanged)
    // ...(Keep ESC listener)...
     window.addEventListener('keydown', (event) => { if (event.key === 'Escape') { console.log(">>> Event: ESC key pressed in Landing page."); } });

})(); // End IIFE
// --- END OF FILE landing_script.js 
