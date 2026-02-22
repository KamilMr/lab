// Switch vs If/Else performance benchmark
//
// Common claim: switch is O(1) because values are hashed, if/else is O(n)
// Reality in V8: if/else with simple comparisons is often FASTER than switch
// V8's TurboFan compiler optimizes both aggressively — the "hash table" myth
// does not hold for modern JavaScript engines

const ITERATIONS = 1_000_000_000;

function benchmarkIfElse(val) {
  let result;
  if (val === 0) result = 'zero';
  else if (val === 1) result = 'one';
  else if (val === 2) result = 'two';
  else if (val === 3) result = 'three';
  else if (val === 4) result = 'four';
  else if (val === 5) result = 'five';
  else if (val === 6) result = 'six';
  else if (val === 7) result = 'seven';
  else if (val === 8) result = 'eight';
  else if (val === 9) result = 'nine';
  return result;
}

function benchmarkSwitch(val) {
  let result;
  switch (val) {
    case 0: result = 'zero'; break;
    case 1: result = 'one'; break;
    case 2: result = 'two'; break;
    case 3: result = 'three'; break;
    case 4: result = 'four'; break;
    case 5: result = 'five'; break;
    case 6: result = 'six'; break;
    case 7: result = 'seven'; break;
    case 8: result = 'eight'; break;
    case 9: result = 'nine'; break;
  }
  return result;
}

// Warm up both functions so V8 compiles them via TurboFan
for (let i = 0; i < 10_000; i++) {
  benchmarkIfElse(i % 10);
  benchmarkSwitch(i % 10);
}

function runBenchmark(testValue, label) {
  console.log(`--- ${label} (value: ${testValue}) ---`);

  const ifStart = performance.now();
  for (let i = 0; i < ITERATIONS; i++) benchmarkIfElse(testValue);
  const ifTime = performance.now() - ifStart;

  const switchStart = performance.now();
  for (let i = 0; i < ITERATIONS; i++) benchmarkSwitch(testValue);
  const switchTime = performance.now() - switchStart;

  const faster = ifTime < switchTime ? 'if/else' : 'switch';
  const ratio = ifTime < switchTime
    ? (switchTime / ifTime).toFixed(2)
    : (ifTime / switchTime).toFixed(2);

  console.log(`if/else:  ${ifTime.toFixed(2)} ms`);
  console.log(`switch:   ${switchTime.toFixed(2)} ms`);
  console.log(`Winner:   ${faster} (${ratio}x faster)\n`);
}

console.log(`Iterations: ${ITERATIONS.toLocaleString()}\n`);

runBenchmark(0, 'Best case for if/else (first branch)');
runBenchmark(5, 'Middle case (branch 6 of 10)');
runBenchmark(9, 'Worst case for if/else (last branch)');
