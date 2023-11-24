let walkableMixin = {
  /**
   * Traverse tree in preorder ( node, children left to right )
   * @returns {Array|Boolean} Returns the result of the preorder
   */
  preorder(root) {
    // visit the node first
    var result = this.callback(root);
    // FUTURE: what if we want to accumulate values, and not exit early? (use control-result tuple here too?)
    if (result) return result;

    // visit children from left to right
    for (var i = 0; i < root.children.length; i++) {
      var value = this.preorder(root.children[i]);
      if (value) {
        let [shouldReturn, result] = this._onChildIteration(root, value);
        if (shouldReturn) return result;
      }
    }

    // if we get here, there's no match
    return null;
  },

  /**
   * Traverse tree in reverse preorder (node, children right to left)
   * @returns {Array|Boolean}
   */
  reversePreorder(root) {
    var result = this.callback(root);
    if (result) return result;

    for (var i = root.children.length - 1; i >= 0; i--) {
      var value = this.reversePreorder(root.children[i]);
      if (value) {
        let [shouldReturn, result] = this._onChildIteration(root, value);
        if (shouldReturn) return result;
      }
    }

    return null;
  },

  /**
   * Traverse tree inorder (this only works on binary trees)
   * @returns {Array|Boolean}
   */
  inorder(root) {
    var value;

    if (root.children.length > 2) {
      throw new Error('Inorder Traversal only works on binary trees');
    }

    // check left child
    if (root.children?.[0]) {
      value = this.inorder(root.children[0], this.callback, this.trackPath);
      if (value) {
        let [shouldReturn, result] = this._onChildIteration(root, value);
        if (shouldReturn) return result;
      }
    }

    // check node
    var result = this.callback(root);
    if (result) return result;

    // check right child
    if (root.children[1]) {
      value = this.inorder(root.children[1], this.callback, this.trackPath);
      if (value) {
        let [shouldReturn, result] = this._onChildIteration(root, value);
        if (shouldReturn) return result;
      }
    }

    // otherwise not found
    return null;
  },

  /**
   * Traverse tree in reverse order (right, node, left). This only works on binary trees.
   * @returns {Array|Boolean}
   */
  reverseorder(root) {
    var value;

    if (root.children.length > 2) {
      throw new Error('Reverse Inorder Traversal only works on binary trees');
    }

    // check the right child node
    if (root.children?.[1]) {
      value = this.reverseorder(root.children[1], this.callback, this.trackPath);
      if (value) {
        let [shouldReturn, result] = this._onChildIteration(root, value);
        if (shouldReturn) return result;
      }
    }

    // check the node
    var result = this.callback(root);
    if (result) return result;

    // check the left child node
    if (root.children?.[0]) {
      value = this.reverseorder(root.children[0], this.callback, this.trackPath);
      if (value) {
        let [shouldReturn, result] = this._onChildIteration(root, value);
        if (shouldReturn) return result;
      }
    }
  },

  /**
   * Traverse tree in post order ( children left to right, node )
   * @returns {Array|Boolean}
   */
  postorder(root) {
    var value;

    // check the child nodes left to right
    for (var i = 0; i < root.children.length; i++) {
      value = this.postorder(root.children[i], this.callback, this.trackPath);
      if (value) {
        let [shouldReturn, result] = this._onChildIteration(root, value);
        if (shouldReturn) return result;
      }
    }

    // check the node
    var result = this.callback(root);
    if (result) return result;

    return null;
  },

  /**
   * Traverse tree in reverse post order (children right to left, node)
   * @returns {Array|Boolean}
   */
  reversePostorder(root) {
    var value;

    // walk the child nodes right to left
    for (var i = root.children.length - 1; i >= 0; i--) {
      value = this.reversePostorder(root.children[i], this.callback, this.trackPath);
      if (value) {
        let [shouldReturn, result] = this._onChildIteration(root, value);
        if (shouldReturn) return result;
      }
    }

    // check the node
    var result = this.callback(root);
    if (result) return result;

    return null;
  },

  height(root) {
    if (root.children) {
      return 1 + root.children.reduce((maxHeight, node) => {
        const height = this.height(node);
        return (height > maxHeight) ? height : maxHeight;
      }, 0);
    }
    return 1;
  },

  levelorder(root) {
    const height = this.height(root);

    // each level from the top to the bottom (max height)
    for (var level = 1; level <= height; level++) {
      // FUTURE: to accumulate values, this needs to change, for now we assume any return value stops the traversal
      var value = this._levelorderHelper(root, level);
      if (value) return value;
    }
  },

  _levelorderHelper(root, level) {
    if (level === 1) {
      var result = this.callback(root);
      if (result) return result;
    } else {
      for (var index = 0; index < root.children.length; index++) {
        var value = this._levelorderHelper(root.children[index], level - 1)
        if (value) {
          let [shouldReturn, result] = this._onChildIteration(root, value);
          if (shouldReturn) return result;
        }
      }
    }
  },

  reverseLevelorder(root) {
    const height = this.height(root);
    // for the reverse, we're still going top to bottom, so this stays the same
    for (var level = 1; level <= height; level++) {
      // FUTURE: to accumulate values, this needs to change, for now we assume any return value stops the traversal
      var value = this._reverseLevelorderHelper(root, level);
      if (value) return value;
    }
  },

  _reverseLevelorderHelper(root, level) {
    if (level === 1) {
      var result = this.callback(root);
      if (result) return result;
    } else {
      for (var index = root.children.length - 1; index >= 0; index--) {
        var value = this._reverseLevelorderHelper(root.children[index], level - 1);
        if (value) {
          let [shouldReturn, result] = this._onChildIteration(root, value);
          if (shouldReturn) return result;
        }
      }
    }
  },

  inverseLevelorder(root) {
    const height = this.height(root);
    // for the reverse, we're still going top to bottom, so this stays the same
    for (var level = height; level >= 0; level--) {
      // FUTURE: to accumulate values, this needs to change, for now we assume any return value stops the traversal
      var value = this._reverseLevelorderHelper(root, level);
      if (value) return value;
    }
  }

  // FUTURE: we could implement an inverse (depth) + reverse (child direction) variant -- inverseReverseLevelOrder (not sure on name)

  // /**
  //  * Traverse tree in level order ( each tier, top to bottom, from left to right )
  //  * @returns {Boolean}
  //  */
  // levelorderOLD(root) {
  //   /*
  //   FUTURE: to dynamically track the ancestry path, could have a stack of stacks here.
  //   each nested stack is a different level of the tree.
  //   bit more complexity if we do it that way, but it could offset the need to run preorder to find the path
  //   */
  //   let currNode;
  //   let found;

  //   // start the queue with the node node
  //   const queue = [root];

  //   // while there are still queued nodes
  //   while (queue.length > 0) {
  //     // take the first queued node
  //     currNode = queue.shift();

  //     // check if that node is a match
  //     found = this.callback(currNode);
  //     if (found === true) {
  //       // WARNING: this is inefficient...
  //       // if tracking path to node, we need to find it
  //       if (this.trackPath) {
  //         // return true when  the node is the current node
  //         var identityFn = (n) => n === currNode;
  //         return preorder(root, identityFn, true);
  //       }
  //       // otherwise just return the node found
  //       return currNode;
  //     }

  //     // push all of the node's children onto the end of the queue
  //     for (var i = 0; i < currNode.children.length; i++) {
  //       queue.push(currNode.children[i]);
  //     }
  //   }

  //   // if we get here, nothing matched
  //   return null;
  // },

  // /**
  //  * Traverse tree in reverse level order ( each tier, top to bottom, right to left )
  //  * @param {TreeNode} root
  //  * @param {Function} this.callback
  //  * @param {Boolean} this.trackPath
  //  * @returns {Boolean}
  //  */
  // reverseLevelorderOLD(root) {
  //   var currNode;
  //   var i;
  //   var found;

  //   // start the queue with the node node
  //   var queue = [root];

  //   // while there are queued nodes
  //   while (queue.length > 0) {
  //     // execute callback with node at front
  //     currNode = queue.shift();
  //     found = this.callback(currNode);
  //     if (found === true) {
  //       // if tracking path to node, we need to find it
  //       if (this.trackPath) {
  //         let identityFn = (node2) => node2 === currNode;
  //         return preorder(root, identityFn, true);
  //       }
  //       // otherwise just return the node found
  //       return currNode;
  //     }

  //     // push all of the node's children onto the end of the queue
  //     for (i = currNode.children.length - 1; i >= 0; i--) {
  //       queue.push(currNode.children[i]);
  //     }
  //   }
  //   return null;
  // },

  // /**
  //  * Traverse tree in inverse level order ( each tier, bottom to top, right to left )
  //  * @param {TreeNode} root
  //  * @param {Function} this.callback
  //  * @param {Boolean} this.trackPath
  //  * @returns {Boolean}
  //  */
  // inverseLevelorder(root) {
  //   let currNode;
  //   let found;

  //   // WARNING: this isn't very memory optimized, at some point you will have all nodes in a single stack
  //   // LIFO - for reversing the order of the nodes...
  //   let stack = [];

  //   // start the queue with the node node
  //   let queue = [root];

  //   // NOTE: this block is essentially the levelorder method, but we're using the stack to reverse everything
  //   // while there are items in the queue...
  //   while (queue.length > 0) {
  //     // take the first node on the queue
  //     currNode = queue.shift();
  //     // push it onto the stack
  //     stack.push(currNode);
  //     // push all the node's children onto the queue
  //     for (var i = 0; i < currNode.children.length; i++) {
  //       queue.push(currNode.children[i]);
  //     }
  //   }

  //   // callback function to be used if we're tracking the path to the found node
  //   var findCurrentNode = (candidateNode) => candidateNode === currNode;

  //   // now go through everything on the stack
  //   while (stack.length > 0) {
  //     currNode = stack.pop();
  //     found = this.callback(currNode);
  //     if (found === true) {
  //       // if tracking path to node, we need to find it
  //       if (this.trackPath) {
  //         return preorder(root, findCurrentNode, true);
  //       }

  //       // otherwise just return the node found
  //       return currNode;
  //     }
  //   }
  //   return null;
  // },
}

