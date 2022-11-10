import { MockServer } from './server.mock';
import axios from 'axios';

describe('MockServer', () => {
  const server = new MockServer();
  const api = axios.create({ baseURL: server.url });

  beforeEach(() => jest.clearAllMocks());

  afterAll(() => {
    server.destroy();
  });

  it('should have a url with .port', () => {
    expect(server.url).toEqual(`http://localhost:${server.port}`);
  });

  it('should handle JSON response', async () => {
    jest.spyOn(server, 'get').mockResolvedValueOnce({ foo: 'bar' });
    const response = await api.get('/');
    expect(response.data).toEqual({ foo: 'bar' });
  });

  it('should handle TEXT response', async () => {
    jest.spyOn(server, 'get').mockResolvedValueOnce('foo');
    const response = await api.get('/');
    expect(response.data).toEqual('foo');
  });

  it('should handle text error response', async () => {
    jest.spyOn(server, 'get').mockRejectedValueOnce('foo');
    const response = await api.get('/', { validateStatus: () => true });

    expect(response.status).toEqual(500);
    expect(response.data).toEqual('foo');
  });

  it('should handle JSON error response', async () => {
    jest.spyOn(server, 'get').mockRejectedValueOnce({ foo: 'bar' });
    const response = await api.get('/', { validateStatus: () => true });

    expect(response.status).toEqual(500);
    expect(response.data).toEqual({ foo: 'bar' });
  });

  it('should handle multi-chunk data', async () => {
    jest.spyOn(server, 'post').mockImplementationOnce(async (request) => {
      return request.body;
    });
    const buffer = Buffer.from(new Array(1e2).fill('a').join(''));
    const request = api.post('/', buffer);

    await expect(request).resolves.toBeDefined();
    const response = await request;
    expect(response.status).toEqual(200);
    expect(response.data).toEqual(buffer.toString());
  });

  it('should handle a GET request', async () => {
    const spy = jest.spyOn(server, 'get');
    const result = api.get('/');

    await expect(result).resolves.toBeDefined();

    const response = await result;
    expect(response).toHaveProperty('status', 200);
    expect(response).toHaveProperty('data', {
      method: 'get',
      status: 'success',
    });
    expect(spy).toHaveBeenCalled();
  });

  it('should handle a POST request', async () => {
    const spy = jest.spyOn(server, 'post');
    const result = api.post('/');

    await expect(result).resolves.toBeDefined();

    const response = await result;
    expect(response).toHaveProperty('data', {
      method: 'post',
      status: 'success',
    });
    expect(response).toHaveProperty('status', 200);
    expect(spy).toHaveBeenCalled();
  });

  it('should handle a PUT request', async () => {
    const spy = jest.spyOn(server, 'put');
    const result = api.put('/');

    await expect(result).resolves.toBeDefined();

    const response = await result;
    expect(response).toHaveProperty('data', {
      method: 'put',
      status: 'success',
    });
    expect(response).toHaveProperty('status', 200);
    expect(spy).toHaveBeenCalled();
  });

  it('should handle a delete request', async () => {
    const spy = jest.spyOn(server, 'delete');
    const result = api.delete('/');

    await expect(result).resolves.toBeDefined();

    const response = await result;
    expect(response).toHaveProperty('data', {
      method: 'delete',
      status: 'success',
    });
    expect(response).toHaveProperty('status', 200);
    expect(spy).toHaveBeenCalled();
  });
});
