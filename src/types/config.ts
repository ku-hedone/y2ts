type Ids = string[] | number[];

type MainConfig = {
  host?: string;
  /**
   * project unique token
   */
  token: string;
  /**
   * default value: @/api/request
   */
  requestApiPath?: string;
};
/**
 * 共享的配置。
 */
export interface Y2ApiConfig {
  /**
   * project name
   */
  [key: string]: MainConfig &
    (
      | {
          /**
           * categories which will be gen
           */
          exclude?: Ids;
        }
      | {
          /**
           * categories which will be gen
           */
          include?: Ids;
        }
    );
}

export interface CLIArgs {
  /**
   * y2ts config path
   */
  config: string;
  /**
   * projects which will be gen
   */
  filter?: string[];
}
