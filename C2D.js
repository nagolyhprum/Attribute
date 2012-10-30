(function() { //init C2D
	function C2D(id, f) {
		var me = this;
		ready(function() {
			var cvs = me.cvs = $(id);
			me.ctx = cvs.getContext("2d");
			me.matrix = M();
			me.screens = {};
			me.stack = [];
			me.livemouse = { 
				request : {
					//down : false,
					//up : false,
					//move : false,
					//drag : false
				},
				downon : [],
				location : [0, 0, 0]
			};
			cvs.width = 640;
			cvs.height = 480;
			cvs.onmouseout = function(e) {
				me.livemouse.downon = [];
				me.livemouse.isdown = false;
				me.livemouse.request.up = true;
			};	
			cvs.onmousemove = cvs.touchmove = function(e) { 
				e.preventDefault(); 
				if(e.touches) { 
					e = e.touches[0]; 
				} 
				mousemove(e, me); 
			};
			cvs.onmouseup = cvs.touchend = function(e) { 
				e.preventDefault(); 
				if(e.touches) { 
					e = e.touches[0]; 
				} 
				mouseupdown(e, false, me); 
			};
			cvs.onmousedown = cvs.touchstart = function(e) { 
				e.preventDefault(); 
				if(e.touches) { 
					e = e.touches[0]; 
				} 
				mouseupdown(e, true, me); 
			};
			cvs.innerHTML = "The &lt;CANVAS&gt; element is not supported.";
			cvs.tabIndex = 1;
			if(f && me.isSupported) {
				f();
			}
		});
	}
	if(window.CanvasRenderingContext2D) {
		C2D.prototype.strokeText = function(t, x, y, w) {
			this.ctx.strokeStyle = this.strokeStyle;
			this.ctx.textBaseline = this.textBaseline;
			this.ctx.textAlign = this.textAlign;
			this.ctx.strokeText(t, x, y, w);
		};
		
		C2D.prototype.fillText = function(t, x, y, w) {
			this.ctx.fillStyle = this.fillStyle;
			this.ctx.textBaseline = this.textBaseline;
			this.ctx.textAlign = this.textAlign;
			this.ctx.fillText(t, x, y, w);
		};
	
		C2D.prototype.beginPath = function() {
			this.ctx.beginPath();
		};
		
		C2D.prototype.rect = function(x, y, w, h) {
			this.ctx.rect(x, y, w, h);
		};
		
		C2D.prototype.clip = function() {
			this.ctx.clip();
		};
		
		C2D.prototype.closePath = function() {
			this.ctx.closePath();
		};
		
		C2D.prototype.isPointInPath = function(x, y) {
			return this.ctx.isPointInPath(x, y);
		};
		
		C2D.prototype.clearRect = function(x, y, w, h) {
			this.ctx.clearRect(x, y, w, h);
		};
	
		C2D.prototype.drawImage = function() {
			this.ctx.drawImage.apply(this.ctx, arguments);
		};
		
		C2D.prototype.scale = function(x, y) {
			this.matrix = matrix_scale(this.matrix, x, y);
			this.ctx.scale(x, y);
		};
		
		C2D.prototype.translate = function(x, y) {
			this.matrix = matrix_translate(this.matrix, x, y);
			this.ctx.translate(x, y);		
		};
		
		C2D.prototype.rotate = function(r) {
			this.matrix = matrix_rotate(this.matrix, r);
			this.ctx.rotate(r);		
		};
		
		C2D.prototype.save = function() {
			this.stack.push(matrix_clone(this.matrix));
			this.ctx.save();		
		};
		
		C2D.prototype.restore = function() {
			this.matrix = this.stack.pop() || this.matrix;
			this.ctx.restore();		
		};
		
		C2D.prototype.getTransform = function() {
			return matrix_clone(this.matrix);
		};

		C2D.prototype.setScreen = function(name, sprite) {
			if(!this.activeScreen) {
				this.activeScreen = name;
			}
			this.screens[name] = sprite;
			return this;
		};

		C2D.prototype.changeScreen = function(name) {
			this.activeScreen = name || this.activeScreen;
		};

		C2D.prototype.stop = function() {
			clearInterval(this.interval);
		};

		C2D.prototype.fullScreen = function() {
			var s = this.cvs.style;
			if(s.position != "fixed") {
				s.position = "fixed";
				s.top = s.left = 0;
				s.width = s.height = "100%";
			} else {
				s.position = s.top = s.left = s.width = s.height = "";
			}
		};

		C2D.prototype.cursor = function(p) {
			this.cvs.style.cursor = p;
		};

		C2D.prototype.roundRect = function (x, y, w, h, r) {
			if (w < 2 * r) r = w / 2;
			if (h < 2 * r) r = h / 2;
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

		function mousemove(e, me) {
			if(me.livemouse.isdown) {
				me.livemouse.lastlocation = me.livemouse.location;
				me.livemouse.location = getMouseLocation(e);
				var o = offset(me.livemouse.lastlocation, me.livemouse.location);
				if(me.dragging) {
					var l = me.dragging.location;
					l[0] += o[0];
					l[1] += o[1];
				}
				me.livemouse.request.drag = true;
			} else {
				me.livemouse.location = getMouseLocation(e);
			}
			me.livemouse.request.move = true;
		}	

		function mouseupdown(e, d, me) {
			me.livemouse.location = getMouseLocation(e);
			me.livemouse.isdown = me.livemouse.request.down = !(me.livemouse.request.up = !d);
		}

		C2D.prototype.start = function() {
			var me = this;
			me.interval = setInterval(function() {
				//process mouse
				me.deadmouse = { 
					request : {
						down : me.livemouse.request.down,
						up : me.livemouse.request.up,
						move : me.livemouse.request.move,
						drag : me.livemouse.request.drag
					},
					downon : me.livemouse.downon.slice(0),
					location : me.livemouse.location.slice(0)
				};
				//process drawing
				me.clearRect(0, 0, me.cvs.width, me.cvs.height);
				me.screens[me.activeScreen].update().collision().draw(me);
				//process mouse
				me.livemouse.downon = me.deadmouse.downon;
				if(me.deadmouse.request.up) {
					me.livemouse.downon = [];
					if(me.dragging) {
						if(!me.dragging.willStick) {
							me.dragging.location = me.dragging.oldLocation;
							if(me.dragging.droppable) {
								me.dragging.drop(me.dragging.droppable);
							}
						}
						me.dragging = 0;		
					}
				}
				me.livemouse.request = {};
			}, 1000 / 60);
		};		
		
		C2D.prototype.mouse = function() {
			return this.deadmouse;
		};
		
		C2D.prototype.screen = function(name) {
			return this.screens[name];
		};
		
		C2D.prototype.canvas = function() {
			return this.cvs;
		};
		
		C2D.prototype.context = function() {
			return this.ctx;
		};		
		
		C2D.prototype.isSupported = true;
		
		C2D.prototype.find = function(model) {
			return this.screens[this.activeScreen].find(model, []);
		};
	} else {
		C2D.prototype.isSupported = false;
	}
	
	window.C2D = C2D;
}());