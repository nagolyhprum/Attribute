(function() {
    function SpriteEvent(events) {
        this.events = [];
        if(events instanceof Array) {
            this.events = this.events.concat(events);
        } else if(events) {
            this.events.push(events);
        }
    }    
    
    SpriteEvent.prototype.add = function(event) {
        this.events.push(event);
    };
    
    SpriteEvent.prototype.remove = function(event) {
        for(var i = 0; i < this.events.length; i++) {
            if(this.events[i] == event) {
                return this.events.splice(i, 1);
            }
        }
    };
    
    SpriteEvent.prototype.call = function() {
        for(var i = 0; i < this.events.length; i++) {
            this.events[i].apply(arguments[0], Array.prototype.slice.call(arguments, 1));
        }
    };
    window.SpriteEvent = SpriteEvent;
}());

function Sprite(model, constructor) {    
	model = Sprite.MODELS[model] || model || {};	
    for(var i = 0; i < Sprite.DEFAULTS.r.length; i++) {
        Sprite.DEFAULTS.r[i].call(this, model, constructor);
    }		
}
Sprite.ID = 0;
Sprite.MODELS = {};
Sprite.FUNCTIONS = {};
(Sprite.DEFAULTS = function(f) {
    if(typeof f == "string") {
        f = new Function("model", "constructor", f);
    }
    (Sprite.DEFAULTS.r = Sprite.DEFAULTS.r || []).unshift(f);
    return Sprite.DEFAULTS;
})
    (function(model, constructor) {        
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
            if(model.init = (Sprite.FUNCTIONS[model.init] || model.init)) {
                model.init.call(this);
        	}
        	if(constructor) {
        		constructor.call(this);
        	}
            if(COMPONENTS[this.component = model.component]) {
                COMPONENTS[this.component].call(this, model);
            }
            this.willStick = false;
        } 
    })
    ("this.index = model.index || 0;")
    ("this.keys = Sprite.FUNCTIONS[model.keys] || model.keys || {};")
    ("this.sprites = [];")
    ("this.matrix = M();")
    ("this.location = model.location ? [model.location[0] || 0, model.location[1] || 0, 1] : [0, 0, 1];")  
    ("this.r = model.r || 0;")
	("this.dx = model.dx || 0;")
	("this.dy = model.dy || 0;")
	("this.dr = model.dr || 0;")
	("this.sx = model.sx || 1;")
	("this.sy = model.sy || 1;")    
    ("this.textHandler = model.textHandler;") //this should change if possible
    ("this.animation = {};")
	("this.limit = model.limit || (1 / 0);")
	("this.rows = model.rows || 1;")
	("this.priority = model.priority || 0;")
	("this.columns = model.columns || 1;")
	("this.borderradius = model.borderradius || 0;")
	("this.animations = Sprite.FUNCTIONS[model.animations] || model.animations;")
    ("this.swaps = model.swaps;")
    ("this.ontake = Sprite.FUNCTIONS[model.ontake] || model.ontake;")
	("this.type = model.type || '';")
	("this.shape = model.shape || 'r';")
	("this.clips = model.clips === undefined ? true : model.clips == true;")
    ("this.fill = model.fill || 'rgba(0,0,0,0)';")
    ("this.stroke = model.stroke || 'rgba(0,0,0,0)';")
    ("this.hover = model.hover;")
    ("this.active = model.active;")
	("this.onmouseclick = new SpriteEvent(Sprite.FUNCTIONS[model.onmouseclick] || model.onmouseclick);")
	("this.onmousedrag = new SpriteEvent(Sprite.FUNCTIONS[model.onmousedrag] || model.onmousedrag);")
	("this.onmousedown = new SpriteEvent(Sprite.FUNCTIONS[model.onmousedown] || model.onmousedown);")
	("this.onmouseup = new SpriteEvent(Sprite.FUNCTIONS[model.onmouseup] || model.onmouseup);")
	("this.onmousemove = new SpriteEvent(Sprite.FUNCTIONS[model.onmousemove] || model.onmousemove);")
	("this.onmousein = new SpriteEvent(Sprite.FUNCTIONS[model.onmousein] || model.onmousein);")
	("this.onmouseout = new SpriteEvent(Sprite.FUNCTIONS[model.onmouseout] || model.onmouseout);")
	("this.onmousemove = new SpriteEvent(Sprite.FUNCTIONS[model.onmousemove] || model.onmousemove);")
	("this.collidesWith = Sprite.FUNCTIONS[model.collidesWith] || model.collidesWith || {};")
	("this.movement = model.movement || 's';")
	("this.font = model.font || '10px \"Times New Roman\", sans-serif';")
	("this.text = model.text || '';")
	("this.onadd = new SpriteEvent(Sprite.FUNCTIONS[model.onadd] || model.onadd); //when i am added to something")
	("this.draggable = model.draggable || false;")
	("this.ondrop = Sprite.FUNCTIONS[model.ondrop] || model.ondrop || {};")
    ("this.min = model.min;")
    ("this.max = model.max;")
    ("this.round = model.round;") //how should i handle this?
	("this.holding = [];")
    ("this.onchange = new SpriteEvent(Sprite.FUNCTIONS[model.onchange] || model.onchange);")
    ("this.disabled = model.disabled;")
	("this.visible = model.visible !== false && model.visible !== 0 ? 1 : model.visible;")
    ("this.id = model.id || Sprite.ID++");

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
            if(this.textHandler) {
                this.textHandler(ctx);
            } else {         
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
    				this.onmousein.call(this, l, mouse);
    			}
    			this.ismousein = true;
    			if(mouse.request.drag && this.onmousedrag) {
    				this.onmousedrag.call(this, l, multiply(m, mouse.lastlocation), mouse);
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
    					this.onmousedown.call(this, l, mouse);
    				}
    				mouse.downon.push(this); //for future click event
    			} else if(mouse.request.up) {
    				if(ctx.dragging) { //should i reset the draggable if i can drop?
    					ctx.dragging.drop(this); //drop the draggable on this
    				}
    				if(this.onmouseup) {
    					this.onmouseup.call(this, l, mouse);
    				}
    				if(this.onmouseclick && mouse.downon.contains(this)) {
    					this.onmouseclick.call(this, l, mouse);
    				}
    			}
    			if(mouse.request.move && this.onmousemove) {
    				this.onmousemove.call(this, l, mouse);
    			}
    		} else if (this.ismousein) {
    			if(this.onmouseout) {
    				this.onmouseout.call(this, l, mouse);
    			}
    			this.ismousein = false;
    		}
            var keyboard = ctx.keyboard();
            for(var i in keyboard) {
                if(!this.disabled && this.keys[i] && this.keys[i][keyboard[i]]) {
                    this.keys[i][keyboard[i]].call(this, i);
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
		this.animation.index += Math.round(s / (1000 / 60000));
		while(a.sequence.length <= this.animation.index) {
			this.animation.index = this.animation.index - a.sequence.length;
			if(a.next) {
				if(typeof a.next == "string") {
					this.animation.name = a.next;
				} else if(typeof a.next == "function") {
					a.next.call(this);
				}
                a = this.animations[this.animation.name];
			}
		}
		this.index = a.sequence[this.animation.index];
	}
	this.points = null;
	return this;
};

