/*!
 * arduinodk-filter
 *
 * Copyright(c) 2016-2017 Javanile.org
 * MIT Licensed
 */

module.exports = {

    /**
     *
     */
    selector: function (tag) {
        return new RegExp('@' + tag + '\\("(.*)"\\)', 'gm')
    }
}
