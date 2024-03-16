import BluePrint from './blue-print';
import Compiler from './complier';
import Processor from './processor';
import Streams from './stream';
import type { Api, BluePrintInstance, ParamsType } from '../types';
import type { JSONSchema4 } from 'json-schema';

const STATIC_KEY = ['query', 'path', 'request', 'response'] as const;
class Task {
  instance: BluePrintInstance;
  constructor(api: Api, basePath: string) {
    this.instance = new BluePrint(api, basePath).instance;
  }

  get url() {
    return this.instance.url;
  }

  async run(stream: Streams, complier: Compiler, processor: Processor, cb: () => void) {
    try {
      const tasks: Promise<{ code: string; name: string } | void>[] = [];
      // gen complier tasks
      STATIC_KEY.forEach((v) => {
        const value = this.instance[
          v as keyof BluePrintInstance
        ] as ParamsType<JSONSchema4>;
        if (typeof value !== 'undefined') {
          tasks.push(complier.genTypings(processor.process(value.type), value.name));
        }
      });
      // complier jsonschema to ts code
      const types = await Promise.allSettled(tasks);
      // clear complier tasks
      tasks.length = 0;
      // gen writing tasks
      types.forEach((type) => {
        if (type.status === 'fulfilled' && typeof type.value !== 'undefined') {
          const { code, name } = type.value;
          tasks.push(
            stream.writeTyping(`${code}\r\n`),
            stream.writeImportTyping(`\t${name},\n`),
          );
        }
      });
      // write code to file
      await Promise.allSettled(tasks);
      // clear writing tasks
      tasks.length = 0;

      await stream.writeCode(complier.genCode(this.instance));
      cb();
    } catch (e) {
      console.error('err:', e);
      console.error(`${this.instance.url} will be skip`);
    }
  }
}

export default Task;
