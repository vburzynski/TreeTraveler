
/**
 * Constructs a tree node object.
 * @constructor
 */
var treeNode = function( obj ) {
    if (!(this instanceof treeNode)){
        return new treeNode(obj);
    }
    if ( obj ) {
        this.object = obj;
    }
    this.children = new Array();
    this.forceBinary = false;
};

// Define all the instance methods and properties:
treeNode.prototype = {

    /**
     * Object stored in this node
     */
    object: null,

    /**
     * list of child nodes
     */
    children: null,

    /**
     * set the object that this tree node holds
     * @param {Objedct} obj
     */
    set: function( obj ) {
        this.object = obj;
        return this;
    },

    /**
     * get the object that this tree node holds
     */
    get: function() {
        return this.object;
    },

    /**
     * clear the object from the tree node
     */
    clear: function() {
        this.object = null;
        return this;
    },

    /**
     * destroy this node and its sub-tree
     */
    destroy: function() {
        this.clear();
        this.children = null;
        for ( var key in this ) {
            this[key] = null;
        }
    },

    /**
     * Add a new child tree node to this tree node
     * @param {Object} childNode
     */
    addChild: function( childNode ) {
        if ( childNode instanceof treeNode ) {
            this.children.push(childNode);
        }
        return this;
    },

    /**
     * Add a new child node to this tree node
     * @param {Object} childNode
     * @param {Object} index
     */
    addChildAt: function( childNode, index ) {
        if ( childNode instanceof treeNode ) {
            this.children.splice( index, 0, childNode );
        }
        return this;
    },

    /**
     * remove a specific child node
     * @param {Object} childNode
     */
    removeChild: function( childNode ) {
        var index = this.getChildIndex( childNode );
        if ( index > -1 ) {
            this.removeChildAt( index );
        }
        return this;
    },

    /**
     * remove a child node at a specified index
     * @param {Object} index
     */
    removeChildAt: function( index ) {
        this.children.splice(index,1);
        return this;
    },

    /**
     * get the index of the specified childNode
     */
    getChildIndex: function( childNode ) {
        var i = 0, len = this.children.length;
        for ( i; i < len; i++ ) {
            if ( this.children[i] === childNode ) {
                return i;
            }
        }
        return -1;
    },

    /**
     * get the child node at the specified index
     */
    getChildAt: function( index ) {
        return this.children[index];
    },

    /**
     * Determines if the childNode is a direct descendant of the parent
     * @param {Object} childNode
     */
    hasChild: function( childNode ) {
        return ( this.getChildIndex(childNode) > -1 );
    }
};

module.exports = treeNode;
