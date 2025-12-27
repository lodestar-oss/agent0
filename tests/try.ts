const process = Bun.spawnSync({
  cwd: import.meta.dir,
  cmd: ["bun", "run", "long-script.ts"],
  timeout: 1000,
});

const stdout = process.stdout.toString();
const stderr = process.stderr.toString();
const exitCode = process.exitCode;
const signalCode = process.signalCode;

console.log("stdout:", stdout);
console.log("stderr:", stderr);
console.log("exitCode:", exitCode);
console.log("signalCode:", signalCode);
