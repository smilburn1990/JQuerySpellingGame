//Global variables
var randomWord;
var listOfWords;
var attemptNumber;
var completionNumber;
var populationNumber;
var gridSize;
var successSound;
var failSound;
var moveSound;
var hitSound;
var missSound;
var hintSound;
var hintPic;
var hintPicTitle;
var bgMusic;
var animation = false;
var score = {
    right: 0,
    wrong: 0
};

//Gets number of spaces available in the grid
function getXSpaces(numOfSpaces) {
    var answer = "";
    for (var i = 0; i < numOfSpaces; i++) {
        answer += " ";
    }
    return answer;
}

//Gets word to fit in without overlapping
function getWordToFitIn(spaceAvail, wordlist) {
    var foundIndex = -1;
    //loops until function param returns true.
    var answer;
    $.each(wordlist, function (index, word) {
        if (word.length <= spaceAvail) {
            foundIndex = index;
            answer = word;
            return false; // stops the loop
        }
    });
    // if none found return blank word of remaining space size
    if (foundIndex == -1) {
        answer = getXSpaces(spaceAvail);
        //remove a blank from list if found
        $.each(wordlist, function (index, word) {
            if (word[0] == " ") {
                foundIndex = index;
                return false;
            }
        });
    }
    //remove the word from the list
    if (foundIndex != -1) {
        wordlist.splice(foundIndex, 1);
    }
    return answer;
}

//Creates the grid for the game
function createGrid() {

    //Extracts the <ul> data attributes from the mark-up
    $('#wordlist').each(function () {
        populationNumber.push($(this).data('population-number'));
        completionNumber.push($(this).data('completion-number'));
        attemptNumber.push($(this).data('attempt-number'));
        gridSize.push($(this).data('grid-size'));
    });

    //Determines grid size from "data-grid-size" attribute and adds size class
    if ($('#wordlist').data('grid-size') == "large") {
        var gridColumns = 6;
        var gridRows = 8;
        $('#game-container .game').addClass('large-grid');
    } else {
        var gridColumns = 4;
        var gridRows = 4;
        $('#game-container .game').addClass('small-grid');
    }
    //Populates the grid with words
    var wordlist = $("#wordlist");
    var wordsData = [];
    var tempWords = wordlist.find('li');
    if (wordlist.find('li').length >= populationNumber) {
        var indexs = [],
            index;
        while (populationNumber) {
            index = Math.floor(Math.random() * tempWords.length);
            if ($.inArray(index, indexs) === -1) {
                indexs.push(index);
                wordsData.push(tempWords[index]);
                populationNumber--;
            }
        }
    } else {
        wordsData = tempWords;
    }
    //Extracts the <li> data attributes from the <ul> "#wordlist"
    $(wordsData).each(function () {
        var elm = $(this);
        listOfWords.push({
            "name": elm.data("word"),
                "pic": elm.data("pic"),
                "hint": elm.data("hint"),
                "audio": elm.data("audio")
        });
    });
    
    //Slices the chosen words
    var chosenWords = $(wordsData).get().sort(function () {
        return Math.round(Math.random()) - 0.5
    }).slice(0, 2)
    var copylist = listOfWords.slice();
    for (var x = 0; x < listOfWords.length; x++) {
        var rand = Math.floor(Math.random() * (copylist.length));
        chosenWords.push(copylist[rand].name);
        copylist.splice(rand, 1);
        if (chosenWords.length < 12) {
            chosenWords.push('   ');
        }
    }
    //Shuffles words to randomize
    var shuffledWords = [];
    shuffledWords = chosenWords.sort(function () {
        return 0.5 - Math.random();
    });

    var randomWord = shuffledWords.slice();

    var guesses = {};
    var tbl = $('<table></table>');
    for (var i = 0; i < gridColumns; i++) {
        if (randomWord.length == 0) {
            break;
        }
        var row = '<tr>';
        var spaceAvailInRow = gridRows;
        while (spaceAvailInRow) {
            var word = getWordToFitIn(spaceAvailInRow, randomWord);
            guesses[word] = [];
            spaceAvailInRow -= word.length;
            for (var k = 0; k < word.length; ++k) {
                row += '<td data-letter="' + word[k] + '" data-word="' + word + '"><div class="flip-wrapper"><div class="front"></div><div class="back drop-box"></div></div></td>';
            }
        }
        row += '</tr>';
        tbl.append(row);
    }
    //Apends table to correct container
    $(".table-container").append(tbl);
}

function keyPress() {
    $(document).keypress(function (e) {
        if (e.which >= 97 && e.which <= 122) {
            letter = String.fromCharCode(e.which);
            $(".drag[data-letter='" + letter + "']").trigger('click');
        }
    });
}

