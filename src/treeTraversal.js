// TODO: boundary traversal -- https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/
// TODO: diagonal traversal -- https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/
// TODO: all of these are searching for a single item. A set of filter ones might be useful.
// TODO: the logic around the node callbak, and the logic in the child loops might be extractable. (pass in callbacks to do the work, might make this more reusable)

/**
 * Traverse tree in preorder ( node, children left to right )
 * @param {TreeNode} node root of the tree or sub-tree
 * @param {Function} callback callback function to execute for each node
 * @param {Boolean} trackPath when true, returns the path from the node to the node that matches the search condition
 * @returns {Array|Boolean} Returns the result of the preorder
 */
function preorder(node, callback, trackPath) {
  // visit the node first
  var found = callback(node);
  // NOTE: when callback returns a truthy value, assume we're performing a search
  if (found) {
    return trackPath ? [node] : node;
  }

  // visit children from left to right
  for (var i = 0; i < node.children.length; i++) {
    var result = preorder(node.children[i], callback, trackPath);
    if (result) {
      if (Array.isArray(result)) {
        result.unshift(node);
      }
      return result;
    }
  }

  // if we get here, there's no match
  return null;
};

/**
 * Traverse tree in reverse preorder (node, children right to left)
 * @param {TreeNode} node root of the tree or sub-tree
 * @param {Function} callback callback function
 * @param {Boolean} trackPath
 * @returns {Array|Boolean}
 */
function reversePreorder(node, callback, trackPath) {
  var found = callback(node);
  if (found === true) {
    return trackPath ? [node] : node;
  }

  for (var i = node.children.length - 1; i >= 0; i--) {
    var result = reversePreorder(node.children[i], callback, trackPath);
    if (result) {
      if (Array.isArray(result)) {
        result.unshift(node);
      }
      return result;
    }
  }
  return null;
};

/**
 * Traverse tree inorder
 * this only works on binary trees
 * @param {TreeNode} node
 * @param {Function} callback
 * @param {Boolean} trackPath
 * @returns {Array|Boolean}
 */
function inorder(node, callback, trackPath) {
  var result;

  if (node.children.length > 2) {
    throw new Error('Inorder Traversal only works on binary trees');
  }

  // check left child
  if (node.children?.[0]) {
    result = inorder(node.children[0], callback, trackPath);
    // if the result is defined and not false, return it.
    if (result) {
      // result contains the node found while traversing the left child
      if (Array.isArray(result)) {
        result.unshift(node);
      }
      return result;
    }
  }

  // check node
  var found = callback(node);
  if (found === true) {
    return trackPath ? [node] : node;
  }

  // check right child
  if (node.children[1]) {
    result = inorder(node.children[1], callback, trackPath);
    if (result) {
      if (Array.isArray(result)) {
        result.unshift(node);
      }
      return result;
    }
  }

  // otherwise not found
  return null;
};

/**
 * Traverse tree in reverse order ( right, node, left )
 * This only works on binary trees
 * @param {TreeNode} node
 * @param {Function} callback
 * @param {Boolean} trackPath
 * @returns {Array|Boolean}
 */
function reverseorder(node, callback, trackPath) {
  var result;

  if (node.children.length > 2) {
    throw new Error('Reverse Inorder Traversal only works on binary trees');
  }

  // check the right child node
  if (node.children?.[1]) {
    result = reverseorder(node.children[1], callback, trackPath);
    // if the result is defined and not false, return it.
    if (result) {
      if (Array.isArray(result)) {
        result.unshift(node);
      }
      return result;
    }
  }

  // check the node
  var found = callback(node);
  if (found === true) {
    return trackPath ? [node] : node;
  }

  // check the left child node
  if (node.children?.[0]) {
    result = reverseorder(node.children[0], callback, trackPath);
    if (Array.isArray(result)) {
      result.unshift(node);
    }
    return result;
  }
};

/**
 * Traverse tree in post order ( children left to right, node )
 * @param {TreeNode} node
 * @param {Function} callback
 * @param {Boolean} trackPath
 * @returns {Array|Boolean}
 */
function postorder(node, callback, trackPath) {
  var result;

  // check the child nodes left to right
  for (var i = 0; i < node.children.length; i++) {
    result = postorder(node.children[i], callback, trackPath);
    if (result) {
      if (Array.isArray(result)) {
        result.unshift(node);
      }
      return result;
    }
  }

  // check the node
  var found = callback(node);
  if (found === true) {
    return trackPath ? [node] : node;
  }
  return null;
};

