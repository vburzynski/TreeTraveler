var chai = require('chai');
var TreeNode = require('./treeNode');
var TreeTraveler = require('./treeTraveler');

// grab the expect object
var expect = chai.expect;

// TODO: Should the traveler start on the first node or off of it? if it starts off you would have to do .next() to see the first node.
// NOTE: right now the traveler starts ON the first node.

// TODO: helper to reset to end of order();
// TODO: write tests for .search()
// TODO: test callback behavior separately
// TODO: test with more tree structures
// TODO: test with object values in the tree, or multiple properties on the TreeNode?

/*
|           1
|          / \
|         /   \
|        /     \
|       2       3
|      / \     /
|     4   5   6
|    /       / \
|   7       8   9
|
| https://rosettacode.org/wiki/Tree_traversal

Travel path
  for level-order
    starting point - top level
    we zig-zag in a z-shaped scanning pattern
    sequentially traverse each level, and all the nodes in each level
    the depth serves as a conceptual anchor for each scan
  for non-level-order
     the root serves as the starting point
     we anchor the root node (before, after, or between child nodes)
     each
     this is determined by where

(normal)
  depth: top to bottom
  children: left to right
reverse
  depth: top to bottom (same direction of travel)
  children: right to left (reversing direction)
inverse (invert the entire order)
  depth: bottom to top (reverse direction of travel)
  children: right to left (reverse direction)
inverse-reverse
  depth: bottom to top (reverse direction of travel)
  children: left to right (normal direction)

------------------------------------------------------------------------------------------------
preorder                      root, children left to right                     1 2 4 7 5 3 6 8 9
reverse-preorder              root, children right to left                     1 3 6 9 8 2 5 4 7
inverse-postorder             root, children right to left                     1 3 6 9 8 2 5 4 7
postorder                     children left to right, root                     7 4 5 2 8 9 6 3 1
reverse-postorder             children right to left, root                     9 8 6 3 5 7 4 2 1
------------------------------------------------------------------------------------------------
inorder                       left, root, right                                7 4 2 5 1 8 6 9 3
reverseorder                  right, root, left                                3 9 6 8 1 5 2 4 7
------------------------------------------------------------------------------------------------
levelorder                    each level top to bottom, nodes left to right    1 2 3 4 5 6 7 8 9
reverse-levelorder            each level top to bottom, nodes right to left    1 3 2 6 5 4 9 8 7
inverse-levelorder            each level bottom to top, nodes right to left    9 8 7 6 5 4 3 2 1
inverse-reverse-levelorder    each level bottom to top, nodes left to right    7 8 9 4 5 6 2 3 1
------------------------------------------------------------------------------------------------
FIXME: this is wrong
inverse-postorder                                                     9 8 6 3 5 7 4 2 1
FIXME: this is wrong
inverse-preorder                                                      9 8 6 3 5 7 4 2 1
*/

