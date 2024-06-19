$(document).ready(function() {
    // A function to determine the correct path of the footer.html file, for the url in ajax
    function getFooterUrl() {
        let currentPath = window.location.pathname;
        if (currentPath.includes('/seasons-html/')) {
            return 'footer.html'; // The path for the files in the seasons-html folder
        } else {
            return 'seasons-html/footer.html'; // The path for the files in the higher level
        }
    }

    // --------------------------------------------------------------------------------------------------------------
    // Load footer and then execute additional scripts
    $.ajax({
        url: getFooterUrl(),
        method: 'GET',
        success: function (response) {
            // Adds the 'footer' to the end of the 'body' tag
            $('body').append(response);

            // --------------------------------------------------------------------------------------------------------
            // Function to determine the correct path of the logo
            function setFooterImagePath() {
                let footerImg = document.getElementById('footer-logo');
                
                // Determine the relative location of the current HTML file
                let currentPath = window.location.pathname;

                // Adjust logo image path based on relative location
                if (currentPath.includes('/seasons-html/')) {
                    footerImg.src = '../Images/my-logo.svg'; // the path for the files in the seasons-html folder
                } else {
                    footerImg.src = 'Images/my-logo.svg'; // the path for the e-booklet.html file
                }
            }

            // ------------------------------------------------------------------------------------------------------------
            // Function to set contact-us link path for about-us page
            function setContactUsLink() {
                let contactUsLink = document.querySelector('.more-link');
                let currentPath = window.location.pathname;

                if (currentPath.includes('/seasons-html/')) {
                    contactUsLink.href = 'contact-us.html'; // The href path for the files in the seasons-html folder
                } else {
                    contactUsLink.href = 'seasons-html/contact-us.html'; // The href path for the e-booklet.html file
                }
            }

            // ------------------------------------------------------------------------------------------------------------
            // Calling functions after loading the footer
            setFooterImagePath();
            setContactUsLink();

            // ------------------------------------------------------------------------------------------------------------
            // Automatic adjustment of the year in the copyright text
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
});