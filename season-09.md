## فصل نهم: اپلیکیشن شبکه اجتماعی (بخش دوم)

### لایک پست ها با AJAX و رابطه M2M

رابطه Many To Many یا چند به چند حالتی است که دو مدل متصل به هم به صورت چندتایی باهم ارتباط دارند.

برای مثال یک کاربر میتواند چندین پست را لایک کند؛ از طرفی هر پست میتواند توسط تعداد زیادی کاربر لایک شود بنابراین رابطه بین post و user برای فیلد لایک ها از نوع m2m میباشد.

> در رابطه m2m  فرقی نمیکند که فیلد را در کدام مدل ایجاد کنیم؛ چون هردو مدل چندتایی هستند، با توجه به کاربرد میتوان در هر یک از مدل ها فیلد را ایجاد کرد.

در مدل Post یک فیلد برای لایک ها ایجاد میکنیم.

> در این فیلد؛ کاربرانی که پست را لایک میکنند قرار میگیرند.

`app directory/models.py`

```python
from taggit.managers import TaggableManager


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_posts')
    description = models.TextField()
    # date
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    # tags field
    tags = TaggableManager()

    # likes field
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)


    # ordering & indexing
    class Meta:
        ordering = ['-created']
        indexes = [
            models.Index(fields=['-created']),
            models.Index(fields=['-total_likes']),
        ]

    def __str__(self):
        return self.description
```

> دستورات makemigrations و migrate فراموش نشه!

وقتی برای یک فیلد از رابطه m2m استفاده میکنیم، جنگو در پشت صحنه یک جدول میانجی ایجاد میکند، و primary key یا id هر کدام از آن مدل ها را در آن جدول قرار میدهد.

> فرض کنیم متغیر post یک پست انتخابی و متغیر user یکی از کاربران وبسایت میباشد.
>
> > <span class="en-text">post.likes.all()</span>
>
> کد بالا؛ **کاربرانی** که این پست را لایک کرده اند برمیگرداند.
>
> > <span class="en-text">user.liked_posts.all()</span>
>
> این کد؛ **پست هایی** که این کاربر لایک کرده است را برمیگرداند.

فیلدهای m2m برای ما یک manager فراهم میکنند که میتوانیم از متدهایی مثله <span class="en-text">all()</span> استفاده کرده تا تمام آبجکت ها را بدست بیاوریم. / البته متدهای دیگری مثله <span class="en-text">add()</span> , <span class="en-text">remove()</span> نیز دارد.

> **ajax** مخفف: Asynchronous JavaScript and XML میباشد.
>
> کاربرد ajax jquery: در برخی جاها لازم داریم که فقط بخشی از صفحه را reload کنیم؛ مثلا در تغییر تعداد لایک ها، تغییر تعداد محصولات در سبد خرید(با کلیک روی دکمه افزودن به سبد خرید).
>
> در این موارد ajax کمک میکند تا فقط همان بخش از صفحه reload شود نه کل صفحه!

**ایجاد URL برای لایک کردن:**

`app directory/urls.py`

```python
urlpatterns = [
    path('like-post/', views.like_post, name='like_post'),
]
```

> **نکته اضافه:** با استفاده از url، فرم ها در تمپلیت و ajax میتوانیم، اطلاعاتی را به view ارسال کنیم.

**ایجاد view برای لایک کردن:**

برای view لایک پست ها، از چند دکوراتور استفاده میکنیم:

> login_required: برای لایک کردن پست ها کاربر را الزام به لاگین میکند.
>
> login_required: این دکوراتور مشخص میکند که این view فقط با متد post کار میکند و نمیتواند متد get داشته باشد.

این دکوراتورها باید ایمپورت شوند.

```python
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import JsonResponse


@login_required
@require_POST
def like_post(request):
    post_id = request.POST.get('post_id')

    if post_id is not None:
        post = get_object_or_404(Post, id=post_id)
        user = request.user

        if user in post.likes.all():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True

        post_likes_count = post.likes.count()

        response_data = {
            'liked': liked,
            'likes_count': post_likes_count,
        }
    else:
        response_data = {'error': 'Invalid post_id'}

    return JsonResponse(response_data)
```

**توضیحات:**

**نکته مهم:** این view زمانی اجرا میشود که کاربر روی **دکمه لایک❤️**، کلیک کند.

همان طور که در نکته اضافه گفته شد، از طریق ajax میتوان داده هایی را به view ارسال کرد؛ و چون view را ملزم به متد POST کرده ایم با استفاده از **request.POST** داده ها را دریافت میکنیم.

1- با استفاده از دستور request.POST آیدی پست(post_id) را که از تمپلیت ارسال شده، دریافت کرده و در متغیر post_id ذخیره میکنیم.

2- حالا یک شرط مشخص میکنیم که اگر post_id وجود داشت؛ با استفاده از آن id، پست مربوطه را از دیتابیس دریافت کن و آنرا در یک متغیر ذخیره کن. / کاربر فعلی را هم در یک متغیر ذخیره میکنیم.

> > <span class="en-text">post.likes.all()</span>
>
> کد بالا؛ **کاربرانی** که این پست را لایک کرده اند برمیگرداند. / لیستی از کاربرانی که این پست را لایک کرده اند.

3- حالا اگر کاربر فعلی جزء این لیست باشد؛ یعنی قبلا پست را لایک کرده و الآن قصد دارد آنرا unlike کند، بنابراین کاربر را با استفاده از متد <span class="en-text">remove()</span> از آن لیست حذف میکنیم.

- یک متغیر بنام liked ایجاد کرده و مقدار آنرا False مشخص میکنیم. / به این معنی که که کاربر ، پست را unlike کرده است؛ بنابراین از آن در تمپلیت استفاده میکنیم تا وضعیت دکمه لایک را تغییر دهیم.

4- حالا اگر کاربر جزء آن لیست نبود یعنی قصد دارد پست را لایک کند؛ بنابراین با متد <span class="en-text">add()</span> وی را به لیست کاربران لایک کرده، اضافه میکنیم.

- حالا این بار مقدار متغیر liked را True مشخص میکنیم.

5- یک متغیر بنام post_likes_count ایجاد کرده و تعداد کاربرانی که پست را لایک کرده در آن ذخیره میکنیم. / تعداد لایک ها را نشان میدهد.

6- متغیر liked و post_likes_count را به صورت دیکشنری(json) در متغیر response_data ذخیره میکنیم تا آنها را به عنوان json به تمپلیت ارسال کنیم.

7- چنانچه post_id وجود نداشته باشد یک ارور نمایش میدهیم.

در view های قبلی برای تمپلیت؛ یا یک صفحه ای را رندر میکردیم و داده هایی را به آن ارسال میکردیم یا عبارتی را با HttpResponse در تمپلیت نمایش میدادیم ولی حالا میخواهیم json ارسال کنیم، بنابراین از JsonResponse استفاده میکنیم.

8- برای ارسال json به تمپلیت، از JsonResponse استفاده کرده و عبارت json را به عنوان آرگومان برایش مشخص میکنیم. / لازم است آنرا ایمپورت کنیم.

**بریم سراغ تمپلیت:**

لایک ها در تمپلیت post_detail نمایش داده میشوند بنابراین لازم است تغییراتی در آن ایجاد کنیم.

> **نکته:** با استفاده از اتریبیوت data-name برای هر تگ در html، میتوان داده هایی را ارسال کنیم.
>
> > <span class="en-text"><div class="post" data-post-id="{{ post.id }}"\></div\></span>

`templates/social/post_detail.html`

```jinja
<div class="post" data-post-id="{{ post.id }}">
    {{ post.description | truncatewords:20 | linebreaks }}

    published at {{ post.created }} by {{ post.author }}

    <button class="like-button">
        {% if request.user in post.likes.all %}
            UnLike
        {% else %}
            Like
        {% endif %}
    </button>
    <br>

    <span class="likes-count">{{ post.likes.count }}</span> Likes
</div>

<br>

{% for tag in post.tags.all %}
    <a href="{% url 'social:post_list_tags' tag.slug %}">{{ tag.name }}</a>
    
    {% if not forloop.last %}, {% endif %} 
{% endfor %}

<h2>Similar Posts</h2>

{% for post in similar_posts %}
    <p>
        <a href="{% url 'social:post_detail' post.id %}">
            {{ post.description | truncatewords:10 | linebreaks }}
        </a>
    </p>
{% empty %}
    There are no similar posts!
{% endfor %}
```

**توضیحات:**

1- یک تگ div با کلاس post ایجاد کرده و برایش اتریبیوت **data-post-id** با مقدار **post.id** را مشخص میکنیم. / تا بتوانیم آیدی پست را به کمک ajax به view ارسال کنیم.

- محتوای پست (description و create-date) را در این div قرار میدهیم.

- داخل این div یک دکمه برای لایک کردن ایجاد میکنیم.

2- اولین بار که صفحه لود میشود، هنوز view فراخوانی نشده است(چون روی دکمه لایک کلیک نشده) باید وضعیت فعلی دکمه را متوجه شویم بنابراین باید بفهمیم که user قبلا پست را لایک کرده یا نه!

> اگر لایک کرده پس دکمه لایک باید UnLike را نشان دهد.
>
> و اگر هنوز لایک نکرده باید Like نشان داده شود.

**حالا چطور بفهمیم؟!**

داخل بدنه تگ button، یک شرط مشابه با شرطی که در view ها نوشتیم  اینجا هم استفاده میکنیم. / شرطی که بررسی میکند کاربر قبلا، پست را لایک کرده یا نه!!!

3- از یک تگ span هم برای نمایش تعداد لایک ها استفاده میکنیم.

**خب بریم سراغ ساختار ajax:**

**نکته مهم:** برای اینکه کد ajax که مینویسیم کار کند؛ لازم است اسکریپت ajax jquery را به تمپلیت خود اضافه کنیم. / در غیر این صورت کد ajax کار نخواهد کرد.

