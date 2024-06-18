$(document).ready(function() {
    // تابع برای تعیین مسیر صحیح فایل footer.html
    function getFooterUrl() {
        var currentPath = window.location.pathname;
        if (currentPath.includes('/seasons-html/')) {
            return 'footer.html'; // مسیر برای فایل‌های موجود در پوشه seasons-html
        } else {
            return 'seasons-html/footer.html'; // مسیر برای فایل‌های موجود در سطح بالاتر
        }
    }

    // Load footer and then execute additional scripts
    $.ajax({
        url: getFooterUrl(),
        method: 'GET',
        success: function (response) {
            // Adds the 'footer' to the end of the 'body' tag
            $('body').append(response);
            
            // تابع برای تعیین مسیر صحیح تصویر
            function setFooterImagePath() {
                var footerImg = document.getElementById('footer-img');
                
                // مکان نسبی فایل HTML فعلی را تعیین کنید
                var currentPath = window.location.pathname;

                // بر اساس مکان نسبی، مسیر تصویر را تنظیم کنید
                if (currentPath.includes('/seasons-html/')) {
                    footerImg.src = '../Images/my-logo.svg'; // تنظیم مسیر برای فایل‌های موجود در پوشه seasons-html
                } else {
                    footerImg.src = 'Images/my-logo.svg'; // تنظیم مسیر برای فایل e-booklet.html
                }
            }

            // فراخوانی تابع پس از بارگذاری فوتر
            setFooterImagePath();
        
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