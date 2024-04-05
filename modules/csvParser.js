// csvParser.js
export const parseCSV = (csvText) => {
  const lines = csvText.trim().split("\n");
  const headers = lines
    .shift()
    .split(",")
    .map((header) => header.trim().replace(/^"|"$/g, ""));
  return lines.map((line) => {
    const data = line
      .split(",")
      .map((value) => value.trim().replace(/^"|"$/g, ""));
    return headers.reduce((obj, header, index) => {
      obj[header] = data[index];
      return obj;
    }, {});
  });
};
