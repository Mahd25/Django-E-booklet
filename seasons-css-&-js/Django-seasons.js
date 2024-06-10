$(document).ready(function() {
    // 1. اضافه کردن تگ nav به ابتدای body
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

    // 2. بارگذاری محتوای فایل menubar.html به داخل div با کلاس container
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

    // add footer to end body
    $.ajax({
        url: 'footer.html',
        method: 'GET',
        success: function(response) {
            // اضافه کردن محتوای فوتر به صفحه اصلی
            $('body').append(response);
        },
        error: function(error) {
            console.error('Error loading footer:', error);
        }
    });

    // 3. پیاده‌سازی اسکریپت جاوااسکریپت
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
});

