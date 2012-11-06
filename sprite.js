function Sprite(model, constructor) {
	model = model || {};	
    this.keys = model.keys || {};
	this.index = model.index || 0;
	this.sprites = [];
	this.location = model.location ? [model.location[0] || 0, model.location[1] || 0, 1] : [0, 0, 1];
	this.r = model.r || 0;
	this.dx = model.dx || 0;
	this.dy = model.dy || 0;
	this.dr = model.dr || 0;
	this.sx = model.sx || 1;
	this.sy = model.sy || 1;
	this.animation = {};
	this.limit = model.limit || (1 / 0);
	this.rows = model.rows || 1;
	this.priority = model.priority || 0;
	this.columns = model.columns || 1;
	this.borderradius = model.borderradius || 0;
	this.animations = model.animations;
	if(model.image) {
		var me = this;
		img(model.image, function(img) {
			me.image = img;
			me.width = me.width || model.width || me.image.width / me.columns;
			me.height = me.height || model.height || me.image.height / me.rows;
		});
	} else {
		this.width = model.width || 0;
		this.height = model.height || 0;
	}
    this.swap = model.swap;
	this.ontake = model.ontake;
	this.type = model.type || "";
	this.shape = model.shape || "r";
	this.clips = model.clips === undefined ? true : model.clips == true;
	this.fill = model.fill || "rgba(0,0,0,0)";
	this.stroke = model.stroke || "rgba(0,0,0,0)";
	this.onmouseclick = model.onmouseclick;
	this.onmousedrag = model.onmousedrag;
	this.onmousedown = model.onmousedown;
	this.onmouseup = model.onmouseup;
	this.onmousemove = model.onmousemove;
	this.onmousein = model.onmousein;
	this.onmouseout = model.onmouseout;
	this.onmousemove = model.onmousemove;
	this.collidesWith = model.collidesWith || {};
	this.movement = model.movement || "s"; //movement type
	this.font = model.font || "10px sans-serif";
	this.text = model.text || "";
	this.onadd = model.onadd; //when i am added to something
	this.draggable = model.draggable || false;
	this.ondrop = model.ondrop || {};
	this.holding = [];
	this.visible = model.visible !== false && model.visible !== 0 ? 1 : model.visible;
	if(model.init) {
		model.init.call(this);
	}
	if(constructor) {
		constructor.call(this);
	}
	this.willStick = false;
}

Sprite.prototype.animate = function(name) {
	this.animation.name = name;
	this.animation.index = 0;
};

Sprite.prototype.draw = function(ctx) {
	if(this.visible) {
		var image = this.image;
		if(image || this.shape == "r") {
			this.matrix = ctx.getTransform();
		}
		ctx.save();		
		ctx.scale(this.sx, this.sy);
		ctx.translate(this.width / 2 + this.location[0] / this.sx, this.height / 2 + this.location[1] / this.sy);
		ctx.rotate(this.r);		
		if(image && image.complete) {
			var sw = (image.width / this.columns), sh = (image.height / this.rows);
			ctx.drawImage(image, 
				sw * (this.index % this.columns),  sh * Math.floor(this.index / this.columns), sw, sh,
				-this.width / 2, -this.height / 2, this.width, this.height);
		} else if(this.shape == "r") {
			ctx.fillStyle = this.fill;
			ctx.strokeStyle = this.stroke;
			ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, this.borderradius);	
		}
		if(this.text) {
			ctx.font = this.font;
			ctx.textBaseline = "middle";
			ctx.textAlign = "center";
			ctx.fillStyle = this.fill;
			ctx.strokeStyle = this.stroke;		
			var cx = 0, cy = 0, p = this.parent;
			if(p) {
				cx = p.width / 2;
				cy = p.height / 2;
			} else {
				cx = ctx.canvas.width / 2;
				cy = ctx.canvas.height / 2;
			}
			ctx.strokeText(this.text, -this.width / 2 + cx, -this.height / 2 + cy, cx * 2);
			ctx.fillText(this.text, -this.width / 2 + cx, -this.height / 2 + cy, cx * 2);
		}
		if(this.clips) {
			ctx.beginPath();
			ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
			ctx.clip();
			ctx.closePath();
		}
		ctx.translate(-this.width / 2, -this.height / 2);
		var mouse = ctx.mouse(), l = mouse.location;
		if(ctx.isPointInPath(l[0], l[1])) {
			m = inverse(ctx.getTransform())
			l = multiply(m, mouse.location);	
			if(!this.ismousein && this.onmousein) {
				this.onmousein(l);
			}
			this.ismousein = true;
			if(mouse.request.drag && this.onmousedrag) {
				this.onmousedrag(l, multiply(m, mouse.lastlocation));
			}
			if(mouse.request.down) {
				if(this.draggable) {
					if(ctx.dragging && ctx.dragging.droppable) { //this guarentees that I get the top sprite
						ctx.dragging.drop(ctx.dragging.droppable, 0); //drops the bottom sprites
					}
					ctx.dragging = this;
					this.take();
					this.oldLocation = this.location.slice(0);
				}
				if(this.onmousedown) {
					this.onmousedown(l);
				}
				mouse.downon.push(this); //for future click event
			} else if(mouse.request.up) {
				if(ctx.dragging) { //should i reset the draggable if i can drop?
					ctx.dragging.drop(this); //drop the draggable on this
				}
				if(this.onmouseup) {
					this.onmouseup(l);
				}
				if(this.onmouseclick && mouse.downon.contains(this)) {
					this.onmouseclick(l);
				}
			}
			if(mouse.request.move && this.onmousemove) {
				this.onmousemove(l);
			}
		} else if (this.ismousein) {
			if(this.onmouseout) {
				this.onmouseout(l);
			}
			this.ismousein = false;
		}
        var keyboard = ctx.keyboard();
        for(var i in keyboard) {
            if(this.keys[i] && this.keys[i][keyboard[i]]) {
                this.keys[i][keyboard[i]].call(this);
            }
        }
		this.sprites.sort(function(a, b) {
			return a.priority - b.priority;
		});
		for(var i = 0; i < this.sprites.length; i++) {		
			var s = this.sprites[i];
			s.draw(ctx);
		}
		ctx.restore();
	}
	return this;
};

