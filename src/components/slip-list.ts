import {css, html, LitElement, nothing, svg, TemplateResult} from "lit";
import {styleMap} from "lit-html/directives/style-map.js";
import {property, customElement, state} from "lit/decorators.js";

const damnYouChrome = /Chrome\/[3-5]/.test(navigator.userAgent); // For bugs that can't be programmatically detected :( Intended to catch all versions of Chrome 30-40

/* When dragging elements down in Chrome (tested 34-37) dragged element may appear below stationary elements.
   Looks like WebKit bug #61824, but iOS Safari doesn't have that problem. */
const compositorDoesNotOrderLayers = damnYouChrome;

// -webkit-mess
let testElementStyle:  CSSStyleDeclaration | null = document.createElement('div').style;

const transitionJSPropertyName = "transition" in testElementStyle ? "transition" : "webkitTransition";
const transformJSPropertyName = "transform" in testElementStyle ? "transform" : "webkitTransform";
const transformCSSPropertyName = transformJSPropertyName === "webkitTransform" ? "-webkit-transform" : "transform";
const userSelectJSPropertyName = "userSelect" in testElementStyle ? "userSelect" : "webkitUserSelect";

testElementStyle[transformJSPropertyName] = 'translateZ(0)';
const hwLayerMagicStyle = testElementStyle[transformJSPropertyName] ? 'translateZ(0) ' : '';
const hwTopLayerMagicStyle = testElementStyle[transformJSPropertyName] ? 'translateZ(1px) ' : '';
testElementStyle = null;


function getTransform(node: HTMLElement): {value:string; original:string} {
    const transform = node.style[transformJSPropertyName];
    if (transform) {
        return {
            value: transform,
            original: transform,
        };
    }

    if (window.getComputedStyle) {
        const style = window.getComputedStyle(node).getPropertyValue(transformCSSPropertyName);
        if (style && style !== 'none') return {value:style, original:''};
    }
    return {value:'', original:''};
}


interface InteractionState {
    allowTextSelection: boolean;
    leaveState?:()=>void;
    onLeave?:(x: SlipList)=>void;
    onMove?:(x: SlipList)=>boolean;
    onEnd?:(x: SlipList)=>boolean;
}

interface Target {
    node: HTMLElement;
    originalTarget: HTMLElement;
    scrollContainer: HTMLElement;
    origScrollTop: number;
    origScrollHeight: number;
    baseTransform: { value: string; original: string };
    height: number;
}

interface Stage {
    percent: number;
    icon: TemplateResult<2>;
    text: string;
    color: string;
}

// From https://www.veryicon.com/icons/miscellaneous/eva-icon-fill
const checkmarkIcon = svg`<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M853.333333 504.746667a42.666667 42.666667 0 0 0-42.666666 42.666666v237.653334a25.6 25.6 0 0 1-25.6 25.6H238.933333a25.6 25.6 0 0 1-25.6-25.6V238.933333a25.6 25.6 0 0 1 25.6-25.6h408.32a42.666667 42.666667 0 1 0 0-85.333333H238.933333A111.36 111.36 0 0 0 128 238.933333v546.133334A111.36 111.36 0 0 0 238.933333 896h546.133334a111.36 111.36 0 0 0 110.933333-110.933333v-237.653334a42.666667 42.666667 0 0 0-42.666667-42.666666z"  /><path d="M457.386667 469.333333a42.666667 42.666667 0 0 0-61.44 58.88l94.72 99.413334a42.666667 42.666667 0 0 0 30.72 13.226666 42.666667 42.666667 0 0 0 30.72-12.8l289.28-298.666666a42.666667 42.666667 0 1 0-61.44-59.733334l-258.133334 267.093334z"  /></svg>`;

const postponeIcon = svg`<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M887.04 483.84l-142.506667-285.013333A128 128 0 0 0 629.76 128H394.24a128 128 0 0 0-114.773333 70.826667l-142.506667 285.013333a85.333333 85.333333 0 0 0-8.96 38.4V768a128 128 0 0 0 128 128h512a128 128 0 0 0 128-128v-245.76a85.333333 85.333333 0 0 0-8.96-38.4zM355.84 236.8a42.666667 42.666667 0 0 1 38.4-23.466667h235.52a42.666667 42.666667 0 0 1 38.4 23.466667L784.213333 469.333333H682.666667a42.666667 42.666667 0 0 0-42.666667 42.666667v85.333333a42.666667 42.666667 0 0 1-42.666667 42.666667h-170.666666a42.666667 42.666667 0 0 1-42.666667-42.666667v-85.333333a42.666667 42.666667 0 0 0-42.666667-42.666667H239.786667z"  /></svg>`;

