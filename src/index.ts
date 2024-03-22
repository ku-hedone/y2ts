import { resolve } from 'path';
import { accessSync, mkdirSync, readFileSync } from 'fs';
import { longestCommonPrefixCompare } from './shared';
import Task from './core/task';
import Streams from './core/stream';
import Compiler from './core/complier';
import Processor from './core/processor';
import { getProjectByConfig, getCategoryListByProject } from './core/info';
import type { CLIArgs, Y2ApiConfig } from './types';

export const main = async ({
  host,
  token,
  exclude,
  include,
  requestApiPath,
}: {
  host: string;
  token: string;
  exclude?: string[] | number[];
  include?: string[] | number[];
  requestApiPath: string;
}) => {
  const processor = new Processor();
  const categoriesBase = await getProjectByConfig([{ host, token }]);
  const categoriesApis = await getCategoryListByProject(categoriesBase);
  const folderPath = resolve(process.cwd(), './src', './api');
  try {
    accessSync(folderPath);
  } catch (_e) {
    console.log('api folder not exist, will be create');
    mkdirSync(folderPath);
  }
  try {
    const excludeSet = new Set((exclude || []).map((i) => +i));
    const includeSet = new Set((include || []).map((i) => +i));
    for (const [id, YAPIs] of categoriesApis) {
      if (exclude && excludeSet.has(id)) {
        continue;
      }
      if (include && !includeSet.has(id)) {
        continue;
      }
      console.log('api record start', id);
      const category = categoriesBase.get(id);
      const basePath = category ? category.base : '';
      let LCP: string | undefined = void 0;
      let compare: string | null = null;
      const apis: string[] = [];

      const files = new Streams({
        uuid: id.toString(),
        cwd: folderPath,
        api: requestApiPath,
      });

      const complier = new Compiler();
      const tasks: Promise<void>[] = [];
      let count = 0;
      const n = YAPIs.length;

      const callback = () => {
        count++;
        console.log(`percent: ${count}/${n}`);
      };

      for (let i = 0; i < n; i++) {
        const api = YAPIs[i];
        if (compare === null) {
          compare = api.path;
        } else {
          if (compare !== '/') {
            LCP = compare = longestCommonPrefixCompare(compare, api.path);
          }
        }
        const task = new Task(api, basePath);
        apis.push(task.url);
        tasks.push(task.run(files, complier, processor, callback));
      }

      await Promise.allSettled(tasks);
      console.log('LCP', LCP);
      const hoisting = processor.reset();
      const resolves: Promise<{ code: string; name: string } | undefined>[] = [];

      for (const json of hoisting) {
        const typeName = json.title as string;
        resolves.push(complier.genTypings(processor.process(json), typeName));
      }

      const hoistingTypes = await Promise.allSettled(resolves);
      const hoistingTypesCode: string[] = [];
      hoistingTypes.forEach((i) => {
        if (i.status === 'fulfilled' && typeof i.value !== 'undefined') {
          hoistingTypesCode.push(i.value.code);
        }
      });
      let fileName = category ? category.desc : void 0;
      if (!fileName) {
        if (typeof LCP === 'string' && LCP.toString() !== '/') {
          // TODO 支持根据配置 决定生成 规则
          fileName = LCP.split('/')
            .filter((x) => !!x)
            .join('-');
        } else {
          console.error('invalid LCP');
          console.error('gen LCP for file name failed');
          console.error(`${categoriesBase.get(id)?.name} will be skip`);
          files.destroy();
          continue;
        }
      }

      await files.finished(
        fileName,
        complier.genMethod(),
        hoistingTypesCode.length ? hoistingTypesCode.join('\r\n') : void 0,
      );

      console.table(apis);
      console.log('api record end', id);
    }
  } catch (e) {
    console.error('err:', e);
    process.exit();
  }
};

const genApis = (args: CLIArgs) => {
  const { config, filter = [] } = args;
  try {
    accessSync(config);
    console.log(config);
  } catch (_e) {
    console.log('y2api config not exist, will be exist');
    process.exit();
  }
  try {
    const configJson = JSON.parse(readFileSync(config, 'utf-8')) as Y2ApiConfig;
    const filters = new Set(filter);
    Object.keys(configJson).forEach((i) => {
      if (!filters.has(i)) {
        const {
          host,
          token,
          requestApiPath = '@/api/request',
          ...other
        } = configJson[i];
        if (host) {
          main({
            host,
            token,
            requestApiPath,
            ...other,
          });
        } else {
          console.error('warning: there is no host');
        }

      }
    });
  } catch (e) {
    console.error('err:', e);
    process.exit();
  }
};

export default genApis;
