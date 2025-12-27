console.write(`\nAI: Some message`);
console.write("\nYou: ");

let isBusy = false;
const consoleLines: string[] = [];
for await (const line of console) {
  if (line === "/end") {
    break;
  }
  if (line === "/busy") {
    isBusy = true;
    break;
  }
  consoleLines.push(line);
}

if (isBusy) {
  console.log({
    user: undefined,
    system: "The user is busy right now. Please try again later.",
  });
} else {
  const userMessage = consoleLines.join("\n").trim();
  if (!userMessage) {
    console.log({
      user: undefined,
      system: "The user did not provide a message.",
    });
  }

  console.log({
    user: userMessage,
    system: undefined,
  });
}
