function seed(seed){
	c.player.seed = seed || Math.random();
	c.settings.mapSeed = c.player.seed;
	prng = new PRNG(c.player.seed);
	//simplexNoise = new SimplexNoise(window); //should use the window.random() method, which links to our PRNG;
	classicalNoise = new ClassicalNoise(window);
}

//PRNG stuff
function PRNG(seed) {
	this.m = 0x80000000; // 2**31;
	this.a = 1103515245;
	this.c = 12345;

	this.state = seed ? seed : Math.floor(Math.random() * (this.m-1));
}
PRNG.prototype.nextInt = function() {
	this.state = (this.a * this.state + this.c) % this.m;
	return this.state;
};
PRNG.prototype.nextFloat = function() {
	// returns in range [0,1]
	return this.nextInt() / (this.m - 1);
};

function random(){
	if (prng){
		return prng.nextFloat();
	} else {
		throw new Error("PRNG not initialised")
	}
}

// From https://gist.github.com/banksean/304522
var SimplexNoise = function(r) {
	if (r == undefined) r = Math;
	this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
		[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
		[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
	this.p = [];
	for (var i=0; i<256; i++) {
		this.p[i] = Math.floor(r.random()*256);
	}
	// To remove the need for index wrapping, double the permutation table length
	this.perm = [];
	for(var i=0; i<512; i++) {
		this.perm[i]=this.p[i & 255];
	}

	// A lookup table to traverse the simplex around a given point in 4D.
	// Details can be found where this table is used, in the 4D noise method.
	this.simplex = [
		[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],
		[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],
		[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
		[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],
		[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],
		[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
		[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],
		[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]];
};
SimplexNoise.prototype.dot = function(g, x, y) {
	return g[0]*x + g[1]*y;
};
SimplexNoise.prototype.noise = function(xin, yin) {
	var n0, n1, n2; // Noise contributions from the three corners
	// Skew the input space to determine which simplex cell we're in
	var F2 = 0.5*(Math.sqrt(3.0)-1.0);
	var s = (xin+yin)*F2; // Hairy factor for 2D
	var i = Math.floor(xin+s);
	var j = Math.floor(yin+s);
	var G2 = (3.0-Math.sqrt(3.0))/6.0;
	var t = (i+j)*G2;
	var X0 = i-t; // Unskew the cell origin back to (x,y) space
	var Y0 = j-t;
	var x0 = xin-X0; // The x,y distances from the cell origin
	var y0 = yin-Y0;
	// For the 2D case, the simplex shape is an equilateral triangle.
	// Determine which simplex we are in.
	var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
	if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1)
	else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1)
	// A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
	// a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
	// c = (3-sqrt(3))/6
	var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
	var y1 = y0 - j1 + G2;
	var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
	var y2 = y0 - 1.0 + 2.0 * G2;
	// Work out the hashed gradient indices of the three simplex corners
	var ii = i & 255;
	var jj = j & 255;
	var gi0 = this.perm[ii+this.perm[jj]] % 12;
	var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12;
	var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12;
	// Calculate the contribution from the three corners
	var t0 = 0.5 - x0*x0-y0*y0;
	if(t0<0) n0 = 0.0;
	else {
		t0 *= t0;
		n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient
	}
	var t1 = 0.5 - x1*x1-y1*y1;
	if(t1<0) n1 = 0.0;
	else {
		t1 *= t1;
		n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
	}
	var t2 = 0.5 - x2*x2-y2*y2;
	if(t2<0) n2 = 0.0;
	else {
		t2 *= t2;
		n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
	}
	// Add contributions from each corner to get the final noise value.
	// The result is scaled to return values in the interval [-1,1].
	return 70.0 * (n0 + n1 + n2);
};

function noise(x, y){
	//if (simplexNoise){
		//return (simplexNoise.noise(x, y)+1)/2;
	if (classicalNoise){
		var result = (classicalNoise.noise(x, y, 1) + 1) / 2;
		return result;
	} else {
		throw new Error("Noise algorithm not initialised")
	}
}

var ClassicalNoise = function(r) { // Classic Perlin noise in 3D, for comparison
	if (r == undefined) r = Math;
	this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
		[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
		[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
	this.p = [];
	for (var i=0; i<256; i++) {
		this.p[i] = Math.floor(r.random()*256);
	}
	// To remove the need for index wrapping, double the permutation table length
	this.perm = [];
	for(var i=0; i<512; i++) {
		this.perm[i]=this.p[i & 255];
	}
};
ClassicalNoise.prototype.dot = function(g, x, y, z) {
	return g[0]*x + g[1]*y + g[2]*z;
};
ClassicalNoise.prototype.mix = function(a, b, t) {
	return (1.0-t)*a + t*b;
};
ClassicalNoise.prototype.fade = function(t) {
	return t*t*t*(t*(t*6.0-15.0)+10.0);
};
// Classic Perlin noise, 3D version
ClassicalNoise.prototype.noise = function(x, y, z) {
	// Find unit grid cell containing point
	var X = Math.floor(x);
	var Y = Math.floor(y);
	var Z = Math.floor(z);

	// Get relative xyz coordinates of point within that cell
	x = x - X;
	y = y - Y;
	z = z - Z;

	// Wrap the integer cells at 255 (smaller integer period can be introduced here)
	X = X & 255;
	Y = Y & 255;
	Z = Z & 255;

	// Calculate a set of eight hashed gradient indices
	var gi000 = this.perm[X+this.perm[Y+this.perm[Z]]] % 12;
	var gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]] % 12;
	var gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]] % 12;
	var gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]] % 12;
	var gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]] % 12;
	var gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]] % 12;
	var gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]] % 12;
	var gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]] % 12;

	// The gradients of each corner are now:
	// g000 = grad3[gi000];
	// g001 = grad3[gi001];
	// g010 = grad3[gi010];
	// g011 = grad3[gi011];
	// g100 = grad3[gi100];
	// g101 = grad3[gi101];
	// g110 = grad3[gi110];
	// g111 = grad3[gi111];
	// Calculate noise contributions from each of the eight corners
	var n000= this.dot(this.grad3[gi000], x, y, z);
	var n100= this.dot(this.grad3[gi100], x-1, y, z);
	var n010= this.dot(this.grad3[gi010], x, y-1, z);
	var n110= this.dot(this.grad3[gi110], x-1, y-1, z);
	var n001= this.dot(this.grad3[gi001], x, y, z-1);
	var n101= this.dot(this.grad3[gi101], x-1, y, z-1);
	var n011= this.dot(this.grad3[gi011], x, y-1, z-1);
	var n111= this.dot(this.grad3[gi111], x-1, y-1, z-1);
	// Compute the fade curve value for each of x, y, z
	var u = this.fade(x);
	var v = this.fade(y);
	var w = this.fade(z);
	// Interpolate along x the contributions from each of the corners
	var nx00 = this.mix(n000, n100, u);
	var nx01 = this.mix(n001, n101, u);
	var nx10 = this.mix(n010, n110, u);
	var nx11 = this.mix(n011, n111, u);
	// Interpolate the four results along y
	var nxy0 = this.mix(nx00, nx10, v);
	var nxy1 = this.mix(nx01, nx11, v);
	// Interpolate the two last results along z
	var nxyz = this.mix(nxy0, nxy1, w);

	return nxyz;
};