/* Javascript for Inline Text and Dropdown XBlock. */
function InlineTextAndDropdownXBlockInitView(runtime, element) {

  var handlerUrl = runtime.handlerUrl(element, 'student_submit'),
      resetUrl = runtime.handlerUrl(element, 'student_reset'),
      hintUrl = runtime.handlerUrl(element, 'send_hints'),
      idUrl = runtime.handlerUrl(element, 'send_xblock_id'),
      restoreUrl = runtime.handlerUrl(element, 'restore_state'),
      publishUrl = runtime.handlerUrl(element, 'publish_event'),

      $element = $(element),

      $mainDiv = $element.find('.inline-text-and-dropdown'),

      $hintButton = $element.find('.hint-button'),
      $submitButton = $element.find('.submit'),

      $problemProgress = $element.find('.problem-progress'),
      $questionPrompt = $element.find('.question-prompt'),
      $feedbackDiv = $element.find('.feedback'),
      $hintDiv = $element.find('.hint'),
      $hintButtonHolder = $element.find('.hint-button-holder'),

      hint,
      hints,
      hintCounter = 0,

      prompt = $questionPrompt.html(),

      xblockId = '',
      uniqueSubmissionKey = null,
      savedAnswers = null;

  $.ajax({
    type: 'POST',
    url: hintUrl,
    data: JSON.stringify({requested: true}),
    success: setHints
  });

  $.ajax({
    type: 'POST',
    url: idUrl,
    data: JSON.stringify({requested: true}),
    success: setXblockId
  });

  function publishEvent(data) {
    $.ajax({
      type: 'POST',
      url: publishUrl,
      data: JSON.stringify(data)
    });
  }

  function preSubmit() {
    $problemProgress.text('(Loading...)');
    if (!prompt) {
      prompt = $questionPrompt.html();
    }
  }

  function showResetButton() {
    $($mainDiv).each(function() {
      var $thisResetButton = $(this).find('.reset');
      if ($(this).data('show-reset-button')) {
        $thisResetButton.removeClass('hidden');
      } else {
        $thisResetButton.remove();
      }
    });
  }

  function postSubmit(result) {
    var $xblock = $problemProgress.closest('.inline-text-and-dropdown');
    if($xblock.data('show-correctness')) {
      $problemProgress.text('(' + result.problem_progress + ')');
      showFeedback(result.feedback);
    } else {
      $problemProgress.text('');
      showFeedback('<span class="icon fa fa-info-circle" aria-hidden="true"></span>\n' +
        '<span class="notification-message" aria-describedby="problem-title">' + gettext(result.feedback) + '</span>');
    }
    disableSubmitButton();
    resetHint();
    resetPrompt(prompt);
    savedAnswers = result.submissions;
    restoreAnswers(result.submissions);
    addDecorations(result.correctness, result.answers_order);
    sessionStorage.removeItem(uniqueSubmissionKey);
  }

  function restoreAnswers(answers) {
    $('select, input').each(function() {
      if (this.getAttribute('xblock_id') === xblockId) {
        // reset the answer value to what the student submitted
        this.value = answers[this.getAttribute('input')];

        if($(this).is('input')) {
          setInputWidth(this);
        }
      }
    });
  }

  function addDecorations(correctness, answersOrder) {
    $('select, input').each(function() {
      var $xblock = $(this).closest('.inline-text-and-dropdown');
      if ($xblock.data('show-correctness')) {
        // var xblockContainer = $(e.currentTarget).closest('.inline-dropdown');
        if (this.getAttribute('xblock_id') === xblockId) {
          var decorationNumber = answersOrder[this.getAttribute('input')];
          // add new decoration to the select
          if (correctness[this.getAttribute('input')] === 'True') {
            $('<span class="inline-text-and-dropdown feedback-number-correct">(' + decorationNumber + ')</span>').insertAfter(this);
            $('<span class="fa fa-check status correct"/>').insertAfter(this);
          } else {
            $('<span class="inline-text-and-dropdown feedback_number-incorrect">(' + decorationNumber + ')</span>').insertAfter(this);
            $('<span class="fa fa-times status incorrect"/>').insertAfter(this);
          }
        }
      }
    });
  }

  function postReset(result) {
    var $xblock = $problemProgress.closest('.inline-text-and-dropdown'),
        $problemText = $xblock.data('show-correctness') ? '(' + result.problem_progress + ')' : '';
    $problemProgress.text($problemText);

    resetPrompt();
    resetHint();
    resetFeedback();
    toggleSubmitButton($xblock);
  }

  function setHints(result) {
    hints = result.hints;
    if (hints.length) {
      $hintButton.css('display', 'inline');
      $hintButtonHolder.css('display', 'inline');
    }
  }

  function setXblockId(result) {
    xblockId = result.xblock_id;
    uniqueSubmissionKey = `${result.user_id}:${handlerUrl}`
    showResetButton();
    addChangeListener();
    $.ajax({
      type: 'POST',
      url: restoreUrl,
      data: JSON.stringify({requested: true}),
      success: restoreState
    });

    $questionPrompt.find('input').on('keyup', function () {
      setInputWidth(this);
    });
  }

  function restoreState(result) {
    var $xblock = $problemProgress.closest('.inline-text-and-dropdown'),
        $showCorrectness = $xblock.data('show-correctness'),
        currentFeedback;
    if (result.completed) {
      savedAnswers = result.answers;
      restoreAnswers(result.answers);
      addDecorations(result.correctness, result.answers_order);
      currentFeedback = $showCorrectness ? result.current_feedback :
        '<span class="icon fa fa-info-circle" aria-hidden="true"></span>\n' +
          '<span class="notification-message" aria-describedby="problem-title">' + result.current_feedback + '</span>';
      showFeedback(currentFeedback);
    }
    toggleSubmitButton($xblock);
  }

  function resetPrompt() {
    $questionPrompt.html(prompt);
    addChangeListener();

    $questionPrompt.find('input').on('keyup', function () {
      setInputWidth(this);
    });
  }

  function resetHint() {
    hintCounter = 0;
    $hintDiv.css('display', 'none');
  }

  function disableSubmitButton() {
    $submitButton.attr('disabled', 'true');
  }

  function resetFeedback() {
    $feedbackDiv.html();
    $feedbackDiv.css('display', 'none');
  }

  function showHint() {
    hint = hints[hintCounter];
    $hintDiv.html(hint);
    $hintDiv.css('display', 'block');
    publishEvent({
      event_type: 'hint-button',
      next_hint_index: hintCounter,
    });
    if (hintCounter === (hints.length - 1)) {
      hintCounter = 0;
    } else {
      hintCounter++;
    }
  }

  function showFeedback(feedback) {
    $feedbackDiv.html(feedback);
    $feedbackDiv.css('display', 'block');
  }

  function getStateToSubmit() {
    var answers = {};
    var answersOrder = {};
    var complete = true;
    var counter = 1;
    $('select, input').each(function() {
      if (this.getAttribute('xblock_id') === xblockId) {
        if (this.selectedIndex === 0) {
          complete = false;
          showFeedback('<p class="incorrect">You haven\'t completed the question.</p>');
        }
        answers[this.getAttribute('input')] = this.value;
        answersOrder[this.getAttribute('input')] = counter;
        counter++;
      }
    });
    return {
      answers: answers,
      answersOrder: answersOrder,
      complete: complete,
    }
  }

  $submitButton.on('click', function() {
    preSubmit();
    state = getStateToSubmit();
    var data = {
      answers: state.answers,
      answers_order: state.answersOrder,
    };
    if (state.complete) {
      $.ajax({
        type: 'POST',
        url: handlerUrl,
        data: JSON.stringify(data),
        success: postSubmit
      });
    }
  });

  $('.reset', element).click(function() {
    var data = {};
    $.ajax({
      type: 'POST',
      url: resetUrl,
      data: JSON.stringify(data),
      success: postReset
    });
  });

  $('.hint-button', element).click(function() {
    showHint();
  });

  function isFormFilled($container) {
    var result;
    $container.find('select, input').each(function() {
      if ($(this).val()) {
        result = true;
      } else {
        result = false;
        return false;
      }
    });
    return result;
  }

  function toggleSubmitButton($container) {
    $container.find('.submit').prop('disabled', true);

    if(isFormFilled($container)) {
      var state = getStateToSubmit(),
          currentAnswers = state.answers,
          areSavedAnswers = !!savedAnswers && Object.keys(savedAnswers).every(function(key) {
            return savedAnswers[key] === currentAnswers[key];
          });
      if (!areSavedAnswers) {
        var payload = {
          answers: currentAnswers,
          answers_order: state.answersOrder,
        };
        $container.find('.submit').prop('disabled', false);
        sessionStorage.setItem(uniqueSubmissionKey, JSON.stringify(payload));
      }
    }
  }

  function addChangeListener() {
    $mainDiv.find('select, input').on('keyup change', function(e) {
      var $xblockContainer = $(e.currentTarget).closest('.inline-text-and-dropdown');
      toggleSubmitButton($xblockContainer);
    });
  }

  function setInputWidth(el) {
    var $this = $(el),
      symbolsCount = $this.val().length,
      additionalSpace = 2,
      averageSymbolWidth = 8;

    $this.css('width', (symbolsCount + additionalSpace) * averageSymbolWidth);
  }
}
