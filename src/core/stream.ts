import {
  ReadStream,
  createWriteStream,
  createReadStream,
  WriteStream,
  rmSync,
  existsSync
} from 'node:fs';
import { rename } from 'node:fs/promises';
import { PassThrough } from 'node:stream';
import { resolve } from 'node:path';
import * as helper from '../util/stream-helper';

type WriteStreamType = 'codes' | 'typings' | 'imports';

class Streams {
  typings: WriteStream;
  imports: WriteStream;
  codes: WriteStream;
  names: Record<WriteStreamType, string>;
  cwd: string;
  api: string;
  status: 'uninitialized' | 'initialized';
  constructor(options: { uuid: string; cwd: string; api: string }) {
    const temp = Date.now();
    const { uuid, cwd, api } = options;
    this.cwd = cwd;
    this.api = api;
    this.names = {
      codes: resolve(cwd, `${uuid}-${temp}-codes.ts`),
      typings: resolve(cwd, `${uuid}-${temp}-typings.ts`),
      imports: resolve(cwd, `${uuid}-${temp}-imports.ts`),
    };
    this.status = 'uninitialized';
    this.codes = createWriteStream(this.names.codes);
    this.typings = createWriteStream(this.names.typings);
    this.imports = createWriteStream(this.names.imports);
  }

  private write(code: string | ReadStream, writeStream: WriteStream | PassThrough) {
    return new Promise((resolve) => {
      writeStream.write(code, resolve);
    });
  }

  async writeTyping(code: string) {
    await this.write(code, this.typings);
  }

  async writeCode(code: string) {
    await this.write(code, this.codes);
  }

  async writeImportTyping(code: string) {
    if (this.status === 'uninitialized') {
      this.status = 'initialized';
      await this.write(`import type {\n`, this.imports);
    }
    await this.write(code, this.imports);
  }

  private rm(paths: WriteStreamType[]) {
    paths.forEach((path) => {
      const stream = this[path];
      try {
        if (stream.bytesWritten === 0 || typeof stream.bytesWritten === 'undefined') {
          stream.end(() => {
            if (existsSync(this.names[path])) {
              rmSync(this.names[path]);
            }
          });
        } else {
          if (existsSync(this.names[path])) {
            rmSync(this.names[path]);
          }
        }
      } catch (error) {
        console.error(`error: ${error}`);
        console.error(`Failed to remove file: ${this.names[path]}`);
      }
    });
  }

  private async pass(type: WriteStreamType, through: PassThrough) {
    const readStream = createReadStream(this.names[type]);
    return new Promise((resolve, reject) => {
      readStream.pipe(through, {
        end: false,
      });
      readStream.on('end', (e: unknown) => {
        if (e) {
          console.error('on readStream error', e);
          reject(e);
        }
        resolve(void 0);
      });
    });
  }

  private async writeImports(apisFile: WriteStream, methods: string[]) {
    await this.write(
      helper.generatorImportCode({ api: this.api, methods }),
      apisFile,
    );
  }

  async finished(name: string, method: string[], hoistingCode?: string) {
    if (typeof this.codes.bytesWritten !== 'undefined' && this.codes.bytesWritten !== 0) {
      if (hoistingCode) {
        const typingFile = createWriteStream(resolve(this.cwd, `${name}.type.ts`));
        await this.write(hoistingCode, typingFile);
        const passThrough = new PassThrough();
        passThrough.pipe(typingFile);
        await this.pass('typings', passThrough);
      } else {
        // rename temp typings file to final typings file
        if (this.typings.bytesWritten !== 0) {
          await rename(this.names.typings, resolve(this.cwd, `${name}.type.ts`));
        }
      }
      // 当存在 内容时 才生成 文件
      const passThrough = new PassThrough();
      const apisFile = createWriteStream(resolve(this.cwd, `${name}.ts`));
      passThrough.pipe(apisFile);
      if (method.length) {
        await this.writeImports(apisFile, method);
      }
      if (this.imports.bytesWritten !== 0) {
        await this.write(`} from './${name}.type'; \n`, this.imports);
        await this.pass('imports', passThrough);
      }
      await this.pass('codes', passThrough);
    }
    this.destroy();
  }

  /**
   * 删除临时文件
   */
  destroy() {
    this.rm(['codes', 'typings', 'imports']);
  }
}

export default Streams;
