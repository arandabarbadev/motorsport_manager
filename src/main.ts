import { runTestHarness } from './test-harness';

// Phase 1 entry point: run the simulation harness and show its report.
const report = runTestHarness();
console.log(report);

const pre = document.getElementById('output') as HTMLPreElement | null;
if (pre) pre.textContent = report;
