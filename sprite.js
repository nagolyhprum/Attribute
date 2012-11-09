function Sprite(model, constructor) {
	model = model || {};	
    this.keys = model.keys || {};
	this.index = model.index || 0;
	this.sprites = [];
    this.matrix = M();
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
    this.swaps = model.swaps;
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
    this.disabled = model.disabled;
	this.visible = model.visible !== false && model.visible !== 0 ? 1 : model.visible;
	if(model.image) {
		var me = this;
		img(model.image, function(img) {
			me.image = img;
			me.width = me.width || model.width || me.image.width / me.columns;
			me.height = me.height || model.height || me.image.height / me.rows;     
            init.call(me);
		});
	} else {
		this.width = model.width || 0;
		this.height = model.height || 0;        
        init.call(this);
	}   
    function init() {
        if(model.init) {
            model.init.call(this);
    	}
    	if(constructor) {
    		constructor.call(this);
    	}
        if(Components[model.component]) {
            Components[model.component].call(this, model);
        }
        this.willStick = false;
    } 
}

Sprite.prototype.animate = function(name) {
	this.animation.name = name;
	this.animation.index = 0;
    this.index = this.animations[name].sequence[0];
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
		}
        if(this.shape == "r") {
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
        if(!this.disabled) {
    		var mouse = ctx.mouse(), l = mouse.location;
    		if(ctx.isPointInPath(l[0], l[1])) {
    			m = inverse(ctx.getTransform())
    			l = multiply(m, mouse.location);	
    			if(!this.ismousein && this.onmousein) {
    				this.onmousein(l, mouse);
    			}
    			this.ismousein = true;
    			if(mouse.request.drag && this.onmousedrag) {
    				this.onmousedrag(l, multiply(m, mouse.lastlocation), mouse);
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
    					this.onmousedown(l, mouse);
    				}
    				mouse.downon.push(this); //for future click event
    			} else if(mouse.request.up) {
    				if(ctx.dragging) { //should i reset the draggable if i can drop?
    					ctx.dragging.drop(this); //drop the draggable on this
    				}
    				if(this.onmouseup) {
    					this.onmouseup(l, mouse);
    				}
    				if(this.onmouseclick && mouse.downon.contains(this)) {
    					this.onmouseclick(l, mouse);
    				}
    			}
    			if(mouse.request.move && this.onmousemove) {
    				this.onmousemove(l, mouse);
    			}
    		} else if (this.ismousein) {
    			if(this.onmouseout) {
    				this.onmouseout(l, mouse);
    			}
    			this.ismousein = false;
    		}
            var keyboard = ctx.keyboard();
            for(var i in keyboard) {
                if(this.keys[i] && this.keys[i][keyboard[i]]) {
                    this.keys[i][keyboard[i]].call(this);
                }
            }
        }
		this.sprites.sort(function(a, b) {
			return a.priority - b.priority || a.location[1] - b.location[1];
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

Sprite.prototype.update = function(c2d) {
    var s = c2d.getTimeInterval ? c2d.getTimeInterval() : c2d;
	if(this.movement == "d") {
		this.r += this.dr;
		this.location[0] += this.dx * s;
		this.location[1] += this.dy * s;
	}
	for(var i = 0; i < this.sprites.length; i++) {				
	    this.sprites[i].update(s);
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
					a.next.call(this);
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
		for(var j = sprite ? 0 : (i + 1); j < s.length; j++) {
			var s1 = sprite || s[i], s2 = s[j], 
				c1 = s1.collidesWith[s2.type] || s1.collidesWith[""], 
				c2 = s2.collidesWith[s1.type] || s2.collidesWith[""];
			if((s1.movement == "d" || s2.movement == "d") && (c1 || c2) && (s1.visible && !s1.disabled && s2.visible && !s2.disabled)) {
				var p1 = s1.points || s1.getTransformedPoints(), p2 = s2.points || s2.getTransformedPoints(), intersects = false;
				for(var k = 0; !intersects && k < p1.length; k++) {
					for(var l = 0; !intersects && l < p2.length; l++) {
						intersects = getLineLineIntersection(p1[k], p1[(k + 1) % p1.length], p2[l], p2[(l + 1) % p2.length]) !== null;
					}
				}
				if(intersects) {
					if(c1) {
						c1.call(s1, s2);
					}
					if(c2) {
						c2.call(s2, s1);
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
	var d = this.ondrop[s.type] || this.ondrop[""];
    if(d) {
    	if(s.holding.length < s.limit) {
    		s.holding.push(this);
    		this.droppable = s;
    		(b !== 0) && (b !== false) && (d.call(this, s) || 1);
            return 1;
    	} else if(b !== 0 && b !== false && s.limit > 0 && s.swap) {
            return this.swap(s.holding[0]);            
    	}
    }
};

Sprite.prototype.swap = function(other_draggable) {
    var others_droppable = this.droppable, 
        this_droppable = other_draggable.droppable;
    if(other_draggable && others_droppable) {
        var other_ondrop = other_draggable.ondrop[others_droppable.type] || other_draggable.ondrop[""],
            this_ondrop = this.ondrop[this_droppable.type] || this.ondrop[""];
        if(other_ondrop && this_ondrop) {
            other_draggable.take();
            this.take();
            other_draggable.drop(others_droppable);
            this.drop(this_droppable);
            return 1;
        }
    }
};

Sprite.prototype.take = function() {
	this.willStick = false;
	if(this.droppable && this.droppable.holding.remove(this)) {
        var func;
		if(this.droppable.ontake && (func = this.droppable.ontake[this.type] || this.droppable.ontake[""])) {
			func.call(this.droppable, this);
		}   		
        return 1;
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

var Components = { priority : 50 };
Components.slider = function(model) {
    this.priority = Components.priority;
    this.onadd = function(p) {
        this.width = p.width;
        this.height = p.height;
    };
    this.location = [0, 0, 1];
    this.fill = this.stroke = "rgba(0, 0, 0, 0)";
    var bar, slider, 
        position_range = Math.max(model.width, model.height) - Math.min(model.width, model.height),
        user_range = model.max - model.min;
    this.onmousedrag = function(l1, l2, mouse) {
        if(mouse.downon.contains(bar)) {
            var offset, last_offset, x = 0, y = 0;
            if(bar.width > bar.height) { //orientation = horizontal
                last_offset = Math.min(Math.max(l2[0] - bar.location[0] - slider.width / 2, 0), bar.width - slider.width);
                offset = x = Math.min(Math.max(l1[0] - bar.location[0] - slider.width / 2, 0), bar.width - slider.width);
            } else {
                last_offset = Math.min(Math.max(l2[1] - bar.location[1] - slider.height / 2, 0), bar.height - slider.height);
                offset = y = Math.min(Math.max(l1[1] - bar.location[1] - slider.height / 2, 0), bar.height - slider.height);
            }
            var value = (user_range || 1) * offset / position_range,
                old_value = (user_range || 1) * last_offset / position_range;
            if(model.round) {
                value = model.round(value, user_range);
                old_value = model.round(old_value, user_range);
                if(x != 0) {
                    x = (value / user_range) * position_range;
                } else {
                    y = (value / user_range) * position_range;
                }
            }
            if(model.onchange && (value != old_value)) {                                
                model.onchange((model.min || 0) + value, (model.min || 0) + old_value);
            }
            slider.location = [x, y, 1];
        }
    };
    this.add(bar = new Sprite({
        location : model.location,
        stroke : model.stroke,
        fill : model.fill,
        width : model.width,
        height : model.height,
        borderradius : model.borderradius,
        onadd : function(p) {
            var size = Math.min(model.width, model.height);
            this.add(slider = new Sprite({
                borderradius : model.borderradius,
                stroke : model.stroke,
                fill : model.fill,
                width : size,
                height : size                
            }));
        }
    }));
};

Components.button = function(model) {
    this.priority = Components.priority;
    this.text = "";
    this.add(new Sprite({
        text : model.text.content,
        fill : model.text.color,
        stroke : model.text.color
    }));
    this.onmousein = function(l, mouse) {
        if(mouse.downon.contains(this)) {
            this.fill = model.active.fill;
            this.stroke = model.active.stroke;
        } else {
            this.fill = model.hover.fill;
            this.stroke = model.hover.stroke;
        }
    };
    this.onmouseout = function() {
        this.fill = model.fill;
        this.stroke = model.stroke;        
    };
    this.onmousedown = function() {
        this.fill = model.active.fill;
        this.stroke = model.active.stroke;
    };
};