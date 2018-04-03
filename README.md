# Web Phosphor
JS rewrite of Phosphor Xscreensaver (with [PixiJS](http://www.pixijs.com/)).

![screenshot1](docs/screenshots/animation1.gif)

Check this on [CodePen](https://codepen.io/andras-tim/pen/JLZaNa/).


## Usage

At first, check the [`src/index.html`](src/index.html) file. This loads online resources and then start the
**WebPhosphor** like this:

``` js
new WebPhosphor(function getTextCallback() {
    return 'Coffee is the most important meal of the day';
});
```


## Offline usage

This stuff has been prepared for offline environment too!

For this you should run an `npm install` and after that you will
find the offline bundle in the `build` directory.