const deleteIcon = svg`<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M896 256h-213.333333V184.746667A103.253333 103.253333 0 0 0 576 85.333333h-128A103.253333 103.253333 0 0 0 341.333333 184.746667V256H128a42.666667 42.666667 0 0 0 0 85.333333h42.666667v469.333334a128 128 0 0 0 128 128h426.666666a128 128 0 0 0 128-128V341.333333h42.666667a42.666667 42.666667 0 0 0 0-85.333333zM426.666667 682.666667a42.666667 42.666667 0 0 1-85.333334 0v-170.666667a42.666667 42.666667 0 0 1 85.333334 0z m0-497.92c0-6.826667 8.96-14.08 21.333333-14.08h128c12.373333 0 21.333333 7.253333 21.333333 14.08V256h-170.666666zM682.666667 682.666667a42.666667 42.666667 0 0 1-85.333334 0v-170.666667a42.666667 42.666667 0 0 1 85.333334 0z"  /></svg>`;


/**
    Slip - swiping and reordering in lists of elements on touch screens, no fuss.

    Fires these events on list elements:

        • slip:swipe
            When swipe has been done and user has lifted finger off the screen.
            If you execute event.preventDefault() the element will be animated back to original position.
            Otherwise it will be animated off the list and set to display:none.

        • slip:beforeswipe
            Fired before first swipe movement starts.
            If you execute event.preventDefault() then element will not move at all.

        • slip:cancelswipe
            Fired after the user has started to swipe, but lets go without actually swiping left or right.

        • slip:animateswipe
            Fired while swiping, before the user has let go of the element.
            event.detail.x contains the amount of movement in the x direction.
            If you execute event.preventDefault() then the element will not move to this position.
            This can be useful for saturating the amount of swipe, or preventing movement in one direction, but allowing it in the other.

        • slip:reorder
            Element has been dropped in new location. event.detail contains the following:
                • insertBefore: DOM node before which element has been dropped (null is the end of the list). Use with node.insertBefore().
                • spliceIndex: Index of element before which current element has been dropped, not counting the element iself.
                               For use with Array.splice() if the list is reflecting objects in some array.
                • originalIndex: The original index of the element before it was reordered.

        • slip:beforereorder
            When reordering movement starts.
            Element being reordered gets class `slip-reordering`.
            If you execute event.preventDefault() then the element will not move at all.

        • slip:beforewait
            If you execute event.preventDefault() then reordering will begin immediately, blocking ability to scroll the page.

        • slip:tap
            When element was tapped without being swiped/reordered. You can check `event.target` to limit that behavior to drag handles.


    Usage:

        CSS:
            You should set `user-select:none` (and WebKit prefixes, sigh) on list elements,
            otherwise unstoppable and glitchy text selection in iOS will get in the way.

            You should set `overflow-x: hidden` on the container or body to prevent horizontal scrollbar
            appearing when elements are swiped off the list.


        var list = document.querySelector('ul#slippylist');
        new Slip(list);

        list.addEventListener('slip:beforeswipe', function(e) {
            if (shouldNotSwipe(e.target)) e.preventDefault();
        });

        list.addEventListener('slip:swipe', function(e) {
            // e.target swiped
            if (thatWasSwipeToRemove) {
                e.target.parentNode.removeChild(e.target);
            } else {
                e.preventDefault(); // will animate back to original position
            }
        });

        list.addEventListener('slip:beforereorder', function(e) {
            if (shouldNotReorder(e.target)) e.preventDefault();
        });

        list.addEventListener('slip:reorder', function(e) {
            // e.target reordered.
            if (reorderedOK) {
                e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
            } else {
                e.preventDefault();
            }
        });

    Requires:
        • Touch events
        • CSS transforms
        • Function.bind()

    Caveats:
        • Elements must not change size while reordering or swiping takes place (otherwise it will be visually out of sync)
*/
@customElement("slip-list")
export class SlipList extends LitElement {
    private mouseHandlersAttached=false;