Sprite.prototype.isMoving = function() {
    return this.dx || this.dy;
};

Sprite.prototype.update = function(ms) {
	if(this.movement == "d") {
		this.r += this.dr;
		this.location[0] += this.dx * (ms / 1000);
		this.location[1] += this.dy * (ms / 1000);
	}
	for(var i = 0; i < this.sprites.length; i++) {				
	    this.sprites[i].update(ms);
	}
	if(this.animation.name) {
		var a = this.animations[this.animation.name];
		this.animation.index++;
		if(a.sequence.length == this.animation.index) {
			this.animation.index = 0;
			if(a.next) {
				if(typeof a.next == "string") {
					a = this.animations[this.animation.name = a.next];
				} else if(typeof a.next == "function") {
					a.next(this);
				}
			}
		}
		this.index = a.sequence[this.animation.index];
	}
	this.points = null;
	return this;
};

Sprite.prototype.add = function(o) {
	var p = o.parent;
	if(p) {
		p.remove(o);
	}
	o.parent = this;
	this.sprites.push(o);
	if(o.onadd) {
		o.onadd(this);
	}
	return this;
};

Sprite.prototype.getTransformedPoints = function() {
	var m = this.matrix;
	m = matrix_scale(m, this.sx, this.sy);
	m = matrix_translate(m, this.width / 2 + this.location[0] / this.sx, this.height / 2 + this.location[1] / this.sy);
	m = matrix_rotate(m, this.r);		
	var w2 = this.width / 2, h2 = this.height / 2;
	return this.points = [
		multiply(m, [-w2, -h2, 1]),
		multiply(m, [w2, -h2, 1]),
		multiply(m, [w2, h2, 1]),
		multiply(m, [-w2, h2, 1]),
	];
};

/*
 * Sprites cannot intersect with their children or parent.
 * Sprites can intersect with their siblings and the children
 * of any sibling they intersect with.
 */
Sprite.prototype.collision = function(sprite) {
	var s = this.sprites;
	for(var i = 0; i < s.length && (!sprite || !i); i++) {
		for(var j = i + 1; j < s.length; j++) {
			var s1 = sprite || s[i], s2 = s[j], 
				c1 = s1.collidesWith[s2.type] || s1.collidesWith[""], 
				c2 = s2.collidesWith[s1.type] || s2.collidesWith[""];
			if((s1.movement == "d" || s2.movement == "d") && (c1 || c2)) {
				var p1 = s1.points || s1.getTransformedPoints(), p2 = s2.points || s2.getTransformedPoints(), intersects = false;
				for(var k = 0; !intersects && k < p1.length; k++) {
					for(var l = 0; !intersects && l < p2.length; l++) {
						intersects = getLineLineIntersection(p1[k], p1[(k + 1) % p1.length], p2[l], p2[(l + 1) % p2.length]) !== null;
					}
				}
				if(intersects) {
					if(c1) {
						c1(s2);
					}
					if(c2) {
						c2(s1);
					}
					s1.collision(s2);
					s2.collision(s1);
				}
			}
		}
	}
	return this;
};

Sprite.prototype.stick = function() {
	this.willStick = true;
};

Sprite.prototype.drop = function(s, b) {
	var d = this.ondrop[s.type];
    if(d) {
    	if(s.holding.length < s.limit) {
    		s.holding.push(this);
    		this.droppable = s;
    		return (b !== 0) && (b !== false) && (d.call(this, s) || 1);
    	} else if(b !== 0 && b !== false && s.limit > 0 && s.swap) {
            var other_draggable = s.holding[0],
                others_droppable = this.droppable;
                if(other_draggable && others_droppable) {
                    var other_ondrop = other_draggable.ondrop[others_droppable.type];
                    if(other_ondrop) {
                        other_draggable.take();
                        other_draggable.drop(others_droppable);
                        this.drop(s);
                    }
                }
                
    	}
    }
};

Sprite.prototype.take = function() {
	this.willStick = false;
	if(this.droppable) {
		this.droppable.holding.remove(this);
		if(this.droppable.ontake) {
			this.droppable.ontake.call(this.droppable, this);
		}
	}
};

Sprite.prototype.remove = function(o) {
	this.sprites.remove(o);
	o.parent = null;
	return this;
};
	
Sprite.prototype.find = function(model, r) {
	r = r || [];
	var s = this.sprites, f = typeof(model) === "function" ? model : object_is_model;
	for(var i = 0; i < s.length; i++) {
		if(f(s[i], model)) {
			r.push(s[i]);
		}
		s[i].find(model, r);
	}
	
	return r;
};