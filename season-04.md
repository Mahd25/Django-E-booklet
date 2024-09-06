## فصل چهارم: اپلیکیشن بلاگ(بخش دوم)

### متد ایجاد URL برای پست ها

متد ایجاد url برای مدل ها استفاده میشود. / این متد مثل تمپلیت تگ {% url %} که برای url ها استفاده میشود کاربرد دارد.

در بدنه این متد از تابع <span class="en-text">reverse()</span> استفاده میکنیم. / لازمه قبل از استفاده، reverse را ایمپورت کنیم.

`app directory/models.py`

```python
from django.url import reverse
```

از این متد داخل کلاس های ایجاد شده در models.py استفاده میکنیم. / اسم این متد get_absolute_url هست.

تابع reverse چندین آرگومان دارد، اولین و مهم ترین آنها viewname هست که میتواند یک الگوی url باشد. | آرگومان های args و kwargs عملکرد تقریباً یکسانی دارند ولی نمیتوان همزمان از هر دو استفاده کرد(در ادامه کامل تر و با مثال توضیح داده میشوند).

برای آدرس url از الگوی app_name:name-in-path استفاده میکنیم.

خب بریم این متد را برای url جزئیات پست پیاده سازی کنیم. / url مربوط به post_detail:

`app directory/urls.py`

```python
app_name = 'blog'

urlpatterns = [
    # ...
    # URL For Post-Detail
    path('posts/<int:id>', views.post_detail, name="post_detail")
]
```

خب url ما دارای بخش ثابت و یک متغیر میباشد(اسم متغیر id هست)./ اگر متغیر داشته باشیم از args ویا kwargs استفاده میکنیم.

آرگومان args: یک لیست یا تاپل است که مقادیر متغیرهای موجود در URL را به ترتیب مشخص می‌کند. در args ترتیب بسیار مهم است، زیرا این مقادیر باید به ترتیب پارامترهایی که در مسیر URL تعریف شده‌اند قرار گیرند.

آرگومان kwargs: یک دیکشنری است که کلیدهای(key) آن نام متغیرهایی است که در URL وارد کرده‌ایم(در این مثال id اسم متغیر میباشد) و مقدارهای(value) آن مقادیر متغیرها است. در kwargs ترتیب اهمیتی ندارد.

در اینجا منظور از متغیر id در واقع آیدی هر پست میباشد./ آیدی هر پست را با استفاده از post.id بدست می آوریم ولی در کلاس از self به عنوان هر instance از آن کلاس استفاده میکنیم پس برای هر پست از self.id استفاده میکنیم.

براساس این url میخواهیم  متد get_absolute_url را ایجاد کنیم.

`app directory/models.py`

```python
# structure
def get_absolute_url(self):
    return reverse('app_name:name', <args or kwargs>)
# -------------------------
# first mode:
def get_absolute_url(self):
    return reverse('blog:post_detail', args=[self.id])

# second mode:
def get_absolute_url(self):
    return reverse('blog:post_detail', kwargs={'id': self.id})
```

خب بریم این متد را توی مدل Post ببینیم(انتهای کد):

`app directory/models.py`

```python
from django.db import models
from django.utils import timezone
from django.urls import reverse


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DF', 'Draft'
        PUBLISHED = 'PB', 'Published'
        REJECTED = 'RJ', 'Rejected'

    # field for the selected mode (using the top class)
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.DRAFT)

    # Relational field(Many To One)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_posts")

    # title of the post
    title = models.CharField(max_length=250)
    # post description
    description = models.TextField()
    # The main part of the address is after the domain name
    slug = models.SlugField(max_length=250)

    # Date
    # post publish date
    publish = models.DateTimeField(default=timezone.now)
    # post creation date
    created = models.DateTimeField(auto_now_add=True)
    # post update date
    updated = models.DateTimeField(auto_now=True)

    # -------------------------------------------------------------------------
    objects = models.Manager()
    published = PublishedManager()
    # -------------------------------------------------------------------------

    # To sort the table
    class Meta:
        # Sort by
        ordering = ['-publish'] # (-) is used to reverse the sort. => sort by latest post
        # Indexing by
        indexes = [
            models.Index(fields=['-publish'])
            ]

    # -------------------------------------------------------------------------        

    # first mode:
    # def get_absolute_url(self):
    #     return reverse('blog:post_detail', kwargs={'id': self.id})

    # second mode:
    def get_absolute_url(self):
        return reverse('blog:post_detail', args=[self.id])

    def __str__(self):
        return self.title
```

حالا هرجا خواستیم از url مربوط به post_detail استفاده کنیم میتوان از حالت زیر استفاده کرد/ حتی میتوان در تمپلیت ها از آن استفاده کرد:

```python
post.get_absolute_url
```

```jinja
{{ post.get_absolute_url }}
```

<center>

### forloop

</center>

> تمپلیت تگ for در  جنگو؛ از یک متغیر داخلی به نام forloop استفاده می‌کند که شامل اطلاعاتی درباره‌ی حلقه‌ی فعلی است. این متغیر دارای چندین ویژگی است که به تحلیل و کنترل حلقه کمک می‌کند(از forloop میتوان برای مدیریت حلقه‌ها استفاده کرد).
>
> >متغیر forloop، در هر iteration (هر مرحله پیمایش حلقه) شامل اطلاعات مفیدی میباشد.
> >
> >مفهوم iteration: به معنای پیمایش روی یک لیست یا مجموعه از آبجکت ها است(با استفاده از حلقه for)
>
> **ویژگی‌های اصلی forloop عبارتند از:**
>
> 1. **forloop.counter:** این ویژگی نشان‌دهنده‌ی شماره‌ی فعلی از حلقه است. مقدار این ویژگی از ۱ شروع شده و با هر ایتریشن یکی افزایش می‌یابد.
>
> 2. **forloop.counter0:** این ویژگی مانند forloop.counter است، با این تفاوت که شمارش از صفر شروع می‌شود. این برای مواقعی که شماره‌گذاری از صفر مهم است (مانند استفاده در آرایه‌ها و لیست‌ها که شماره‌گذاری از صفر طبیعی‌تر است) مفید است.
>
> 3. **forloop.revcounter:** این ویژگی نشان‌دهنده‌ی شماره‌ی فعلی از حلقه است، اما شمارش از آخر به اول انجام می‌شود. | مثلا اگر 4 آبجکت داشته باشیم از 4 شروع میشود و در مرحله یکی کم میشود.
>
> 4. **forloop.revcounter0:** مانند forloop.revcounter، اما شمارش از آخر به اول و با شماره‌گذاری از صفر.
>
> 5. **forloop.first:** یک مقدار بولی است که نشان می‌دهد آیا این ایتریشن اولین ایتریشن حلقه است یا خیر.
>
> 6. **forloop.last:** یک مقدار بولی است که نشان می‌دهد آیا این ایتریشن آخرین ایتریشن حلقه است یا خیر.
>
> 7. **forloop.parentloop:** این ویژگی وجود دارد تنها اگر شما در یک حلقه دیگر (یک حلقه درونی) داخل حلقه‌ی اصلی هستید، و اطلاعات حلقه اصلی را ارائه می‌دهد.

### صفحه بندی (pagination)

زمانی که میخواهیم چندین داده مثل لیست محصولات و یا پست ها را در یک صفحه نمایش بدهیم ولی تعداد آنها زیاد است از صفحه بندی استفاده میکنیم.

صفحه بندی کمک میکنه تا بجای نمایش همه اطلاعات در یک صفحه  و به صورت یکجا آنها را به صفحات کوچک تقسیم کنیم

برای صفحه بندی در این فصل از دو روش استفاده میکنیم، روش اول را در این concept و روش دوم را در concept بعدی توضیح میدهیم.

برای شروع لازمه در اسکریپت views.py، کلاس Paginator را ایمپورت کنیم.

`app directory/views.py`

```python
from django.core.paginator import Paginator
```

خب بریم سراغ view که قراره صفحه بندی بشه.
 / ما میخواهیم post_list را که قراره تمام پست های منتشر شده را نمایش بدهد صفحه بندی بکنیم، پس به سراغ view لیست پست ها میرویم.

1- ابتدا یک QuerySet از داده های خود ایجاد میکنیم، ما تمام پست های منتشر شده را از دیتابیس دریافت میکنیم.

`app directory/views.py`

```python
posts_list = Post.published.all()
```

2- یک نمونه از کلاس Paginator ایجاد میکنیم. / حالا داخل پرانتزهای آن دو مقدار را مشخص میکنیم، اولین مقدار: QuerySet هست که در مرحله قبل دریافت کردیم | دومین مقدار: یک عدد هست که مشخص میکنیم در هر صفحه چندتا از داده ها (در مثال ما Post) نمایش داده شود.

`app directory/views.py`

```python
paginator = Paginator(posts_list, 10)
```

---

نکته: request.GET، یکسری اطلاعات را از صفحه دریافت میکنه و آنها را در قالب یک دیکشنری برمیگرداند.(پس request.GET یک دیکشنری میباشد)

نکته: متد <span class="en-text">get()</span> مربوط به دیکشنری هاست که به عنوان آرگومان اول برایش مشخص میکنیم چه کلیدی را از دیکشنری برایمان دریافت کنه و برای آرگومان دوم که اختیاری است برایش یک مقداری را مشخص میکنیم، حالا اگه این کلید(مقدار آرگومان اول) وجود نداشت این مقدار پیشفرض را نشان میدهد.

3- فرض کنیم کاربر در صفحه 5 هست و روی صفحه 2 کلیک میکنه، خب حالا برای اینکه بفهمیم چه صفحه ای را قراره نمایش بدهیم(کاربر چه صفحه ای را میخواهد ببینه) از روش زیر استفاده میکنیم(در مثال ما صفحه 2 را برمیگرداند) | پیشفرض را صفحه 1 در نظر گرفته ایم:

`app directory/views.py`

```python
page_number = request.GET.get('page', 1)
```

4- خب حالا بریم اطلاعات صفحه ای که کاربر در مرحله قبل انتخاب کرده را بدست بیاوریم(مثلا صفحه 2):

`app directory/views.py`

```python
page_obj = paginator.page(page_number)
```

