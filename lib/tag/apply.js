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
 * Create RegExp that capture tag statment in file.
 *
 * NOTES:
 *  - use this tag\(("|')(.*?[^\\])??((\\\\)+)?+("|') for escaoe quotes
 */
function tagSelector(tag) {
    return new RegExp('@' + tag + '\\(([^]*?)\\)', 'gm')
}

/**
 *
 * @param code
 * @param processor
 */
function tagProcessor(args) {
    let tag = args['tag'],
        file = args['file'],
        code = args['code'],
        processor = args['processor'],
        selector = args['selector'],
        payload = args['payload']

    return code.replace(selector, function (token, args) {
        let left = code.substr(0, code.indexOf(token)),
            row = (left.match(/\n/g) || []).length + 1,
            column = left.length - left.lastIndexOf('\n'),
            trace = { file: file, row: row, column: column }

        let I = '[-+]?\\d+'
        let F = '[-+]?\\d+\\.\\d'
        let L = '[a-zA-Z_]+\\w*'
        let S = '("(?:[^"\\\\]|\\\\.)*")'
        let Q = '(\'(?:[^\'\\\\]|\\\\.)*\')'
        let V = `(${F}|${I}|${L}|${S}|${Q})`

        if (!args.match(new RegExp(`^\\s*${V}(\\s*,\\s*${V})*\\s*$`, 'm'))) {
            console.error(`Filter syntax error at '${file}' line '${row}'.`);
        }

        let tokenizer = new RegExp(`\\s*${V}\\s*`, 'gm'),
            value = null,
            values = []

        while (true) {
            value = tokenizer.exec(args);
            if (!value) { break; }
            else if (value[1].match(new RegExp(`^${F}$`, 'gm'))) { value = parseFloat(value[1]); }
            else if (value[1].match(new RegExp(`^${I}$`, 'gm'))) { value = parseInt(value[1]); }
            else if (value[1].match(new RegExp(`^${L}$`, 'gm'))) { value = value[1]; }
            else if (value[1].match(new RegExp(`^${S}$`, 'gm'))) { value = value[1].slice(1, -1).replace(/\\"/gm, '"'); }
            else if (value[1].match(new RegExp(`^${Q}$`, 'gm'))) { value = value[1].slice(1, -1).replace(/\\'/gm, "'"); }
            values.push(value)
        }

        return processor(values, trace, payload)
    })
}

/**
 *
 * @param sketch
 * @param filter
 * @param processSelector
 */
function applyTag(args) {
    const tag = args['tag']
        , path = args['path'] || '.'
        , processor = args['processor']
        , payload = args['payload']
        , files = glob.sync('**/*.{ino,h}', { cwd: path, absolute: true })
        , selector = tagSelector(tag)

    foreach(files, (file) => {
        const prev = file + '.__tag__' + tag
            , code = fu.readFile(fu.fileExists(prev) ? prev : file)

        if (code.match(selector)) {
            fu.writeFile(prev, code)
            fu.writeFile(file, tagProcessor({
                file: file,
                code: code,
                processor: processor,
                selector: selector,
                payload: payload
            }))
        }
    })
}

module.exports = applyTag
