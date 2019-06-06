# gatsby-source-google-spreadsheet

Source plugin for sourcing all data from a Google Spreadsheet.

Nodes are created separately for each sheet within the document, allowing for more explicit queries if you have your data managed in the different sheets.

The plugin is based on the [node-sheets](https://github.com/urbancups/node-sheets) package and the Google Sheets API V4, which allows for better value types and column names than many of the other Gatsby Google Sheets source plugins.

## Configuration

```js
// Add and modify this plugin config to your `gatsby-config.js`:
{
  resolve: "gatsby-source-google-spreadsheet",
  options: {
    // The `spreadsheetId` is required, it is found in the url of your document:
    // https://docs.google.com/spreadsheets/d/<spreadsheetId>/edit#gid=0
    spreadsheetId: "<spreadsheetId>",

    // The `spreadsheetName` is recommended, but optional
    // It is used as part of the id's during the node creation, as well as in the generated GraphQL-schema
    // If you are sourcing multiple sheets, you can set this to distringuish between the source data
    spreadsheetName: "MySheet",

    // The `typePrefix` is optional, default value is "GoogleSpreadsheet"
    // It is used as part of the id's during the node creation, as well as in the generated GraphQL-schema
    // It can be overridden to fully customize the root query
    typePrefix: "GoogleSpreadsheet",

    // The `credentials` are only needed when you need to be authenticated to read the document.
    // It's an object with the following shape:
    // {
    //   client_email: "<your service account email address>",
    //   private_key: "<the prive key for your service account>"
    // }
    //
    // Refer to googles own documentation to retrieve the credentials for your service account:
    //   - https://github.com/googleapis/google-api-nodejs-client#service-to-service-authentication
    //   - https://developers.google.com/identity/protocols/OAuth2ServiceAccount
    //
    // When you have generated your credentials, it's easiest to refer to them from an environment variable
    // and parse it directly:
    credentials: JSON.parse(GOOGLE_SERVICE_ACCOUNT_CREDENTIALS),

    // Simple node transformation during node sourcing can be achieved by implementing the following functions
    // - `filterNode`
    // - `mapNode`
    //
    // By implementing a `filterNode(node): boolean` function, you can choose to eliminate some nodes before
    // they're added to Gatsby, the default behaviour is to include all nodes:
    filterNode: () => true,

    // By implementing a `mapNode(node): node` function, you can provide your own node transformations directly
    // during node sourcing, the default implementation is to return the node as is:
    mapNode: node => node
  }
}
```

## Example usage

Given a spreadsheet with data organized in two sheets like this:

| _Sheet 1_ |          | _Sheet 2_ |          |
| --------- | -------- | --------- | -------- |
| **col1**  | **col2** | **col1**  | **col2** |
| one       | 1        | three     | 3        |
| two       | 2        | four      | 4        |

You would be able to query it like this:

```graphql
query {
  allGoogleSpreadsheetSheet1 {
    edges {
      node {
        col1
        col2
      }
    }
  }
  allGoogleSpreadsheetSheet2 {
    edges {
      node {
        col1
        col2
      }
    }
  }
}
```

With the following result:

```js
{
  allGoogleSpreadsheetSheet1: {
    edges: {
      node: [
        {
          col1: "one",
          col2: 1
        },
        {
          col1: "two",
          col2: 2
        }
      ]
    }
  },
  allGoogleSpreadsheetSheet2: {
    edges: {
      node: [
        {
          col1: "three",
          col2: 3
        },
        {
          col1: "four",
          col2: 4
        }
      ]
    }
  }
}
```

## Considerations

- In order to automatically parse cell values as numbers and dates, you need to specify the format of the column (or the cell)
  in your spreadsheet.
