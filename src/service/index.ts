import request from './request';
import { Method } from '../constant';
import type { Category, Project } from '../types/category';
import type { Api } from '../types/api';

interface ProjectInfo {
  /**
   * 服务地址
   */
  host: string;
  /**
   * 项目Token
   */
  token: string;
}
/**
 *
 * 获取项目
 *
 */
export const getProject = async ({ host, token }: ProjectInfo) => {
  const { basepath, ...res } = await request<Project & { basepath: string }>({
    host,
    path: `/api/project/get?token=${token}`,
    method: Method.GET,
  });
  // project._url = `${host}/project/${project._id}/interface/api`
  return [res, `/${basepath || '/'}`.replace(/\/+$/, '').replace(/^\/+/, '/')] as const;
};
/**
 * 根据 projectToken + projectId 获取当前项目下的所有 interface 详情
 */
export const getCategoryList = async ({
  host,
  token,
  project_id,
}: ProjectInfo & { project_id: number }) => {
  const res = await request<Category[]>({
    host,
    path: `/api/interface/list_menu?token=${token}&project_id=${project_id}`,
    method: Method.GET,
  });
  return res;
};

/**
 * 获取 接口 id 获取 接口详情
 */

export const getApi = async ({ host, token, id }: ProjectInfo & { id: number }) => {
  const res = await request<Api>({
    host,
    path: `/api/interface/get?token=${token}&id=${id}`,
    method: Method.GET,
  });
  return res;
};