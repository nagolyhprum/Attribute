(function() {        
    C2D.prototype.getRobot = function() {
        return new Robot(this);
    };
    
    function Robot(c2d) {
        this.c2d = c2d;
        this.todo = [];
    }
    
    Robot.prototype.start = function() {
        var me = this;
        me.todo.shift()(function() {
            if(me.todo.length) {
                me.todo.shift()(arguments.callee);
            }
        });
        return me;
    };
    
    Robot.prototype.wait = function(wait) {
        var me = this;
        me.todo.push(function(callback) {
            me.c2d.setTimeout(callback, wait);
        });
        return me;
    };
    
    Robot.prototype.mouse = function(event, o) {
        var me = this;
        me.todo.push(function(callback) {
            var bb = me.c2d.cvs.getBoundingClientRect();
            me.c2d.cvs["onmouse" + event]({
                pageX : o[0] + bb.left,
                pageY : o[1] + bb.top,
                preventDefault : function(){},
                target : me.c2d.cvs
            });
            callback();
        });
        return me;
    };
    
    Robot.prototype.keyboard = function(event, keycode) {
        var me = this;
        me.todo.push(function(callback) {
            me.c2d.cvs["onkey" + event]({
                keyCode : keycode,
                preventDefault : function(){}
            });
            callback();
        });
        return me;
    };
    
    Robot.prototype.mouseToSprite = function(event, o, offset) {
        var me = this;
        me.todo.push(function(callback) {
            var bb = me.c2d.cvs.getBoundingClientRect(), 
                sprite = me.c2d.find(o)[0],
                p = sprite.getTransformedPoints(),
                x = 0, y = 0;
            for(var i = 0; i < p.length; i++) {
                x += p[i][0][0];
                y += p[i][1][0];
            }
            x /= p.length;
            y /= p.length;
            if(offset) {
                x += offset[0] || 0;
                y += offset[1] || 0;
            }
            me.c2d.cvs["onmouse" + event]({
                pageX : x + bb.left,
                pageY : y + bb.top,
                preventDefault : function(){},
                target : me.c2d.cvs
            });
            callback();
        });
        return me;        
    };
    
    Robot.prototype.invoke = function(f) {
        this.todo.push(f);
        return this;
    };
} ());