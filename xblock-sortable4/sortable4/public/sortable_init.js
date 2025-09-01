// This script initializes SortableJS on the items-list element
document.addEventListener('DOMContentLoaded', function() {
  // Store runtime and element globally
  window.Sortable4Runtime = null;
  window.Sortable4Element = null;
  
  // Function to initialize Sortable on any newly rendered elements
  const initSortable = () => {
    // Find all items-list elements in the DOM that don't already have Sortable initialized
    const itemsLists = document.querySelectorAll('.items-list:not(.sortable-initialized)');
    
    itemsLists.forEach(itemsList => {
      // Create a new Sortable instance for this list
      if (typeof Sortable !== 'undefined') {
        const sortable = new Sortable(itemsList, {
          animation: 150,
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          dragClass: 'sortable-drag',
          onEnd: function(evt) {
            // Store the new order in a variable accessible to the submit handler
            window.currentSortableOrder = Array.from(itemsList.children).map(item => item.textContent.trim());
          }
        });
        
        // Mark this list as initialized
        itemsList.classList.add('sortable-initialized');
      }
    });
  };
  
  // Initialize any existing lists
  initSortable();
  
  // Set up a mutation observer to watch for new items-list elements added to the DOM
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        // Check if React has rendered a new items-list
        const hasItemsList = Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node instanceof Element ? node : null;
            return el && (el.classList.contains('items-list') || el.querySelector('.items-list'));
          }
          return false;
        });
        
        if (hasItemsList) {
          // Initialize Sortable on the new elements
          setTimeout(initSortable, 10);
        }
      }
    }
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Hook for the original Sortable4XBlock function to store the runtime
  const originalSortable4XBlock = window.Sortable4XBlock;
  window.Sortable4XBlock = function(runtime, element) {
    // Store the runtime and element globally
    window.Sortable4Runtime = runtime;
    window.Sortable4Element = element.jquery ? element[0] : element;
    
    // Call the original initialization function
    if (originalSortable4XBlock) {
      return originalSortable4XBlock(runtime, element);
    }
  };
  
  // Initialize submit button handlers
  function initSubmitButtons() {
    const submitButtons = document.querySelectorAll('#submit-answer:not(.handler-initialized)');
    
    submitButtons.forEach(button => {
      button.classList.add('handler-initialized');
      button.addEventListener('click', function() {
        if (!window.currentSortableOrder || !window.Sortable4Runtime || !window.Sortable4Element) {
          console.error('Missing required data for submission');
          return;
        }
        
        const items = window.currentSortableOrder;
        const handlerUrl = window.Sortable4Runtime.handlerUrl(window.Sortable4Element, 'submit_answer');
        
        // Make the POST request with the items
        const xhr = new XMLHttpRequest();
        xhr.open('POST', handlerUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.responseType = 'json';
        
        xhr.onload = function() {
          if (xhr.status === 200) {
            const data = xhr.response;
            
            // Update UI based on response
            const feedbackDiv = document.querySelector('.submission-feedback .message');
            if (feedbackDiv) {
              feedbackDiv.textContent = data.message || '';
            }
            
            // Update attempts counter
            const attemptsSpan = document.querySelector('.submission-feedback .attempts');
            if (attemptsSpan) {
              attemptsSpan.textContent = data.attempts || '0';
            }
            
            // Show success or error indicator
            const errorIndicator = document.querySelector('.indicator-container.error');
            const successIndicator = document.querySelector('.indicator-container.success');
            
            if (data.correct) {
              if (errorIndicator) errorIndicator.classList.add('is-hidden');
              if (successIndicator) successIndicator.classList.remove('is-hidden');
              button.disabled = true;
            } else {
              if (errorIndicator) errorIndicator.classList.remove('is-hidden');
              if (successIndicator) successIndicator.classList.add('is-hidden');
              
              if (data.remaining_attempts === 0) {
                button.disabled = true;
              }
            }
          }
        };
        
        xhr.onerror = function() {
          console.error('Error submitting answer');
        };
        
        xhr.send(JSON.stringify(items));
      });
    });
  }
  
  // Initialize submit buttons immediately and observe for new ones
  initSubmitButtons();
  const submitButtonObserver = new MutationObserver(() => {
    initSubmitButtons();
  });
  submitButtonObserver.observe(document.body, { childList: true, subtree: true });
});
