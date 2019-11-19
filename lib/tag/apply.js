/*!
 * Sketches Filter
 *
 * Copyright(c) 2016-2019 Javanile.org
 * MIT Licensed
 */

const fu = require('nodejs-fu')
    , glob = require('glob')
    , foreach = require('boor').foreach
    , EOL = require('os')

/**
 * USE this tag\(("|')(.*?[^\\])??((\\\\)+)?+("|') for escaoe quotes
 *
 */
function tagSelector(filter) {
    return new RegExp('@' + filter + '\\(([^]*?)\\)', 'gm')
}

/**
 *
 * @param code
 * @param processor
 */
function tagProcessor(file, code, selector, processor) {
    return code.replace(selector, function (token, args) {
        let left = code.substr(0, code.indexOf(token))
        let row = (left.match(/\n/g) || []).length + 1
        let col = left.length - left.lastIndexOf('\n')

        let I = '[-+]?\\d+'
        let F = '[-+]?\\d+\\.\\d'
        let L = '[a-zA-Z_]+\\w*'
        let S = '("(?:[^"\\\\]|\\\\.)*")'
        let Q = '(\'(?:[^\'\\\\]|\\\\.)*\')'
        let V = `(${I}|${F}|${L}|${S}|${Q})`

        if (!args.match(new RegExp(`^\\s*${V}(\\s*,\\s*${V})*\\s*$`, 'm'))) {
            console.error(`Filter syntax error at '${file}' line '${row}'.`);
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

        return processor(values)
    })
}

/**
 *
 * @param sketch
 * @param filter
 * @param processSelector
 */
function applyTag(tag, path, processor) {
    let files = glob.sync('**/*.{ino,h}', { cwd: path, absolute: true })
    let selector = tagSelector(tag)

    foreach(files, (file) => {
        let prev = file + '.__tag__' + tag
        let meta = fu.readFile(fu.fileExists(prev) ? prev : file)

        if (meta.match(selector)) {
            var code = tagProcessor(file, meta, selector, processor)
            fu.writeFile(prev, meta)
            fu.writeFile(file, code)
        }
    });
}

module.exports = applyTag