    private options = { keepSwipingPercent: 0, minimumSwipeVelocity: 0.1, minimumSwipeTime: 110, ignoredElements: [] };

        constructor() {
        super();


        // document.addEventListener("selectionchange", this.onSelection, false);

        // cancel is called e.g. when iOS detects multitasking gesture
        this.addEventListener('touchcancel', this.cancel, false);
        this.addEventListener('touchstart', this.onTouchStart, false);
        this.addEventListener('touchmove', this.onTouchMove, false);
        this.addEventListener('touchend', this.onTouchEnd, false);
        this.addEventListener('mousedown', this.onMouseDown, false);

    }

    createIdleState: () => InteractionState = () =>  {
        this.removeMouseHandlers();
        if (this.target) {
            this.target.node.style.willChange = '';
            this.target = undefined;
        }
        this.usingTouch = false;

        return {
            allowTextSelection: true,
        };
    };

    static override styles = css`
    :host {
      display: block;
        position: relative;
    }
    
    div {
       position: absolute;
        left:0;
        right: 0;
        background-color: green;
        padding: 8px 20px;
        display:flex;
        align-items:center;
        line-height: 3;
        vertical-align: middle;
    }
    
    `;


    @property({ type: Array })
    stages: Stage[] = [
        {
            percent: -25,
            text: 'Postpone',
            color: 'blue',
            icon: postponeIcon
        },
        {
            percent: -50,
            text: 'Delete',
            color: 'red',
            icon: deleteIcon
        },
        {
            percent: 25,
            text: 'Done',
            color: 'green',
            icon: checkmarkIcon
        }
    ];
    arrayMax(arr: number[]): number {
        return arr.reduce((p, v) => (p > v ? p : v), 0);
    }

    findStage(percent: number): Stage |  undefined {
        const s = this.stages
            .filter(x => Math.sign(x.percent) === Math.sign(percent))
            .filter(x => Math.abs(x.percent) <= Math.abs(percent));

        const maxValue = this.arrayMax(s.map(x => Math.abs(x.percent)));

        return s.find(x => {
            return Math.round(Math.abs(x.percent)) === Math.round(maxValue);
        });
    }

    private get currentStage(): Stage |  undefined {
      return this.findStage(this.swipePercent);
    }

    @state()
    private swipeX = 0;

    private get swipePercent() {
        return Math.floor((100 * this.swipeX) / this.clientWidth);
    }

    protected render(): unknown {


        const s = this.currentStage;
        const divStyleMap = {
            display: this.stateConstructor === this.createSwipeState ? 'block' : 'none',
            textAlign: this.swipePercent > 0 ? 'left' : 'right',
            backgroundColor: s !== undefined ? s.color : 'transparent',
        };

        const icon = s !== undefined && this.swipePercent < 0 ? s.icon : nothing;
        const lefticon = s !== undefined && this.swipePercent > 0  ? s.icon : nothing;

        return html`
            
            <div style="${styleMap(divStyleMap)}">${lefticon} ${s !== undefined ? s.text : ''} ${icon}</div>
            
            
            <slot></slot>`;
    }


    private cancel = () => {
        this.setState(this.createIdleState)
    };



    usingTouch = false;
    canPreventScrolling = false;

    private state: InteractionState = this.createIdleState();

    @state()
    private stateConstructor: () => InteractionState = this.createIdleState;

    setState(newStateConstructor: () => InteractionState) {


            if (this.stateConstructor === newStateConstructor) return;
            if (this.state.leaveState) this.state.leaveState();

        // Must be re-entrant in case ctor changes state
        const prevState = this.state;
        const nextState = newStateConstructor();
        if (this.state === prevState) {
            this.stateConstructor = newStateConstructor;
            this.state = nextState;
        }
    }

    addMouseHandlers() {
        // unlike touch events, mousemove/up is not conveniently fired on the same element,
        // but I don't need to listen to unrelated events all the time
        if (!this.mouseHandlersAttached) {
            this.mouseHandlersAttached = true;
            document.documentElement.addEventListener('mouseleave', this.onMouseLeave, false);
            window.addEventListener('mousemove', this.onMouseMove, true);
            window.addEventListener('mouseup', this.onMouseUp, true);
            window.addEventListener('blur', this.cancel, false);
        }
    }



