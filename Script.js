(function() {
    function Script(c2d, src) {
        var me = this;
        this.c2d = c2d;   
        this.selections = {};
        this.selection = [];
        this.using = null;
        this.variables = {};
        this.i = 0;
        ajax({
            src : src,
            success : function(data) {
                var lines = data.split("\n");
                (function() {
                    if(me.i < lines.length) {
                        var line = lines[me.i++].split(/\s+/);
                        if(line[0] && line[0][0] != "#") {      
                            line.splice(1, 0, arguments.callee);
                            me[line[0]].apply(me, line.slice(1));
                        } else {
                            arguments.callee();
                        }
                    }
                }());
            }
        });
    }
    
    Script.prototype.data = function(callback, name, value) {
        this.variables[name] = value;
        callback();
    };
    
    Script.prototype.increment = function(callback, name) {
        this.variables[name]++;
        callback();
    };
    
    Script.prototype.jumpTo = function(callback, line, bool) {
        with(this.variables) {
            bool = eval(bool);
        }
        if(bool) {
            this.i = parseInt(line);
        }
        callback();
    };
    
    Script.prototype.wait = function(callback, time) {
        this.c2d.setTimeout(callback, time);
    };
    
    Script.prototype.sprite = function(callback, name) {
        this.model = {};
        this.name = name;
        callback();
    };
    
    Script.prototype.attr = function(callback, name, value) {
        this.model[name] = value;
        callback();
    };
    
    Script.prototype.moveBy = function(callback, x, y, dx, dy) {
        var me = this;
        x = parseFloat(x);
        y = parseFloat(y);
        dx = parseFloat(dx);
        dy = parseFloat(dy);
        var fd = [];
        for(var i = 0; i < this.selection.length; i++){
            me.selection[i].dx = dx;
            me.selection[i].dy = dy;
            fd[i] = me.selection[i].location.slice(0);
            fd[i][0] += x;
            fd[i][1] += y;
        }
        me.c2d.setTimeout(function() {
            for(var i = 0; i < me.selection.length; i++) {
                me.selection[i].location = fd[i];
                me.selection[i].dx = 0;
                me.selection[i].dy = 0;
            }
            callback();
        }, Math.max(x / (dx || 1) * 1000, y / (dy || 1) * 1000));
    };
    
    Script.prototype.moveTo = function(callback, x, y) {
        for(var i = 0; i < this.selection.length; i++) {
            this.selection[i].location = [parseFloat(x), parseFloat(y), 1];
        }
        callback();
    };
    
    Script.prototype.animate = function(callback, name) {
        for(var i = 0; i < this.selection.length; i++) {
            this.selection[i].animate(name);
        }
        callback();
    };
    
    Script.prototype.end = function(callback) {
        this.selections[this.name] = this.c2d.find(this.model);
        callback();
    };
    
    Script.prototype.use = function(callback, name) {
        this.selection = this.selections[name];
        callback();
    };
    
    Script.prototype.set = function(callback, name, value) {
        var parsedValue = parseFloat(value);
        for(var i = 0; i < this.selection.length; i++) {
            this.selection[i][name] = value == parsedValue ? parsedValue : value;
        }
        callback();
    };
    
    window.Script = Script;
}())