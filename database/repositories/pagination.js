export const pagination = async (model, page, limit, isDesc) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const itemsCount = await model.countDocuments().exec();

  const results = {
    results: {},
    pag: {},
  };

  results.pag.currentPage = page;
  results.pag.limit = limit;
  results.pag.pagesCount = Math.ceil(itemsCount / limit);

  if (endIndex < itemsCount) results.next = { page: page + 1, limit: limit };
  if (startIndex > 0) results.prev = { page: page - 1, limit: limit };

  results.results = await model
    .find()
    .sort({ createdAt: isDesc ? -1 : 1 })
    .limit(limit)
    .skip(startIndex);

  return results;
};
