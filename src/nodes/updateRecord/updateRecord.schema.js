const { Node, Schema, fields } = require("@mayahq/module-sdk");
const Airtable = require("airtable");
const AirtableConfig = require("../airtableConfig/airtableConfig.schema.js");
const { color } = require("../../constants.js");
const { transformRecord, inverseTransformRecord } = require("../../utils.js");
class UpdateRecord extends Node {
  constructor(node, RED, opts) {
    super(node, RED, {
      ...opts,
      // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
    });
  }

  static schema = new Schema({
    name: "update-record",
    label: "Update Records",
    category: "Maya Red Airtable",
    isConfig: false,
    color,
    icon: "airtable.png",
    fields: {
      // Whatever custom fields the node needs.
      AirtableConfig: new fields.ConfigNode({ type: AirtableConfig }),
      updatedRecords: new fields.Typed({
        type: "json",
        allowedTypes: ["json", "msg", "flow", "global"],
      }),
    },
  });

  onInit() {
    // Do something on initialization of node
  }

  async onMessage(msg, vals) {
    // Handle the message. The returned value will
    // be sent as the message to any further nodes.
    this.setStatus("PROGRESS", "Updating records...");
    const baseId = vals.AirtableConfig.baseId;
    const tableName = vals.AirtableConfig.tableName;

    const { AirtableConfig } = this.credentials;
    const apiKey = AirtableConfig.apiKey;
    // console.log(baseId, tableName, apiKey);
    // msg.records = [];
    const base = new Airtable({ apiKey: apiKey }).base(baseId);
    try {
      // if vals.updatedRecords is an object wrap it in an array
      console.log(Array.isArray(vals.updatedRecords));
      if (Array.isArray(vals.updatedRecords)===false) {
        // vals.updatedRecords = [vals.updatedRecords];
        vals.updatedRecords = [vals.updatedRecords];

      }
      console.log(vals.updatedRecords,'is a type of ',typeof vals.updatedRecords);
      vals.updatedRecords = vals.updatedRecords.map((record) =>
        inverseTransformRecord(record, "update")
      );
      const response = await base(tableName).update(vals.updatedRecords);
      msg.table = response.map((record) => transformRecord(record));
      this.setStatus("SUCCESS", "Records updated");
    } catch(err) {
      msg.__isError = true;
      msg.__error = err;

      this.setStatus("ERROR", err.message);
    }
    return msg;
  }
}

module.exports = UpdateRecord;
