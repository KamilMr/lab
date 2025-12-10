# V8 Optimization Checklist

- [ ] Do my critical data objects have consistent, stable shapes?
- [ ] Are my performance-critical functions monomorphic?
- [ ] Have I run --trace-deopt on my hot paths to check for optimization bailouts?
- [ ] Have I profiled my application under load to confirm where the bottlenecks are?
- [ ] Is the memory layout of my objects and arrays as efficient as possible (e.g., avoiding holes, using Smis)?
- [ ] Have I measured the "before" and "after" to confirm my optimizations had a positive impact?
