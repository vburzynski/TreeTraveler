// DONE: the traveral functions were not actually dependent on the TreeTraveler object, they just need a node. Extracted.
// TODO: original code was mixing up concepts -- tree, and iterators -- refactor
// so we could have Tree and TreeTraveler/TreeIterator

// TODO: add parent node to TreeNode, this would get rid of the path
// TODO: get rid of path
// counter point -- for some tree algorithms you always start from the root

// TODO: break up the skip() function -- it's confusing, also too long of a method. break into multiple
// you can specify prev(3) or next(3) instead?

// TODO: should build() be chainable (and return this), or return a Set of all the nodes? (or array etc.)
// TODO: if I changed the destroy() test, I wouldn't need the build() callback.
// TODO: is it worth having the callback to call something like onBuild()/onAttach() in the nodes? or would it be better to do that separately?
// TODO: consider getting rid of settings object. there's not enough to justify it? collapse it down. -- NOT SURE about this one
// TODO: the find functions... can get rid of more of the arguments being passed around
// TODO: test sendToNode()
// TODO: test sendToPosition()
// TODO: test search()
// TODO: convert into a class? or keep prototypal?

var TreeNode = require('./treeNode');
var {
  preorder,
  reversePreorder,
  inorder,
  reverseorder,
  postorder,
  reversePostorder,
} = require('./treeTraversal');
var { Search } = require('./walkableMixin');

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
 * Build a tree structure from a multi-dimensional array
 * Example: [1,[2,[4,[7],5],3,[6,[8,9]]]]
 * @param {Array} arr multi-dimensional array containing values
 * @param {Object} parentNode parent node
 * @param {Function} callback callback function
 * @returns {TreeNode} root TreeNode of the full tree structure
 */
function buildFromArray(arr, parentNode, callback) {
  var node;
  for (var i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      buildFromArray(arr[i], node, callback);
    } else {
      node = new TreeNode(arr[i]);
      if (typeof callback === 'function') {
        callback(node);
      }
      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  }
  return node;
}

/**
 * @constructor
 */