    private onMouseLeave = (e: MouseEvent) => {
        e.stopPropagation();
        if (this.usingTouch) return;

        if (e.target === document.documentElement || e.relatedTarget === document.documentElement) {
            if (this.state.onLeave) {
                this.state.onLeave(this);
            }
        }
    }

    startPosition?: {x:number; y: number; time: number}; // x,y,time where first touch began
    latestPosition?: {x:number; y: number; time: number}; // x,y,time where the finger is currently
    previousPosition?: {x:number; y: number; time: number}; // x,y,time where the finger was ~100ms ago (for velocity calculation)


    private onMouseDown = (e:MouseEvent) => {
        e.stopPropagation();
        if (this.usingTouch || e.button != 0 || !this.setTarget(e)) return;

        this.addMouseHandlers(); // mouseup, etc.

        this.canPreventScrolling = true; // or rather it doesn't apply to mouse

        this.startAtPosition({
            x: e.clientX,
            y: e.clientY,
            time: e.timeStamp,
        });
    }

    get _slottedChildren() {
        const slot = this.renderRoot.querySelector('slot');
        if (slot === null) {
            throw new Error('Illegal State');
        }

        return slot.assignedElements({flatten: true});
    }

    findIndex(target: { node: any; }, nodes: Element[]) {
        let originalIndex = 0;
        let listCount = 0;

        for (const element of nodes) {
            if (element.nodeType === 1) {
                listCount++;
                if (element === target.node) {
                    originalIndex = listCount-1;
                }
            }
        }

        return originalIndex;
    }


