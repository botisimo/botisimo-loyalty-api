export const urljoin = (...args: string[]) => {
  const a = args.join('/');
  const [base, params] = a.split('?');

  return base.replace(/\/+/g, '/') + (params ? `?${params}` : '');
};
