/*!
 * Sketches Filter
 *
 * Copyright(c) 2016-2019 Fulminati
 * MIT Licensed
 */

const fu = require('nodejs-fu')
    , glob = require('glob').sync
    , foreach = require('boor').foreach

/**
 *
 * @param sketch
 * @param filter
 */
function resetTag (tag, path) {
    var files = glob('**/*.__tag__' + tag, { cwd: path, absolute: true })

    foreach(files, (file) => {
        fu.writeFile(file.slice(0, -8 - tag.length), fu.readFile(file))
        fu.unlink(file)
    })
}

module.exports = resetTag
