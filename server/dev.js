const nodemon = require("nodemon");

let shutdownRequested = false;
let resetStarted = false;

const handleSignal = () => {
    shutdownRequested = true;
};

const finishNodemon = (exitCode) => {
    if (!shutdownRequested || resetStarted) {
        return;
    }

    resetStarted = true;
    nodemon.emit("reset", () => {
        process.exitCode = exitCode;
    });
};

process.on("SIGINT", handleSignal);
process.on("SIGTERM", handleSignal);

nodemon.on("exit", () => finishNodemon(0));
nodemon.on("crash", () => finishNodemon(1));

nodemon({
    script: "server.js",
    signal: "SIGTERM"
});
