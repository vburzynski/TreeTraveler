/**
 * Constructs a tree node object.
 * @constructor
 */
var TreeNode = function (obj) {
  if (!(this instanceof TreeNode)) {
    return new TreeNode(obj);
  }
  if (obj) {
    this.value = obj;
  }
  this.children = [];
};

// Define all the instance methods and properties:
TreeNode.prototype = {
  /**
   * Object stored in this node
   */
  value: null,

  /**
   * list of child nodes
   */
  children: null,

  /**
   * set the value that this tree node holds
   * @param {Objedct} obj
   */
  set: function (obj) {
    this.value = obj;
  },

  /**
   * get the value that this tree node holds
   */
  get: function () {
    return this.value;
  },

  /**
   * clear the value stored on the tree node
   */
  clear: function () {
    this.value = null;
  },

  /**
   * destroy this node and its sub-tree
   */
  destroy: function () {
    this.clear();
    this.children = null;
    for (var key in this) {
      this[key] = null;
    }
  },

  /**
   * Add a new child tree node to this tree node
   * @param {Object} childNode
   */
  addChild: function (childNode) {
    if (childNode instanceof TreeNode) {
      this.children.push(childNode);
    }
  },

  /**
   * Add a new child node to this tree node
   * @param {Object} childNode
   * @param {Object} index
   */
  addChildAt: function (childNode, index) {
    if (childNode instanceof TreeNode) {
      this.children.splice(index, 0, childNode);
    }
  },

  /**
   * remove a specific child node
   * @param {Object} childNode
   */
  removeChild: function (childNode) {
    var index = this.getChildIndex(childNode);
    if (index > -1) {
      this.removeChildAt(index);
    }
  },

  /**
   * remove a child node at a specified index
   * @param {Object} index
   */
  removeChildAt: function (index) {
    this.children.splice(index, 1);
  },

  /**
   * get the index of the specified childNode
   */
  getChildIndex: function (childNode) {
    var i = 0,
      len = this.children.length;
    for (i; i < len; i++) {
      if (this.children[i] === childNode) {
        return i;
      }
    }
    return -1;
  },

  /**
   * get the child node at the specified index
   */
  getChildAt: function (index) {
    return this.children[index];
  },

  /**
   * Determines if the childNode is a direct descendant of the parent
   * @param {Object} childNode
   */
  hasChild: function (childNode) {
    return this.getChildIndex(childNode) > -1;
  },
};

/**
 * Build a tree structure from a multi-dimensional array
 * @param {Array} arr multi-dimensional array containing values
 * @param {Object} [parentNode] when provided, the tree is appended to this node's children
 * @param {Function} [callback] when provided, this is called with every new node
 * @returns {TreeNode} root TreeNode of the full tree structure
 * @example:
 *   TreeNode.buildTreeFromArray([1,[2,[4,[7],5],3,[6,[8,9]]]]);
 */
TreeNode.buildTreeFromArray = function(arr, parentNode, callback = () => {}) {
  var node;
  for (var i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      this.buildTreeFromArray(arr[i], node, callback);
    } else {
      node = new TreeNode(arr[i]);
      if (typeof callback === 'function') callback(node);
      if (parentNode) parentNode.children.push(node);
    }
  }
  return node;
}

module.exports = TreeNode;
