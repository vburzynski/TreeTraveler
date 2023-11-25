const walkableMixin = require('./walkableMixin');

class Search {
  /**
   * constructs a Searcher
   * @param {TreeNode} root A TreeNode that is a root of a tree or sub-tree
   * @param {Function} callback callback function to execute for each node
   * @param {Boolean} trackPath this.trackPath when true, returns the ancestry path from the root to the found node
   */
  constructor(root, callback, trackPath) {
    this.root = root;
    this.trackPath = trackPath;

    // wrap the callback with some custom logic for searching
    this.callback = (node) => {
      var found = callback(node);
      // when callback returns a truthy value, assume we're performing a search
      // when trackPath is false, we want to return just the node
      // when trackPath is true, we want to track the ancestry path from the root to the node
      if (found) return this.trackPath ? [node] : node;
    };
  }

  /**
   *
   * @param {TreeNode} node current node being processed
   * @param {*} result the result of any recursion or node callbacks
   * @returns
   */
  _onChildIteration(node, result) {
    /* FUTURE: Alternate Idea for tracking Ancestry Path
    rather than building the ancestry path after finding the match, we could keep a stack or structure
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
      default:
        throw new Error(`${order} is not implemented`);
    }
  }
}

Object.assign(Search.prototype, walkableMixin);

module.exports = Search;