متغیر page_obj شامل: لیست اقلام (پست های صفحه فعلی) و اطلاعات مربوط به صفحه بندی (شماره صفحه فعلی، تعداد کل صفحات، تعداد کل پست ها و...) 

 در صفحه بندی قرار نیست کل پست ها را در یک صفحه نمایش بدیم پس page_obj که شامل پست های صفحه فعلی میباشد را به تمپلیت ارسال میکنیم.

#### متغیر page_obj متدهایی دارد در اینجا چند مورد را توضیح میدهیم:

1- عبارت page_obj.number: شماره صفحه فعلی که در آن قرار دارید. برای مثال، اگر در صفحه 3 باشید، page_obj.number برابر با 3 خواهد بود.

2- عبارت page_obj.has_next: یک بولین (True/False) که نشان می‌دهد آیا صفحه بعدی برای نمایش وجود دارد یا خیر.(بررسی میکند صفحه بعدی وجود داره یا نه)

3- عبارت page_obj.has_previous: یک بولین که نشان می‌دهد آیا صفحه قبلی برای نمایش وجود دارد یا خیر.(بررسی میکند صفحه قبلی وجود داره یا نه)

4- عبارت page_obj.next_page_number: شماره صفحه بعدی در صورت وجود، مشخص می‌کند که بعد از صفحه فعلی کدام صفحه نمایش داده خواهد شد.(شماره صفحه بعدی را برمیگرداند)

5- عبارت page_obj.previous_page_number: شماره صفحه قبلی در صورت وجود، مشخص می‌کند که قبل از صفحه فعلی کدام صفحه نمایش داده شده بود.(شماره صفحه قبلی را برمیگرداند)

---

خب بریم ساختار view را ببینیم:

`app directory/views.py`

```python
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


def post_list(request):
    posts_list = Post.published.all()

    paginator = Paginator(posts_list, 10)
    page_number = request.GET.get('page', 1)

    try:
        page_obj = paginator.page(page_number)
    except EmptyPage:
        # تعداد صفحات را برمیگرداند که ما به عنوان شماره صفحه آخر از آن استفاده میکنیم
        page_obj = paginator.page(paginator.num_pages)
    except PageNotAnInteger:
        page_obj = paginator.page(1)

    context = {
        'page_obj': page_obj,
    }

    return render(request, 'blog/list.html', context)
```

 توی url صفحه مربوطه (یعنی url پست لیست ها، در بخش url مرورگر) عبارت (<span class="en-text">?page=page-number</span>) نشان میدهد در صفحه چندم از صفحه بندی هستیم.

چنانچه کاربری در url، در بخش page-number شماره صفحه ای را وارد کند که وجود ندارد خطا می دهد، برای مدیریت استثنا از EmptyPage استفاده کرده و برایش مشخص میکنیم که صفحه آخر را نشان دهد.

در حالتی دیگر ممکن است کاربر در url، برای شماره صفحه رشته بنویسد این هم موجب خطا میشه برای رفع این استثنا از PageNotAnInteger استفاده میکنیم و این بار مشخص میکنیم که صفحه اول را نمایش دهد.

---

#### ایجاد لینک ها و ساختار صفحه بندی برای تمپلیت

میتوان ساختار مربوط به صفحه بندی را در تمپلیت post_list بنویسیم ولی چون ممکن است در بخش های مختلف وبسایت به صفحه بندی نیاز داشته باشیم، تمپلیت pagination را جداگانه میسازیم و هر جا نیاز داشتیم با کمک {% include %} از آن استفاده میکنیم.

اول یک ساختار ساده جهت درک بخش های مهم نوشته میشه و در ادامه ساختار با جزئیات بیشتر ارائه میشود.

> متغیر page همان متغیر page_obj خواهد بود که در ادامه داخل {% include %} تعریفش میکنیم.

`templates/partials/pagination.html`

```jinja
<div class="pagination">

    <!-- بررسی میکند که قبل از صفحه فعلی صفحه ای وجود داره -->
    {% if page.has_previous %}
        <!-- با کلیک روی لینک به آدرس صفحه قبل میرود -->
        <a href="?page={{ page.previous_page_number }}">previous</a>
    {% endif %}

    <!-- نشان میدهد در صفحه چندم از کل صفحات هستیم -->
    page {{ page.number }} of {{ page.paginator.num_pages }}

    <!-- بررسی میکند که بعد از صفحه فعلی صفحه ای وجود داره -->
    {% if page.has_next %}
        <!-- با کلیک روی لینک به آدرس صفحه بعدی میرود -->
        <a href="?page={{ page.next_page_number }}">next</a>
    {% endif %}

</div>
```

ساختار با جزئیات بیشتر:

`templates/partials/pagination.html`

```jinja
<div class="pagination">
    {% if page.has_previous %}
        <a href="?page={{ page.previous_page_number }}">« قبلی</a>
        {% if page.number > 3 %}
            <a href="?page=1">1</a>
            {% if page.number > 4 %}
                <span>...</span>
            {% endif %}
        {% endif %}
    {% endif %}

    {% for num in page.paginator.page_range %}
        {% if page.number == num %}
            <a href="?page={{ num }}">{{ num }}</a>
        {% elif num > page.number|add:'-3' and num < page.number|add:'3' %}
            <a href="?page={{ num }}">{{ num }}</a>
        {% endif %}
    {% endfor %}

    {% if page.has_next %}
        {% if page.number < page.paginator.num_pages|add:'-3' %}
            <span>...</span>
            <a href="?page={{ page.paginator.num_pages }}">{{ page.paginator.num_pages }}</a>
        {% elif page.number < page.paginator.num_pages|add:'-2' %}
            <a href="?page={{ page.paginator.num_pages }}">{{ page.paginator.num_pages }}</a>
        {% endif %}

        <a href="?page={{ page.next_page_number }}">بعدی »</a>
    {% endif %}

</div>
```

عبارت page_range: بازه صفحات را نشان میدهد مثلا اگر 7 صفحه داشته باشیم، میشه <span class="en-text">(1, 7)</span>.

---

این بار ما "page_obj" را که پست های صفحه را در خود دارد بجای "posts" به تمپلیت "post_list" ارسال کرده ایم پس هرجا "posts" داریم باید با "page_obj" جایگزین کنیم.

خب حالا وقتشه بریم "pagination" را به تمپلیت "post_list" اضافه کنیم | در انتهای کد قابل مشاهده است:

`templates/blog/post_list.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Post Lists {% endblock %}

{% block head %}
    <link rel="stylesheet" href="{% static 'css/style.css' %}">
{% endblock %}

{% block content %}
    <div class="container">
        {% for post in page_obj %}
            <div class="post">
                <a href="{% url blog:post_detil post.id %}">{{ post.title }}</a>
                <p>{{ post.description|truncatewords:5 }}</p>
            </div>
        {% endfor %}
    </div>

    {% include 'partials/pagination.html' with page=page_obj %}

{% endblock %}

```

> در کد بالا، داخل تمپلیت تگ {% include %}، به کمک "with" متغیر "page" را ایجاد کرده و آنرا برابر با "page_obj" قرار داده ایم. | از این متغیر "page" داخل همین تمپلیت "pagination" استفاده شده.

### View های مبتنی بر کلاس (Class-based views)

ساختار "view" هایی که ایجاد میکنیم، دو حالت دارد: 1- "view" بر مبنای تابع(function) هستند 2- "view" بر مبنای کلاس

خود جنگو، "view" های مبتنی بر کلاس  به صورت built-in دارد. | این "view" ها باید ایمپورت بشوند.

ما در اینجا از "ListView" و "DetailView" استفاده میکنیم.

برای "view" لیست پست ها این بار از "ListView" استفاده میکنیم:

`app directory/views.py`

```python
from django.view.generic import ListView
```

یک کلاس ایجاد میکنیم که از "ListView" ارث بری میکنه. | حالا اتریبیوت ها و متد های مورد نیاز را override میکنیم. | از اتریبیوت کلاس استفاده میکنیم

1- با استفاده از اتریبیوت "model" و مشخص کردن مدل مربوطه تمام پست ها را شامل میشود ولی چون ما فقط پست های منتشر شده را میخواهیم از اتریبیوت  "queryset" استفاده کرده و پست های منتشر شده را انتخاب میکنیم.

2- برای مشخص کردن تمپلیت مربوطه از اتریبیوت "template_name" باید استفاده کنیم.

3- در concept قبلی در مورد صفحه بندی صحبت کردیم اینجا روش دوم را بیان میکنیم، اینجا فقط کافیه مشخص کنیم در هر صفحه چند پست نمایش داده شود و این کار را با اتریبیوت "paginate_by" انجام میدهیم. | نکته مهم اینه که حتما از "page_obj" در تمپلیت تگ {% include %} برای ایجاد متغیر "page" استفاده کرده باشیم.

4- وقتی از تابع برای view استفاده می کنیم به کمک context لیست پست ها را به تمپلیت ارسال میکنیم حالا برای این کار از اتریبیوت "context_object_name" استفاده کرده  و یک اسم برایش مشخص میکنیم حالا  میتوانیم با آن نام در تمپلیت به تمام پست های منتشر شده که در مرحله "1" مشخص کرده ایم دسترسی داشته باشیم.

`app directory/views.py`

```python
from django.view.generic import ListView, DetailView


class PostListView(ListView):
    # تمام پست های منتشر شده را انتخاب میکنیم
    queryset = Post.published.all()

    # مسیر فایل تمپلیت را مشخص میکنیم
    template_name = 'blog/post_list.html'

    # مشخص میکنیم در هر صفحه چند پست نمایش داده شود
    paginate_by = 10

    # یه متغیر مشخص میکنیم که با استفاده از آن در تمپلیت به تمام پست های منتشر شده دسترسی داشته باشیم
    context_object_name = 'posts'


class PostDetailView(DetailView):
    model = Post
    template_name = 'blog/post_detail.html'
```

چون از کلاس بجای تابع استفاده کرده ایم باید در اسکریپت urls.py تغییراتی ایجاد کنیم:

`app directory/urls.py`

```python
# _________________________ post-list _________________________
# 1- url for function view   
path('posts/', views.post_list, name='post_list'),
# -------------------------------------------------------------
# 2- url for class view
path('posts/', views.PostListView.as_view(), name='post_list'),

# _________________________ post-detail _________________________
# 1- url for function view 
path('posts/<int:post_id>/', views.post_detail, name='post_detail'),
# -------------------------------------------------------------
# 2- url for class view
path('posts/<int:pk>/', views.PostDetailView.as_view(), name='post_detail'),
```

