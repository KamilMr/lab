# V8 Profiling Commands

A quick reference for the commands you'll use most often.

## Basic CPU Profiling

```bash
# 1. Generate the V8 log file
node --prof my_app.js

# 2. Process the log file into a human-readable summary
node --prof-process isolate-XXXX-v8.log > profile.txt
```

## Remote Debugging & Profiling with Chrome DevTools

```bash
# Run your app with the inspect flag
node --inspect my_app.js

# Or to break on the first line:
node --inspect-brk my_app.js
```

Then open `chrome://inspect` in your Chrome browser.

## Tracing JIT Compiler Behavior

```bash
# See what gets optimized
node --trace-opt my_script.js

# See what gets deoptimized (and why)
node --trace-deopt my_script.js

# See Inline Cache state changes
node --trace-ic my_script.js

# Combine and filter for a specific function
node --trace-opt --trace-deopt my_script.js | grep "myHotFunction"
```

## Using V8 Intrinsics for Benchmarking/Debugging

```bash
# Must be run with --allow-natives-syntax
node --allow-natives-syntax my_benchmark.js
```

Common intrinsics: `%HaveSameMap(obj1, obj2)`, `%GetOptimizationStatus(func)`, `%OptimizeFunctionOnNextCall(func)`.

---

Source: https://www.thenodebook.com/node-arch/v8-engine-intro#appendix-v8-profiling-commands
