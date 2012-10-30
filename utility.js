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
	return this.splice(this.indexOf(e), 1)[0];
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
	var el = e.currentTarget, xratio = el.width / el.clientWidth, yratio = el.height / el.clientHeight;		
	return [e.clientX * xratio, e.clientY * yratio, 1];
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
		if(model[j] !== obj[j]) {
			return 0;
		}
	}
	return 1;
}