در url جزئیات پست که از ساختار کلاس استفاده شده باید از متغیر pk ویا slug استفاده کنیم.

---

### آشنایی با ساختار فرم ها

زمانی که لازم داریم یکسری اطلاعات را از کاربر دریافت کنیم این کار را به کمک فرم ها انجام میدهیم.

در برخی از فرم ها، اطلاعات دریافتی توی دیتابیس ذخیره میشوند مثل اطلاعات پروفایل فرم های  دیگر لازم نداریم که اطلاعات در دیتابیس ذخیره بشوند مثل فرم مربوط به تماس با ما چون اطلاعات به ایمیل ما ارسال میشوند.

فیلدهای فرم میتوانند حالات مختلفی داشته باشند، متنی باشند، عددی باشند، انتخابی باشند (مثل انتخاب شهر)، تاریخ را دریافت کنند، تصویر و یا فایل دریافت کنند و...

درخواست(request)، میتواند متد post ویا get باشد. / البته متد های دیگری هم وجود دارد ولی این دو پرکاربرد ترند.

وقتی اطلاعات توسط کاربر با دکمه submit ارسال شد، حالا نوبت به اعتبارسنجی فیلدهای فرم ارسالی میرسد. | این اعتبارسنجی را در اسکریپت forms.py انجام میدهیم.

اگر اطلاعات فیلدهای ارسالی مشکلی داشتند خطا نمایش داده و محتوای آن فیلدها را پاک میکند.

اگر هم اطلاعات ارسالی معتبر بودند به یک صفحه ای که مشخص میکنیم redirect میشه.

---

به طور کلی، متد‌های POST و GET دو روش ارسال اطلاعات از سمت کاربر به سرور در HTTP هستند که در وب برای انتقال اطلاعات بین کلاینت (مرورگر وب) و سرور استفاده می‌شوند. این دو متد دارای کاربردها و ویژگی‌های خاص خود هستند:

#### 1. متد GET:

- ویژگی‌ها:
  - اطلاعات به صورت پارامترها در URL ارسال می‌شوند.
  - اطلاعات درخواست به صورت قابل خواندن در URL قابل مشاهده هستند.
  - محدودیتی برای طول درخواست URL وجود دارد (مرورگرها ممکن است حدود ۲۰۰۰ کاراکتر داشته باشند).
  - مناسب برای درخواست‌هایی که اطلاعات خواندنی (مانند جستجوی وبسایت) یا کم حجم هستند.

- کاربردها:
  - درخواست دادن اطلاعات از سرور.
  - جستجوها، فیلترینگ و مرتب‌سازی.
  - ارسال اطلاعات کم حجم که احتمال تغییر آنها ندارد (مثلاً شناسه محصول برای نمایش جزئیات آن).

#### 2. متد POST:

- ویژگی‌ها:
  - اطلاعات به صورت body درخواست ارسال می‌شوند (پنهان از URL).
  - اطلاعات درخواست به صورت خصوصی‌تر و غیر قابل مشاهده ارسال می‌شوند.
  - محدودیتی در طول ارسال اطلاعات وجود ندارد.
  - مناسب برای ارسال اطلاعات حساس (مانند نام کاربر، رمز عبور، اطلاعات کارت اعتباری) یا اطلاعات بزرگ و تغییر پذیر.

- کاربردها:
  - ایجاد، ویرایش یا حذف اطلاعات در سرور (عملیات CRUD).
  - ارسال اطلاعات فرم (مثلاً ثبت‌نام، ارسال پیام تماس با ما).
  - ارسال فایل‌ها (مثلاً آپلود تصاویر یا فایل‌های دیگر).

#### مواقع استفاده:

- GET:
  - استفاده از GET مناسب است زمانی که داده‌ها خواندنی و کم حجم هستند.
  - برای درخواست دادن اطلاعات و نمایش آن به کاربران.
  - برای جستجوها و فیلترینگ.

- POST:
  - استفاده از POST مناسب است زمانی که داده‌ها حساس یا بزرگ و یا نیاز به ارسال مکرر دارند.
  - برای ایجاد، ویرایش یا حذف اطلاعات در سرور.
  - برای ارسال اطلاعات فرم و فایل‌ها.
  - برای ارسال اطلاعاتی که نیاز به تغییر در آنها دارید و از جمله اطلاعات حساس استفاده می شود

### آشنایی با Form (ساخت فرم تیکت)

برای استفاده از فرم ها جنگو، یک فریمورک built-in برای فرم ها داره. | دو کلاس پایه، Form و ModelForm داریم که برای ساخت فرم ها از آنها استفاده میکنیم(ارث بری میکنیم).

لازمه اول اسکریپت form را ایجاد کنیم، پس در دایرکتوری اپ(app) خود forms.py را ایجاد میکنیم تا فرم هایمان را آنجا ایجاد کنی.

فرم ها را در قالب کلاس تعریف میکنیم، که هرکدام از این کلاس ها از forms.Form ویا forms.ModelForm ارث بری میکنند.(باتوجه به نیاز خود)

خب میخواهیم برای تیکت وبسایت فرم ایجاد کنیم، ولی قبلش باید یک model برای تیکت ایجاد کنیم تا بتوانیم اطلاعات را توی دیتابیس ذخیره کنیم.

`app directory/models.py`

```python
class Ticket(models.Model):
    full_name = models.CharField(max_length=250)
    subject = models.CharField(max_length=150)
    message = models.TextField()

    email = models.EmailField()
    phone = models.CharField(max_length=11)

    class Meta:
        ordering = ['-full_name']
        indexes = [models.Index(fields=['-full_name'])]

    def __str__(self):
        return self.full_name
```

شماره تلفن و کدملی را از نوع CharField انتخاب میکنیم، چون قرار نیست روی آنها محاسباتی انجام بشه که عددی باشند.

دستورات makemigrations و migrate فراموش نشه!

برای نمایش تیکت در پنل ادمین، در اسکریپت admin.py باید آنرا مشخص کنیم تا نشان داده شود.

`app directory/admin.py`

```python
@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'subject', "email"]
```

باید در اسکریپت فرم، forms را ایمپورت کنیم:

`app directory/forms.py`

```python
from django import forms
```

توی بدنه کلاس ها به کمک class attributes فیلدهای فرم خود را ایجاد میکنیم. | ساختار ایجاد این فیلدها مشابه با ایجاد فیلد در models.py میباشد.

`app directory/forms.py`

```python
title = forms.CharField()
```

توی فرم ها برخلاف مدل ها TextField نداریم، بجای آن از CharField استفاده کرده و برایش از آرگومان widget استفاده میکنیم.

`app directory/forms.py`

```python
message = forms.CharField(widget=forms.Textarea)
```

اگر بخواهیم فیلدی را اجباری کنیم که کاربر حتما باید آنرا پر کند، برای آن فیلد از آرگومان required=True استفاده میکنیم.

> فرم ها را همنام با مدل ها قرار ندهید چون وقتی آنها را توی view ایمپورت کنیم به مشکل و تداخل میخوریم. | بهتره نام ها به یکدیگر مربوط باشند مثله مدل: Ticket و فرم: TicketForm.

موضوع(subject) را در فرم تیکت به حالت انتخابی ایجاد میکنیم. | فیلد آنرا هم برخلاف مدل ها باید ChoiceField مشخص کنیم.

`app directory/forms.py`

```python
from django import forms

from .models import *


class TicketForm(forms.Form):
    SUBJECT_CHOICES = (
        ('پیشنهاد', 'پیشنهاد'),
        ('گزارش', 'گزارش'),
        ('انتقاد', 'انتقاد'),
    )
    subject = forms.ChoiceField(choices=SUBJECT_CHOICES)

    full_name = forms.CharField(max_length=250)
    message = forms.CharField(widget=forms.Textarea, required=True)

    email = forms.EmailField()
    phone = forms.CharField(max_length=11)
```

#### ایجاد url برای فرم تیکت:

خب حالا باید برای این فرم تیکت، یک url ایجاد کنیم، چرا؟ برای اینکه اطلاعات فرم به آن url فرستاده بشوند تا بتوانیم در view از آنها استفاده کنیم.

`app directory/urls.py`

```python
path('ticket/', views.ticket, name='ticket'),
```

#### بریم یک view برای ticket ایجاد کنیم:

خب باید فرم ها را در views.py ایمپورت کنیم.

`app directory/views.py`

```python
from .forms import *
```

> وقتی در یک صفحه یک فرم خالی را نمایش می دهیم ، متد get هست و زمانی که آن فرم را پر کرده و روی دکمه ارسال کلیک کنیم متد post خواهد بود.

وقتی متد POST باشد، یعنی کاربر روی دکمه ارسال کلیک کرده و اطلاعات ارسال شده اند.

`app directory/views.py`

```python
if request.method == 'POST':
    # ...
```

وقتی اطلاعات به url ارسال شدند با استفاده از request.POST آنها را دریافت میکنیم. | اطلاعات در قالب دیکشنری ذخیره میشوند. کلیدها، اسم فیلدها هستند و مقادیر، محتوای فیلد هستند که توسط کاربر وارد شده اند.

`app directory/views.py`

```python
request.POST
```

در واقع request.POST یک QueryDict میباشد. | بریم یک نمونه از آن را ببینیم:

`Terminal`

```Terminal
<QueryDict: {'csrfmiddlewaretoken': [token-text], 'name': ['Reza'], 'message': ['python programming language.']}>
```

برای مدیریت و بررسی(اعتبارسنجی) اطلاعات دریافتی، آنها را به فرم مربوطه میفرستیم؛ برای این کار یک نمونه از فرم ایجاد کرده و request.POST را برایش مشخص میکنیم.

`app directory/views.py`

```python
form = TicketForm(request.POST)
```

حالا با استفاده از متد <span class="en-text">isvalid()</span> بررسی میکنیم که آیا اطلاعات ارسالی معتبر بودند یا خیر.

`app directory/views.py`

```python
if form.isvalid():
    cd = form.cleaned_data
```

عبارت form.cleaned_data یک دیکشنری هست که شامل فیلدها و مقادیر آن فیلدها در فرم مربوطه میباشد.

متغیر cd یک دیکشنری میباشد پس برای دسترسی به مقدار یک کلید:

```python
cd[key]

cd.get(key)
```

