'use strict';

const chai = require('chai')
    , join = require('path').join
    , copy = require('fs-extra').copySync
    , quote = require('..').quote

chai.use(require('chai-fs'))

describe('util', function () {

    it('quote', function () {
        chai.assert.equal(quote('"'), '"\\""')
    })

})