    createReorderState: () => InteractionState = () => {

        if (this.target === undefined) {
            throw new Error('Illegal State');
        }

        /*
        if (this.target.node.focus && this.options.accessibility.items.focus) {
            this.target.node.focus();
        }

         */

        this.target.height = this.target.node.offsetHeight;

        const nodes = this._slottedChildren;
        /*
        if (this.options.ignoredElements.length) {
            var container = this.container;
            var query = container.tagName.toLowerCase();
            if (container.getAttribute('id')) {
                query = '#' + container.getAttribute('id');
            } else if (container.classList.length) {
                query += '.' + container.getAttribute('class').replace(' ', '.');
            }
            query += ' > ';
            this.options.ignoredElements.forEach(function (selector) {
                query += ':not(' + selector + ')';
            });
            try {
                nodes = container.parentNode.querySelectorAll(query);
            } catch(err) {
                if (err instanceof DOMException && err.name === 'SyntaxError')
                    throw new Error('ignoredElements you specified contain invalid query');
                else
                    throw err;
            }
        } else {
            nodes = this.container.childNodes;
        }

         */
        const originalIndex = this.findIndex(this.target, nodes);
        let mouseOutsideTimer: NodeJS.Timeout | null = null;
        const zero = this.target.node.offsetTop + this.target.height / 2;
        const otherNodes: {node: HTMLElement; baseTransform: { value: string; original: string; }; pos: number }[] = [];
        for(var i=0; i < nodes.length; i++) {
            if (nodes[i].nodeType != 1 || nodes[i] === this.target.node) continue;
            const n = nodes[i] as HTMLElement;
            const t = n.offsetTop;
            n.style[transitionJSPropertyName] = transformCSSPropertyName + ' 0.2s ease-in-out';
            otherNodes.push({
                node: n,
                baseTransform: getTransform(n),
                pos: t + (t < zero ? n.offsetHeight : 0) - zero,
            });
        }

        this.target.node.classList.add('slip-reordering');
        this.target.node.style.zIndex = '99999';
        this.target.node.style[userSelectJSPropertyName] = 'none';
        if (compositorDoesNotOrderLayers) {
            // Chrome's compositor doesn't sort 2D layers
            this.style.webkitTransformStyle = 'preserve-3d';
        }

        const onMove = () => {
            if (this.target === undefined) {
                throw new Error('Illegal State');
            }

            /*jshint validthis:true */

            this.updateScrolling();

            if (mouseOutsideTimer) {
                // don't care where the mouse is as long as it moves
                clearTimeout(mouseOutsideTimer); mouseOutsideTimer = null;
            }

            const move = this.getTotalMovement();
            this.target.node.style[transformJSPropertyName] = 'translate(0,' + move.y + 'px) ' + hwTopLayerMagicStyle + this.target.baseTransform.value;

            var height = this.target.height;
            otherNodes.forEach(function(o){
                var off = 0;
                if (o.pos < 0 && move.y < 0 && o.pos > move.y) {
                    off = height;
                }
                else if (o.pos > 0 && move.y > 0 && o.pos < move.y) {
                    off = -height;
                }
                // FIXME: should change accelerated/non-accelerated state lazily
                o.node.style[transformJSPropertyName] = off ? 'translate(0,'+off+'px) ' + hwLayerMagicStyle + o.baseTransform.value : o.baseTransform.original;
            });
            return false;
        };

        onMove();

        return {
            allowTextSelection: false,
            leaveState: () => {
                if (mouseOutsideTimer) clearTimeout(mouseOutsideTimer);

                if (compositorDoesNotOrderLayers) {
                    this.style.webkitTransformStyle = '';
                }

                if (this.target === undefined) {
                    throw new Error('Illegal State');
                }

                /*
                if (this.focus && this.options.accessibility.container.focus) {
                    this.focus();
                }
                */
                this.target.node.classList.remove('slip-reordering');
                this.target.node.style[userSelectJSPropertyName] = '';

                const target = this.target;

                this.animateToZero(() => {
                    target.node.style.zIndex = '';
                }, this.target);
                otherNodes.forEach(function(o){
                    o.node.style[transformJSPropertyName] = o.baseTransform.original;
                    o.node.style[transitionJSPropertyName] = ''; // FIXME: animate to new position
                });
            },

            onMove: onMove,

            onLeave:  () => {
                // don't let element get stuck if mouse left the window
                // but don't cancel immediately as it'd be annoying near window edges
                if (mouseOutsideTimer) clearTimeout(mouseOutsideTimer);
                mouseOutsideTimer = setTimeout(() => {
                    mouseOutsideTimer = null;
                    this.cancel();
                }, 700);
            },

            onEnd:  () => {
                if (this.target === undefined) {
                    throw new Error('Illegal State');
                }

                var move = this.getTotalMovement();
                var i, spliceIndex;
                if (move.y < 0) {
                    for (i=0; i < otherNodes.length; i++) {
                        if (otherNodes[i].pos > move.y) {
                            break;
                        }
                    }
                    spliceIndex = i;
                } else {
                    for (i=otherNodes.length-1; i >= 0; i--) {
                        if (otherNodes[i].pos < move.y) {
                            break;
                        }
                    }
                    spliceIndex = i+1;
                }

                this.dispatch(this.target.node, 'reorder', {
                    spliceIndex: spliceIndex,
                    originalIndex: originalIndex,
                    insertBefore: otherNodes[spliceIndex] ? otherNodes[spliceIndex].node : null,
                });

                this.setState(this.createIdleState);
                return false;
            },
        };

    }

    updateScrolling() {
        if (this.target === undefined) {
            throw new Error('Illegal State');
        }
        let triggerOffset = 40,
            offset = 0;

        const scrollable = this.target.scrollContainer,
            containerRect = scrollable.getBoundingClientRect(),
            targetRect = this.target.node.getBoundingClientRect(),
            bottomOffset = Math.min(containerRect.bottom, window.innerHeight) - targetRect.bottom,
            topOffset = targetRect.top - Math.max(containerRect.top, 0),
            maxScrollTop = this.target.origScrollHeight - Math.min(scrollable.clientHeight, window.innerHeight);

        if (bottomOffset < triggerOffset) {
            offset = Math.min(triggerOffset, triggerOffset - bottomOffset);
        }
        else if (topOffset < triggerOffset) {
            offset = Math.max(-triggerOffset, topOffset - triggerOffset);
        }

        scrollable.scrollTop = Math.max(0, Math.min(maxScrollTop, scrollable.scrollTop + offset));
    }


