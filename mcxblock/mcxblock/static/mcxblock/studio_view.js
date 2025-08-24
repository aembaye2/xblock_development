(function() {
    function MCXBlockStudio(runtime, element) {
        // Support cases where Studio passes a jQuery-wrapped element or a view-like object.
    var el = element;
    var _debug = (typeof window !== 'undefined' && window.MCX_DEBUG) ? true : false;
        try {
            if (el && el.jquery) el = el[0];
            else if (el && typeof el.get === 'function') el = el.get(0);
            else if (el && el.el) el = el.el;
        } catch (e) {
            // ignore and let the subsequent checks surface a useful error
        }
        if (!_debug) {
            if (!el || typeof el.querySelector !== 'function') {
                console.error('MCXBlockStudio: element is not a DOM node. Received:', element);
                return;
            }
        } else {
            // In debug mode, log details to help diagnose wrapper types
            try {
                console.debug('MCXBlockStudio: raw element:', element);
                console.debug('MCXBlockStudio: resolved el:', el);
                if (element && element.constructor) console.debug('constructor:', element.constructor.name);
                if (el && el.constructor) console.debug('resolved constructor:', el.constructor.name);
            } catch (e) { console.debug('MCXBlockStudio: debug logging failed', e); }
            if (!el || typeof el.querySelector !== 'function') {
                console.error('MCXBlockStudio: element is not a DOM node after coercion. Received:', element);
                return;
            }
        }
        element = el;
        var save = element.querySelector('.save-button');
        var cancel = element.querySelector('.cancel-button');
        var status = element.querySelector('#mcq-status');

        if (!save) { console.warn('MCXBlockStudio: save button not found'); }
        if (!cancel) { console.warn('MCXBlockStudio: cancel button not found'); }

        var doSave = function() {
            var qEl = element.querySelector('#mcq-question');
            var cEl = element.querySelector('#mcq-choices');
            var idxEl = element.querySelector('#mcq-correct');
            var data = {
                question: qEl ? qEl.value : '',
                choices: cEl ? cEl.value : '[]',
                correct_index: idxEl ? parseInt(idxEl.value || '0', 10) : 0
            };
            if (status) status.textContent = 'Saving...';

            if (!runtime || !runtime.handlerUrl) {
                console.warn('MCXBlockStudio: runtime.handlerUrl not available; skipping server save (studio only?)');
                if (status) status.textContent = 'Saved (local)';
                if (runtime && typeof runtime.notify === 'function') runtime.notify('save', {});
                return;
            }

            var xhr = new XMLHttpRequest();
            xhr.open('POST', runtime.handlerUrl(element, 'studio_submit'));
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (status) status.textContent = 'Saved';
                if (runtime && typeof runtime.notify === 'function') runtime.notify('save', {});
            };
            xhr.onerror = function() {
                if (status) status.textContent = 'Save failed';
                console.error('MCXBlockStudio: failed to save via XHR');
            };
            xhr.send(JSON.stringify(data));
        };

        var doCancel = function() {
            if (runtime && typeof runtime.notify === 'function') {
                runtime.notify('cancel', {});
            } else {
                console.warn('MCXBlockStudio: runtime.notify not available for cancel');
            }
        };

        if (save) {
            if (save.addEventListener) save.addEventListener('click', doSave, false);
            else save.onclick = doSave;
        }
        if (cancel) {
            if (cancel.addEventListener) cancel.addEventListener('click', doCancel, false);
            else cancel.onclick = doCancel;
        }
    }

    if (typeof window !== 'undefined') {
        window.MCXBlockStudio = MCXBlockStudio;
    }
})();
