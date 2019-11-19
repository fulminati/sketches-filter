"use strict";

var cli = require("../src/cli");
var ops = require("../src/ops");
var util = require("../src/util");
var chai = require("chai");

chai.use(require("chai-fs"));

describe("Testing command-line interface", function () {

    it("dockerops", function () {
        var exec = cli.run();
        chai.assert.equal(exec, "docker-compose ps");
        var exec = cli.run([]);
        chai.assert.equal(exec, "docker-compose ps");
    });

    it("dockerops up", function () {
        var exec = cli.run(["up"]);
        chai.assert.equal(exec, "docker-compose up -d --remove-orphans");
    });

});