    createSwipeState: () => InteractionState = () => {

        if (this.target === undefined) {
            throw new Error('Illegal State');
        }
        let swipeSuccess = false;

        const originalIndex = this.findIndex(this.target, this._slottedChildren);

        this.classList.add('slip-swiping-container');
        const removeClass = () => {
            this.classList.remove('slip-swiping-container');
        };

        this.target.height = this.target.node.offsetHeight;
        const target = this.target;

        return {
            allowTextSelection: false,
            leaveState: () =>  {
                if (swipeSuccess) {
                    this.animateSwipe(() => {
                        target.node.style[transformJSPropertyName] = target.baseTransform.original;
                        target.node.style[transitionJSPropertyName] = '';
                        if (this.dispatch(target.node, 'afterswipe', {})) {
                            removeClass();
                        } else {
                            this.animateToZero(undefined, target);
                        }
                    });
                } else {
                    this.animateToZero(removeClass, target);
                }
                this.swipeX = 0;
            },

            onMove: () => {
                if (this.target === undefined) {
                    throw new Error('Illegal State');
                }
                const move = this.getTotalMovement();

                if (Math.abs(move.y) < this.target.height+20) {
                     this.swipeX = move.x;
                    if (this.dispatch(this.target.node, 'animateswipe', {x: move.x, originalIndex: originalIndex})) {
                        this.target.node.style[transformJSPropertyName] = 'translate(' + move.x + 'px,0) ' + hwLayerMagicStyle + this.target.baseTransform.value;
                    }
                    return false;
                } else {
                    this.dispatch(this.target.node, 'cancelswipe', {});
                    this.setState(this.createIdleState);
                }
                return true;
            },

            onLeave:  () =>  {
                let state = this.state;
                if (state !== undefined && state.onEnd !== undefined)
                {
                    state.onEnd(this);
                }
            },

            onEnd:  () => {
                if (this.target === undefined) {
                    throw new Error('Illegal State');
                }
                if (this.startPosition === undefined) {
                    throw new Error('Illegal State');
                }
                if (this.previousPosition === undefined) {
                    throw new Error('Illegal State');
                }

                const move = this.getAbsoluteMovement();
                const velocity = move.x / move.time;

                // How far out has the item been swiped?
                const swipedPercent = Math.abs((this.startPosition.x - this.previousPosition.x) / this.clientWidth) * 100;

                const swiped = (velocity > this.options.minimumSwipeVelocity && move.time > this.options.minimumSwipeTime) || (this.options.keepSwipingPercent && swipedPercent > this.options.keepSwipingPercent);
                console.log('swiped', swiped, velocity, move.time, this.options.keepSwipingPercent, swipedPercent)

                if (swiped) {
                    const stage = this.currentStage;
                    if (stage !== undefined) {
                        if (this.dispatch(this.target.node, 'swipe', {direction: move.directionX, originalIndex: originalIndex, action: stage.text})) {
                            swipeSuccess = true; // can't animate here, leaveState overrides anim
                        }
                    }
                } else {
                    this.dispatch(this.target.node, 'cancelswipe', {});
                }
                this.setState(this.createIdleState);
                return !swiped;
            },
        };
    }


    createUndecidedState: () => InteractionState = () => {

        if (this.target === undefined) {
            throw new Error('Illegal State');
        }
        this.target.height = this.target.node.offsetHeight;
        this.target.node.style.willChange = transformCSSPropertyName;
        this.target.node.style[transitionJSPropertyName] = '';

        if (!this.dispatch(this.target.originalTarget, 'beforewait', {})) {
            if (this.dispatch(this.target.originalTarget, 'beforereorder', {})) {
                this.setState(this.createReorderState);
            }
        } else {
            var holdTimer = setTimeout(() => {
                if (this.target === undefined) {
                    throw new Error('Illegal State');
                }

                var move = this.getAbsoluteMovement();
                if (this.canPreventScrolling && move.x < 15 && move.y < 25) {
                    if (this.dispatch(this.target.originalTarget, 'beforereorder', {})) {
                        this.setState(this.createReorderState);
                    }
                }
            }, 300);
        }

        return {
            allowTextSelection: false,
            leaveState: () => {
                clearTimeout(holdTimer);
            },

            onMove: () => {
                if (this.target === undefined) {
                    throw new Error('Illegal State');
                }
                const move = this.getAbsoluteMovement();

                if (move.x > 20 && move.y < Math.max(100, this.target.height)) {
                    if (this.dispatch(this.target.originalTarget, 'beforeswipe', {directionX: move.directionX, directionY: move.directionY})) {
                        this.setState(this.createSwipeState);
                        return false;
                    } else {
                        this.setState(this.createIdleState);
                    }
                }
                if (move.y > 20) {
                    this.setState(this.createIdleState);
                }

                // Chrome likes sideways scrolling :(
                if (move.x > move.y*1.2) return false;

                return true;
            },

            onLeave: () => {
                this.setState(this.createIdleState);
            },

            onEnd: () => {
                if (this.target === undefined) {
                    throw new Error('Illegal State');
                }
                const allowDefault = this.dispatch(this.target.originalTarget, 'tap', {});
                this.setState(this.createIdleState);
                return allowDefault;
            },
        };
    }