//Plays back-ground music when program is started
function backGroundSound() {
    playing = true;
    $(bgMusic).bind('ended', function () {
        this.currentTime = 0;
        if (playing) {
            this.play();
        }
    }, false);

    bgMusic.play();
    //Click event for the "Play/Pause" button
    $('.background-music').click(function () {
        if (!bgMusic.paused) {
            bgMusic.pause();
            playing = false;
            $('#play').toggleClass("paused");
        } else {
            bgMusic.play();
            playing = true;
            $('#play').toggleClass("paused");
        }
    });
}

//The main function the the draggables
function dragEvent() {

    //Click event for all the drag elements
    $('.drag').click(function (e) {
        e.preventDefault();
        if (animation) return;
        moveSound.play();
        if ($('.highlight-problem active')) {
            $('.highlight-problem').removeClass('active');
        }
        var target = $('.highlight-problem .drop-box:not(.occupied):first');
        var targetPos = target.parents('td').position();
        var currentPos = $(this).offset();
        var ball = $(e.currentTarget);
        //Animation for the drag events
        if (target.length) {
            target.addClass("occupied");
            $(".occupied").parent(".flip-wrapper").addClass("flipped");
            animation = true;
            var clonedObject = ball.clone()
            //Determines whether the letter is correct and adds the corresponding classes and sounds
            if (ball.data("letter") == target.parents('td').data("letter")) {
                clonedObject.addClass("right-letter");
                target.addClass('right-letter');
                setTimeout(function () {
                    hitSound.play();
                }, 550);
            } else {
                clonedObject.addClass("wrong-letter");
                target.addClass('wrong-letter');
                setTimeout(function () {
                    missSound.play();
                }, 550);
            }
            //Animation for the drag events
            clonedObject.appendTo('.table-container').css({
                position: "absolute",
                top: currentPos.top,
                left: currentPos.left
            }).animate({
                top: targetPos.top,
                left: targetPos.left
            }, "slow", function () {
                animation = false;
                $(clonedObject).css({
                    top: 0,
                    left: 0
                }).appendTo(target);
                //Determine whether the whole word is correct
                var spellWord = $('.highlight-problem .drop-box');
                if (!spellWord.filter(':not(.occupied)').length) {
                    var wordIsCorrect = 0;
                    spellWord.each(function () {
                        if ($(this).parents('td').data("letter") == $(this).find("div").data("letter")) {
                            wordIsCorrect++;
                        }
                    });
                    //Adds the corresponding classes and attributes to the word if it is correct
                    if (spellWord.length == wordIsCorrect) {
                        spellWord.closest('td').addClass('right-word');
                        $('.helper').addClass('right-word');
                        score.right++;
                        score.wrong = 0;
                        $('.drag').click(function (e) {
                            $('.helper').removeClass('right-word');
                        });
                        setTimeout(function () {
                            successSound.play();
                            $('.score').html(score.right + "/" + completionNumber);
                        }, 200);
                        //Automatically moves to next question when on is complete
                        setTimeout(function () {
                            $('.next-question').trigger('click');
                        }, 1500);
                        //Adds corresponding classes and attributes to the game when the "completeionNumber" is met by the right score
                        if (score.right == completionNumber) {
                            $('#game-container .game').addClass('game-over');
                            $('.next-question').off('click');

                        }
                    } else {
                        //Adds the corresponding classes and attributes to the word if it is incorrect
                        spellWord.closest('td').addClass('wrong-word');
                        $('.helper').addClass('wrong-word');
                        score.wrong++;
                        //Plays sound for incorrect word after 2ms
                        setTimeout(function () {
                            failSound.play();
                        }, 200);
                        //Removes toggle class for "next-question" button when drag element is clciked again
                        $('.drag').click(function (e) {
                            $(".next-question").removeClass('move-down');
                            $('.helper').removeClass('wrong-word');
                        });
                        //Removes nessesary classes of the incorrect word to wipe the slate clean
                        setTimeout(function () {
                            $(".occupied").parent(".flip-wrapper").removeClass('flipped');
                            $('.highlight-problem .drop-box').removeClass('occupied').removeClass('wrong-letter').removeClass('right-letter').html("");
                            spellWord.closest('td').removeClass('wrong-word');
                        }, 2500);
                        //When the icorrect answer is input "3" times reset score and show "next-question" button  
                        if (score.wrong == attemptNumber) {
                            setTimeout(function () {
                                $(".next-question").addClass('move-down');
                                score.wrong = 0;
                            }, 2500);
                        }
                    }
                }
            });
        }
    });
}

