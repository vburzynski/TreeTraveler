var chai = require('chai');
var TreeNode = require('../src/treeNode');

// grab the expect object
var expect = chai.expect;

// describe our tests...
describe('TreeNode', function () {
  describe('constructor', function () {
    var node = new TreeNode(1);
    it('returns an instance of a TreeNode when the "new" operator is used', function () {
      expect(node).to.be.an.instanceOf(TreeNode);
    });
    it('returns an instance of a TreeNode when the constructor is called as a function', function () {
      var node = new TreeNode(1);
      expect(node).to.be.an.instanceOf(TreeNode);
    });
    it('returns an instance of a TreeNode which stores the passed in value', function () {
      expect(node.object).to.equal(1);
    });
    it('returns an instance of a TreeNode which, by default, does not expect a binary tree structure', function () {
      expect(node.forceBinary).to.be.false;
    });
  });
  describe('set()', function () {
    it('should set the object value of the TreeNode', function () {
      var node = new TreeNode();
      node.set(544);
      expect(node.object).to.equal(544);
    });
  });
  describe('get()', function () {
    it('should return the object value of the TreeNode', function () {
      var node = new TreeNode();
      var obj = {
        test: 666,
        key: 'testing',
      };
      node.set(obj);
      expect(node.object).to.deep.equal(obj);
      expect(node.get()).to.deep.equal(obj);
    });
  });
  describe('clear()', function () {
    it('should clear the object value of the TreeNode', function () {
      var node = new TreeNode();
      var obj = {
        test: 666,
        key: 'testing',
      };
      node.set(obj);
      expect(node.object).to.deep.equal(obj);
      node.clear();
      expect(node.object).to.be.null;
    });
  });
  describe('destroy()', function () {
    it('should destroy the TreeNode', function () {
      var key,
        node = new TreeNode();
      node.set(1);
      node.destroy();
      for (key in node) {
        expect(node[key]).to.be.null;
      }
    });
  });
  describe('addChild()', function () {
    it('should add a child node as the next direct descendant', function () {
      var obj1 = {
        key: 'test',
      };
      var obj2 = {
        key: 'hello world',
      };
      var node1 = new TreeNode({});
      var node2 = new TreeNode(obj1);
      var node3 = new TreeNode(obj2);

      node1.addChild(node2);
      node1.addChild(node3);

      expect(node1.children[0]).to.equal(node2);
      expect(node1.children[1]).to.equal(node3);
      expect(node1.children[2]).to.not.be.ok;
    });
  });
  describe('addChildAt()', function () {
    var node1 = new TreeNode({});
    var node2 = new TreeNode({
      key: 'test',
    });
    var node3 = new TreeNode({
      key: 'hello world',
    });
    var node4 = new TreeNode({
      key: 'bla bla bla',
    });

    beforeEach(function () {
      node1 = new TreeNode({});
    });

    it('should add a child node at the specified index', function () {
      node1.addChildAt(node2, 0);
      node1.addChildAt(node3, 0);
      expect(node1.children[0]).to.equal(node3);
      expect(node1.children[1]).to.equal(node2);
      expect(node1.children[2]).to.not.be.ok;
    });
    it('should be able to insert a child node between two others', function () {
      node1.addChildAt(node2, 0);
      node1.addChildAt(node3, 0);
      node1.addChildAt(node4, 1);
      expect(node1.children[0]).to.equal(node3);
      expect(node1.children[1]).to.equal(node4);
      expect(node1.children[2]).to.equal(node2);
    });
  });
  describe('getChildIndex()', function () {
    var node1 = new TreeNode({});
    var node2 = new TreeNode({
      key: 'test',
    });
    var node3 = new TreeNode({
      key: 'hello world',
    });
    var node4 = new TreeNode({
      key: 'bla bla bla',
    });
    node1.addChild(node2);
    node1.addChild(node3);
    it('should return the index of the specified child node', function () {
      expect(node1.getChildIndex(node2)).to.equal(0);
      expect(node1.getChildIndex(node3)).to.equal(1);
    });
    it('should return -1 if the child node is not a child of the node', function () {
      expect(node1.getChildIndex(node4)).to.equal(-1);
    });
  });
  describe('hasChild()', function () {
    var node1 = new TreeNode({});
    var node2 = new TreeNode({
      key: 'test',
    });
    var node3 = new TreeNode({
      key: 'hello world',
    });
    var node4 = new TreeNode({
      key: 'bla bla bla',
    });
    node1.addChild(node2);
    node1.addChild(node3);
    it('should return true when a node is stored as a child node of the parent', function () {
      expect(node1.hasChild(node2)).to.be.true;
      expect(node1.hasChild(node3)).to.be.true;
    });
    it('should return false when a node is not a child of the parent', function () {
      expect(node1.hasChild(node4)).to.be.false;
    });
  });
  describe('getChildAt()', function () {
    var node1 = new TreeNode({});
    var node2 = new TreeNode({
      key: 'test',
    });
    var node3 = new TreeNode({
      key: 'hello world',
    });
    node1.addChild(node2);
    node1.addChild(node3);
    it('should return the child node that exists at the specified index', function () {
      expect(node1.getChildAt(0)).to.equal(node2);
      expect(node1.getChildAt(1)).to.equal(node3);
    });
    it('should return undefined if the specified index is invalid', function () {
      expect(node1.getChildAt(2)).to.be.undefined;
    });
  });
  describe('removeChild()', function () {
    var node1 = new TreeNode({});
    var node2 = new TreeNode({
      key: 'test',
    });
    var node3 = new TreeNode({
      key: 'hello world',
    });
    var node4 = new TreeNode({
      key: 'bla bla bla',
    });
    node1.addChild(node2);
    node1.addChild(node3);
    node1.addChild(node4);
    it('should remove the specified child node', function () {
      node1.removeChild(node3);
      expect(node1.children[0]).to.equal(node2);
      expect(node1.children[1]).to.equal(node4);
    });
    it('should not remove any chilren when non-child is passed in', function () {
      node1.removeChild(node3);
      expect(node1.children.length).to.equal(2);
      expect(node1.children[0]).to.equal(node2);
      expect(node1.children[1]).to.equal(node4);
    });
  });
  describe('removeChildAt()', function () {
    var node1 = new TreeNode({});
    var node2 = new TreeNode({
      key: 'test',
    });
    var node3 = new TreeNode({
      key: 'hello world',
    });
    var node4 = new TreeNode({
      key: 'bla bla bla',
    });
    node1.addChild(node2);
    node1.addChild(node3);
    node1.addChild(node4);
    it('should remove the child node at the specified index', function () {
      node1.removeChildAt(1);
      expect(node1.children.length).to.equal(2);
      expect(node1.children[0]).to.equal(node2);
      expect(node1.children[1]).to.equal(node4);
    });
  });
});
