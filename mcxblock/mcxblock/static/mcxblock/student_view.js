(function() {
    function escapeHtml(unsafe) {
        return (unsafe + '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderChoices(runtime, element) {
        if (!element) {
            console.error('MCXBlock: missing element during renderChoices');
            return;
        }
        var form = element.querySelector('#mcq-form');
        if (!form) {
            console.error('MCXBlock: #mcq-form not found inside element', element);
            return;
        }
        var raw = form.getAttribute('data-choices') || '[]';
        var selected = parseInt(form.getAttribute('data-selected') || '-1');
        var choices = [];
        try { choices = JSON.parse(raw); } catch (e) { choices = []; }
        var demoMode = false;
        // If no choices provided, render a small demo question so the UI is testable
        if (!choices || choices.length === 0) {
            demoMode = true;
            choices = [
                'Example option A (demo)',
                'Example option B (demo)',
                'Example option C (demo)'
            ];
            // reflect in attributes so other code may read it if needed
            try { form.setAttribute('data-choices', JSON.stringify(choices)); } catch (e) { /* ignore */ }
            form.setAttribute('data-selected', '-1');
        }

        var html = '';
        for (var i = 0; i < choices.length; i++) {
            var checked = (i === selected) ? ' checked' : '';
            html += '<div><label><input type="radio" name="choice" value="' + i + '"' + checked + '> ' + escapeHtml(choices[i]) + '</label></div>';
        }
        // Only update the choices area, not the whole form
        var choicesDiv = form.querySelector('#mcq-choices');
        if (choicesDiv) {
            choicesDiv.innerHTML = html;
        }

        var feedback = form.querySelector('#mcq-feedback');
        var submit = form.querySelector('#mcq-submit');
    var handleSubmit = function(evt) {
            if (evt && typeof evt.preventDefault === 'function') evt.preventDefault();
            var radios = form.elements['choice'];
            var sel = -1;
            if (!radios) { sel = -1; }
            else if (radios.length === undefined) { // single radio
                if (radios.checked) sel = radios.value;
            } else {
                for (var j = 0; j < radios.length; j++) {
                    if (radios[j].checked) { sel = radios[j].value; break; }
                }
            }

            // Require a selection
            if (sel === -1 || sel === undefined || sel === null || sel === '') {
                if (feedback) {
                    feedback.innerHTML = '<span style="color:white; background-color:orange; padding:4px 8px; border-radius:4px;">⚠️ Please select an option.</span>';
                } else {
                    console.warn('MCXBlock: no selection and no feedback element to show message');
                }
                return;
            }
            // If demoMode, handle locally without contacting server
            if (demoMode) {
                var correctIndex = 0; // demo: first option is 'correct'
                if (parseInt(sel, 10) === correctIndex) {
                    if (feedback) feedback.innerHTML = '<span style="color:white; background-color:green; padding:4px 8px; border-radius:4px;">✅ Correct! (demo)</span>';
                    disableInputs(form);
                } else {
                    if (feedback) feedback.innerHTML = '<span style="color:white; background-color:red; padding:4px 8px; border-radius:4px;">❌ Incorrect. (demo)</span>';
                }
                return;
            }

            var xhr = new XMLHttpRequest();
            xhr.open('POST', runtime.handlerUrl(element, 'submit_answer'));
            xhr.setRequestHeader('Content-Type', 'application/json');
            // Add CSRF token for Django
            var getCookie = function(name) {
                var cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            };
            var csrftoken = getCookie('csrftoken');
            if (csrftoken) {
                xhr.setRequestHeader('X-CSRFToken', csrftoken);
            }
            xhr.onload = function() {
                var resp;
                try {
                    resp = JSON.parse(xhr.responseText);
                } catch (e) {
                    feedback.innerHTML = '<span style="color:white; background-color:orange; padding:4px 8px; border-radius:4px;">⚠️ Error: Invalid server response.</span>';
                    console.error('Server response was not valid JSON:', xhr.responseText);
                    return;
                }
                if (resp.correct) {
                    feedback.innerHTML = '<span style="color:white; background-color:green; padding:4px 8px; border-radius:4px;">✅ Correct!</span>';
                    disableInputs(form);
                } else {
                    feedback.innerHTML = '<span style="color:white; background-color:red; padding:4px 8px; border-radius:4px;">❌ Incorrect.</span>';
                }
            };
            xhr.onerror = function() {
                feedback.innerHTML = '<span style="color:white; background-color:orange; padding:4px 8px; border-radius:4px;">⚠️ Error: Could not reach server.</span>';
                console.error('Network error or server unreachable.');
            };
            xhr.send(JSON.stringify({choice: sel}));
        };
        if (submit && submit.addEventListener) {
            submit.addEventListener('click', handleSubmit, false);
        } else if (submit) {
            submit.onclick = handleSubmit;
        }
    }

    function disableInputs(form) {
        var inputs = form.querySelectorAll('input[type="radio"], button');
        if (inputs.forEach) {
            inputs.forEach(function(input) { input.disabled = true; });
        } else {
            for (var i = 0; i < inputs.length; i++) { inputs[i].disabled = true; }
        }
    }

    function MCXBlock(runtime, element) {
        if (!(this instanceof MCXBlock)) {
            return new MCXBlock(runtime, element);
        }
        // Coerce jQuery-wrapped elements or view-like objects to a DOM node
        var el = element;
        try {
            if (el && el.jquery) el = el[0];
            else if (el && typeof el.get === 'function') el = el.get(0);
            else if (el && el.el) el = el.el;
            else if (el && el.$el) {
                if (el.$el.jquery) el = el.$el[0];
                else if (el.$el[0]) el = el.$el[0];
            }
            else if (el && typeof el.length === 'number' && el[0]) {
                el = el[0];
            }
            else if (el && el.el && el.el[0]) {
                el = el.el[0];
            }
        } catch (e) {}
        this.runtime = runtime;
        this.element = el;
        renderChoices(runtime, el);
    }

    if (typeof define === 'function' && define.amd) {
        define(function() { return MCXBlock; });
    }
    if (typeof window !== 'undefined') {
        window.MCXBlock = MCXBlock;
    }
})();