> در مرورگر خود عبارت cdnjquery را سرچ کرده و از سایت cdnjs اسکریپت اول را کپی کرده و به انتهای تمپلیت اضافه کنید. / [ajax-jquery](https://cdnjs.com/libraries/jquery)

**حالا یک تگ script ایجاد کرده و کد ajax را داخل آن مینویسیم:**

`templates/social/post_detail.html`

```jinja
<div class="post" data-post-id="{{ post.id }}">
    {{ post.description | truncatewords:20 | linebreaks }}

    published at {{ post.created }} by {{ post.author }}

    <button class="like-button">
        {% if request.user in post.likes.all %}
            UnLike
        {% else %}
            Like
        {% endif %}
    </button>
    <br>

    <span class="likes-count">{{ post.likes.count }}</span> Likes
</div>

<br>

{% for tag in post.tags.all %}
    <a href="{% url 'social:post_list_tags' tag.slug %}">{{ tag.name }}</a>
    
    {% if not forloop.last %}, {% endif %} 
{% endfor %}

<h2>Similar Posts</h2>

{% for post in similar_posts %}
    <p>
        <a href="{% url 'social:post_detail' post.id %}">
            {{ post.description | truncatewords:10 | linebreaks }}
        </a>
    </p>
{% empty %}
    There are no similar posts!
{% endfor %}

<!-- ---------------- ajax structure ---------------- -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script>
    $(document).ready(function (){
        $('.like-button').click(function (){
            let post_id = $(this).closest('.post').data('post-id');
            let button = $(this);
            
            $.ajax({
                type: 'POST',
                url: "{% url 'social:like_post' %}",
                data: {'post_id': post_id, 'csrfmiddlewaretoken': '{{ csrf_token }}'},
                success: function(response){
                    if (response.liked){
                        button.text('UnLike');
                    }else{
                        button.text(' Like');
                    }
                    $('.likes-count').text(response.likes_count);
                },
            })
        })
    })
    
</script>
```

**توضیحات:**

علامت $ مربوط به ساختار jquery میباشد.

1- با استفاده از <span class="en-text">$(document)</span> می‌توانید به عناصر HTML دسترسی پیدا کنید و عملیات مختلفی روی آن‌ها انجام دهید.

2- تابع ready در jquery یک event هست که برای اعلام آماده بودن صفحه و  اینکه مشخص کند صفحه به طور کامل بارگذاری شده استفاده میشود.

> > <span class="en-text">$('.class_name')</span> => <span class="en-text">$('.post')</span>
> >
> > <span class="en-text">$('#id_name')</span> => <span class="en-text">$("#test-text")</span>
> >
> > <span class="en-text">$('element_name')</span> => <span class="en-text">$("p")</span>
>
> در jquery با استفاده از ساختاری مثله  نمونه کدهای بالا یک عنصر(تگ) را با استفاده از کلاس ، آیدی و یا اسم آن تگ انتخاب کرده تا عملیاتی روی آن انجام دهیم.

3- تگ button را با استفاده از کلاس آن انتخاب کرده؛ و مشخص میکنیم وقتی روی آن کلیک شد یکسری اتفاقات صورت بگیرد.

- چون داخل function مربوط به button هستیم، <span class="en-text">$(this)</span> به button اشاره میکند.

- با متد closest نزدیک ترین عنصر به تگ button را که کلاس post دارد انتخاب میکنیم؛ حالا مقداری که در اتریبیوت **data** با اسم **post-id** ذخیره شده را دریافت میکنیم، و آنرا در متغیری بنام post_id ذخیره میکنیم.

**4- بریم سراغ ajax:**

4-1 ***type:*** نوع متد برای ارسال داده ها را مشخص میکنیم.

4-2 ***url:*** آدرسی که قرار است اطلاعات به view آن ارسال شوند را مشخص میکنیم.

4-3 ***data:*** اطلاعاتی که قرار است به view ارسال شوند در data مشخص میشوند. / در اینجا post_id ارسال میشود.

- چون مشخص کردیم که متد post هست باید csrf_token را هم ارسال کنیم.

4-4 ***success:*** تابع success یک callback است که زمانی که درخواست ajax با موفقیت انجام می‌شود، فراخوانی می‌شود. این تابع داده‌های دریافتی از سمت سرور(view) را به عنوان ورودی دریافت می‌کند و شما می‌توانید این داده‌ها را در بدنه تابع پردازش کنید.

- داخل بدنه تابع success، کارهایی که پس از کلیک روی دکمه لایک باید صورت بگیرند را مشخص میکینیم. / تغییر وضعیت نوشته روی دکمه لایک و یا رنگ آیکون قلب.

> در اینجا post_id را با استفاده از اتریبیوت data دریافت کردیم ولی نیازی به آن نبود و میتوانستیم مستقیما آنرا در ajax مشخص کنیم.    



> **خلاصه ای از توضیحات بالا و تابع error:**
>
> url آدرس URL‌ای است که درخواست به آن ارسال می‌شود.
>
> type نوع درخواست (GET, POST و غیره) را مشخص می‌کند.
>
> data داده‌هایی است که به سرور ارسال می‌شود.
>
> success تابعی است که در صورت موفقیت‌آمیز بودن درخواست فراخوانی می‌شود. داده‌های پاسخ از سرور به عنوان آرگومان response به این تابع ارسال می‌شوند و شما می‌توانید این داده‌ها را در داخل تابع پردازش کنید.
>
> error تابعی است که در صورت بروز خطا در درخواست فراخوانی می‌شود.

5- تگ span که تعداد لایک ها را نشان میدهد، را با مقدار (likes_count) که از view دریافت کرده ایم آپدیت میکنیم.

### بار‌گذاری بیشتر پست ها با AJAX (صفحه بندی)

میخواهیم به کمک ajax با استفاده از دکمه نمایش بیشتر پست ها را نمایش دهیم.

**ساختار صفحه بندی را برای لیست پست ها پیاده سازی میکنیم:**

`app directory/views.py`

```python
from taggit.models import Tag
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


def post_list(request, tag_slug=None):
    tag = None
    posts = Post.objects.all()

    if tag_slug:
        tag = get_object_or_404(Tag, slug=tag_slug)
        posts = Post.objects.filter(tags__in=[tag])

    # صفحه بندی برای پست ها
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    
    try:
        posts = paginator.page(page_number)
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = []

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'social/list_ajax.html', {"posts": posts})

    return render(request, 'social/post_list.html', {'posts': posts, 'tag': tag})
```

> برای EmptyPage این بار یک لیست خالی قرار میدهیم، تا به کاربر اعلام کنیم دیگر پستی جهت نمایش وجود ندارد.

وقتی روی دکمه **نمایش بیشتر** کلیک کنیم کد ajax فراخوانی میشه؛ حالا برای اینکه در view متوجه شویم request ما ajax هست یا نه! از یک شرط استفاده میکنیم.

**توضیحات:**

> <span class="en-text">request.headers.get('x-requested-with'):</span>

این خط بررسی می‌کند که آیا درخواست ارسال شده یک درخواست Ajax است یا نه. در درخواست‌های Ajax، مرورگر به صورت خودکار هدر x-requested-with را با مقدار XMLHttpRequest تنظیم می‌کند. بنابراین، با بررسی این هدر، می‌توان متوجه شد که آیا درخواست از طریق Ajax ارسال شده است یا خیر.

> <span class="en-text">if request.headers.get('x-requested-with') == 'XMLHttpRequest':</span>

این شرط بررسی می‌کند که اگر مقدار هدر x-requested-with برابر با XMLHttpRequest باشد، یعنی درخواست از طریق Ajax ارسال شده است. اگر این شرط درست باشد، کد داخل بلوک if اجرا می‌شود.

> حالا داخل بدنه شرط، تمپلیتی که قرار است پست های اضافی را به صورت بارگذاری بیشتر نمایش دهد؛ رندر میگیریم.

**ایجاد تمپلیت list_ajax.html:**

پست های اضافی تر که لود میشوند را در این تملیت نمایش میدهیم.

حلقه ای که پست ها را نشان  میدهد را از تمپلیت post_list کپی کرده و در این تمپلیت جایگذاری میکنیم.

`templates/social/list_ajax.html`

```jinja
{% for post in posts %}

    <!-- لینک انتقال به صفحه جزئیات پست -->
    <a href="{% url 'social:post_detail' post.id %}">
        {{ post.description | truncatewords:20 | linebreaks }}
    </a>

    published at {{ post.created }} by {{ post.author }}
    <br>
    
    {% for tag in post.tags.all %}
        <a href="{% url 'social:post_list_tags' tag.slug %}">{{ tag.name }}</a>
        
        {% if not forloop.last %}, {% endif %} 
    {% endfor %}

{% empty %}
    there are no posts!!! 
    <br><br>
{% endfor %}
```

**توضیحات:**

تمپلیت تگ {% empty %} را به حلقه اضافه میکنیم تا زمانیکه پست ها به انتها رسیدند، به کاربر اعلام کند "دیگر پستی وجود ندارد".

**بریم سراغ تمپلیت post_list:**

1 -یک تگ div با <span class="en-text">id="post-list"</span> ایجاد کرده و محتوای پست؛ (توضیحات، تاریخ ایجاد و تگ های پست) را در آن قرار میدهیم.

2- یک دکمه برای **بارگذاری بیشتر** خارج از تگ div، ایجاد میکنیم.

`templates/social/post_list.html`

```jinja
{% if tag %}
    <h2>posts tagged with {{ tag.name }}</h2>
{% endif %} 

<div id="post-list">
    {% for post in posts %}

        <!-- لینک انتقال به صفحه جزئیات پست -->
        <a href="{% url 'social:post_detail' post.id %}">
            {{ post.description | truncatewords:20 | linebreaks }}
        </a>

        published at {{ post.created }} by {{ post.author }}
        <br>
        
        {% for tag in post.tags.all %}
            <a href="{% url 'social:post_list_tags' tag.slug %}">{{ tag.name }}</a>
            
            {% if not forloop.last %}, {% endif %} 
        {% endfor %}

        <br>
        <hr>
    {% endfor %}
</div>

<button id="load-more">More</button>
```

> از این div استفاده میکنیم تا پست های بعدی را به انتهای آن اضافه کنیم.

**بریم سراغ ajax:**

اضافه کردن اسکریپت ajax jquery فراموش نشه!!!

`templates/social/post_list.html`

```jinja
{% if tag %}
    <h2>posts tagged with {{ tag.name }}</h2>
{% endif %} 

<div id="post-list">
    {% for post in posts %}

        <!-- لینک انتقال به صفحه جزئیات پست -->
        <a href="{% url 'social:post_detail' post.id %}">
            {{ post.description | truncatewords:20 | linebreaks }}
        </a>

        published at {{ post.created }} by {{ post.author }}
        <br>
        
        {% for tag in post.tags.all %}
            <a href="{% url 'social:post_list_tags' tag.slug %}">{{ tag.name }}</a>
            
            {% if not forloop.last %}, {% endif %} 
        {% endfor %}

        <br>
        <hr>
    {% endfor %}
</div>

<button id="load-more">More</button>

<!-- ------------- ajax structure ------------- -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script>
    $(document).ready(function(){
        let page = 2;
        $('#load-more').click(function (){
            $.ajax({
                type: 'GET',
                url: '{% if tag %}{% url 'social:post_list_tags' tag.slug %}{% else %}{% url 'social:post_list' %}{% endif %}' + '?page=' + page,
                dataType: 'html',
                success: function (response){
                    $('#post-list').append(response);
                    page += 1;
                }
            })
        })
    })
</script>
```

**توضیحات:**

> برای اولین بار که صفحه لود میشود پست های صفحه اول نمایش داده میشوند، بنابراین یک متغیر بنام page ایجاد کرده و مقدار 2 را برایش ست میکنیم؛ از آن استفاده میکنیم تا وقتی روی دکمه  **بارگذاری بیشتر** کلیک شد پست های صفحه 2 را نمایش دهیم و مقدارش را هر بار یکی بیشتر میکنیم تا محتوای صفحات بعدی را به ترتیب نمایش دهیم.

1- تعریف متغیر page = 2:
یک متغیر به نام page تعریف کرده ایم که با مقدار اولیه ۲ تنظیم شده است. این متغیر برای نگهداری شماره صفحه‌ای که باید بارگذاری شود، استفاده می‌شود.

2- دکمه **بارگذاری بیشتر** را انتخاب کرده و مشخص میکنیم وقتی روی آن کلیک شد ajax اجرا شود.

3- **<span class="en-text">$.ajax({ ... })</span>**: این بخش یک درخواست Ajax را آغاز می‌کند.

4- **type**: نوع درخواست Ajax را مشخص می‌کند که در اینجا از نوع GET است.

> چون فقط پست ها را لود میکنیم، متد را get مشخص میکنیم.

5- **url:** آدرس(URL) ی که درخواست Ajax به آن ارسال می‌شود را تعیین می‌کند.

- برای لیست پست ها دو url داریم، و باید از هردو url در ajax استفاده کنیم؛ برای همین از شرط استفاده میکنیم.

    - اگر متغیر `tag` وجود داشته باشد، از URL(آدرس) `social:post_list_tags` با `tag.slug` استفاده می‌کند.
    - در غیر این صورت، از URL(آدرس) `social:post_list` استفاده می‌کند.

- چون صفحه بندی داریم؛ باید انتهای  URL مشخص شده، **page** اضافه شود.

> > <span class="en-text">URL + '?page=' + page</span>
>
> این page که در انتهای کد بالا نوشته شده همان متغیری است که ایجاد کردیم.

6- **dataType:** نوع داده‌ای که از سرور انتظار می‌رود به عنوان پاسخ دریافت شود، مشخص می‌کند که در اینجا HTML است.

7- **success:** این تابع زمانی اجرا می‌شود که درخواست Ajax با موفقیت انجام شود.

- پارامتر `response` حاوی داده‌های HTML دریافت شده از سرور(view) است.

8- **<span class="en-text">$('#post-list').append(response)</span>**: محتوای HTML دریافت شده (response) به عنصر با <span class="en-text">(id="post-list")</span> همان تگ div اضافه می‌شود.

9- **page += 1**: شماره صفحه را یک واحد افزایش می‌دهد تا در درخواست بعدی صفحه بعدی بارگذاری شود.

### ذخیره پست ها با AJAX

ذخیره پست ها مشابه با لایک پست ها انجام میشود./ فیلد ذخیره پست ها از نوع m2m میباشد.

**1- در مدل Post یک فیلد برای ذخیره پست ها ایجاد میکنیم:**

`app directory/models.py`

```python
from taggit.managers import TaggableManager


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_posts')
    description = models.TextField()
    # date
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    # tags field
    tags = TaggableManager()

    # likes field
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)
    # saved field
    saved_by = models.ManyToManyField(User, related_name="saved_posts", blank=True)


    # ordering & indexing
    class Meta:
        ordering = ['-created']
        indexes = [
            models.Index(fields=['-created']),
            models.Index(fields=['-total_likes']),
        ]

    def __str__(self):
        return self.description
```

**2- ایجاد URL برای ذخیره پست ها:**

`app directory/urls.py`

```python
urlpatterns = [
    path('save-post/', views.save_post, name='save_post'),
]
```

**3- ایجاد view برای ذخیره پست ها:**

`app directory/views.py`

```python
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import JsonResponse


@login_required
@require_POST
def save_post(request):
    post_id = request.POST.get('post_id')

    if post_id is not None:
        post = get_object_or_404(Post, id=post_id)
        user = request.user

        if user in post.saved_by.all():
            post.saved_by.remove(user)
            saved = False
        else:
            post.saved_by.add(user)
            saved = True

        return JsonResponse({'saved': saved})

    return JsonResponse({'error': 'Invalid request'}) 
```

**4- تغییر تمپلیت post_detail برای ذخیره پست ها:**

مثله دکمه لایک کردن، یک دکمه برای ذخیره پست ها اضافه میکنیم.

> برای اولین بار که صفحه لود میشود باید مشخص کنیم که save و یا unsave را به کاربر نشان دهد، پس یک شرط مشخص میکنیم.

`templates/social/post_detail.html`

```jinja
<div class="post" data-post-id="{{ post.id }}">
    {{ post.description | truncatewords:20 | linebreaks }}

    published at {{ post.created }} by {{ post.author }}

    <!-- ------------ like button ------------ -->
    <button class="like-button">
        {% if request.user in post.likes.all %}
            UnLike
        {% else %}
            Like
        {% endif %}
    </button>
    <br>

    <span class="likes-count">{{ post.likes.count }}</span> Likes

    <br><br>
    <!-- ------------ save button ------------ -->
    <button class="save-button">
        {% if request.user in post.saved_by.all %}
            UnSave
        {% else %}
            Save
        {% endif %}
    </button>
</div>

<br>

{% for tag in post.tags.all %}
    <a href="{% url 'social:post_list_tags' tag.slug %}">{{ tag.name }}</a>
    
    {% if not forloop.last %}, {% endif %} 
{% endfor %}

<h2>Similar Posts</h2>

{% for post in similar_posts %}
    <p>
        <a href="{% url 'social:post_detail' post.id %}">
            {{ post.description | truncatewords:10 | linebreaks }}
        </a>
    </p>
{% empty %}
    There are no similar posts!
{% endfor %}

<!-- ---------------- ajax structure ---------------- -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script>
    $(document).ready(function (){
        $('.like-button').click(function (){
            let post_id = $(this).closest('.post').data('post-id');
            let button = $(this);
            
            $.ajax({
                type: 'POST',
                url: "{% url 'social:like_post' %}",
                data: {'post_id': post_id, 'csrfmiddlewaretoken': '{{ csrf_token }}'},
                success: function(response){
                    if (response.liked){
                        button.text('UnLike');
                    }else{
                        button.text(' Like');
                    }
                    $('.likes-count').text(response.likes_count);
                },
            })
        })
    })
    
</script>
```

**5- ساختار ajax، برای ذخیره پست ها:**

کد ajax مربوط به ذخیره پست ها را کنار کد ajax لایک پست ها ایجاد میکنیم.

`templates/social/post_detail.html`

```jinja
<div class="post" data-post-id="{{ post.id }}">
    {{ post.description | truncatewords:20 | linebreaks }}

    published at {{ post.created }} by {{ post.author }}

    <!-- ------------ like button ------------ -->
    <button class="like-button">
        {% if request.user in post.likes.all %}
            UnLike
        {% else %}
            Like
        {% endif %}
    </button>
    <br>

    <span class="likes-count">{{ post.likes.count }}</span> Likes

    <br><br>
    <!-- ------------ save button ------------ -->
    <button class="save-button">
        {% if request.user in post.saved_by.all %}
            UnSave
        {% else %}
            Save
        {% endif %}
    </button>
</div>

<br>

{% for tag in post.tags.all %}
    <a href="{% url 'social:post_list_tags' tag.slug %}">{{ tag.name }}</a>
    
    {% if not forloop.last %}, {% endif %} 
{% endfor %}

<h2>Similar Posts</h2>

{% for post in similar_posts %}
    <p>
        <a href="{% url 'social:post_detail' post.id %}">
            {{ post.description | truncatewords:10 | linebreaks }}
        </a>
    </p>
{% empty %}
    There are no similar posts!
{% endfor %}

<!-- ---------------- ajax structure ---------------- -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script>
    $(document).ready(function (){
        $('.like-button').click(function (){
            let post_id = $(this).closest('.post').data('post-id');
            let button = $(this);
            
            $.ajax({
                type: 'POST',
                url: '{% url 'social:like_post' %}',
                data: {'post_id': post_id, 'csrfmiddlewaretoken': '{{ csrf_token }}'},
                success: function(response){
                    if (response.liked){
                        button.text('UnLike');
                    }else{
                        button.text(' Like');
                    }
                    $('.likes-count').text(response.likes_count);
                }
            })
        })

        $('.save-button').click(function (){
            let button = $(this);
            $.ajax({
                type: 'POST',
                url: '{% url 'social:save_post' %}',
                data: {'csrfmiddlewaretoken': '{{ csrf_token }}', 'post_id': {{ post.id }}},
                success: function(response){
                    if (response.saved){
                        button.text('UnSave');
                    }else{
                        button.text('Save');
                    }
                },
                error: function (error) {
                    console.log("Error sending ajax request: " + error);
                }
            })
        }) 
    })
    
</script>
```

با استفاده از تابع error؛ در صورت وجود ارور، خطا در console نمایش داده میشود.

**6- نمایش پست های ذخیره شده در صفحه profile:**

**ایجاد view برای صفحه profile:**

`app directory/views.py`

```python
def profile(request):
    user = request.user
    saved_posts = user.saved_posts.all()

    context = {
        "saved_posts": saved_posts,
    }

    return render(request, "social/profile.html", context=context)
```

**ایجاد تمپلیت برای profile:**

`templates/social/profile.html`

```jinja
<h2>Saved Posts for you</h2>

{% for post in saved_posts %}
    {{ post.description | truncatewords:20 | linebreaks }}

    published at {{ post.created }} by {{ post.author }}
{% endfor %}
```

### ایجاد مدل واسط برای فیلد M2M

همان طور که قبلا گفته شد، وقتی فیلد M2M ایجاد کنیم جنگو یک جدول میانی شامل id از هر دو جدول ایجاد میکند.

> مثلا در لایک کردن مشخص میکند که پستی توسط چه افرادی لایک شده و یا یک کاربر چه پست هایی را لایک کرده است.

حالا بعضی مواقع لازمه یکسری اطلاعات اضافی تر مثله تاریخ، برای فیلد های M2M داشته باشیم؛ بنابراین جدول واسط را خودمان با اطلاعات اضافی شخصی سازی میکنیم.

**ایجاد جدول واسط:**

هرجا لازم داشتیم یک رابطه M2M داشته باشیم، چه بین دو مدل(مثل post و user) و یا بین یک مدل(مثل user)؛ یک مدل به عنوان جدول واسط ایجاد کرده و هر فیلد را به مدل خودش با ForeignKey متصل میکنیم.(برای هر مدل یک رابطه ForeignKey)

> همان طور که میدانیم در جنگو جداول همان مدل ها هستند، پس برای جدول واسط یک مدل ایجاد میکنیم.

`app directory/models.py`

```python
class Contact(models.Model):
    # کسی که فالو میکنه
    user_from = models.ForeignKey(User, related_name='user_from_set', blank=True, on_delete=models.CASCADE)
    # کسی که فالو میشه
    user_to = models.ForeignKey(User, related_name='user_to_set', blank=True, on_delete=models.CASCADE)

    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']
        indexes = [models.Index(fields=['-created'])]

    def __str__(self):
        return f'{self.user_from} follows {self.user_to}'
```

ما یک مدل User داریم ولی برای عملیات فالو/آنفالو دو کاربر داریم؛ یکی کاربری که فالو میکند و دومی کاربری که فالو میشود، پس در مدل واسط دو بار به مدل User ForeignKey میزنیم.

> یک فیلد برای کاربر فالو کننده ایجاد کرده؛ و با ForeignKey آنرا به مدل User متصل میکنیم.
>
> یک فیلد برای کاربر فالو شده ایجاد کرده؛ و با ForeignKey آنرا به مدل User متصل میکنیم.
>
> برای درک بهتر این روابط فرض کنید دو مدل برای کاربران دارید، یکی برای following و دیگری برای followers.

دستورات makemigrations و migrate فراموش نشه!!!

**تغییر مدل User:**

حالا برای مدل User یک فیلد M2M بنام following ایجاد میکنیم.

`app directory/models.py`

```python
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    profile_image = models.ImageField(upload_to='profile_images', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    job = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=11, blank=True, null=True)

    following = models.ManyToManyField("self", through='Contact', related_name='followers', symmetrical=False)

    class Meta:
        ordering = ['-username']
        indexes = [models.Index(fields=['-username'])]

    def __str__(self):
        return self.username
```

**توضیحات:**

1- در عملیات فالو کردن ارتباط بین دو کاربر هست؛ بنابراین فیلد following باید به خود مدل User متصل شود، پس "self" را برایش مشخص میکنیم.

2- حالا باید جدول واسط(Contact) ایجاد شده را برایش مشخص کنیم؛ برای این کار از آرگومان through استفاده کرده و اسم آن مدل را برایش مینویسیم.

> **نکته:** اگر از اسم مدلی استفاده میکنیم که در پایین تر تعریف شده است برای اینکه آنرا بشناسد و خطایی نگیرد، اسم مدل را در کوتیشن مینویسیم.

3- اسم related_name باید برعکس باشه(اسم فیلد following هستش، پس اسم related_name باید followers باشد)؛ چون با فیلد following، به لیست کاربران فالو کننده دسترسی داریم و با related_name به لیست کاربران فالو شده دسترسی داریم.

> <span class="en-text">user.following.all()</span>    
> <span class="en-text">user.followers.all()</span>

4- آرگومان symmetrical را False مشخص میکنیم؛    
 اگه True باشه رابطه متقارن صورت میگیره؛ اگر این آرگومان True باشه  وقتی کاربر1، کاربر2 رافالو کند، اتوماتیک از جانب کاربر2، کاربر1 را فالو میکند.

****نکته:** وقتی از جدول میانی شخصی سازی شده برای فیلد M2M استفاده کنیم، متدهای <span class="en-text">add()</span> و <span class="en-text">remove()</span> دیگر کار نخواهند کرد.**

#### اگر از مدل User، پیشفرض جنگو؛ استفاده کنیم چطور فیلد M2M را به آن اضافه کنیم؟!

1- برای این کار باید ماژول get_user_model را ایمپورت کنیم.

2- یک متغیر ایجاد کرده و ماژول ایمپورت شده را برایش مشخص میکنیم.

3- حالا برای آن متغیر از متد <span class="en-text">add_to_class()</span> استفاده میکنیم.

4- برای متد <span class="en-text">add_to_class()،</span> اولین مقدار اسم فیلد و مقدار دوم ساختاری است که برای فیلدها مینویسیم.

`app directory/models.py`

```python
from django.contrib.auth import get_user_model

user_model = get_user_model()
user_model.add_to_class("following", models.ManyToManyField("self", through='Contact', related_name='followers', symmetrical=False))
```

### کار با thumbnail (نمایش تصویر پروفایل)

**بهینه سازی تصاویر:** این بار میخواهیم با پکیج easy-thumbnails بهینه سازی تصاویر را انجام دهیم. / از آن میتوان هم در مدل ها و هم در تمپلیت استفاده کرد؛ در اینجا از آن در تمپلیت استفاده میکنیم.

> با استفاده از متد get_full_name برای کاربر میتوان اسم و فامیل کاربر را یکجا نمایش داد.

`templates/social/profile.html`

```jinja
user: {{ request.user.get_full_name }}
<br>
<hr>


<h2>Saved Posts for you</h2>
{% for post in saved_posts %}
    {{ post.description | truncatewords:20 | linebreaks }}

    published at {{ post.created }} by {{ post.author }}
{% endfor %}
```

**نصب پکیج easy-thumbnails:**

1- نصب ماژول:

`Terminal`

```terminal
pip install easy-thumbnails
```

2- اضافه کردن easy-thumbnails به اپ های پروژه در settings.py:

`project directory/settings.py`

```python
INSTALLED_APPS = [
    # ...
    'easy_thumbnails',
]
```

3- از متغیر THUMBNAIL_DEBUG در تنظیمات استفاده میکنیم، تا اگر خطایی داشت به ما نشان دهد.

`project directory/settings.py`

```python
THUMBNAIL_DEBUG = True
```

4- دستور makemigrations و migrate فراموش نشه!!!

**نمایش تصویر پروفایل کاربر:**

> برخی کاربرها ممکن است تصویر پروفایل نداشته باشند؛ بنابراین یک تصویر پیشفرض، در دایرکتوری static پروژه، قرار داده و برای کاربرانی که تصویر ندارند آنرا نمایش میدهیم، برای سایر کاربر ها هم تصویر آپلودی کاربر نمایش داده میشود.

`templates/social/profile.html`

```jinja
{% load thumbnail %}
{% load static %}

{% with user=request.user %}
    <p>user: {{ user.get_full_name }}</p>

    {% if user.profile_image %}
        <a href="{{ user.profile_image.url }}">
            <img src="{% thumbnail user.profile_image 100x100 quality=80 %}" alt="profile-image">
        </a>
    {% else %}
        <img src="{% static 'images/profile/avatar.png' %}" alt="avatar">
    {% endif %} 
{% endwith %}

<h2>Saved Posts for you</h2>
{% for post in saved_posts %}
    <a href="{% url 'social:post_detail' post.id %}">
        {{ post.description | truncatewords:20 | linebreaks }}
    </a>

    published at {{ post.created }} by {{ post.author }}
{% endfor %}
```

**توضیحات:**

1- برای استفاده از static و همچنین thumbnail لازمه آنها را در تمپلیت load کنیم.

2- برای جلوگیری از تکرار request.user با استفاده از تمپلیت تگ with یک متغیر ساخته و حالا از آن استفاده میکنیم.

3- برای نمایش تصویر پروفایل، شرط میگذاریم که اگر کاربر تصویر پروفایل داشت آنرا نمایش بده و در غیر این صورت تصویر پیشفرض را نمای بده.

- با استفاده از تمپلیت تگ thumbnail تنظیمات تصویر را مشخص میکنیم.

- از تمپلیت تگ thumbnail در src تگ img استفاده میکنیم.

    1. برای اولین مقدار آدرس فایل تصویر را مشخص میکنیم، اینجا دیگه از **متد url** استفاده نمیکنیم.

    2. برای تنظیم سایز تصویر از ساختار num1xnum2 استفاده میکنیم.(ایکس مابین اعداد نوشته میشود)

        > هرکدام را که صفر مشخص کنیم، باعث میشود در تغییر سایز تصویر، تناسب ابعاد آن تصویر حفظ شود.

    3. برای کیفیت تصویر هم از quality استفاده میکنیم.

### نمایش لیست کاربر ها

**ایجاد url برای لیست کاربرها:**

`app directory/urls.py`

```python
urlpatterns = [
    path('users/', views.user_list, name='user_list'),
]
```

**ایجاد view برای لیست کاربرها:**

`app directory/views.py`

```python
@login_required
def user_list(request):
    users = User.objects.filter(is_active=True)
    return render(request, 'user/user_list.html', {'users': users})
```

کاربرانی در لیست کاربران نمایش میدهیم که وضعیت فعال داشته باشند.(فیلد isactive=True باشد.)

**ایجاد تمپلیت برای لیست کاربرها:**

`templates/user/user_list.html`

```jinja
{% load thumbnail %}
{% load static %}

{% for user in users %}
    <!-- ---------  نمایش تصویر پروفایل  --------- -->
    {% if user.profile_image %}
        <a href="#">
            <img src="{% thumbnail user.profile_image 100x100 quality=80 %}" alt="profile-image">
        </a>
    {% else %}
        <a href="#">
            <img src="{% static 'images/profile/avatar.png' %}" alt="avatar">
        </a>
    {% endif %}

    <!-- ---------- نمایش اسم کاربر ---------- -->
    <a href="#"> {{ user.get_full_name }} </a><br><br>
{% endfor %}
```

> بجای # آدرس صفحه جزئیات کاربر را مشخص میکنیم.

### نمایش جزئیات کاربر

**ایجاد url برای صفحه جزئیات کاربر:**

`app directory/urls.py`

```python
urlpatterns = [
    path('users/<str:username>/', views.user_detail, name='user_detail'),
]
```

برای استفاده از url صفحه user_detail؛ برای مدل User متد get_absolute_url مشخص میکنیم:

`app directory/models.py`

```python
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.urls import reverse

class User(AbstractUser):
    profile_image = models.ImageField(upload_to='profile_images', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    job = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=11, blank=True, null=True)

    following = models.ManyToManyField("self", through='Contact', related_name='followers', symmetrical=False)

    class Meta:
        ordering = ['-username']
        indexes = [models.Index(fields=['-username'])]

    def get_absolute_url(self):
        return reverse('social:user_detail', kwargs={'username': self.username})

    def __str__(self):
        return self.username
```

**خب حالا چطور برای مدل User (پیشفرض جنگو) متد get_absolute_url مشخص کنیم؟!**

1- در settings.py یک متغیر بنام ABSOLUTE_URL_OVERRIDES ایجاد کرده و برای یک دیکشنری مشخص میکنیم.

2- key این دیکشنری، User پیشفرض جنگو و value آن یک تابع lambda میباشد.

3- u را به عنوان کاربری که از آن متد استفاده میکند برداشته و url را برای ما برمیگرداند.

- u نماینده همان کاربر هست و بجای self از آن استفاده میکنیم.

`project directory/settings.py`

```python
from django.urls import reverse_lazy

# ...

ABSOLUTE_URL_OVERRIDES = {
    'auth.user': lambda u: reverse_lazy('social:user_detail', args=[u.username]),
}
```

**خب دیگه! بریم سراغ view جزئیات کاربر:**

`app directory/views.py`

```python
@login_required
def user_detail(request, username):
    user = get_object_or_404(User, username=username, is_active=True)
    return render(request, 'user/user_detail.html', {'user': user})
```

**توضیحات:**

کاربر را با استفاده از username (که توسط url ارسال شده) بدست می آوریم. / البته آن کاربرانی که در وبسایت active باشند.

**در تمپلیت لیست کاربرها لینک صفحه جزئیات کاربر را برای تگ های a مشخص میکنیم.**

در اینجا از متد get_absolute_url استفاده میکنیم.

`templates/user/user_list.html`

```jinja
{% load thumbnail %}
{% load static %}

{% for user in users %}
    <!-- ---------  نمایش تصویر پروفایل  --------- -->
    {% if user.profile_image %}
        <a href="{{ user.get_absolute_url }}">
            <img src="{% thumbnail user.profile_image 100x100 quality=80 %}" alt="profile-image">
        </a>
    {% else %}
        <a href="{{ user.get_absolute_url }}">
            <img src="{% static 'images/profile/avatar.png' %}" alt="avatar">
        </a>
    {% endif %}

    <!-- ---------- نمایش اسم کاربر ---------- -->
    <a href="{{ user.get_absolute_url }}"> {{ user.get_full_name }} </a><br><br>
{% endfor %}
```

**ایجاد تمپلیت برای صفحه جزئیات کاربر:**

در تمپلیت جزئیات کاربر؛ تصویر پروفایل، اسم کامل کاربر در صورت وجود، تعداد followers و following و یکسری اطلاعات اضافی را نمایش میدهیم.

`templates/user/user_detail.html`

```jinja
{% load static %}
{% load thumbnail %}

<!-- --------------------- نمایش تصویر پروفایل --------------------- -->
{% if user.profile_image %}
    <a href="{{ user.profile_image.url }}">
        <img src="{% thumbnail user.profile_image 150x0 quality=80 %}" alt="profile_image">
    </a>
{% else %}
    <img src="{% static 'images/profile/avatar.png' %}" alt="default_image" width="150px">
{% endif %}

<!-- --------------------- نمایش اسم کاربر --------------------- -->
<br><br>
hello I'm {{ user.get_full_name | default:user.username }}
<br><br>

<!-- ------------ following و followers نمایش تعداد-------------- -->
{% with total_followers=user.followers.count total_following=user.following.count %}
    following: <span class="following-count">{{ total_following }} following{{ total_following | pluralize }}</span>
    <br><br>
    followers: <span class="followers-count">{{ total_followers }} Followers{{ total_followers | pluralize }}</span>
{% endwith %}

<!-- --------------------- نمایش اطلاعات اضافی کاربر --------------------- -->

{% if user.bio %}Bio: {{ user.bio }}{% endif %} 
{% if user.job %}Job: {{ user.job }}{% endif %} 
{% if user.birth_date %}Date of Birth: {{ user.birth_date }}{% endif %} 
```

**نمایش جدول واسط در پنل ادمین:**

`app directory/admin.py`

```python
admin.site.register(Contact)
```

### پیاده سازی فالو و آنفالو با AJAX

**ایجاد url برای عملیات فالو / آنفالو:**

`app directory/urls.py`

```python
urlpatterns = [
    path('user/follow/', views.user_follow, name='user_follow'),
]
```

**ایجاد view برای فالو / آنفالو:**

`app directory/views.py`

```python
@require_POST
@login_required
def user_follow(request):
    user_id = request.POST.get('user_id')
    if user_id:
        try:
            # کاربری که قراره فالو یا آنفالو بشه
            user = User.objects.get(pk=user_id)

            if request.user in user.followers.all():
                Contact.objects.filter(user_from=request.user, user_to=user).delete()
                followed = False
            else:
                Contact.objects.get_or_create(user_from=request.user, user_to=user)
                followed = True

            followers_count = user.followers.count()
            following_count = user.following.count()

            response_data = {
                'followers_count': followers_count,
                'following_count': following_count,
                'followed': followed,
            }

            return JsonResponse(response_data)

        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'})

    return JsonResponse({'error': 'Invalid request'})
```

**توضیحات:**

- در ساختاری که ایجاد کرده‌ایم، از مدل واسط Contact برای مدیریت رابطه‌ی فالو و آنفالو بین کاربران استفاده می‌کنیم. این مدل واسط به عنوان یک جدول واسط بین کاربران عمل می‌کند و اطلاعات مربوط به فالو و آنفالو را ذخیره می‌کند.

- رابطه‌ی Many-to-Many بین کاربران از طریق مدل واسط Contact مدیریت می‌شود و وقتی کاربر دیگری را فالو یا آنفالو می‌کنید، داده‌ها در مدل واسط اضافه یا حذف می‌شوند. جنگو به طور خودکار از طریق رابطه‌ی Many-to-Many فیلدهای following و followers را به‌روزرسانی می‌کند. این بدان معناست که با اضافه یا حذف رکوردها در مدل واسط Contact، رابطه‌های following و followers به‌روز می‌شوند.

> در مدل واسط (Contact) دو فیلد ایجاد کردیم:
>
> زمانی که کاربر1(user_from) کاربر2(user_to) را فالو میکند
>
> **user_from:** کاربری که فالو میکند    
> بنابراین کاربر1 به لیست followers کاربر2 اضافه میشود.
>
> **user_to:** کاربری که فالو میشود    
> بنابراین کاربر2 به لیست following کاربر1 اضافه میشود.

1- آیدی کاربر(user_id) ، که توسط ajax از تمپلیت ارسال شده را با استفاده از request دریافت کرده و آنرا در یک متغیر ذخیره میکینم.(آیدی کاربری که میخواهیم وی را فالو یا آنفالو کنیم)

2- کاربر فعلی وبسایت (request.user)، کاربری است که عملیات فالو کردن را انجام میدهد.

3- وقتی کاربر فعلی (request.user) می‌خواهد یک کاربر دیگر را فالو کند، ابتدا بررسی می‌شود که آیا کاربر فعلی در لیست فالوورهای کاربر دیگر (user.followers.all()) وجود دارد یا خیر.

4- اگر کاربر فعلی در لیست فالوورهای کاربر دیگر وجود دارد، رکورد مربوطه در مدل واسط Contact حذف می‌شود.

- یک متغیر بنام followed ایجاد کرده و مقدار آنرا False قرار میدهیم، یعنی کاربر را آنفالو کرده است. / از این متغیر برای تغییر وضعیت دکمه follow استفاده میکنیم.

5- اگر کاربر در لیست فالووران وجود ندارد، یک رکورد جدید در مدل واسط Contact ایجاد میکنیم، که user_from به کاربر فعلی و user_to به کاربر دیگر اشاره می‌کند.

- متغیر followed این بار True خواهد بود.

6- پس از عملیات فالو کردن؛ تعداد following و followers را با استفاده از متد count بدست می آوریم.

7- تعداد following و followers و نیز متغیر followed در response_data قرار گرفته و به عنوان json به تمپلیت ارسال میشوند.(با استفاده از JsonResponse به تمپلیت ارسال میشوند.)

8- ارورهای مربوطه را هم نمایش میدهیم.

**بریم سراغ ajax برای دکمه follow:**

یک دکمه برای فالو کردن ایجاد میکنیم.

**نکته:** برای خود کاربر نباید دکمه follow نمایش داده شود.

> برای اولین بار که صفحه لود میشود view مربوط به following هنوز اجرا نشده بنابراین با استفاده از شرط متن دکمه follow را مشخص میکنیم.

`templates/user/user_detail.html`

```jinja
{% load static %}
{% load thumbnail %}

<!-- --------------------- نمایش تصویر پروفایل --------------------- -->
{% if user.profile_image %}
    <a href="{{ user.profile_image.url }}">
        <img src="{% thumbnail user.profile_image 150x0 quality=80 %}" alt="profile_image">
    </a>
{% else %}
    <img src="{% static 'images/profile/avatar.png' %}" alt="default_image" width="150px">
{% endif %}

<!-- --------------------- نمایش اسم کاربر --------------------- -->
<br><br>
hello I'm {{ user.get_full_name | default:user.username }}
<br><br>

<!-- --------------------- دکمه Follow ----------------------- -->
{% if user != request.user %}
    <button class="follow-button">
        {% if request.user in user.followers.all %}
            UnFollow
        {% else %}
            Follow
        {% endif %} 
    </button>
{% endif %} 
<hr>

<!-- ------------ following و followers نمایش تعداد-------------- -->
{% with total_followers=user.followers.count total_following=user.following.count %}
    following: <span class="following-count">{{ total_following }} Following</span>
    <br><br>
    followers: <span class="followers-count">{{ total_followers }} Followers{{ total_followers | pluralize }}</span>
{% endwith %}

<!-- ----------------- نمایش اطلاعات اضافی کاربر ----------------- -->

{% if user.bio %}Bio: {{ user.bio }}{% endif %} 
{% if user.job %}Job: {{ user.job }}{% endif %} 
{% if user.birth_date %}Date of Birth: {{ user.birth_date }}{% endif %} 

<!-- --------------------- ajax ساختار کد ----------------------- -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>


<script>
    $(document).ready(function (){
        $('.follow-button').click(function (){
            let followButton = $(this);

            $.ajax({
                type: 'POST',
                url: '{% url 'social:user_follow' %}',
                data: {'csrfmiddlewaretoken': '{{ csrf_token }}', 'user_id': '{{user.id}}'},
                success: function(response){
                    if (response.followed){
                        followButton.text('UnFollow');
                    } else {
                        followButton.text('Follow');
                    }
                    $('.followers-count').text(response.followers_count + 'Followers{{ total_followers | pluralize }}');
                    $('.following-count').text(response.following_count + 'Following');
                }
            })
        })
    })
</script>
```

**توضیحات کد ajax:**

1- دکمه فالو را انتخاب کرده و مشخص میکنیم، زمانیکه روی آن کلیک شد کارهایی صورت بگیره.

2- دکمه فالو را در یک متغیر ذخیره میکنیم، تا بتوانیم، وضعیت آن (Follow/Unfollow) را مشخص کنیم.

3- **type:** 'POST': نوع درخواست AJAX را به POST تنظیم می‌کند.

4- **url:** URL مقصد برای ارسال درخواست را تنظیم میکند.

5- **data:** داده‌هایی که باید به سرور ارسال شوند. شامل توکن CSRF برای امنیت و id کاربری که قرار است فالو یا آنفالو شود.

6- **success:** تابعی که بعد از موفقیت‌آمیز بودن درخواست اجرا می‌شود. response حاوی داده‌های برگشتی از سرور است.

- با استفاده از متغیر followed بررسی میکنیم که کاربر فالو شده است یا نه!

- اگر کاربر فالو شده باشد(followed=True)، متن دکمه به "UnFollow" تغییر می‌کند.

- اگر کاربر آنفالو شده باشد(followed=False)، متن دکمه به "Follow" تغییر می‌کند.

- تعداد following و followers را آپدیت میکنیم.

### بهینه سازی کوئری (select_related و prefetch_related)

در این بخش می آموزیم که چطور، کوئری هایی که به دیتابیس میزنیم (تا مواردی را از دیتابیس بازیابی کنیم) را را به صرت بهینه تر بنویسیم تا تعامل با دیتابیس کمتر شود.(کمتر به دیتابیس کوئری بزنیم؛ تا کدها سریع تر اجرا شوند.)

برای بهینه سازی کوئری ها از select_related و prefetch_related استفاده میکنیم.

**این کار برای زمانیست که یکی از روابط (ManyToMany, OneToOne, ForeignKey) را داشته باشیم.**

در زمان هایی که در کوئری از فیلدهای دارای روابط استفاده میکنیم؛ چون با دو جدول سر و کار داریم در SQL دو بار کد میزند، (1: جدول اول 2: برای جدول دوم)، برای این حالات از select_related یا prefetch_related استفاده میکنیم.

> **نکته:** select_related برای روابط OneToOne و ForeignKey مناسب است.
>
> لال select_related با استفاده از **inner join** در کد **SQL** دو جدول را بهم متصل میکند؛ حالا درخواست ونتیجه کوئری  را از این جدول جدید استخراج میکند.

**روش استفاده از select_related:**

بعد از manager از آن استفاده کرده و برایش اسم فیلد یا فیلدهای رابطه ای که در آن مدل هستند را مشخص میکنیم.

در مدل Post فیلد author دارای رابطه ForeignKey میباشد به همین خاطر آن فیلد را برای select_related مشخص میکنیم.

`shell`

```shell
Model_Name.manager.select_related(relation_field_name)

# پست هایی را که نام کاربری، نویسنده آنها مارتین است را انتخاب میکند. 
Post.objects.select_related('author').filter(author__username="Martin")

# پست با آیدی 5 را انتخاب کرده سپس اسم کوچک نویسنده آنرا درخواست کرده ام.
Post.objects.select_related('author').get(id=5).author.first_name
```

خروجی یک کد SQL میباشد که دو جدول را با inner join به یکدیگر متصل کرده است.

> در view میتوانیم هر جا که با فیلدهای رابطه ای سر و کار داریم از select_related استفاده کنیم.

**دستور prefetch_related:**

این یکی متفاوت عمل میکند؛ select_related در کد SQL با استفاده از inner join دو جدول را بهم متصل میکرد ولی prefetch_related یکبار اطلاعات هر دو جدول را برمیدارد(یکبار SQL میزند ولی برای هر دو جدول) و سایر کارها را در پایتون انجام میدهد.

- در این حالت، یک کوئری جداگانه برای هر مجموعه از داده‌های مرتبط انجام می‌شود و سپس این داده‌ها در حافظه پایتون ترکیب می‌شوند.

> برای روابط ManyToMany مناسب میباشد.

**خب بریم توی shell نمونه select_related را ببینیم:**

> **connection:** ماژول connection کد SQL مربوط به ORM را به ما نشان میدهد.
>
> **reset_queries:** کوئری های قبلی را پاک میکند.
>
> **pprint:** برای نمایش بهتر کد SQL استفاده میکنیم./ کدها پشت سر هم و بهم ریخته نباشند.

`shell`

```shell
>>> from django.db import reset_queries, connection
... from social.models import Post
... from pprint import pprint

>>> Post.objects.get(id=7).author.username
'Martin'

>>> pprint(connection.queries)
[{'sql': 'SELECT "social_post"."id", "social_post"."author_id", '
         '"social_post"."description", "social_post"."created", '
         '"social_post"."updated", "social_post"."total_likes" FROM '
         '"social_post" WHERE "social_post"."id" = 7 LIMIT 21',
  'time': '0.000'},
 {'sql': 'SELECT "social_user"."id", "social_user"."password", '
         '"social_user"."last_login", "social_user"."is_superuser", '
         '"social_user"."username", "social_user"."first_name", '
         '"social_user"."last_name", "social_user"."email", '
         '"social_user"."is_staff", "social_user"."is_active", '
         '"social_user"."date_joined", "social_user"."profile_image", '
         '"social_user"."bio", "social_user"."birth_date", '
         '"social_user"."job", "social_user"."phone_number" FROM "social_user" '
         'WHERE "social_user"."id" = 1 LIMIT 21',
  'time': '0.000'}]

>>> reset_queries()

>>> pprint(connection.queries)
[]

>>> Post.objects.select_related().get(id=7).author.username
'Martin'

>>> pprint(connection.queries)
[{'sql': 'SELECT "social_post"."id", "social_post"."author_id", '
         '"social_post"."description", "social_post"."created", '
         '"social_post"."updated", "social_post"."total_likes", '
         '"social_user"."id", "social_user"."password", '
         '"social_user"."last_login", "social_user"."is_superuser", '
         '"social_user"."username", "social_user"."first_name", '
         '"social_user"."last_name", "social_user"."email", '
         '"social_user"."is_staff", "social_user"."is_active", '
         '"social_user"."date_joined", "social_user"."profile_image", '
         '"social_user"."bio", "social_user"."birth_date", '
         '"social_user"."job", "social_user"."phone_number" FROM "social_post" '
         'INNER JOIN "social_user" ON ("social_post"."author_id" = '
         '"social_user"."id") WHERE "social_post"."id" = 7 LIMIT 21',
  'time': '0.000'}]
```

در کد بالا میبینید که دو جدول را با INNER JOIN به یکدیگر متصل کرده است.

**خب بریم توی shell نمونه prefetch_related را ببینیم:**

`shell`

```shell
>>> from django.db import reset_queries, connection
... from social.models import *
... from pprint import pprint


>>> for user in User.objects.get(id=1).followers.all():
...     user.username
...
... pprint(connection.queries)

[{'sql': 'SELECT "social_user"."id", "social_user"."password", '
         '"social_user"."last_login", "social_user"."is_superuser", '
         '"social_user"."username", "social_user"."first_name", '
         '"social_user"."last_name", "social_user"."email", '
         '"social_user"."is_staff", "social_user"."is_active", '
         '"social_user"."date_joined", "social_user"."profile_image", '
         '"social_user"."bio", "social_user"."birth_date", '
         '"social_user"."job", "social_user"."phone_number" FROM "social_user" '
         'WHERE "social_user"."id" = 1 LIMIT 21',
  'time': '0.000'},
 {'sql': 'SELECT "social_user"."id", "social_user"."password", '
         '"social_user"."last_login", "social_user"."is_superuser", '
         '"social_user"."username", "social_user"."first_name", '
         '"social_user"."last_name", "social_user"."email", '
         '"social_user"."is_staff", "social_user"."is_active", '
         '"social_user"."date_joined", "social_user"."profile_image", '
         '"social_user"."bio", "social_user"."birth_date", '
         '"social_user"."job", "social_user"."phone_number" FROM "social_user" '
         'INNER JOIN "social_contact" ON ("social_user"."id" = '
         '"social_contact"."user_from_id") WHERE "social_contact"."user_to_id" '
         '= 1 ORDER BY "social_user"."username" DESC',
  'time': '0.000'},
 {'sql': 'SELECT "social_user"."id", "social_user"."password", '
         '"social_user"."last_login", "social_user"."is_superuser", '
         '"social_user"."username", "social_user"."first_name", '
         '"social_user"."last_name", "social_user"."email", '
         '"social_user"."is_staff", "social_user"."is_active", '
         '"social_user"."date_joined", "social_user"."profile_image", '
         '"social_user"."bio", "social_user"."birth_date", '
         '"social_user"."job", "social_user"."phone_number" FROM "social_user" '
         'WHERE "social_user"."id" = 1 LIMIT 21',
  'time': '0.000'},
 {'sql': 'SELECT "social_user"."id", "social_user"."password", '
         '"social_user"."last_login", "social_user"."is_superuser", '
         '"social_user"."username", "social_user"."first_name", '
         '"social_user"."last_name", "social_user"."email", '
         '"social_user"."is_staff", "social_user"."is_active", '
         '"social_user"."date_joined", "social_user"."profile_image", '
         '"social_user"."bio", "social_user"."birth_date", '
         '"social_user"."job", "social_user"."phone_number" FROM "social_user" '
         'INNER JOIN "social_contact" ON ("social_user"."id" = '
         '"social_contact"."user_from_id") WHERE "social_contact"."user_to_id" '
         '= 1 ORDER BY "social_user"."username" DESC',
  'time': '0.000'}]

>>> reset_queries()

>>> pprint(connection.queries)
[]

>>> for user in User.objects.prefetch_related().get(id=1).followers.all():
...     user.username
...
... pprint(connection.queries)

[{'sql': 'SELECT "social_user"."id", "social_user"."password", '
         '"social_user"."last_login", "social_user"."is_superuser", '
         '"social_user"."username", "social_user"."first_name", '
         '"social_user"."last_name", "social_user"."email", '
         '"social_user"."is_staff", "social_user"."is_active", '
         '"social_user"."date_joined", "social_user"."profile_image", '
         '"social_user"."bio", "social_user"."birth_date", '
         '"social_user"."job", "social_user"."phone_number" FROM "social_user" '
         'WHERE "social_user"."id" = 1 LIMIT 21',
  'time': '0.000'},
 {'sql': 'SELECT "social_user"."id", "social_user"."password", '
         '"social_user"."last_login", "social_user"."is_superuser", '
         '"social_user"."username", "social_user"."first_name", '
         '"social_user"."last_name", "social_user"."email", '
         '"social_user"."is_staff", "social_user"."is_active", '
         '"social_user"."date_joined", "social_user"."profile_image", '
         '"social_user"."bio", "social_user"."birth_date", '
         '"social_user"."job", "social_user"."phone_number" FROM "social_user" '
         'INNER JOIN "social_contact" ON ("social_user"."id" = '
         '"social_contact"."user_from_id") WHERE "social_contact"."user_to_id" '
         '= 1 ORDER BY "social_user"."username" DESC',
  'time': '0.000'}]
```

در ساختار بالا مشاهده میکنید که قبل از استفاده از prefetch_related چهار کوئری برای SQL داشتیم ولی پس از استفاده دو کوئری داریم.

> همان طور که گفته شد و در کد بالا میبینید، در SQL دو جدول را بر میدارد و سایر کارها در حافظه پایتون انجام میدهد.

### کار با سیگنال ها (محاسبه مجموع لایک)

با استفاده از سیگنال‌ها می‌توان مشخص کرد که وقتی تغییری در یکی از مدل‌ها صورت گرفت، یکسری کارها انجام شود. سیگنال‌ها به شما این امکان را می‌دهند که به رویدادهای مختلف واکنش نشان داده و مشخص کنید چه عکس‌العملی نشان داده شود. این رویدادها می‌توانند شامل موارد زیر باشند:

1- ایجاد داده‌های جدید    
2- ویرایش داده‌های موجود    
3- حذف داده‌ها از دیتابیس   
4- ورود و خروج کاربران    
و...

**حساسیت جنگو نسبت به استفاده از سیگنال‌ها**

جنگو نسبت به استفاده از سیگنال‌ها حساس است و توصیه می‌کند تا جایی که ممکن است از آن‌ها استفاده نکنید، زیرا استفاده نادرست و نابجا از سیگنال‌ها می‌تواند مشکلاتی ایجاد کند. در زیر برخی از این دلایل بیان شده است:

**دلایل حساسیت جنگو**

1. پیچیدگی و دشواری در ردیابی

    سیگنال‌ها می‌توانند کد را پیچیده‌تر کنند و ردیابی و اشکال‌زدایی آن را دشوارتر سازند. زیرا اتصال بین سیگنال‌ها و گیرنده‌ها اغلب به صورت صریح در یکجا تعریف نمی‌شود و ممکن است در نقاط مختلف پروژه پراکنده باشند. این می‌تواند باعث شود که فهمیدن اینکه چه چیزی باعث فراخوانی یک سیگنال شده است، مشکل باشد.

2. نامرئی بودن جریان کنترلی

    در کدهای معمولی، جریان کنترلی (flow control) مشخص و قابل پیش‌بینی است. اما سیگنال‌ها می‌توانند جریان کنترلی نامرئی ایجاد کنند که باعث می‌شود کد به صورت غیرمنتظره‌ای عمل کند. این نامرئی بودن می‌تواند مشکلاتی در پیش‌بینی رفتار برنامه ایجاد کند.

3. احتمال مشکلات عملکردی

    سیگنال‌ها می‌توانند به طور غیرمستقیم باعث کاهش عملکرد (performance) شوند، به خصوص اگر تعداد زیادی گیرنده برای یک سیگنال ثبت شده باشند و هر کدام کارهای سنگینی انجام دهند. این می‌تواند منجر به تأخیر در عملیات اصلی شود.

4. وابستگی‌ها و Coupling

    سیگنال‌ها می‌توانند باعث ایجاد وابستگی‌های غیرمنتظره بین بخش‌های مختلف کد شوند. این وابستگی‌ها می‌توانند مانع از تغییرات راحت در کد شوند و نگهداری و توسعه کد را مشکل‌تر کنند.

5. تست‌پذیری پایین‌تر

    کدی که به شدت به سیگنال‌ها وابسته است، می‌تواند تست کردن را مشکل‌تر کند. چون سیگنال‌ها به طور غیرمستقیم فراخوانی می‌شوند، ممکن است متوجه نشوید که چه چیزی باید تست شود و یا چگونه باید این کار را انجام دهید. همچنین، تست کردن کدی که به سیگنال‌ها وابسته است، می‌تواند نیاز به ابزارها و روش‌های خاصی داشته باشد که کار تست را پیچیده‌تر می‌کند.

**جایگزین‌های مناسب برای سیگنال‌ها:**

در مواردی که امکان‌پذیر است، استفاده از روش‌های جایگزین می‌تواند منطقی‌تر باشد:

- **استفاده از متدهای مدل:** در برخی موارد با override کردن متدهای مدل مثل save یا delete می‌توانید کار مشابه با سیگنال‌ها را انجام دهید.

- **Middlewares:** برای عملیات‌هایی که باید در سطح درخواست/پاسخ انجام شوند، می‌توان از Middlewares استفاده کرد.

- **View و فرم‌ها:** برای عملیات‌های وابسته به view، می‌توانید منطق را مستقیماً در view یا فرم‌ها پیاده‌سازی کنید.

**نتیجه‌گیری:**

با توجه به این نکات، استفاده از سیگنال‌ها در Django باید با دقت و فقط در موارد ضروری انجام شود. سیگنال‌ها می‌توانند ابزار قدرتمندی باشند، اما استفاده نادرست از آن‌ها می‌تواند مشکلات قابل توجهی ایجاد کند.

> در جنگو انواع مختلفی از سیگنال ها داریم، با توجه به نیاز هر یک را ایمپورت کرده و استفاده میکنیم.

**در این بخش میخواهیم یک فیلد بنام total_likes به مدل Post اضافه کنیم که تعداد کل لایک ها را نشان میدهد؛ برای اینکه با like و dislike مقدار این فیلد تغییر کند از سیگنال استفاده میکنیم. / در واقع میخواهیم سیگنالی بنویسیم که مقدار این فیلد را آپدیت میکند.**

یک فیلد برای نمایش تعداد کل لایک ها در مدل Post ایجاد میکنیم.

> این فیلد را از نوع PositiveIntegerField انتخاب میکنیم، چون تعداد لایک ها نمیتواند منفی باشد.

`app directory/models.py`

```python
from taggit.managers import TaggableManager


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_posts')
    description = models.TextField()
    # date
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    # tags field
    tags = TaggableManager()

    # likes field
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)
    # total number of likes field
    total_likes = models.PositiveIntegerField(default=0)
    # saved field
    saved_by = models.ManyToManyField(User, related_name="saved_posts", blank=True)


    # ordering & indexing
    class Meta:
        ordering = ['-created']
        indexes = [
            models.Index(fields=['-created']),
            models.Index(fields=['-total_likes']),
        ]

    def __str__(self):
        return self.description
```

**توضیحات:**

مقدار پیشفرض فیلد total_likes را صفر مشخص کرده ایم، پس مقدار این فیلد برای تمام پست ها صفر میباشد.

چون میخواهیم براساس تعداد لایک ها(پست محبوب) مرتب سازی را انجام دهیم؛ بنابراین یک index برای فیلد total_likes اضافه میکنیم.

> خب پس از افزودن فیلد دستورات makemigrations و migrate فراموش نشه!!!

**آپدیت دستی فیلد total_likes:**

در shell روی تمام پست ها حلقه زده و مقدار فیلد total_likes را برابر با تعداد کاربران فیلد likes قرار میدهیم، در پایان با متد save تغییرات را ذخیره میکنیم.

`shell`

```shell
>>> from social.models import Post

>>> for post in Post.objects.all():
...     post.total_likes = post.likes.count()
...     post.save()
```

**تغییر view لیست پست ها:**

میخواهیم در لیست پست ها(post_list)؛ پست ها را براساس محبوبیت آنها نمایش دهیم بنابراین در view لیست پست ها(post_list) ، پست ها را براساس فیلد total_likes مرتب میکنیم.

> قاعدتا پستی که بیشترین تعداد لایک را دارد محبوب تر است.

`app directory/views.py`

```python
from taggit.models import Tag
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


def post_list(request, tag_slug=None):
    tag = None
    posts = Post.objects.select_related('author').order_by('-total_likes')

    if tag_slug:
        tag = get_object_or_404(Tag, slug=tag_slug)
        posts = Post.objects.filter(tags__in=[tag])

    # صفحه بندی برای پست ها
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    
    try:
        posts = paginator.page(page_number)
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = []

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'social/list_ajax.html', {"posts": posts})

    return render(request, 'social/post_list.html', {'posts': posts, 'tag': tag})
```

**بریم سیگنال ایجاد کنیم:**

در دایرکتوری app یک فایل پایتونی بنام signals.py ایجاد میکنیم، سیگنال ها در این فایل نوشته میشوند.

1- سیگنالی را که لازم داریم، را ایمپورت میکنیم.

(چون میخواهیم با تغییر فیلد لایک ها که M2M هست، فیلد total_likes را آپدیت کنیم، از سیگنال m2m_changed استفاده میکنیم.)

2- receiver هم باید ایمپورت شود.

3- مدلی که سیگنال ارسال میکند هم باید ایمپورت شود.

`app directory/signals.py`

```python
from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import Post


@receiver(m2m_changed, sender=Post.likes.through)
def like_change(sender, instance, **kwargs):
    instance.total_likes = instance.likes.count()
    instance.save()
```

> وقتی فیلد likes تغییر میکنه، سیگنال ارسال میشه، دکوراتور receiver آن سیگنال را دریافت کرده و تابع اجرا میشود.

**توضیحات:**

1- برای دکوراتور receiver، نوع سیگنال را مشخص میکنیم، تا با ارسال سیگنال، آنرا دریافت کند.

2- برای receiver، آرگومان sender را هم مشخص میکنیم.

> **sender:** برایش آن مدلی را مشخص میکنیم که تغییر آن مدل (مثل حذف یک آبجکت) و یا فیلدهای آن(مثل لایک شدن پست) موجب ارسال سیگنال مربوطه میشود.
>
> برای sender مدلی که سیگنال را ارسال میکند  مشخص میکنیم. / برای فیلدهای M2M مدل واسط را مشخص میکنیم.

**اگر فیلد M2M هست برای آرگومان sender آن جدول میانی را مشخص میکنیم.**

> <span class="en-text">Model_Name.relation_field.through</span>
>
> <span class="en-text">Post.likes.through</span>

- through نشان دهنده همان جدول میانی است.

**تابع برای سیگنال:**

برای تابع پارامترهای (sender, instance, **kwargs) را مشخص میکنیم.

> پارامتر instance: یک آبجکت از آن مدل هست که تغییر برایش صورت گرفته است. در اینجا مدل Post.

- مثل کاری که در shell برای آپدیت فیلد total_likes انجام دادیم، اینجا هم همان کار را انجام میدهیم. / چون آبجکت آن مدل آپدیت شده است از متد save استفاده میکنیم.

**برای استفاده از سیگنال ها باید کانفیگ آنرا به پروژه اضافه کنیم:**

برای این کار وارد فایل پایتونی apps.py میشویم(این فایل در دایرکتوری اپ(app) وجود دارد.)

`app directory/apps.py`

```python
from django.apps import AppConfig


class SocialConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'social'

    def ready(self):
        import social.signals
```

**توضیحات:**

- داخل بدنه کلاس <span class="en-text"><app\_name\></span>Config(در اینجا SocialConfig) متد ready را override میکنیم.

- داخل بدنه متد ready فایل پایتونی سیگنال را ایمپورت میکنیم.

    > signals اسم فایل پایتونی هست که سیگنال ها را آنجا مینویسیم.
    >
    > > <span class="en-text">import <app\_name\>.signals</span>

### کار با سیگنال ها (ارسال ایمیل حذف پست)

میخواهیم زمانیکه پست کاربری حذف میشود، به آن شخص ایمیلی با موضوع پست شما حذف شد ارسال شود.

> این عملیات پس از حذف پست صورت میگیرد بنابراین از سیگنال post_delete استفاده میکنیم.
>
> از ماژول send_mail برای ارسال ایمیل استفاده میکنیم.

`app directory/signals.py`

```python
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Post
from django.core.mail import send_mail


@receiver(post_delete, sender=Post)
def delete_post(sender, instance, **kwargs):
    user = instance.author
    subject = "deleted post"
    message = f"your post: 'post-id:{instance.id}' has been deleted"

    send_mail(
        subject,
        message,
        'example@gmail.com',
        [user.email],
        fail_silently=False,
    )
    # structure of send_mail module:
    # send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])
```

### کار با message جنگو

از message برای نمایش پیام های مختلف به کاربر استفاده میکنیم.

**برای استفاده از آن لازم است مواردی را چک کنیم:**

بررسی کنیم که تنظیمات message در settings.py وجود داشته باشند. / لازم نیست ما چیزی اضافه کنیم.

`project directory/settings.py`

```python
INSTALLED_APPS = [
    # ...
    'django.contrib.messages',
    # ...
]

MIDDLEWARE = [
    # ...
    'django.contrib.messages.middleware.MessageMiddleware',
]
```

**استفاده از message در view:**

قبل از هر چیزی باید آنرا ایمپورت کنیم:

`app directory/views.py`

```python
from django.contrib import messages
```

حالا هرجا لازم داریم پیامی نمایش داده شود، از ماژول messages استفاده میکنیم.

> **message چهار نوع مختلف دارد:**
>
> 1- **info:** برای اطلاع رسانی به کاربر(نمایش یکسری اطلاعات.)
>
> 2- **warning:** برای نمایش اخطار و هشدارها
>
> 3- **success:** نمایش پیام موفقیت آمیز بودن عملکردی.
>
> 4- **error:** نمایش خطا ها

**شیوه استفاده از ماژول messages:**

```python
messages.method(request, "our message")

# examples:
messages.info(request, "test text for info.")
messages.warning(request, "test text for warning!")
messages.success(request, "test text for success.")
messages.error(request, "test text for error!")
```

**خب بریم یک مثال از messages ببینیم:**

قبلا برای نمایش پیام "ارسال تیکت" به کاربر از متغیر sent استفاده کرده و متن را در تمپلیت نوشته بودیم، ولی این بار از پکیج messages برای نمایش پیام استفاده میکنیم و پیام را در view مینویسیم.

`app directory/views.py`

```python
from django.contrib import messages
from django.core.mail import send_mail

def ticket(request):
    if request.method == 'POST':
        form = TicketForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data

            message = (f"sender: {cd['name']},\n"
                       f"email: {cd['email']}\n\n"
                       f"content: {cd['content']}"
            )

            send_mail(
                subject=cd['title'],
                message=message,
                from_email='sender@gmail.com',
                recipient_list=['recipient@gmail.com'],
                fail_silently=False,
            )

            # :نمایش پیام دلخواه به کاربر
            messages.success(request, 'your ticket has been sent')

            return redirect("social:index")

    else:
        form = TicketForm()

    return render(request, 'forms/ticket.html', {"form": form})
```

به این ترتیب پس از ارسال موفقیت آمیز تیکت به ادمین پیام نمایش داده میشود.

**نمایش message در تمپلیت:**

**نکته:** متغیر messages در تمپلیت شناخته شده هست و نیازی به ارسال آن توسط context نیست.

> متغیر messages شامل تمام پیام های ارسال از view مربوطه میباشد(ممکن است در یک view برای بخش های مختلف پیام داشته باشیم.)، بنابراین باید روی آن حلقه بزنیم.

`templates/forms/ticket.html`

```jinja
{% if messages %}
    <ul>
        {% for message in messages %}
            <li class="{% if message.tags %}{{ message.tags }}{% endif %}">
                {{ message }} 
            </li>
        {% endfor %}
    </ul>
{% endif %} 
```

**توضیحات:**

1- متد tags برای message نوع آن پیام را برمیگرداند. / (info, warning, success, error)

2- در اینجا از متد tags استفاده کرده تا برای هر نوع پیام یک کلاس مجزا مشخص کنیم؛ (برای اینکه به هر یک از انواع پیام ها استایل  خاص بدهیم.)

### کار با debug toolbar جنگو

**پکیج یا ابزار django-debug-toolbar:** یک ابزار مفید برای توسعه‌دهندگان Django است که به شما کمک می‌کند تا عملکرد و رفتار اپلیکیشن Django خود را بهتر درک کنید. این ابزار به صورت یک نوار ابزار در رابط کاربری شما نمایش داده می‌شود و اطلاعات مفیدی در مورد درخواست‌ها و پاسخ‌ها، پایگاه داده، کش، و سایر جنبه‌های برنامه‌تان ارائه می‌دهد. کاربردهای اصلی آن عبارتند از:

1. **پروفایلینگ پایگاه داده:** نمایش کوئری‌های SQL که در درخواست‌های مختلف اجرا می‌شوند و زمان اجرای هر یک از آن‌ها. این ویژگی به شناسایی و بهینه‌سازی کوئری‌های کند کمک می‌کند.

2. **زمان‌های پردازش درخواست:** ارائه زمان صرف‌شده برای پردازش هر درخواست و زمان بارگذاری صفحات.

3. **اطلاعات کش:** نمایش اطلاعات مربوط به کش و نحوه استفاده از آن.

4. **اطلاعات در مورد Context:** نمایش متغیرهای context که به قالب‌ها ارسال می‌شوند.

5. **اطلاعات درباره Cache و Middleware:** نمایش اطلاعات در مورد استفاده از کش و middlewareها.

6. **مدیریت خطاها:** ارائه اطلاعات دقیق‌تر در مورد خطاها و استثناها که در زمان توسعه مفید است.

**نصب پکیج django-debug-toolbar:**

a- **نصب کتابخانه django-debug-toolbar:**

`Terminal`

```terminal
pip install django-debug-toolbar
```

b- **بررسی پیش نیازها و الزامات:**

**اول:**

اطمینان حاصل کنید که 'django.contrib.staticfiles' در تنظیمات INSTALLED_APPS شما وجود دارد:

`project directory/settings.py`

```python
INSTALLED_APPS = [
    # ...
    "django.contrib.staticfiles",
    # ...
]

STATIC_URL = "static/"
```

**دوم:**

بررسی کنید که تنظیمات TEMPLATES شامل یک backend از نوع DjangoTemplates با گزینه APP_DIRS برابر با True باشد:

`project directory/settings.py`

```python
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        # ...
    }
]
```

c- **افزودن app آن به اپ های پروژه:**

`project directory/settings.py`

```python
INSTALLED_APPS = [
    # ...
    "debug_toolbar",
    # ...
]
```

d- **افزودن URL آن به urlهای پروژه:**

URLهای django-debug-toolbar را به URLconf پروژه خود اضافه کنید:

`project directory/urls.py`

```python
urlpatterns = [
    # ...
    path('__debug__/', include('debug_toolbar.urls')),
]
```

e- **اضافه کردن middleware آن:**

Debug Toolbar به‌طور عمده در middleware پیاده‌سازی شده است. آن را به تنظیمات MIDDLEWARE اضافه کنید:

`project directory/settings.py`

```python
MIDDLEWARE = [
    "debug_toolbar.middleware.DebugToolbarMiddleware",
    # ...
]
```

**هشدار:** ترتیب MIDDLEWARE مهم است. این middleware باید تا حد امکان در بالای لیست قرار گیرد، اما باید بعد از middlewareهایی که محتویات پاسخ را رمزگذاری می‌کنند، مانند GZipMiddleware، قرار گیرد. / در حال حاضر آنرا دربالاترین بخش قرار میدهیم.

f- **پیکربندی IPs داخلی:**

Debug Toolbar فقط در صورتی نمایش داده می‌شود که آدرس IP شما در تنظیمات INTERNAL_IPS در Django لیست شده باشد. برای توسعه محلی، باید "127.0.0.1" را به INTERNAL_IPS اضافه کنید:

`project directory/settings.py`

```python
INTERNAL_IPS = [
    "127.0.0.1",
]
```

> پس از این تنظیمات پنل مدیریتی آن به پروژه اضافه خواهد شد، میتوان از آن در صفحات مختلف استفاده کرد.

**دستور debugsqlshell:**

دستور debugsqlshell در Django برای شروع یک شل تعاملی Python طراحی شده است که مشابه دستور مدیریت shell پیش‌فرض Django است. با این تفاوت که این شل، هر بار که یک فراخوانی ORM منجر به یک کوئری دیتابیس شود، به زیبایی نتایج SQL آنرا هم را در شل نمایش می‌دهد.

> <span class="en-text">python manage.py debugsqlshell</span>

### ایجاد اکشن (action) در پنل ادمین

> به صورت پیشفرض فقط اکشن delete وجود دارد.

میخواهیم اکشن هایی پیاده سازی کنیم که پست ها را active و یا deactive میکند؛ برای این کار لازم است تا یک **فیلد بولین** برای اکتیو یا دی اکتیو بودن پست ها به مدل Post اضافه کنیم.

`app directory/models.py`

```python
from taggit.managers import TaggableManager


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_posts')
    description = models.TextField()
    # date
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    # tags field
    tags = TaggableManager()

    # likes field
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)
    # total number of likes field
    total_likes = models.PositiveIntegerField(default=0)
    # saved field
    saved_by = models.ManyToManyField(User, related_name="saved_posts", blank=True)

    active = models.BooleanField(default=True)


    # ordering & indexing
    class Meta:
        ordering = ['-created']
        indexes = [
            models.Index(fields=['-created']),
            models.Index(fields=['-total_likes']),
        ]

    def __str__(self):
        return self.description
```

به صورت پیشفرض مقدار فیلد active را True قرار میدهیم، یعنی پست ها فعال هستند.

**ایجاد اکشن:**

اکشن ها را در فایل پایتونی admin.py ایجاد میکنیم.

- برای هر اکشن یک تابع ایجاد میکنیم.

    - اسم تابع را به صورت <span class="en-text">def make_name() </span> مشخص میکنند ولی با این حال نام گذاری دلخواه است.

- برای توابع، پارامتر های (modeladmin, request, queryset) را مشخص میکنیم.

> آبجکت هایی که در پنل ادمین انتخاب میکنیم، در پارامتر queryset قرار میگیرند.

داخل بدنه تابع یک متغیر ایجاد میکنیم؛ به صورت رایج اسم متغیر result  هست.

> متغیر result تعداد آبجکت هایی که انتخاب شده اند را برمیگرداند.

`app directory/admin.py`

```python
def deactivate_post(modeladmin, request, queryset):
    result = queryset.update(active=False)
```

با دستور بالا مشخص میکنیم که برای کوئری ست های انتخاب شده مقدار یک فیلد را تغییر بده(آپدیت کن).

**نمایش پیام پس از انجام اکشن:**

این ساختار در بدنه تابع نوشته میشود.

```python
modeladmin.message_user(request, "our message")
```

`app directory/admin.py`

```python
def deactivate_post(modeladmin, request, queryset):
    result = queryset.update(active=False)

    if result == 1:
        message = f'{result} Post deactivated'
    elif result > 1:
        message = f'{result} Posts deactivated'

    modeladmin.message_user(request, message)
```

> برای نمایش اصولی تر متن که اگر تعداد بیشتر از 1 بود s جمع داشته باشد از این شرط استفاده شده و چیز خاص و ضروری نیست.

**معرفی اکشن به model admin آن:**

پس از نوشتن اکشن باید آنرا به مدل ادمین مربوطه معرفی کنیم، از اتریبیوت کلاس actions استفاده کرده و اسم اکشن ها را در لیست آن مشخص میکنیم.

`app directory/admin.py`

```python
# ——————————————————————————— Actions ———————————————————————————

# ------------- deactivation action -------------
def deactivate_post(modeladmin, request, queryset):
    result = queryset.update(active=False)

    if result == 1:
        message = f'{result} Post deactivated'
    elif result > 1:
        message = f'{result} Posts deactivated'

    modeladmin.message_user(request, message)

# rename action
deactivate_post.short_description = 'Deactivate'

# ------------- activation action -------------
def activate_post(modeladmin, request, queryset):
    result = queryset.update(active=True)
    message = None

    if result > 1:
        message = f'{result} Posts activated'
    elif result == 1:
        message = f'{result} Post activated'

    modeladmin.message_user(request, message)

# rename action
activate_post.short_description = 'Activate'


# ————————————————————————— Model Admins —————————————————————————

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'updated', 'created']
    ordering = ['-created', '-author']
    search_fields = ['author', 'description']

    actions = [deactivate_post, activate_post]
```

**نکته:** اگر بخواهیم اسم مستعار برای اکشن های خود مشخص کنیم(اسمی که در پنل ادمین نشان داده میشود)؛ **بیرون از تابع و بعد از آن** اسم مستعار را مشخص میکنیم.

```python
function_name.short_description = "اسم دلخواه"
```

### تمرینات فصل نهم (مهم)

#### **T1- تیکتی که کاربر ارسال میکند، توسط ادمین پاسخ داده شود؛ صفحه ای وجود داشته باشد که تیکت و پاسخ آن قابل مشاهده باشد:**

a- **لازم است تا برای ticket و reply_to_ticket مدل هایی ایجاد کنیم:**

`app directory/models.py`

```python
class Ticket(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')

    subject = models.CharField(max_length=100)
    content = models.TextField()

    is_opened = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['-created_at'])]

    def __str__(self):
        return {self.subject}

# ---------------------------------------------------------------------------

class Reply(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='reply_to_ticket')
    reply = models.TextField()

    responded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-responded_at']
        indexes = [models.Index(fields=['-responded_at'])]
        unique_together = ('ticket', 'reply')

    def __str__(self):
        return self.reply
```

b- **ایجاد فرم برای تیکت و پاسخ به تیکت:**

`app directory/forms.py`

```python
class TicketForm(forms.ModelForm):
    class Meta:
        model = Ticket
        fields = ['subject', 'content']


class ReplyForm(forms.ModelForm):
    class Meta:
        model = Reply
        fields = ['reply']
```

c- **ایجاد URL برای تیکت و پاسخ تیکت:**

`app directory/urls.py`

```python
urlpatterns = [
    path('ticket/', views.ticket, name='ticket'),
    path('reply/<int:ticket_id>', views.reply_to_ticket, name='reply_ticket'),
]
```

d- **ایجاد view برای ارسال تیکت:**

تیکت ارسال شده هم به ایمیل ادمین ارسال میشود و هم در دیتابیس ذخیره میشود.

`app directory/views.py`

```python
@login_required
def ticket(request):
    user = request.user

    if request.method == 'POST':
        form = TicketForm(request.POST)
        if form.is_valid():

            ticket_obj = form.save(commit=False)
            ticket_obj.user = user
            ticket_obj.save()

            cd = form.cleaned_data
            message = (f"sender: {user},\n"
                    f"content: {cd['content']}\n\n"
                    f"email: {user.email}\n\n\n"
                    f"reply to ticket: {request.build_absolute_uri(f'/reply/{ticket_obj.id}')}"
                    )

            send_mail(
                cd['subject'],
                message,
                'sender@gmail.com',
                ['admin@gmail.com'],
                fail_silently=False,
            )

            messages.success(request, 'your ticket has been sent')
    else:
        form = TicketForm()

    return render(request, 'forms/ticket_form.html', {"form": form})
```

**توضیحات:**

1- اطلاعات فرم تیکت را دریافت کرده و در صورت معتبر بودن داده ها آنرا در دیتابیس ذخیره میکنیم.

2- حالا باید متن ایمیل به ادمین را آماده کنیم، در متن ایمیل؛ اسم فرستنده تیکت(کاربر وبسایت) متن تیکتی که ارسال کرده است، ایمیل کاربر و لینکی که ادمین را به صفحه پاسخ به تیکت ها هدایت میکند را داریم.

> <span class="rtl-text">برای صفحه "پاسخ به تیکت" یک url ایجاد کردیم <span class="en-text">(reply/<int:ticket_id\>/)</span>؛ برای آیدی تیکت از متغیر ticket_obj استفاده میکنیم، ولی نکته مهم این هست که باید آدرس url کامل و دقیق باشه، متد <span class="en-text">build_absolute_uri()</span> آدرس دقیق را به ما میدهد.(<span class="en-text">http://host/reply-to-ticket/<ticket_id\></span>)
</span>

e- **ایجاد view برای پاسخ به تیکت:**

`app directory/views.py`

```python
@staff_member_required()
def reply_to_ticket(request, ticket_id):
    sent_ticket = get_object_or_404(Ticket, pk=ticket_id)

    if request.method == 'POST':
        form = ReplyForm(request.POST)
        if form.is_valid():
            reply_obj = form.save(commit=False)
            reply_obj.ticket = sent_ticket
            reply_obj.save()

            messages.success(request, "reply has been sent to user.")

            sent_ticket.is_open = False
            sent_ticket.save()
    else:
        form = ReplyForm()

    return render(request, "forms/replies.html", {"form": form, "ticket": sent_ticket})
```

**توضیحات:**

1- تیکتی که ادمین به آن پاسخ میدهد را از دیتابیس دریافت میکنیم.

2- پاسخی که ادمین ثبت کرده است را از فرم دریافت کرده و به همراه، این تیکتی که مشخص کردیم؛ اطلاعات را در دیتابیس ذخیره میکنیم.

3- با استفاده از ماژول messages، پیغام موفقیت آمیز بودن را به تمپلیت ارسال میکنیم.

4- هر تیکتی یک فیلد برای مشخص کردن باز و یا بسته بودن آن دارد، پس از ثبت پاسخ ادمین تیکت بسته میشود بنابراین؛ آن تیکت را صدا زده و فیلد is_open را آپدیت میکنیم و برای ثبت در دیتابیس از متد <span class="en-text">save()</span> استفاده میکنیم.

f- **ایجاد URL برای نمایش لیست تیکت ها و پاسخ آنها**

`app directory/urls.py`

```python
urlpatterns = [
    path('tickets_list/', tickets_list, name='tickets_list'),
]
```

g- **ایجاد view برای نمایش لیست تیکت ها و پاسخ آنها**

`app directory/views.py`

```python
def tickets_list(request):
    user = request.user

    if user.is_staff:
        tickets = Ticket.objects.all()
    else:
        tickets = Ticket.objects.filter(user=user)

    return render(request, 'social/ticket_list.html', {'tickets': tickets})
```

h- **ایجاد URL برای نمایش جزئیات تیکت:**

`app directory/urls.py`

```python
urlpatterns = [
    path('ticket/<int:ticket_id>', ticket_detail, name='ticket_detail'),
]
```

i- **ایجاد view برای نمایش جزئیات تیکت:**

`app directory/views.py`

```python
def ticket_detail(request, ticket_id):
    ticket = get_object_or_404(Ticket, pk=ticket_id)

    return render(request, "social/ticket_detail.html", {"ticket": ticket})
```

j- ***ایجاد قالب های html:***

1- ticket_form.html:

`templates/forms/ticket_form.html`

```jinja
<h2>create ticket</h2>

<form method="post">
    {% csrf_token %}

    <input type="text" name="subject" placeholder="Title">

    <textarea name="content" cols="20" rows="10" placeholder="Your Content..."></textarea>

    <input type="submit" value="Send">
</form>

{{ form.errors }}

{% if messages %}
    <ul>
        {% for message in messages %}
            <li class="{{ message.tags | default:"" }}">
                {{ message }} 
            </li>
        {% endfor %}
    </ul>
{% endif %} 
```

**2- replies.html:**

`templates/forms/replies.html`

```jinja
<h2>Reply to Ticket</h2>

<div class="ticket">
    User: {{ ticket.user }}<br>
    Email: {{ ticket.email }}
    <br><br><br>
    title: {{ ticket.subject }}<br><br>
    content: {{ ticket.body }}
</div>

<div class="reply">
    <form method="post">
        {% csrf_token %}
        
        <textarea name="reply" id="" cols="30" rows="10" placeholder="reply to ticket"></textarea>
        <br><br>
        <input type="submit" value="send reply">
    </form>
</div>

<div class="messages">
    {% if messages %}
        {% for message in messages %}
            {{ message }}
        {% endfor %}
    {% endif %} 
</div>

{{ form.errors }}
```

**3- ticket_list.html:**

`templates/social/ticket_list.html`

```jinja
<h2>tickets list</h2>

<ul>
    {% for ticket in tickets %}
        <li>
            <strong>{{ ticket.subject }}</strong> - {{ ticket.created_at }}
            <br>
            <a href="{% url 'social:ticket_detail' ticket.id %}">{{ ticket.content | truncatewords:10 }}</a>
            <br>
            {% if ticket.is_opened %}
                <em>it's open</em>
            {% else %}
                <em>it closed</em>
            {% endif %}
        </li>
    {% endfor %}
</ul>
```

**4- ticket_detail.html:**

`templates/social/ticket_detail.html`

```jinja
<h2>ticket: {{ ticket.subject }}</h2>

<strong>Body:</strong> {{ ticket.content | linebreaks }}
<br>
{{ ticket.created_at }}
<hr>
{% if ticket.is_opened %}
    <em>it's open</em>
{% else %}
    <em>it closed</em>
{% endif %}

<h2>Reply:</h2>

<ul>
    {% for response in ticket.reply_to_ticket.all %}
        <li>{{ response.reply }} <br><hr> {{ response.responded_at }}</li>
    {% endfor %}
</ul>
```

<hr>

#### **T2- نمایش لیست followers با لیست following با کلیک روی آنها:**

میخواهیم برای کاربرها جایی که تعداد following و followers را نشان میدهد، به آنها لینک بدهیم تا به صفحه جدید رفته و در آن لیست followers یا لیست following آن کاربر را نشان دهد.

**ایجاد URL برای لیست following و followers:**

`app directory/urls.py`

```python
urlpatterns = [
    path('user_contacts/<str:username>/<str:rel>/', views.user_contacts, name='user_contacts'),
]
```

**توضیحات:**

1- با استفاده از username کاربری که در صفحه وی هستیم، و میخواهیم لیست followers یا following را ببینیم را از دیتابیس دریافت میکنیم.

2- **متغیر rel:** رابطه را مشخص میکند، اینکه میخواهیم لیست following ویا followers را ببینیم.

**ایجاد view برای لیست following و followers:**

`app directory/views.py`

```python
def user_contacts(request, username, rel):
    user = get_object_or_404(User, username=username, is_active=True)

    if rel == 'followers':
        contacts = user.followers.all()
    elif rel == 'following':
        contacts = user.following.all()
    else:
        contacts = None

    context = {
        'users': contacts,
        'rel': rel,
    }

    return render(request, "user/user_list.html", context=context)
```

**ایجاد لینک برای following و followers:**

`templates/user/user_detail.html`

```jinja
<!-- ------------ following و followers نمایش تعداد-------------- -->
{% with total_followers=user.followers.count total_following=user.following.count %}

    <a href="{% url 'social:user_contacts' user.username "following" %}">
        <strong>following:</strong>
    </a>
     <span class="following-count">{{ total_following }} Following</span>

    <br><br>

    <a href="{% url 'social:user_contacts' user.username "followers"  %}">
        <strong>followers:</strong>
    </a>
     <span class="followers-count">{{ total_followers }} Followers{{ total_followers | pluralize }}</span>

{% endwith %}
```

**کد کامل:**

`templates/user/user_detail.html`

```jinja
{% load static %}
{% load thumbnail %}

<!-- --------------------- نمایش تصویر پروفایل --------------------- -->
{% if user.profile_image %}
    <a href="{{ user.profile_image.url }}">
        <img src="{% thumbnail user.profile_image 150x0 quality=80 %}" alt="profile_image">
    </a>
{% else %}
    <img src="{% static 'images/profile/avatar.png' %}" alt="default_image" width="150px">
{% endif %}

<!-- --------------------- نمایش اسم کاربر --------------------- -->
<br><br>
hello I'm {{ user.get_full_name | default:user.username }}
<br><br>

<!-- --------------------- دکمه Follow ----------------------- -->
{% if user != request.user %}
    <button class="follow-button">
        {% if request.user in user.followers.all %}
            UnFollow
        {% else %}
            Follow
        {% endif %} 
    </button>
{% endif %} 
<hr>

<!-- ------------ following و followers نمایش تعداد-------------- -->
{% with total_followers=user.followers.count total_following=user.following.count %}
    <a href="{% url 'social:user_contacts' user.username "following" %}"><strong>following:</strong></a> <span class="following-count">{{ total_following }} Following</span>
    <br><br>
    <a href="{% url 'social:user_contacts' user.username "followers"  %}"><strong>followers:</strong></a> <span class="followers-count">{{ total_followers }} Followers{{ total_followers | pluralize }}</span>
{% endwith %}

<!-- ----------------- نمایش اطلاعات اضافی کاربر ----------------- -->

{% if user.bio %}Bio: {{ user.bio }}{% endif %} 
{% if user.job %}Job: {{ user.job }}{% endif %} 
{% if user.birth_date %}Date of Birth: {{ user.birth_date }}{% endif %} 

<!-- --------------------- ajax ساختار کد ----------------------- -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>


<script>
    $(document).ready(function (){
        $('.follow-button').click(function (){
            let followButton = $(this);

            $.ajax({
                type: 'POST',
                url: '{% url 'social:user_follow' %}',
                data: {'csrfmiddlewaretoken': '{{ csrf_token }}', 'user_id': '{{user.id}}'},
                success: function(response){
                    if (response.followed){
                        followButton.text('UnFollow');
                    } else {
                        followButton.text('Follow');
                    }
                    $('.followers-count').text(response.followers_count + 'Followers{{ total_followers | pluralize }}');
                    $('.following-count').text(response.following_count + 'Following');
                }
            })
        })
    })
</script>
```

**تغییر تمپلیت user_list.html:**

برای نمایش لیست following با لیست followers از همان تمپلیت user_list استفاده میکنیم، البته میتوان تمپلیت مجزایی نیز استفاده کرد.

`templates/user/user_list.html`

```jinja
{% load thumbnail %}
{% load static %}

<h1>
    {% if rel %}
        <!-- following or followers -->
        {{ rel }}
    {% else %}
        All Users
    {% endif %} 
</h1>

<!-- ——————————————————————— user's list ——————————————————————— -->

{% for user in users %}
    <!-- ---------  نمایش تصویر پروفایل  --------- -->
    {% if user.profile_image %}
        <a href="{{ user.get_absolute_url }}">
            <img src="{% thumbnail user.profile_image 100x100 quality=80 %}" alt="profile-image">
        </a>
    {% else %}
        <a href="{{ user.get_absolute_url }}">
            <img src="{% static 'images/profile/avatar.png' %}" alt="avatar">
        </a>
    {% endif %}

    <!-- ---------- نمایش اسم کاربر ---------- -->
    <a href="{{ user.get_absolute_url }}"> {{ user.get_full_name }} </a><br><br>
{% endfor %}
```

-------------------------------------------------------------

#### **T3- قابلیت اشتراک گذاری برای پست ها:**

>برای قابلیت اشتراک گذاری از پکیج **django-social-share** استفاده میکنیم.

1\. نصب پکیج **django-social-share**:

`terminal`

```terminal
pip install django-social-share
```

2\. پیکربندی ها و تنظیمات لازم:

Ⅰ- پس از نصب، نیاز است که این پکیج را به لیست اپلیکیشن‌های نصب‌شده اضافه کنید:

`project directory/settings.py`

```python
INSTALLED_APPS = [
    # ...
    'django_social_share',
]
```

Ⅱ- همچنین باید django.template.context_processors.request را به لیست context_processors اضافه کنید تا تگ‌ها بتوانند از scheme  و host_name به طور صحیح استفاده کنند:

`project directory/settings.py`

```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates']
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                # ...
                'django.template.context_processors.request',
            ],
        },
    },
]
```

> **براساس توضیحات داکیومنت django-social-share:**
>
> در بیشتر موارد، اشتراک‌گذاری کار نخواهد کرد اگر از localhost استفاده کنید یا دامنه شما از اینترنت عمومی قابل دسترسی نباشد. برای تست در محیط توسعه محلی، می‌توانید از سرویس‌هایی مانند ngrok استفاده کنید و دامنه Site instance خود را به hostname ارائه شده توسط ngrok تنظیم کنید.

**شیوه استفاده:**

```jinja
{% load social_share %}

{% post_to_facebook <object_or_url> <link_text> <link_class> %}
{% post_to_gplus <object_or_url> <link_text> <link_class> %}
{% post_to_twitter <text_to_post> <object_or_url> <link_text> <link_class> %}
{% post_to_linkedin <object_or_url> <link_class> %}
{% send_email <subject> <text_to_post> <object_or_url> <link_text> <link_class> %}
{% post_to_reddit <text_to_post> <object_or_url> <link_text> <link_class> %}
{% post_to_telegram <text_to_post> <object_or_url> <link_text>  <link_class> %}
{% post_to_whatsapp <object_or_url> <link_text> <link_class> %}
{% save_to_pinterest <object_or_url>  <link_class> %}
{% copy_to_clipboard <object_or_url> <link_text> <link_class> %}

{% add_pinterest_script %} // Required for save_to_pinterest. Add to the end of body tag.
{% add_copy_script %} // Required for copy_to_clipboard. Add to the end of body tag.
```

هر تگ قالب django-social-share یک یا چند پارامتر می‌پذیرد. این پارامترها می‌توانند شامل موارد زیر باشند:

1. **متغیر <object\_or\_url\>:** این پارامتر می‌تواند یک آبجکت مدل جنگو یا یک URL باشد. اگر یک آبجکت مدل را پاس بدهید، از متد get_absolute_url آن استفاده می‌شود. اگر از پکیج django_bitly استفاده کنید، URL کوتاه شده نیز تولید می‌شود.

2. **متغیر <text\_to\_post\>:** متنی که می‌خواهید در پست به اشتراک گذاشته شود. می‌تواند شامل کدهای قالب جنگو باشد.

3. **متغیر <link\_text\>:** متن لینک که به عنوان متن anchor در تگ <a\> استفاده می‌شود. اگر مشخص نشود، مقادیر پیش‌فرض مانند 'Post to Facebook' یا 'Post to Twitter' استفاده می‌شوند. / در مثال زیر آیکون شبکه های اجتماعی را نمایش میدهیم.

4. **متغیر <link\_class\>:** کلاس‌های CSS که به لینک <a\> اعمال می‌شوند. می‌توانید از آن برای استایل‌دهی به لینک‌های اشتراک‌گذاری استفاده کنید. / مثلا اگر مقدار social برایش مشخص کنیم، اسم کلاس تگ a ایجاد شده social خواهد بود.

5. **متغیر <subject\>:** موضوع ایمیل (برای تگ send_email). این می‌تواند شامل کدهای قالب جنگو نیز باشد.

**بریم چند نمونه ببینیم:**

```jinja
{% load social_share %}

{% post_to_facebook object_or_url '<i class="fa-brands fa-facebook"></i>' "social" %}
{% post_to_twitter 'post from django' object_or_url '<i class="fa-brands fa-x-twitter"></i>' "social" %}
{% post_to_telegram 'post from django' object_or_url '<i class="fa-brands fa-telegram"></i>' "social" %}
{% post_to_whatsapp object_or_url '<i class="fa-brands fa-whatsapp"></i>' "social" %}

{% copy_to_clipboard object_or_url 'copy to clipboard' %}
```

> تمامی فایل‌های قالب در مسیر django_social_share/templatetags/ قرار دارند که شامل قالب‌های اشتراک‌گذاری برای هر یک از شبکه‌های اجتماعی و ایمیل و کپی به کلیپ‌بورد می‌شوند. این قالب‌ها را می‌توانید بر اساس نیاز خود تغییر دهید و شخصی‌سازی کنید.

-----------------------------------------------------------------

#### **T4- ثبت فعالیت های اخیر کاربر:**

**فعالیت اخیر کاربر؛** طی 24 ساعت گذشته، کاربر چه افرادی را فالو کرده، چه افرادی وی را فالو کرده اند و همچنین پست های اخیری که لایک کرده را نمایش دهیم.

> برای نمایش فعالیت های اخیر کاربر (following, followers, پست هایی که اخیرا لایک و یا ذخیره کرده است)؛ باید آنها، فیلد زمان داشته باشند، اما در پروژه فعلی فقط following, followers دارای فیلد زمان هستند.

-------------------------------------------------------------------

#### **T5- ارسال کامنت با AJAX:**

a- **ایجاد مدل کامنت:**

`app directory/models.py`

```python
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_comments')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_comments')
    content = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['-created_at'])]

    def __str__(self):
        return self.content
```

b- **ایجاد فرم کامنت:**

`app directory/forms.py`

```python
class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['content']
```

c- **ایجاد URL برای افزودن کامنت:**

`app directory/urls.py`

```python
urlpatterns = [
    path('comments/<int:post_id>', views.add_comment, name='add_comment'),
]
```

d- **تغییر view برای post_detail و ایجاد view برای افزدن کامنت:**

`app directory/views.py`

```python
def post_detail(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    # for similar post's
    post_tags_ids = post.tags.values_list('id', flat=True)
    similar_posts = Post.objects.filter(tags__in=post_tags_ids)
    similar_posts = similar_posts.annotate(same_tags=Count('tags')).exclude(id=pk).order_by('-same_tags', '-created')[:3]

    # for comment
    comment_form = CommentForm()

    comments = post.post_comments.all()

    context = {
        'post': post, 
        'similar_posts': similar_posts,
        'comment_form': comment_form,
        'comments': comments,
        }

    return render(request, 'social/post_detail.html', context=context)

# ————————————————————————————————————————————————————————————————————————
def add_comment(request, post_id):
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            post = get_object_or_404(Post, pk=post_id)

            comment = form.save(commit=False)
            comment.post = post
            comment.user = request.user
            comment.save()

            response = {
                'user': comment.user.username,
                'content': comment.content,
                'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'comments_count': post.post_comments.count()
            }
            return JsonResponse(response)
    else:
        return JsonResponse({'status': 'error', 'errors': 'Invalid data!'})
```

e- **تغییر تمپلیت post_detail-ارسال کامنت با ajax:**

ساختار کد post_detail.html طولانی هست، برای درک راحت تر فقط کد مربوط به کامنت را نمایش میدهیم؛ کدهای مربوط به کامنت بعد از پست های مشابه نوشته میشود.

`templates/social/post_detail.html`

```jinja
<h3>Comment Form</h3>

<form id="comment-form" method="post">
    {% csrf_token %}

    {{ form.as_p }}<br><br>
    <input type="submit" value="send comment">
</form>

<p class="comment-count">تعداد کامنت‌ها: {{ comments.count }}</p>

<h3>Comments List</h3>

<div id="comments">
    {% for comment in comments %}
        <p>User: {{ comment.user.username }}</p>
        <div>{{ comment.content | linebreaks }} - {{ comment.created_at }}</div>
        <hr>
    {% empty %}
        <p>هیچ کامنتی وجود ندارد.</p>
    {% endfor %}
</div>

<!-- ————————————————————————— Scripts ————————————————————————— -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script>
    $(document).ready(function() {
        $('#comment-form').submit(function(event) {
            event.preventDefault(); // جلوگیری از ارسال فرم به صورت پیش‌فرض

            let formData = $(this).serialize(); // دریافت داده‌های فرم

            $.ajax({
                url: '{% url "social:add_comment" post.id %}', // آدرس view برای ارسال داده‌ها
                type: 'POST',
                data: formData,
                success: function(response) {
                    let commentUser = '<p>' + 'User: ' + response.user + '</p>';
                    let commentContent = '<div>' + response.content + ' - ' + response.created_at + '</div>';

                    $('#comments').prepend(commentUser + commentContent + '<hr>');

                    $('#comment-form')[0].reset(); // پاک کردن فرم برای ورود داده جدید
                    $('.comment-count').text('تعداد کامنت ها: ' + response.comments_count)
                },
                error: function(xhr, status, error) {
                    console.error('خطا در ارسال اطلاعات:', error);
                    alert('خطایی در ارسال کامنت رخ داده است.');
                }
            });
        });
    });
</script>
```

#### **T6- تکمیل خودکار اطلاعات کاربر با مقادیر پیشفرض با استفاده از **signal**:**

نوشتن سیگنال مدنظر در signals.py.

`app directory/signals.py`

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import *


@receiver(post_save, sender=User)
def complete_profile(sender, instance, created, **kwargs):
    if created:
        instance.first_name = 'نام پیش‌فرض'
        instance.last_name = 'نام خانوادگی پیش‌فرض'
        instance.email = 'example@gmail.com'
        instance.bio = 'توضیحات پیش‌فرض'
        instance.job = 'شغل پیش‌فرض'
        instance.birth_date = '2001-01-01'

        instance.save()
```

#### **T7- نوشتن اکشنی که وضعیت فعلی پست را نویسنده اش ایمیل کند:**

`app directory/admin.py`

```python
from django.core.mail import send_mail

# ——————————————————————————— Actions ———————————————————————————
def post_status(modeladmin, request, queryset):
    for post in queryset:
        if post.active:
            status = 'Active'
        else:
            status = 'Inactive'

        send_mail(
            "Post_status",
            f"your post with id: {post.id} => is {status}",
            'sender@gmail.com',
            [post.author.email],
        )

    modeladmin.message_user(request, "Post status, was sent")

# ————————————————————————— Model Admins —————————————————————————

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'updated', 'created']
    ordering = ['-created', '-author']
    search_fields = ['author', 'description']

    actions = [deactivate_post, activate_post, post_status]
```
<center>

***پایان تمرینات***

</center>

<hr>

### نکات اضافی

**نکته 1:**

در جنگو برای محدود کردن **کوئری ست** انتخاب شده از slicing استفاده میکنیم.

> <span class="en-text">Post.objects.all()[:5]</span>

**نکته 2:**

**slicing در تمپلیت:**

با استفاده از تمپلیت فیلتر slice این کار را انجام میدهیم.

> <span class="en-text">{{ variable | slice:'0:5' }}</span>

**نکته 3:**

**indexing در تمپلیت:**

> posts.3

**نکته 4:**

**تمپلیت فیلتر divisibleby:**

برای بررسی بخش پذیر بودن

divisibleby:2 => یعنی بخش پذیر بر 2

> مثلا میخواهیم پست های زوج یک استایل و پست های فرد یک استایل دیگر داشته باشند.

```jinja
{% for post in posts %}
    {% if forloop.counter0 | divisibleby:2 %}
        اقدامات مربوط به پست های زوج
    {% else %}
        اقدامات مربوط به پست های فرد
    {% endif %} 
{% endfor %}
```

**نکته 5:**

اگه makemigrations کار نمیکرد، از دستور (makemigrations --empty app_name) استفاده میکنیم.

**نکته 6:**

**دستور request.build_absolute_uri:** آدرس URL مطلق را برمیگرداند.

### ویژگی های جدید برای پروژه

**آخرین کاربرانی که عضو سایت شده اند:**

نمایش کاربرانی که به تازگی در وبسایت عضو شده اند.

مدل User یک فیلد بنام date_joined دارد که تاریخ join شدن کاربر در وبسایت را رمیگرداند.

> User.objects.filter(is_active=True).order_by('-date_joined')[:10]

**نمایش followers و following از جدید به قدیم:**

`app directory/models.py`

```python
class User(models.Model):
    # ...

    def get_following(self):
        return [contact.user_to for contact in self.rel_from_set.all().order_by("-created")]

    def get_followers(self):
        return [contact.user_from for contact in self.rel_to_set.all().order_by("-created")]
```

**توضیحات:**

متغیر contact یک آبجکت از مدل Contact میباشد که هر دو فیلد user_to و user_from را در خود دارد.

**user_to:**  برای هر کدام از آبجکت های contact فالوشوندگان (following) را برمیگرداند.

**user_from:** برای هر کدام از آبجکت های contact فالوکنندگان (followers) را برمیگرداند.

**توضیحات بیشتر:**

> با استفاده از related_name های rel_from_set و rel_to_set؛ کوئری ستی که برگردانده میشود شامل آبجکت های مدل Contact هستند.

**rel_from_set:** آبجکت هایی (از مدل Contact) که در آنها کاربر (self) جزء فالو کنندگان(followers) میباشد را برمیگرداند. / اگر ما جزء followers کاربران دیگر باشیم مسلما آنها در لیست following ما قرار دارند.

> <span class="en-text">user follows x.</span>    
> <span class="en-text">user follows y.</span>    
> <span class="en-text">user follows z.</span>    
> <span class="en-text">...</span>

**rel_to_set:**  آبجکت هایی (از مدل Contact) که در آنها کاربر (self) جزء فالو شوندگان(following) میباشد را برمیگرداند. / اگر ما جزء following کاربران دیگر باشیم مسلما آنها در لیست followers ما قرار دارند.

> <span class="en-text">a follows user.</span>    
> <span class="en-text">b follows user.</span>    
> <span class="en-text">c follows user.</span>    
> <span class="en-text">...</span>

در توابع ایجاد شده  **self** نشان دهنده یک کاربر هست.

> علامت (=>) در معنای **معادل است** استفاده شده است.

```python
user.rel_from_set.all() => Contact.objects.filter(user_from=user)

user.rel_to_set.all() => Contact.objects.filter(user_to=user)
```

متغیر user نشان دهنده یک کاربر میباشد.
