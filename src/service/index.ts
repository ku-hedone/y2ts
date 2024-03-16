import request from './request';
import { Method } from '../constant';
import type { Api, CategoryList, Project } from '../types';

interface RequestParams {
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
export const getProject = async ({ host, token }: RequestParams) => {
  const project = await request<Project>({
    host,
    path: `/api/project/get?token=${token}`,
    method: Method.GET,
  });
  project.basepath = `/${project.basepath || '/'}`
    .replace(/\/+$/, '')
    .replace(/^\/+/, '/');
  // project._url = `${host}/project/${project._id}/interface/api`
  return project;
};
/**
 * 根据 projectToken + projectId 获取当前项目下的所有 interface 详情
 */
export const getCategoryList = async ({
  host,
  token,
  project_id,
}: RequestParams & { project_id: number }) => {
  const categoryList = await request<CategoryList>({
    host,
    path: `/api/interface/list_menu?token=${token}&project_id=${project_id}`,
    method: Method.GET,
  });
  return categoryList;
};

/**
 * 获取 接口 id 获取 接口详情
 */

export const getApiInformation = async ({
  host,
  token,
  id,
}: RequestParams & { id: number }) => {
  const api = await request<Api>({
    host,
    path: `/api/interface/get?token=${token}&id=${id}`,
    method: Method.GET,
  });
  return api;
};