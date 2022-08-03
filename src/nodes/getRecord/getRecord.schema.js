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
          getAllRecords: {},
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
        const response = await base(tableName).select({}).all();
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
        const response = await base(tableName).find(vals.action.childValues.recordId);
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
