// Elements
const app = document.getElementById('app');
const counterDisplay = document.getElementById('counter-display');
const incrementBtn = document.getElementById('increment-btn');
const decrementBtn = document.getElementById('decrement-btn');
const resetBtn = document.getElementById('reset-btn');
const themeBtn = document.getElementById('theme-btn');
const sunIcon = document.getElementById('theme-icon-sun');
const moonIcon = document.getElementById('theme-icon-moon');
const pipBtn = document.getElementById('pip-btn');

let count = 0;

// Loading the counter from localStorage
if (localStorage.getItem('counter-value')) {
    count = parseInt(localStorage.getItem('counter-value'), 10) || 0;
}
counterDisplay.textContent = count;

// The Counter
function updateCounter(newValue) {
    count = newValue;
    counterDisplay.textContent = count;
    localStorage.setItem('counter-value', count);
    
    // Pulse Animation
    counterDisplay.classList.add('pulse');
    counterDisplay.addEventListener('animationend', () => {
        counterDisplay.classList.remove('pulse');
    }, { once: true });
}

function incrementCounter() {
    updateCounter(count + 1);
}

function decrementCounter() {
    updateCounter(count - 1);
}

function resetCounter() {
    updateCounter(0);
}

// Event Listener
incrementBtn.addEventListener('click', incrementCounter);
decrementBtn.addEventListener('click', decrementCounter);
resetBtn.addEventListener('click', resetCounter);

// Theme
const currentTheme = localStorage.getItem('counter-theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcons(currentTheme);

themeBtn.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('counter-theme', newTheme);
    updateThemeIcons(newTheme);
    updatePiPTheme();
    
});


function updateThemeIcons(theme) {
    if (theme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

// Edit Counter value on double click.
counterDisplay.addEventListener('dblclick', () => {
  const input = document.createElement('input');
  input.type = 'number';
  input.value = count;
  input.classList.add('no-spinner');
  input.style.cssText = `
    overflow: hidden;
    font-size: 25vmin;
    width: 2em;
    text-align: center;
    border: none;
    background: transparent;
    color: var(--color);
    font-family: inherit;
    outline: none;

  `;
  counterDisplay.replaceWith(input);
  input.focus();
  input.select();

  const save = () => {
    let val = parseInt(input.value, 10);
    if (isNaN(val)) val = 0;
    updateCounter(val);
    input.replaceWith(counterDisplay);
  };
  input.addEventListener('blur', save);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
});


//Pip Code
if ("documentPictureInPicture" in window) {
    let pipWindow = null;
    let contentContainer = null;

    async function enterPiP() {
        const content = document.querySelector("#counter-container");
        contentContainer = content.parentNode;
        contentContainer.classList.add("pip");

        const pipOptions = {
            initialAspectRatio: 1,
            lockAspectRatio: true,
            copyStyleSheets: true,
        };

        pipWindow = await documentPictureInPicture.requestWindow(pipOptions);

        // Copy style sheets over from the initial document
        [...document.styleSheets].forEach((styleSheet) => {
            try {
                const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
                const style = document.createElement("style");

                style.textContent = cssRules;
                pipWindow.document.head.appendChild(style);
            } catch (e) {
                const link = document.createElement("link");

                link.rel = "stylesheet";
                link.type = styleSheet.type;
                link.media = styleSheet.media;
                link.href = styleSheet.href;
                pipWindow.document.head.appendChild(link);
            }
        });

        // Add content to the PiP window.
        pipWindow.document.body.append(content);

        const adaptStyle = document.createElement('style');
        adaptStyle.textContent = adaptStyle.textContent = adaptStyle.textContent = adaptStyle.textContent = adaptStyle.textContent = `
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: var(--bgcolor);
        }
        #counter-container {
            width: auto;
            height: auto;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 4vmin;
            user-select: none;
        }
        #bottom-btn {
            flex-basis: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: auto !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
            font-size: inherit !important;
            background: transparent !important;
        }
        #counter-display {
        font-size: 45vmin !important;   /* au lieu de 25vmin */
        }
        .counter-btn {
            width: 18vmin !important;       /* au lieu de 10vmin */
            height: 18vmin !important;
            font-size: 12vmin !important;   /* au lieu de 6vmin */
        }
        #reset-btn {
            width: 18vmin !important;
            height: 18vmin !important;
            font-size: 12vmin !important;
        }
        #counter-container {
            gap: 6vmin !important;          /* espace un peu plus grand */
        }
        `;
        pipWindow.document.head.appendChild(adaptStyle);

        const currentTheme = document.documentElement.getAttribute('data-theme');
        pipWindow.document.documentElement.setAttribute('data-theme', currentTheme);

        // Listen for the PiP closing event to put the content back.
        pipWindow.addEventListener("unload", onLeavePiP.bind(pipWindow), {
            once: true,
        });


    }

    function onLeavePiP() {
        if (this !== pipWindow) {
            return;
        }

        // Add the content back to the main window.
        const content = pipWindow.document.querySelector("#counter-container");
        contentContainer.append(content);
        contentContainer.classList.remove("pip");
        pipWindow.close();

        pipWindow = null;
        contentContainer = null;
    }

    function updatePiPTheme() {
    if (pipWindow) {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        pipWindow.document.documentElement.setAttribute('data-theme', currentTheme);
    }
    }

    document.getElementById("pip-btn").addEventListener("click", () => {
        if (!pipWindow) {
            enterPiP();
        } else {
            onLeavePiP.bind(pipWindow)();
        }
    });
} else {
    alert("Your browser does not support documentPictureInPicture API.");
}