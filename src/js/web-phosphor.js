window.onload = function WebPhosphor () {
    var app,
        crtContainer,
        cursor,
        crtContainerFader,
        cursorFader,
        tickers = [],

        options = {
            'cursorBlinkingSpeed': 80,  // ticks
            'crtFadeDuration': 10  // ticks
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

            return app;
        },

        registerToLoop = function registerToLoop (callback) {
            tickers.push(callback);
        },

        runTicks = function runTicks (delta) {
            tickers.forEach(function runTicker (nextTick) {
                nextTick(delta);
            });
        },

        CrtFader = function CrtFader (obj, onDone) {
            var enabled = false,
                time = 0,
                fadeDuration = options.crtFadeDuration,

                startFading = function start () {
                    enabled = true;
                },

                resetFade = function reset () {
                    time = 0;
                    obj.alpha = 1;
                },

                nextTick = function nextTick (delta) {
                    if (!enabled) {
                        return;
                    }

                    time += delta;
                    obj.alpha = 1 - (time / fadeDuration);

                    if (time >= fadeDuration) {
                        enabled = false;
                        if (onDone) {
                            onDone();
                        }
                    }
                };

            registerToLoop(nextTick);
            return {
                'startFading': startFading,
                'resetFade': resetFade
            };
        },

        FlipFlop = function FlipFlop (stateTime, onUp, onDown) {
            var state = false,
                time = 0,

                nextTick = function nextTick (delta) {
                    time += delta;
                    if (time < stateTime) {
                        return;
                    }

                    time = 0;
                    state = !state;
                    if (state) {
                        onUp();
                    } else {
                        onDown();
                    }
                };

            registerToLoop(nextTick);
            return {};
        },

        drawLoop = function drawLoop (delta) {
            runTicks(delta);
        },

        main = function main () {


            app = initApp();

            crtContainer = new PIXI.Container();

            app.stage.addChild(crtContainer);
            crtContainerFader = new CrtFader(crtContainer, function () {
                crtContainer.removeChildren();
                crtContainerFader.resetFade();
            });

            cursor = new PIXI.Text('█', consoleStyle);
            cursor.position.set(0, 0);
            app.stage.addChild(cursor);
            cursorFader = new CrtFader(cursor);
            new FlipFlop(options.cursorBlinkingSpeed, function showCursor () {
                cursorFader.resetFade();
            }, function hideCursor () {
                cursorFader.startFading();
            });

            app.ticker.speed = 2;
            app.ticker.add(drawLoop);
        };


    main();
};
