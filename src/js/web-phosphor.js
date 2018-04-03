// eslint-disable-next-line no-unused-vars
var WebPhosphor = function WebPhosphor (getTextCallback) {
    var app,
        terminal,
        readingTimer,

        options = {
            'cursorBlinkingSpeed': 40,  // ticks
            'crtFadeDuration': 5,  // ticks
            'textTypingSpeed': 1,  // ticks
            'textShowDuration': 250  // ticks
        },

        consoleStyle = new PIXI.TextStyle({
            'fontFamily': 'Source Code Pro, monospace',
            'fontSize': 32,
            'fill': '#00ff00'
        }),

        initApp = function initApp () {
            var app = new PIXI.Application({
                    'antialias': true,
                    'transparent': false,
                    'resolution': 1
                }),

                onParentResize = function onParentResize () {
                    app.renderer.resize(window.innerWidth, window.innerHeight);
                };

            app.renderer.backgroundColor = '#000';
            app.renderer.view.style.position = 'absolute';
            app.renderer.view.style.display = 'block';
            app.renderer.autoResize = true;

            onParentResize();
            window.onresize = onParentResize;
            document.body.appendChild(app.view);

            app.ticker.speed = 1;

            return app;
        },

        Timer = function Timer (sleepTime, onDone, onTick) {
            var enabled = false,
                time = 0,

                enable = function enable () {
                    if (enabled) {
                        return;
                    }
                    app.ticker.add(nextTick);
                    enabled = true;
                },

                disable = function disable () {
                    if (!enabled) {
                        return;
                    }
                    app.ticker.remove(nextTick);
                    enabled = false;
                },

                reset = function reset () {
                    time = 0;
                },

                nextTick = function nextTick (delta) {
                    if (!enabled) {
                        return;
                    }

                    time += delta;
                    if (onTick) {
                        onTick(time, sleepTime);
                    }

                    if (time < sleepTime) {
                        return;
                    }

                    time -= sleepTime;
                    if (onDone) {
                        onDone();
                    }
                };

            return {
                'enable': enable,
                'disable': disable,
                'reset': reset
            };
        },

        CrtFader = function CrtFader (obj, onDone) {
            var timer,

                startFading = function startFading () {
                    timer.enable();
                },

                resetFade = function resetFade () {
                    timer.reset();
                    obj.alpha = 1;
                },

                onFadeDone = function onFadeDone () {
                    timer.disable();
                    if (onDone) {
                        onDone();
                    }
                },

                onFadingTick = function onFadingTick (time, fadeDuration) {
                    obj.alpha = 1 - (time / fadeDuration);
                };

            timer = new Timer(options.crtFadeDuration, onFadeDone, onFadingTick);

            return {
                'startFading': startFading,
                'resetFade': resetFade
            };
        },

        FlipFlop = function FlipFlop (stateTime, onUp, onDown) {
            var timer,
                state = false,

                start = function start () {
                    timer.enable();
                },

                stop = function stop () {
                    timer.disable();
                },

                setUp = function setUp () {
                    timer.reset();
                    state = true;
                    onUp();
                },

                setDown = function setDown () {
                    timer.reset();
                    state = false;
                    onDown();
                },

                changeState = function changeState () {
                    if (state) {
                        setDown();
                    } else {
                        setUp();
                    }
                };

            timer = new Timer(stateTime, changeState);

            return {
                'start': start,
                'stop': stop,
                'forceUp': setUp,
                'forceDown': setDown
            };
        },

        CrtTerminal = function CrtTerminal (terminalX, terminalY) {
            var textBuffer = '',
                textIndex = 0,
                currentLine = null,
                currentLineText = '',
                onTypingDone,
                onClearScreenDone,
                crtContainer,
                crtContainerFader,
                cursor,
                cursorFader,
                cursorBlinker,
                typingTimer,

                moveCursor = function moveCursor () {
                    cursor.position.set(
                        terminalX + (currentLineText ? currentLine.width : 0),
                        currentLine.y
                    );
                    cursorBlinker.forceUp();
                },

                newLine = function newLine () {
                    var y = currentLine ? currentLine.y + currentLine.height : terminalY;

                    currentLineText = '';
                    currentLine = new PIXI.Text(currentLineText, consoleStyle);
                    currentLine.position.set(terminalX, y);
                    crtContainer.addChild(currentLine);
                    moveCursor();
                },

                typeText = function typeText (text, onDone) {
                    textBuffer = text;
                    textIndex = 0;
                    onTypingDone = onDone;
                    typingTimer.enable();
                },

                typeChar = function typeChar (char) {
                    if (char !== '\n') {
                        currentLineText += char;
                        currentLine.text = currentLineText;
                        moveCursor();
                    } else {
                        newLine();
                    }
                },

                typeNextChar = function typeNextChar () {
                    if (!textBuffer || textIndex >= textBuffer.length) {
                        typingTimer.disable();
                        onTypingDone();
                        return;
                    }

                    typeChar(textBuffer.substring(textIndex, textIndex + 1));
                    textIndex++;
                },

                clearScreen = function clearScreen (onDone) {
                    onClearScreenDone = onDone;
                    crtContainerFader.startFading();
                };

            crtContainer = new PIXI.Container();
            app.stage.addChild(crtContainer);
            crtContainerFader = new CrtFader(crtContainer, function resetContainer () {
                crtContainer.removeChildren();
                crtContainerFader.resetFade();
                currentLine = null;
                newLine();
                onClearScreenDone();
            });

            cursor = new PIXI.Text('█', consoleStyle);
            app.stage.addChild(cursor);
            cursorFader = new CrtFader(cursor);
            cursorBlinker = new FlipFlop(options.cursorBlinkingSpeed, function showCursor () {
                cursorFader.resetFade();
            }, function hideCursor () {
                cursorFader.startFading();
            });
            cursorBlinker.start();

            typingTimer = new Timer(options.textTypingSpeed, function onNextChar () {
                typeNextChar();
            });

            newLine();

            return {
                'typeText': typeText,
                'clearScreen': clearScreen
            };
        },

        typeAText = function typeAText () {
            var text = getTextCallback();
            terminal.typeText(text, readingTimer.enable);
        },

        onReadingTimerDone = function onReadingTimerDone () {
            readingTimer.disable();
            terminal.clearScreen(function onClearScreenDone () {
                typeAText();
            });
        },

        main = function main () {
            app = initApp();
            document.fonts.load(consoleStyle.toFontString()).then(function main () {
                terminal = new CrtTerminal(20, 0);

                readingTimer = new Timer(options.textShowDuration, onReadingTimerDone);
                typeAText();
            });
        };


    window.onload = main;
};
