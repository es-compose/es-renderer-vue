var fs = require('fs');
var path = require('path');
var Parser = require('./Parser');

/**
 * Renderer class
 * @todo support for streaming
 */
module.exports = class Renderer 
{
    constructor(options = {}) {
        let defaults = {
            dir: null,
            ext: 'html'
        }

        this.options = Object.assign({}, defaults, options);
        this.parser = new Parser();
    }

    /**
     * Render view
     * @param {string} script 
     * @param {Object} data 
     */
    async render(script, data = {}, callback = null) {
        try {
            // render the main view
            let content = await this.renderScript(script);
            content = await this.parser.parse(content, data);

            // render layout if provided
            let layoutScript = data.layout || this.options.layout;
            if(layoutScript) {
                data.body = content;
                content = await this.renderScript(layoutScript);
                content = await this.parser.parse(content, data);
            }
            if(callback) callback(content);
            return content;
        } catch(e) {
            throw e;
        }
    }

    /**
     * Renders a view script 
     * @param {String} filename 
     * @param {Object} data 
     * @returns Promise
     */
    renderScript(script) {
        return new Promise((resolve, reject) => {
            let filename = this.pathForScript(script);
            fs.readFile(filename, 'utf-8', (err, content) => {
                if(err) reject(err);
                else resolve(content);
            });
        })
    }

    /**
     * Generates absolute path for the given script
     * @param {String} script 
     */
    pathForScript(script) {
        if(path.isAbsolute(script)) return script;

        let obj = {
            dir: this.options.dir
        }

        if(path.extname(script)) {
            obj.base = script;
        } else {
            let ext = this.options.ext;
            if(ext[0] != '.') ext = '.' + ext; // inject the dot
            obj.name = script;
            obj.ext = ext;
        }

        return path.format(obj);
    }

    /**
     * 
     * @param {*} script 
     * @param {*} options 
     * @param {*} callback 
     */
    static __express(script, options, callback) {
        let renderer = new this();

        return function(script, data, callback) {
            renderer.render(script, data, callback);
        }.bind(renderer);
    }
}