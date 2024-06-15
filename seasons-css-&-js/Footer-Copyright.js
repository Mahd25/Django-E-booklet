$(document).ready(function() {
    // Load footer and then execute additional scripts
    $.ajax({
        url: 'footer.html',
        method: 'GET',
        success: function (response) {

            // Adds the 'footer' to the end of the 'body' tag
            $('body').append(response);
        
        // ---------------------------------------------------------------------------

            const startYear = 2024;
            const currentYear = new Date().getFullYear();

            // Set the start year
            $('#start-year').text(startYear);

            // Check and set the current year only if it's different from start year
            if (startYear !== currentYear) {
                $('#current-year').text('-' + currentYear);
            } else {
                // Optionally, you can hide the current year span if they are the same
                $('#current-year').hide();
            }
        },
        error: function (error) {
            console.error('Error loading footer:', error);
        }
    });
})