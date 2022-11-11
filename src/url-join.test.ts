import { urljoin } from './url-join';

describe('url-join', () => {
  it('should join urls', () => {
    expect(urljoin('test', 'test')).toEqual('test/test');
  });

  it('should join urls with query', () => {
    expect(urljoin('test', 'test', 'test?test')).toEqual('test/test/test?test');
  });
});