Sprite.prototype.add = function(o) {
    if(!(o instanceof Sprite)) {
        o = new Sprite(o);
    }
	var p = o.parent;
	if(p) {
		p.remove(o);
	}
	o.parent = this;
	this.sprites.push(o);
	if(o.onadd) {
		o.onadd.call(o, this);
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

var COMPONENTS = { 
    priority : 50,
    hover : {
        fill : "lightgray",
        stroke : "black"        
    },
    active : {
        fill : "white",
        stroke : "black"        
    },
    fill : "gray",
    stroke : "black",
    text : {
        color : "black"
    },
    borderradius : 5
};
COMPONENTS.slider = function() {
    this.priority = COMPONENTS.priority;
    var stroke = this.stroke != "rgba(0,0,0,0)" ? this.stroke : COMPONENTS.stroke, 
        fill = this.fill != "rgba(0,0,0,0)" ? this.fill : COMPONENTS.fill;
    this.onadd.add(function(p) {
        this.width = p.width;
        this.height = p.height;
    });
    this.fill = this.stroke = "rgba(0, 0, 0, 0)";
    var bar, slider, 
        position_range = Math.max(this.width, this.height) - Math.min(this.width, this.height),
        user_range = this.max - this.min;
    this.onmousedrag.add(function(l1, l2, mouse) {
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
            if(this.round) {
                value = this.round(value, user_range);
                old_value = this.round(old_value, user_range);
                if(x != 0) {
                    x = (value / user_range) * position_range;
                } else {
                    y = (value / user_range) * position_range;
                }
            }
            if(this.onchange && (value != old_value)) {                                
                this.onchange.call(this, (this.min || 0) + value, (this.min || 0) + old_value);
            }
            slider.location = [x, y, 1];
        }
    });
    var me = this;
    this.add(bar = new Sprite({
        location : this.location,
        stroke : stroke,
        fill : fill,
        width : this.width,
        height : this.height,
        borderradius : this.borderradius || COMPONENTS.borderradius,
        onadd : function(p) {
            var size = Math.min(this.width, this.height);
            this.add(slider = new Sprite({
                borderradius : this.borderradius || COMPONENTS.borderradius,
                stroke : this.stroke,
                fill : this.fill,
                width : size,
                height : size,
                onmousein : function(l, mouse) {
                    if(mouse.downon.contains(this)) {
                        this.fill = (me.active || COMPONENTS.active).fill;
                        this.stroke = (me.active || COMPONENTS.active).stroke;
                    } else {
                        this.fill = (me.hover || COMPONENTS.hover).fill;
                        this.stroke = (me.hover || COMPONENTS.hover).stroke;
                    }
                },
                onmouseout : function() {
                    this.fill = fill;
                    this.stroke = stroke;        
                },
                onmousedown : function() {
                    this.fill = (me.active || COMPONENTS.active).fill;
                    this.stroke = (me.active || COMPONENTS.active).stroke;
                }            
            }));
        }
    }));
    this.location = [0, 0, 1];
};

COMPONENTS.button = function() {
    this.priority = COMPONENTS.priority; 
    this.borderradius = this.borderradius || COMPONENTS.borderradius;   
    var stroke = this.stroke != "rgba(0,0,0,0)" ? this.stroke : COMPONENTS.stroke, 
        fill = this.fill != "rgba(0,0,0,0)" ? this.fill : COMPONENTS.fill,
        color = this.text.color || COMPONENTS.text.color;
    this.fill = fill;
    this.stroke = stroke;
    this.add(new Sprite({
        text : this.text.content,
        fill : color,
        stroke : color
    }));
    this.text = ""; 
    this.onmousein.add(function(l, mouse) {
        if(mouse.downon.contains(this)) {
            this.fill = (this.active || COMPONENTS.active).fill;
            this.stroke = (this.active || COMPONENTS.active).stroke;
        } else {
            this.fill = (this.hover || COMPONENTS.hover).fill;
            this.stroke = (this.hover || COMPONENTS.hover).stroke;
        }
    });
    this.onmouseup.add(function() {
        this.fill = (this.hover || COMPONENTS.hover).fill;
        this.stroke = (this.hover || COMPONENTS.hover).stroke;        
    });
    this.onmouseout.add(function() {
        this.fill = fill;
        this.stroke = stroke;        
    });
    this.onmousedown.add(function() {
        this.fill = (this.active || COMPONENTS.active).fill;
        this.stroke = (this.active || COMPONENTS.active).stroke;
    });
};

var FONT = {
    style : "",
    weight : "",
    size : 12,
    family : '"Times New Roman", serif',
    color : "black"
};
COMPONENTS.textbox = function() {
    this.priority = COMPONENTS.priority;
    var stroke = this.stroke != "rgba(0,0,0,0)" ? this.stroke : COMPONENTS.stroke, 
        fill = this.fill != "rgba(0,0,0,0)" ? this.fill : COMPONENTS.fill;
    this.stroke = stroke;
    this.fill = fill;    
    var text, width, reserve, inner_cvs, inner_x = 0, inner_y = 0;
    this.onmousedrag.add(function(l, oldL) {
        var o = offset(l, oldL);
        inner_x -= o[0];
        inner_y -= o[1];
        inner_x = Math.max(Math.min(inner_x, 0), Math.min(this.width - inner_cvs.width, 0));
        inner_y = Math.max(Math.min(inner_y, 0), Math.min(this.height - inner_cvs.height, 0));
    });
    this.textHandler = function(ctx) {
        if(reserve != this.text || width != this.width) {            
            if(reserve != this.text) {
                reserve = this.text;            
            }
            text = reserve.slice(0);
            width = this.width;
            var roomLeft = width;
            for(var i = 0; i < text.length && ((i + 1) % 200 || confirm("Continue?")); i++) {                
                var t = text[i];
                if(t.content) {
                    text[i] = t = {
                        color : t.color,
                        content : t.content,
                        font : t.font,
                        size : t.size,
                        style : t.style,
                        family : t.family,
                        weight : t.weight
                    };
                    t.size = t.size || FONT.size;
                    if(!t.font) {
                        t.font = [
                            t.style || FONT.style, 
                            t.weight || FONT.weight, 
                            (t.size || FONT.size) + "px", 
                            t.family || FONT.family                            
                        ].join(" ");
                    }
                    var io = t.content.indexOf("\n");                
                    if(io != -1) {
                        text.splice(i + 1, 0, "\n", {
                            font : t.font,
                            color : t.color,
                            content : t.content.substring(io + 1)
                        });                    
                        t.content = t.content.substring(0, io);
                    }  
                    ctx.font = t.font;
                    t.width = ctx.measureText(t.content).width;
                    roomLeft -= t.width;
                    if(roomLeft < 0) {
                        var nextLine = "", removed = 0, io = t.content.lastIndexOf(" ");
                        if(io == -1) { //if there are no spaces -- a word all by itself
                            if(i > 0 && text[i - 1] != "\n") { //if this has content before
                                text.splice(i--, 0, "\n");
                            } else { //otherwise separate it from the content after
                                text.splice(i + 1, 0, "\n");                                
                            }
                        } else {
                            while(roomLeft + removed < 0 && t.content) { //while there are spaces and no room                                                        
                                nextLine = t.content.substring(io) + nextLine; //move to next line
                                t.content = t.content.substring(0, io); //remove
                                removed = ctx.measureText(nextLine).width; //determine space removed
                                io = t.content.lastIndexOf(" ") || 0; //get the next space
                            }
                            if(t.content) { //if i did not remove everything 
                                text.splice(i + 1, 0, "\n", {
                                    content : nextLine,
                                    font : t.font,
                                    size : t.size,
                                    color : t.color
                                });
                            } else { //if everything was removed
                                if(i - 1 > 0 && text[i - 1] != "\n") { //if this is not separated from the content before
                                    t.content = nextLine;
                                    text.splice(i--, 0, "\n");
                                } else {
                                    var io = nextLine.indexOf(" ", 1);
                                    if(io != -1) {
                                        t.content = nextLine.substring(0, io);
                                        text.splice(i + 1, 0, "\n", {
                                            font : t.font,
                                            color : t.color,
                                            content : nextLine.substring(io)
                                        });
                                    } else {
                                        t.content = nextLine;
                                    }
                                }
                            }
                        }
                    }
                    t.width = ctx.measureText(t.content).width;
                } else if(t == "\n") {
                    roomLeft = width;                    
                }                
            }            
            var max_width = 0, current_width = 0, j = 0, total_height = 0, heights = [];
            for(i = 0; i < text.length; i++) {
                if(text[i].content) {
                    current_width += text[i].width;
                    if(text[i].size > heights[j] || !heights[j]) {
                        total_height += (heights[j] = text[i].size);
                    }
                } else if(text[i] == "\n") {
                    while((i + 1 < text.length && text[i + 1].content && !(text[i + 1].content = text[i + 1].content.replace(/^\s*/, "")))
                        || text[i + 1] == "\n") {
                        text.splice(i + 1, 1);
                    }
                    if(max_width < current_width) {
                        max_width = current_width;
                    }
                    current_width = 0;
                    j++;
                }
            }
            if(max_width < current_width) {
                max_width = current_width;
            }
            inner_cvs = document.createElement("canvas");
            inner_cvs.width = max_width;
            inner_cvs.height = total_height;
            var inner_ctx = inner_cvs.getContext("2d"), line = 0, x = 0, y = heights[line++];      
            inner_ctx.textBaseline = "bottom";
    		inner_ctx.textAlign = "left";            
            for(var i = 0; i < text.length; i++) {
                var t = text[i];
                if(t.content) {
                    inner_ctx.font = t.font;
                    inner_ctx.fillStyle = t.color || FONT.color;
                    inner_ctx.strokeStyle = t.color || FONT.color;
                    inner_ctx.strokeText(t.content, x, y - (heights[line - 1] - t.size) / 4);
                    inner_ctx.fillText(t.content, x, y - (heights[line - 1] - t.size) / 4);
                    x += t.width;
                } else if(t == "\n") {
                    x = 0;
                    y += heights[line++] || 0;
                }
            }      
            inner_x = inner_y = 0;
        }
		ctx.beginPath();
		ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
		ctx.clip();
		ctx.closePath();
        ctx.drawImage(inner_cvs, inner_x - this.width / 2, inner_y - this.height / 2);
    };
};