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
        var form = element.querySelector('#mcq-form');
        var raw = form.getAttribute('data-choices') || '[]';
        var selected = parseInt(form.getAttribute('data-selected') || '-1');
        var choices = [];
        try { choices = JSON.parse(raw); } catch (e) { choices = []; }

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
        if (submit) submit.onclick = function() {
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
    }

    function disableInputs(form) {
        var inputs = form.querySelectorAll('input[type="radio"], button');
        inputs.forEach(function(input) {
            input.disabled = true;
        });
    }

    function MCXBlock(runtime, element) {
        renderChoices(runtime, element);
    }

    window.MCXBlock = MCXBlock;
})();

