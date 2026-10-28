function parseDate(value) {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const dayFirstDate = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (dayFirstDate) {
    const [, day, month, year] = dayFirstDate;
    const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day));
    const parsedDate = new Date(timestamp);

    if (
      parsedDate.getUTCFullYear() === Number(year) &&
      parsedDate.getUTCMonth() === Number(month) - 1 &&
      parsedDate.getUTCDate() === Number(day)
    ) {
      return timestamp;
    }

    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getItemTimestamp(item) {
  const timestamp =
    parseDate(item.date) ??
    parseDate(item.createdAt) ??
    parseDate(item.created_at) ??
    parseDate(item.timestamp);

  if (timestamp !== null) {
    return timestamp;
  }

  const id = item._id ?? item.id;
  if (typeof id === "string" && /^[a-f\d]{24}$/i.test(id)) {
    return Number.parseInt(id.slice(0, 8), 16) * 1000;
  }

  return null;
}

export default function sortByDateDescending(items) {
  return [...items]
    .map((item, index) => ({ item, index, timestamp: getItemTimestamp(item) }))
    .sort((left, right) => {
      if (left.timestamp === null && right.timestamp !== null) return 1;
      if (left.timestamp !== null && right.timestamp === null) return -1;
      if (left.timestamp !== right.timestamp) {
        return (right.timestamp ?? 0) - (left.timestamp ?? 0);
      }
      return left.index - right.index;
    })
    .map(({ item }) => item);
}
