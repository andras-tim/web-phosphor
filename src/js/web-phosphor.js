var webPhosphor = {
    'print': function print(text) {
        window.onload = function main () {
            var app = new PIXI.Application({
                'antialias': true,
                'transparent': false,
                'resolution': 1
            });

            var onResize = function onResize() {
                app.renderer.resize(window.innerWidth, window.innerHeight);
            };
            window.onresize = onResize;

            app.renderer.backgroundColor = '#000';

            app.renderer.view.style.position = 'absolute';
            app.renderer.view.style.display = 'block';
            app.renderer.autoResize = true;
            onResize();

            document.body.appendChild(app.view);

            var style = new PIXI.TextStyle({
                'fontFamily': 'Source Code Pro, monospace',
                'fontSize': 32,
                'fill': '#00ff00'
            });

            var positionX = 10;
            var positionY = 10;

            var index = 0;

            var writeTickCount = 0;
            var writeSpeed = 0;

            var cursorTickCount = 0;
            var cursorSpeed = 60;

            var readTickCount = 0;
            var readSpeed = 600;

            var alpha;

            var cursorTicksOfStates = cursorSpeed / 2;
            var cursorTicksOfFade = cursorTicksOfStates / 3;

            var cursorFadingStartTick = cursorTicksOfStates;
            var cursorFadingStopTick = cursorTicksOfStates + cursorTicksOfFade;

            var quip = new PIXI.Container();

            var currentLine = null;

            function newLine(y) {
                var top = (y === undefined)
                    ? currentLine.y + currentLine.height
                    : y;

                currentLine = new PIXI.Text('', style);
                currentLine.position.set(positionX, top);
                quip.addChild(currentLine);
            }

            function resetCursor() {
                cursor.position.set(positionX + currentLine.width, currentLine.y);
                cursorTickCount = 0;
            }

            app.stage.addChild(quip);
            newLine(positionY);

            var cursor = new PIXI.Text('█', style);
            resetCursor();
            app.stage.addChild(cursor);

            function gameLoop(delta) {
                var char;

                if (index < text.length) {

                    if (writeTickCount >= writeSpeed) {
                        char = text.substring(index, index + 1);
                        if (char !== '\n') {
                            currentLine.text += char;
                        } else {
                            newLine();
                        }
                        resetCursor();
                        index++;
                        writeTickCount = 0;
                    }
                    writeTickCount += delta;
                }
                else {
                    if (readTickCount > readSpeed) {
                        quip.removeChildren();
                        newLine(positionY);
                        index = 0;
                        readTickCount = 0;
                    }

                    readTickCount += delta;
                }

                alpha = 1;
                if (cursorTickCount < cursorFadingStartTick) {
                }
                else if (cursorTickCount < cursorFadingStopTick) {
                    alpha = (cursorFadingStopTick - cursorTickCount) / cursorTicksOfFade;
                }
                else if (cursorTickCount < cursorSpeed) {
                    alpha = 0;
                }
                else {
                    cursorTickCount = 0;
                }
                cursor.alpha = alpha;

                cursorTickCount += delta;
            }

            app.ticker.add(gameLoop);
            app.ticker.speed = 2;
        };
    }
};
