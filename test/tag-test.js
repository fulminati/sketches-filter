'use strict';

const chai = require('chai')
    , join = require('path').join
    , copy = require('fs-extra').copySync
    , remove = require('fs-extra').removeSync
    , applyTag = require('..').applyTag
    , resetTag = require('..').resetTag

chai.use(require('chai-fs'))

describe('tag', function () {

    it('apply', function () {
        remove('temp')
        copy(join(__dirname, 'fixtures'), 'temp')

        applyTag({ tag: 'test1', path: 'temp', processor: args => args[0] * 2 })
        chai.assert.fileContent('temp/tag/test1.ino', '246')

        resetTag({ tag: 'test1', path: 'temp' })
        chai.assert.fileContent('temp/tag/test1.ino', '@test1(1)@test1(2)@test1(3)')

        applyTag({ tag: 'test2', path: 'temp', processor: args => '(' + args[0] + ')' })
        chai.assert.fileContent('temp/tag/test2.ino', '(1.2)(Label)(Single Quoted)(Double Quoted)')

        resetTag({ tag: 'test2', path: 'temp' })
        chai.assert.fileContent('temp/tag/test2.ino', '@test2(1.2)@test2(Label)@test2(\'Single Quoted\')@test2("Double Quoted")')
    })

})
