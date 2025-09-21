const tests = [
  require('./qr-data.test.js'),
];

let passed = 0;
let failed = 0;

for (const suite of tests) {
  for (const [name, fn] of Object.entries(suite)) {
    try {
      fn();
      console.log('✓', name);
      passed++;
    } catch (e) {
      console.error('✗', name, '\n ', e && e.message || e);
      failed++;
    }
  }
}

console.log(`\nTests: ${passed + failed}, Passed: ${passed}, Failed: ${failed}`);
if (failed > 0) process.exit(1);

