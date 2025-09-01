/**
 * XBlockRuntime Bridge - Provides access to XBlock runtime functions from vanilla JS
 */
(function() {
  'use strict';

  // Create a runtime registry
  window.XBlockRuntime = {
    runtimes: {},

    // Register a runtime instance
    registerRuntime: function(runtimeClass, runtimeVersion, runtimeInstance) {
      const key = `${runtimeClass}:${runtimeVersion}`;
      this.runtimes[key] = runtimeInstance;
    },

    // Get a runtime instance
    getRuntime: function(runtimeClass, runtimeVersion) {
      const key = `${runtimeClass}:${runtimeVersion}`;
      return this.runtimes[key] || null;
    },

    // Bridge for common runtime functions
    handlerUrl: function(runtime, elementId, handlerName) {
      return Promise.resolve(runtime.handlerUrl(elementId, handlerName));
    }
  };

  // Function to automatically register runtime when an XBlock initializes
  window.registerXBlockRuntime = function(runtime, element) {
    const runtimeClass = element.getAttribute('data-runtime-class');
    const runtimeVersion = element.getAttribute('data-runtime-version');
    
    if (runtimeClass && runtimeVersion) {
      window.XBlockRuntime.registerRuntime(runtimeClass, runtimeVersion, runtime);
    }
  };

  // Patch the original Sortable4XBlock function to register the runtime
  const originalSortable4XBlock = window.Sortable4XBlock;
  window.Sortable4XBlock = function(runtime, element) {
    // Register the runtime
    if (element && typeof element.getAttribute === 'function') {
      window.registerXBlockRuntime(runtime, element);
    } else if (element && element.jquery) {
      window.registerXBlockRuntime(runtime, element[0]);
    }
    
    // Call the original initialization function
    return originalSortable4XBlock(runtime, element);
  };
})();
