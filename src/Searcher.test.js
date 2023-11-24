var chai = require('chai');
const Searcher = require('./Searcher');
var TreeTraveler = require('./treeTraveler');

var expect = chai.expect;

describe('Traversal Sequence', function () {
  var searcher;
  var nodes;
  var tree;
  var queue = [];

  var treeFixtureA = [1, [2, [4, [7], 5], 3, [6, [8, 9]]]];

  function setupTree() {
    queue = [];
    tree = new TreeTraveler();
    tree.build(treeFixtureA, (node) => {
      queue.push(node);
    });
  }

  beforeEach(function () {
    setupTree();
    nodes = [];
    searcher = new Searcher(tree.root, (node) => {
      nodes.push(node.object);
    });
  });

  describe('preorder()', function () {
    it('should visit nodes in the correct preorder sequence', function () {
      searcher.search('preorder');
      expect(nodes).to.deep.equal([1, 2, 4, 7, 5, 3, 6, 8, 9,]);
    });
  });

  describe('reversePreorder()', function () {
    it('should visit nodes in the correct reversePreorder sequence', function () {
      searcher.search('reverse-preorder');
      expect(nodes).to.deep.equal([1, 3, 6, 9, 8, 2, 5, 4, 7,]);
    });
  });

  describe('postorder()', function () {
    it('should visit nodes in the correct postorder sequence', function () {
      searcher.search('postorder');
      expect(nodes).to.deep.equal([7, 4, 5, 2, 8, 9, 6, 3, 1]);
    });
  });

  describe('reversePostorder()', function () {
    it('should visit nodes in the correct reversePostorder sequence', function () {
      searcher.search('reverse-postorder');
      expect(nodes).to.deep.equal([9, 8, 6, 3, 5, 7, 4, 2, 1]);
    });
  });

  describe('inorder()', function () {
    it('should visit nodes in the correct inorder sequence', function () {
      searcher.search('inorder');
      expect(nodes).to.deep.equal([7, 4, 2, 5, 1, 8, 6, 9, 3]);
    });
  });

  describe('reverseorder()', function () {
    it('should visit nodes in the correct reverseorder sequence', function () {
      searcher.search('reverseorder');
      expect(nodes).to.deep.equal([3, 9, 6, 8, 1, 5, 2, 4, 7]);
    });
  });

  describe('levelorder()', function () {
    it('should visit nodes in the correct level-order sequence', function () {
      searcher.search('levelorder');
      expect(nodes).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('reverseLevelorder()', function () {
    it('should visit nodes in the correct reverseLevelorder sequence', function () {
      searcher.search('reverse-levelorder');
      expect(nodes).to.deep.equal([1, 3, 2, 6, 5, 4, 9, 8, 7]);
    });
  });

  describe('inverseLevelorder()', function () {
    it('should visit nodes in the correct inverseLevelorder sequence', function () {
      searcher.search('inverse-levelorder');
      expect(nodes).to.deep.equal([9, 8, 7, 6, 5, 4, 3, 2, 1]);
    });
  });
});