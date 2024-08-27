#!/usr/bin/env node

const {execSync} = require('child_process');
const path = require('path');
const fs = require('fs');

// Directories
const BIN_DIR = path.resolve(process.env.HOME, 'bin');
const BIN_CONF_DIR = path.resolve(process.env.HOME, 'bin/conf');

const NVIM_CONF_BACKUP = path.resolve(BIN_CONF_DIR, 'nvim');
const NVIM_DIR_SOURCE = path.resolve(process.env.HOME, '.config/nvim');

// files
const TMUX_CONF_BACKUP = path.join(BIN_CONF_DIR, '.tmux.conf');
const TMUX_CONF_SOURCE = path.resolve(process.env.HOME, '.tmux.conf');

const I3_CONF_BACKUP = path.join(BIN_CONF_DIR, 'i3/config');
const I3_CONF_SOURCE = path.resolve(process.env.HOME, '.config/i3/config');

const I3_BLOCKS_BACKUP = path.join(BIN_CONF_DIR, 'i3/i3blocks.config');
const I3_BLOCKS_SOURCE = path.resolve(
  process.env.HOME,
  '.config/i3blocks/config',
);

const BASHRC_BACKUP = path.join(BIN_CONF_DIR, 'bashrc');
const BASHRC_SOURCE = path.resolve(process.env.HOME, '.bashrc');

const copyFromConfToSource = () => {
  // .tmux.conf
  try {
    fs.copyFileSync(TMUX_CONF_BACKUP, TMUX_CONF_SOURCE);
    fs.cpSync(I3_CONF_BACKUP, I3_CONF_SOURCE, {recursive: true});
    fs.cpSync(NVIM_CONF_BACKUP, NVIM_DIR_SOURCE, {recursive: true});
    fs.copyFileSync(I3_BLOCKS_BACKUP, I3_BLOCKS_SOURCE);
    fs.copyFileSync(BASHRC_BACKUP, BASHRC_SOURCE);
  } catch (err) {
    console.error(`Failed to copy from conf to destination:`, err.message);
  }
};

// Updated copyFromDestToConf function
const copyFromDestToConf = () => {
  try {
    fs.copyFileSync(TMUX_CONF_SOURCE, TMUX_CONF_BACKUP);
    fs.copyFileSync(I3_CONF_SOURCE, I3_CONF_BACKUP);
    fs.copyFileSync(I3_BLOCKS_SOURCE, I3_BLOCKS_BACKUP);
    fs.copyFileSync(BASHRC_SOURCE, BASHRC_BACKUP);

    fs.cpSync(I3_CONF_SOURCE, I3_CONF_BACKUP, {recursive: true});
    fs.cpSync(NVIM_DIR_SOURCE, NVIM_CONF_BACKUP, {recursive: true});
    console.log('Configuration files successfully backed up to BIN_CONF_DIR');
  } catch (err) {
    console.error('Failed to copy from destination to conf:', err.message);
  }
};

// Update function: git add, commit, and push
const update = () => {
  try {
    execSync('git add .');
    execSync('git commit -m "update"');
    console.log(`Pushing `);
    execSync('git push');
  } catch (err) {
    console.error(`Failed to update :`, err.message);
  }
};

// Pull function: git pull
const pull = () => {
  try {
    console.log(`Pulling `);
    execSync('git pull');
  } catch (err) {
    console.error(`Failed to pull :`, err.message);
  }
};

// Map functions to args
const args = process.argv[2];

switch (args) {
  case 'push':
    copyFromDestToConf();
    update();
    break;
  case 'pull':
    pull();
    copyFromConfToSource();
    break;
  default:
    console.log('Usage: node script.js {push|pull}');
    process.exit(1);
}
