import { MockServer } from './server.mock';
import { urljoin } from '../url-join';
import fetch from 'node-fetch';

describe('MockServer', () => {
  const server = new MockServer();

  beforeEach(() => jest.clearAllMocks());

  afterAll(() => {
    server.destroy();
  });

  it('should have a url with .port', () => {
    expect(server.url).toEqual(`http://localhost:${server.port}`);
  });

  it('should handle JSON response', async () => {
    jest.spyOn(server, 'get').mockResolvedValueOnce({ foo: 'bar' });
    const response = (await fetch(server.url)).json();
    expect(response).resolves.toEqual({ foo: 'bar' });
  });

  it('should handle TEXT response', async () => {
    jest.spyOn(server, 'get').mockResolvedValueOnce('foo');
    const response = (await fetch(server.url)).text();
    expect(response).resolves.toEqual('foo');
  });

  it('should handle text error response', async () => {
    jest.spyOn(server, 'get').mockRejectedValueOnce('foo');
    const response = await fetch(server.url);

    expect(response.status).toEqual(500);
    expect(response.text()).resolves.toEqual('foo');
  });

  it('should handle JSON error response', async () => {
    jest.spyOn(server, 'get').mockRejectedValueOnce({ foo: 'bar' });
    const response = await fetch(server.url);

    expect(response.status).toEqual(500);
    expect(response.json()).resolves.toEqual({ foo: 'bar' });
  });

  it('should handle multi-chunk data', async () => {
    jest.spyOn(server, 'post').mockImplementationOnce(async (request) => {
      return request.body;
    });
    const buffer = Buffer.from(new Array(1e2).fill('a').join(''));
    const request = fetch(urljoin(server.url, '/'), {
      method: 'POST',
      body: buffer,
    });

    await expect(request).resolves.toBeDefined();
    const response = await request;
    expect(response.status).toEqual(200);
    expect(response.text()).resolves.toEqual(buffer.toString());
  });

  it('should handle a GET request', async () => {
    const spy = jest.spyOn(server, 'get');
    const result = fetch(server.url);

    await expect(result).resolves.toBeDefined();

    const response = await result;
    expect(response).toHaveProperty('status', 200);
    expect(response.json()).resolves.toEqual({
      method: 'get',
      status: 'success',
    });
    expect(spy).toHaveBeenCalled();
  });

  it('should handle a POST request', async () => {
    const spy = jest.spyOn(server, 'post');
    const result = fetch(server.url, {
      method: 'POST',
      body: JSON.stringify({ foo: 'bar' }),
    });

    await expect(result).resolves.toBeDefined();

    const response = await result;
    expect(response.json()).resolves.toEqual({
      method: 'post',
      status: 'success',
    });
    expect(response).toHaveProperty('status', 200);
    expect(spy).toHaveBeenCalled();
  });

  it('should handle a PUT request', async () => {
    const spy = jest.spyOn(server, 'put');
    const result = fetch(server.url, { method: 'PUT' });

    await expect(result).resolves.toBeDefined();

    const response = await result;
    expect(response.json()).resolves.toEqual({
      method: 'put',
      status: 'success',
    });
    expect(response).toHaveProperty('status', 200);
    expect(spy).toHaveBeenCalled();
  });

  it('should handle a delete request', async () => {
    const spy = jest.spyOn(server, 'delete');
    const result = fetch(server.url, { method: 'DELETE' });

    await expect(result).resolves.toBeDefined();

    const response = await result;
    expect(response.json()).resolves.toEqual({
      method: 'delete',
      status: 'success',
    });
    expect(response).toHaveProperty('status', 200);
    expect(spy).toHaveBeenCalled();
  });
});
