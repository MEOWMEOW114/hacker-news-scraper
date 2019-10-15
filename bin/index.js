#! /usr/bin/env node

const yargs = require('yargs');
const cli = require('./cli.js');

const MAX_POSTS = 100;

const { p : count} = yargs.usage('Usage: --posts <count>')
    .option('p', {
        alias: 'posts',
        describe: `how many posts to print. A positive integer <= ${MAX_POSTS}.`,
        type: 'integer',
        demandOption: true,
    })
    .argv;

if (!Number.isInteger(count)) {
    console.log(`posts param should be integer.`)
} else if (count < 0 || count > MAX_POSTS ) {
    console.log(`posts param should be positive integer <= ${MAX_POSTS}.`)
} else {
    cli(count);
}

