const { Node, Schema, fields } = require("@mayahq/module-sdk");
const AirtableConfig = require("../airtableConfig/airtableConfig.schema.js");
class DeleteRecord extends Node {
  constructor(node, RED, opts) {
    super(node, RED, {
      ...opts,
      // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
    });
  }

  static schema = new Schema({
    name: "delete-record",
    label: "Delete Records",
    category: "Maya Red Airtable",
    isConfig: false,
    fields: {
      // Whatever custom fields the node needs.
      AirtableConfig: new fields.ConfigNode({ type: AirtableConfig }),
      recordIds: new fields.Typed({
        type: "str",
        allowedTypes: ["str", "msg"],
      }),
    },
  });

  onInit() {
    // Do something on initialization of node
  }

  async onMessage(msg, vals) {
    // Handle the message. The returned value will
    // be sent as the message to any further nodes.
    this.setStatus("PROGRESS", "Deleting records...");
    const baseId = vals.AirtableConfig.baseId;
    const tableName = vals.AirtableConfig.tableName;

    const { AirtableConfig } = this.credentials;
    const apiKey = AirtableConfig.apiKey;
    // console.log(baseId, tableName, apiKey);
    // msg.records = [];
    const base = new Airtable({ apiKey: apiKey }).base(baseId);
    try{
        // convert comma seperated string vals.recordIds to array of strings
        const recordIds = typeof vals.recordIds === string ? vals.recordIds.split(",") : vals.recordIds;
        const response = await base(tableName).destroy(recordIds);
        msg.records = response;
        this.setStatus("SUCCESS", "Records deleted");
    }
    catch{
        msg.__isError = true;
        msg.__error = err;
        this.setStatus("ERROR", err.message);
    }
  }
}

module.exports = DeleteRecord;
