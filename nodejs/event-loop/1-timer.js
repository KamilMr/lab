// helper function to log the timer callback with the delay
const timerCallback = (a, b) => console.log(`Timer callback ${a} delayed by ${Date.now() - start - b}`);

// get the start time
const start = Date.now();

// Interesting to see how timers are executed and delayed.

// set the timers
setTimeout(timerCallback, 100, "100 ms", 100);
setTimeout(timerCallback, 0, "0 ms", 0);
// for (let i = 1; i <= 1e9; i++);
setTimeout(timerCallback, 1, "1 ms", 1);
setTimeout(timerCallback, 300, "300 ms", 300);