وقتی اطلاعات valid نباشند شرط <span class="en-text">form.isvalid()</span> برقرار نخواهد بود و بدنه آن اجرا نمیشه، ولی همچنان مقادیر وارد شده توسط کاربر توی فیلدها هستند؛ دلیلش این هست که چون ری دکمه ارسال کلیک شده یعنی متد، POST بوده و اطلاعات فرم دریافت شده اند(form = TicketForm(request.POST)) و این فرم به تمپلیت ارسال میشه در نتیجه فرم خالی نیست.

#### ذخیره اطلاعات در دیتابیس

برای اینکه اطلاعاتی را در دیتابیس ذخیره کنیم، برای مدل مدنظر از دستورات ORM استفاده کرده و یک آبجکت جدید از مدل خود ایجاد میکنم سپس فیلدهای آن مدل را باتوجه به اطلاعاتی که داریم پر میکنیم.

در اینجا اطلاعاتی را که کاربر وارد کرده ، از دیکشنری cd دریافت کرده و آن مقادیر را برای فیلد مربوطه در مدل مشخص میکنیم.

داخل بدنه شرط <span class="en-text">if form.isvalid():</span> از مدل مدنظر آبجکت ایجاد میکنیم.

`app directory/views.py`

```python
# Structure to create data in the database
ModelName.objects.create() 

# ________________________________________

Ticket.objects.create(
    subject=cd['subject']
    message=cd['message'],
    full_name=cd['full_name'],
    email=cd['email'],
    phone=cd['phone'],
)
```

---

پس از ذخیره اطلاعات در دیتابیس با استفاده از shortcut یا همان تابع redirect مشخص میکنیم که به چه صفحه ای منتقل شود(وقتی کاربر اطلاعات معتبر وارد کرد پس از ثبت به صفحه ای که مشخص میکنیم منتقل میشود). | باید ایمپورت شود، کنار render آنرا ایمپورت میکنیم.

آدرس صفحه مدنظر را به صورت app_name:name-of-path مینویسیم.

`app directory/views.py`

```python
from django.shortcuts import render, redirect

# structure of redirect function
redirect('Blog:index')
```

برای نمایش فرم خالی (زمانی که کاربر فرم را پر نکرده است)، برای شرطی که بررسی میکند متد، POST هست یا نه؛  else نوشته و در بدنه آن یک نمونه از فرم بدون اینکه چیزی دریافت کند مینویسیم. | وقتی else اجرا میشه یعنی متد، get میباشد و فرم خالی نمایش داده میشود.

```python
form = TicketForm()
```

برای تیکت وبسایت، یک تمپلیت ایجاد کرده و آنرا به view تیکت متصل میکنیم.(templates/forms/ticket.html)

باید form را  به تمپلیت ارسال کنیم.(با استفاده از context)

#### خب بریم کل این ساختارها را یکجا در کد خود ببینیم:

`app directory/views.py`

```python
def ticket(request):
    if request.method == 'POST':
        # instance of form
        form = TicketForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            
            # object of model
            Ticket.objects.create(
                subject=cd['subject']
                message=cd['message'],
                full_name=cd['full_name'],
                email=cd['email'],
                phone=cd['phone'],
            )

            return redirect('Blog:index')
    else:
        # instance of form
        form = TicketForm()
    return render(request, 'forms/ticket.html', {'form': form})
```

#### ایجاد فرم در تمپلیت (تیکت)

از تمپلیت پایه ارث بری کرده و ساختار تمپلیت را ایجاد میکنیم.

در تمپلیت برای ایجاد فرم دو حالت داریم: 1- اتوماتیک فرم را از روی فیلدهای  کلاس فرم در forms.py ایجاد کنیم. 2- با ساختار html آنها را ایجاد کنیم(به صورت دستی)

در تمپلیت یک تگ form ایجاد میکنیم.

نکته: باید برای تگ form یک method مشخص کنیم.

`templates/forms/ticket.html`

```html
<form method="post">
    ...
</form>
```

چنانچه متد فرم post باشد؛در بدنه تگ form باید از تمپلیت تگ {% csrf_token %} استفاده کنیم.

> تمپلیت تگ csrf_token از باگ امنیتی جلوگیری میکند. | یک توکن ایجاد میکند و با آن توکن تشخیص میدهد کاربری که دارد این درخواست را ارسال میکنداز جانب همین کاربر هست یا نه!

> وقتی از تمپلیت تگ csrf_token استفاده میکنیم، یک تگ input از نوع hidden ایجاد میشود که value آن توکنی هست که برای بررسی ایجاد میکند.

#### نوشتن فرم به صورت اتوماتیک

از فرمی که از طرف view به تمپلیت ارسال کردیم استفاده کرده و با استفاده از متدهایش فرم را ایجاد میکنیم.

`templates/forms/ticket.html`

```jinja
<form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <input type="submit" value="ارسال">
</form>
```

از کلاس فرم، اتوماتیک فیلدهای فرم را میخواند، حالا هر یک از  آن فیلدها را با تگ p ایجاد میکند.

برای ارسال این داده ها از (تگ input با تایپ submit) استفاده میکنیم.

#### انواع متد، برای ایجاد فرم به حالت اتوماتیک:

> #### <span class="en-text">form rendering options</span>
>
> form.as_p => &lt;p&gt;<code>&lt;input type=&quot;&quot;&gt;</code>&lt;/p&gt;
>
> form.as_div => &lt;div&gt;<code>&lt;input type=&quot;&quot;&gt;</code>&lt;/div&gt;
>
> form.as_table => &lt;tr&gt;<code>&lt;input type=&quot;&quot;&gt;</code>&lt;/tr&gt;
>
> form.as_ul => &lt;li&gt;<code>&lt;input type=&quot;&quot;&gt;</code>&lt;/li&gt;



در حالت اتوماتیک از روی اسم فیلدهای کلاس فرم مدنظر، label ها را ایجاد میکند چنانچه بخواهیم اسم این label ها را شخصی سازی کنیم در اسکریپت forms.py، برای هر فیلد از آرگومان label استفاده کرده و برایش اسم دلخواه خود را مشخص میکنیم.

`app directory/forms.py`

```python
class TicketForm(forms.Form):
    SUBJECT_CHOICES = (
        ('پیشنهاد', 'پیشنهاد'),
        ('گزارش', 'گزارش'),
        ('انتقاد', 'انتقاد'),
    )
    subject = forms.ChoiceField(choices=SUBJECT_CHOICES)

    full_name = forms.CharField(max_length=250, label="نام و نام خانوادگی")
    message = forms.CharField(widget=forms.Textarea, required=True, label="متن پیام")

    email = forms.EmailField(label="ایمیل")
    phone = forms.CharField(max_length=11, label="شماره تماس")
```

### کار با تمپلیت فرم ها

برای اینکه این حالت اتوماتیک ایجاد فرم، را یکم شخصی سازی کنیم روی form حلقه زده و هر فیلد را نمایش میدهیم:

`templates/forms/ticket.html`

```jinja
<form method="post">
    {% csrf_token %}
    
    {% for field in form %}
        {{ field.label_tag }}
        {{ field }}
    {% endfor %}

    <input type="submit" value="ارسال">
</form>
```

چون ایجاد فرم در حالت اتومات را شخصی سازی کرده ایم، دیگه ارورها را نمایش نمیده برای نمایش ارورهای هرفیلد، عبارت {{ field.errors }} را به حلقه   اضافه میکنیم.

`templates/forms/ticket.html`

```jinja
<form method="post">
    {% csrf_token %}
    
    {% for field in form %}
        {{ field.label_tag }}
        {{ field }}
        {{ field.errors }}
    {% endfor %}

    <input type="submit" value="ارسال">
</form>
```

#### خب حالا فیلدهای form را به صورت دستی ایجاد میکنیم:

برای نوشتن input از ساختار زیر استفاده میکنیم و چنانچه خواستیم میتوانیم اتریبیوت های دیگری به آن اضافه کنیم.

> اتریبیوت required: برای اجباری کردن فیلد استفاده میشه.    
> با اتریبیوت maxlength میتوان حداکثر تعداد کاراکتر برای آن فیلد مشخص کرد.

```html
<input type="" name="<field_name>">
```

باتوجه به نوع فیلد مدنظر، یک type برای تگ input مشخص میکنیم. | مثلا برای فیلد CharField از input با تایپ text استفاده میکنیم.

نکته مهم این هست که حتما باید برای اینپوت ها اتریبیوت name مشخص کنیم، و مقداری  که برای اتریبیوت name مشخص میکنیم باید با اسم فیلد مدنظر در کلاس forms.py تطابق داشته باشه.(همان اسم)

بریم توی مثال ببینیم:

`app directory/forms.py`

```python
class TicketForm(forms.Form):
    # ...
    full_name = forms.CharField(max_length=250)
    # ...
```

`templates/forms/ticket.html`

```jinja
<form method="post">
    {% csrf_token %}

    <input type="text" name="full_name">

    <input type="submit" value="ارسال">
</form>
```

فیلد full_name از نوع CharField هست پس اینپوت را از نوع text ایجاد میکنیم، چون اسم فیلد full_name هست برای اتریبیوت name در تگ input، اسم آن فیلد (یعنی full_name) را وارد میکنیم.

#### انواع فیلد در html:

