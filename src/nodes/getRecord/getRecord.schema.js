const { Node, Schema, fields } = require("@mayahq/module-sdk");
const Airtable = require("airtable");
const AirtableConfig = require("../airtableConfig/airtableConfig.schema.js");

class GetRecord extends Node {
  constructor(node, RED, opts) {
    super(node, RED, {
      ...opts,
      // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
    });
  }

  static schema = new Schema({
    name: "get-record",
    label: "Get Records",
    category: "Maya Red Airtable",
    isConfig: false,
    fields: {
      // Whatever custom fields the node needs.
      AirtableConfig: new fields.ConfigNode({ type: AirtableConfig }),
      action: new fields.SelectFieldSet({
        fieldSets: {
          getAllRecords: {
            fields: new fields.Typed({
              type: "str",
              allowedTypes: ["str", "msg"],
              defaultVal: "",
            }),
            filterByFormula: new fields.Typed({
              type: "str",
              allowedTypes: ["str", "msg"],
              defaultVal: "",
            }),
            maxRecords: new fields.Typed({
              type: "num",
              allowedTypes: ["num", "msg"],
              defaultVal: 100,
            }),
            sort: new fields.Typed({
              type: "json",
              allowedTypes: ["json", "msg"],
              defaultVal: "{}",
            }),
          },
          getRecordById: {
            recordId: new fields.Typed({
              type: "msg",
              allowedTypes: ["str", "msg"],
            }),
          },
        },
      }),
    },
  });

  onInit() {
    // Do something on initialization of node
  }

  async onMessage(msg, vals) {
    // Handle the message. The returned value will
    // be sent as the message to any further nodes.
    const baseId = vals.AirtableConfig.baseId;
    const tableName = vals.AirtableConfig.tableName;

    const { AirtableConfig } = this.credentials;
    const apiKey = AirtableConfig.apiKey;
    // console.log(baseId, tableName, apiKey);
    msg.records = [];
    const base = new Airtable({ apiKey: apiKey }).base(baseId);
    if (vals.action.selected === "getAllRecords") {
      this.setStatus("PROGRESS", "Fetching records...");

      try {
        // check if vals.action.childValues.fields is a string then make it array of strings else leave it as it is
        const fields =
          typeof vals.action.childValues.fields === "string"
            ? vals.action.childValues.fields.split(",")
            : vals.action.childValues.fields;

        let tableQuery = {
          filterByFormula: vals.action.childValues.filterByFormula,
          maxRecords: vals.action.childValues.maxRecords,
        };
        //check if vals.action.childValues.sort is an empty object

        if (Object.keys(vals.action.childValues.sort).length !== 0) {
          tableQuery.sort = vals.action.childValues.sort;
        }
        console.log(fields, "XXX", fields.length);
        if (fields[0].length >= 1) {
          tableQuery.fields = fields;
        }
        const response = await base(tableName).select(tableQuery).all();
        msg.records = response.map((record) => {
          return { id: record.id, ...record.fields };
        });
        this.setStatus("SUCCESS", "Records fetched");
      } catch (err) {
        msg.__isError = true;
        msg.__error = err;

        this.setStatus("ERROR", err.message);
      }
    } else if (vals.action.selected === "getRecordById") {
      this.setStatus("PROGRESS", "Fetching record...");
      try {
        const response = await base(tableName).find(
          vals.action.childValues.recordId
        );
        msg.records = [{ id: response.id, ...response.fields }];
        this.setStatus("SUCCESS", "Record fetched");
      } catch (err) {
        msg.__isError = true;
        msg.__error = err;

        this.setStatus("ERROR", err.message);
      }
    }
    return msg;
  }
}

module.exports = GetRecord;
