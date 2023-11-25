var TreeNode = require('./treeNode');
var Searcher = require('./Searcher');

var defaults = {
  shouldLoop: false,
  order: 'preorder',
};

function is(type, obj) {
  return obj !== undefined && obj !== null && type === Object.prototype.toString.call(obj).slice(8, -1);
}

// TODO: original code was mixing up concepts -- tree, and iterators -- refactor
//       so we could have Tree and TreeTraveler/TreeIterator
// TODO: add parent node to TreeNode??? this would get rid of the path
// TODO: get rid of path (maybe not?)
//       counter point -- for some tree algorithms you always start from the root
// TODO: break up the skip() function -- it's confusing, also too long of a method. break into multiple
//       you can specify prev(3) or next(3) instead?
// TODO: if I changed the destroy() test, I wouldn't need the build() callback.
// TODO: is it worth having the callback to call something like onBuild()/onAttach() in the nodes? or would it be better to do that separately?
// TODO: consider getting rid of settings object. there's not enough to justify it? collapse it down. -- NOT SURE about this one
// TODO: test sendToNode()
// TODO: test sendToPosition()
// TODO: test search()
// TODO: convert into a class? or keep prototypal?

/**
 * Indicates whether a order value is valid or not
 * @param {String} order the order string
 * @returns {Boolean} Returns true when order string is valid
 */
function validOrder(order) {
  return (
    order === 'preorder' ||
    order === 'reverse-preorder' ||
    order === 'inorder' ||
    order === 'reverseorder' ||
    order === 'postorder' ||
    order === 'reverse-postorder'
  );
}

/**
 * @constructor
 */
var TreeTraveler = function (root, options) {
  this.root = root;
  this.settings = { ...defaults, ...options };
  this._conditionCheckFn = (_node) => true;
  this.reset();
};

