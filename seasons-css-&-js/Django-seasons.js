$(document).ready(function() {
    // اسکریپت جاوااسکریپت برای اضافه کردن تگ nav به ابتدای body
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

    // محتوای h2 موجود در صفحه را انتخاب کنید
    let h2Text = $('h2').text();
    let newText = h2Text.split(':')[0];

    function updateNavText() {
        if ($(window).width() >= 900) {
            $('nav h1').text(h2Text);
        } else {
            $('nav h1').text(newText);
        }
    }

    // بار اول برای تنظیم متن صحیح بر اساس سایز صفحه
    updateNavText();

    // اضافه کردن رویداد resize برای به روزرسانی متن در صورت تغییر سایز صفحه
    $(window).resize(function() {
        updateNavText();
    });

    // بارگذاری محتوای فایل menubar.html به داخل div با کلاس container
    $.ajax({
        url: 'menubar.html',
        method: 'GET',
        success: function(data) {
            $('.container').prepend(data);
        },
        error: function(error) {
            console.error("Error loading menubar:", error);
        }
    });

    // Load footer and then execute additional scripts
    $.ajax({
        url: 'footer.html',
        method: 'GET',
        success: function(response) {
            // اضافه کردن محتوای فوتر به صفحه اصلی
            $('body').append(response);
            
            // دستوراتی که بعد از لود شدن فوتر باید اجرا شوند
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
        error: function(error) {
            console.error('Error loading footer:', error);
        }
    });

    // پیاده‌سازی اسکریپت جاوااسکریپت برای منوی باز و بسته شدن
    $(document).on('click', '.open', function() {
        $('.open').toggleClass('active');
        $('.close').toggleClass('active');
        $('.menu-list').toggleClass('active');
        $('.content').toggleClass('active');
    });

    $(document).on('click', '.close', function() {
        $('.close').toggleClass('active');
        $('.open').toggleClass('active');
        $('.menu-list').toggleClass('active');
        $('.content').toggleClass('active');
    });

    // اسکریپت برای اسکرول به عناوین بدون قرارگیری زیر هدر
    const headerOffset = $('.menu').outerHeight(); // ارتفاع هدر را بگیرید

    $('a[href^="#"]').click(function(event) {
        event.preventDefault();
        const targetId = $(this).attr('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const targetPosition = $(targetElement).offset().top - headerOffset;
            $('html, body').animate({
                scrollTop: targetPosition
            }, 750);
        }
    });
});