//Function for the next question button in the game
function nextQuestion() {
    $('.next-question').on('click', function () {

        $('td').removeClass('highlight-problem');
        var r = randomWord;
        while (r == randomWord) {
            randomWord = Math.floor(Math.random() * (listOfWords.length));
        }
        //Adds and removes nesesary classes
        $('td[data-word="' + listOfWords[randomWord].name + '"]').addClass('highlight-problem');
        $('td[data-word=' + ']').removeClass('wrong-letter').removeClass('wrong-word').removeClass('right-letter');
        var spellSpace = $('td[data-word="' + listOfWords[randomWord].name + '"]').hasClass('right-word');
        if (spellSpace) {
            $(".next-question").eq(($(".next-question").index($(this)) + 1) % $(".next-question").length).trigger("click");
        } else {
            $("#hintSound").attr('src', listOfWords[randomWord].audio);
            hintSound.play();
            $("#hintPic").attr('src', listOfWords[randomWord].pic);
            $('#hintPicTitle').attr('title', listOfWords[randomWord].hint);
        }
    });
}
//Function for the close message button at the start of the game
function closeMessage() {
    $('.close-message').one("click", function () {

        $('.helper').addClass('inactive');
        $('.tiles-wrapper').addClass('active');
        $('.hint-container').addClass('active');
        var r = randomWord;
        while (r == randomWord) {
            randomWord = Math.floor(Math.random() * (listOfWords.length));
        }
        //Adds and removes nesesary classes
        $('td[data-word="' + listOfWords[randomWord].name + '"]').addClass('highlight-problem active');
        $('td[data-word=' + ']').removeClass('wrong-letter').removeClass('wrong-word').removeClass('right-letter');
        var spellNewSpace = $('td[data-word=' + listOfWords[randomWord].name + ']').hasClass('highlight-problem');
        if (spellNewSpace) {
            $("#hintSound").attr('src', listOfWords[randomWord].audio);
            hintSound.play();
            $("#hintPic").attr('src', listOfWords[randomWord].pic);
            $('#hintPicTitle').attr('title', listOfWords[randomWord].hint);
        }
    });
}
//Replays the "hint-sound"
function replaySound() {
    $(".replay-sound").click(function () {

        $("#hintSound").attr('src', listOfWords[randomWord].hintSound);
        hintSound.play();
    });
}
//Chooses random background image and add to the "reveal-wrapper" class
function backGroundImage() {
    bgImageTotal = 5;
    randomNumber = Math.round(Math.random() * (bgImageTotal - 1)) + 1;
    $('.reveal-wrapper').addClass('image' + randomNumber);
}

//Plays audio when document is loaded
function playBackGroundSound() {
    $('a.playsomething').click(function (e) {
        var idToPlay = $(this).data('toplay');
        play($('#' + idToPlay));
        e.preventDefault();
    });
}

//Reset game function allows for the game to loop by re-initializing values
function resetGame() {

    $('.table-container').empty();
    $('.reveal-wrapper').empty();
    $('.helper').removeClass('inactive');
    $('.tiles-wrapper').removeClass('active');
    $('.hint-container').removeClass('active');
    $('td').addClass('highlight-problem');
    $('#game-container .game').removeClass("active").removeClass('game-over').addClass('standby').addClass('transition');
    $('.score').html("");
    $(".next-question").removeClass('move-down');
    $('.reveal-wrapper').removeClass('image' + randomNumber);
    score.right = 0;
    score.wrong = 0;

	//Fades the background music back in
    var vol = 0,
        interval = 200;
    if (bgMusic.volume == 0) {
        var intervalID = setInterval(function () {
            if (vol < 1) {
                vol += 0.05;
                bgMusic.volume = vol.toFixed(1);
            } else {
                clearInterval(intervalID);
            }
        }, interval);
    }
}

//New game function is called everytime the user clicks start and calls all nessesary functions
function newGame() {

    randomWord = [];
    listOfWords = [];
    attemptNumber = [];
    completionNumber = [];
    populationNumber = [];
    gridSize = [];

    createGrid();
    backGroundImage();
    dragEvent();
    nextQuestion();
    closeMessage();
    replaySound();

    $('.score').html("0/" + completionNumber);
    $('#game-container .game').removeClass("standby").addClass('active').addClass('transition');

	//Fades music out when game is started
    var vol = 1,
        interval = 200;
    if (bgMusic.volume == 1) {
        var intervalID = setInterval(function () {
            if (vol > 0) {
                vol -= 0.05;
                bgMusic.volume = vol.toFixed(1);
            } else {
                clearInterval(intervalID);
            }
        }, interval);
    }
}

//Loads all nessesary functions when document is loaded
$(document).ready(function () {

    successSound = $("#successSound")[0];
    failSound = $("#failSound")[0];
    moveSound = $("#moveSound")[0];
    hitSound = $("#hitSound")[0];
    missSound = $("#missSound")[0];
    hintSound = $("#hintSound")[0];
    hintPic = $("#hintPic")[0];
    hintPicTitle = $("#hintPicTitle")[0];
    bgMusic = $('#audio-bg')[0];

    backGroundSound();
    playBackGroundSound();
    keyPress();
	              
    $(".start-btn-wrapper").one('click', function () {
    	newGame();
    });
    $(".restart-btn").click(function () {
        resetGame();
        $(".start-btn-wrapper").one('click',newGame);                      
    });
});