const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk')
class AirtableConfig extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {
            ...opts,
            // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
        })
    }

    static schema = new Schema({
        name: 'airtable-config',
        label: 'airtable-config',
        category: 'config',
        isConfig: true,
        fields: {
            // Whatever custom fields the node needs.
            baseId: new fields.Typed({type:"str",allowedTypes:["str","msg","flow","global"]}),
            tableName: new fields.Typed({type:"str",allowedTypes:["str","msg","flow","global"]}),

        },
        redOpts: {
            credentials: {
                apiKey: new fields.Credential({ type: "str", password: true }),
            }
        }

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        // Handle the message. The returned value will
        // be sent as the message to any further nodes.

    }
}

module.exports = AirtableConfig