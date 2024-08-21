#!/usr/bin/env node

require("dotenv").config({
  path: "path to the env",
});

const { exec } = require("child_process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fs = require("fs");

const SKB = "SKB";
const USER_SKB = "ec2-user";
const HOST_SKB = process.env.HOST_SKB;
const PEM_SKB = `${process.env.SSH_PATH}/dev0.pem`;

const SA = "SA";
const USER_SA = "ubuntu";
const HOST_SA = process.env.HOST_SA;
const PEM_SA = `${process.env.SSH_PATH}/dev-sa-1.pem`;

const set = {
  SA: {
    name: SA,
    user: USER_SA,
    host: HOST_SA,
    pem: PEM_SA,
  },
  SKB: {
    name: SKB,
    user: USER_SKB,
    host: HOST_SKB,
    pem: PEM_SKB,
  },
};

const requireOption = (argv, option) => {
  if (!argv[option]) {
    console.error(`Error: Missing required argument: --${option}`);
    // yargs.showHelp();
    process.exit(1);
  }
};

const argv = yargs(hideBin(process.argv))
  .option("method", {
    alias: "m",
    describe: "Choose method to execute",
    choices: ["cp", "cpDir", "con"],
    demandOption: true,
    type: "string",
  })
  .option("dest", {
    alias: "d",
    describe: "Destination set key",
    choices: ["SA", "SKB"],
    demandOption: true,
    type: "string",
  })
  .option("from", {
    alias: "f",
    describe: "Source path for copy",
    type: "string",
    dependsOn: ["method"], // require 'from' if 'method' is provided
  })
  .option("to", {
    alias: "t",
    describe: "Destination path for copy",
    type: "string",
    dependsOn: ["method"], // require 'to' if 'method' is provided
  })
  .middleware((argv) => {
    if (argv.method === "cp") {
      requireOption(argv, "from");
      requireOption(argv, "to");
    }
    if (argv.method === "cpDir") {
      requireOption(argv, "from");
      requireOption(argv, "to");
    }
  })
  .help().argv;

const obj = {
  con() {
    const conf = set[argv.dest];
    const { spawn } = require("child_process");

    const sshSession = spawn(
      "ssh",
      ["-i", conf.pem, `${conf.user}@${conf.host}`],
      {
        stdio: "inherit", // This option will bind the stdin, stdout, and stderr of the ssh session to the current process
        shell: true,
      },
    );

    sshSession.on("close", (code) => {
      console.log(`SSH session closed with exit code ${code}`);
    });
  },
  cpDir({ from, to }) {
    const conf = set[argv.dest];
    exec(
      `scp -i ${conf.pem} -r ${from} ${conf.user}@${conf.host}:/home/${conf.user}${to}`,
      (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
          console.log(`exec error: ${error}`);
        }
      },
    );
  },
  cp({ from, to }) {
    const conf = set[argv.dest];
    exec(
      `scp -i ${conf.pem} ${from} ${conf.user}@${conf.host}:/home/${conf.user}${to}`,
      (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
          console.log(`exec error: ${error}`);
        }
      },
    );
  },
};

if (argv.method in obj) {
  obj[argv.method](argv);
} else {
  yargs.showHelp();
}
