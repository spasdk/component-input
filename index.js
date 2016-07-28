/**
 * @license The MIT License (MIT)
 * @copyright Stanislav Kalashnik <darkpark.main@gmail.com>
 */

/* eslint no-path-concat: 0 */

'use strict';

var Component = require('spa-component');


/**
 * Base input field implementation.
 * Has two types: text and password.
 * Password - replace real text with '*', but real text presents in the own property 'value'.
 *
 * @constructor
 * @extends Component
 *
 * @param {Object} [config={}] init parameters (all inherited from the parent)
 * @param {string} [config.value='text'] input text value
 * @param {string} [config.placeholder='password'] placeholder text value
 * @param {string} [config.type=Input.TYPE_TEXT] input type
 * @param {string} [config.direction='ltr'] symbol direction ('rtl' - right to left, 'ltr' - left to right)
 *
 * @example
 * var Input = require('stb/ui/input'),
 *     input = new Input({
 *         placeholder: 'input password'
 *         events: {
 *             input: function ( event ) {
 *                 debug.log(event.value);
 *             }
 *         }
 *     });
 */
function Input ( config ) {
    var self = this;

    // sanitize
    config = config || {};

    if ( DEVELOP ) {
        if ( typeof config !== 'object' ) { throw new Error(__filename + ': wrong config type'); }
        // init parameters checks
        if ( config.className && typeof config.className !== 'string'   ) {
            throw new Error(__filename + ': wrong or empty config.className');
        }
        if ( config.$body && !config.$body instanceof HTMLInputElement ) {
            throw new Error(__filename + ': config.$body must be an HTMLInputElement isntance');
        }
    }

    if ( !config.$node ) {
        config.$node = document.createElement('input');
    }

    /**
     * Text value of input.
     *
     * @type {string}
     */
    this.value = '';

    /**
     * Input type, now available only text and password.
     * Different logic with different types.
     * TYPE_TEXT - normal input.
     * TYPE_PASSWORD - hidden input, all chars replaced with '*', but real value is located in 'this.value'.
     *
     * @type {number}
     */
    this.type = this.TYPE_TEXT;

    // set default className if classList property empty or undefined
    config.className = 'input ' + (config.className || '');

    // parent constructor call
    Component.call(this, config);

    // navigation by keyboard
    this.$body.addEventListener('input', function () {
        self.value = self.$body.value;
        // there are some listeners
        if ( self.events['input'] !== undefined ) {
            // notify listeners
            self.emit('input', {value: self.$body.value});
        }
    });

    this.addListener('focus', function () {
        // force native focus
        self.$body.focus();
    });

    this.addListener('blur', function () {
        // force native blur
        self.$body.blur();
    });

    // component setup
    this.init(config);
}


// inheritance
Input.prototype = Object.create(Component.prototype);
Input.prototype.constructor = Input;

// input types
// todo: use number constants
Input.prototype.TYPE_TEXT     = 'text';
Input.prototype.TYPE_PASSWORD = 'password';
Input.prototype.TYPE_NUMBER   = 'number';
Input.prototype.TYPE_PHONE    = 'tel';
Input.prototype.TYPE_SEARCH   = 'search';


/**
 * List of all default event callbacks.
 *
 * @type {Object.<string, function>}
 */
//Input.prototype.defaultEvents = {
/**
 * Default method to handle keyboard keypress events.
 *
 * @param {Event} event generated event
 */
//keypress: function ( event ) {
//	this.addChar(String.fromCharCode(event.keyCode));
//}
//};


/**
 * Init or re-init of the component inner structures and HTML.
 *
 * @param {Object} config init parameters (subset of constructor config params)
 */
Input.prototype.init = function ( config ) {
    if ( DEVELOP ) {
        if ( config.type && config.type !== this.TYPE_TEXT && config.type !== this.TYPE_PASSWORD &&
            config.type !== this.TYPE_NUMBER && config.type !== this.TYPE_PHONE && config.type !== this.TYPE_SEARCH ) {
            throw new Error(__filename + ': config.type must be one of the TYPE_* constant');
        }
        if ( config.placeholder && typeof config.placeholder !== 'string' ) {
            throw new Error(__filename + ': config.placeholder must be a string');
        }
        if ( config.direction && typeof config.direction !== 'string' ) {
            throw new Error(__filename + ': config.direction must be a string');
        }
        if ( config.direction && config.direction !== 'ltr' && config.direction !== 'rtl' ) {
            throw new Error(__filename + ': config.direction wrong value');
        }
    }

    // type passed
    if ( config.type ) {
        // apply
        this.$body.type = config.type;
    }

    if ( config.direction ) {
        this.$body.direction = config.direction;
    }

    // default value passed
    if ( config.value ) {
        // apply
        this.$body.value = config.value;
    }

    // hint
    if ( config.placeholder ) {
        // apply
        this.$body.placeholder = config.placeholder;
    }
};


/**
 * Add given char to given position.
 * Also moving caret in every action.
 * Do nothing if position is < 0, or if index more or equals to length add char to the end.
 *
 * @param {string} char symbol to add
 * @param {number} [index=this.value.length] given position
 *
 * @fires module:stb/ui/input~Input#input
 */
Input.prototype.addChar = function ( char, index ) {
    index = (index === undefined) ? this.value.length : index;

    if ( DEVELOP ) {
        if ( index < 0 ) { throw new Error('index must be more than 0 or equal to 0'); }
        if ( typeof char !== 'string' ) { throw new Error('char must be a string'); }
        if ( char.length !== 1 ) { throw new Error('char must be a string with length = 1'); }
    }

    // insert char into value
    this.value = this.value.substring(0, index) + char + this.value.substring(index, this.value.length);

    this.$body.value = this.value;

    // there are some listeners
    if ( this.events['input'] !== undefined ) {
        // notify listeners
        this.emit('input', {value: this.value});
    }
};


/**
 * Remove char from given position.
 * Do nothing if index is out of the range (0, length).
 *
 * @param {number} [index=this.$caret.index - 1] index given position
 *
 * @fires module:stb/ui/input~Input#input
 */
Input.prototype.removeChar = function ( index ) {
    index = (index === undefined) ? this.value.length - 1 : index;

    // non-empty string
    if ( this.value.length > 0 ) {
        if ( DEVELOP ) {
            if ( index < 0 ) { throw new Error('index must be a positive value'); }
            if ( index > this.value.length ) { throw new Error('index must be a less than or equal to total length'); }
        }

        // cut one char from the value
        this.value = this.value.substring(0, index) + this.value.substring(index + 1, this.value.length);

        this.$body.value = this.value;

        //there are some listeners
        if ( this.events['input'] !== undefined ) {
            // notify listeners
            this.emit('input', {value: this.value});
        }
    }
    this.$body.value = this.value;
};


/**
 * Move caret to the given position.
 * Do nothing if index is out of the range (0, this.value.length).
 *
 * @param {number} index given position
 */
Input.prototype.setCaretPosition = function ( index ) {
    this.$body.setSelectionRange(index, index);
};


/**
 * Setting new text value of the input field.
 *
 * @param {string} value given string value
 */
Input.prototype.setValue = function ( value ) {

    if ( this.$body.value !== value ) {
        this.value = value;
        this.$body.value = value;

        // there are some listeners
        if ( this.events['input'] !== undefined ) {
            // notify listeners
            this.emit('input', {value: this.$body.value});
        }
    }
};


// public
module.exports = Input;
