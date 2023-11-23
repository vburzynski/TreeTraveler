var TreeNode = require('./treeNode');
var _ = require('lodash');

var defaults = {
  shouldLoop: false,
  order: 'preorder',
};

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
    order === 'reverse-postorder' ||
    order === 'levelorder' ||
    order === 'inverse-levelorder'
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
  var node, i;
  for (i = 0; i < arr.length; i++) {
    if (_.isArray(arr[i])) {
      buildFromArray(arr[i], node, callback);
    } else {
      node = new TreeNode(arr[i]);
      if (_.isFunction(callback)) {
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
  this.conditionFn = (_node) => true;
};

TreeTraveler.prototype = {
  /**
   * Settings
   * @type {Object}
   */
  settings: null,

  /**
   * The root of the tree
   * @type {TreeNode}
   */
  root: null,

  /**
   * The current tree node
   * @type {TreeNode}
   */
  node: null,

  /**
   * The path from the root node to the current node
   * @type {TreeNode[]}
   */
  path: null,

  /**
   * Builds a tree from an array
   * @param {Array} arr multi-dimensional array of values
   */
  build: function (arr, callback) {
    this.root = buildFromArray(arr, null, callback);
    this.reset();
    return this;
  },

  /**
   *
   */
  conditionFn: function () {},

  /**
   * Reset the tree. (Sends it to the first node in the sequence)
   */
  reset: function () {
    // grab path to the first node in the current sequence
    this.path = this.search(this.settings.order, this.root, this.conditionFn, true);
    this.node = this.path[this.path.length - 1];
    return this;
  },

  /**
   * Destroys the tree structure and it's nodes
   * @param {Boolean} shouldDestroyNodes Defaults to true, when true, tree nodes with be destroyed along with the tree.
   */
  destroy: function (shouldDestroyNodes) {
    shouldDestroyNodes = typeof shouldDestroyNodes === 'undefined' ? true : shouldDestroyNodes;
    if (shouldDestroyNodes) {
      var fn = function (node) {
        node.destroy();
      };
      this.postorderTraversal(this.root, fn);
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
    return this;
  },

  /**
   * Sets the condition check function
   * @param {Function} conditionFn - function which accepts a treeNode object and returns true or false
   */
  setConditionCheck: function (conditionFn) {
    if (conditionFn && _.isFunction(conditionFn)) {
      this.conditionFn = conditionFn;
    }
    return this;
  },

  /**
   * Travel to the next node in the previously specified order
   */
  next: function () {
    var result = this.findNext(
      [].concat(this.path),
      this.conditionFn,
    );
    if (result) {
      this.path = result;
      this.node = this.path[this.path.length - 1];
    } else if (this.settings.shouldLoop) {
      this.reset();
    }
    return this;
  },

  /**
   * Travel to the previous node in the order specified
   */
  prev: function () {
    var result = this.findPrev(
      [].concat(this.path),
      this.conditionFn,
    );
    if (result) {
      this.path = result;
      this.node = this.path[this.path.length - 1];
    } else if (this.settings.shouldLoop) {
      this.reset();
    }
    return this;
  },

  /**
   * Travel up to an immediate ancestor of the current node. When at the
   * root of a tree, stay put.
   * @param {number} [num=0] - number of levels to move up
   */
  up: function (num) {
    num = _.isNumber(num) ? num : 1;
    this.node = this.path.pop();
    // while the path contains more than just the root node and num is > 0
    while (this.path.length > 1 && num > 0) {
      // remove the next node from the path
      this.node = this.path.pop();
      num--;
    }
    this.path.push(this.node);
    return this;
  },

  /**
   * Drill down to a descendent of the current node
   */
  down: function (position) {
    if (_.isArray(position)) {
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
    return this;
  },

  /**
   * Skip to a sibling or ancestor of the current node. Use the down() method to drill down into the descendents of a node.
   * @param {String} direction directionality of the skip
   * @param {Number|Array} num Number of nodes to move in the given direction (per level)
   * @param {Number} depth how far to move up the path to the root (optional)
   */
  skip: function (direction, num, depth) {
    direction = direction || 'path';
    num = _.isNumber(num) ? num : 1;
    depth = _.isNumber(depth) ? Math.abs(depth) : 0;
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
      case 'next':
        if (num > 0) {
          fn = function () {
            num--;
            return num <= 0;
          };
          this.next(fn);
        }
        break;
      // skip back to a previous node in the sequence
      case 'prev':
        if (_.isNumber(num) && num > 0) {
          fn = function () {
            num--;
            return num <= 0;
          };
          this.back(fn);
        }
        break;
      // skip to a sibling
      case 'sibling':
        if (_.isNumber(num) && num !== 0) {
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
        if (_.isNumber(num) && num > 0) {
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
        if (_.isNumber(num) && num > 0) {
          currNode = parentNode.children[end - num];
        } else {
          currNode = parentNode.children[end];
        }
        this.node = currNode;
        this.path.push(currNode);
        break;
    }
    return this;
  },

  /**
   * Send to a specific node.
   */
  sendTo: function (target) {
    var findFn = function (node) {
      return node === target;
    };
    var result = this.search('preorder', this.root, findFn, true);
    if (result && _.isArray(result)) {
      this.path = result;
      this.node = target;
    }
    return this;
  },

  /**
   * Send the directly to a node relative to the root node of the tree.
   * @param {Array} position - array of indexes leading to targeted node.
   */
  sendToPosition: function (position) {
    if (_.isArray(position)) {
      this.reset();
      this.down(position);
    }
    return this;
  },
};

/**
 * Traverse tree in preorder ( root, children left to right )
 * @param {Object} root root of the tree
 * @param {Function} callback callback function to execute for each node
 * @param {Boolean} shouldTrack When true, results of search are returned in an array
 * @returns {Array|Boolean} Returns the result of the preorder
 */
TreeTraveler.prototype.preorderTraversal = function (root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var result = callback(root);

  // NOTE: when callback returns the boolean value of true, assume
  // we're performing a search and this is the node being saught.
  if (result === true) {
    if (shouldTrack) {
      return [root];
    } else {
      return root;
    }
  } else {
    var i = 0,
      len = root.children.length;
    for (i; i < len; i++) {
      result = this.preorderTraversal(root.children[i], callback, shouldTrack);
      if (result) {
        if (_.isArray(result)) {
          result.unshift(root);
        }
        return result;
      }
    }
  }
  return false;
};

/**
 * Traverse tree in reverse preorder (root, children right to left)
 * @param {Object} root root of the tree
 * @param {Function} callback callback function
 * @param {Boolean} shouldTrack when, true, results of searches are returned in an array
 * @returns {Array|Boolean}
 */
TreeTraveler.prototype.reversePreorderTraversal = function (root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var result = callback(root);
  if (result === true) {
    if (shouldTrack) {
      return [root];
    } else {
      return root;
    }
  } else {
    var i = root.children.length - 1;
    for (i; i >= 0; i--) {
      result = this.reversePreorderTraversal(root.children[i], callback, shouldTrack);
      if (result) {
        if (_.isArray(result)) {
          result.unshift(root);
        }
        return result;
      }
    }
  }
  return false;
};

/**
 * Traverse tree inorder
 * @param {Object} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Array|Boolean}
 */
TreeTraveler.prototype.inorderTraversal = function (root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var result;
  // when there are two children
  if (root.children.length === 2) {
    // check left child
    result = this.inorderTraversal(root.children[0], callback, shouldTrack);
    // if the result is defined and not false, return it.
    if (result) {
      // result contains the node found while traversing the left child
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
    // check node
    result = callback(root);
    if (result === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    }
    // check right child
    result = this.inorderTraversal(root.children[1], callback, shouldTrack);
    if (result) {
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
    // otherwise not found
    return false;
  } else if (root.children.length === 1) {
    // when there is one child
    result = this.inorderTraversal(root.children[0], callback, shouldTrack);
    // if the result is defined and not false, return it.
    if (result) {
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
    result = callback(root);
    if (result === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    } else {
      return false;
    }
  } else if (root.children.length === 0) {
    // when there are no children
    result = callback(root);
    if (result === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
};

/**
 * Traverse tree in reverse order ( right, root, left )
 * @param {Object} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Array|Boolean}
 */
TreeTraveler.prototype.reverseorderTraversal = function (root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var result;
  if (root.children.length === 2) {
    result = this.reverseorderTraversal(root.children[1], callback, shouldTrack);
    // if the result is defined and not false, return it.
    if (result) {
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
    result = callback(root);
    if (result === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    } else {
      result = this.reverseorderTraversal(root.children[0], callback, shouldTrack);
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
  } else if (root.children.length === 1) {
    result = callback(root);
    if (result === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    } else {
      result = this.reverseorderTraversal(root.children[0], callback, shouldTrack);
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
  } else if (root.children.length === 0) {
    result = callback(root);
    if (result === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    } else {
      return false;
    }
  }
  return false;
};

/**
 * Traverse tree in post order ( children left to right, root )
 * @param {Object} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Array|Boolean}
 */
TreeTraveler.prototype.postorderTraversal = function (root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var i = 0,
    len = root.children.length,
    result;
  for (i; i < len; i++) {
    result = this.postorderTraversal(root.children[i], callback, shouldTrack);
    if (result) {
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
  }
  result = callback(root);
  if (result === true) {
    if (shouldTrack) {
      return [root];
    } else {
      return root;
    }
  } else {
    return false;
  }
};

/**
 * Traverse tree in reverse post order ( children right to left, root )
 * @param {Object} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Array|Boolean}
 */
TreeTraveler.prototype.reversePostorderTraversal = function (root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var i = root.children.length - 1,
    result;
  for (i; i >= 0; i--) {
    result = this.reversePostorderTraversal(root.children[i], callback, shouldTrack);
    if (result) {
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
  }
  result = callback(root);
  if (result === true) {
    if (shouldTrack) {
      return [root];
    } else {
      return root;
    }
  } else {
    return false;
  }
};

/**
 * Traverse tree in level order ( each tier, top to bottom, from left to right )
 * @param {*} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Boolean}
 */
TreeTraveler.prototype.levelorderTraversal = function (root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var node,
    i,
    len,
    result,
    queue = [root]; // start the queue with the root node

  var fn = function (node2) {
    return node2 === node;
  };
  // while there are queued nodes
  while (queue.length > 0) {
    // execute callback with node at front
    node = queue.shift();
    result = callback(node);
    if (result === true) {
      // if tracking path to node, we need to find it
      if (shouldTrack) {
        return this.preorderTraversal(root, fn, true);
      } else {
        // otherwise just return the node found
        return node;
      }
    }
    // push all of the node's children onto the end of the queue
    i = 0;
    len = node.children.length;
    for (i; i < len; i++) {
      queue.push(node.children[i]);
    }
  }
  return false;
};

/**
 * Traverse tree in reverse level order ( each tier, top to bottom, right to left )
 * @param {*} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Boolean}
 */
TreeTraveler.prototype.reverseLevelorderTraversal = function (root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var node;
  var i;
  var result;
  var queue = [root]; // start the queue with the root node

  var fn = function (node2) {
    return node2 === node;
  };

  // while there are queued nodes
  while (queue.length > 0) {
    // execute callback with node at front
    node = queue.shift();
    result = callback(node);
    if (result === true) {
      // if tracking path to node, we need to find it
      if (shouldTrack) {
        return this.preorderTraversal(root, fn, true);
      } else {
        // otherwise just return the node found
        return node;
      }
    }
    // push all of the node's children onto the end of the queue
    i = node.children.length - 1;
    for (i; i >= 0; i--) {
      queue.push(node.children[i]);
    }
  }
  return false;
};

/**
 * Traverse tree in inverse level order ( each tier, bottom to top, right to left )
 * @param {*} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Boolean}
 */
TreeTraveler.prototype.inverseLevelorderTraversal = function (root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var stack = [],
    queue = [root],
    node,
    i,
    len,
    result;
  while (queue.length > 0) {
    node = queue.shift();
    stack.push(node);
    i = 0;
    len = node.children.length;
    for (i; i < len; i++) {
      queue.push(node.children[i]);
    }
  }

  var fn = function (node2) {
    return node2 === node;
  };

  while (stack.length > 0) {
    node = stack.pop();
    result = callback(node);
    if (result === true) {
      // if tracking path to node, we need to find it
      if (shouldTrack) {
        return this.preorderTraversal(root, fn, true);
      } else {
        // otherwise just return the node found
        return node;
      }
    }
  }
  return false;
};

/**
 * traverse the tree (or sub-tree) in a specific order.
 * Stops traversal whenever the callback returns true.
 * @param {String} traversalOrder Order in which to traverse the tree
 * @param {TreeNode} root root of the tree
 * @param {Function} callback callback to execute for every node
 * @param {Boolean} shouldTrack shouldTrack parameter
 * @returns {Array|Object} result of the traversal
 */
TreeTraveler.prototype.search = function (traversalOrder, root, callback, shouldTrack) {
  // proceed based off the specified order
  switch (traversalOrder) {
    case 'preorder':
      return this.preorderTraversal(root, callback, shouldTrack);
    case 'reverse-preorder':
    case 'inverse-postorder':
      return this.reversePreorderTraversal(root, callback, shouldTrack);
    case 'inorder':
      return this.inorderTraversal(root, callback, shouldTrack);
    case 'reverseorder':
    case 'inverseorder':
    case 'reverse-inorder':
    case 'inverse-inorder':
      return this.reverseorderTraversal(root, callback, shouldTrack);
    case 'postorder':
      return this.postorderTraversal(root, callback, shouldTrack);
    case 'reverse-postorder':
    case 'inverse-preorder':
      return this.reversePostorderTraversal(root, callback, shouldTrack);
    case 'levelorder':
      return this.levelorderTraversal(root, callback, shouldTrack);
    case 'reverse-levelorder':
      return this.reverseLevelorderTraversal(root, callback, shouldTrack);
    case 'inverse-levelorder':
      return this.inverseLevelorderTraversal(root, callback, shouldTrack);
    case 'inverse-reverse-levelorder':
    case 'reverse-inverse-levelorder':
      throw new Error(`${traversalOrder} is not implemented`);
  }
};

/**
 * Find the next node in preorder sequence given an arbitrary node and the path to that node.
 * @param {Array} path array of nodes containing the path from the root to the arbitrary node
 * @param {Function} fn conditional function check
 * @returns {Boolean|Object} results of search
 */
TreeTraveler.prototype.findNextPreorder = function (path, fn) {
  var result, currNode, parentNode, i, len;

  // check sub-tree first
  if (_.has(this.node, 'children')) {
    for (i = 0; i < this.node.children.length; i++) {
      result = this.search('preorder', this.node.children[i], fn, true);
      if (result !== false) {
        return path.concat(result);
      }
    }
  }

  // check older siblings of ancestors and their sub-trees
  // pop off current node
  while (path.length > 0) {
    // get parent node as well
    currNode = path.pop();
    parentNode = path[path.length - 1];
    // get index of node in parent's children array
    i = parentNode.children.indexOf(currNode) + 1;
    // get number of siblings
    len = parentNode.children.length;
    // traverse through older children
    for (i; i < len; i++) {
      result = this.search('preorder', parentNode.children[i], fn, true);
      if (result !== false) {
        return path.concat(result);
      }
    }
    // otherwise continue up path
  }

  // if we've reached this point, we're back at the root node.
  // there is no next node.
  return false;
};

/**
 * Find the next node in reversed preorder sequence given an arbitrary node and the path to that node.
 * @param {Array} path array of nodes containing the path from the root to the arbitrary node
 * @param {Function} fn conditional function check
 * @returns {Boolean|Object} results of search
 */
TreeTraveler.prototype.findNextReversePreorder = function (path, fn) {
  var result, currNode, parentNode, i;
  // check sub-tree
  if (_.has(this.node, 'children')) {
    i = this.node.children.length - 1;
    for (i; i >= 0; i--) {
      result = this.search('preorder', this.node.children[i], fn, true);
      if (result !== false) {
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
      result = this.search('reverse-preorder', parentNode.children[i], fn, true);
      if (result !== false) {
        return path.concat(result);
      }
    }
    // otherwise continue up path
  }
  return false;
};

/**
 * Find the next node in inorder sequence given an arbitrary node and the path to that node.
 * @param {Array} path array of nodes containing the path from the root to the arbitrary node
 * @param {Function} fn conditional function check
 * @returns {Boolean|Object} results of search
 */
TreeTraveler.prototype.findNextInorder = function (path, fn) {
  var result, currNode;
  // move up the path till there are no nodes
  var prevNode = null;
  while (path.length > 0) {
    currNode = path[path.length - 1];
    // left descendents of this node appear before this one. no need to check them.
    if (_.has(currNode, 'children') && currNode.children.length > 0) {
      // currNode only has left descendents
      if (currNode.children.length === 1) {
        if (currNode !== this.node) {
          // see if it matches conditions
          result = fn(currNode);
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
          result = fn(currNode);
          if (result) {
            return path;
          }
        }
        // otherwise, check the right sub-tree
        result = this.search('inorder', currNode.children[1], fn, true);
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
};

/**
 * Find the next node in reversed inorder sequence given an arbitrary node and the path to that node.
 * @param {Array} path array of nodes containing the path from the root to the arbitrary node
 * @param {Function} fn conditional function check
 * @returns {Boolean|Object} results of search
 */
TreeTraveler.prototype.findNextReverseorder = function (path, fn) {
  var result, currNode;
  // move up the path till there are no nodes
  var prevNode = null;
  while (path.length > 0) {
    currNode = path[path.length - 1];
    if (_.has(currNode, 'children') && currNode.children.length > 0 && currNode.children[0] !== prevNode) {
      // doesn't matter if this node has right children or not, they're before this node in the order.
      // check this node if its not the node we started at.
      // don't check the node if the right child is the previous node.
      if (currNode !== this.node) {
        result = fn(currNode);
        if (result) {
          return path;
        }
      }
      result = this.search('reverseorder', currNode.children[0], fn, true);
      if (result) {
        return path.concat(result);
      }
    }
    path.pop();
    prevNode = currNode;
    // continue up the path
  }
  return false;
};

/**
 * Find the next node in postorder sequence given an arbitrary node and the path to that node.
 * @param {Array} path array of nodes containing the path from the root to the arbitrary node
 * @param {Function} fn conditional function check
 * @returns {Boolean|Object} results of search
 */
TreeTraveler.prototype.findNextPostorder = function (path, fn) {
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
      result = this.search('postorder', parentNode.children[i], fn, true);
      if (result !== false) {
        return path.concat(result);
      }
    }
    // check parent
    result = fn(parentNode);
    if (result === true) {
      return path;
    }
    // otherwise continue up path
  }
  return false;
};

/**
 * Find the next node in reversed postorder sequence given an arbitrary node and the path to that node.
 * @param {Array} path array of nodes containing the path from the root to the arbitrary node
 * @param {Function} fn conditional function check
 * @returns {Boolean|Object} results of search
 */
TreeTraveler.prototype.findNextReversePostorder = function (path, fn) {
  var result, currNode, parentNode, i;
  // while the path contains nodes
  while (path.length > 1) {
    currNode = path.pop();
    parentNode = path[path.length - 1];
    i = parentNode.children.indexOf(currNode) - 1;
    // check younger siblings of current node
    for (i; i >= 0; i--) {
      result = this.search('reverse-postorder', parentNode.children[i], fn, true);
      if (result !== false) {
        return path.concat(result);
      }
    }
    // check parent
    result = fn(parentNode);
    if (result !== false) {
      return path;
    }
    // otherwise continue up path
    currNode = parentNode;
  }
  return false;
};

/**
 * Find the next node in levelorder sequence given an arbitrary node and the path to that node.
 * @param {Array} path array of nodes containing the path from the root to the arbitrary node
 * @param {Function} fn conditional function check
 * @returns {Boolean|Object} results of search
 */
TreeTraveler.prototype.findNextLevelorder = function (path, fn) {
  var result, i, len;
  // check level to the right
  // continue to next level down
  var arr = [];
  var tempFn = function (node) {
    arr.push(node);
  };
  var findFn = function (node) {
    return node === arr[i];
  };
  this.search('levelorder', this.root, tempFn, false);
  i = arr.indexOf(this.node) + 1;
  len = arr.length;
  for (i; i < len; i++) {
    result = fn(arr[i]);
    if (result) {
      // return the path to that node
      return this.search('preorder', this.root, findFn, true);
    }
  }
  return false;
};

/**
 * Find the next node in inverted levelorder sequence given an arbitrary node and the path to that node.
 * @param {Array} path array of nodes containing the path from the root to the arbitrary node
 * @param {Function} fn conditional function check
 * @returns {Boolean|Object} results of search
 */
TreeTraveler.prototype.findNextInverseLevelorder = function (path, fn) {
  var result, i, len;
  // check level to the left
  // continue to next level down
  var arr = [];
  var tempFn = function (node) {
    arr.push(node);
  };
  var findFn = function (node) {
    return node === arr[i];
  };
  this.search('inverse-levelorder', this.root, tempFn, false);
  i = arr.indexOf(this.node) + 1;
  len = arr.length;
  for (i; i < len; i++) {
    result = fn(arr[i]);
    if (result) {
      // return the path to that node
      return this.search('preorder', this.root, findFn, true);
    }
  }
  return false;
};

/**
 * Travel to the next node in the specified ordering sequence given an arbitrary node and the path to that node.
 * @param {TreeNode} this.root root of the tree
 * @param {Object} this.node arbitrary node
 * @param {Array} path array of nodes containing the path from the root to the arbitrary node
 * @param {Function} fn conditional function check
 * @returns {Boolean|Object} results of search
 */
TreeTraveler.prototype.findNext = function (path, fn) {
  switch (this.settings.order) {
    case 'preorder':
      return this.findNextPreorder(path, fn);
    case 'reverse-preorder':
      return this.findNextReversePreorder(path, fn);
    case 'inorder':
      return this.findNextInorder(path, fn);
    case 'reverseorder':
      return this.findNextReverseorder(path, fn);
    case 'postorder':
      return this.findNextPostorder(path, fn);
    case 'reverse-postorder':
      return this.findNextReversePostorder(path, fn);
    case 'levelorder':
      return this.findNextLevelorder(path, fn);
    case 'inverse-levelorder':
      return this.findNextInverseLevelorder(path, fn);
    default:
      return false;
  }
};

/**
 * Travel to the previous node in the specified ordering sequence given an arbitrary node and the path to that node.
 * @param {Array} path array of nodes containing the path from the root to the arbitrary node
 * @param {Function} fn conditional function check
 * @returns {Boolean|Object} results of search
 */
TreeTraveler.prototype.findPrev = function (path, fn) {
  switch (this.settings.order) {
    case 'preorder':
      // invert the preorder: find next in reverse-postorder
      return this.findNextReversePostorder(path, fn);
    case 'reverse-preorder':
      // invert the order: find next in postorder
      return this.findNextPostorder(path, fn);
    case 'inorder':
      // invert the order: find next in reverseorder
      return this.findNextReverseorder(path, fn);
    case 'reverseorder':
      // invert the order: find next inorder
      return this.findNextInorder(path, fn);
    case 'postorder':
      // invert the order: find next in reverse-preorder
      return this.findNextReversePreorder(path, fn);
    case 'reverse-postorder':
      // invert the order: find next in preorder
      return this.findNextPreorder(path, fn);
    case 'levelorder':
      // invert the order: find next in inverseLevelorder
      return this.findNextInverseLevelorder(path, fn);
    case 'inverse-levelorder':
      // invert the order: find next in levelorder
      return this.findNextLevelorder(path, fn);
    default:
      return false;
  }
};

module.exports = TreeTraveler;
