/*
 *  test_thing_set_with_zone.js
 *
 *  David Janes
 *  IOTDB
 *  2016-07-18
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var iotdb = require("../iotdb");
var thing_manager = require("../thing_manager");

require('./instrument/iotdb');

var _make_thing = function(callback) {
    var t = thing_manager.make();
    t.reset();
    
    var ts = t.connect("Test", {}, {
        "schema:name": "The Thing Name",
        "schema:description": "My Thing",
        "iot:zone": [ "Glasgow Place", "Second Floor", "Bedroom" ],
        "iot:facet": [ "iot-facet:switch", "iot-facet:lighting", "iot-facet:something" ],
        "iot:thing-number": 32,
    });
    ts.on("thing", function() {
        callback(ts);
    });
};

describe("test_thing_set_zones", function() {
    describe("zones", function(done) {
        it("inital zoness", function(done) {
            _make_thing(function(ts) {
                const thing = ts.any();
                const band = thing.band("meta");
                const zones = band.get("iot:zone");

                assert.deepEqual(zones, [ "Glasgow Place", "Second Floor", "Bedroom" ]);
                done();
            });
        });
        it("sets the zoness", function(done) {
            _make_thing(function(ts) {
                const thing = ts.any();
                ts.zones([ "a", "b", "c" ]);

                const band = thing.band("meta");
                const zones = band.get("iot:zone");

                assert.deepEqual(zones, [ "a", "b", "c" ]);
                done();
            });
        });
    });
    describe("with_zone", function(done) {
        it("matching", function(done) {
            _make_thing(function(ts) {
                var ms = ts.with_zone("Glasgow Place");

                assert.strictEqual(ms.count(), 1);
                done();
            });
        });
        it("matching with array", function(done) {
            _make_thing(function(ts) {
                var ms = ts.with_zone([ "Glasgow Place", "Second Floor", "Bedroom"]);

                assert.strictEqual(ms.count(), 1);
                done();
            });
        });
        it("matching with array with some non matching items", function(done) {
            _make_thing(function(ts) {
                var ms = ts.with_zone([ "Bedroom", "d", "e"]);

                assert.strictEqual(ms.count(), 1);
                done();
            });
        });
        it("not matching", function(done) {
            _make_thing(function(ts) {
                var ms = ts.with_zone("e");

                assert.strictEqual(ms.count(), 0);
                assert.ok(ms.empty());
                done();
            });
        });
        it("not matching with array", function(done) {
            _make_thing(function(ts) {
                var ms = ts.with_zone([ "e", "f", "g" ]);

                assert.strictEqual(ms.count(), 0);
                assert.ok(ms.empty());
                done();
            });
        });
    });
});
