import * as Service from '../service';
import type { Api } from '../types/api';
import type { Category } from '../types/category';

export const getProject = async ({
  token,
  host,
}: {
  host: string;
  token: string;
}): Promise<[Map<number, Category>, string]> => {
  const [project, base] = await Service.getProject({ token, host });

  const list = await Service.getCategoryList({
    token,
    host,
    project_id: project._id,
  });

  const record = new Map<number, Category>();

  list.forEach((category) => {
    record.set(category._id, category);
  });

  return [record, base] as const;
};

export const getCategoryList = async (
  categories: Map<number, Category>,
  {
    host,
    token,
  }: {
    host: string;
    token: string;
  },
) => {
  const record = new Map<number, Api[]>();
  const executed: Promise<void>[] = [];

  for (const [_, category] of categories) {
    const list: Promise<Api>[] = [];
    category.list.forEach((api) => {
      list.push(Service.getApi({ host, token, id: api._id }));
    });

    executed.push(
      new Promise((resolve) => {
        Promise.allSettled(list).then((res) => {
          const apis: Api[] = [];
          res.forEach((api) => {
            if (api.status === 'fulfilled') {
              apis.push(api.value);
            }
          });
          record.set(category._id, apis);
          resolve();
        });
      }),
    );
  }

  await Promise.allSettled(executed);

  return record;
};