describe('TreeTraveler', function () {
  var traveler;
  var treeFixtureA = [1, [2, [4, [7], 5], 3, [6, [8, 9]]]];
  var treeFixtureB = [1, [2, [4, [7], 5], 3, [6, [8, 9, 10, 11, 12]]]];
  var _treeFixtureB = ['A', ['B', ['D', 'E'], 'C', ['F', 'G']]];

  function setupTree(options = {}) {
    var root = TreeNode.buildTreeFromArray(treeFixtureA);
    traveler = new TreeTraveler(root, options);
  }

  afterEach(function () {
    traveler = null;
  });

  describe('constructor', function () {
    beforeEach(function () {
      setupTree();
    });

    it('begins with a traversal order of preorder', function () {
      expect(traveler.settings.order).to.equal('preorder');
    });

    it('begins at the root node', function () {
      expect(traveler.node).to.equal(traveler.root);
    });

    it('begins with a path that includes just the root node', function () {
      expect(traveler.path.length).to.equal(1);
      expect(traveler.path[0]).to.equal(traveler.root);
    });
  });

  describe('.build()', function () {
    beforeEach(function () {
      setupTree();
    });

    it('must return the root of the new tree structure', function () {
      expect(traveler.root).to.be.an.instanceOf(TreeNode);
      expect(traveler.root.get()).to.equal(1);
    });
  });

  describe('.setOrder()', function () {
    beforeEach(function () {
      setupTree();
    });

    it('changes the traversal order', function () {
      traveler.setOrder('postorder');
      expect(traveler.settings.order).to.equal('postorder');
    });
  });

  describe('.reset()', function () {
    beforeEach(function () {
      setupTree();
    });

    describe('when the traveler order is set to preorder', function () {
      it('sets the node property to the TreeNode with the object value of 1', function () {
        traveler.setOrder('preorder');
        traveler.next();
        traveler.reset();
        expect(traveler.node.object).to.equal(1);
      });
    });

    describe('when the traveler order is set to reverse-preorder', function () {
      it('sets the node property to the TreeNode with the object value of 1', function () {
        traveler.setOrder('reverse-preorder');
        traveler.next();
        traveler.reset();
        expect(traveler.node.object).to.equal(1);
      });
    });

    describe('when the traveler order is set to postorder', function () {
      it('sets the node property to the TreeNode with the object value of 7', function () {
        traveler.setOrder('postorder');
        traveler.next();
        traveler.reset();
        expect(traveler.node.object).to.equal(7);
      });
    });

    describe('when the traveler order is set to reverse-postorder', function () {
      it('sets the node property to the TreeNode with the object value of 9', function () {
        traveler.setOrder('reverse-postorder');
        traveler.next();
        traveler.reset();
        expect(traveler.node.object).to.equal(9);
      });
    });

    describe('when the traveler order is set to inorder', function () {
      it('sets the node property to the TreeNode with the object value of 7', function () {
        traveler.setOrder('inorder');
        traveler.next();
        traveler.reset();
        expect(traveler.node.object).to.equal(7);
      });
    });

    describe('when the traveler order is set to reverseorder', function () {
      it('sets the node property to the TreeNode with the object value of 3', function () {
        traveler.setOrder('reverseorder');
        traveler.next();
        traveler.reset();
        expect(traveler.node.object).to.equal(3);
      });
    });

    describe('when the traveler order is set to levelorder', function () {
      it('sets the node property to the TreeNode with the object value of 1', function () {
        traveler.setOrder('levelorder');
        traveler.next();
        traveler.reset();
        expect(traveler.node.object).to.equal(1);
      });
    });

    describe('when the traveler order is set to reverse-levelorder', function () {
      it('sets the node property to the TreeNode with the object value of 1', function () {
        traveler.setOrder('reverse-levelorder');
        traveler.next();
        traveler.reset();
        expect(traveler.node.object).to.equal(1);
      });
    });
  });

  describe('.destroy()', function () {
    it('must destroy every node in the tree', function () {
      // Arrange
      const queue = [];
      setupTree();
      traveler.conditionCheck = (node) => {
        queue.push(node);
      };

      // Act
      var i;
      traveler.destroy(true);
      console.log('destroyed');

      // Assert - all the tree nodes should not exist
      expect(traveler.root).to.be.null;
      for (i = 0; i < queue.length; i++) {
        expect(queue[i].object).to.not.exist;
        expect(queue[i].children).to.not.exist;
      }
    });
  });

  describe('conditionCheck getter/setter', function () {
    beforeEach(function () {
      setupTree();
    });

    it('accepts a function', function () {
      var fn = () => {};
      traveler.conditionCheck = fn;
      expect(traveler.conditionCheck).to.equal(fn);
      expect(traveler._conditionCheckFn).to.equal(fn);
    });

    it('ignores values that are not functions', function () {
      var notFn = 1;
      traveler.conditionCheck = notFn;
      expect(traveler.conditionCheck).not.to.equal(notFn);
      expect(traveler._conditionCheckFn).not.to.equal(notFn);
      expect(traveler._conditionCheckFn).to.be.a('function');
    });
  });

  // TODO: break these up into propert arrange-act-assert patterned tests
  describe('next()', function () {
    describe('when order is preorder', function () {
      beforeEach(function () {
        setupTree({ order: 'preorder' });
      });

      it('travels to the next node', function () {
        //'1 2 4 7 5 3 6 8 9 '
        expect(traveler.node.object).to.equal(1);
        expect(traveler.path[0].object).to.equal(1);

        traveler.next();
        expect(traveler.node.object).to.equal(2);
        expect(traveler.path[0].object).to.equal(1);
        expect(traveler.path[1].object).to.equal(2);

        traveler.next();
        expect(traveler.node.object).to.equal(4);
        expect(traveler.path[0].object).to.equal(1);
        expect(traveler.path[1].object).to.equal(2);
        expect(traveler.path[2].object).to.equal(4);

        traveler.next();
        expect(traveler.node.object).to.equal(7);
        expect(traveler.path[0].object).to.equal(1);
        expect(traveler.path[1].object).to.equal(2);
        expect(traveler.path[2].object).to.equal(4);
        expect(traveler.path[3].object).to.equal(7);

        traveler.next();
        expect(traveler.path[0].object).to.equal(1);
        expect(traveler.path[1].object).to.equal(2);
        expect(traveler.path[2].object).to.equal(5);
        expect(traveler.node.object).to.equal(5);

        traveler.next();
        expect(traveler.node.object).to.equal(3);
        traveler.next();
        expect(traveler.node.object).to.equal(6);
        traveler.next();
        expect(traveler.node.object).to.equal(8);
        traveler.next();
        expect(traveler.node.object).to.equal(9);
      });

      it('utilizes the condition function', function () {
        traveler.conditionCheck = (node) => node.object % 2 === 0;
        traveler.setOrder('preorder');
        expect(traveler.node.object).to.equal(2);
        traveler.next();
        expect(traveler.node.object).to.equal(4);
        traveler.next();
        expect(traveler.node.object).to.equal(6);
        traveler.next();
        expect(traveler.node.object).to.equal(8);
      });

      it('accepts the number of steps to take as an argument', function () {
        traveler.next(3);
        expect(traveler.node.object).to.equal(7);
        expect(traveler.path.map((node) => node.object)).to.deep.equal([1, 2, 4, 7]);
      });

      it('does not travel past the final node in the sequence', function () {
        traveler.next(100);
        expect(traveler.node.object).to.equal(9);
      });

      it('accepts an optional direction argument', function () {
        traveler.next(3);
        traveler.next(1, 'backwards');
        expect(traveler.node.object).to.equal(4);
      });
    });

    describe('when the order is inorder', function () {
      beforeEach(function () {
        setupTree({ order: 'inorder' });
      });

      it('travels to the next node', function () {
        //'7 4 2 5 1 8 6 9 3 '
        expect(traveler.node.object).to.equal(7);
        traveler.next();
        expect(traveler.node.object).to.equal(4);
        traveler.next();
        expect(traveler.node.object).to.equal(2);
        traveler.next();
        expect(traveler.node.object).to.equal(5);
        traveler.next();
        expect(traveler.node.object).to.equal(1);
        traveler.next();
        expect(traveler.node.object).to.equal(8);
        traveler.next();
        expect(traveler.node.object).to.equal(6);
        traveler.next();
        expect(traveler.node.object).to.equal(9);
        traveler.next();
        expect(traveler.node.object).to.equal(3);
      });

      it('stops at the end of the order', function () {
        expect(traveler.node.object).to.equal(7);
        traveler.next();
        expect(traveler.node.object).to.equal(4);
        traveler.next();
        expect(traveler.node.object).to.equal(2);
        traveler.next();
        expect(traveler.node.object).to.equal(5);
        traveler.next();
        expect(traveler.node.object).to.equal(1);
        traveler.next();
        expect(traveler.node.object).to.equal(8);
        traveler.next();
        expect(traveler.node.object).to.equal(6);
        traveler.next();
        expect(traveler.node.object).to.equal(9);
        traveler.next();
        expect(traveler.node.object).to.equal(3);
        traveler.next();
        expect(traveler.node.object).to.equal(3);
      });

      it('loops around if shouldLoop is set to true', function () {
        traveler.settings.shouldLoop = true;
        //'7 4 2 5 1 8 6 9 3 '
        expect(traveler.node.object).to.equal(7);
        traveler.next();
        expect(traveler.node.object).to.equal(4);
        traveler.next();
        expect(traveler.node.object).to.equal(2);
        traveler.next();
        expect(traveler.node.object).to.equal(5);
        traveler.next();
        expect(traveler.node.object).to.equal(1);
        traveler.next();
        expect(traveler.node.object).to.equal(8);
        traveler.next();
        expect(traveler.node.object).to.equal(6);
        traveler.next();
        expect(traveler.node.object).to.equal(9);
        traveler.next();
        expect(traveler.node.object).to.equal(3);
        traveler.next();
        expect(traveler.node.object).to.equal(7);
      });
    });

    describe('when the order is postorder', function () {
      beforeEach(function () {
        setupTree({ order: 'postorder' });
      });

      it('travels to the next node', function () {
        //'7 4 5 2 8 9 6 3 1 '
        traveler.setOrder('postorder');
        expect(traveler.node.object).to.equal(7);
        traveler.next();
        expect(traveler.node.object).to.equal(4);
        traveler.next();
        expect(traveler.node.object).to.equal(5);
        traveler.next();
        expect(traveler.node.object).to.equal(2);
        traveler.next();
        expect(traveler.node.object).to.equal(8);
        traveler.next();
        expect(traveler.node.object).to.equal(9);
        traveler.next();
        expect(traveler.node.object).to.equal(6);
        traveler.next();
        expect(traveler.node.object).to.equal(3);
        traveler.next();
        expect(traveler.node.object).to.equal(1);
      });
    });

    describe('when the order is reverse-preorder', function () {
      beforeEach(function () {
        setupTree({ order: 'reverse-preorder' });
      });

      it('travels to the next node', function () {
        //1 3 6 9 8 2 5 4 7
        expect(traveler.node.object).to.equal(1);
        traveler.next();
        expect(traveler.node.object).to.equal(3);
        traveler.next();
        expect(traveler.node.object).to.equal(6);
        traveler.next();
        expect(traveler.node.object).to.equal(9);
        traveler.next();
        expect(traveler.node.object).to.equal(8);
        traveler.next();
        expect(traveler.node.object).to.equal(2);
        traveler.next();
        expect(traveler.node.object).to.equal(5);
        traveler.next();
        expect(traveler.node.object).to.equal(4);
        traveler.next();
        expect(traveler.node.object).to.equal(7);
      });
    });

    describe('when the order is reverse-postorder', function () {
      beforeEach(function () {
        setupTree({ order: 'reverse-postorder' });
      });

      it('travels to the next node', function () {
        //9 8 6 3 5 7 4 2 1
        expect(traveler.node.object).to.equal(9);
        traveler.next();
        expect(traveler.node.object).to.equal(8);
        traveler.next();
        expect(traveler.node.object).to.equal(6);
        traveler.next();
        expect(traveler.node.object).to.equal(3);
        traveler.next();
        expect(traveler.node.object).to.equal(5);
        traveler.next();
        expect(traveler.node.object).to.equal(7);
        traveler.next();
        expect(traveler.node.object).to.equal(4);
        traveler.next();
        expect(traveler.node.object).to.equal(2);
        traveler.next();
        expect(traveler.node.object).to.equal(1);
      });
    });

    describe('when the order is reverseorder', function () {
      beforeEach(function () {
        setupTree({ order: 'reverseorder' });
      });

      it('travels to the next node', function () {
        //3 9 6 8 1 5 2 4 7
        expect(traveler.node.object).to.equal(3);
        traveler.next();
        expect(traveler.node.object).to.equal(9);
        traveler.next();
        expect(traveler.node.object).to.equal(6);
        traveler.next();
        expect(traveler.node.object).to.equal(8);
        traveler.next();
        expect(traveler.node.object).to.equal(1);
        traveler.next();
        expect(traveler.node.object).to.equal(5);
        traveler.next();
        expect(traveler.node.object).to.equal(2);
        traveler.next();
        expect(traveler.node.object).to.equal(4);
        traveler.next();
        expect(traveler.node.object).to.equal(7);
      });
    });
  });

  // TODO: break these up into propert arrange-act-assert patterned tests
  describe('prev()', function () {
    beforeEach(function () {
      setupTree();
    });

    it('travels to the previous node when order is "preorder"', function () {
      // 1 2 4 7 5 3 6 8 9
      traveler.setOrder('preorder');
      // travel to the end
      traveler.next();
      traveler.next();
      traveler.next();
      traveler.next();
      traveler.next();
      traveler.next();
      traveler.next();
      traveler.next();
      // travel back
      expect(traveler.node.object).to.equal(9);
      traveler.back();
      expect(traveler.node.object).to.equal(8);
      traveler.back();
      expect(traveler.node.object).to.equal(6);
      traveler.back();
      expect(traveler.node.object).to.equal(3);
      traveler.back();
      expect(traveler.node.object).to.equal(5);
      traveler.back();
      expect(traveler.node.object).to.equal(7);
      traveler.back();
      expect(traveler.node.object).to.equal(4);
      traveler.back();
      expect(traveler.node.object).to.equal(2);
      traveler.back();
      expect(traveler.node.object).to.equal(1);
    });

    it('travels to the previous node when order is "inorder"', function () {
      traveler.setOrder('inorder');
      // 7 4 2 5 1 8 6 9 3
      traveler.back();
      expect(traveler.node.object).to.equal(7);
      traveler.next();
      expect(traveler.node.object).to.equal(4);
      traveler.next();
      expect(traveler.node.object).to.equal(2);
      traveler.next();
      expect(traveler.node.object).to.equal(5);
      traveler.next();
      expect(traveler.node.object).to.equal(1);
      traveler.next();
      expect(traveler.node.object).to.equal(8);
      traveler.next();
      expect(traveler.node.object).to.equal(6);
      traveler.next();
      expect(traveler.node.object).to.equal(9);
      traveler.next();
      expect(traveler.node.object).to.equal(3);
      // travel back
      expect(traveler.node.object).to.equal(3);
      traveler.back();
      expect(traveler.node.object).to.equal(9);
      traveler.back();
      expect(traveler.node.object).to.equal(6);
      traveler.back();
      expect(traveler.node.object).to.equal(8);
      traveler.back();
      expect(traveler.node.object).to.equal(1);
      traveler.back();
      expect(traveler.node.object).to.equal(5);
      traveler.back();
      expect(traveler.node.object).to.equal(2);
      traveler.back();
      expect(traveler.node.object).to.equal(4);
      traveler.back();
      expect(traveler.node.object).to.equal(7);
      traveler.back();
      expect(traveler.node.object).to.equal(7);
    });

    it('travels to the previous node when order is "postorder"', function () {
      // 7 4 5 2 8 9 6 3 1
      traveler.setOrder('postorder');
      traveler.next();
      traveler.next();
      traveler.next();
      traveler.next();
      traveler.next();
      traveler.next();
      traveler.next();
      traveler.next();
      expect(traveler.node.object).to.equal(1);
      traveler.back();
      expect(traveler.node.object).to.equal(3);
      traveler.back();
      expect(traveler.node.object).to.equal(6);
      traveler.back();
      expect(traveler.node.object).to.equal(9);
      traveler.back();
      expect(traveler.node.object).to.equal(8);
      traveler.back();
      expect(traveler.node.object).to.equal(2);
      traveler.back();
      expect(traveler.node.object).to.equal(5);
      traveler.back();
      expect(traveler.node.object).to.equal(4);
      traveler.back();
      expect(traveler.node.object).to.equal(7);
    });

    it('stops at the beginning of the order', function () {
      // 7 4 2 5 1 8 6 9 3
      traveler.setOrder('inorder');
      traveler.back();
      expect(traveler.node.object).to.equal(7);
      traveler.next();
      expect(traveler.node.object).to.equal(4);
      traveler.next();
      expect(traveler.node.object).to.equal(2);
      traveler.next();
      expect(traveler.node.object).to.equal(5);
      traveler.next();
      expect(traveler.node.object).to.equal(1);
      traveler.next();
      expect(traveler.node.object).to.equal(8);
      traveler.next();
      expect(traveler.node.object).to.equal(6);
      traveler.next();
      expect(traveler.node.object).to.equal(9);
      traveler.next();
      expect(traveler.node.object).to.equal(3);
      traveler.back();
      expect(traveler.node.object).to.equal(9);
      traveler.back();
      expect(traveler.node.object).to.equal(6);
      traveler.back();
      expect(traveler.node.object).to.equal(8);
      traveler.back();
      expect(traveler.node.object).to.equal(1);
      traveler.back();
      expect(traveler.node.object).to.equal(5);
      traveler.back();
      expect(traveler.node.object).to.equal(2);
      traveler.back();
      expect(traveler.node.object).to.equal(4);
      traveler.back();
      expect(traveler.node.object).to.equal(7);
      traveler.back();
      expect(traveler.node.object).to.equal(7);
    });
  });

  describe('sibling()', function () {
    beforeEach(function () {
      var root = TreeNode.buildTreeFromArray(treeFixtureB);
      traveler = new TreeTraveler(root);
      var positions = [1, 0, 2];
      [traveler.path, traveler.node] = positions.reduce((accumulator, position) => {
        var [path, node] = accumulator;
        var child = node.children[position]
        path.push(child);
        return [path, child];
      }, [[], root]);
    });

    it('advances to the next sibling when 1 is passed in as the delta', function () {
      expect(traveler.node.object).to.equal(10);
      traveler.sibling(1);
      expect(traveler.node.object).to.equal(11);
    });

    it('retreats to the previous sibling when -1 is pased in as the delta', function () {
      expect(traveler.node.object).to.equal(10);
      traveler.sibling(-1);
      expect(traveler.node.object).to.equal(9);
    });

    it('enforces a lower bound when travelling to younger siblings', function () {
      expect(traveler.node.object).to.equal(10);
      traveler.sibling(-5);
      expect(traveler.node.object).to.equal(8);
    });

    it('enforces an upper bound when travelling to younger siblings', function () {
      expect(traveler.node.object).to.equal(10);
      traveler.sibling(5);
      expect(traveler.node.object).to.equal(12);
    });
  });

  describe('.start()', function () {
    beforeEach(function () {
      var root = TreeNode.buildTreeFromArray(treeFixtureB);
      traveler = new TreeTraveler(root);
      var positions = [1, 0, 2];
      [traveler.path, traveler.node] = positions.reduce((accumulator, position) => {
        var [path, node] = accumulator;
        var child = node.children[position]
        path.push(child);
        return [path, child];
      }, [[], root]);
    });

    it('skips to the front of the child array', function () {
      expect(traveler.node.object).to.equal(10);
      traveler.start();
      expect(traveler.node.object).to.equal(8);
    });

    it('jumps n items from the start of the child array', function () {
      expect(traveler.node.object).to.equal(10);
      traveler.start(3);
      expect(traveler.node.object).to.equal(11);
    });
  });

  function setTravelerState(indexes) {
    [traveler.path, traveler.node] = indexes.reduce((accumulator, index) => {
      var [path, node] = accumulator;
      var child = node.children[index]
      path.push(child);
      return [path, child];
    }, [[traveler.root], traveler.root]);
  }

  describe('.end()', function () {
    beforeEach(function () {
      var root = TreeNode.buildTreeFromArray(treeFixtureB);
      traveler = new TreeTraveler(root);
      setTravelerState([1, 0, 2]);
    });

    it('skips to the end of the child array', function () {
      expect(traveler.node.object).to.equal(10);
      traveler.end();
      expect(traveler.node.object).to.equal(12);
    });

    it('jumps n items from the end of the child array', function () {
      expect(traveler.node.object).to.equal(10);
      traveler.end(3);
      expect(traveler.node.object).to.equal(9);
    });
  });

  describe('up()', function () {
    beforeEach(function () {
      setupTree();
      setTravelerState([0,0,0])
    });

    it('moves up one level if no number is provided', function () {
      expect(traveler.node.object).to.equal(7);
      traveler.up();
      expect(traveler.node.object).to.equal(4);
    });

    it('moves up the specified number of nodes along the path', function () {
      expect(traveler.node.object).to.equal(7);
      traveler.up(2);
      expect(traveler.node.object).to.equal(2);
    });

    it('does not move past the root node', function () {
      expect(traveler.node.object).to.equal(7);
      traveler.up(10);
      expect(traveler.node.object).to.equal(1);
    });
  });

  describe('down()', function () {
    beforeEach(function () {
      setupTree();
    });

    it('moves to a descendent of the current node when given a path with a single index', function () {
      traveler.down([0]);
      expect(traveler.node.object).to.equal(2);
    });

    it('moves to a descendent of the current node when given a path with multiple indexes', function () {
      traveler.down([0, 1]);
      expect(traveler.node.object).to.equal(5);
    });
  });

  describe('sendToNode()', function () {
    beforeEach(function () {
      setupTree();
    });

    it('moves to the specified node', function() {
      let node, path = [traveler.root];
      node = traveler.root.children[1];
      path.push(node);
      node = node.children[0];
      path.push(node);
      node = node.children[0];
      path.push(node);
      // sanity check/guard assertion - make sure we're on the expected starting node
      expect(node.object).to.equal(8);
      traveler.sendToNode(node);
      expect(traveler.node).to.equal(node);
      expect(traveler.path).to.deep.equal(path);
    });
  });

  describe('sendToPosition()', function () {
    beforeEach(function () {
      setupTree();
    });

    it('moves to a specific position in the order traversal', function() {
      traveler.sendToPosition([1,0,0]);
      expect(traveler.node.object).to.equal(8);
      expect(traveler.path.map((node) => node.object)).to.deep.equal([1,3,6,8]);
    });
  });

  // FUTURE: perhaps build a separate binary tree traversal? it would need far more functionality for various searches and balancing, etc.
  // FUTURE: implement more specific binary tree features
});
