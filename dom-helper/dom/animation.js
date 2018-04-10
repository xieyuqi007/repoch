/**
 * rocket animation function
 * @name animation#animate
 * @function
 * @param {Element} elem - animation element
 * @param {Object} opts
 * @param {Object} opts.property - animation properties
 * @param {String} opts.origin - transition origin
 * @param {Object} opts.duration - transition duration
 * @param {String} opts.ease - transition ease
 * @param {String} opts.delay - animation delay
 * @param {Function} opts.onComplete - animation complete callback
 * @param {*} opts.xx - css attributes need to the element
 * @return {Element} animation element
 * @author MrGalaxyn
 */
function emptyFunction() {}
export default process.env.BROWSER ? (function() {
    var prefix = '', eventPrefix;
    var vendors = { Webkit: 'webkit', Moz: '', O: 'o' };
    var testEl = document.createElement('div');
    var supportedAnimation = true;
    var supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i;
    var cssReset = {};
    var transform, supportedHWCompositing, transitionEnd, animationEnd,
        transitionProperty, transitionOrigin, transitionDuration, 
        transitionTiming, transitionDelay,
        animationName, animationDuration, animationTiming, animationDelay;
    for (var vendor in vendors) {
        if (testEl.style[vendor + 'TransitionProperty'] === undefined) {
            continue;
        }
        prefix = '-' + vendor.toLowerCase() + '-';
        eventPrefix = vendors[vendor];
        break;
    }
    if (eventPrefix === undefined && 
            testEl.style.transitionProperty === undefined) {
        supportedAnimation = false;
    }
    var perspective = eventPrefix ? eventPrefix + 'Perspective' : 'perspective';
    supportedHWCompositing = perspective in testEl.style;
    testEl = null;
    transform = prefix + 'transform';
    transitionEnd = eventPrefix ? eventPrefix + 'TransitionEnd' : 'TransitionEnd'.toLowerCase();
    animationEnd = eventPrefix ? eventPrefix + 'AnimationEnd' : 'AnimationEnd'.toLowerCase();
    cssReset[transitionOrigin = prefix + 'transition-origin'] =
    cssReset[transitionProperty = prefix + 'transition-property'] =
    cssReset[transitionDuration = prefix + 'transition-duration'] =
    cssReset[transitionDelay = prefix + 'transition-delay'] =
    cssReset[transitionTiming = prefix + 'transition-timing-function'] = '';
    cssReset[animationName = prefix + 'animation-name'] =
    cssReset[animationDuration = prefix + 'animation-duration'] =
    cssReset[animationDelay = prefix + 'animation-delay'] =
    cssReset[animationTiming = prefix + 'animation-timing-function'] = '';

    function animate(elem, opts) {
        let cssValues = {};
        let ignoreRE = /HWCompositing|property|origin|duration|ease|onComplete|delay/;
        let transforms = '';
        let fired = false;
        let endEvent, cssProperties, wrappedCallback;

        opts = Object.assign({
            property: "",
            origin: '',
            duration: 400,
            ease: 'linear',
            onComplete: () => {},
            delay: 0,
            HWCompositing: false
        }, opts);

        function camelize(str) {
            return str.replace(/-+(.)?/g, function(match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
        }

        function dasherize(str) {
            return str.replace(/::/g, '/')
                   .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                   .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                   .replace(/_/g, '-')
                   .toLowerCase();
        }

        function setStyle(node, name, value) {
            function maybeAddPx(name, value) {
                return (typeof value == "number" && !cssNumber[dasherize(name)]) ?
                        value + "px" : value
            }

            if (typeof name == "string") {
                if (!value && value !== 0) 
                    node.style.setProperty(dasherize(name), value)
                else
                    node.style[camelize(name)] = maybeAddPx(name, value);
            } else if (typeof name == "object") {
                for (var n in name) {
                    if (name.hasOwnProperty(n)) {
                        if (!name[n] && name[n] !== 0)
                            node.style.setProperty(dasherize(n), name[n])
                        else
                            node.style[camelize(n)] = maybeAddPx(n, name[n]);
                    }
                }
            }
        }

        if (!supportedAnimation) opts.duration = 0;
        if (opts.property && typeof opts.property === 'string') {
            // keyframe animation
            cssValues[animationName] = opts.property;
            cssValues[animationDuration] = parseFloat(opts.duration) / 1000 + 's';
            cssValues[animationDelay] = parseFloat(opts.delay) / 1000 + 's';
            cssValues[animationTiming] = opts.ease;
            endEvent = animationEnd;
        } else {
            cssProperties = [];
            endEvent = transitionEnd;
            // CSS transitions
            for (var key in opts) {
                if (ignoreRE.test(key)) continue;
                if (supportedTransforms.test(key)) {
                    transforms += key + '(' + opts[key] + ') ';
                } else {
                    cssValues[key] = opts[key];
                    cssProperties.push(dasherize(key));
                }
            }
            // hardware compositing, may have bug with some mobile like SUMSANG NOTE3
            if (opts.HWCompositing && !/translate(Z|3d)|matrix3d/.test(transforms) && supportedHWCompositing) {
                transforms += 'translateZ(0px)';
            }
            if (transforms) {
                cssValues[transform] = transforms;
                cssProperties.push(transform);
            }

            if (opts.origin && typeof opts.origin === 'string') {
                cssValues[transitionOrigin] = opts.origin;
            }
            if (opts.duration > 0) {
                cssValues[transitionProperty] = cssProperties.join(', ');
                cssValues[transitionDuration] = parseFloat(opts.duration) / 1000 + 's';
                cssValues[transitionDelay] = parseFloat(opts.delay) / 1000 + 's';
                cssValues[transitionTiming] = opts.ease;
            }
        }
        wrappedCallback = function(event) {
            if (typeof event !== 'undefined') {
                // makes sure the event didn't bubble from "below"
                if (event.target !== event.currentTarget) return;
                elem.removeEventListener(endEvent, wrappedCallback);
            } else if (opts.duration > 0) {
                // triggered by setTimeout
                elem.removeEventListener(endEvent, wrappedCallback);
            }

            fired = true;
            setStyle(elem, cssReset);
            opts.onComplete && opts.onComplete.call(elem);
        };

        if (opts.duration > 0) {
            elem.addEventListener(endEvent, wrappedCallback)
            // transitionEnd is not always firing on older Android phones
            // so make sure it gets fired
            setTimeout(function() {
                if (fired) return;
                wrappedCallback.call(elem);
            }, opts.duration + opts.delay + 25);
        }

        setStyle(elem, cssValues);
        if (opts.duration <= 0) {
            setTimeout(function() {
                wrappedCallback.call(elem);
            }, 0);
        }
        
        return elem;
    };
    return {
        animate: animate,
        transformName: transform
    }
})() : { animate: emptyFunction, transformName: 'transform' };
