$(document).ready(function () {
    // Adds the 'nav' tag to the beginning of the 'body' tag
    $('body').prepend(`
        <nav class="menu">
            <div class="menu-icons">
                <i class="fa-solid fa-bars icon open active"></i>
                <i class="fa-solid fa-xmark icon close"></i>
            </div>
            <h1 class="django-eBooklet">Django E-booklet</h1>
            <a href="../e-booklet.html" class="back-home">
                <i class="fa-solid fa-house back-home-icon"></i>
            </a>
        </nav>
    `);

    // Get the content of the 'h2' tag
    let h2Text = $('h2').text();
    let newText = h2Text.split(':')[0];

    // Creates the content of the 'h1' tag based on the content of the 'h2' tag
    function updateNavText() {
        if ($(window).width() >= 900) {
            $('nav h1').text(h2Text);
        } else {
            $('nav h1').text(newText);
        }
    }

    updateNavText();

    // changes the text, based on the page size change
    $(window).resize(function () {
        updateNavText();
    });
// -------------------------------------------------------------------------------------------

    // Adds the 'menubar' to the 'container' div
    $.ajax({
        url: 'menubar.html',
        method: 'GET',
        success: function (data) {
            $('.container').prepend(data);
        },
        error: function (error) {
            console.error("Error loading menubar:", error);
        }
    });
// ------------------------------------------------------------------------------------------------------------

    // open and close icon for menubar
    $(document).on('click', '.open', function () {
        $('.open').toggleClass('active');
        $('.close').toggleClass('active');
        $('.menu-list').toggleClass('active');
        $('.content').toggleClass('active');
    });

    $(document).on('click', '.close', function () {
        $('.close').toggleClass('active');
        $('.open').toggleClass('active');
        $('.menu-list').toggleClass('active');
        $('.content').toggleClass('active');
    });
// --------------------------------------------------------------------------------------------------------------

    // Script for scrolling to titles, without placing them under the header
    const headerOffset = $('.menu').outerHeight();

    $('a[href^="#"]').click(function (event) {
        event.preventDefault();
        const targetId = $(this).attr('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const targetPosition = $(targetElement).offset().top - headerOffset - 13;
            $('html, body').animate({
                scrollTop: targetPosition
            }, 750); // was 600
        }
    });
});
