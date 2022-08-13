const inferType = (value) => {
  // find out if value if a mobile number, email, url, name or boolean
  if (typeof value === "string") {
    if (
      value.match(
        /^\+?[0-9]{1,3}\s?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/
      )
    ) {
      return "phone_number";
    } else if (value.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)) {
      return "email";
    } else if (value.match(/^(http|https):\/\/[^ "]+$/)) {
      return "url";
    } else if (value.match(/^(true|false)$/)) {
      return "boolean";
    } else if (value.match(/^[a-zA-Z]+$/)) {
      return "name";
    } else {
      return "string";
    }
  }
};
const transformRecord = (record) => {
  let newRecord = {};
  newRecord._identifier = {
    type: "id",
    value: record.id,
  };
  newRecord.fields = {};
  for (let field in record.fields) {
    newRecord.fields[field] = {
      type: inferType(record.fields[field]),
      value: record.fields[field],
    };
  }
  return newRecord;
};
const inverseTransformRecord = (record, operationType) => {
  let newRecord = {};
  if (operationType === "update") {
    if (record._identifier) {
      if (record._identifier.value) {
        newRecord.id = record._identifier.value;
      }
    }
  }
  newRecord.fields = {};
  for (let field in record.fields) {
    newRecord.fields[field] = record.fields[field].value;
  }
  return newRecord;
};
module.exports = { inverseTransformRecord, transformRecord };
