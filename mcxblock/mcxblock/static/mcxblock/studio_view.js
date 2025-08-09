(function() {
    function MCXBlockStudio(runtime, element) {
        var save = element.querySelector('.save-button');
        var cancel = element.querySelector('.cancel-button');
        var status = element.querySelector('#mcq-status');

        save.addEventListener('click', function() {
            var data = {
                question: element.querySelector('#mcq-question').value,
                choices: element.querySelector('#mcq-choices').value,
                correct_index: parseInt(element.querySelector('#mcq-correct').value || '0', 10)
            };
            status.textContent = 'Saving...';
            var xhr = new XMLHttpRequest();
            xhr.open('POST', runtime.handlerUrl(element, 'studio_submit'));
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                status.textContent = 'Saved';
                runtime.notify('save', {});
            };
            xhr.send(JSON.stringify(data));
        });

        cancel.addEventListener('click', function() {
            runtime.notify('cancel', {});
        });
    }

    window.MCXBlockStudio = MCXBlockStudio;
})();
