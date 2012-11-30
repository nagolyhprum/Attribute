 var weapons = ["axe", "bigclub", "bow", "claw", "dagger", "halberd", "hammer"], times = 3, speed = 50, c2d;             
function animations(columns) {
    return {
    	"up" : {
			sequence : [0]
		},
		"animation-up" : {
			sequence : Utility.H(1, columns, times),
            next : next
		},
		"left" : {
			sequence : [columns]
		},
		"animation-left" : {
			sequence : Utility.H(columns + 1, columns * 2, times),
            next : next
		},
		"down" : {
			sequence : [columns * 2]
		},
		"animation-down" :  {
			sequence : Utility.H(columns * 2 + 1, columns * 3, times),
            next : next
		},
		"right" : {
			sequence : [columns * 3]
		},
		"animation-right" :  {
			sequence : Utility.H(columns * 3 + 1, columns * 4, times),
            next : next                    
	    }
    };
}
function next() {
    var p = this.parent;
    p.attack.visible = 0;
    p.disabled = false;
    p.sprites[0].visible = true;
    p.sprites[1].visible = false;
}
function stdKey(x_or_y, direction, sign) {
   return {
        press : function() {
            this.keys[direction].down.call(this, direction);
        },
        down : function() {
            if(this.sprites[0].animation.name.indexOf("animation-") != 0) {
                this[x_or_y] += sign * speed;
                this.sprites[0].animate("animation-" + direction);
            }
        },
        up : function() {
            var name = this.sprites[0].animation.name;
            if(name.indexOf(direction) != -1) {
                this[x_or_y] = 0;                    
                this.sprites[0].animate(direction);
            }
        }
    };
}
function addImage(me, image, model, index) {
    Utility.img(me.type + image + ".png", function(img) {
        me.image[index] = img;
        me.width = img.width / me.columns;
        me.height = img.height / me.rows;      
        me.animate("down");
        me.loaded++;
        if(me.loaded == 8) {
            me.image.complete = 1;
        }
    });             
}          