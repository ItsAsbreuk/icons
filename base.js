"use strict";
/**
 * Creating floating Panel-nodes which can be shown and hidden.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module icons
 * @class Icons
 * @since 0.0.1
*/

require('polyfill/polyfill-base.js');
require('js-ext/lib/string.js');
require('./css/base.css');

var NAME = '[icons]: ',
    createHashMap = require('js-ext/extra/hashmap.js').createMap;

module.exports = function (window) {

    var DOCUMENT = window.document,
        Icons, Event, iconContainer, upgradeDOM, upgradeIconElement;

    window._ITSAmodules || Object.protectedProp(window, '_ITSAmodules', createHashMap());

/*jshint boss:true */
    if (Icons=window._ITSAmodules.Icons) {
/*jshint boss:false */
        return Icons; // Dialog was already created
    }

    require('vdom')(window);
    Event = require('event-dom')(window);

    // Start with inserting the `svg-container` which holds all definitions
    // will be inserted as a system-node:
    iconContainer = DOCUMENT.body.getElement('>#itsa-icons-container', true) || DOCUMENT.body.addSystemElement('<svg id="itsa-icons-container"></svg>');

    /**
     * Upgrades the specified i-element into a svg-icon.
     *
     * @method upgradeIconElement
     * @param element {HTMLElement}
     * @protected
     * @since 0.0.1
     */
    upgradeIconElement = function(element) {
        // `element` is supposed to have the form: icon-`iconname`
        var iconName = element.getAttr('icon');
        element.empty(true, true);
        element.addSystemElement('<svg><use xlink:href="#itsa-'+iconName+'-icon"></use></svg>'); // silent by default
    };

    /**
     * Upgrades all i-elements that have an `icon`-attribute set.
     * Will render them into svg-icons.
     *
     * @method upgradeDOM
     * @protected
     * @since 0.0.1
     */
    upgradeDOM = function() {
        var upgrade = function(vnode) {
            var vChildren = vnode.vChildren,
                len = vChildren.length,
                i, vChild;
            for (i=0; i<len; i++) {
                vChild = vChildren[i];
                if ((vChild.tag==='I') && vChild.attrs && vChild.attrs.icon) {
                    upgradeIconElement(vChild.domNode);
                }
                else {
                    upgrade(vChild);
                }
            }
        };
        upgrade(DOCUMENT.body.vnode);
    };

    Event.after(
        ['UI:nodeinsert', 'UI:attributechange', 'UI:attributeinsert'],
        function(e) {
            upgradeIconElement(e.target);
        },
        function(e) {
            var vnode = e.target.vnode;
            return (vnode.tag==='I') && vnode.attrs && vnode.attrs.icon;
        }
    );

    Event.after(
        'UI:attributeremove',
        function(e) {
            var node = e.target;
            node.empty(true, true);
        },
        function(e) {
            return (e.target.vnode.tag==='I') && e.changed.contains('icon');
        }
    );

    /**
     * Defines a new svg-icon. With this icon-definition, icons can be used by usinf i-elements
     * with the attribute: icon="iconname".
     *
     * @method defineIcon
     * @for document
     * @param iconName {String} unique iconname, which will be used with the attribute: icon="iconname"
     * @param viewBoxWidth {Number} pixels of the svg's viewBoxWidth
     * @param viewBoxHeight {Number} pixels of the svg's viewBoxHeight
     * @param svgContent {String} svg;s innercontent
     * @chainable
     * @since 0.0.1
     */
    DOCUMENT.defineIcon = function(iconName, viewBoxWidth, viewBoxHeight, svgContent) {
        var viewBoxDimension = '0 0 ',
            iconId, currentDefinition;
        viewBoxDimension = '0 0 '+viewBoxWidth+' '+viewBoxHeight;
        iconId = 'itsa-'+iconName.toLowerCase()+'-icon';
        currentDefinition = iconContainer.getElement('#'+iconId);
        if (currentDefinition) {
            currentDefinition.setHTML(svgContent);
        }
        else {
            iconContainer.append('<symbol id="'+iconId+'" viewBox="'+viewBoxDimension+'">'+svgContent+'</symbol>');
        }
        return this;
    };

    upgradeDOM();

    window._ITSAmodules.Icons = true;
};