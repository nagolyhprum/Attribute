/*global document, window, Matrix, Utility, clearInterval, setInterval*/
(function () { //init C2D
    "use strict";

    function mousemove(e, me) {
        var o, l;
        if (me.livemouse.isdown) {
            me.livemouse.lastlocation = me.livemouse.location;
            me.livemouse.location = Utility.getMouseLocation(e);
            o = Utility.offset(me.livemouse.lastlocation, me.livemouse.location);
            if (me.dragging) { //move the element i am dragging
                l = me.dragging.location;
                l[0] += o[0];
                l[1] += o[1];
            }
            me.livemouse.request.drag = true;
        } else {
            me.livemouse.location = Utility.getMouseLocation(e);
            me.livemouse.request.move = true;
        }
    }

    function mouseupdown(e, d, me) {
        me.livemouse.location = Utility.getMouseLocation(e);
        me.livemouse.isdown = me.livemouse.request.down = ((me.livemouse.request.up = !d) === false);
    }

    function getKey(keycode) {
        switch (keycode) {
        case 32:
            return "space";
        case 37:
            return "left";
        case 38:
            return "up";
        case 39:
            return "right";
        case 40:
            return "down";
        default:
            return String.fromCharCode(keycode);
        }
    }

    function C2D(id, f) {
        var me = this,
            lastTouch;
        me.matrix = Matrix.create();
        me.stages = {};
        me.stack = [];
        me.timeoutID = 0;
        me.timeouts = {};
        me.livemouse = {
            request: {
                down: false,
                up: false,
                move: false,
                drag: false
            },
            downon: [],
            location: [0, 0, 0]
        };
        me.livekeyboard = {};
        Utility.ready(function () {
            var cvs = me.cvs = document.getElementById(id),
                handled = {};
            me.ctx = cvs.getContext("2d");
            cvs.width = 640;
            cvs.height = 480;
            cvs.onblur = function () {
                handled = {};
            };
            cvs.onmouseout = function () {
                me.livemouse.downon = [];
                if (me.livemouse.isdown) {
                    me.livemouse.isdown = false;
                    me.livemouse.request.up = true;
                }
                me.livekeyboard = {};
            };
            cvs.addEventListener('touchmove', cvs.onmousemove = function (e) {
                e.preventDefault();
                if (e.touches) {
                    lastTouch = e = e.touches[0];
                }
                if (e) {
                    mousemove(e, me);
                }
            }, false);
            cvs.addEventListener('touchend', cvs.onmouseup = function (e) {
                e.preventDefault();
                if (e.touches) {
                    e = e.touches[0] || lastTouch;
                }
                if (e) {
                    mouseupdown(e, false, me);
                }
            }, false);
            cvs.addEventListener('touchstart', cvs.onmousedown = function (e) {
                e.preventDefault();
                cvs.focus();
                if (!me.livemouse.isdown) {
                    if (e.touches) {
                        lastTouch = e = e.touches[0];
                    }
                    if (e) {
                        mouseupdown(e, true, me);
                    }
                }
            }, false);
            cvs.onkeydown = function (e) {
                var key = getKey(e.keyCode || e.which);
                if (!handled[key]) {
                    me.livekeyboard[key] = "press";
                    handled[key] = true;
                } else {
                    me.livekeyboard[key] = "down";
                }
                e.preventDefault();
                return false;
            };
            cvs.onkeyup = function (e) {
                var key = getKey(e.keyCode || e.which);
                me.livekeyboard[key] = "up";
                handled[key] = false;
                e.preventDefault();
                return false;
            };
            cvs.innerHTML = "The &lt;CANVAS&gt; element is not supported.";
            cvs.tabIndex = 1;
            if (f && me.isSupported) {
                f(me);
            }
        });
    }
    if (window.CanvasRenderingContext2D) {
        C2D.prototype.strokeText = function () {
            this.ctx.strokeStyle = this.strokeStyle;
            this.ctx.textBaseline = this.textBaseline;
            this.ctx.textAlign = this.textAlign;
            this.ctx.font = this.font;
            this.ctx.strokeText.apply(this.ctx, arguments);
        };

        C2D.prototype.fillText = function () {
            this.ctx.fillStyle = this.fillStyle;
            this.ctx.textBaseline = this.textBaseline;
            this.ctx.textAlign = this.textAlign;
            this.ctx.font = this.font;
            this.ctx.fillText.apply(this.ctx, arguments);
        };

        C2D.prototype.beginPath = function () {
            this.ctx.beginPath();
        };

        C2D.prototype.rect = function (x, y, w, h) {
            this.ctx.rect(x, y, w, h);
        };

        C2D.prototype.clip = function () {
            this.ctx.clip();
        };

        C2D.prototype.closePath = function () {
            this.ctx.closePath();
        };

        C2D.prototype.isPointInPath = function (x, y) {
            return this.ctx.isPointInPath(x, y);
        };

        C2D.prototype.clearRect = function (x, y, w, h) {
            this.ctx.clearRect(x, y, w, h);
        };

        C2D.prototype.drawImage = function () {
            this.ctx.drawImage.apply(this.ctx, arguments);
        };

        C2D.prototype.scale = function (x, y) {
            this.matrix = Matrix.scale(this.matrix, x, y);
            this.ctx.scale(x, y);
        };

        C2D.prototype.translate = function (x, y) {
            this.matrix = Matrix.translate(this.matrix, x, y);
            this.ctx.translate(x, y);
        };

        C2D.prototype.rotate = function (r) {
            this.matrix = Matrix.rotate(this.matrix, r);
            this.ctx.rotate(r);
        };

        C2D.prototype.save = function () {
            this.stack.push(Matrix.clone(this.matrix));
            this.ctx.save();
        };

        C2D.prototype.restore = function () {
            this.matrix = this.stack.pop() || this.matrix;
            this.ctx.restore();
        };

        C2D.prototype.getTransform = function () {
            return Matrix.clone(this.matrix);
        };

        C2D.prototype.setStage = function (name, sprite) {
            this.activeStage = name;
            if (sprite) {
                this.stages[name] = sprite;
            }
            return this;
        };

        C2D.prototype.stop = function () {
            clearInterval(this.interval);
        };

        C2D.prototype.fullScreen = function () {
            var s = this.cvs.style;
            if (s.position !== "absolute") {
                s.position = "absolute";
                s.top = s.left = 0;
                s.width = s.height = "100%";
            } else {
                s.position = s.top = s.left = s.width = s.height = "";
            }
            return this;
        };

        C2D.prototype.cursor = function (p) {
            this.cvs.style.cursor = p;
        };

        C2D.prototype.roundRect = function (x, y, w, h, r) {
            if (w < 2 * r) {
                r = w / 2;
            }
            if (h < 2 * r) {
                r = h / 2;
            }
            var ctx = this.ctx;
            ctx.strokeStyle = this.strokeStyle;
            ctx.fillStyle = this.fillStyle;
            ctx.beginPath();
            ctx.arc(x + r, y + r, r, Math.PI, 3 * Math.PI / 2);
            ctx.lineTo(x + w - r, y);
            ctx.arc(x + w - r, y + r, r, Math.PI * 3 / 2, 0);
            ctx.lineTo(x + w, y + h - r);
            ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
            ctx.lineTo(x + w - r, y + h);
            ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
            ctx.lineTo(x, y + h - r);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        };

        C2D.prototype.start = function () {
            var me = this;
            me.lastTime = new Date();
            me.interval = setInterval(function () {
                //get time passed and call any necessary timeouts
                var time = new Date(), i, to;
                me.currentTime = time - me.lastTime;
                me.lastTime = time;
                for (i in me.timeouts) {
                    if (me.timeouts.hasOwnProperty(i)) {
                        to = me.timeouts[i];
                        if ((to.t -= me.currentTime) <= 0) {
                            to.f();
                            delete me.timeouts[i];
                        }
                    }
                }
                //process mouse
                me.deadmouse = {
                    request: {
                        down: me.livemouse.request.down,
                        up: me.livemouse.request.up,
                        move: me.livemouse.request.move,
                        drag: me.livemouse.request.drag
                    },
                    downon: me.livemouse.downon.slice(0),
                    location: me.livemouse.location.slice(0),
                    lastlocation: (me.livemouse.lastlocation || [0, 0, 1]).slice(0)
                };
                me.deadkeyboard = me.livekeyboard;
                me.livemouse.request = {};
                me.livekeyboard = {};

                me.clearRect(0, 0, me.cvs.width, me.cvs.height);
                me.stages[me.activeStage].collision(null, me).update(me).draw(me);
                //process mouse
                if (me.deadmouse.request.up) {
                    me.deadmouse.downon = [];
                    if (me.dragging) {
                        if (!me.dragging.willStick) {
                            me.dragging.location = me.dragging.oldLocation;
                            if (me.dragging.droppable) {
                                me.dragging.drop(me.dragging.droppable);
                            }
                        }
                        me.dragging = 0;
                    }
                }
                me.livemouse.downon = me.deadmouse.downon;
            }, 1000 / 60);
            return me;
        };

        C2D.prototype.mouse = function () {
            return this.deadmouse;
        };

        C2D.prototype.keyboard = function () {
            return this.deadkeyboard;
        };

        C2D.prototype.screen = function (name) {
            return this.stages[name];
        };

        C2D.prototype.canvas = function () {
            return this.cvs;
        };

        C2D.prototype.getTimeInterval = function () {
            return this.currentTime / 1000; //s
        };

        C2D.prototype.context = function () {
            return this.ctx;
        };

        C2D.prototype.isSupported = true;

        C2D.prototype.find = function (model) {
            var stage = this.stages[this.activeStage], r = stage.find(model, []), f = model;
            if(typeof f !== "function") {
                f = Utility.object_is_model;
            }
            if(f(stage, model)) {
                r.push(stage);
            }
            return r;
        };
        C2D.prototype.measureText = function (text) {
            this.ctx.font = this.font;
            return this.ctx.measureText(text);
        };
        C2D.prototype.setTimeout = function (f, t) {
            this.timeouts[this.timeoutID += 1] = {
                f: f,
                t: t
            };
            return this.timeoutID - 1;
        };
        C2D.prototype.clearTimeout = function (id) {
            delete this.timeouts[id];
        };
    } else {
        C2D.prototype.isSupported = false;
    }
    window.C2D = C2D;
}());