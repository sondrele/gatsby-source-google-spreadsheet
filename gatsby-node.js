const Sheets = require("node-sheets").default;
const createNodeHelpers = require("gatsby-node-helpers").default;
const camelCase = require("camelcase");

exports.sourceNodes = async ({ actions, createNodeId }, pluginOptions) => {
  const { createNode } = actions;
  const {
    spreadsheetId,
    spreadsheetName = "",
    typePrefix = "GoogleSpreadsheet",
    credentials,
    mapValue = value => value,
    mapKey = key => camelCase(key)
  } = pluginOptions;

  const { createNodeFactory } = createNodeHelpers({
    typePrefix
  });

  const gs = new Sheets(spreadsheetId);

  if (credentials) {
    await gs.authorizeJWT(credentials);
  }

  const promises = (await gs.getSheetsNames()).map(async sheetTitle => {
    const tables = await gs.tables(sheetTitle);
    const { rows } = tables;
    const buildNode = createNodeFactory(
      camelCase(`${spreadsheetName} ${sheetTitle}`)
    );
    for (let i = 0; i < rows.length; i++) {
      const node = Object.entries(rows[i]).reduce((obj, [key, cell]) => {
        obj[mapKey(key)] =
          typeof cell === "object" && cell.stringValue !== undefined
            ? mapValue(cell.value, key, cell)
            : null;
        return obj;
      }, {});

      const hasProperties = Object.values(node).some(value => value !== null);
      if (!hasProperties) {
        break;
      }

      createNode({
        ...buildNode(node),
        id: createNodeId(`${typePrefix} ${spreadsheetName} ${sheetTitle} ${i}`)
      });
    }
  });
  return Promise.all(promises);
};
