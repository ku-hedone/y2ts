import http from 'http'
import { Method } from '../constant';

export interface Options {
  method?: Method;
  path: string;
  host: string;
}

const request = async <T = unknown>(config: Options): Promise<T> => {
  const { host, path, method } = config
  const options: http.RequestOptions = {
    method,
  }
  const response = await new Promise<T>((resolve, reject) => {
    const request = http.request(
      {
        host: host.replace(/^http(s?):\/\//g, ''),
        path,
        ...options,
      },
      res => {
        const RESPONSE: Uint8Array[] = []
        res.on('data', d => {
          RESPONSE.push(d)
        })
        res.on('end', () => {
          const response = JSON.parse(Buffer.concat(RESPONSE).toString())
          resolve(response.data || response)
        })
      },
    )
    request.on('error', e => {
      console.error('error', e);
      console.log(`get aip ${path}'s info has been failed`)
      reject(e)
    })
    request.end()
  })
  return response;
}

export default request
