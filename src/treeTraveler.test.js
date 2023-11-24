var chai = require('chai');
var TreeNode = require('./treeNode');
var TreeTraveler = require('./treeTraveler');

// grab the expect object
var expect = chai.expect;

// TODO: helper to reset to end of order();
// TODO: write tests for .search()
// TODO: test callback behavior separately
// TODO: I need to test with more tree structures
// TODO: test with object values in the tree, or multiple properties on the TreeNode

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
  var tree;
  var queue = [];

  var treeFixtureA = [1, [2, [4, [7], 5], 3, [6, [8, 9]]]];
  var _treeFixtureB = ['A', ['B', ['D', 'E'], 'C', ['F', 'G']]];

  function setupTree() {
    queue = [];
    tree = new TreeTraveler();
    tree.build(treeFixtureA, (node) => {
      queue.push(node);
    });
  }

  beforeEach(function () {
    setupTree();
  });

  describe('constructor', function () {
    it('should begin with a traversal order of preorder', function () {
      expect(tree.settings.order).to.equal('preorder');
    });
    it('should begin at the root node', function () {
      expect(tree.node).to.equal(tree.root);
    });
    it('should begin with a path that includes just the root node', function () {
      expect(tree.path.length).to.equal(1);
      expect(tree.path[0]).to.equal(tree.root);
    });
  });

  describe('build()', function () {
    it('must return the root of the new tree structure', function () {
      expect(tree.root).to.be.an.instanceOf(TreeNode);
      expect(tree.root.get()).to.equal(1);
    });
  });

  describe('setOrder()', function () {
    it('should change the traversal order', function () {
      tree.setOrder('postorder');
      expect(tree.settings.order).to.equal('postorder');
    });
  });

  describe('reset()', function () {
    // TODO: implement tests for reset
    describe('should move the traveller back to the first node in the order sequence', function () {
      it('preorder            - should return the tree\'s node paramter to treeNode with value of 1');
      it('reverse-preorder    - should return the tree\'s node paramter to treeNode with value of 1');
      it('postorder           - should return the tree\'s node paramter to treeNode with value of 7');
      it('reverse-postorder   - should return the tree\'s node paramter to treeNode with value of 9');
      it('inorder             - should return the tree\'s node paramter to treeNode with value of 7');
      it('reverseorder        - should return the tree\'s node paramter to treeNode with value of 3');
      it('levelorder          - should return the tree\'s node paramter to treeNode with value of 1');
      it('reverse-levelorder  - should return the tree\'s node paramter to treeNode with value of 1');
      it('inverse-levelorder  - should return the tree\'s node paramter to treeNode with value of 9');
    });
  });

  describe('next()', function () {
    it('should travel to the next node when order is "preorder"', function () {
      tree.setOrder('preorder');
      //'1 2 4 7 5 3 6 8 9 '
      expect(tree.node.object).to.equal(1);
      expect(tree.path[0].object).to.equal(1);

      tree.step();
      expect(tree.node.object).to.equal(2);
      expect(tree.path[0].object).to.equal(1);
      expect(tree.path[1].object).to.equal(2);

      tree.step();
      expect(tree.node.object).to.equal(4);
      expect(tree.path[0].object).to.equal(1);
      expect(tree.path[1].object).to.equal(2);
      expect(tree.path[2].object).to.equal(4);

      tree.step();
      expect(tree.node.object).to.equal(7);
      expect(tree.path[0].object).to.equal(1);
      expect(tree.path[1].object).to.equal(2);
      expect(tree.path[2].object).to.equal(4);
      expect(tree.path[3].object).to.equal(7);

      tree.step();
      expect(tree.path[0].object).to.equal(1);
      expect(tree.path[1].object).to.equal(2);
      expect(tree.path[2].object).to.equal(5);
      expect(tree.node.object).to.equal(5);

      tree.step();
      expect(tree.node.object).to.equal(3);
      tree.step();
      expect(tree.node.object).to.equal(6);
      tree.step();
      expect(tree.node.object).to.equal(8);
      tree.step();
      expect(tree.node.object).to.equal(9);
    });

    it('should travel to the next node when order is "inorder"', function () {
      //'7 4 2 5 1 8 6 9 3 '
      tree.setOrder('inorder');
      expect(tree.node.object).to.equal(7);
      tree.step();
      expect(tree.node.object).to.equal(4);
      tree.step();
      expect(tree.node.object).to.equal(2);
      tree.step();
      expect(tree.node.object).to.equal(5);
      tree.step();
      expect(tree.node.object).to.equal(1);
      tree.step();
      expect(tree.node.object).to.equal(8);
      tree.step();
      expect(tree.node.object).to.equal(6);
      tree.step();
      expect(tree.node.object).to.equal(9);
      tree.step();
      expect(tree.node.object).to.equal(3);
    });

    it('should travel to the next node when order is "postorder"', function () {
      //'7 4 5 2 8 9 6 3 1 '
      tree.setOrder('postorder');
      expect(tree.node.object).to.equal(7);
      tree.step();
      expect(tree.node.object).to.equal(4);
      tree.step();
      expect(tree.node.object).to.equal(5);
      tree.step();
      expect(tree.node.object).to.equal(2);
      tree.step();
      expect(tree.node.object).to.equal(8);
      tree.step();
      expect(tree.node.object).to.equal(9);
      tree.step();
      expect(tree.node.object).to.equal(6);
      tree.step();
      expect(tree.node.object).to.equal(3);
      tree.step();
      expect(tree.node.object).to.equal(1);
    });

    it('should travel to the next node when order is "reverse-preorder"', function () {
      //1 3 6 9 8 2 5 4 7
      tree.setOrder('reverse-preorder');
      expect(tree.node.object).to.equal(1);
      tree.step();
      expect(tree.node.object).to.equal(3);
      tree.step();
      expect(tree.node.object).to.equal(6);
      tree.step();
      expect(tree.node.object).to.equal(9);
      tree.step();
      expect(tree.node.object).to.equal(8);
      tree.step();
      expect(tree.node.object).to.equal(2);
      tree.step();
      expect(tree.node.object).to.equal(5);
      tree.step();
      expect(tree.node.object).to.equal(4);
      tree.step();
      expect(tree.node.object).to.equal(7);
    });

    it('should travel to the next node when order is "reverse-postorder"', function () {
      //9 8 6 3 5 7 4 2 1
      tree.setOrder('reverse-postorder');
      expect(tree.node.object).to.equal(9);
      tree.step();
      expect(tree.node.object).to.equal(8);
      tree.step();
      expect(tree.node.object).to.equal(6);
      tree.step();
      expect(tree.node.object).to.equal(3);
      tree.step();
      expect(tree.node.object).to.equal(5);
      tree.step();
      expect(tree.node.object).to.equal(7);
      tree.step();
      expect(tree.node.object).to.equal(4);
      tree.step();
      expect(tree.node.object).to.equal(2);
      tree.step();
      expect(tree.node.object).to.equal(1);
    });

    it('should travel to the next node when order is "reverseorder"', function () {
      //3 9 6 8 1 5 2 4 7
      tree.setOrder('reverseorder');
      expect(tree.node.object).to.equal(3);
      tree.step();
      expect(tree.node.object).to.equal(9);
      tree.step();
      expect(tree.node.object).to.equal(6);
      tree.step();
      expect(tree.node.object).to.equal(8);
      tree.step();
      expect(tree.node.object).to.equal(1);
      tree.step();
      expect(tree.node.object).to.equal(5);
      tree.step();
      expect(tree.node.object).to.equal(2);
      tree.step();
      expect(tree.node.object).to.equal(4);
      tree.step();
      expect(tree.node.object).to.equal(7);
    });

    it('should accept a utilize condition function', function () {
      tree.setConditionCheck(function (node) {
        return (node.object % 2) === 0;
      });
      tree.setOrder('preorder');
      expect(tree.node.object).to.equal(2);
      tree.step();
      expect(tree.node.object).to.equal(4);
      tree.step();
      expect(tree.node.object).to.equal(6);
      tree.step();
      expect(tree.node.object).to.equal(8);
    });

    it('should should stop at the end of the order', function () {
      tree.setOrder('inorder');
      tree.reset();
      expect(tree.node.object).to.equal(7);
      tree.step();
      expect(tree.node.object).to.equal(4);
      tree.step();
      expect(tree.node.object).to.equal(2);
      tree.step();
      expect(tree.node.object).to.equal(5);
      tree.step();
      expect(tree.node.object).to.equal(1);
      tree.step();
      expect(tree.node.object).to.equal(8);
      tree.step();
      expect(tree.node.object).to.equal(6);
      tree.step();
      expect(tree.node.object).to.equal(9);
      tree.step();
      expect(tree.node.object).to.equal(3);
      tree.step();
      expect(tree.node.object).to.equal(3);
    });

    it('should loop around if shouldLoop is set to true', function () {
      //'7 4 2 5 1 8 6 9 3 '
      tree.setOrder('inorder');
      tree.settings.shouldLoop = true;
      expect(tree.node.object).to.equal(7);
      tree.step();
      expect(tree.node.object).to.equal(4);
      tree.step();
      expect(tree.node.object).to.equal(2);
      tree.step();
      expect(tree.node.object).to.equal(5);
      tree.step();
      expect(tree.node.object).to.equal(1);
      tree.step();
      expect(tree.node.object).to.equal(8);
      tree.step();
      expect(tree.node.object).to.equal(6);
      tree.step();
      expect(tree.node.object).to.equal(9);
      tree.step();
      expect(tree.node.object).to.equal(3);
      tree.step();
      expect(tree.node.object).to.equal(7);
    });
  });

  describe('prev()', function () {
    it('should travel to the previous node when order is "preorder"', function () {
      // 1 2 4 7 5 3 6 8 9
      tree.setOrder('preorder');
      tree.step();
      tree.step();
      tree.step();
      tree.step();
      tree.step();
      tree.step();
      tree.step();
      tree.step();
      expect(tree.node.object).to.equal(9);
      tree.back();
      expect(tree.node.object).to.equal(8);
      tree.back();
      expect(tree.node.object).to.equal(6);
      tree.back();
      expect(tree.node.object).to.equal(3);
      tree.back();
      expect(tree.node.object).to.equal(5);
      tree.back();
      expect(tree.node.object).to.equal(7);
      tree.back();
      expect(tree.node.object).to.equal(4);
      tree.back();
      expect(tree.node.object).to.equal(2);
      tree.back();
      expect(tree.node.object).to.equal(1);
    });

    it('should travel to the previous node when order is "inorder"', function () {
      // 7 4 2 5 1 8 6 9 3
      tree.setOrder('inorder');
      tree.back();
      expect(tree.node.object).to.equal(7);
      tree.step();
      expect(tree.node.object).to.equal(4);
      tree.step();
      expect(tree.node.object).to.equal(2);
      tree.step();
      expect(tree.node.object).to.equal(5);
      tree.step();
      expect(tree.node.object).to.equal(1);
      tree.step();
      expect(tree.node.object).to.equal(8);
      tree.step();
      expect(tree.node.object).to.equal(6);
      tree.step();
      expect(tree.node.object).to.equal(9);
      tree.step();
      expect(tree.node.object).to.equal(3);

      expect(tree.node.object).to.equal(3);
      tree.back();
      expect(tree.node.object).to.equal(9);
      tree.back();
      expect(tree.node.object).to.equal(6);
      tree.back();
      expect(tree.node.object).to.equal(8);
      tree.back();
      expect(tree.node.object).to.equal(1);
      tree.back();
      expect(tree.node.object).to.equal(5);
      tree.back();
      expect(tree.node.object).to.equal(2);
      tree.back();
      expect(tree.node.object).to.equal(4);
      tree.back();
      expect(tree.node.object).to.equal(7);
      tree.back();
      expect(tree.node.object).to.equal(7);
    });

    it('should travel to the previous node when order is "postorder"', function () {
      // 7 4 5 2 8 9 6 3 1
      tree.setOrder('postorder');
      tree.step();
      tree.step();
      tree.step();
      tree.step();
      tree.step();
      tree.step();
      tree.step();
      tree.step();
      expect(tree.node.object).to.equal(1);
      tree.back();
      expect(tree.node.object).to.equal(3);
      tree.back();
      expect(tree.node.object).to.equal(6);
      tree.back();
      expect(tree.node.object).to.equal(9);
      tree.back();
      expect(tree.node.object).to.equal(8);
      tree.back();
      expect(tree.node.object).to.equal(2);
      tree.back();
      expect(tree.node.object).to.equal(5);
      tree.back();
      expect(tree.node.object).to.equal(4);
      tree.back();
      expect(tree.node.object).to.equal(7);
    });

    it('should should stop at the beginning of the order', function () {
      // 7 4 2 5 1 8 6 9 3
      tree.setOrder('inorder');
      tree.back();
      expect(tree.node.object).to.equal(7);
      tree.step();
      expect(tree.node.object).to.equal(4);
      tree.step();
      expect(tree.node.object).to.equal(2);
      tree.step();
      expect(tree.node.object).to.equal(5);
      tree.step();
      expect(tree.node.object).to.equal(1);
      tree.step();
      expect(tree.node.object).to.equal(8);
      tree.step();
      expect(tree.node.object).to.equal(6);
      tree.step();
      expect(tree.node.object).to.equal(9);
      tree.step();
      expect(tree.node.object).to.equal(3);
      tree.back();
      expect(tree.node.object).to.equal(9);
      tree.back();
      expect(tree.node.object).to.equal(6);
      tree.back();
      expect(tree.node.object).to.equal(8);
      tree.back();
      expect(tree.node.object).to.equal(1);
      tree.back();
      expect(tree.node.object).to.equal(5);
      tree.back();
      expect(tree.node.object).to.equal(2);
      tree.back();
      expect(tree.node.object).to.equal(4);
      tree.back();
      expect(tree.node.object).to.equal(7);
      tree.back();
      expect(tree.node.object).to.equal(7);
    });
  });

  describe('skip()', function () {
    it('should allow skipping to a node ahead of the current node');
    it('should allow skipping to a node behind the current node');
    it('should allow skipping to an older sibling');
    it('should allow skipping to a younger sibling');
    it('should allow skipping to the front of the child array');
    it('should allow skipping to the end of the child array');
  });

  describe('up()', function () {
    it('should allow moving up the specified number of nodes along the path');
    it('should never move past the root node');
  });

  describe('down()', function () {
    it('should move to a descendent of the current node');
  });

  describe('sendToNode()', function () {
    it('should move to a descendent of the root node');
  });

  describe('sendToPosition()', function () {
    it('should move to a specific position in the order traversal');
    it('its bounds are constrained by the number of items in the tree');
  });

  describe('destroy()', function () {
    it('must destroy every node in the tree', function () {
      var i;
      tree.destroy(true);
      console.log('destroyed');
      expect(tree.root).to.be.null;
      for (i = 0; i < queue.length; i++) {
        expect(queue[i].object).to.not.exist;
        expect(queue[i].children).to.not.exist;
      }
    });
  });

  // FUTURE: perhaps build a separate binary tree traversal? it would need far more functionality for various searches and balancing, etc.
  // FUTURE: implement more specific binary tree features
  // describe('forceBinary', function () {
  //   it('should force node to only allow two children when true');
  // });
});
