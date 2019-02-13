#!/usr/bin/env node

import program from 'commander'
import compile from './compile'
import console from './console'
import create from './create'
import deploy from './deploy'
import exec from './exec'
import init from './init'
import network from './network'
import test from './test'

program
    .version('1.0.0')
    .description('The Giant Contracts Development Kit');

program
    .command('compile [name]')
    .description('')
    .action(compile);

program
    .command('console')
    .description('')
    .action(console);

program
    .command('create <type> <name>')
    .description('')
    .action(create);

program
    .command('deploy <name>')
    .description('Deploy smart contract by name')
    .option('-c, --clean', 'Clean development network data')
    .action(deploy);

program
    .command('exec <name> <method> <args>')
    .description('')
    .action(exec);

program
    .command('init')
    .description('Initialize a project')
    .action(init);

program
    .command('network [name]')
    .description('')
    .action(network);

program
    .command('test [name]')
    .description('')
    .action(test);

program.parse(process.argv);