var TreeTraveler = function (options) {
  this.settings = { ...defaults, ...options };
  this.conditionCheck = _node => true;
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
   * @type {Function}
   */
  conditionCheck: function () {},

  /**
   * Builds a tree from an array
   * @param {Array} arr multi-dimensional array of values
   */
  build: function (arr, callback = () => {}) {
    this.root = buildFromArray(arr, null, callback);
    this.reset();
  },

  /**
   * Reset the tree. (Sends it to the first node in the sequence)
   */
  reset: function () {
    // grab path to the first node in the current sequence
    var search = new Search(this.root, this.conditionCheck, true);
    this.path = search.search(this.settings.order);
    this.node = this.path[this.path.length - 1];
  },

  /**
   * Destroys the tree structure and it's nodes
   * @param {Boolean} shouldDestroyNodes when true, tree nodes with be destroyed along with the tree.
   */
  destroy: function (shouldDestroyNodes) {
    if (shouldDestroyNodes) {
      postorder(this.root, node => node.destroy());
    }

    this.root = null;
    this.node = null;
    this.path = null;
    this.settings = null;
  },

  /**
   * Sets the order in which the TreeTraveler will travel the tree
   */
  setOrder: function (order) {
    this.settings.order = validOrder(order) ? order : 'preorder';
    this.reset();
  },

  /**
   * Sets the condition check function
   * @param {Function} conditionCheck - function which accepts a treeNode object and returns true or false
   */
  setConditionCheck: function (conditionCheck) {
    if (typeof conditionCheck === 'function') {
      this.conditionCheck = conditionCheck;
    }
  },

  /**
   * Travel to the next node in the previously specified order
   */
  step: function () {
    var result = this.walk([...this.path]);
    if (result) {
      this.path = result;
      this.node = this.path[this.path.length - 1];
    } else if (this.settings.shouldLoop) {
      this.reset();
    }
  },

  /**
   * Travel to the previous node in the order specified
   */
  back: function () {
    var result = this.findPrev([...this.path]);
    if (result) {
      this.path = result;
      this.node = this.path[this.path.length - 1];
    } else if (this.settings.shouldLoop) {
      this.reset();
    }
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

  // FIXME: untested
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

    // determine the directionality of our movement
    switch (direction) {
      // skip ahead to a node in the sequence
      // example:
      // Skip ahead 3 nodes:
      // traveller.skip('next',3);
      case 'step':
        if (num > 0) {
          fn = function () {
            num--;
            return num <= 0;
          };
          this.step(fn);
        }
        break;
      // skip back to a previous node in the sequence
      case 'back':
        if (is('Number', num) && num > 0) {
          fn = function () {
            num--;
            return num <= 0;
          };
          this.back(fn);
        }
        break;
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

  // FIXME: not tested
  /**
   * Send traveler/visitor to a specific node.
   */
  sendToNode: function (target) {
    var findFn = function (node) {
      return node === target;
    };
    var result = preorder(this.root, findFn, true);
    if (result && Array.isArray(result)) {
      this.path = result;
      this.node = target;
    }
  },

  // FIXME: not working
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

  /**
   * Find the next node in preorder sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  nextPreorder: function (path) {
    var result, currNode, parentNode, index, numChildren;

    // check sub-tree of the current node first
    if (this.node.children) {
      for (index = 0; index < this.node.children.length; index++) {
        result = preorder(this.node.children[index], this.conditionCheck, true);
        if (result) {
          return path.concat(result);
        }
      }
    }

    // we need to check older siblings of ancestors and their sub-trees
    while (path.length > 0) {
      currNode = path.pop();
      parentNode = path[path.length - 1];

      // traverse through older children
      index = parentNode.children.indexOf(currNode) + 1;
      numChildren = parentNode.children.length;
      for (index; index < numChildren; index++) {
        result = preorder(parentNode.children[index], this.conditionCheck, true);
        if (result) {
          return path.concat(result);
        }
      }
      // otherwise continue up path
    }

    // if we've reached this point, we're back at the root node.
    // there is no next node.
    return false;
  },

  /**
   * Find the next node in reversed preorder sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  nextReversePreorder: function (path) {
    var result, currNode, parentNode, i;
    // check sub-tree
    if (this.node.children) {
      i = this.node.children.length - 1;
      for (i; i >= 0; i--) {
        result = preorder(this.node.children[i], this.conditionCheck, true);
        if (result) {
          return path.concat(result);
        }
      }
    }
    // check younger siblings
    // check younger siblings of ancestors
    // while the path contains more than just the root node
    while (path.length > 0) {
      // pop off current node
      currNode = path.pop();
      // get parent node as well
      parentNode = path[path.length - 1];
      // get index of node in parent's children array
      i = parentNode.children.indexOf(currNode) - 1;
      // traverse through older children
      for (i; i >= 0; i--) {
        result = reversePreorder(parentNode.children[i], this.conditionCheck, true);
        if (result) {
          return path.concat(result);
        }
      }
      // otherwise continue up path
    }
    return false;
  },

  /**
   * Find the next node in inorder sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  nextInorder: function (path) {
    var result, currNode;
    // move up the path till there are no nodes
    var prevNode = null;
    while (path.length > 0) {
      currNode = path[path.length - 1];
      // left descendents of this node appear before this one. no need to check them.
      if (currNode.children?.length > 0) {
        // currNode only has left descendents
        if (currNode.children.length === 1) {
          if (currNode !== this.node) {
            // see if it matches conditions
            result = this.conditionCheck(currNode);
            if (result) {
              return path;
            }
          }
        } else if (currNode.children[1] !== prevNode) {
          // otherwise currNode has more than one child.
          // when the right child is not the previous node
          // node is not the node we started at.
          if (currNode !== this.node) {
            // see if currNode matches conditions
            result = this.conditionCheck(currNode);
            if (result) {
              return path;
            }
          }
          // otherwise, check the right sub-tree
          result = inorder(currNode.children[1], this.conditionCheck, true);
          if (result) {
            return path.concat(result);
          }
        }
      }
      path.pop();
      prevNode = currNode;
      // continue up the path
    }
    return false;
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
    while (path.length > 0) {
      currNode = path[path.length - 1];
      if (currNode.children?.length > 0 && currNode.children[0] !== prevNode) {
        // doesn't matter if this node has right children or not, they're before this node in the order.
        // check this node if its not the node we started at.
        // don't check the node if the right child is the previous node.
        if (currNode !== this.node) {
          result = this.conditionCheck(currNode);
          if (result) {
            return path;
          }
        }
        result = reverseorder(currNode.children[0], this.conditionCheck, true);
        if (result) {
          return path.concat(result);
        }
      }
      path.pop();
      prevNode = currNode;
      // continue up the path
    }
    return false;
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
        result = postorder(parentNode.children[i], this.conditionCheck, true);
        if (result) {
          return path.concat(result);
        }
      }
      // check parent
      result = this.conditionCheck(parentNode);
      if (result === true) {
        return path;
      }
      // otherwise continue up path
    }
    return false;
  },

  /**
   * Find the next node in reversed postorder sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  nextReversePostorder: function (path) {
    var result, currNode, parentNode, i;
    // while the path contains nodes
    while (path.length > 1) {
      currNode = path.pop();
      parentNode = path[path.length - 1];
      i = parentNode.children.indexOf(currNode) - 1;
      // check younger siblings of current node
      for (i; i >= 0; i--) {
        result = reversePostorder(parentNode.children[i], this.conditionCheck, true);
        if (result) {
          return path.concat(result);
        }
      }
      // check parent
      result = this.conditionCheck(parentNode);
      if (result) {
        return path;
      }
      // otherwise continue up path
      currNode = parentNode;
    }
    return false;
  },

  /**
   * Travel to the next node in the specified ordering sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  walk: function (path) {
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
        return false;
    }
  },

  /**
   * Travel to the previous node in the specified ordering sequence given an arbitrary node and the path to that node.
   * @param {Array} path array of nodes containing the path from the root to the arbitrary node
   * @returns {Boolean|Object} results of search
   */
  findPrev: function (path) {
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
        return false;
    }
  },
};



module.exports = TreeTraveler;
