
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\pages\InserirPage.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\pages\\InserirPage.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let h2;
    	let t1;
    	let form;
    	let label;
    	let t2;
    	let input;
    	let t3;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h2 = element("h2");
    			h2.textContent = "Inserir Nova Chave";
    			t1 = space();
    			form = element("form");
    			label = element("label");
    			t2 = text("Nome:\r\n            ");
    			input = element("input");
    			t3 = space();
    			button = element("button");
    			button.textContent = "Inserir";
    			attr_dev(h2, "class", "svelte-9nwpw3");
    			add_location(h2, file$2, 75, 4, 2436);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-9nwpw3");
    			add_location(input, file$2, 80, 12, 2567);
    			attr_dev(label, "class", "svelte-9nwpw3");
    			add_location(label, file$2, 78, 8, 2527);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-9nwpw3");
    			add_location(button, file$2, 82, 8, 2640);
    			add_location(form, file$2, 77, 4, 2471);
    			attr_dev(main, "class", "svelte-9nwpw3");
    			add_location(main, file$2, 74, 0, 2424);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(main, t1);
    			append_dev(main, form);
    			append_dev(form, label);
    			append_dev(label, t2);
    			append_dev(label, input);
    			set_input_value(input, /*chave*/ ctx[0].nome);
    			append_dev(form, t3);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(form, "submit", prevent_default(/*inserirChave*/ ctx[1]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*chave*/ 1 && input.value !== /*chave*/ ctx[0].nome) {
    				set_input_value(input, /*chave*/ ctx[0].nome);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('InserirPage', slots, []);

    	let chave = {
    		nome: "",
    		situacao: "disponivel",
    		status: true
    	};

    	//Lista para mostrar as chaves
    	let Listachaves = [];

    	let NomeNovo;

    	async function inserirChave() {
    		// Verifica se a chave com o mesmo nome já existe na lista
    		if (Listachaves.some(existingChave => existingChave.nome === chave.nome)) {
    			alert("Uma chave com esse nome já existe.");
    			return; // Impede a inserção da chave duplicada
    		}

    		if (chave.nome.trim() === "") {
    			alert("Por favor, digite um nome para a chave.");
    			return; // Impede a inserção da chave vazia
    		}

    		try {
    			const response = await fetch("http://localhost:8081/chaves", {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify(chave)
    			});

    			if (response.ok) {
    				alert("Chave adicionada com sucesso!");
    				const key = await response.json();
    				console.log(key);

    				// Atualizando a lista
    				carregarChaves();
    			} else {
    				console.error("Erro ao adicionar a chave:", response.statusText);
    			}
    		} catch(error) {
    			console.error("Erro ao adicionar a chave:", error);
    		}
    	}

    	async function carregarChaves() {
    		try {
    			const response = await fetch("http://localhost:8081/chaves/situacao/disponivel"); // Adicione "http://" ao URL

    			if (response.ok) {
    				const chaves = await response.json();
    				Listachaves = chaves;
    				console.log(chaves); // Mude para "chaves" em vez de "Listachaves"
    			} else {
    				console.error("Erro ao carregar as chaves:", response.statusText);
    			}
    		} catch(error) {
    			console.error("Erro ao carregar as chaves:", error);
    		}
    	}

    	carregarChaves();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<InserirPage> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		chave.nome = this.value;
    		$$invalidate(0, chave);
    	}

    	$$self.$capture_state = () => ({
    		chave,
    		Listachaves,
    		NomeNovo,
    		inserirChave,
    		carregarChaves
    	});

    	$$self.$inject_state = $$props => {
    		if ('chave' in $$props) $$invalidate(0, chave = $$props.chave);
    		if ('Listachaves' in $$props) Listachaves = $$props.Listachaves;
    		if ('NomeNovo' in $$props) NomeNovo = $$props.NomeNovo;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [chave, inserirChave, input_input_handler];
    }

    class InserirPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InserirPage",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\ListarPage.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$1 = "src\\pages\\ListarPage.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (36:12) {:else}
    function create_else_block(ctx) {
    	let li;
    	let t0;
    	let t1_value = /*chave*/ ctx[1].nome + "";
    	let t1;
    	let t2;
    	let t3_value = /*chave*/ ctx[1].situacao + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text("🗝️");
    			t1 = text(t1_value);
    			t2 = text(" - Situação: ");
    			t3 = text(t3_value);
    			t4 = text(" ⛔");
    			attr_dev(li, "class", "svelte-9nwpw3");
    			add_location(li, file$1, 36, 16, 1156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    			append_dev(li, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Listachaves*/ 1 && t1_value !== (t1_value = /*chave*/ ctx[1].nome + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*Listachaves*/ 1 && t3_value !== (t3_value = /*chave*/ ctx[1].situacao + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(36:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:12) {#if chave.situacao == "disponivel"}
    function create_if_block$1(ctx) {
    	let li;
    	let t0;
    	let t1_value = /*chave*/ ctx[1].nome + "";
    	let t1;
    	let t2;
    	let t3_value = /*chave*/ ctx[1].situacao + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text("🗝️");
    			t1 = text(t1_value);
    			t2 = text(" - Situação: ");
    			t3 = text(t3_value);
    			t4 = text(" ✅");
    			attr_dev(li, "class", "svelte-9nwpw3");
    			add_location(li, file$1, 34, 16, 1062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    			append_dev(li, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Listachaves*/ 1 && t1_value !== (t1_value = /*chave*/ ctx[1].nome + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*Listachaves*/ 1 && t3_value !== (t3_value = /*chave*/ ctx[1].situacao + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(34:12) {#if chave.situacao == \\\"disponivel\\\"}",
    		ctx
    	});

    	return block;
    }

    // (33:8) {#each Listachaves as chave}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*chave*/ ctx[1].situacao == "disponivel") return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(33:8) {#each Listachaves as chave}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let h2;
    	let t1;
    	let ul;
    	let each_value = /*Listachaves*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h2 = element("h2");
    			h2.textContent = "Lista de Chaves Disponíveis:";
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-9nwpw3");
    			add_location(h2, file$1, 30, 4, 909);
    			add_location(ul, file$1, 31, 4, 952);
    			attr_dev(main, "class", "svelte-9nwpw3");
    			add_location(main, file$1, 29, 0, 897);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(main, t1);
    			append_dev(main, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Listachaves*/ 1) {
    				each_value = /*Listachaves*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListarPage', slots, []);

    	let chave = {
    		nome: "",
    		situacao: "disponivel",
    		status: true
    	};

    	//Lista para mostrar as chaves
    	let Listachaves = [];

    	async function carregarChaves() {
    		try {
    			const response = await fetch("http://localhost:8081/chaves/situacao/disponivel"); // Adicione "http://" ao URL

    			if (response.ok) {
    				const chaves = await response.json();
    				$$invalidate(0, Listachaves = chaves);
    				console.log(chaves); // Mude para "chaves" em vez de "Listachaves"
    			} else {
    				console.error("Erro ao carregar as chaves:", response.statusText);
    			}
    		} catch(error) {
    			console.error("Erro ao carregar as chaves:", error);
    		}
    	}

    	carregarChaves();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ListarPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ chave, Listachaves, carregarChaves });

    	$$self.$inject_state = $$props => {
    		if ('chave' in $$props) $$invalidate(1, chave = $$props.chave);
    		if ('Listachaves' in $$props) $$invalidate(0, Listachaves = $$props.Listachaves);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [Listachaves, chave];
    }

    class ListarPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListarPage",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    // (21:38) 
    function create_if_block_1(ctx) {
    	let listarpage;
    	let current;
    	listarpage = new ListarPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(listarpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listarpage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listarpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listarpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listarpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(21:38) ",
    		ctx
    	});

    	return block;
    }

    // (19:6) {#if page === 'InserirPage'}
    function create_if_block(ctx) {
    	let inserirpage;
    	let current;
    	inserirpage = new InserirPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(inserirpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(inserirpage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inserirpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inserirpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(inserirpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(19:6) {#if page === 'InserirPage'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let body;
    	let h1;
    	let t1;
    	let nav;
    	let a0;
    	let t3;
    	let a1;
    	let t5;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[0] === 'InserirPage') return 0;
    		if (/*page*/ ctx[0] === 'ListarPage') return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			h1 = element("h1");
    			h1.textContent = "IFTM - Empréstimo de Chaves";
    			t1 = space();
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Inserir Chave";
    			t3 = space();
    			a1 = element("a");
    			a1.textContent = "Lista de Chaves";
    			t5 = space();
    			if (if_block) if_block.c();
    			attr_dev(h1, "class", "svelte-1q3o4vv");
    			add_location(h1, file, 12, 4, 300);
    			attr_dev(a0, "class", "svelte-1q3o4vv");
    			add_location(a0, file, 14, 8, 357);
    			attr_dev(a1, "class", "svelte-1q3o4vv");
    			add_location(a1, file, 15, 8, 428);
    			attr_dev(nav, "class", "svelte-1q3o4vv");
    			add_location(nav, file, 13, 4, 342);
    			attr_dev(body, "class", "svelte-1q3o4vv");
    			add_location(body, file, 11, 2, 288);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, h1);
    			append_dev(body, t1);
    			append_dev(body, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t3);
    			append_dev(nav, a1);
    			append_dev(body, t5);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(body, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[2], false, false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[3], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(body, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let page = 'InserirPage';

    	function navigate(to) {
    		$$invalidate(0, page = to);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => navigate('InserirPage');
    	const click_handler_1 = () => navigate('ListarPage');
    	$$self.$capture_state = () => ({ InserirPage, ListarPage, page, navigate });

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, navigate, click_handler, click_handler_1];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
