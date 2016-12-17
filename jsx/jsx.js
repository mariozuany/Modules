/**
	@author: https://medium.com/@deathmood
	@url: https://medium.com/@deathmood/write-your-virtual-dom-2-props-events-a957608f5c76#.z238xqzco
*/
define(function(){

	var f = function( arrowf ){

		return function( element ){
			var oldnode;
			return function( state ){
				if( !oldnode )
					element.innerHTML = '';
				var newnode = arrowf( state );
				updateElement( element, newnode, oldnode );
				oldnode = newnode;
			}
		};
	}

	f.h = function( type, props, children ){
		return { type:type, props: props || {}, children:children };
	};

	function setBooleanProp($target, name, value) {
		if (value) {
			$target.setAttribute(name, value);
			$target[name] = true;
		} else {
			$target[name] = false;
		}
	}

	function removeBooleanProp($target, name) {
		$target.removeAttribute(name);
		$target[name] = false;
	}

	function setProp($target, name, value) {
		if (name === 'className') {
			$target.setAttribute('class', value);
		} else if (typeof value === 'boolean') {
			setBooleanProp($target, name, value);
		} else {
			$target.setAttribute(name, value);
		}
	}

	function removeProp($target, name, value) {
		if (name === 'className') {
			$target.removeAttribute('class');
		} else if (typeof value === 'boolean') {
			removeBooleanProp($target, name);
		} else {
			$target.removeAttribute(name);
		}
	}

	function setProps($target, props) {
		Object.keys(props).forEach(function(name){
			setProp($target, name, props[name]);
		});
	}

	function updateProp($target, name, newVal, oldVal) {
		if (!newVal) {
			removeProp($target, name, oldVal);
		} else if (!oldVal || newVal !== oldVal) {
			setProp($target, name, newVal);
		}
	}

	function updateProps($target, newProps, oldProps) {
		oldProps = oldProps || {};
		var props = Object.assign({}, newProps, oldProps);
		Object.keys(props).forEach(function(name){
			updateProp($target, name, newProps[name], oldProps[name]);
		});
	}

	function createElement(node) {
		if (typeof node === 'string') {
			return document.createTextNode(node);
		}
		var $el = document.createElement(node.type);
		setProps($el, node.props);
		if( node.children.map )
			node.children.map(createElement).forEach($el.appendChild.bind($el));
		else
			$el.appendChild(createElement(node.children));
		return $el;
	}


	function changed(node1, node2) {
		return typeof node1 !== typeof node2 ||
		typeof node1 === 'string' && node1 !== node2 ||
		node1.type !== node2.type ||
		node1.props && node1.props.forceUpdate;
	}

	function updateElement($parent, newNode, oldNode, index) {
		index = index || 0;
		if (!oldNode) {
			$parent.appendChild(createElement(newNode));
		} else if (!newNode) {
			$parent.removeChild( $parent.childNodes[index]);
		} else if (changed(newNode, oldNode)) {
			$parent.replaceChild(createElement(newNode),$parent.childNodes[index]);
		} else if (newNode.type) {
			updateProps( $parent.childNodes[index], newNode.props, oldNode.props);
			var newLength = newNode.children.length;
			var oldLength = oldNode.children.length;
			for (var i = 0; i < newLength || i < oldLength; i++) {
				updateElement($parent.childNodes[index],newNode.children[i],oldNode.children[i],i);
			}
		}
	}

	return f;
});