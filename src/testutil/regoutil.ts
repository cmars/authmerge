import * as child_process from 'child_process';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

import {loadPolicy} from '@open-policy-agent/opa-wasm';

import {Policy} from '../auth';

/**
 * Test utility functions for rego policies.
 *
 * These functions are only intended for use tests. Production authmerge
 * applications should operate on precompiled WASM, or delegate rego compilation
 * to a dedicated service API.
 */

/**
 * Load a compiled OPA rego policy WASM file.
 *
 * @param path Path to WASM file
 * @returns Policy
 */
export const loadPolicyFromFile = async (path: string): Promise<Policy> => {
  const wasmContents = await fs.readFile(path);
  return await loadPolicy(wasmContents);
};

/**
 * Compile an OPA rego policy source file to WASM and load it. This function
 * shells out to the `opa` command, which must be in the process executable
 * $PATH.
 *
 * @param path Path to OPA rego source file
 * @returns Policy
 */
export const loadPolicyFromSource = async (
  regoSource: string
): Promise<Policy> => {
  const origcwd = process.cwd();
  const tempdir = await fs.mkdtemp((await fs.realpath(os.tmpdir())) + path.sep);
  try {
    process.chdir(tempdir);
    await fs.writeFile('policy.rego', regoSource);
    child_process.execFileSync(
      'opa',
      ['build', '-t', 'wasm', '-e', 'authmerge/allow', 'policy.rego'],
      {
        cwd: tempdir,
      }
    );
    child_process.execFileSync(
      'tar',
      ['-xvf', 'bundle.tar.gz', '/policy.wasm'],
      {
        cwd: tempdir,
      }
    );
    return await loadPolicyFromFile('policy.wasm');
  } finally {
    process.chdir(origcwd);
    await fs.rm(tempdir, {recursive: true, force: true});
  }
};