    startAtPosition(pos: {x:number; y: number; time: number}) {
        this.startPosition = pos;
        this.previousPosition = pos;
        this.latestPosition = pos;
        this.setState(this.createUndecidedState);
    }


    private onTouchStart = (e: TouchEvent) => {
        e.stopPropagation();
        this.usingTouch = true;
        this.canPreventScrolling = true;

        // This implementation cares only about single touch
        if (e.touches.length > 1) {
            this.setState(this.createIdleState);
            return;
        }

        if (!this.setTarget(e)) return;

        this.startAtPosition({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            time: e.timeStamp,
        });
    }

    target?: Target;


    removeMouseHandlers() {
        if (this.mouseHandlersAttached) {
            this.mouseHandlersAttached = false;
            document.documentElement.removeEventListener('mouseleave', this.onMouseLeave, false);
            window.removeEventListener('mousemove', this.onMouseMove, true);
            window.removeEventListener('mouseup', this.onMouseUp, true);
            window.removeEventListener('blur', this.cancel, false);
        }
    }
    findTargetNode(targetNode: Node | null) {
        while(targetNode && targetNode.parentNode !== this) {
            targetNode = targetNode.parentNode;
        }
        return targetNode;
    }

    setTarget(e: TouchEvent|MouseEvent) {
        const targetNode = this.findTargetNode(e.target as Node);
        if (!targetNode) {
            this.setState(this.createIdleState);
            return false;
        }

        const d = this.renderRoot.querySelector('div');
        if (d !== null) {
            const t = targetNode as HTMLElement;
            d.style.top = t.offsetTop + 'px';
            d.style.height = t.offsetHeight + 'px';
        }
        // scrollContainer may be explicitly set via options, otherwise search upwards for a parent with an overflow-y property
        // fallback to document.scrollingElement (or documentElement on IE), and do not use document.body
       // var scrollContainer = this.options.scrollContainer;
       // if (!scrollContainer) {
        const top: HTMLElement = document.scrollingElement as HTMLElement || document.documentElement as HTMLElement;
        let scrollContainer: HTMLElement|null = targetNode.parentNode as HTMLElement;
            while (scrollContainer) {
                if (scrollContainer == top) break;
                if (scrollContainer != document.body && scrollContainer.scrollHeight > scrollContainer.clientHeight && window.getComputedStyle(scrollContainer).overflowY != 'visible') break;
                scrollContainer = scrollContainer.parentNode as HTMLElement;
            }
            scrollContainer = scrollContainer || top;
        // }

        this.target = {
            originalTarget: e.target as HTMLElement,
            node: targetNode as HTMLElement,
            scrollContainer: scrollContainer,
            origScrollTop: scrollContainer.scrollTop,
            origScrollHeight: scrollContainer.scrollHeight,
            baseTransform: getTransform(targetNode as HTMLElement),
            height: 0,
        };
        return true;
    }

    private onMouseMove = (e: MouseEvent) => {
        e.stopPropagation();
        this.updatePosition(e, {
            x: e.clientX,
            y: e.clientY,
            time: e.timeStamp,
        });
    }
    updatePosition(e: Event, pos : {x:number; y: number; time: number}) {
        if (this.target === undefined) {
            return;
        }
        if (this.previousPosition === undefined) {
            return;
        }
        this.latestPosition = pos;

        if (this.state.onMove) {
            if (this.state.onMove(this) === false) {
                e.preventDefault();
            }
        }

        // sample latestPosition 100ms for velocity
        if (this.latestPosition.time - this.previousPosition.time > 100) {
            this.previousPosition = this.latestPosition;
        }
    }

