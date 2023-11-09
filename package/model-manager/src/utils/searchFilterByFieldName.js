const searchFilterGenerator = (filter, searchFields, searchTerm) => {
  const searchFieldsArray = searchFields.reduce((acc, field, index, array) => {
    acc.push(`$${field}`);
    if (index < array.length - 1) {
      acc.push(" ");
    }
    return acc;
  }, []);
  return Object.assign(filter, {
    $expr: {
      $regexMatch: {
        input: { $concat: searchFieldsArray },
        regex: searchTerm,
        options: "i",
      },
    },
  });
};
module.exports = searchFilterGenerator;
