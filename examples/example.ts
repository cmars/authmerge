#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

import {loadPolicy} from '@open-policy-agent/opa-wasm';

const main = async () => {
  const policyWasm = fs.readFileSync(path.join(__dirname, 'example.wasm'));
  const policy = await loadPolicy(policyWasm);
  console.log('put', policy.evaluate({action: 'put'}));
  console.log('set', policy.evaluate({action: 'set'}));
};

process.exitCode = 1;
main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch(e => {
    console.log(e);
  });
