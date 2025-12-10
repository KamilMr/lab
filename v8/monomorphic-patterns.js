// A small example
// Talk is cheap. Let's see what this performance difference actually looks like with a real benchmark.
// This pattern is incredibly common in data processing.
//
// Run with: node --allow-natives-syntax monomorphic-patterns.js

const ITERATIONS = 10000000;

class Point2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Point3D {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

// This function's call site is MONOMORPHIC. It will always see Point2D objects.
// V8 will heavily optimize this.
function getX_Monomorphic(point) {
  return point.x;
}

// This function's call site is POLYMORPHIC. It will see two different shapes.
// V8 can handle this, but it's slower.
function getX_Polymorphic(point) {
  return point.x;
}

// ========= BENCHMARK =============

// Prime the functions so V8 can optimize them
for (let i = 0; i < 1000; i++) {
  getX_Monomorphic(new Point2D(i, i));
  // Pass both shapes to the polymorphic function
  getX_Polymorphic(new Point2D(i, i));
  getX_Polymorphic(new Point3D(i, i, i));
}

console.time("Monomorphic");
let mono_sum = 0;
for (let i = 0; i < ITERATIONS; i++) {
  mono_sum += getX_Monomorphic(new Point2D(i, i));
}
console.timeEnd("Monomorphic");

console.time("Polymorphic");
let poly_sum = 0;
for (let i = 0; i < ITERATIONS; i++) {
  // Alternate between the two shapes
  const point = i % 2 === 0 ? new Point2D(i, i) : new Point3D(i, i, i);
  poly_sum += getX_Polymorphic(point);
}
console.timeEnd("Polymorphic");

// Note: Ensure sums are used to prevent V8 from optimizing away the loops.
console.log(mono_sum, poly_sum);
