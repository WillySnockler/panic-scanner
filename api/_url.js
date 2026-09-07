function makeUrl(path, params) {
  const base = 'https://www.alphavantage.co/query';
  const url = new URL(base);
  for (const [key, value] of Object.entries({ ...params, ...path })) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url.toString();
}
module.exports = { makeUrl };
