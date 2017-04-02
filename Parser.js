var Vue = require('vue');
var {createRenderer} = require('vue-server-renderer');

module.exports = class Parser
{
    constructor() {

    }

    parse(content, data = {}) {
        return new Promise((resolve, reject) => {
            let app = new Vue({
                template: content,
                data: data
            });

            let renderer = createRenderer();
            renderer.renderToString(app, (err, html) => {
                if(err) reject(err);
                else resolve(html);
            })
        })
    }
}