/**
 * Traverse tree in reverse post order ( children right to left, node )
 * @param {TreeNode} node
 * @param {Function} callback
 * @param {Boolean} trackPath
 * @returns {Array|Boolean}
 */
function reversePostorder(node, callback, trackPath) {
  var result;

  // walk the child nodes right to left
  for (var i = node.children.length - 1; i >= 0; i--) {
    result = reversePostorder(node.children[i], callback, trackPath);
    if (result) {
      if (Array.isArray(result)) {
        result.unshift(node);
      }
      return result;
    }
  }

  // check the node
  var found = callback(node);
  if (found === true) {
    return trackPath ? [node] : node;
  }

  return null;
};

/**
 * Traverse tree in level order ( each tier, top to bottom, from left to right )
 * @param {TreeNode} node
 * @param {Function} callback
 * @param {Boolean} trackPath
 * @returns {Boolean}
 */
function levelorder(node, callback, trackPath) {
  // start the queue with the node node
  var queue = [node];
  var currNode;
  var found;
  var fn = (n) => n === currNode;

  // while there are queued nodes
  while (queue.length > 0) {
    // take the first queued node
    currNode = queue.shift();

    // check if that node is a match
    found = callback(currNode);
    if (found === true) {
      // WARNING: this is inefficient...
      // if tracking path to node, we need to find it
      if (trackPath) {
        return preorder(node, fn, true);
      }
      // otherwise just return the node found
      return currNode;
    }

    // push all of the node's children onto the end of the queue
    for (var i = 0; i < currNode.children.length; i++) {
      queue.push(currNode.children[i]);
    }
  }

  // if we get here, nothing matched
  return null;
};

/**
 * Traverse tree in reverse level order ( each tier, top to bottom, right to left )
 * @param {TreeNode} node
 * @param {Function} callback
 * @param {Boolean} trackPath
 * @returns {Boolean}
 */
function reverseLevelorder(node, callback, trackPath) {
  var currNode;
  var i;
  var found;

  // start the queue with the node node
  var queue = [node];

  // while there are queued nodes
  while (queue.length > 0) {
    // execute callback with node at front
    currNode = queue.shift();
    found = callback(currNode);
    if (found === true) {
      // if tracking path to node, we need to find it
      if (trackPath) {
        let fn = (node2) => node2 === currNode;
        return preorder(node, fn, true);
      }
      // otherwise just return the node found
      return currNode;
    }

    // push all of the node's children onto the end of the queue
    for (i = currNode.children.length - 1; i >= 0; i--) {
      queue.push(currNode.children[i]);
    }
  }
  return null;
};

/**
 * Traverse tree in inverse level order ( each tier, bottom to top, right to left )
 * @param {TreeNode} node
 * @param {Function} callback
 * @param {Boolean} trackPath
 * @returns {Boolean}
 */
function inverseLevelorder(node, callback, trackPath) {
  let currNode;
  let found;

  // WARNING: this isn't very memory optimized, at some point you will have all nodes in a single stack
  // LIFO - for reversing the order of the nodes...
  let stack = [];

  // start the queue with the node node
  let queue = [node];

  // NOTE: this block is essentially the levelorder method, but we're using the stack to reverse everything
  // while there are items in the queue...
  while (queue.length > 0) {
    // take the first node on the queue
    currNode = queue.shift();
    // push it onto the stack
    stack.push(currNode);
    // push all the node's children onto the queue
    for (var i = 0; i < currNode.children.length; i++) {
      queue.push(currNode.children[i]);
    }
  }

  // callback function to be used if we're tracking the path to the found node
  var findCurrentNode = (candidateNode) => candidateNode === currNode;

  // now go through everything on the stack
  while (stack.length > 0) {
    currNode = stack.pop();
    found = callback(currNode);
    if (found === true) {
      // if tracking path to node, we need to find it
      if (trackPath) {
        return preorder(node, findCurrentNode, true);
      }

      // otherwise just return the node found
      return currNode;
    }
  }
  return null;
};

module.exports = {
  preorder,
  reversePreorder,
  inorder,
  reverseorder,
  postorder,
  reversePostorder,
  levelorder,
  reverseLevelorder,
  inverseLevelorder,
};
