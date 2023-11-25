var Searcher = require('./Searcher');

var defaults = {
  shouldLoop: false,
  order: 'preorder',
};

function is(type, obj) {
  return obj !== undefined && obj !== null && type === Object.prototype.toString.call(obj).slice(8, -1);
}

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
    // while the path contains more than just the root node and num is > 0
    while (this.path.length > 1 && num > 0) {
      // remove the next node from the path
      this.path.pop();
      this.node = this.path[this.path.length - 1];
      num--;
    }
    this.path.push(this.node);
  },

  /**
   * Drill down to a descendent of the current node
   * @param {number[]} indexes array of child node indexes to move to
   */
  down: function (indexes) {
    if (Array.isArray(indexes)) {
      var i,
        index,
        parentNode = this.node;

      // go through every position index
      for (i = 0; i < indexes.length; i++) {
        parentNode = this.node;
        index = indexes[i];
        if (index >= 0 && index < parentNode.children.length) {
          this.node = parentNode.children[index];
          this.path.push(this.node);
        } else {
          throw new Error('Error: position array contains an out of bounds index.');
        }
      }
    }
  },

  /**
   * travel to an older or younger sibling within the same parent
   * @param {number} delta accepst ± index (..., -1, 0, +1, ...)
   * @returns {TreeNode}
   */
  sibling(delta) {
    // when we're on the root node, there are no siblings
    if (this.path.length < 2) return;
    // nothing to do if we're not moving
    if (delta === 0) return;

    this.path.pop();
    var parent = this.path[this.path.length - 1];
    var index = parent.children.indexOf(this.node);
    var target = index + delta;

    // don't go beyond the bounds
    if (target < 0) target = 0;
    if (target >= parent.children.length) target = parent.children.length - 1;

    this.node = parent.children[target]
    this.path.push(this.node);
    return this.node;
  },

  /**
   * Go to the first sibling in the current set of siblings, or a node that is "n" steps from the start;
   * @param {number} num
   */
  start: function (num = 0) {
    this.path.pop();
    var parent = this.path[this.path.length - 1];
    var target = 0 + num;

    if (target < 0) target = 0;
    if (target >= parent.children.length) target = parent.children.length - 1;

    this.node = parent.children[target];
    this.path.push(this.node);
    return this.node;
  },

  /**
   * Go to the last sibling in the current set of siblings, or a node that is "n" steps from the end;
   * @param {number} [num] position, from end, of the page to go to
   * @returns
   */
  end: function (num = 0) {
    this.path.pop();
    var parent = this.path[this.path.length - 1];
    var target = parent.children.length - 1 - num;

    if (target < 0) target = 0;
    if (target >= parent.children.length) target = parent.children.length - 1;

    this.node = parent.children[target];
    this.path.push(this.node);
    return this.node;
  },

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

  /**
   * Send the traveler/visitor directly to a node relative to the root node of the tree.
   * @param {Array} indexes - array of indexes leading to targeted node.
   */
  sendToPosition: function (indexes) {
    if (Array.isArray(indexes)) {
      this.path = [this.root]
      this.node = this.root;
      this.down(indexes);
    }
  },

  // FUTURE: sendToMatch()? to send to the first node for which a callback returns true?

  /* FUTURE: Idea for not storing the path... ¯\_(ツ)_/¯
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

    /* FUTURE: what if the searcher accepted a path to the node?
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
