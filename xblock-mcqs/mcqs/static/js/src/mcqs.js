/* Javascript for McqsXBlock. */
function McqsXBlock(runtime, element) {
    var checkUrl = runtime.handlerUrl(element, 'check_answer');
    
    function checkAnswer() {
        var selectedCheck = $('input[name="choice"]:checked');
        var answerId = selectedCheck.val();

        selectedCheck.parent().addClass('user-choice');
        
        $.ajax({
            type: "POST",
            data: JSON.stringify({'ans': answerId}),
            url: checkUrl,
            success: function(data){
                 // mark question as attempted
                $('#question-block', element).addClass('attempted');

                if(data.correct == true){
                    $('#question-block', element).addClass('correct');
                }else{
                    // indicate correct and incorrect
                    $('#question-block', element).addClass('incorrect');

                    var correctChoice = data.correct_choice;
                    $('input[name="choice"][value='+correctChoice+']').
                        parent().addClass('correct-choice');
                }
            }
        });
    }

    function getHint() {
        var hintUrl = runtime.handlerUrl(element, 'get_hint');

        $.ajax({
            type: "POST",
            data: JSON.stringify({}),
            url: hintUrl,
            success: function(data){
                $('#hint', element).text(data.hint);
                $('.help-tip', element).hide();
            }
        });
    }
    
     // enable submit only after any selection
    $('#submit', element).attr('disabled', true);

    $(element).on('change', 'input[name=choice]', function(){
        $('#submit', element).attr('disabled', false);
    });

    $('#submit', element).on('click', function(e){
        checkAnswer();
    });

    $('.help-tip', element).on('click', function(e){
        if($(this).text() == ""){
            getHint();
        }
    });
}
