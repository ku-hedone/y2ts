import * as Service from '../service';
import type { Api, CategoryList, FullCategory, Project } from '../types';

export const getProjectByConfig = async (configs: { host: string; token: string }[]) => {
  const projects: Promise<
    Project & { categories: CategoryList; token: string; host: string }
  >[] = [];

  configs.forEach((config) => {
    const { token, host } = config;
    return projects.push(
      Service.getProject({ token, host }).then(async (res) => {
        const categories = await Service.getCategoryList({
          token,
          host,
          project_id: res._id,
        });
        return {
          ...res,
          categories,
          token,
          host,
        };
      }),
    );
  });

  const record = new Map<number, FullCategory>();

  for await (const project of projects) {
    const { categories, token, host } = project;
    categories.forEach((category) => {
      record.set(category._id, {
        ...category,
        project_id: project._id,
        project_name: project.name,
        base: project.basepath,
        token,
        host,
      });
    });
  }

  return record;
};

export const getCategoryListByProject = async (categories: Map<number, FullCategory>) => {
    const record = new Map<number, Api[]>();

    const executed: Promise<void>[] = [];

    for (const [_, category] of categories) {
        const list: Promise<Api>[] = [];
        const { host, token, _id } = category;
        category.list.forEach((api) => {
            list.push(Service.getApiInformation({ host, token, id: api._id }))
        })

        executed.push(new Promise((resolve) => {
            Promise.allSettled(list).then((res) => {
                const value: Api[] = [];
                res.forEach((api) => {
                    if (api.status === 'fulfilled') {
                        value.push(api.value)
                    }
                })
                record.set(_id, value);
                resolve();
            });
        }))
    }

    await Promise.allSettled(executed)

    return record;
}