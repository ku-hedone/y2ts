#!/usr/bin/env node
import genApis from './index';
import { resolve } from 'path';
import pkg from '../package.json';

console.log(`${pkg.name} version: ${pkg.version}`);

const filter: string[] = [];
let flag: string;
let config: string = '';

process.argv.forEach((i) => {
  if (flag === 'p') {
    config = resolve(process.cwd(), i);
  }
  if (flag === 'filter') {
    filter.push(i);
  }
  if (i === '--p') {
    flag = 'p';
  }
  if (i === '--filter') {
    flag = 'filter';
  }
});

genApis({
  config,
  filter: filter.length ? filter : void 0,
});
