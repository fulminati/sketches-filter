/*!
 * arduinodk-filter
 *
 * Copyright(c) 2016-2017 Javanile.org
 * MIT Licensed
 */

const fu = require('nodejs-fu')
    , cliz = require('cliz')
    , glob = require('glob')
    , foreach = require('boor').foreach
    , EOL = require('os')

module.exports = {

    /**
     * USE this tag\(("|')(.*?[^\\])??((\\\\)+)?+("|') for escaoe quotes
     *
     */
    selector: function (filter) {
        return new RegExp('@' + filter + '\\(([^]*?)\\)', 'gm')
    },

    /**
     *
     * @param sketch
     * @param filter
     * @param processSelector
     */
    onBefore: function (sketch, filter, processor) {
        var files = glob.sync('**/*.{ino,h}', { cwd: sketch.path, absolute: true })
        var selector = this.selector(filter)

        foreach(files, (file) => {
            var prev = file + '.' + filter
            var meta = fu.readFile(fu.fileExists(prev) ? prev : file)

            if (meta.match(selector)) {
                var code = this.processor(file, meta, selector, processor)
                fu.writeFile(prev, meta)
                fu.writeFile(file, code)
            }
        });
    },

    /**
     *
     * @param sketch
     * @param filter
     */
    onAfter: function (sketch, filter) {
        var files = glob.sync('**/*.' + filter, { cwd: sketch.path, absolute: true })

        foreach(files, (file) => {
            fu.writeFile(file.slice(0, -1 - filter.length), fu.readFile(file))
            fu.unlink(file)
        });
    },

    /**
     *
     * @param code
     * @param processor
     */
    processor: function (file, code, selector, processor) {
        return code.replace(selector, function (token, args) {
            let left = code.substr(0, code.indexOf(token))
            let row = (left.match(/\n/g) || []).length + 1;
            let col = left.length - left.lastIndexOf('\n')

            let I = '[-+]?\\d+'
            let F = '[-+]?\\d+\\.\\d'
            let L = '[a-zA-Z_]+\\w*'
            let S = '("(?:[^"\\\\]|\\\\.)*")'
            let Q = '(\'(?:[^\'\\\\]|\\\\.)*\')'
            let V = `(${I}|${F}|${L}|${S}|${Q})`

            if (!args.match(new RegExp(`^\\s*${V}(\\s*,\\s*${V})*\\s*$`, 'm'))) {
                cliz.fatal(`Filter syntax error at '${file}' line '${row}'.`);
            }

            let tokenizer = new RegExp(`\\s*${V}\\s*`, 'gm')
            let value = null;
            let values = [];
            while (true) {
                value = tokenizer.exec(args);
                if (!value) { break; }
                else if (value[1].match(new RegExp(`^${I}$`, 'gm'))) { value = parseInt(value[1]); }
                else if (value[1].match(new RegExp(`^${F}$`, 'gm'))) { value = parseFloat(value[1]); }
                else if (value[1].match(new RegExp(`^${L}$`, 'gm'))) { value = value[1]; }
                else if (value[1].match(new RegExp(`^${S}$`, 'gm'))) { value = value[1].slice(1, -1).replace(/\\"/gm, '"'); }
                else if (value[1].match(new RegExp(`^${Q}$`, 'gm'))) { value = value[1].slice(1, -1).replace(/\\'/gm, "'"); }
                values.push(value)
            }

            console.log(values)
            process.exit();
            return processor(values)
        })
    },

    /**
     *
     * @param string
     * @returns {string}
     */
    quote: function (string) {
        return '"' + string + '"';
    }
};