TreeTraveler.prototype = {
  /**
   * Settings Object
   * @type {Object}
   */
  settings: null,

  /**
   * The root of the tree
   * @type {TreeNode}
   */
  root: null,

  /**
   * The current traversal node on the tree
   * @type {TreeNode}
   */
  node: null,

  /**
   * the ancestry path from the root to the current node
   * @type {TreeNode[]}
   */
  path: null,

  /**
   * Builds a tree from an array
   * @param {Array} arr multi-dimensional array of values
   */
  // build: function (arr, callback = () => {}) {
  //   this.root = TreeNode.buildTreeFromArray(arr, null, callback);
  //   this.reset();
  // },

  /**
   * Sets the order in which the TreeTraveler will travel the tree
   */
  setOrder: function (order) {
    this.settings.order = validOrder(order) ? order : 'preorder';
    this.reset();
  },

  /**
   * Reset the tree. (Sends it to the first node in the sequence)
   */
  reset: function () {
    // grab path to the first node in the current sequence
    var searcher = new Searcher(this.root, this._conditionCheckFn, true);
    this.path = searcher.search(this.settings.order);
    this.node = this.path[this.path.length - 1];
  },

  /**
   * Destroys the tree structure and it's nodes
   * @param {Boolean} shouldDestroyNodes when true, tree nodes with be destroyed along with the tree.
   */
  destroy: function (shouldDestroyNodes) {
    if (shouldDestroyNodes) {
      new Searcher(this.root, (node) => {
        node.destroy();
      }).search('postorder');
    }

    this.root = null;
    this.node = null;
    this.path = null;
    this.settings = null;
  },

  /**
   * Sets the condition check function.
   * This function is used to test whether a visit a node when walking the tree
   * @param {Function} fn - function which accepts a treeNode object and returns true or false
   */
  set conditionCheck(fn) {
    if (typeof fn === 'function') {
      this._conditionCheckFn = fn;
    }
  },

  /**
   * Gets the current condition check function
   */
  get conditionCheck() {
    return this._conditionCheckFn;
  },

  /**
   * Travel to the next node in the previously specified order
   */
  next: function (steps = 1, direction = 'forward') {
    var result;
    for (var step = 1; step <= steps; step++) {
      result = (direction === 'forward')
        ? this.walkForward([...this.path])
        : this.walkBackward([...this.path]);

      if (result) {
        this.path = result;
        this.node = this.path[this.path.length - 1];
      } else if (this.settings.shouldLoop) {
        this.reset();
        break;
      }
    }
  },

  /**
   * Travel to the previous node in the order specified
   */
  back: function (steps = 1) {
    this.next(steps, 'backward');
  },

  /**
   * Travel up to an immediate ancestor of the current node. When at the
   * root of a tree, stay put.
   * @param {number} [num=0] - number of levels to move up
   */
  up: function (num) {
    num = is('Number', num) ? num : 1;
    this.node = this.path.pop();
    // while the path contains more than just the root node and num is > 0
    while (this.path.length > 1 && num > 0) {
      // remove the next node from the path
      this.node = this.path.pop();
      num--;
    }
    this.path.push(this.node);
  },

  /**
   * Drill down to a descendent of the current node
   * @param {number[]} position array of child node indexes to move to
   */
  down: function (position) {
    if (Array.isArray(position)) {
      var i,
        index,
        parentNode = this.node;
      // go through every position index
      for (i = 0; i < position.length; i++) {
        parentNode = this.node;
        index = position[i];
        if (index >= 0 && index < parentNode.children.length) {
          this.node = parentNode.children[index];
          this.path.push(this.node);
        } else {
          console.log('Warning: position array contains an out of bounds index.');
          break;
        }
      }
    }
  },

  // FIXME: refactor and test
  /**
   * Skip to a sibling or ancestor of the current node. Use the down() method to drill down into the descendents of a node.
   * @param {String} direction directionality of the skip
   * @param {Number|Array} num Number of nodes to move in the given direction (per level)
   * @param {Number} depth how far to move up the path to the root (optional)
   */
  skip: function (direction, num, depth) {
    direction = direction || 'path';
    num = is('Number', num) ? num : 1;
    depth = is('Number', depth) ? Math.abs(depth) : 0;
    var parentNode, fn, currNode, len;

    // if depth was provided, move up the path to a direct ancestor
    if (depth !== 0) {
      this.up(Math.abs(depth));
    }

    // TODO: extract sibling() which accepst ± index (..., -1, 0, +1, ...)
    // TODO: extract start() -- should it accept start(n) to move relative to start?
    // TODO: extract end() -- should it accept start(n) to move relative to end?

    // determine the directionality of our movement
    switch (direction) {
      // skip to a sibling
      case 'sibling':
        if (is('Number', num) && num !== 0) {
          currNode = this.path.pop();
          parentNode = this.path[this.path.length - 1];
          // get index of node in parent's children array
          var i = parentNode.children.indexOf(currNode) + 1;
          // get number of siblings
          len = parentNode.children.length;

          if (num > 0) {
            // if index is not past the end of the array
            if (i + num < len) {
              currNode = parentNode.children[i + num];
            } else {
              // otherwise use last sibling
              currNode = parentNode.children[len - 1];
            }
          } else {
            if (i + num > 0) {
              currNode = parentNode.children[i + num];
            } else {
              currNode = parentNode.children[0];
            }
          }
          this.node = currNode;
          this.path.push(currNode);
        }
        break;
      // skip to a node relative to the start/front of the array
      case 'start':
      case 'front':
        this.path.pop();
        parentNode = this.path[this.path.length - 1];
        len = parentNode.children.length;
        if (is('Number', num) && num > 0) {
          currNode = parentNode.children[num];
        } else {
          currNode = parentNode.children[0];
        }
        this.node = currNode;
        this.path.push(currNode);
        break;
      // skip to a node relative to the end of the array
      case 'end':
        this.path.pop();
        parentNode = this.path[this.path.length - 1];
        var end = parentNode.children.length - 1;
        if (is('Number', num) && num > 0) {
          currNode = parentNode.children[end - num];
        } else {
          currNode = parentNode.children[end];
        }
        this.node = currNode;
        this.path.push(currNode);
        break;
    }
  },

  // FIXME: test this
  /**
   * Send traveler/visitor to a specific node.
   */
  sendToNode: function (target) {
    var searcher = new Searcher(this.root, (node) => node === target, true);
    var result = searcher.search('preorder');
    if (result && Array.isArray(result)) {
      this.path = result;
      this.node = target;
    }
  },

  // FIXME: test this
  /**
   * Send the traveler/visitor directly to a node relative to the root node of the tree.
   * @param {Array} position - array of indexes leading to targeted node.
   */
  sendToPosition: function (position) {
    if (Array.isArray(position)) {
      this.reset();
      this.down(position);
    }
  },

  // FUTURE: sendToMatch()? to send to the first node for which a callback returns true?

  /*
  FUTURE: Idea for not storing the path... ¯\_(ツ)_/¯
  if we didn't store the path, we could use the walkable mixin functions.
  You would use the callback and "skip" over all the nodes till you found the current node.
  Then you would find the next node in the sequence order.
  this would be more computationally expensive, but the logic would be simpler.
  */

  // FUTURE: maybe all of the nextXXX() functions could be a mixin?
  // FUTURE: maybe mix in the walkable functions instead of using the searcher?

  /**
   * Find the next node in preorder sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  nextPreorder: function (path) {
    var result, currNode, parentNode, index, numChildren;
    var searcher = new Searcher(null, this._conditionCheckFn, true);

    // check sub-tree of the current node first
    // TODO: could probably use a searcher here?
    if (this.node.children) {
      for (index = 0; index < this.node.children.length; index++) {
        searcher.root = this.node.children[index];
        result = searcher.search('preorder');
        if (result) return path.concat(result);
      }
    }

    /*
    FUTURE: what if the searcher accepted a path to the node?
    then for each level in recursion (or the tree), we skip straight to the appropriate node, and continue
    */

    // we need to check older siblings of ancestors and their sub-trees
    while (path.length > 1) {
      currNode = path.pop();
      parentNode = path[path.length - 1];

      // traverse through older children
      index = parentNode.children.indexOf(currNode) + 1;
      numChildren = parentNode.children.length;
      for (index; index < numChildren; index++) {
        searcher.root = parentNode.children[index];
        result = searcher.search('preorder');
        if (result) return path.concat(result);
      }
      // otherwise continue up path
    }
    // if we've reached this point, we're back at the root node.
    // there is no next node.
  },

  /**
   * Find the next node in reversed preorder sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  nextReversePreorder: function (path) {
    var result, currNode, parentNode, i;
    var searcher = new Searcher(this.node, this._conditionCheckFn, true);

    // first check the sub-tree
    if (this.node.children) {
      for (i = this.node.children.length - 1; i >= 0; i--) {
        searcher.root = this.node.children[i];
        result = searcher.search('reverse-preorder');
        if (result) return path.concat(result);
      }
    }

    // check younger siblings
    // then check younger siblings of ancestors
    // if no ancestors have younger siblings, we're at the end of the traversal

    // while the path contains more than just the root node
    while (path.length > 0) {
      currNode = path.pop();
      parentNode = path[path.length - 1];

      // traverse through older children
      for (i = parentNode.children.indexOf(currNode) - 1; i >= 0; i--) {
        searcher.root = parentNode.children[i];
        result = searcher.search('reverse-preorder');
        if (result) return path.concat(result);
      }
      // otherwise continue up path
    }
  },

  /**
   * Find the next node in inorder sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  nextInorder: function (path) {
    var result, currNode;
    var prevNode = null;
    var searcher = new Searcher(null, this._conditionCheckFn, true);

    // move up the path till there are no nodes
    while (path.length > 0) {
      currNode = path[path.length - 1];
      // when there are children
      if (currNode.children?.length > 0) {
        // left descendents of the cached node appear before this one. therefore no need to check them.

        // when the current node only has left descendents
        if (currNode.children.length === 1) {
          if (currNode !== this.node) {
            // see if it matches conditions
            result = this._conditionCheckFn(currNode);
            if (result) return path;
          }
        }
        // otherwise currNode has more than one child.
        // when the right child is not the previous node
        else if (currNode.children[1] !== prevNode) {
          // when the current node is not the node we started at.
          if (currNode !== this.node) {
            result = this._conditionCheckFn(currNode);
            if (result) return path;
          }

          // otherwise, check the right sub-tree
          searcher.root = currNode.children[1];
          result = searcher.search('inorder');
          if (result) return path.concat(result);
        }
      }

      // otherwise continue up the path (ancestors)
      path.pop();
      prevNode = currNode;
    }
  },

  /**
   * Find the next node in reversed inorder sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  nextReverseorder: function (path) {
    var result, currNode;
    // move up the path till there are no nodes
    var prevNode = null;
    var searcher = new Searcher(this.node, this._conditionCheckFn, true);

    while (path.length > 0) {
      currNode = path[path.length - 1];

      // doesn't matter if this node has right children or not, they're before this node in the order.
      // don't check the node if the right child is the previous node.
      if (currNode.children?.length > 0 && currNode.children[0] !== prevNode) {
        // check this node if its not the node we started at.
        if (currNode !== this.node) {
          result = this._conditionCheckFn(currNode);
          if (result) return path;
        }
        searcher.root = currNode.children[0];
        result = searcher.search('reverseorder');
        if (result) return path.concat(result);
      }

      // continue up the path
      path.pop();
      prevNode = currNode;
    }
  },

  /**
   * Find the next node in postorder sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  nextPostorder: function (path) {
    var result, currNode, parentNode, i, len;
    // if we're at this node, all descendents appear before this node
    // check older siblings
    // check ancestor and then its older siblings

    var searcher = new Searcher(this.node, this._conditionCheckFn, true);

    // while the path contains nodes
    while (path.length > 1) {
      // descendents of node have been traversed.
      // older siblings have been traversed.
      // check younger siblings and their descendents.
      // move up.
      currNode = path.pop();
      parentNode = path[path.length - 1];
      i = parentNode.children.indexOf(currNode) + 1;
      len = parentNode.children.length;

      // check older siblings of current node
      for (i; i < len; i++) {
        searcher.root = parentNode.children[i];
        result = searcher.search('postorder');
        if (result) return path.concat(result);
      }

      // check parent
      result = this._conditionCheckFn(parentNode);
      if (result === true) return path;

      // otherwise continue up path
    }
  },

  /**
   * Find the next node in reversed postorder sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  nextReversePostorder: function (path) {
    var result, currNode, parentNode, i;
    var searcher = new Searcher(this.node, this._conditionCheckFn, true);

    // while the path contains nodes
    while (path.length > 1) {
      currNode = path.pop();
      parentNode = path[path.length - 1];
      i = parentNode.children.indexOf(currNode) - 1;
      // check younger siblings of current node
      for (i; i >= 0; i--) {
        searcher.root = parentNode.children[i];
        result = searcher.search('reverse-postorder');
        if (result) return path.concat(result);
      }
      // check parent
      result = this._conditionCheckFn(parentNode);
      if (result) return path;

      // otherwise continue up path
      currNode = parentNode;
    }
  },

  /**
   * Travel to the next node in the specified ordering sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  walkForward: function (path) {
    switch (this.settings.order) {
      case 'preorder':
        return this.nextPreorder(path);
      case 'reverse-preorder':
        return this.nextReversePreorder(path);
      case 'inorder':
        return this.nextInorder(path);
      case 'reverseorder':
        return this.nextReverseorder(path);
      case 'postorder':
        return this.nextPostorder(path);
      case 'reverse-postorder':
        return this.nextReversePostorder(path);
      default:
        return null;
    }
  },

  /**
   * Travel to the previous node in the specified ordering sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  walkBackward: function (path) {
    // here we're inverting the order for each one to be able to go backwards one step
    switch (this.settings.order) {
      case 'preorder':
        return this.nextReversePostorder(path);
      case 'reverse-preorder':
        return this.nextPostorder(path);
      case 'inorder':
        return this.nextReverseorder(path);
      case 'reverseorder':
        return this.nextInorder(path);
      case 'postorder':
        return this.nextReversePreorder(path);
      case 'reverse-postorder':
        return this.nextPreorder(path);
      default:
        return null;
    }
  },
};

module.exports = TreeTraveler;
