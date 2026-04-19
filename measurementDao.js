const supabase = require("../supabaseClient");

const TABLE = "measurement";
const MAX_NOI = 1000;

/**
 * Creates a new measurement record.
 * @param {object} uuObject - The measurement data to insert.
 * @returns {object} The created measurement record.
 */
async function create(uuObject) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([uuObject])
    .select()
    .single();

  if (error) throw new Error(`DB create failed: ${error.message}`);
  return data;
}

/**
 * Returns a single measurement by filter (e.g. { id }).
 * @param {object} filter - Key-value filter object.
 * @returns {object|null} The found measurement or null.
 */
async function get(filter) {
  let query = supabase.from(TABLE).select("*");

  for (const [key, value] of Object.entries(filter)) {
    query = query.eq(key, value);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`DB get failed: ${error.message}`);
  }

  return data;
}

/**
 * Returns a paginated list of measurements with optional filters.
 * @param {object} filters - { device_id?, dateFrom?, dateTo? }
 * @param {object} pageInfo - { pageIndex, pageSize }
 * @returns {{ itemList: object[], pageInfo: object }}
 */
async function list(filters = {}, pageInfo = {}) {
  const pageIndex = pageInfo.pageIndex ?? 0;
  const pageSize = Math.min(pageInfo.pageSize ?? 50, MAX_NOI);
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from(TABLE).select("*", { count: "exact" });

  if (filters.device_id) {
    query = query.eq("device", filters.device_id);
  }

  if (filters.dateFrom) {
    query = query.gte("sys_cts", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("sys_cts", filters.dateTo);
  }

  query = query.order("sys_cts", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(`DB list failed: ${error.message}`);

  return {
    itemList: data,
    pageInfo: {
      pageIndex,
      pageSize,
      total: count,
    },
  };
}

/**
 * Deletes a measurement record by id.
 * @param {string} id - The measurement UUID.
 */
async function deleteById(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) throw new Error(`DB delete failed: ${error.message}`);
}

module.exports = { create, get, list, deleteById };