class Search {
  /**
   *
   * @param {TreeNode} root A TreeNode that is a root of a tree or sub-tree
   * @param {Function} callback callback function to execute for each node
   * @param {Boolean} trackPath this.trackPath when true, returns the path from the node to the node that matches the search condition
   */
  constructor(root, callback, trackPath) {
    this.root = root;
    this.trackPath = trackPath;

    // wrap the callback with some custom logic for searching
    // when trackPath is false, we want to return just the node
    // when trackPath is true, we want to return the path from the root to the node
    this.callback = (node) => {
      var found = callback(node);
      // NOTE: when callback returns a truthy value, assume we're performing a search
      if (found) {
        return this.trackPath ? [node] : node;
      }
    };

    // TODO: we need another callback for the recursive walking...
  }

  /**
   *
   * @param {TreeNode} node current node being processed
   * @param {*} result the result of any recursion or node callbacks
   * @returns
   */
  _onChildIteration(node, result) {
    /*
    IDEA: rather than building the ancestry path after finding the match, we could keep a stack or structure
    of some kind to track this as we walk the node. just popping and pushing nodes as we traverse.
    This would probably be more useful for a filter operation rather than a single item search.
    */

    // when there is a result (in this case a search match)
    if (result) {
      // then we want to add the current node to the start of the array
      if (Array.isArray(result)) {
        result.unshift(node);
      }
      // we want the search operation to return the result.
      // the loop below is agnostic, and unless instructed to stop, will continue onward
      // so we use a tuple to return both the trigger to return early and provide our result
      return [true, result];
    }
    // when we get here, there is no result, loop should continue
    return [false, null];
  }

  search(order) {
    // proceed based off the specified order
    switch (order) {
      case 'preorder':
        return this.preorder(this.root);
      case 'reverse-preorder':
      case 'inverse-postorder':
        return this.reversePreorder(this.root);
      case 'inorder':
        return this.inorder(this.root);
      case 'reverseorder':
      case 'inverseorder':
      case 'reverse-inorder':
      case 'inverse-inorder':
        return this.reverseorder(this.root);
      case 'postorder':
        return this.postorder(this.root);
      case 'reverse-postorder':
      case 'inverse-preorder':
        return this.reversePostorder(this.root);
      case 'levelorder':
        return this.levelorder(this.root);
      case 'reverse-levelorder':
        return this.reverseLevelorder(this.root);
      case 'inverse-levelorder':
        return this.inverseLevelorder(this.root);
      // case 'inverse-reverse-levelorder':
      // case 'reverse-inverse-levelorder':
      default:
        throw new Error(`${order} is not implemented`);
    }
  }
}

Object.assign(Search.prototype, walkableMixin);

module.exports = {
  Search,
  walkableMixin,
};
