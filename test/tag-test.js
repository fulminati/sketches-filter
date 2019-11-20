'use strict';

const chai = require('chai')
    , join = require('path').join
    , copy = require('fs-extra').copySync
    , applyTag = require('..').applyTag
    , resetTag = require('..').resetTag

chai.use(require('chai-fs'))

describe('tag', function () {

    it('apply', function () {
        copy(join(__dirname, 'fixtures'), 'temp')
        applyTag({ tag: 'test1', path: 'temp', processor: args => args[0] * 2 })
        chai.assert.fileContent('temp/tag/test1.ino', '246')
        resetTag({ tag: 'test1', path: 'temp' })
        chai.assert.fileContent('temp/tag/test1.ino', '@test1(1)@test1(2)@test1(3)')
    })

})
