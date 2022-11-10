import { createServer, Server, IncomingMessage } from 'http';

export type ParsedRequest<TBody extends string | object> = IncomingMessage & {
  body: TBody;
  params: URLSearchParams;
};

/**
 * Create a mock http server that receives requests and returns responses.
 *
 * Requests will be processed and passed to (get|post|put|delete) methods. The
 * return value of these methods will be used as the response. If the return
 * value is a string, it will be sent as-is. If it is an object, it will be
 * stringified and sent as JSON. If the response is a Promise, it will be
 * resolved before sending.
 */
export class MockServer {
  server: Server;
  port: number;

  get url() {
    return `http://localhost:${this.port}`;
  }

  constructor() {
    this.server = createServer(async (request, response) => {
      const body = await this.readRequestBody(request);
      const method = String(request.method).toLowerCase();
      const params = new URL(String(request.url), 'http://localhost')
        .searchParams;

      try {
        // @ts-ignore
        const handler = this[method];
        const result = await handler({ ...request, body, params });
        const stringResult =
          typeof result === 'string' ? result : JSON.stringify(result);

        response.end(stringResult);
      } catch (error) {
        response.statusCode = 500;

        const stringResult =
          typeof error === 'string' ? error : JSON.stringify(error);

        response.end(stringResult);
      }
    });

    const instance = this.server.listen();

    // Get the port that the server is listening on.
    const { port } = instance.address() as { port: number };

    this.port = port;
  }

  destroy() {
    this.server.close();
    this.server.unref();
  }

  readRequestBody<T>(request: IncomingMessage): Promise<T> {
    return new Promise<string>((resolve) => {
      let body = '';

      request.on('data', (chunk: string) => {
        body += chunk;
      });

      request.on('end', () => {
        resolve(body);
      });
    }).then((body) => {
      try {
        return JSON.parse(body);
      } catch (e) {
        return body;
      }
    });
  }

  async get<T>(_request: ParsedRequest<any>) {
    return { method: 'get', status: 'success' } as T;
  }

  async post<T>(_request: ParsedRequest<any>) {
    return { method: 'post', status: 'success' } as T;
  }

  async put<T>(_request: ParsedRequest<any>) {
    return { method: 'put', status: 'success' } as T;
  }

  async delete<T>(_request: ParsedRequest<any>) {
    return { method: 'delete', status: 'success' } as T;
  }
}