[!["types_of_input"](https://res.cloudinary.com/am-er/image/upload/v1719592877/types_of_input_q4slhv.png)](https://res.cloudinary.com/am-er/image/upload/v1719592877/types_of_input_q4slhv.png)

#### ساختار فرم به صورت دستی

`templates/forms/ticket.html`

```jinja
<form method="post" class="form">
    {% csrf_token %}

    <select name="subject">
        <option value="گزارش<"گزارش</option>
        <option value="انتقاد<"انتقاد</option>
        <option value="پیشنهاد<"پیشنهاد</option>
    </select>

    <input type="text" name="name" placeholder="your name">

    <textarea name="message" cols="20" rows="5" placeholder="your text...."></textarea>

    <input type="email" name="email" placeholder="email">

    <input type="text" name="phone" placeholder="phone number">

    <input type="submit" value="send-ticket">
</form>
```

### اعتبار سنجی فرم ها و نمایش خطا ها

وقتی ساختار فرم را به صورت دستی و با استفاده از تگ input ایجاد میکنیم، وقتی فیلدها معتبر نباشند ارورها را نمایش نمیده و و تمام فیلدها را هم پاک میکنه در نتیجه، این ویژگی ها را باید دستی اضافه کنیم.

#### نمایش خطا ها

برای نمایش ارورهای هر فیلد زیر یا کنار همان فیلد(بعد از هر input از تگ span با ساختار زیر استفاده میکنیم):

`templates/forms/ticket.html`

```jinja
<span>{{ form.field-name.errors }}</span>
```

`templates/forms/ticket.html`

```jinja
<form method="post">
    {% csrf_token %}

    <input type="text" name="full_name">
    <span>{{ form.full_name.errors }}</span>

    <input type="submit" value="ارسال">
</form>
```

#### نمایش همه ارورها به صورت یکجا

بیرون از form ساختار زیر را پیاده سازی میکنیم:

`templates/forms/ticket.html`

```jinja
{% if form.errors %}
    {% for field in form %}
        {% if field.errors %}
            {% for error in field.errors %}
                {{ field.label }}: {{ error }}
            {% endfor %}   
        {% endif %} 
    {% endfor %}  
{% endif %}
```

بعضی وقتا ممکنه ارورهایی داشته باشیم که مربوط به فیلدها نیستند:

`templates/forms/ticket.html`

```jinja
{% if form.non_field_errors %}
    {{ form.non_field_errors }}
{% endif %} 
```

زمانی که فیلد و یا فیلدهایی valid نیستند برای اینکه فیلدها اطلاعاتشون پاک نشه به صورت زیر عمل میکنیم:

```jinja
{% if form.field-name.value %}{{ form.field-name.value }}{% endif %}
```

`templates/forms/ticket.html`

```jinja
<form method="post">
    {% csrf_token %}

    <input type="text" name="full_name" {% if form.full_name.value %}value="{{ form.ful_name.value }}"{% endif %}>

    <textarea name="message">
        {% if form.message.value %}{{ form.message.value }}{% endif %}
    </textarea>

    <input type="submit" value="ارسال">
</form>
```

#### اعتبارسنجی شخصی سازی شده

اعتبارسنجی فرم ها را در فایل forms.py انجام می دهیم. | در کلاس فرم مربوطه اعتبارسنجی را انجام میدهیم.

برای اعتبارسنجی فیلدها دو حالت وجود دارد:

> <span class="rtl-text">اعتبارسنجی را با یکی از متدهای <span class="en-text">clean\_<field\_name\>()</span> و یا <span class="en-text">clean()</span> انجام میدهیم.</span>

#### حالت اول

`app directory/forms.py`

```python
# structure:
def clean_FieldName(self):
    # ...
# ________________________________
def clean_phone(self):
    phone = self.cleaned_data["phone"]

    if phone:
        if not phone.isdigit():
            raise forms.ValidationError("phone number is invalid")

        return phone
```

متدهای <span class="en-text">clean\_<field\_name\>()</span> برای اعتبارسنجی فیلدهای خاص در فرم‌ها استفاده می‌شوند(یعنی برای اعتبارسنجی هر فیلد از یک متد <span class="en-text">clean\_<field\_name\>()</span> استفاده میکنیم | هرفیلد جداگانه اعتبارسنجی میشود).

**نکته:** <field\-name\> باید با نام فیلد در فرم مطابقت داشته باشد.

1- حالا مقدار آن فیلد را از دیکشنری cleaned_data دریافت کرده و در یک متغیر ذخیره میکنیم.

2- اکنون بررسی میکنیم که فیلد مورد نظر مقدار دارد یا نه؟!(اگر خالی باشه شرط False خواهد بود.) | برای اعتبارسنجی باید فیلد مقدار داشته باشد مگرنه ارور میدهد.

3- حالا وقتشه اعتبارسنجی های مدنظر را پیاده سازی کنیم.

> در مثال بالا برای شماره تلفن اعتبارسنجی میکنیم که فقط عدد باشد، اگر فقط عدد نباشد مثلا حروف هم داشته باشد یک پیغام خطا را نمایش میدهیم. | و چنانچه معتبر باشد آن را return میکنیم.

> نکته مهم این هست که حتما برای زمانی که مقدار فیلد معتبر میباشد باید آن مقدار را برگردانیم(return کنیم)

#### حالت دوم

`app directory/forms.py`

```python
# structure:
def clean(self):
    cleaned_data = super().clean()
    # ...

    return cleaned_data
# ________________________________
def clean(self):
    cleaned_data = super().clean()
    phone = cleaned_data.get('phone')

    if phone:
        if not phone.isdigit():
            raise forms.ValidationError("phone number is invalid")
        
        return cleaned_data

# _______________ تفاوت در ایجاد پیام خطا _______________

def clean(self):
    cleaned_data = super().clean()
    phone = cleaned_data.get('phone')

    if phone:
        if not phone.isdigit():
            msg = "phone number is invalid."
            self.add_error("phone", msg)
            
        return cleaned_data
```

متد <span class="en-text">clean()</span> برای اعتبارسنجی داده‌های کل فرم استفاده می‌شود.

در این متد، اعتبارسنجی‌های بین فیلدی (برای اعتبارسنجی چند فیلد همزمان) انجام می‌شود. البته می‌توان در این متد فقط یک فیلد را نیز اعتبارسنجی کرد، اما اعتبارسنجی یک فیلد بهتر است به‌طور جداگانه در متدهای <span class="en-text">clean\_<field\_name\>()</span> انجام شود.

> این متد به شما امکان می‌دهد که اعتبارسنجی‌های بین فیلدی را انجام دهید؛ یعنی اعتبارسنجی‌هایی که به بیش از یک فیلد وابسته هستند. مثلا اعتبارسنجی password و repeat_password

### آشنایی با forms.ModelForm (ساخت فرم کامنت-بخش اول و دوم)

میخواهیم برای پست های خود قابلیت کامنت گذاری ایجاد کنیم.

برای اینکه کامنت ها توی دیتابیس ذخیره بشوند لازمه برای کامنت ها یک مدل ایجاد کنیم.

`app directory/models.py`

```python
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    name = models.CharField(max_length=250)
    letter = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created']
        indexes = [models.Index(fields=['-created'])]

    def __str__(self):
        return f'{self.name}: {self.post}'
```

کامنت باید به پست متصل شود تا مشخص شود هر پست چه کامنت هایی دارد یا یک کامنت متعلق به چه پستی میباشد.

> یک پست میتواند چندین کامنت داشته باشد ولی هر کامنت فقط به یک پست تعلق داره پس فیلد آن از نوع Many To One خواهد بود.(ForeignKey)    



> #### یادآوری:
> \# تمام کامنت های یک پست    
>
> > <span class="en-text">post.comments.all()</span>   
>
> \# تشخیص پست برای یک کامنت    
>
> > <span class="en-text">comment.post</span>

دستور makemigrations و migrate فراموش نشه!

#### نمایش کامنت ها در پنل ادمین

`app directory/admin.py`

```python
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['name', 'post', 'created', 'active']
    list_filter = ['created', 'active']
    search_fields = ['name', 'letter']
    list_editable = ['active']
```

#### ایجاد فرم کامنت در forms.py

این بار فرم خود را از ModelForm ایجاد میکنیم.

وقتی از ModelForm استفاده میکنیم، دیگه فیلدها را ما ایجاد نمیکنیم بلکه اتوماتیک این کار را از روی فیلدهای مدل انجام میدهد.

داخل بدنه کلاس ، یک کلاس Meta ایجاد میکنیم، حالا در بدنه کلاس Meta مشخص میکنیم که فیلدها را از روی چه مدلی ایجاد کند.

`app directory/forms.py`

```python
class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
```

حالا با استفاده از fields ویا exclude، مشخص میکنیم فرم را از روی کدام فیلدهای مدل ایجاد کند.

متغیر fields: توی یک لیست برایش مشخص میکنیم، که فرم را از روی کدام فیلدهای مدل ایجاد کند.

متغیر exclude: برایش یک لیست مشخص میکنیم و اسم فیلدهایی که نمیخواهیم توی فرم باشند را توی آن می نویسیم. | هر فیلدی که توی لیست مشخص میکنیم یعنی همه فیلدهای مدل بجز این فیلدها را انتخاب و از فیلدهای انتخابی فرم را ایجاد کن.

`explanation and example`

```python
# select all fields
fields = '__all__'

# -------------------------------------------------------
# select name and letter fields
fields = ['name', 'letter']
# -------------------------------------------------------

# all fields except 'post', 'created', 'updated', 'active'
exclude = ['post', 'created', 'updated', 'active']
```

#### کد کامل فرم کامنت

`app directory/forms.py`

```python
class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['name', 'letter']
```

#### ایجاد view برای کامنت

میتوانیم دریافت اطلاعات کامنت و... را در view جزئیات پست(post_detail) را انجام دهیم ولی جهت موارد آموزشی جدید آنرا جداگانه ایجاد میکنیم.

ما میتوانیم یک view را به یک متد(get, post) محدود کنیم با استفاده از دکوراتورهای جنگو. | باید ایمپورت بشوند.

`app directory/views.py`

```python
from django.views.decorators.http import require_POST


@require_POST
def post_comment(request, post_id):
    # ...
```

پستی که برایش کامنت گذاشته میشود را باید مشخص کنیم.

`app directory/views.py`

```python
from django.shortcuts import render, get_object_or_404


@require_POST
def post_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id, status=Post.Status.Published)
```

زمانی که فرم خود را از ModelForm ایجاد کرده ایم، برای ذخیره کردن اطلاعات توی دیتابیس ، چون کلاس فرم به مدل متصل شده است دیگه نیاز نیست که از مدل، آبجکت ایجاد کنیم بلکه فقط کافیست برای فرم از متد <span class="en-text">save()</span> استفاده کنیم تا اطلاعات توی دیتابیس ذخیره بشوند.

متد <span class="en-text">save()</span> ابتدا یک آبجکت از آن مدل ایجاد میکند و سپس آنرا در دیتابیس ذخیره میکند، ولی اگه از آرگومان commit=False استفاده کنیم آبجکت را ایجاد میکنه اما آنرا در دیتابیس ذخیره نمیکنه بنابراین ما میتوانیم تغییراتی در آبجکت ایجاد کرده و سپس آنرا در دیتابیس ذخیره کنیم.

> <span class="rtl-text">وقتی میخواهیم اطلاعات فیلدی را تغییر بدیم یا اطلاعاتی را دستی به دیتابیس اضافه کنیم برای متد <span class="en-text">save()</span> از آرگومان commit=False استفاده کرده و تغییرات را اعمال میکنیم و در پایان با متد <span class="en-text">save()</span> اطلاعات را در دیتابیس ذخیره میکنیم |  مثلا توی کامنت فیلد پست باید اتوماتیک مشخص بشه پس برایش تعیین میکنیم که فیلد پست را همین پست که در بالا مشخص کردیم انتخاب کن.</span>

#### کد کامل view کامنت

`app directory/views.py`

```python
@require_POST
def post_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id, status=Post.Status.Published)
    comment = None

    form = CommentForm(request.POST)
    if form.is_valid():
        comment = form.save(commit=False)
        comment.post = post
        comment.save()

    context = {
        'comment': comment,
        'post': post,
        'form': form
    }

    return render(request, "forms/comment.html", context=context)
```

برای کامنت یک تمپلیت در دایرکتوری forms ایجاد میکنیم. | در آن پیغام ثبت موفقیت آمیز کامنت ، خطاهای فیلدها و اصلاح فیلدهای فرم در صورت وجود خطا را خواهیم داشت.

`templates/forms/comment.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} post comment {% endblock %}

{% block content %}
    
    {% if comment %}
        your comment has been sent. <br>
        <a href="{{ post.get_absolute_url }}">back to post</a>
    {% else %}
        <form method="post">
            {% csrf_token %}
            
            <div style="width: 250px">
                <input type="text" id="name" placeholder="name" name="name">
                <br>
                <textarea name="letter" id="text" cols="30" rows="10" placeholder="your comment..."></textarea>
            </div>
    
            <input type="submit" value="send">
        </form>

        {% if form.errors %}
            {% for field in form %}
                {% if field.errors %}
                    {% for error in field.errors %}
                        {{ field.label }}: {{ error }}
                    {% endfor %}   
                {% endif %} 
            {% endfor %}  
        {% endif %}

    {% endif %}
{% endblock %}
```

برای view جزئیات پست(post_detail) از تابع بجای class based view استفاده میکنیم. | حواسمون باشه url را هم تغییر بدیم!!!

`app directory/urls.py`

```python
path('posts/<int:post_id>/', views.post_detail, name='post_detail'),
```

برای کامنت، یک url ایجاد میکنیم.

`app directory/urls.py`

```python
path('posts/<int:post_id>/comment/', views.post_comment, name='post_comment'),
```

در تمپلیت detail_post هم فرم کامنت را جهت ثبت کامنت داریم ، ولی یه نکته داره، آن هم این است که افزون بر اتریبیوت method که باید نوشته شود، باید از اتریبیوت دیگری بنام action هم استفاده کنیم.

> وقتی از اتریبیوت action استفاده نمیکنیم اطلاعات فرم به url همان صفحه ارسال میشه ولی اگه بخواهیم اطلاعات به url دیگری ارسال بشه تا در view آن url  روی اطلاعات فرم کار کنیم باید از اتریبیوت action استفاده کنیم. برای action آدرس آن url را مشخص میکنیم.

`templates/blog/post_detail.html`

```html
<form action="{% url 'Blog:post_comment' post.id %}" method="post">
    ...
</form>
```

`templates/blog/post_detail.html`

```jinja
{% extends 'parent/base.html' %}
{% load blog_tags %}
{% block title %} post detail {% endblock %}
{% block content %}

    <h3 style="text-align: center">Author: <i style="color: #010138" >{{ post.author }}</i></h3>
    <br><br>
    <h2>Title: {{ post.title }}</h2>
    <h3 style="text-align: center">description:</h3>
    <p>{{ post.description | linebreaks }}</p>
    <p style="color: black">{{ post.publish }}</p>
    <br><hr><br>

    <form action="{% url 'Blog:post_comment' post.id %}" method="post">
        {% csrf_token %}
    
        <input type="text" id="name" placeholder="name" name="name">
        
        <br><br>
        
        <textarea name="letter" id="text" cols="30" rows="10" placeholder="your comment..."></textarea>
    
        <input type="submit" value="send">
    </form>
    
{% endblock %}
```

در view مربوط به post_detail فرم کامنت را خواهیم داشت و برای نمایش کامنت ها هم لازمه توی post_detail تمام کامنت های پست را دریافت کرده و به تمپلیت ارسال کنیم.

`app directory/views.py`

```python
def post_detail(request, post_id):
    post = get_object_or_404(Post, id=post_id, status=Post.Status.Published)
    form = CommentForm()
    comments = post.comments.filter(active=True)

    context = {
        'post': post,
        'form': form,
        'comments': comments,
    }

    return render(request, 'blog/post_detail.html', context)
```

خب حالا بریم توی تمپلیت post_detail تعداد کامنت ها و خود کامنت ها را نمایش دهیم:

وقتی به یکسری داده از دیتابیس نیاز داریم برای جلوگیری از اینکه هربار آن داده را از دیتابیس صدا بزنیم، یکبار آنرا صدا میزنیم و مقدارش را در یک متغیر ذخیره میکنیم حالا هربار لازم داشتیم از آن متغیر استفاده میکنیم.

> در تمپلیت برای ایجاد یک متغیر از تمپلیت تگ with استفاده میکنیم. | از آن متغیر فقط در بدنه with میتوان استفاده کرد.

```jinja
<!-- structure 1 -->
{% with variable=value %}
    ...
{% endwith %}

or

{% with variable1=value1 variable2=value2 %}
    ...
{% endwith %}

<!-- structure 2 -->
{% with data as variable-alias %}
    ...
{% endwith %}
```

یکی از قابلیت های تمپلیت تگ for حالت empty میباشد، زمانی بدنه آن اجرا میشود که آن چیزی که روی آن حلقه زده ایم خالی است، چیزی برای حلقه زدن وجود نداره.

#### کد کامل تمپلیت post_detail

`templates/blog/post_detail.html`

```jinja
{% extends 'parent/base.html' %}
{% load blog_tags %}
{% block title %} post detail {% endblock %}
{% block content %}

    <h3>Author: <i>{{ post.author }}</i></h3>
    <br><br>
    <h2>Title: {{ post.title }}</h2>
    <h3>description:</h3>
    <p>{{ post.description | linebreaks }}</p>
    <p>{{ post.publish }}</p>
    <br><hr><br>

    <form action="{% url 'Blog:post_comment' post.id %}" method="post">
        {% csrf_token %}
    
        <input type="text" id="name" placeholder="name" name="name">
        
        <br><br>
        
        <textarea name="letter" cols="30" rows="10" placeholder="your comment..."></textarea>
    
        <input type="submit" value="send">
    </form>

    <!-- نمایش تعداد کامنت ها -->
    <div>
        {% with comments.count as cm_count %}
            {{ cm_count }} comment{{ cm_count|pluralize }}
        {% endwith %}
    </div>

    <!-- نمایش کامنت ها -->
    {% for cm in comments %}
        <div>
            Name: {{ cm.name }}
            <br>
            {{ cm.letter|linebreaks }} 
        </div>
    {% empty %}
        کامنتی وجود ندارد
    {% endfor %}
    
{% endblock %}
```

### ایجاد تمپلیت تگ سفارشی (simple tag)

> simple_tag: یک string (رشته) را return میکند.
> 
> inclusion_tag: یک تمپلیت رندر شده را return میکند.

برای ایجاد تمپلیت تگ سفارشی، توی دایرکتوری app یک پکیج بنام templatetags ایجاد میکنیم.

> پکیج یک دایرکتوری میباشد که داخل آن فایل init.py وجود دارد. | این فایل خالی است و محتوایی ندارد.

حالا در این پکیج یک فایل پایتونی با نام دلخواه ایجاد میکنیم(مثلا blog_tags). | ساختار تمپلیت تگ سفارشی در این فایل نوشته میشوند.

#### ایجاد تمپلیت تگ برای 1-تعداد پست ها 2- تعداد کامنت ها 3- تاریخ انتشار آخرین پست

در فایل پایتونی blog_tags باید مواردی را ایمپورت کنیم(مدل ها و template):

`app directory/templatetags/blog_tags.py`

```python
from django import template
from ..models import *
```

در فایل blog_tags.py باید یک متغیر بنام register ایجاد کنیم. | از آن در دکوراتور استفاده میکنیم.

`app directory/templatetags/blog_tags.py`

```python
from django import template
from ..models import *


register = template.Library()
```

برای هر تمپلیت تگ، یک تابع ایجاد میکنیم و داخل بدنه اش کاری که میخواهیم را انجام میدهیم در ضمن باید برای هر تمپلیت تگ از دکوراتور simple_tag استفاده کنیم.

> اگر اسمی در پرانتزهای simple_tag مشخص کنیم، اسم تمپلیت تگ آن اسم خواهد بود ولی اگر اسمی مشخص نکنیم، اسم تابع را به صورت پیشفرض انتخاب میکند.
>
> @register.simple_tag(name="<favorite\-name\>")

#### کد مربوط به ایجاد تمپلیت تگ سفارشی

`app directory/templatetags/blog_tags.py`

```python
from django import template
from ..models import *


register = template.Library()

# محاسبه تعداد کل پست های منتشر شده
@register.simple_tag()
def total_posts():
    return Post.published.count()

# محاسبه تعداد کل کامنت ها
@register.simple_tag()
def total_comments():
    return Comment.objects.filter(active=True).count()

# تاریخ انتشار آخرین پست
@register.simple_tag()
def last_post_date():
    # آخرین پست را انتخاب کرده و فیلد انتشار را صدا میزنیم تا تاریخ انتشار آنرا نمایش دهیم
    last_post = Post.published.last().publish
    return last_post
```

برای اینکه بتوانیم از تمپلیت تگ های ایجاد شده استفاده کنیم باید توی تمپلیت مدنظر فایل پایتونی که تمپلیت تگ ها آنجا نوشته شده اند را load کنیم:

```jinja
{% load blog_tags %}
```

حالا از ساختار تمپلیت تگ استفاده میکنیم:

```jinja
{% load blog_tags %}

{% <template_tag name> %}
```

### ایجاد تمپلیت تگ سفارشی (Inclusion tags)

> همان طور که گفتیم یک تمپلیت را return میکنه.

این بار میخواهیم تمپلیت تگی را ایجاد کنیم که چند پست آخر را نمایش میدهد.

**برای ایجاد تمپلیت تگ از روش inclusion tag، از دکوراتور inclusion_tag قبل از تابع استفاده میکنیم.**

**برای دکوراتور inclusion_tag، باید مسیر یک تمپلیت را مشخص کنیم.**

> این تمپلیت را در مسیر templates/partials ایجاد میکنیم.

`app directory/templatetags/blog_tags.py`

```python
@register.inclusion_tag("partials/latest_posts.html")
```

> مثله simple tag یک تابع نوشته و کاری که میخواهیم انجام دهد را مشخص میکینیم.

خب برای نمایش چند پست آخر، یک تابع مینویسیم که به عنوان ورودی تعداد را دریافت کنه ولی پیشفرض برایش 4 را مشخص میکنیم.(برای نمایش 4 پست آخر)

حالا برای دسترسی به چند پست های آخر، 1- ابتدا تمام پست های منتشر شده را بدست می آوریم(Post.published)، 2- حالا با order_by آنها را براساس زمان انتشار مرتب میکنیم(از جدید تا قدیم) 3- و درنهایت با slicing مشخص میکنیم چند تا از پست ها را نمایش دهد.

`app directory/templatetags/blog_tags.py`

```python
@register.inclusion_tag(filename='partials/latest_posts.html')
def latest_posts(count=4):
    L_posts = Post.published.order_by('-publish')[:count]

    context = {'l_posts': L_posts}
    return context
```

مثله view که متغیر را به کمک context به تمپلیت ارسال میکردیم و از آن متغیر در تمپلیت استفاده میکردیم اینجا هم به همان صورت عمل میکنیم تا آخرین پست ها را در تمپلیت نمایش دهیم حالا وقتی این تمپلیت تگ را صدا بزنیم، محتویات تمپلیت را نمایش میدهد.

`templates/partials/latest_posts.html`

```jinja
<div>
    <h2>آخرین پست ها</h2>
    {% for post in l_posts %}
        <a href="post.get_absolute_url">
            {{ post.title }}
        </a>
        <br>
    {% endfor %}
</div>
```

```jinja
<!-- نمایش 7 پست آخر -->
{% latest_posts 7 %}
```

### کار با aggregate و annotate (تگ سفارشی برای کوئری ست)

در ارتباط با کار کردن با کوئری ست ها هستند.| دستورات کوئری ست هستند.

#### دستور aggregate

برای درک بهتر کارکرد aggregate، برای مدل Post یک فیلد از نوع PositiveIntegerFiel، برای زمان مطالعه ، ایجاد میکنیم.

> *نکته مهم*: وقتی یک فیلد جدید را به مدل اضافه میکنیم چنانچه از قبل داده هایی توی دیتابیس ذخیره داشته باشیم زمانیکه میخواهیم از makemigrations استفاده کنیم به مشکل خورده و دو گزینه در اختیار ما قرار میدهد:
> 
> 1- از ما درخواست میکنه یک مقدار برای این فیلد جدید، برای دیتاهایی که از قبل ذحیره شده اند مشخص کنیم چون این فیلد برای آنها مقداردهی نشده است. | پس از انتخاب این گزینه یک مقدار را مشخص میکنیم تا آن دیتاهای قبلی را مقداردهی کند.
> 
> 2-از ما درخواست میکنه که به مدل مربوطه مراجعه کنیم و برای آن فیلد با استفاده از آرگومان default یک مقدار پیشفرض مشخص کنیم.

`app directory/models.py`

```python
class Post(models.Model):
    class Status(models.TextChoices):
        Draft = 'DF', 'Draft'
        Published = 'PB', 'Published'
        Rejected = 'RJ', 'Rejected'

    # ️ ⬆️ choice-field ⬆️
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.Draft)

    # relation
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_posts')

    # information's
    title = models.CharField(max_length=250)
    description = models.TextField()
    slug = models.SlugField()

    # data for time(date)
    publish = models.DateTimeField(default=timezone.now)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    reading_time = models.PositiveIntegerField(default=0)

    # managers
    objects = models.Manager()
    published = PublishedManager()

    # ordering & indexing
    class Meta:
        ordering = ['-publish']
        indexes = [models.Index(fields=['-publish'])]

    def get_absolute_url(self):
        # return reverse('Blog:post_detail', kwargs={'slugs': self.id})
        return reverse('Blog:post_detail', args=[self.id])
    
    def __str__(self):
        return self.title
```

#### ساختار استفاده از aggregate:

```python
# structure
ModelName.Manager.aggregate(func(field-name))

# example
Post.published.aggregate(Sum('reading_time'))
# ⬆️مجموع زمان های مطالعه تمام پست های منتشر شده را نشان میدهد⬆️
```

برای نمایش کارکرد aggregate  و annotate از shell استفاده میکنیم.

مدل ها و متدهای aggregate را باید ایمپورت کنیم:

به ترتیب از چب به راست: تعداد، بیشترین، کمترین، میانگین و مجموع

`shell`

```shell
>>> from blog.models import *
>>> from django.db.models import Count, Max, Min, Avg, Sum

>>> Post.published.aggregate(Sum('reading_time'))
65
>>> Post.published.aggregate(Avg('reading_time'))
13
>>> Post.published.aggregate(Min('reading_time'))
0
>>> Post.published.aggregate(Max('reading_time'))
25
```

#### دستور annotate

به این صورت عمل میکند که یک فیلد داینامیک برای مدل مدنظر ایجاد میکنه ولی چیزی توی دیتابیس اضافه نمیشه (این فیلد جدید برای کوئری ست وجود داره و قابل استفاده است.)

#### ساختار استفاده از annotate:

```python
# structure
ModelName.Manager.annotate(variable=value)
ModelName.Manager.annotate(variable=func(field_name))

# example
Post.published.annotate(comments_count=Count('comments'))
# ⬆️برای هر پست یک فیلد اضافه میکنه که تعداد کل کامنت های آن پست را نشان میدهد⬆️
```

`shell`

```shell
>>> from blog.models import *
>>> from django.db.models import Count

>>> posts = Post.published.annotate(comments_count=Count('comments'))

>>> posts[1].comments_count
3
```

> برای استفاده از این از این فیلد جدید، باید یک کوئری را انتخاب کنیم؛ یا روی مجموعه کوئری ها حلقه میزنیم و یا با ایندکس یک مورد را انتخاب کرده و سپس آن فیلد را صدا میزنیم.

#### بریم یک تمپلیت تگ ایجاد کنیم که از annotate استفاده میکنه:

میخواهیم تمپلیت تگی ایجاد کنیم که معروف ترین پست ها را نشان میدهد. (براساس تعداد کامنت ها)

> میتوانیم مشخص کنیم که چند پست محبوب را نشان دهد.

`app directory/templatetags/blog_tags.py`

```python
@register.simple_tag
def most_popular_posts(count=5):
    return Post.published.annotate(comments_count=Count('comments')).order_by('-comments_count')[:count]
```

خروجی این تمپلیت تگ یک مجموعه کوئری میباشد.

میتوانیم برای تمپلیت تگ یک اسم مستعار ایجاد کرده تا از آن استفاده کنیم.

`template`

```jinja
{% most_popular_posts as pop_posts %}

{% for post in pop_posts %}
    <a href="{{ post.get_absolute_url }}">
        {{ post.title }}: with {{ post.comments_count }} comment{{ post.comments_count|pluralize }}
    </a>
{% endfor %}
```

### ایجاد تمپلیت فیلتر سفارشی و کار با markdown

#### ساختار تمپلیت فیلتر:

```jinja
{{ value | filter }}
{{ value | filter:<filter-value> }}
{{ value | filter | filter }}
```

میخواهیم تمپلیت فیلتری ایجاد کنیم، که متن مارک داون را به html تبدیل میکند.

> برای استفاده از markdown باید آن پکیج را نصب و سپس آنرا ایمپورت کنیم.

```python
pip install markdown
```

```python
from markdown import markdown
```

> تمپلیت فیلترها و تمپلیت تگ ها در یک فایل نوشته میشوند.

از دکوراتور فیلتر استفاده میکنیم؛ حالا مشابه با تمپلیت تگ ها یک تابع نوشته و داخل آن وظیفه اش را مشخص میکنیم.

براساس ساختار تمپلیت فیلترها که در بالا مثال زدیم، فیلتر روی value اعمال میشه و تغییراتی روی آن ایجاد میکند، پس لازمه برای تابع خود یک پارامتر اجباری مشخص کنیم و توی بدنه تابع تغییرات را روی آن لحاظ کنیم.

> تمپلیت فیلتر افزون بر پارامتر اول که اجباریه میتواند پارامتر دوم نیز داشته باشد برای مثال در تمپلیت فیلتر add که برایش مقداری برای جمع شدن مینویسیم آن مقدار میشه پارامتر دوم.

در پرانتز دکوراتور فیلتر میتوانیم از آرگومان <span class="en-text">name=""</span> استفاده کرده اسم دلخواه خود را برای آن مشخص کنیم.

*نکته مهم:* برای نمایش صحیح خروجی markdown در قالب html لازمه در فایل blog_tags ماژول mark_safe را ایمپورت کنیم.

`app directory/templatetags/blog_tags.py`

```python
from markdown import markdown
from django.utils.safestring import mark_safe


@register.filter(name='markdown')
def to_markdown(text):
    return mark_safe(markdown(text))
```

### استایل دهی فرم های آماده

در تمپلیت با دو روش میشه فرم را ایجاد کرد: 1- به صورت اتوماتیک(با متدهای form ارسال شده) 2- ایجاد فرم به صورت دستی (ایجاد فرم با استفاده از تگ input)

> وقتی خودمان فرم را ایجاد میکنیم میتوانیم هر اتریبیوتی که خواستیم برای input مشخص کنیم ولی در حالت اتوماتیک چطور اتریبیوت اضافه کنیم (مثل اتریبیوت class)

خب در فایل forms.py به دو روش میتوانیم فرم ایجاد کنیم؛ یکی با ارث بری از forms.Form و دیگری با ارث بری از forms.ModelForm صورت میگیرد.

#### فرم ایجاد شده از Form

به منظور اضافه کردن اتریبیوت، برای هر کدام از فیلدها از آرگومان widget استفاده کرده و نوع input آنرا را مشخص میکنیم.

> برای CharField برای widget عبارت TextInput را مشخص میکنیم، برای EmailField عبارت EmailInput را مشخص میکنیم.

میتوانید تگ input و  widget مربوط به هر نوع از فیلدهای فرم را در آدرس [***webforefront.com***](https://www.webforefront.com/django/formfieldtypesandvalidation.html) مشاهده کنید.

> حالا برای widget های مشخص شده از آرگومان attrs استفاده کرده و برایش یک دیکشنری تعریف میکنیم، کلیدهای آن میشه اسم اتریبیوت مدنظر و مقدار آن کلید میشه مقدار اتریبیوت مشخص شده.

```python
widget=forms.<type-of-widget>(attrs={'attr_name': 'value'})
```

بریم یک نمونه ببینیم:

`app directory/forms.py`

```python
full_name = forms.CharField(max_length=250,  widget=forms.TextInput(attrs={'class': 'form-name', 'placeholder': 'Full Name'}))
```


#### خب بریم برای فیلدهای فرم تیکت، اتریبیوت class اضافه کنیم.

> اسم برای اتریبیوت class دلخواه است.

`app directory/forms.py`

```python
class TicketForm(forms.Form):
    SUBJECT_CHOICES = (
        ('پیشنهاد', 'پیشنهاد'),
        ('گزارش', 'گزارش'),
        ('انتقاد', 'انتقاد'),
    )
    subject = forms.ChoiceField(choices=SUBJECT_CHOICES, widget=forms.Select(attrs={'class': 'form-subject'}))

    full_name = forms.CharField(max_length=250,  widget=forms.TextInput(attrs={'class': 'form-fName', 'placeholder': 'Full Name'}))
    message = forms.CharField(required=True, widget=forms.Textarea(attrs={'class': 'form-message'}))

    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'form-email'}))
    phone = forms.CharField(max_length=11, widget=forms.TextInput(attrs={'class': 'form-phone'}))
```

#### فرم ایجاد شده از ModelForm

در ساختار ModelForm یکم داستان فرق میکنه.

در کلاس Meta، از «اتریبیوت کلاس widgets» استفاده میکنیم؛ مقداری که برایش مشخص میکنیم یک دیکشنری است.

> <span class="rtl-text">کلیدهای این دیکشنری اسم فیلدهای فرم هستند؛ حالا برای اینکه برای هر فیلد اتریبیوتی که میخواهیم اضافه کنیم، به عنوان value برای آن فیلد از ساختار <span class="en-text">forms.<type\-of\-widget\>()</span> استفاده کرده و حالا مثل حالت قبلی از آرگومان attrs استفاده کرده و برایش یک دیکشنری مشخص میکنیم حالا اتریبیوت های مدنظر را اضافه میکنیم.</span>

#### خب بریم برای فیلدهای فرم کامنت، اتریبیوت class اضافه کنیم

`app directory/forms.py`

```python
class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['name', 'letter']

        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-name'}),
            'letter': forms.TextInput(attrs={'class': 'form-letter'}),
        }
```

### تمرینات فصل چهارم (مهم)

#### **T1- نوشتن فرم برای ایجاد پست:**

بریم ساختار فرم خود را در forms.py ایجاد کنیم. | از هر دو روش استفاده میکنیم.

> در فرم ها PositiveIntegerField نداریم پس از IntegerField استفاده کرده و برایش min_value مشخص میکنیم تا مثل PositiveIntegerField عمل کند.

`app directory/forms.py`

```python
# first way
class CreatePostForm(forms.Form):
    title = forms.CharField(max_length=250)
    description = forms.CharField(widget=forms.Textarea)
    reading_time = forms.IntegerField(min_value=0)
```

`app directory/forms.py`

```python
# second way
class CreatePostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'description', 'reading_time']
```

**بریم برای صفحه ایجاد پست یک URL بنویسیم:**

`app directory/urls.py`

```python
path('create-post/', views.create_post, name='create_post'),
```

**وقتشه بریم و یک view برای ایجاد پست جدید بنویسیم:**

> دستور request.user کاربری که لاگین کرده است را برمیگرداند.

**ساختار view برای فرمی  که از forms.Form ارث بری کرده است:**

`app diretory/views.py`

```python
def create_post(request):
    if request.method == 'POST':
        form = CreatePostForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data

            Post.objects.create(
                author=request.user,
                title=cd['title'],
                description=cd['description'],
                reading_time=cd['reading_time'],
            )

            return redirect('Blog:index')
    else:
        form = CreatePostForm()

    return render(request, 'forms/create_post.html', {'form': form})
```

**ساختار view برای فرمی  که از forms.ModelForm ارث بری کرده است:**

`app diretory/views.py`

```python
def create_post(request):
    if request.method == 'POST':
        form = CreatePostForm(request.POST)
        if form.is_valid():
            new_post = form.save(commit=False)
            new_post.author = request.user
            new_post.save()

            return redirect('Blog:index')
    else:
        form = CreatePostForm()

    return render(request, 'forms/create_post.html', {'form': form})
```

**بریم تمپلیت create_post.html را ایجاد کنیم:**

> فرم در تمپلیت را به دو روش اتوماتیک و دستی ایجاد میکنیم. | فرقی نمیکند از کدام فرم(Form, ModelForm) استفاده کرده باشید.

`templates/forms/create_post.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} post detail {% endblock %}

{% block content %}

    <form  method="post">
        {% csrf_token %}

        {{ form.as_p }}

        <input type="submit" value="send">
    </form>

{% endblock %}
```

`templates/forms/create_post.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} post detail {% endblock %}

{% block content %}

    <form  method="post">
        {% csrf_token %}

        <input type="text" name="title" placeholder="Title">
        <br>
        <textarea name="description">Description...</textarea>
        <br>
        <input type="number" name="reading_time" min="0">

        <br>
        <input type="submit" value="send">
    </form>
    
{% endblock %}
```

#### **T2- اعتبارسنجی فیلدهای فرم ایجاد پست:**

> شیوه اعتبارسنجی در هردو فرم یکسان میباشد بنابراین فقط برای یکی اعتبارسنجی را انجام میدهیم.

`app directory/forms.py`

```python
class CreatePostForm(forms.Form):
    title = forms.CharField(max_length=250)
    description = forms.CharField(widget=forms.Textarea)
    reading_time = forms.IntegerField(min_value=0)

    def clean_title(self):
        title = self.cleaned_data['title']

        if len(title) < 3:
            raise forms.ValidationError('تعداد کاراکترهای عنوان کمتر از حد مجاز میباشد')

        elif len(title) > 45:
            raise forms.ValidationError('عنوان نمیتواند بیشتر از 45 کاراکتر باشد')

        else:
            return title

    # ---------------------------------------------------------------

    def clean_reading_time(self):
        try:
            reading_time = int(self.cleaned_data['reading_time'])
        except ValueError:
            raise forms.ValidationError('زمان مطالعه باید یک عدد باشد.')

        if reading_time < 0:
            raise forms.ValidationError('زمان مطالعه نمیتواند منفی باشد')
        else:
            return reading_time
```

#### **T3- نمایش خطاهای فرم ایجاد پست:**

خب بریم خطاهای فرم را در تمپلیت نمایش دهیم:

`templates/forms/create_post.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} post detail {% endblock %}

{% block content %}

    <form  method="post">
        {% csrf_token %}

        <input type="text" name="title" placeholder="Title">
        <br>
        <textarea name="description">Description...</textarea>
        <br>
        <input type="number" name="reading_time" min="0">

        <br>
        <input type="submit" value="send">
    </form>

    <div class="errors">

        {% if form.non_field_errors %}
            {{ form.non_field_errors }}
        {% endif %} 

        {% if form.errors %}
            {% for field in form %}
                {% if field.errors %}
                    {% for error in field.errors %}
                        {{ field.name }}: {{ error }}
                    {% endfor %}   
                {% endif %} 
            {% endfor %}  
        {% endif %}
    </div>

{% endblock %}
```

#### **T4- ایجاد تمپلیت تگ هایی که  بیشترترین و کمترین تایم مطالعه را دارند:**

این کار را با هردو حالت ایجاد تمپلیت تگ انجام میدهیم.

<center>

#### ***"simple tag"***

</center>

**نمایش پست با بیشترین تایم مطالعه با simple_tag:**

`app directory/templatetags/blog_tags.py`

```python
from django import template
from ..models import *


register = template.Library()

@register.simple_tag()
def max_reading_time():
    return Post.published.order_by('-reading_time').first()
```

**نمایش پست با کمترین تایم مطالعه با simple_tag:**

`app directory/templatetags/blog_tags.py`

```python
from django import template
from ..models import *


register = template.Library()

@register.simple_tag()
def max_reading_time():
    return Post.published.order_by('-reading_time').last()
```

<center>

#### ***"inclusion tag"***

</center>

**نمایش پست با بیشترین تایم مطالعه با inclusion_tag:**

`app directory/templatetags/blog_tags.py`

```python
from django import template
from ..models import *


register = template.Library()

@register.inclusion_tag('partials/max_reading_time.html')
def max_reading_time():
    max_time = Post.published.order_by('-reading_time').first()

    context = {'max_time': max_time}

    return context
```

`templates/partials/max_reading_time.html`

```jinja
longest post: {{ max_time }}
```

**نمایش پست با کمترین تایم مطالعه با inclusion_tag:**

`app directory/templatetags/blog_tags.py`

```python
from django import template
from ..models import *


register = template.Library()

@register.inclusion_tag('partials/min_reading_time.html')
def min_reading_time():
    min_time = Post.published.order_by('-reading_time').last()

    context = {'min_time': min_time}

    return context
```

`templates/partials/min_reading_time.html`

```jinja
shortest post: {{ min_time }}
```

#### **T5- تمپلیت تگی که فعال ترین کاربر را نشان میدهد.(کاربری که بیشترین تعداد پست را دارد):**

`app directory/templatetags/blog_tags.py`

```python
from django import template
from ..models import *
from django.db.models import Count


register = template.Library()

@register.simple_tag()
def most_active_user():
    return User.objects.annotate(total_posts=Count('user_posts')).order_by('-total_posts').first()
```

#### **T6- تمپلیت فیلتر که متن را سانسور میکنه:**

`app directory/templatetags/blog_tags.py`

```python
from django import template
from ..models import *


register = template.Library()

@register.filter()
def text_censor(text):
    deleted_words = ['donkey', 'monkey', 'dog']

    for d_word in deleted_words:
        if d_word in text:
            text = text.replace(d_word, "...")
            
    return text
```
