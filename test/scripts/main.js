require([
    '../spec/treeNode.js', 
    '../spec/treeTraveler.js'
], function () {
    'use strict';
    window.expect = chai.expect;
    mocha.run();
});