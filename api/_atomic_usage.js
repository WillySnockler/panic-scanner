async function atomicDailyUsage(db, userId, usageDate, limit=1) {
  const rpc = await db('rpc/consume_deep_search', {
    method: 'POST',
    body: JSON.stringify({ p_user_id: userId, p_usage_date: usageDate, p_limit: limit })
  });
  return Number(rpc?.[0]?.allowed || 0) === 1;
}
module.exports = { atomicDailyUsage };
