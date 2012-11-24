function img(src, onload) {
	var i, e;
	if(!(i = img.CACHE[src])) {
		i = img.CACHE[src] = new Image();
		i.src = src;
	}
	if(onload) {
		if(i.complete) {
			onload(i);
		} else {
			if(!(e = img.EVENTS[src])) {
				e = img.EVENTS[src] = [];
				i.onload = function() {
					for(var j in e){e[j](i);}
				};
			}
			e.push(onload);
		}
	}
	return i;
}
img.CACHE = {};
img.EVENTS = {};

function audio(data) {
    var channel = audio.CHANNELS[data.src], a;
    function ended() {        
        a.removeEventListener("ended", ended, false);
        data.ended && data.ended();
    }
    if(channel) {        
        var cache = data.cache === undefined || data.cache == true;
        for(var i = 0; i < channel.length && cache; i++) {
            a = channel[i];
            if(a.ended || a.paused && a.readyState == a.HAVE_ENOUGH_DATA) {
                if(data.autoplay) {
                    a.addEventListener("ended", ended);
                    a.play();
                }
                return;
            }
        }
    } else {
        audio.CHANNELS[data.src] = [];
    }
    audio.CHANNELS[data.src].push(a = new Audio());    
    a.addEventListener("loadeddata", function() {
        if(data.autoplay) {
            a.addEventListener("ended", ended);
            a.play();
        }
        data.loaded && data.loaded();
    });    
    a.src = data.src + "." + (data.ext || audio.SUPPORTED[0]);
}
audio.CHANNELS = {};
audio.SUPPORTED = [];
(function() {
    var a = new Audio();
    if(a.canPlayType) {
        if(a.canPlayType('audio/mpeg;') != "no") {
            audio.SUPPORTED.push("mp3");
        } else if(a.canPlayType('audio/wav; codecs="1"') != "no") {
            audio.SUPPORTED.push("wav");
        } else if(a.canPlayType('audio/ogg; codecs="vorbis"') != "no") {
            audio.SUPPORTED.push("ogg");    
        }
    }
}());

function Preload(r) {
    var i = 0;
    (function() {
        if(i < r.length) {
            var o = r[i++], to = typeof o;        
            if(to == "function") {
                o();
                arguments.callee();
            } else if(to == "number") {
                Preload.STATE = o;
                arguments.callee();
            } else {
                switch(Preload.STATE) {
                    case 1 : 
                        audio({
                            src : o,
                            loaded : arguments.callee
                        });
                        break;                
                    case 2 : 
                        img(o, arguments.callee);
                        break;
                    case 3 : 
                        ajax({
                            src : o,
                            response : "json",
                            success : arguments.callee
                        });
                        break;
                    case 4 : 
                        ajax({
                            src : o,
                            response : "text",
                            success : arguments.callee
                        });
                        break;
                    case 5 : 
                        ajax({
                            src : o,
                            response : "xml",
                            success : arguments.callee
                        });
                        break;
                    default : throw "Invalid State.";
                }
            }
        }
    }());
};
Preload.STATE = 0;
Preload.AUDIO = 1;
Preload.IMAGE = 2;
Preload.JSON = 3;
Preload.TEXT = 4;
Preload.XML = 5;

var __ERROR = 0.1;

function getLineLineIntersection(p1, p2, p3, p4) {
	var x1 = p1[0][0], x2 = p2[0][0], x3 = p3[0][0], x4 = p4[0][0], 
		y1 = p1[1][0], y2 = p2[1][0], y3 = p3[1][0], y4 = p4[1][0],
		x1x2 = x1 - x2, x3x4 = x3 - x4,
		y1y2 = y1 - y2, y3y4 = y3 - y4,
		det = x1x2 * y3y4 - y1y2 * x3x4;
	if(det) {
		var x1y2y1x2 = (x1 * y2) - (y1 * x2), 
			x3y4y3x4 = (x3 * y4) - (y3 * x4),
			x = (x1y2y1x2 * x3x4 - x1x2 * x3y4y3x4) / det,
			y = (x1y2y1x2 * y3y4 - y1y2 * x3y4y3x4) / det;
		if(moe(x, Math.min(x1, x2), Math.max(x1, x2), __ERROR) &&
			moe(x, Math.min(x3, x4), Math.max(x3, x4), __ERROR) &&
			moe(y, Math.min(y1, y2), Math.max(y1, y2), __ERROR) &&
			moe(y, Math.min(y3, y4), Math.max(y3, y4), __ERROR)) {
			return [[x], [y], [1]];
		}
	}
	return null;
}

function length(p1, p2) {
	var x = p2[0][0] - p1[0][0], y = p2[1][0] - p1[1][0];
	return Math.sqrt(x * x + y * y);
}

//returns a point representing the number of units that p1 must move to be equal to p2
function offset(p1, p2) {
	return [p2[0] - p1[0], p2[1] - p1[1], 0];
}

function moe(input, min, max, error) {
	return min - error <= input && input <= max + error;
}

function ready(f) {
	if(document.body && document.readyState == 'complete') {
		f();
	} else {
		if (window.addEventListener) {  
			window.addEventListener('load', f, false);
		} else {
			window.attachEvent('onload', f);
		}
	}
}

Array.prototype.shuffle = function() {
	for(var i = 0; i < this.length; i++) {
		this.swap(i, Math.floor(Math.random() * this.length));
	}
};

Array.prototype.swap = function(i, j) {
	var t = this[i];
	this[i] = this[j];
	this[j] = t;
};

Array.prototype.remove = Array.prototype.remove || function(e) {
    var index = this.indexOf(e);
    if(index != -1) {
	    return this.splice(index, 1)[0];
    }
};

Array.prototype.contains = Array.prototype.contains || function(e) {
	return this.indexOf(e) != -1;
};

