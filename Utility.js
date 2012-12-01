/*global Image, Audio, window, XMLHttpRequest, ActiveXObject, escape, Sprite, document*/
(function () {
    'use strict';
	var ERROR = 0.1,
		Utility = {
            //uses cache by default
			ajax: function (config) {
				var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"),
                    data = "",
                    i,
                    assync = config.assync === undefined ? true : config.assync,
					response = Utility.ajax.RESPONSE[(config.response || "").toUpperCase()] || Utility.ajax.RESPONSE.TEXT;
				if (config.refresh) {
					data += "refresh=" + new Date().getTime();
				}
				for (i in config.data) {
					if (config.data.hasOwnProperty(i)) {
						data += (data ? "&" : "") + escape(i) + "=" + escape(config.data[i]);
					}
				}
				if ((config.method || "").toUpperCase() === "POST") {
					xmlhttp.open("POST", config.src, assync);
					xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					xmlhttp.send(data);
				} else {
					config.src += (config.src.indexOf("?") === -1 ? "?" : "&") + data;
					if (Utility.ajax.CACHE[config.src]) {
						if (config.success) {
							response(config.success, Utility.ajax.CACHE[config.src]);
						}
					} else {
						xmlhttp.open("GET", config.src, assync);
						xmlhttp.send();
					}
				}
				if (assync) {
					xmlhttp.onreadystatechange = function () {
						if (xmlhttp.readyState === 4 && xmlhttp.status === 200 && config.success) {
							Utility.ajax.CACHE[config.src] = xmlhttp;
							response(config.success, xmlhttp);
						}
					};
				} else if (config.success) {
					response(config.success, xmlhttp);
				}
			},
            //always uses cache
			img: function (src, onload) {
				var i, e;
				if ((i = Utility.img.CACHE[src]) === undefined) {
					i = Utility.img.CACHE[src] = new Image();
					i.src = src;
				}
				if (onload) {
					if (i.complete) {
						onload(i);
					} else {
						if ((e = Utility.img.EVENTS[src]) === undefined) {
							e = Utility.img.EVENTS[src] = [];
							i.onload = function () {
								var j;
								for (j in e) {
									if (e.hasOwnProperty(j)) {
										e[j](i);
									}
								}
							};
						}
						e.push(onload);
					}
				}
				return i;
			},
            //uses cache by default
			audio: function (data) {
				var channel = Utility.audio.CHANNELS[data.src],
					a,
                    cache = data.cache === undefined || data.cache,
					i;

				function ended() {
					a.removeEventListener("ended", ended, false);
					if (data.ended) {
						data.ended();
					}
				}
				if (channel) {
					if (cache) {
						for (i = 0; i < channel.length; i = i + 1) {
							a = channel[i];
							if ((a.ended || a.paused) && a.readyState === a.HAVE_ENOUGH_DATA) {
								if (data.autoplay) {
									a.addEventListener("ended", ended);
									a.play();
								}
								return;
							}
						}
					}
				} else {
					Utility.audio.CHANNELS[data.src] = [];
				}
				Utility.audio.CHANNELS[data.src].push(a = new Audio());
				a.addEventListener("loadeddata", function () {
					if (data.autoplay) {
						a.addEventListener("ended", ended);
						a.play();
					}
					if (data.loaded) {
						data.loaded();
					}
				});
				a.src = data.src + "." + (data.ext || Utility.audio.SUPPORTED[0]);
			},
			moe: function (input, min, max, error) {
				return min - error <= input && input <= max + error;
			},
			getLineLineIntersection: function (p1, p2, p3, p4) {
				var x1 = p1[0][0],
					x2 = p2[0][0],
					x3 = p3[0][0],
					x4 = p4[0][0],
					y1 = p1[1][0],
					y2 = p2[1][0],
					y3 = p3[1][0],
					y4 = p4[1][0],
					x1x2 = x1 - x2,
					x3x4 = x3 - x4,
					y1y2 = y1 - y2,
					y3y4 = y3 - y4,
					det = x1x2 * y3y4 - y1y2 * x3x4,
					x1y2y1x2,
                    x3y4y3x4,
                    x,
                    y;
				if (det) {
					x1y2y1x2 = (x1 * y2) - (y1 * x2);
					x3y4y3x4 = (x3 * y4) - (y3 * x4);
					x = (x1y2y1x2 * x3x4 - x1x2 * x3y4y3x4) / det;
					y = (x1y2y1x2 * y3y4 - y1y2 * x3y4y3x4) / det;
					if (Utility.moe(x, Math.min(x1, x2), Math.max(x1, x2), ERROR) && Utility.moe(x, Math.min(x3, x4), Math.max(x3, x4), ERROR) && Utility.moe(y, Math.min(y1, y2), Math.max(y1, y2), ERROR) && Utility.moe(y, Math.min(y3, y4), Math.max(y3, y4), ERROR)) {
						return [[x], [y], [1]];
					}
				}
				return null;
			},
			length: function (p1, p2) {
				var x = p2[0][0] - p1[0][0],
					y = p2[1][0] - p1[1][0];
				return Math.sqrt(x * x + y * y);
			},
			//returns a point representing the number of units that p1 must move to be equal to p2
			offset: function (p1, p2) {
				return [p2[0] - p1[0], p2[1] - p1[1], 0];
			},
			ready: function (f) {
				if (document.body && document.readyState === 'complete') {
					f();
				} else {
					if (window.addEventListener) {
						window.addEventListener('load', f, false);
					} else {
						window.attachEvent('onload', f);
					}
				}
			},
			getMouseLocation: function (e) {
				var el = e.currentTarget || e.target,
					xratio = el.width / el.clientWidth,
					yratio = el.height / el.clientHeight,
					bb = el.getBoundingClientRect();
				return [(e.pageX - bb.left) * xratio, (e.pageY - bb.top) * yratio, 1];
			},
			object_is_model: function (obj, model) {
				var j;
				for (j in model) {
					if (model[j] !== obj[j]) {
						return 0;
					}
				}
				return 1;
			},
			H: function (start, end, times) {
				var r = [],
					i;
				while (start < end) {
					for (i = 0; i < times; i = i + 1) {
						r.push(start);
					}
					start += 1;
				}
				return r;
			},
			step: function (number) {
				return function (value) {
					return Math.round(value / number) * number;
				};
			}
		},
		Matrix = {
			create: function () {
				return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
			},
			multiply: function (m, n) {
				var r = [],
					sum,
                    i,
                    j,
                    k;
				if (m[0].length !== n.length) {
					throw "The width of the first matrix must be equal to the height of the second.";
				}
				for (i = 0; i < m.length; i = i + 1) { //current row
					r[i] = [];
					for (j = 0; j < (n[0].length || 1); j = j + 1) { //current column
						sum = 0;
						for (k = 0; k < n.length; k = k + 1) { //adds to both
							sum += (m[i][k] === undefined ? m[i] : m[i][k]) * (n[k][j] === undefined ? n[k] : n[k][j]);
						}
						r[i][j] = sum;
					}
				}
				return r;
			},
			clone: function (m) {
				var n = [],
					i;
				for (i = 0; i < m.length; i = i + 1) {
					n[i] = m[i].slice(0);
				}
				return n;
			},
			inverse: function (m) {
				var I = Matrix.create(),
					i,
                    row,
                    temp,
                    val,
                    j,
                    k;
				if (m.length !== m[0].length) {
					throw "The matrix must be square.";
				}
				m = Matrix.clone(m);
				for (i = 0; i < m.length; i = i + 1) { //i = current column and row
					row = i;
					while (row < m.length && !m[row][i]) {
						row += 1;
					}
					if (row === m.length) {
						return 0;
					}
					temp = m[row];
					val = m[row][i];
					m[row] = m[i];
					m[i] = temp;
					for (j = 0; j < m[0].length; j = j + 1) { //the current column
						I[row][j] /= val;
						m[row][j] /= val;
					}
					for (j = 0; j < m.length; j = j + 1) { //the current row to manipulate
						if (i - j) {
							val = m[j][i];
							for (k = 0; k < m[0].length; k = k + 1) { //the current column
								m[j][k] -= val * m[row][k];
								I[j][k] -= val * I[row][k];
							}
						}
					}
				}
				return I;
			},
			scale: function (m, x, y) {
				return Matrix.multiply(m, [
					[x, 0, 0],
					[0, y, 0],
					[0, 0, 1]
				]);
			},
			translate: function (m, x, y) {
				return Matrix.multiply(m, [
					[1, 0, x],
					[0, 1, y],
					[0, 0, 1]
				]);
			},
			rotate : function (m, r) {
				return Matrix.multiply(m, [
					[Math.cos(r), -Math.sin(r), 0],
					[Math.sin(r), Math.cos(r), 0],
					[0, 0, 1]
				]);
			}
		};

	Array.prototype.shuffle = function () {
		var i;
		for (i = 0; i < this.length; i = i + 1) {
			this.swap(i, Math.floor(Math.random() * this.length));
		}
	};

	Array.prototype.swap = function (i, j) {
		var t = this[i];
		this[i] = this[j];
		this[j] = t;
	};

	Array.prototype.remove = Array.prototype.remove || function (e) {
		var index = this.indexOf(e);
		if (index !== -1) {
			return this.splice(index, 1)[0];
		}
	};

	Array.prototype.contains = Array.prototype.contains || function (e) {
		return this.indexOf(e) !== -1;
	};

	Array.prototype.indexOf = Array.prototype.indexOf || function (e) {
		var i;
		for (i = 0; i < this.length; i = i + 1) {
			if (this[i] === e) {
				return i;
			}
		}
		return -1;
	};

	function DEBUG(id, value) {
		var debug = document.getElementById("debug"),
			div = document.getElementById(id),
			main,
            c;
		if (!debug) {
			main = document.createElement("div");
			while (document.body.children.length > 0) {
				c = document.body.children[0];
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
		if (!div) {
			div = document.createElement("div");
			div.id = id;
			debug.appendChild(div);
		}
		div.innerHTML = id + " : " + value;
	}

	Utility.ajax.CACHE = {};
	Utility.ajax.RESPONSE = {
		JSON: function (success, xmlhttp) {
			var json;
			try {
				json = JSON.parse(xmlhttp.responseText);
			} catch (e) {
				success(e);
			}
			if (json) {
				success(json);
			}
		},
		TEXT: function (success, xmlhttp) {
			success(xmlhttp.responseText);
		},
		XML: function (success, xmlhttp) {
			success(xmlhttp.responseXML);
		}
	};
	Utility.audio.CHANNELS = {};
	Utility.audio.SUPPORTED = [];
	Utility.img.CACHE = {};
	Utility.img.EVENTS = {};
	(function () {
		var a = new Audio();
		if (a.canPlayType) {
			if (a.canPlayType('audio/mpeg;') !== "no") {
				Utility.audio.SUPPORTED.push("mp3");
			} else if (a.canPlayType('audio/wav; codecs="1"') !== "no") {
				Utility.audio.SUPPORTED.push("wav");
			} else if (a.canPlayType('audio/ogg; codecs="vorbis"') !== "no") {
				Utility.audio.SUPPORTED.push("ogg");
			}
		}
	}());

	function Preload(r) {
		var i = -1,
			func = function () {
				if (i < r.length) {
					var o = r[i = i + 1],
						to = typeof o;
					if (to === "function") {
						o(func);
					} else if (to === "number") {
						Preload.STATE = o;
						func();
					} else {
						switch (Preload.STATE) {
						case Preload.AUDIO:
							Utility.audio({
								src: o,
								loaded: func,
                                cache: 0
							});
							break;
						case Preload.IMAGE:
							Utility.img(o, func);
							break;
						case Preload.JSON:
							Utility.ajax({
								src: o,
								response: "json",
								success: func
							});
							break;
						case Preload.TEXT:
							Utility.ajax({
								src: o,
								response: "text",
								success: func
							});
							break;
						case Preload.XML:
							Utility.ajax({
								src: o,
								response: "xml",
								success: func
							});
							break;
						case Preload.SPRITE:
							Utility.ajax({
								src: o,
								response: "json",
								success: function (json) {
                                    for(var i in json) {
                                        if(json.hasOwnProperty(i)) {
                                            Sprite.MODELS[i] = json[i];
                                        }
                                    }
									func();
								}
							});
							break;
                        case Preload.STAGE:                            
                            Utility.ajax({
								src: o,
								response: "xml",
								success: function(xml) {
                                    loadStage(xml, func);
								}
							});
                            break;
						default:
							throw "Invalid State " + Preload.STATE + ".";
						}
					}
				}
			};
		func();
	}
    
    var TYPE = {
        E : 1,
        A : 2,
        T : 3,
        C : 8,
        D : 9
    }, PARSE = {
        "N" : parseInt,
        "A" : JSON.parse,
        "S" : function(v) {return v;},
        "V" : function(v) {
            var scope = window;
            v = v.split(".");
            for(var i = 0; i < v.length; i++) {
                scope = scope[v[i]];
            }
            return scope;
        }
    };
    
    function loadStage(stage, callback) {
        var c = stage.documentElement.childNodes, i = -1, func = function() {
            i++;
            if(i < c.length) {
                if(c[i].nodeType == TYPE.E) {
                    switch(c[i].nodeName.toLowerCase()) {
                        case "functions":
                            loadStage.Functions(c[i], func);
                            break;
                        case "preload":
                            loadStage.Preload(c[i].childNodes[0].nodeValue, func);
                            break;
                        case "stages":
                            var d = c[i].childNodes;
                            for(var j = 0; j < d.length; j++) {
                                if(d[j].nodeType == TYPE.E) {                            
                                    var c2d = window[d[j].nodeName];
                                    loadStage.Stages(d[j], func, 0, c2d);
                                }
                            }
                            break;
                        default:
                            throw "Unrecognized tag group " + c[i].nodeName + ".";
                    }
                } else {
                    func();
                }
            } else {
                callback();
            }
        };
        func();
    }
    
    loadStage.Functions = function(parent, callback, scope, obj_scope, parent_obj_scope) {        
        scope = scope || "";
        obj_scope = obj_scope || Sprite.FUNCTIONS;
        var f, hasNodes = 0, name, i, new_scope, new_obj_scope, text = "", args, functions = parent.childNodes, call, tocall = window, args = [];
        for(i = 0; i < functions.length; i++) {
            f = functions[i];
            if(f.nodeType === TYPE.E) {
                name = f.nodeName;
                new_scope = scope + (scope ? "." : "") + name;
                new_obj_scope = Sprite.FUNCTIONS[new_scope] = obj_scope[name] = obj_scope[name] || {};
                loadStage.Functions(f, callback, new_scope, new_obj_scope, obj_scope);
                hasNodes = 1;
            } else if(f.nodeType === TYPE.T) {
                text += f.nodeValue;
            }
        }
        if(!hasNodes && scope) { //then I should do something special with this node
            if(parent.attributes.call) {
                call = parent.attributes.call.nodeValue.split(".");    
                for(var i = 0; i < call.length; i++) {
                    tocall = tocall[call[i]];
                }                
                if(parent.attributes.args && parent.attributes.types) {
                    args = parent.attributes.args.nodeValue.split(",");
                    for(var i = 0; i < args.length; i++) {
                        args[i] = PARSE[parent.attributes.types.nodeValue[i]](args[i]);
                    }
                }
                Sprite.FUNCTIONS[scope] = parent_obj_scope[parent.nodeName] = tocall.apply(window, args);
            } else if(parent.attributes.type) {
                    Sprite.FUNCTIONS[scope] = parent_obj_scope[parent.nodeName] = JSON.parse(text);
            } else {
                var args = [text];
                if(parent.attributes.args) {
                    args = parent.attributes.args.nodeValue.split(",").concat(args);                
                }
                Sprite.FUNCTIONS[scope] = parent_obj_scope[parent.nodeName] = Function.apply(new Function(), args);
            }
        }
        if(!scope) {
            callback();
        }
    };
    
    loadStage.Preload = function(preload, callback) {
        if(preload) {
            preload = preload.split(/\s+/);
            for(var i = 0; i < preload.length; i++) {                
                if((preload[i] = Preload[preload[i]] || preload[i]) === "") {
                    preload.splice(i, 1);
                    i -= 1;
                }
            }
            preload.push(callback);
            Preload(preload);
        } else {
            callback();
        }       
    };
    
    loadStage.Stages = function(stages, callback, parent, c2d) {
        var sprite, c = stages.childNodes, n;
        for(var i = 0; i < c.length; i++) {
            n = c[i];
            if(n.nodeType === TYPE.E) {                        
                sprite = new Sprite(n.nodeName);
                if(n.attributes.name) {
                    c2d.setStage(n.attributes.name.nodeValue, sprite);
                }
                if(parent) {
                    parent.add(sprite);
                }
                loadStage.Stages(n, callback, sprite, c2d);
            }
        }
        if(!parent) {
            callback();
        }
    };

	Preload.STATE = 0;
	Preload.AUDIO = 1;
	Preload.IMAGE = 2;
	Preload.JSON = 3;
	Preload.TEXT = 4;
	Preload.XML = 5;
	Preload.SPRITE = 6;
    Preload.STAGE = 7;
    window.DEBUG = DEBUG;
	window.Preload = Preload;
	window.Utility = Utility;
    window.Matrix = Matrix;
}());