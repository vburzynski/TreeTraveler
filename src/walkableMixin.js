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
}

module.exports = walkableMixin;
