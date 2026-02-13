class MultiSelect extends HTMLElement {
    constructor(element = undefined,options = {}) {
        super();
        let defaults = {
            placeholder: 'Select item(s)',
            max: null,
            min: null,
            disabled: false,
            search: true,
            selectAll: true,
            listAll: true,
            allSelectedText: 'Any',
            closeListOnItemSelect: false,
            name: '',
            width: '',
            height: '',
            dropdownWidth: '',
            dropdownHeight: '',
            data: [],
            onChange: function() {},
            onSelect: function() {},
            onUnselect: function() {},
            onMaxReached: function() {}
        };
        this.options = Object.assign(defaults, options);

        if(element) {
            this.selectElement = typeof element === 'string' ? document.querySelector(element) : element;
            this.originalSelectElement = this.selectElement.cloneNode(true);
            for(const prop in this.selectElement.dataset) {
                if (this.options[prop] !== undefined) {
                    if (typeof this.options[prop] === 'boolean') {
                        this.options[prop] = this.selectElement.dataset[prop] === 'true';
                    } else {
                        this.options[prop] = this.selectElement.dataset[prop];
                    }
                }
            }
            this.name = this.selectElement.getAttribute('name') ? this.selectElement.getAttribute('name') : 'multi-select-' + Math.floor(Math.random() * 1000000);
            if (!this.options.data?.length) {
                let options = this.selectElement.querySelectorAll('option');
                for (let i = 0; i < options.length; i++) {
                    console.log(options[i]);
                    this.options.data.push({
                        value: options[i].value,
                        text: options[i].value,
                        selected: options[i].selected,
                        html: options[i].innerHTML
                    });
                }
            }

            this.originalData = JSON.parse(JSON.stringify(this.options.data));
            this.selectElement.replaceWith(this);
            this.setAttribute('id', this.selectElement.getAttribute('id'));
        }
        else {
            /*for(const prop in this.dataset) {
                if (this.options[prop] !== undefined) {
                    if (typeof this.options[prop] === 'boolean') {
                        this.options[prop] = this.dataset[prop] === 'true';
                    } else {
                        this.options[prop] = this.dataset[prop];
                    }
                }
            }*/

            for(const prop in defaults) {
                if(!this.hasAttribute(prop) || typeof this.options[prop] === 'function') continue;
                if(typeof this.options[prop] === 'boolean') {
                    this.options[prop] = this.getAttribute(prop) !== 'false';
                } else {
                    this.options[prop] = this.getAttribute(prop);
                }
            }
            this.name = this.getAttribute('name') || 'multi-select-' + Math.floor(Math.random() * 1000000);
            if (!this.options.data?.length) {
                let options = this.querySelectorAll('option');
                for (let i = 0; i < options.length; i++) {
                    this.options.data.push({
                        value: options[i].value,
                        text: options[i].value,
                        selected: options[i].selected,
                        html: options[i].innerHTML
                    });

                    this.removeChild(options[i]);
                }
            }
        }

        this._template();
        this.outsideClickHandler = this._outsideClick.bind(this);
        this._updateSelected();
        this._eventHandlers();
        if (this.options.disabled) {
            this.disable();
        }
    }

    constructor2(element, options = {}) {
        //super();
        console.log(element);
        let defaults = {
            placeholder: 'Select item(s)',
            max: null,
            min: null,
            disabled: false,
            search: true,
            selectAll: true,
            listAll: true,
            closeListOnItemSelect: false,
            name: '',
            width: '',
            height: '',
            dropdownWidth: '',
            dropdownHeight: '',
            data: [],
            onChange: function() {},
            onSelect: function() {},
            onUnselect: function() {},
            onMaxReached: function() {}
        };
        this.options = Object.assign(defaults, options);
        this.selectElement = typeof element === 'string' ? document.querySelector(element) : element;
        this.originalSelectElement = this.selectElement.cloneNode(true);
        for(const prop in this.selectElement.dataset) {
            if (this.options[prop] !== undefined) {
                if (typeof this.options[prop] === 'boolean') {
                    this.options[prop] = this.selectElement.dataset[prop] === 'true';
                } else {
                    this.options[prop] = this.selectElement.dataset[prop];
                }
            }
        }

        this.originalData = JSON.parse(JSON.stringify(this.options.data));
        this.element = this._template();
        this.selectElement.replaceWith(this.element);
        this.outsideClickHandler = this._outsideClick.bind(this);
        this._updateSelected();
        this._eventHandlers();
        if (this.options.disabled) {
            this.disable();
        }
    }

    _template() {
        let optionsHTML = '';
        for (let i = 0; i < this.data.length; i++) {
            const isSelected = this.data[i].selected;
            optionsHTML += `
                <div class="multi-select-option${isSelected ? ' multi-select-selected' : ''}" data-value="${this.data[i].value}" role="option" aria-selected="${isSelected}" tabindex="0">
                    <span class="multi-select-option-radio"></span>
                    <span class="multi-select-option-text">${this.data[i].html ?? this.data[i].text}</span>
                </div>
            `;
        }
        let selectAllHTML = '';
        if (this.options.selectAll) {
            selectAllHTML = `<div class="multi-select-all" role="option" tabindex="0">
                <span class="multi-select-option-radio"></span>
                <span class="multi-select-option-text">Select all</span>
            </div>`;
        }
        //${this.selectedValues.map(value => `<input type="hidden" name="${this.name}[]" value="${value}">`).join('')}
        let template = `
                <div class="multi-select-header" style="${this.width ? 'width:' + this.width + ';' : ''}${this.height ? 'height:' + this.height + ';' : ''}" tabindex="0">
                    <span class="multi-select-header-max">${this.options.max ? this.selectedValues.length + '/' + this.options.max : ''}</span>
                    <span class="multi-select-header-placeholder">${this.placeholder}</span>
                </div>
                <div class="multi-select-options" style="${this.options.dropdownWidth ? 'width:' + this.options.dropdownWidth + ';' : ''}${this.options.dropdownHeight ? 'height:' + this.options.dropdownHeight + ';' : ''}" role="listbox">
                    ${this.options.search ? `<input type="text" id="${this.name}-search" class="multi-select-search" placeholder="Search..." role="searchbox">` : ''}
                    ${selectAllHTML}
                    ${optionsHTML}
                </div>
        `;
        this.className = this.name;
        this.setAttribute("role","combobox");
        this.setAttribute("aria-haspopup", "listbox");
        this.setAttribute("aria-expanded","false");
        this.innerHTML = template;
    }

    _eventHandlers() {
        let headerElement = this.querySelector('.multi-select-header');
        const toggleDropdown = (forceClose = false) => {
            if (this.classList.contains('disabled')) return;
            if (forceClose || headerElement.classList.contains('multi-select-header-active')) {
                headerElement.classList.remove('multi-select-header-active');
                this.setAttribute('aria-expanded', 'false');
            } else {
                headerElement.classList.add('multi-select-header-active');
                this.setAttribute('aria-expanded', 'true');
            }
        };
        this.querySelectorAll('.multi-select-option').forEach(option => {
            option.toggle = () => {
                if (this.classList.contains('disabled')) return;
                let selected = true;
                if (!option.classList.contains('multi-select-selected')) {
                    if (this.options.max && this.selectedValues.length >= this.options.max) {
                        this.options.onMaxReached(this.options.max);
                        return;
                    }
                    option.classList.add('multi-select-selected');
                    option.setAttribute('aria-selected', 'true');
                    //this.insertAdjacentHTML('afterbegin', `<input type="hidden" name="${this.name}[]" value="${option.dataset.value}">`);
                    this.data.find(data => data.value == option.dataset.value).selected = true;
                } else {
                    option.classList.remove('multi-select-selected');
                    option.setAttribute('aria-selected', 'false');
                    //this.querySelector(`input[value="${option.dataset.value}"]`).remove();
                    this.data.find(data => data.value === option.dataset.value).selected = false;
                    selected = false;
                }
                return selected;
            }
            option.updateSelector = (selected) => {
                this._updateHeader();
                /*if (this.options.search) {
                    this.querySelector('.multi-select-search').value = '';
                    this.querySelectorAll('.multi-select-option').forEach(opt => opt.style.display = 'flex');
                }*/
                if (this.options.closeListOnItemSelect) {
                    toggleDropdown(true);
                }
                this.options.onChange(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                if (selected) {
                    this.options.onSelect(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                } else {
                    this.options.onUnselect(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                }
                this._validate();
            }
            option.onclick = function(e) {
                e.stopPropagation();
                let selected = this.toggle();
                this.updateSelector(selected);
            };
        });
        headerElement.onclick = () => toggleDropdown();
        if (this.options.search) {
            let search = this.querySelector('.multi-select-search');
            search.oninput = () => {
                this.querySelectorAll('.multi-select-option').forEach(option => {
                    const text = option.querySelector('.multi-select-option-text').innerHTML.toLowerCase();
                    option.style.display = text.includes(search.value.toLowerCase()) ? 'flex' : 'none';
                });
            };
        }
        if (this.options.selectAll) {
            let selectAllButton = this.querySelector('.multi-select-all');
            selectAllButton.onclick = (e) => {
                e.stopPropagation();
                if (this.classList.contains('disabled')) return;
                let allSelected = selectAllButton.classList.contains('multi-select-selected');
                this.querySelectorAll('.multi-select-option').forEach(option => {
                    let dataItem = this.data.find(data => data.value === option.dataset.value);
                    if (dataItem && ((allSelected && dataItem.selected) || (!allSelected && !dataItem.selected))) {
                        //console.log(option,option.onclick);
                        option.toggle();
                    }
                });
                selectAllButton.classList.toggle('multi-select-selected');
                this._updateHeader();

            };
        }
        if (this.selectElement?.id && document.querySelector('label[for="' + this.selectElement?.id + '"]')) {
            let label = document.querySelector('label[for="' + this.selectElement?.id + '"]');
            label.onclick = () => {
                toggleDropdown();
            };
            label.setAttribute("for",this.getAttribute('id'));
        }
        document.addEventListener('click', this.outsideClickHandler);
        document.addEventListener('scroll',this.outsideClickHandler);
        headerElement.addEventListener('keydown', (e) => {
            if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
                e.preventDefault();
                toggleDropdown();
                const firstElement = this.querySelector('[role="searchbox"]') || this.querySelector('[role="option"]');
                firstElement?.focus();
            }
        });
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                toggleDropdown(true);
                headerElement.focus();
            }
        });
        const optionsContainer = this.querySelector('.multi-select-options');
        optionsContainer.addEventListener('keydown', (e) => {
            const currentFocused = document.activeElement;
            if (currentFocused.closest('.multi-select-options')) {
                if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
                    e.preventDefault();
                    const direction = e.key === 'ArrowDown' ? 'nextElementSibling' : 'previousElementSibling';
                    let nextElement = currentFocused[direction];
                    while (nextElement && (nextElement.style.display === 'none' || !nextElement.matches('[role="option"], [role="searchbox"]'))) {
                        nextElement = nextElement[direction];
                    }
                    if (nextElement) nextElement.focus();
                } else if (['Enter', ' '].includes(e.key) && currentFocused.matches('[role="option"]')) {
                    e.preventDefault();
                    currentFocused.click();
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    this.querySelector('.multi-select-options')?.firstElementChild.focus?.();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    this.querySelector('.multi-select-options')?.lastElementChild.focus?.();
                }
            }
        });
    }

    _updateHeader() {
        this.querySelectorAll('.multi-select-header-option, .multi-select-header-placeholder').forEach(el => el.remove());
        this.querySelector('.multi-select-header').classList.remove('all-selected')
        if (this.selectedValues.length > 0) {
            if(this.options.allSelectedText && this.areAllSelected()) {
                this.querySelector('.multi-select-header').textContent = this.options.allSelectedText;
                this.querySelector('.multi-select-header').classList.add('all-selected');
            } else if (this.options.listAll) {
                /*this.selectedItems.forEach(item => {
                    const el = document.createElement('span');
                    el.className = 'multi-select-header-option';
                    el.dataset.value = item.value;
                    el.innerHTML = item.text;
                    this.querySelector('.multi-select-header').append(el);
                });*/
                this.querySelector('.multi-select-header').textContent = this.selectedItems.map(item => item.text).join(', ');
            } else {
                this.querySelector('.multi-select-header').textContent = this.selectedValues.length+" selected";
            }

            if(this.options.selectAll && this.selectedValues.length === this.options.data.length) {
                let selectAllButton = this.querySelector('.multi-select-all');
                selectAllButton.classList.toggle('multi-select-selected',true);
            } else if(this.options.selectAll) {
                let selectAllButton = this.querySelector('.multi-select-all');
                selectAllButton.classList.toggle('multi-select-selected', false);
            }
        } else {
            this.querySelector('.multi-select-header').textContent = '';
            this.querySelector('.multi-select-header').insertAdjacentHTML('beforeend', `<span class="multi-select-header-placeholder">${this.placeholder}</span>`);
        }
        if (this.options.max) {
            this.querySelector('.multi-select-header-max').innerHTML = this.selectedValues.length + '/' + this.options.max;
        }
        this._triggerChange();
    }

    _updateSelected() { this._updateHeader(); }

    _validate() {
        if (this.options.min && this.selectedValues.length < this.options.min) {
            this.classList.add('multi-select-invalid');
        } else {
            this.classList.remove('multi-select-invalid');
        }
    }

    _outsideClick(event) {
        if (!this.contains(event.target) && !event.target?.closest?.('label[for="' + this.selectElement?.id + '"]')) {
            let headerElement = this.querySelector('.multi-select-header');
            if (headerElement.classList.contains('multi-select-header-active')) {
                headerElement.classList.remove('multi-select-header-active');
                this.setAttribute('aria-expanded', 'false');
            }
        }
    }

    _triggerChange() {
        let event = new CustomEvent('change');
        this.dispatchEvent(event);
    }

    select(value) {
        const option = this.querySelector(`.multi-select-option[data-value="${value}"]`);
        if (option && !option.classList.contains('multi-select-selected')) {
            option.click();
        }
    }

    unselect(value) {
        const option = this.querySelector(`.multi-select-option[data-value="${value}"]`);
        if (option && option.classList.contains('multi-select-selected')) {
            option.click();
        }
    }

    setValues(values) {
        this.data.forEach(item => {
            item.selected = values.includes(item.value);
        });
        this.refresh();
    }

    disable() {
        this.classList.add('disabled');
        this.querySelector('.multi-select-header').removeAttribute('tabindex');
        const searchInput = this.querySelector('.multi-select-search');
        if (searchInput) searchInput.disabled = true;
    }

    enable() {
        this.classList.remove('disabled');
        this.querySelector('.multi-select-header').setAttribute('tabindex', '0');
        const searchInput = this.querySelector('.multi-select-search');
        if (searchInput) searchInput.disabled = false;
    }

    destroy() {
        this.replaceWith(this.originalSelectElement);
        document.removeEventListener('click', this.outsideClickHandler);
    }

    refresh() {
        const newElement = this.cloneNode(true);
        newElement.options = this.options;

        newElement._template();
        newElement._updateSelected();
        newElement._eventHandlers();
        newElement._validate();
        this.replaceWith(newElement);
    }

    addItem(item) {
        this.options.data.push(item);
        this.refresh();
    }

    addItems(items) {
        this.options.data.push(...items);
        this.refresh();
    }

    async fetch(url, options = {}) {
        const response = await fetch(url, options);
        const data = await response.json();
        this.addItems(data);
        if (this.options.onload) {
            this.options.onload(data, this.options);
        }
    }

    removeItem(value) {
        this.options.data = this.options.data.filter(item => item.value !== value);
        this.refresh();
    }

    clear() {
        this.options.data = [];
        this.refresh();
    }

    reset() {
        this.data = JSON.parse(JSON.stringify(this.originalData));
        this.refresh();
    }

    selectAll() {
        this.data.forEach(item => item.selected = true);
        this.refresh();
    }
    unselectAll() {
        this.data.forEach(item => item.selected = true);
        this.refresh();
    }

    areAllSelected() {
        return this.data.length === this.selectedItems.length;
    }

    get selectedValues() { return this.data.filter(d => d.selected).map(d => d.value); }
    get selectedItems() { return this.data.filter(d => d.selected); }
    get data() { return this.options.data; }
    set data(value) { this.options.data = value; }

    set selectElement(value) { this.options.selectElement = value; }
    get selectElement() { return this.options.selectElement; }

    set element(value) { this.options.element = value; }
    get element() { return this.options.element; }

    set placeholder(value) { this.options.placeholder = value; }
    get placeholder() { return this.options.placeholder; }

    set name(value) { this.options.name = value; }
    get name() { return this.options.name; }

    set width(value) { this.options.width = value; }
    get width() { return this.options.width; }

    set height(value) { this.options.height = value; }
    get height() { return this.options.height; }

}
window.customElements.define("multi-select",MultiSelect)
document.querySelectorAll('select[multi-select]').forEach(select => new MultiSelect(select));