    private onTouchMove = (e: TouchEvent) => {
        e.stopPropagation();
        this.updatePosition(e, {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            time: e.timeStamp,
        });

        // In Apple's touch model only the first move event after touchstart can prevent scrolling (and event.cancelable is broken)
        this.canPreventScrolling = false;
    }

    private onMouseUp = (e: MouseEvent) => {
        e.stopPropagation();
        if (this.usingTouch || e.button !== 0) return;

        if (this.state.onEnd && false === this.state.onEnd(this)) {
            e.preventDefault();
        }
    }

    private onTouchEnd = (e: TouchEvent) => {
        e.stopPropagation();
        if (e.touches.length > 1) {
            this.cancel();
        } else if (this.state.onEnd && false === this.state.onEnd(this)) {
            e.preventDefault();
        }
    }

    getTotalMovement() {
        if (this.latestPosition && this.startPosition && this.target){
            const scrollOffset = this.target.scrollContainer.scrollTop - this.target.origScrollTop;
            return {
                x: this.latestPosition.x - this.startPosition.x,
                y: this.latestPosition.y - this.startPosition.y + scrollOffset,
                time: this.latestPosition.time - this.startPosition.time,
            };

        }
        else {
            return { x:0, y:0, time: 0 }
        }
     }

    getAbsoluteMovement() {
        const move = this.getTotalMovement();
        return {
            x: Math.abs(move.x),
            y: Math.abs(move.y),
            time: move.time,
            directionX: move.x < 0 ? 'left' : 'right',
            directionY: move.y < 0 ? 'up' : 'down',
        };
    }

    dispatch(targetNode: HTMLElement, eventName: string, detail: any) {
        let event = new CustomEvent('slip-' + eventName, { bubbles: true, cancelable: true, detail});
        return targetNode.dispatchEvent(event);
    }

    animateToZero(callback: undefined | (() => void), target: Target) {

        target.node.style[transitionJSPropertyName] = transformCSSPropertyName + ' 0.1s ease-out';
        target.node.style[transformJSPropertyName] = 'translate(0,0) ' + hwLayerMagicStyle + target.baseTransform.value;
        setTimeout(() => {
            target.node.style[transitionJSPropertyName] = '';
            target.node.style[transformJSPropertyName] = target.baseTransform.original;
            if (callback) callback();
        }, 101);
    }

    getSiblings(target: Target): { node: HTMLElement; baseTransform: { value: string; original: string }}[] {
        const siblings: { node: HTMLElement; baseTransform: { value: string; original: string } }[] = [];
        let tmp = target.node.nextSibling;
        while(tmp) {
            if (tmp.nodeType == 1) siblings.push({
                node: tmp as HTMLElement,
                baseTransform: getTransform(tmp as HTMLElement),
            });
            tmp = tmp.nextSibling;
        }
        return siblings;
    }

    animateSwipe(callback: () => void | undefined) {
        if (this.target === undefined) {
            return;
        }
        const target = this.target;
        const siblings = this.getSiblings(target);
        const emptySpaceTransformStyle = 'translate(0,' + this.target.height + 'px) ' + hwLayerMagicStyle + ' ';

        // FIXME: animate with real velocity
        target.node.style[transitionJSPropertyName] = 'all 0.1s linear';
        target.node.style[transformJSPropertyName] = ' translate(' + (this.getTotalMovement().x > 0 ? '' : '-') + '100%,0) ' + hwLayerMagicStyle + target.baseTransform.value;

        setTimeout(() => {
            if (callback()) {
                siblings.forEach((o) => {
                    o.node.style[transitionJSPropertyName] = '';
                    o.node.style[transformJSPropertyName] = emptySpaceTransformStyle + o.baseTransform.value;
                });
                setTimeout(() => {
                    siblings.forEach((o) => {
                        o.node.style[transitionJSPropertyName] = transformCSSPropertyName + ' 0.1s ease-in-out';
                        o.node.style[transformJSPropertyName] = 'translate(0,0) ' + hwLayerMagicStyle + o.baseTransform.value;
                    });
                    setTimeout(() => {
                        siblings.forEach((o) => {
                            o.node.style[transitionJSPropertyName] = '';
                            o.node.style[transformJSPropertyName] = o.baseTransform.original;
                        });
                    }, 101);
                }, 1);
            }
        }, 101);
    }

}