Array.prototype.indexOf = Array.prototype.indexOf || function(e) {
	for(var i = 0; i < this.length; i++) {
		if(this[i] == e) {
			return i;
		}
	}
	return -1;
};

function getMouseLocation(e) {
	var el = e.currentTarget || e.target, xratio = el.width / el.clientWidth, yratio = el.height / el.clientHeight;	
    var bb = el.getBoundingClientRect();
	return [(e.pageX - bb.left) * xratio, (e.pageY - bb.top) * yratio, 1];
}

//MATRIX

function multiply(m, n) {
	if(m[0].length != n.length) {
		throw "The width of the first matrix must be equal to the height of the second.";
	}
	var r = [], sum;
	for(var i = 0; i < m.length; i++) { //current row
		r[i] = [];
		for(var j = 0; j < (n[0].length || 1); j++) { //current column
			sum = 0;
			for(var k = 0; k < n.length; k++) { //adds to both
				sum += (m[i][k] === undefined ? m[i] : m[i][k]) * (n[k][j] === undefined ? n[k] : n[k][j]);
			}
			r[i][j] = sum;
		}
	}
	return r;
}
	
function matrix_clone(m) {
	var n = [];
	for(var i = 0; i < m.length; i++) {
		n[i] = m[i].slice(0);
	}
	return n;
}

function inverse(m) {
	if(m.length != m[0].length) {
		throw "The matrix must be square.";
	}
	m = matrix_clone(m);
	var I = M();
	for(var i = 0; i < m.length; i++) { //i = current column and row
		var row = i;
		while(row < m.length && !m[row][i]) {
			row++;
		}
		if(row == m.length) {
			return 0;
		}
		var temp = m[row], val = m[row][i];
		m[row] = m[i];
		m[i] = temp;
		for(var j = 0; j < m[0].length; j++) { //the current column
			I[row][j] /= val;
			m[row][j] /= val;
		}			
		for(var j = 0; j < m.length; j++) { //the current row to manipulate
			if(i - j) {
				val = m[j][i];
				for(var k = 0; k < m[0].length; k++) { //the current column
					m[j][k] -= val * m[row][k];
					I[j][k] -= val * I[row][k];
				}			
			}
		}
	}
	return I;
}

function matrix_scale(m, x, y) {
	return multiply(m, [[x,0,0],[0,y,0],[0,0,1]]);
}

function matrix_translate(m, x, y) {
	return multiply(m, [[1,0,x],[0,1,y],[0,0,1]]);
}

function matrix_rotate(m, r) {
	return multiply(m, [[Math.cos(r),-Math.sin(r),0],[Math.sin(r),Math.cos(r),0],[0,0,1]]);
}

function M() {
	return [[1,0,0],[0,1,0],[0,0,1]];
}	

function object_is_model(obj, model) {
	for(var j in model) {
		if(model[j] != obj[j]) {
			return 0;
		}
	}
	return 1;
}

function H(start, end, times) {
	var r = [];
	for(; start < end; start++) {
		for(var i = 0; i < times; i++) {
			r.push(start);
		}
	}
	return r;
}

function step(number) {
    return function(value, range) {
        return Math.round(value / number) * number;
    };
}

function DEBUG(id, value) {
    var debug = document.getElementById("debug"), div = document.getElementById(id);;
    if(!debug) {        
        var main = document.createElement("div");
        for(;document.body.children.length > 0;) {
            var c = document.body.children[0];
            document.body.removeChild(c);
            main.appendChild(c);
        }
        document.body.appendChild(main);
        debug = document.createElement("div");
        debug.id = "debug";
        main.style.position = debug.style.position = "fixed";
        main.style.top = debug.style.bottom = debug.style.left = "0px";
        debug.style.backgroundColor = "white";
        debug.style.border = "1px solid black";
        main.style.width = debug.style.width = "100%";
        debug.style.height = "25%";
        main.style.height = "75%";
        main.style.overflow = debug.style.overflow = "auto";
        document.body.appendChild(debug);
    }
    if(!div) {
        div = document.createElement("div");
        div.id = id;
        debug.appendChild(div);
    }
    div.innerHTML = id + " : " + value;
}

function ajax(config) {
    var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"), data = "";
    if(config.cache) {
        data += "cache=" + new Date().getTime();
    }
    for(var i in config.data) {
        data += (data ? "&" : "") + escape(i) + "=" + escape(config.data[i]);
    }
    var assync = config.assync === undefined ? true : config.assync,
        response = ajax.RESPONSE[(config.response || "").toUpperCase()] || ajax.RESPONSE.TEXT;
    if((config.method || "").toUpperCase() == "POST") {
        xmlhttp.open("POST", config.src, assync);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send(data);
    } else {
        config.src += (config.src.indexOf("?") == -1 ? "?" : "&") + data;
        if(ajax.CACHE[config.src]) {
            if(config.success) {
                response(config.success, ajax.CACHE[config.src]);
            }
        } else {
            xmlhttp.open("GET", config.src, assync);
            xmlhttp.send();
        }
    }
    if(assync) {
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && config.success) {
                ajax.CACHE[config.src] = xmlhttp;
                response(config.success, xmlhttp);
            }
        };
    } else if(config.success) {
        response(config.success, xmlhttp);        
    }
}
ajax.CACHE = {};
ajax.RESPONSE = {
    JSON : function(success, xmlhttp) {
        try { success(JSON.parse(xmlhttp.responseText)); }
        catch (e) { success(xmlhttp.responseText); }
    },
    TEXT : function(success, xmlhttp) {
        success(xmlhttp.responseText);        
    },
    XML : function(success, xmlhttp) {
        success(xmlhttp.responseXML);
    }
};