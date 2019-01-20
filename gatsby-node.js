const Sheets = require("node-sheets").default;
const createNodeHelpers = require("gatsby-node-helpers").default;
const camelCase = require("camelcase");

exports.sourceNodes = async ({ actions, createNodeId }, pluginOptions) => {
  const { createNode } = actions;
  const {
    spreadsheetId,
    spreadsheetName = "",
    typePrefix = "GoogleSpreadsheet",
    credentials
  } = pluginOptions;

  const { createNodeFactory } = createNodeHelpers({
    typePrefix
  });

  const gs = new Sheets(spreadsheetId);

  if (credentials) {
    await gs.authorizeJWT(credentials);
  }

  (await gs.getSheetsNames()).forEach(async sheetTitle => {
    const tables = await gs.tables(sheetTitle);
    const { rows } = tables;

    const buildNode = createNodeFactory(
      camelCase(`${spreadsheetName} ${sheetTitle}`)
    );
    rows.forEach((row, index) => {
      const node = Object.entries(row)
        .filter(([, value]) => !!value)
        .reduce((obj, [key, { value }]) => {
          obj[camelCase(key)] = value;
          return obj;
        }, {});

      createNode({
        ...buildNode(node),
        id: createNodeId(
          `${typePrefix} ${spreadsheetName} ${sheetTitle} ${index}`
        )
      });
    });
  });
};
