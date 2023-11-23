var _ = require('lodash');

/**
 * Traverse tree in preorder ( root, children left to right )
 * @param {Object} root root of the tree
 * @param {Function} callback callback function to execute for each node
 * @param {Boolean} shouldTrack When true, results of search are returned in an array
 * @returns {Array|Boolean} Returns the result of the preorder
 */
function preorderTraversal(root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var found = callback(root);

  // NOTE: when callback returns the boolean value of true, assume
  // we're performing a search and this is the node being saught.
  if (found === true) {
    if (shouldTrack) {
      return [root];
    } else {
      return root;
    }
  } else {
    var i = 0,
      len = root.children.length;
    for (i; i < len; i++) {
      found = preorderTraversal(root.children[i], callback, shouldTrack);
      if (found) {
        if (_.isArray(found)) {
          found.unshift(root);
        }
        return found;
      }
    }
  }
  return null;
};

/**
 * Traverse tree in reverse preorder (root, children right to left)
 * @param {Object} root root of the tree
 * @param {Function} callback callback function
 * @param {Boolean} shouldTrack when, true, results of searches are returned in an array
 * @returns {Array|Boolean}
 */
function reversePreorderTraversal(root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var found = callback(root);
  if (found === true) {
    if (shouldTrack) {
      return [root];
    } else {
      return root;
    }
  } else {
    var i = root.children.length - 1;
    for (i; i >= 0; i--) {
      found = reversePreorderTraversal(root.children[i], callback, shouldTrack);
      if (found) {
        if (_.isArray(found)) {
          found.unshift(root);
        }
        return found;
      }
    }
  }
  return null;
};

/**
 * Traverse tree inorder
 * @param {Object} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Array|Boolean}
 */
function inorderTraversal(root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var result;
  var found;
  // when there are two children
  if (root.children.length === 2) {
    // check left child
    result = inorderTraversal(root.children[0], callback, shouldTrack);
    // if the result is defined and not false, return it.
    if (result) {
      // result contains the node found while traversing the left child
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
    // check node
    found = callback(root);
    if (found === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    }
    // check right child
    result = inorderTraversal(root.children[1], callback, shouldTrack);
    if (result) {
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
    // otherwise not found
    return null;
  } else if (root.children.length === 1) {
    // when there is one child
    result = inorderTraversal(root.children[0], callback, shouldTrack);
    // if the result is defined and not false, return it.
    if (result) {
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
    found = callback(root);
    if (found === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    } else {
      return null;
    }
  } else if (root.children.length === 0) {
    // when there are no children
    found = callback(root);
    if (found === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
};

/**
 * Traverse tree in reverse order ( right, root, left )
 * This only works on binary trees
 * @param {Object} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Array|Boolean}
 */
function reverseorderTraversal(root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var result;
  var found;
  if (root.children.length === 2) {
    result = reverseorderTraversal(root.children[1], callback, shouldTrack);
    // if the result is defined and not false, return it.
    if (result) {
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
    found = callback(root);
    if (found === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    } else {
      result = reverseorderTraversal(root.children[0], callback, shouldTrack);
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
  } else if (root.children.length === 1) {
    found = callback(root);
    if (found === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    } else {
      result = reverseorderTraversal(root.children[0], callback, shouldTrack);
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
  } else if (root.children.length === 0) {
    found = callback(root);
    if (found === true) {
      if (shouldTrack) {
        return [root];
      } else {
        return root;
      }
    } else {
      return null;
    }
  }
  return null;
};

/**
 * Traverse tree in post order ( children left to right, root )
 * @param {Object} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Array|Boolean}
 */
function postorderTraversal(root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var i = 0,
    len = root.children.length,
    result;
  for (i; i < len; i++) {
    result = postorderTraversal(root.children[i], callback, shouldTrack);
    if (result) {
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
  }
  var found = callback(root);
  if (found === true) {
    if (shouldTrack) {
      return [root];
    } else {
      return root;
    }
  } else {
    return null;
  }
};

/**
 * Traverse tree in reverse post order ( children right to left, root )
 * @param {Object} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Array|Boolean}
 */
function reversePostorderTraversal(root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var result;
  for (var i = root.children.length - 1; i >= 0; i--) {
    result = reversePostorderTraversal(root.children[i], callback, shouldTrack);
    if (result) {
      if (_.isArray(result)) {
        result.unshift(root);
      }
      return result;
    }
  }
  var found = callback(root);
  if (found === true) {
    if (shouldTrack) {
      return [root];
    } else {
      return root;
    }
  } else {
    return null;
  }
};

/**
 * Traverse tree in level order ( each tier, top to bottom, from left to right )
 * @param {*} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Boolean}
 */
function levelorderTraversal(root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var node,
    i,
    len,
    found,
    queue = [root]; // start the queue with the root node

  var fn = function (node2) {
    return node2 === node;
  };
  // while there are queued nodes
  while (queue.length > 0) {
    // execute callback with node at front
    node = queue.shift();
    found = callback(node);
    if (found === true) {
      // if tracking path to node, we need to find it
      if (shouldTrack) {
        return preorderTraversal(root, fn, true);
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
  return null;
};

/**
 * Traverse tree in reverse level order ( each tier, top to bottom, right to left )
 * @param {*} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Boolean}
 */
function reverseLevelorderTraversal(root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var node;
  var i;
  var found;
  var queue = [root]; // start the queue with the root node

  var fn = function (node2) {
    return node2 === node;
  };

  // while there are queued nodes
  while (queue.length > 0) {
    // execute callback with node at front
    node = queue.shift();
    found = callback(node);
    if (found === true) {
      // if tracking path to node, we need to find it
      if (shouldTrack) {
        return preorderTraversal(root, fn, true);
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
  return null;
};

/**
 * Traverse tree in inverse level order ( each tier, bottom to top, right to left )
 * @param {*} root
 * @param {*} callback
 * @param {*} shouldTrack
 * @returns {Boolean}
 */
function inverseLevelorderTraversal(root, callback, shouldTrack) {
  shouldTrack = !!shouldTrack;
  var stack = [],
    queue = [root],
    node,
    i,
    len,
    found;
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
    found = callback(node);
    if (found === true) {
      // if tracking path to node, we need to find it
      if (shouldTrack) {
        return preorderTraversal(root, fn, true);
      } else {
        // otherwise just return the node found
        return node;
      }
    }
  }
  return null;
};

module.exports = {
  preorderTraversal,
  reversePreorderTraversal,
  inorderTraversal,
  reverseorderTraversal,
  postorderTraversal,
  reversePostorderTraversal,
  levelorderTraversal,
  reverseLevelorderTraversal,
  inverseLevelorderTraversal,
};
