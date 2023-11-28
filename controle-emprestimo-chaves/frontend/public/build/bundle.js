
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
    const file$3 = "src\\pages\\InserirPage.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (120:8) {#each Listachaves as chaveItem}
    function create_each_block$1(ctx) {
    	let li;
    	let t0;
    	let t1_value = /*chaveItem*/ ctx[9].nome + "";
    	let t1;
    	let t2;
    	let button;
    	let t4;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*chaveItem*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text("🗝️ ");
    			t1 = text(t1_value);
    			t2 = space();
    			button = element("button");
    			button.textContent = "Editar";
    			t4 = space();
    			attr_dev(button, "class", "svelte-9nwpw3");
    			add_location(button, file$3, 122, 16, 4012);
    			attr_dev(li, "class", "svelte-9nwpw3");
    			add_location(li, file$3, 120, 12, 3954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, button);
    			append_dev(li, t4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*Listachaves*/ 2 && t1_value !== (t1_value = /*chaveItem*/ ctx[9].nome + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(120:8) {#each Listachaves as chaveItem}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let h20;
    	let t0_value = (/*modoEdicao*/ ctx[2] ? 'Editar' : 'Inserir') + "";
    	let t0;
    	let t1;
    	let t2;
    	let form;
    	let label;
    	let t3;
    	let input;
    	let t4;
    	let button;
    	let t5_value = (/*modoEdicao*/ ctx[2] ? 'Atualizar' : 'Inserir') + "";
    	let t5;
    	let t6;
    	let h21;
    	let t8;
    	let ul;
    	let mounted;
    	let dispose;
    	let each_value = /*Listachaves*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h20 = element("h2");
    			t0 = text(t0_value);
    			t1 = text(" Chave");
    			t2 = space();
    			form = element("form");
    			label = element("label");
    			t3 = text("Nome:\n            ");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			t5 = text(t5_value);
    			t6 = space();
    			h21 = element("h2");
    			h21.textContent = "Lista de Chaves";
    			t8 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h20, "class", "svelte-9nwpw3");
    			add_location(h20, file$3, 106, 4, 3480);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-9nwpw3");
    			add_location(input, file$3, 111, 12, 3659);
    			attr_dev(label, "class", "svelte-9nwpw3");
    			add_location(label, file$3, 109, 8, 3621);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-9nwpw3");
    			add_location(button, file$3, 113, 8, 3730);
    			add_location(form, file$3, 108, 4, 3536);
    			attr_dev(h21, "class", "svelte-9nwpw3");
    			add_location(h21, file$3, 117, 4, 3867);
    			add_location(ul, file$3, 118, 4, 3896);
    			attr_dev(main, "class", "svelte-9nwpw3");
    			add_location(main, file$3, 105, 0, 3469);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h20);
    			append_dev(h20, t0);
    			append_dev(h20, t1);
    			append_dev(main, t2);
    			append_dev(main, form);
    			append_dev(form, label);
    			append_dev(label, t3);
    			append_dev(label, input);
    			set_input_value(input, /*chave*/ ctx[0].nome);
    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(button, t5);
    			append_dev(main, t6);
    			append_dev(main, h21);
    			append_dev(main, t8);
    			append_dev(main, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*modoEdicao*/ ctx[2]
    							? /*atualizarChave*/ ctx[5]
    							: /*inserirChave*/ ctx[3])) (/*modoEdicao*/ ctx[2]
    							? /*atualizarChave*/ ctx[5]
    							: /*inserirChave*/ ctx[3]).apply(this, arguments);
    						}),
    						false,
    						true,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*modoEdicao*/ 4 && t0_value !== (t0_value = (/*modoEdicao*/ ctx[2] ? 'Editar' : 'Inserir') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*chave*/ 1 && input.value !== /*chave*/ ctx[0].nome) {
    				set_input_value(input, /*chave*/ ctx[0].nome);
    			}

    			if (dirty & /*modoEdicao*/ 4 && t5_value !== (t5_value = (/*modoEdicao*/ ctx[2] ? 'Atualizar' : 'Inserir') + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*selecionarChaveParaEdicao, Listachaves*/ 18) {
    				each_value = /*Listachaves*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('InserirPage', slots, []);

    	let chave = {
    		nome: "",
    		situacao: "disponivel",
    		status: true
    	};

    	//Lista para mostrar as chaves
    	let Listachaves = [];

    	let modoEdicao = false;

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

    	// Função para selecionar a chave para edição
    	function selecionarChaveParaEdicao(chaveSelecionada) {
    		$$invalidate(0, chave = { ...chaveSelecionada });
    		$$invalidate(2, modoEdicao = true);
    	}

    	async function atualizarChave() {
    		if (chave.nome.trim() === "") {
    			alert("Por favor, digite um nome para a chave.");
    			return; // Impede a atualização com nome vazio
    		}

    		try {
    			const response = await fetch(`http://localhost:8081/chaves/${chave.id}`, {
    				method: 'PUT',
    				headers: { 'Content-Type': 'application/json' },
    				body: JSON.stringify(chave)
    			});

    			if (response.ok) {
    				alert("Chave atualizada com sucesso!");

    				$$invalidate(0, chave = {
    					nome: "",
    					situacao: "disponivel",
    					status: true
    				});

    				$$invalidate(2, modoEdicao = false);
    				carregarChaves();
    			} else {
    				console.error("Erro ao atualizar a chave:", response.statusText);
    			}
    		} catch(error) {
    			console.error("Erro ao atualizar a chave:", error);
    		}
    	}

    	async function carregarChaves() {
    		try {
    			const response = await fetch("http://localhost:8081/chaves/situacao/disponivel"); // Adicione "http://" ao URL

    			if (response.ok) {
    				const chaves = await response.json();
    				$$invalidate(1, Listachaves = chaves);
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

    	const click_handler = chaveItem => selecionarChaveParaEdicao(chaveItem);

    	$$self.$capture_state = () => ({
    		chave,
    		Listachaves,
    		modoEdicao,
    		inserirChave,
    		selecionarChaveParaEdicao,
    		atualizarChave,
    		carregarChaves
    	});

    	$$self.$inject_state = $$props => {
    		if ('chave' in $$props) $$invalidate(0, chave = $$props.chave);
    		if ('Listachaves' in $$props) $$invalidate(1, Listachaves = $$props.Listachaves);
    		if ('modoEdicao' in $$props) $$invalidate(2, modoEdicao = $$props.modoEdicao);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		chave,
    		Listachaves,
    		modoEdicao,
    		inserirChave,
    		selecionarChaveParaEdicao,
    		atualizarChave,
    		input_input_handler,
    		click_handler
    	];
    }

    class InserirPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InserirPage",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\pages\ListarPage.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$2 = "src\\pages\\ListarPage.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (195:16) {:else}
    function create_else_block_1(ctx) {
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_4() {
    		return /*click_handler_4*/ ctx[14](/*chave*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			t0 = text("⚪\n                    ");
    			button = element("button");
    			button.textContent = "Reativar";
    			attr_dev(button, "class", "svelte-n7z6a5");
    			add_location(button, file$2, 196, 20, 6450);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_4, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(195:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (177:16) {#if chave.status === true}
    function create_if_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*chave*/ ctx[8].situacao === "disponivel") return create_if_block_1$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
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
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(177:16) {#if chave.status === true}",
    		ctx
    	});

    	return block;
    }

    // (186:20) {:else}
    function create_else_block(ctx) {
    	let t0;
    	let button0;
    	let t2;
    	let button1;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[12](/*chave*/ ctx[8]);
    	}

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[13](/*chave*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			t0 = text("⛔\n                        ");
    			button0 = element("button");
    			button0.textContent = "Alterar";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "Desativar";
    			attr_dev(button0, "class", "svelte-n7z6a5");
    			add_location(button0, file$2, 187, 24, 6090);
    			attr_dev(button1, "class", "svelte-n7z6a5");
    			add_location(button1, file$2, 190, 24, 6238);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_2, false, false, false, false),
    					listen_dev(button1, "click", click_handler_3, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(186:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (178:20) {#if chave.situacao === "disponivel"}
    function create_if_block_1$1(ctx) {
    	let t0;
    	let button0;
    	let t2;
    	let button1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*chave*/ ctx[8]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[11](/*chave*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			t0 = text("✅\n                        ");
    			button0 = element("button");
    			button0.textContent = "Alterar";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "Desativar";
    			attr_dev(button0, "class", "svelte-n7z6a5");
    			add_location(button0, file$2, 179, 24, 5744);
    			attr_dev(button1, "class", "svelte-n7z6a5");
    			add_location(button1, file$2, 182, 24, 5892);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler, false, false, false, false),
    					listen_dev(button1, "click", click_handler_1, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(178:20) {#if chave.situacao === \\\"disponivel\\\"}",
    		ctx
    	});

    	return block;
    }

    // (173:8) {#each Listachaves as chave}
    function create_each_block(ctx) {
    	let li;
    	let t0;
    	let t1_value = /*chave*/ ctx[8].nome + "";
    	let t1;
    	let t2;
    	let t3_value = /*chave*/ ctx[8].situacao + "";
    	let t3;
    	let t4;
    	let t5;

    	function select_block_type(ctx, dirty) {
    		if (/*chave*/ ctx[8].status === true) return create_if_block$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text("🗝️ ");
    			t1 = text(t1_value);
    			t2 = text(" - Situação: ");
    			t3 = text(t3_value);
    			t4 = space();
    			if_block.c();
    			t5 = space();
    			attr_dev(li, "class", "svelte-n7z6a5");
    			add_location(li, file$2, 173, 12, 5524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    			append_dev(li, t4);
    			if_block.m(li, null);
    			append_dev(li, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Listachaves*/ 2 && t1_value !== (t1_value = /*chave*/ ctx[8].nome + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*Listachaves*/ 2 && t3_value !== (t3_value = /*chave*/ ctx[8].situacao + "")) set_data_dev(t3, t3_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(li, t5);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(173:8) {#each Listachaves as chave}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let h2;
    	let t1;
    	let br0;
    	let t2;
    	let button0;
    	let t4;
    	let button1;
    	let t6;
    	let br1;
    	let t7;
    	let input;
    	let t8;
    	let button2;
    	let t10;
    	let ul;
    	let mounted;
    	let dispose;
    	let each_value = /*Listachaves*/ ctx[1];
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
    			br0 = element("br");
    			t2 = space();
    			button0 = element("button");
    			button0.textContent = "Disponíveis";
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Todas";
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			input = element("input");
    			t8 = space();
    			button2 = element("button");
    			button2.textContent = "Buscar";
    			t10 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-n7z6a5");
    			add_location(h2, file$2, 158, 4, 5075);
    			add_location(br0, file$2, 159, 4, 5117);
    			attr_dev(button0, "class", "svelte-n7z6a5");
    			add_location(button0, file$2, 160, 4, 5126);
    			attr_dev(button1, "class", "svelte-n7z6a5");
    			add_location(button1, file$2, 161, 4, 5196);
    			add_location(br1, file$2, 162, 4, 5249);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Digite o nome da chave");
    			attr_dev(input, "onchange", "carregarChavesNome");
    			attr_dev(input, "class", "svelte-n7z6a5");
    			add_location(input, file$2, 163, 4, 5258);
    			attr_dev(button2, "class", "svelte-n7z6a5");
    			add_location(button2, file$2, 169, 4, 5411);
    			add_location(ul, file$2, 171, 4, 5470);
    			attr_dev(main, "class", "svelte-n7z6a5");
    			add_location(main, file$2, 157, 0, 5064);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(main, t1);
    			append_dev(main, br0);
    			append_dev(main, t2);
    			append_dev(main, button0);
    			append_dev(main, t4);
    			append_dev(main, button1);
    			append_dev(main, t6);
    			append_dev(main, br1);
    			append_dev(main, t7);
    			append_dev(main, input);
    			set_input_value(input, /*filtroNome*/ ctx[0]);
    			append_dev(main, t8);
    			append_dev(main, button2);
    			append_dev(main, t10);
    			append_dev(main, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*carregarChavesDisponiveis*/ ctx[3], false, false, false, false),
    					listen_dev(button1, "click", /*carregarChaves*/ ctx[2], false, false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[9]),
    					listen_dev(button2, "click", /*carregarChavesNome*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*filtroNome*/ 1 && input.value !== /*filtroNome*/ ctx[0]) {
    				set_input_value(input, /*filtroNome*/ ctx[0]);
    			}

    			if (dirty & /*desativarChave, Listachaves, alterarSituacaoChave, reativarChave*/ 226) {
    				each_value = /*Listachaves*/ ctx[1];
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
    	validate_slots('ListarPage', slots, []);

    	let chave = {
    		nome: "",
    		situacao: "disponivel",
    		status: true
    	};

    	let filtroNome = ""; // para a busca pelo nome
    	let Listachaves = [];

    	async function carregarChaves() {
    		// Implementação de busca no backend com filtro de nome
    		let url = "http://localhost:8081/chaves";

    		try {
    			const response = await fetch(url);

    			if (response.ok) {
    				$$invalidate(1, Listachaves = await response.json());
    			} else {
    				console.error("Erro ao carregar as chaves:", response.statusText);
    			}
    		} catch(error) {
    			console.error("Erro ao carregar as chaves:", error);
    		}
    	}

    	// Implementação de busca no backend com filtro de situação
    	async function carregarChavesDisponiveis() {
    		let url = "http://localhost:8081/chaves/situacao/disponivel";

    		try {
    			const response = await fetch(url);

    			if (response.ok) {
    				$$invalidate(1, Listachaves = await response.json());
    			} else {
    				console.error("Erro ao carregar as chaves:", response.statusText);
    			}
    		} catch(error) {
    			console.error("Erro ao carregar as chaves:", error);
    		}
    	}

    	// Função atualizada para carregar chaves baseada no filtro de nome
    	async function carregarChavesNome() {
    		// Implementação de busca no backend com filtro de nome
    		let url = "http://localhost:8081/chaves";

    		if (filtroNome.trim()) {
    			url += `/nome/${encodeURIComponent(filtroNome.trim())}`;
    		}

    		try {
    			const response = await fetch(url);

    			if (response.ok) {
    				$$invalidate(1, Listachaves = await response.json());
    			} else {
    				console.error("Erro ao carregar as chaves:", response.statusText);
    			}
    		} catch(error) {
    			console.error("Erro ao carregar as chaves:", error);
    		}
    	}

    	// Função para alterar a situação da chave
    	async function alterarSituacaoChave(chave) {
    		try {
    			const response = await fetch(`http://localhost:8081/chaves/${chave.id}`, {
    				method: "PUT",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({
    					...chave,
    					situacao: chave.situacao === "disponivel"
    					? "indisponivel"
    					: "disponivel"
    				})
    			});

    			if (response.ok) {
    				carregarChaves(); // Recarrega a lista de chaves
    			} else {
    				console.error("Erro ao alterar a situação da chave:", response.statusText);
    			}
    		} catch(error) {
    			console.error("Erro ao alterar a situação da chave:", error);
    		}
    	}

    	// Função para reativar a chave
    	async function reativarChave(chave) {
    		try {
    			const response = await fetch(`http://localhost:8081/chaves/${chave.id}`, {
    				method: "PUT",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({
    					...chave,
    					status: chave.status === false ? true : false
    				})
    			});

    			if (response.ok) {
    				carregarChaves(); // Recarrega a lista de chaves
    			} else {
    				console.error("Erro ao alterar a situação da chave:", response.statusText);
    			}
    		} catch(error) {
    			console.error("Erro ao alterar a situação da chave:", error);
    		}
    	}

    	// Função para desativar (remover) uma chave
    	async function desativarChave(chave) {
    		try {
    			const response = await fetch(`http://localhost:8081/chaves/${chave.id}`, {
    				method: "DELETE",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify(chave)
    			});

    			if (response.ok) {
    				carregarChaves(); // Recarrega a lista de chaves
    			} else {
    				console.error("Erro ao desativar a chave:", response.statusText);
    			}
    		} catch(error) {
    			console.error("Erro ao desativar a chave:", error);
    		}
    	}

    	carregarChavesDisponiveis();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ListarPage> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		filtroNome = this.value;
    		$$invalidate(0, filtroNome);
    	}

    	const click_handler = chave => alterarSituacaoChave(chave);
    	const click_handler_1 = chave => desativarChave(chave);
    	const click_handler_2 = chave => alterarSituacaoChave(chave);
    	const click_handler_3 = chave => desativarChave(chave);
    	const click_handler_4 = chave => reativarChave(chave);

    	$$self.$capture_state = () => ({
    		chave,
    		filtroNome,
    		Listachaves,
    		carregarChaves,
    		carregarChavesDisponiveis,
    		carregarChavesNome,
    		alterarSituacaoChave,
    		reativarChave,
    		desativarChave
    	});

    	$$self.$inject_state = $$props => {
    		if ('chave' in $$props) $$invalidate(8, chave = $$props.chave);
    		if ('filtroNome' in $$props) $$invalidate(0, filtroNome = $$props.filtroNome);
    		if ('Listachaves' in $$props) $$invalidate(1, Listachaves = $$props.Listachaves);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		filtroNome,
    		Listachaves,
    		carregarChaves,
    		carregarChavesDisponiveis,
    		carregarChavesNome,
    		alterarSituacaoChave,
    		reativarChave,
    		desativarChave,
    		chave,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class ListarPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListarPage",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\HomePage.svelte generated by Svelte v3.59.2 */

    const file$1 = "src\\pages\\HomePage.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let div1;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let div0;
    	let h20;
    	let t5;
    	let p1;
    	let t7;
    	let h21;
    	let t9;
    	let p2;
    	let t11;
    	let h22;
    	let t13;
    	let p3;
    	let t15;
    	let h23;
    	let t17;
    	let p4;
    	let t18;
    	let br0;
    	let t19;
    	let br1;
    	let t20;
    	let br2;
    	let t21;
    	let br3;
    	let t22;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Bem-vindo ao Sistema de Empréstimo de Chaves do IFTM!";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Selecione uma opção no menu para começar.";
    			t3 = space();
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Sobre o Sistema";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Este sistema foi desenvolvido para facilitar o gerenciamento e\r\n                empréstimo de chaves dentro do Instituto Federal. Aqui, você\r\n                pode inserir novas chaves, visualizar a lista de chaves\r\n                disponíveis, editar informações de chaves existentes ou\r\n                desativar chaves que não estão mais em uso.";
    			t7 = space();
    			h21 = element("h2");
    			h21.textContent = "Como Utilizar";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "Para começar, selecione a opção \"Inserir Chave\" no menu para\r\n                cadastrar uma nova chave no sistema. Se quiser ver todas as\r\n                chaves disponíveis, escolha \"Lista de Chaves\". Você também pode\r\n                buscar por chaves específicas, editar seus detalhes ou\r\n                desativá-las conforme necessário.";
    			t11 = space();
    			h22 = element("h2");
    			h22.textContent = "Contato e Suporte";
    			t13 = space();
    			p3 = element("p");
    			p3.textContent = "Em caso de dúvidas ou necessidade de suporte, entre em contato\r\n                com a administração do instituto.";
    			t15 = space();
    			h23 = element("h2");
    			h23.textContent = "Créditos";
    			t17 = space();
    			p4 = element("p");
    			t18 = text("Este sistema foi feito por: \r\n                ");
    			br0 = element("br");
    			t19 = text("Gabriela Silva Rodrigues\r\n                ");
    			br1 = element("br");
    			t20 = text("Gustavo Machado Pontes\r\n                ");
    			br2 = element("br");
    			t21 = text("Mateus Alves Silva\r\n                ");
    			br3 = element("br");
    			t22 = text("Nathan Rodrigues dos Santos");
    			attr_dev(h1, "class", "svelte-178osl9");
    			add_location(h1, file$1, 2, 8, 50);
    			attr_dev(p0, "class", "svelte-178osl9");
    			add_location(p0, file$1, 3, 8, 122);
    			attr_dev(h20, "class", "svelte-178osl9");
    			add_location(h20, file$1, 6, 12, 222);
    			attr_dev(p1, "class", "svelte-178osl9");
    			add_location(p1, file$1, 7, 12, 260);
    			attr_dev(h21, "class", "svelte-178osl9");
    			add_location(h21, file$1, 15, 12, 662);
    			attr_dev(p2, "class", "svelte-178osl9");
    			add_location(p2, file$1, 16, 12, 698);
    			attr_dev(h22, "class", "svelte-178osl9");
    			add_location(h22, file$1, 24, 12, 1094);
    			attr_dev(p3, "class", "svelte-178osl9");
    			add_location(p3, file$1, 25, 12, 1134);
    			attr_dev(h23, "class", "svelte-178osl9");
    			add_location(h23, file$1, 29, 12, 1300);
    			add_location(br0, file$1, 32, 16, 1398);
    			add_location(br1, file$1, 33, 16, 1444);
    			add_location(br2, file$1, 34, 16, 1488);
    			add_location(br3, file$1, 35, 16, 1528);
    			attr_dev(p4, "class", "svelte-178osl9");
    			add_location(p4, file$1, 30, 12, 1331);
    			attr_dev(div0, "class", "info-section svelte-178osl9");
    			add_location(div0, file$1, 5, 8, 182);
    			attr_dev(div1, "class", "home-container svelte-178osl9");
    			add_location(div1, file$1, 1, 4, 12);
    			add_location(main, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, p0);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(div0, t7);
    			append_dev(div0, h21);
    			append_dev(div0, t9);
    			append_dev(div0, p2);
    			append_dev(div0, t11);
    			append_dev(div0, h22);
    			append_dev(div0, t13);
    			append_dev(div0, p3);
    			append_dev(div0, t15);
    			append_dev(div0, h23);
    			append_dev(div0, t17);
    			append_dev(div0, p4);
    			append_dev(p4, t18);
    			append_dev(p4, br0);
    			append_dev(p4, t19);
    			append_dev(p4, br1);
    			append_dev(p4, t20);
    			append_dev(p4, br2);
    			append_dev(p4, t21);
    			append_dev(p4, br3);
    			append_dev(p4, t22);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HomePage', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HomePage> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class HomePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HomePage",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    // (26:41) 
    function create_if_block_2(ctx) {
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(26:41) ",
    		ctx
    	});

    	return block;
    }

    // (24:40) 
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
    		source: "(24:40) ",
    		ctx
    	});

    	return block;
    }

    // (22:6) {#if page === 'HomePage'}
    function create_if_block(ctx) {
    	let homepage;
    	let current;
    	homepage = new HomePage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(homepage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(homepage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(homepage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(homepage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(homepage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(22:6) {#if page === 'HomePage'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let body;
    	let h1;
    	let t1;
    	let nav;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[0] === 'HomePage') return 0;
    		if (/*page*/ ctx[0] === 'ListarPage') return 1;
    		if (/*page*/ ctx[0] === 'InserirPage') return 2;
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
    			button0 = element("button");
    			button0.textContent = "Início";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Inserir Chave";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "Lista de Chaves";
    			t7 = space();
    			if (if_block) if_block.c();
    			attr_dev(h1, "class", "svelte-z3ex3g");
    			add_location(h1, file, 14, 4, 340);
    			attr_dev(button0, "class", "svelte-z3ex3g");
    			add_location(button0, file, 16, 6, 393);
    			attr_dev(button1, "class", "svelte-z3ex3g");
    			add_location(button1, file, 17, 8, 463);
    			attr_dev(button2, "class", "svelte-z3ex3g");
    			add_location(button2, file, 18, 8, 543);
    			attr_dev(nav, "class", "svelte-z3ex3g");
    			add_location(nav, file, 15, 4, 381);
    			attr_dev(body, "class", "svelte-z3ex3g");
    			add_location(body, file, 13, 2, 329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, h1);
    			append_dev(body, t1);
    			append_dev(body, nav);
    			append_dev(nav, button0);
    			append_dev(nav, t3);
    			append_dev(nav, button1);
    			append_dev(nav, t5);
    			append_dev(nav, button2);
    			append_dev(body, t7);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(body, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[2], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[3], false, false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[4], false, false, false, false)
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
    	let page = 'HomePage';

    	function navigate(to) {
    		$$invalidate(0, page = to);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => navigate('HomePage');
    	const click_handler_1 = () => navigate('InserirPage');
    	const click_handler_2 = () => navigate('ListarPage');

    	$$self.$capture_state = () => ({
    		InserirPage,
    		ListarPage,
    		HomePage,
    		page,
    		navigate
    	});

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, navigate, click_handler, click_handler_1, click_handler_2];
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
