'use strict';

const chai = require('chai')
    , join = require('path').join
    , copy = require('fs-extra').copySync
    , applyTag = require('..').applyTag
    , resetTag = require('..').resetTag

chai.use(require('chai-fs'))

describe('testing tag', function () {

    it('apply', function () {
        copy(join(__dirname, 'fixtures'), 'temp')
        applyTag('test', 'temp', (args) => {
            return "test"
        })
    })

})
