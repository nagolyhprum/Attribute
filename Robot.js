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
        return this;
    };
    
    Robot.prototype.wait = function(wait) {
        this.todo.push(function(callback) {
            this.c2d.setTimeout(callback, wait);
        });
        return this;
    };
    
    Robot.prototype.mouse = function(event, o) {
        this.todo.push(function(callback) {
            var bb = this.c2d.cvs.getBoundingClientRect();
            this.c2d.cvs["onmouse" + event]({
                pageX : o[0] + bb.left,
                pageY : o[1] + bb.top,
                preventDefault : function(){},
                target : this.c2d.cvs
            });
            callback();
        });
        return this;
    };
    
    Robot.prototype.keyboard = function(event, keycode) {
        this.todo.push(function(callback) {
            this.c2d.cvs["onkey" + event]({
                keyCode : keycode,
                preventDefault : function(){}
            });
            callback();
        });
        return this;
    };
    
    Robot.prototype.invoke = function(f) {
        this.todo.push(f);
        return this;
    };
} ());