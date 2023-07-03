$(document).ready(function () {
    let pieces = createPieces(true);
    let isGameStarted = false;
    let isFirstMove = false;
    let timerInterval;
    let timer;
    let timeLeft = $('.modal_container p');

    $('#checkResult').prop('disabled', true).addClass('disabled');
    $('.pieceContainer').html(pieces);

    //Функція створює елементи пазлу
    function createPieces(withImage) {
        let rows = 4, columns = 4;
        let pieces = "";
        for (let r = 0, top = 0, order = 0; r < rows; r++, top -= 100) {
            for (let c = 0, left = 0; c < columns; c++, left -= 100, order++) {
                if (withImage) {
                    pieces += `<div style="background-position: ${left}px ${top}px;" class="piece droppedPiece" data-order='${order}'></div>`;
                } else {
                    pieces += `<div style="background-image: none;" class="piece droppableSpace"></div>`;
                }
            }
        }

        return pieces;
    }

    //Функція перемішує елементи пазлу
    function startGame() {
        let pieces = $('.pieceContainer div');
        let gridSize = 400;
        let pieceSize = 100;

        let availablePositions = generateAvailablePositions(gridSize, pieceSize);

        pieces.each(function () {
            if (availablePositions.length === 0) {
                return false;
            }

            let randomIndex = Math.floor(Math.random() * availablePositions.length);
            let position = availablePositions[randomIndex];

            $(this).addClass('draggablePiece')
                .css({
                    position: 'absolute',
                    left: position.left + 'px',
                    top: position.top + 'px'
                });

            availablePositions.splice(randomIndex, 1);
            $('.pieceContainer').append($(this));
        });

        let emptyString = createPieces(false);
        $('.puzzleContainer').html(emptyString);
        implementLogic();
    }

    //Функція відповідає за пересування елемента
    function implementLogic() {
        $('.draggablePiece').draggable({
            revert: 'invalid',
            start: function () {
                if ($(this).hasClass('droppedPiece')) {
                    $(this).removeClass('droppedPiece');
                    $(this).parent().removeClass('piecePresent');
                }
                if (!isGameStarted) {
                    isGameStarted = true;
                    if (!isFirstMove) {
                        isFirstMove = true;
                        startTimer();
                        $('#startGame').prop('disabled', true).addClass('disabled');
                        $('#checkResult').prop('disabled', false).removeClass('disabled');
                    }
                }
                $(this).css('z-index', '9999');
            },
            stop: function () {
                $(this).css('z-index', '1');
            }    
        });

        $('.droppableSpace').droppable({
            accept: function () {
                return !$(this).hasClass('piecePresent');
            },
            drop: function (event, ui) {
                let draggableElement = ui.draggable;
                let droppedOn = $(this);
                droppedOn.addClass('piecePresent');
                $(draggableElement)
                    .addClass('droppedPiece')
                    .css({
                        top: 0,
                        left: 0,
                        position: 'relative'
                    }).appendTo(droppedOn);
            }
        });
    }

    //Функція відповідає за приймаючі клітинки частин пазлу
    function generateAvailablePositions(gridSize, pieceSize) {
        let availablePositions = [];
        let numPieces = gridSize / pieceSize;

        for (let i = 0; i < numPieces; i++) {
            for (let j = 0; j < numPieces; j++) {
                let left = i * pieceSize;
                let top = j * pieceSize;
                availablePositions.push({ left: left, top: top });
            }
        }

        return availablePositions;
    }

    //Функція відліку для таймеру та передачі часу на табло
    function startTimer() {
        let time = 60;
        let timerElement = $('.timer h1');
        // let timeLeft = $('.modal_container p');
        timerElement.text(formatTime(time));
        timeLeft.text(formatTime(time));

        timerInterval = setInterval(function () {
            time--;
            timerElement.text(formatTime(time));
            timeLeft.text(formatTime(time));
            if (time <= 0) {
                clearInterval(timerInterval);
                // $('#startGame').prop('disabled', false).removeClass('disabled');
                $('#checkResult').prop('disabled', true).addClass('disabled');
                checkSolution();
                $('p').css({
                    display: 'none'
                })
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        let timerElement = $('.timer h1');
        timerElement.text('01:00');
    }

    //Формат часу для теймеру
    function formatTime(time) {
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
        timer = `${formattedMinutes}:${formattedSeconds}`;
        return timer;
    }

    //Кнопка старт
    $('#startGame').on('click', function () {
        // startGame();
        isGameStarted = true;
        isFirstMove = true;
        startTimer();
        $('#startGame').prop('disabled', true).addClass('disabled');
        $('#checkResult').prop('disabled', false).removeClass('disabled');
    });

    //Кнопка нова гра
    $('#newGame').click(function () {
        let newPieces = createPieces(true);
        $('.pieceContainer').html(newPieces);
        $('.puzzleContainer').html(newPieces);
        startGame();
        resetTimer();
        isFirstMove = false;
        isGameStarted = false;
        $('#startGame').prop('disabled', false).removeClass('disabled');
        $('#checkResult').prop('disabled', true).addClass('disabled');
    });

    startGame(); //Перемішує пазли при завантаженні сторінки

    function openModal(message) {
        $('.modal_window').css({
            backgroundColor: 'rgba(151, 158, 158, 0.578)',
            zIndex: 3
        });

        $('.modal_main').css({
            backgroundColor: '#fefefe',
            top: '0',
            left: '27%',
            height: '26%',
            width: '48%',
            opacity: 0
        }).fadeIn({
            duration: 500,
            easing: 'easeOutQuart',
            complete: function () {
                $(this).animate({
                    top: '7%',
                    opacity: 1
                }, {
                    duration: 500,
                    easing: 'easeOutQuart'
                });
            }
        });

        $('.modal_window').animate({
            backgroundColor: 'rgba(90, 90, 90, 0.578)'
        }, {
            duration: 1000,
            easing: 'easeOutQuart'
        });

        $('h2').text(message);
    }

    //Клавіша перевірити результат викликає модальне вікно
    $('#checkResult').on('click', function () {
        openModal(`You still have time, you sure?`);
        $('#check').css({
            display: 'block'
        });
        $('p').css({
            display: 'block'
        })
    });

    $('#close').on('click', function () {
        $('.modal_window').css({
            backgroundColor: 'transparent',
            zIndex: -1
        });

        $('.modal_main').css({
            backgroundColor: 'transparent',
            top: '7%',
            left: '27%',
            height: '26%',
            width: '48%',
            opacity: 1
        }).fadeIn({
            duration: 500,
            easing: 'easeOutQuart',
            complete: function () {
                $(this).animate({
                    top: '0',
                    opacity: 0
                }, {
                    duration: 500,
                    easing: 'easeOutQuart'
                });
            }
        });

        $('.modal_window').animate({
            backgroundColor: 'transparent'
        }, {
            duration: 1000,
            easing: 'easeOutQuart'
        });
    });

    function checkSolution() {
        let numbers = [];
        $('.droppableSpace').each(function () {
            numbers.push(parseInt($(this).find('.droppedPiece').attr('data-order')));
        });

        let sortedNumbers = numbers.slice().sort((a, b) => a - b);
        let isSolved = sortedNumbers.every((value, index) => value === index);

        if (isSolved) {
            openModal(`Woohoo, well done, you did it!`);
        } else {
            openModal(`It's a pity, but you lost`);
        }

        $('#check').css({
            display: 'none'
        })
        $('p').css({
            display: 'none'
        })
    }

    $('#check').on('click', function () {
        checkSolution();
        clearInterval(timerInterval);
        $('.draggablePiece').draggable('destroy');
        $('.droppableSpace').droppable('destroy');
    })

});

