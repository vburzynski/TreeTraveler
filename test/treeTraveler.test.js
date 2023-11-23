var _ = require('lodash');
var chai = require('chai');
var TreeTraveler = require('../src/treeTraveler');
var TreeNode = require('../src/treeNode');

// grab the expect object
var expect = chai.expect;

describe('TreeTraveler', function () {
  var tree;
  var queue = [];

  function queueNodes(node) {
    queue.push(node);
  }

  beforeEach(function () {
    queue = [];
    tree = new TreeTraveler();
    tree.build([1, [2, [4, [7], 5], 3, [6, [8, 9]]]], queueNodes);
  });

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
  */

  // preorder             root, children left-right                     1 2 4 7 5 3 6 8 9
  // reverse-preorder     root, children right-left                     1 3 6 9 8 2 5 4 7
  // postorder            children left-right, root                     7 4 5 2 8 9 6 3 1
  // reverse-postorder    children right-left, root                     9 8 6 3 5 7 4 2 1
  // inverse-preorder  === reverse-postorder                            9 8 6 3 5 7 4 2 1
  // inverse-postorder === reverse-preorder                             9 8 6 3 5 7 4 2 1
  // inorder              left, root, right                             7 4 2 5 1 8 6 9 3
  // reverseorder         right, root, left                             3 9 6 8 1 5 2 4 7
  // levelorder           each level top to bottom, nodes left-right    1 2 3 4 5 6 7 8 9
  // reverse-levelorder   each level top to bottom, nodes right-left    1 3 2 6 5 4 9 8 7
  // inverse-levelorder   each level bottom to top,nodes  right-left    9 8 7 6 5 4 3 2 1

  // TODO: write tests for .search()

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
    it('should be a function', function () {
      expect(_.isFunction(tree.build)).to.be.true;
    });
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

  describe('Traversal Sequence', function () {
    it('should return the correct preorder sequence', function () {
      var str = '';

      function callback(node) {
        str += node.object + ' ';
      }
      tree.preorder(tree.root, callback);
      expect(str).to.equal('1 2 4 7 5 3 6 8 9 ');
    });
    it('should return the correct reversePreorder sequence', function () {
      var str = '';

      function callback(node) {
        str += node.object + ' ';
      }
      tree.reversePreorder(tree.root, callback);
      expect(str).to.equal('1 3 6 9 8 2 5 4 7 ');
    });
    it('should return the correct postorder sequence', function () {
      var str = '';

      function callback(node) {
        str += node.object + ' ';
      }
      tree.postorder(tree.root, callback);
      expect(str).to.equal('7 4 5 2 8 9 6 3 1 ');
    });
    it('should return the correct reversePostorder sequence', function () {
      var str = '';

      function callback(node) {
        str += node.object + ' ';
      }
      tree.reversePostorder(tree.root, callback);
      expect(str).to.equal('9 8 6 3 5 7 4 2 1 ');
    });
    it('should return the correct inorder sequence', function () {
      var str = '';

      function callback(node) {
        str += node.object + ' ';
      }
      tree.inorder(tree.root, callback);
      expect(str).to.equal('7 4 2 5 1 8 6 9 3 ');
    });
    it('should return the correct reverseorder sequence', function () {
      var str = '';

      function callback(node) {
        str += node.object + ' ';
      }
      tree.reverseorder(tree.root, callback);
      expect(str).to.equal('3 9 6 8 1 5 2 4 7 ');
    });
    it('should return the correct level-order sequence', function () {
      var str = '';

      function callback(node) {
        str += node.object + ' ';
      }
      tree.levelorder(tree.root, callback);
      expect(str).to.equal('1 2 3 4 5 6 7 8 9 ');
    });
    it('should return the correct reverseLevelorder sequence', function () {
      var str = '';

      function callback(node) {
        str += node.object + ' ';
      }
      tree.reverseLevelorder(tree.root, callback);
      expect(str).to.equal('1 3 2 6 5 4 9 8 7 ');
    });
    it('should return the correct inverseLevelorder sequence', function () {
      var str = '';

      function callback(node) {
        str += node.object + ' ';
      }
      tree.inverseLevelorder(tree.root, callback);
      expect(str).to.equal('9 8 7 6 5 4 3 2 1 ');
    });
  });

  describe('next()', function () {
    it('should travel to the next node when order is "preorder"', function () {
      tree.setOrder('preorder');
      //'1 2 4 7 5 3 6 8 9 '
      expect(tree.node.object).to.equal(1);
      expect(tree.path[0].object).to.equal(1);

      tree.next();
      expect(tree.node.object).to.equal(2);
      expect(tree.path[0].object).to.equal(1);
      expect(tree.path[1].object).to.equal(2);

      tree.next();
      expect(tree.node.object).to.equal(4);
      expect(tree.path[0].object).to.equal(1);
      expect(tree.path[1].object).to.equal(2);
      expect(tree.path[2].object).to.equal(4);

      tree.next();
      expect(tree.node.object).to.equal(7);
      expect(tree.path[0].object).to.equal(1);
      expect(tree.path[1].object).to.equal(2);
      expect(tree.path[2].object).to.equal(4);
      expect(tree.path[3].object).to.equal(7);

      tree.next();
      expect(tree.path[0].object).to.equal(1);
      expect(tree.path[1].object).to.equal(2);
      expect(tree.path[2].object).to.equal(5);
      expect(tree.node.object).to.equal(5);

      tree.next();
      expect(tree.node.object).to.equal(3);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(9);
    });
    it('should travel to the next node when order is "inorder"', function () {
      //'7 4 2 5 1 8 6 9 3 '
      tree.setOrder('inorder');
      expect(tree.node.object).to.equal(7);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(5);
      tree.next();
      expect(tree.node.object).to.equal(1);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(9);
      tree.next();
      expect(tree.node.object).to.equal(3);
    });
    it('should travel to the next node when order is "postorder"', function () {
      //'7 4 5 2 8 9 6 3 1 '
      tree.setOrder('postorder');
      expect(tree.node.object).to.equal(7);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(5);
      tree.next();
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(9);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(3);
      tree.next();
      expect(tree.node.object).to.equal(1);
    });
    it('should travel to the next node when order is "levelorder"', function () {
      //'1 2 3 4 5 6 7 8 9 '
      tree.setOrder('levelorder');
      expect(tree.node.object).to.equal(1);
      tree.next();
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(3);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(5);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(7);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(9);
    });
    it('should travel to the next node when order is "inverse-levelorder"', function () {
      // 9 8 7 6 5 4 3 2 1
      tree.setOrder('inverse-levelorder');
      expect(tree.node.object).to.equal(9);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(7);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(5);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(3);
      tree.next();
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(1);
    });
    it('should travel to the next node when order is "reverse-preorder"', function () {
      //1 3 6 9 8 2 5 4 7
      tree.setOrder('reverse-preorder');
      expect(tree.node.object).to.equal(1);
      tree.next();
      expect(tree.node.object).to.equal(3);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(9);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(5);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(7);
    });
    it('should travel to the next node when order is "reverse-postorder"', function () {
      //9 8 6 3 5 7 4 2 1
      tree.setOrder('reverse-postorder');
      expect(tree.node.object).to.equal(9);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(3);
      tree.next();
      expect(tree.node.object).to.equal(5);
      tree.next();
      expect(tree.node.object).to.equal(7);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(1);
    });
    it('should travel to the next node when order is "reverseorder"', function () {
      //3 9 6 8 1 5 2 4 7
      tree.setOrder('reverseorder');
      expect(tree.node.object).to.equal(3);
      tree.next();
      expect(tree.node.object).to.equal(9);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(1);
      tree.next();
      expect(tree.node.object).to.equal(5);
      tree.next();
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(7);
    });
    it('should accept a utilize condition function', function () {
      var original = tree.conditionFn;
      tree.setConditionCheck(function (node) {
        if (node.object % 2 === 0) {
          return true;
        }
        return false;
      });
      tree.setOrder('levelorder');
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.setConditionCheck(original);
    });
    it('should should stop at the end of the order', function () {
      tree.setOrder('inorder');
      tree.reset();
      expect(tree.node.object).to.equal(7);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(5);
      tree.next();
      expect(tree.node.object).to.equal(1);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(9);
      tree.next();
      expect(tree.node.object).to.equal(3);
      tree.next();
      expect(tree.node.object).to.equal(3);
    });
    it('should loop around if shouldLoop is set to true', function () {
      //'7 4 2 5 1 8 6 9 3 '
      tree.setOrder('inorder');
      tree.settings.shouldLoop = true;
      expect(tree.node.object).to.equal(7);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(5);
      tree.next();
      expect(tree.node.object).to.equal(1);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(9);
      tree.next();
      expect(tree.node.object).to.equal(3);
      tree.next();
      expect(tree.node.object).to.equal(7);
    });
  });
  describe('prev()', function () {
    it('should travel to the previous node when order is "preorder"', function () {
      // 1 2 4 7 5 3 6 8 9
      tree.setOrder('preorder');
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      expect(tree.node.object).to.equal(9);
      tree.prev();
      expect(tree.node.object).to.equal(8);
      tree.prev();
      expect(tree.node.object).to.equal(6);
      tree.prev();
      expect(tree.node.object).to.equal(3);
      tree.prev();
      expect(tree.node.object).to.equal(5);
      tree.prev();
      expect(tree.node.object).to.equal(7);
      tree.prev();
      expect(tree.node.object).to.equal(4);
      tree.prev();
      expect(tree.node.object).to.equal(2);
      tree.prev();
      expect(tree.node.object).to.equal(1);
    });
    it('should travel to the previous node when order is "inorder"', function () {
      // 7 4 2 5 1 8 6 9 3
      tree.setOrder('inorder');
      tree.prev();
      expect(tree.node.object).to.equal(7);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(5);
      tree.next();
      expect(tree.node.object).to.equal(1);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(9);
      tree.next();
      expect(tree.node.object).to.equal(3);

      expect(tree.node.object).to.equal(3);
      tree.prev();
      expect(tree.node.object).to.equal(9);
      tree.prev();
      expect(tree.node.object).to.equal(6);
      tree.prev();
      expect(tree.node.object).to.equal(8);
      tree.prev();
      expect(tree.node.object).to.equal(1);
      tree.prev();
      expect(tree.node.object).to.equal(5);
      tree.prev();
      expect(tree.node.object).to.equal(2);
      tree.prev();
      expect(tree.node.object).to.equal(4);
      tree.prev();
      expect(tree.node.object).to.equal(7);
      tree.prev();
      expect(tree.node.object).to.equal(7);
    });
    it('should travel to the previous node when order is "postorder"', function () {
      // 7 4 5 2 8 9 6 3 1
      tree.setOrder('postorder');
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      expect(tree.node.object).to.equal(1);
      tree.prev();
      expect(tree.node.object).to.equal(3);
      tree.prev();
      expect(tree.node.object).to.equal(6);
      tree.prev();
      expect(tree.node.object).to.equal(9);
      tree.prev();
      expect(tree.node.object).to.equal(8);
      tree.prev();
      expect(tree.node.object).to.equal(2);
      tree.prev();
      expect(tree.node.object).to.equal(5);
      tree.prev();
      expect(tree.node.object).to.equal(4);
      tree.prev();
      expect(tree.node.object).to.equal(7);
    });
    it('should travel to the previous node when order is "levelorder"', function () {
      tree.setOrder('levelorder');
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      tree.next();
      expect(tree.node.object).to.equal(9);
      tree.prev();
      expect(tree.node.object).to.equal(8);
      tree.prev();
      expect(tree.node.object).to.equal(7);
      tree.prev();
      expect(tree.node.object).to.equal(6);
      tree.prev();
      expect(tree.node.object).to.equal(5);
      tree.prev();
      expect(tree.node.object).to.equal(4);
      tree.prev();
      expect(tree.node.object).to.equal(3);
      tree.prev();
      expect(tree.node.object).to.equal(2);
      tree.prev();
      expect(tree.node.object).to.equal(1);
    });
    it('should should stop at the beginning of the order', function () {
      // 7 4 2 5 1 8 6 9 3
      tree.setOrder('inorder');
      tree.prev();
      expect(tree.node.object).to.equal(7);
      tree.next();
      expect(tree.node.object).to.equal(4);
      tree.next();
      expect(tree.node.object).to.equal(2);
      tree.next();
      expect(tree.node.object).to.equal(5);
      tree.next();
      expect(tree.node.object).to.equal(1);
      tree.next();
      expect(tree.node.object).to.equal(8);
      tree.next();
      expect(tree.node.object).to.equal(6);
      tree.next();
      expect(tree.node.object).to.equal(9);
      tree.next();
      expect(tree.node.object).to.equal(3);
      tree.prev();
      expect(tree.node.object).to.equal(9);
      tree.prev();
      expect(tree.node.object).to.equal(6);
      tree.prev();
      expect(tree.node.object).to.equal(8);
      tree.prev();
      expect(tree.node.object).to.equal(1);
      tree.prev();
      expect(tree.node.object).to.equal(5);
      tree.prev();
      expect(tree.node.object).to.equal(2);
      tree.prev();
      expect(tree.node.object).to.equal(4);
      tree.prev();
      expect(tree.node.object).to.equal(7);
      tree.prev();
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

  describe('send()', function () {
    it('should move to a descendent of the root node');
  });

  describe('destroy()', function () {
    it('must destroy every node in the tree', function () {
      var i;
      tree.destroy();
      console.log('destroyed');
      expect(tree.root).to.be.null;
      for (i = 0; i < queue.length; i++) {
        expect(queue[i].object).to.not.exist;
        expect(queue[i].children).to.not.exist;
      }
    });
  });

  // FUTURE implement more specific binary tree features
  describe('forceBinary', function () {
    it('should force node to only allow two children when true');
  });
});
