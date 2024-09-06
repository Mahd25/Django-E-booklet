## فصل هفتم: اپلیکیشن بلاگ (بخش چهارم)

### ایجاد صفحه پروفایل

> **نکته:** با هر نام کاربری که برای پنل ادمین لاگین کنیم، کاربر فعلی وبسایت هم همان user خواهد بود(در تمام صفحات سایت).

#### **ایجاد URL برای صفحه پروفایل:**

`app directory/urls.py`

```python
urlpatterns = [
    # ...
    path('profile/', views.profile, name='profile'),
]
```

#### **ایجاد view برای صفحه پروفایل:**

توابعی که برای ایجاد view استفاده میکنیم یک آرگومان اجباری بنام request دارند.

با استفاده از request و ویژگی user برای آن، میتوان به کاربری که در سایت لاگین کرده دسترسی داشت.

```python
# current user in website
request.user
```

خروجی که این دستور به ما میدهد، شامل اطلاعات آن کاربر؛ مثله (username, password, firstname, lastname) میباشد.

`app directory/views.py`

```python
def profile(request):
    user = request.user
    pub_posts = Post.published.filter(author=user)
    all_posts = Post.objects.filter(author=user)

    context = {
        "pub_posts": pub_posts,
        "all_posts": all_posts,
    }
    return render(request, 'blog/profile.html', context=context)
```

در view نوشته شده ابتدا کاربری که در وبسایت لاگین کرده را در متغیری ذخیره کردیم.

حالا یکبار تمام پست های آن کاربر و بار دیگر فقط پست های منتشر شده  آن کاربر را از دیتابیس دریافت میکنیم.(البته فقط میتوان از پست های منتشر شده استفاده کرد).

پست های هر کاربر را در صفحه پروفایلش نمایش میدهیم.

#### **ایجاد تمپلیت برای صفحه پروفایل:**

`templates/blog/profile.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Profile {% endblock %}


{% block content %}
    <h1>Profile</h1>

    <table>
        <caption>All Post</caption>
        <tr>
            <th>row</th>
            <th>title</th>
            <th>edit</th>
            <th>delete</th>
            <th>status</th>
        </tr>
        {% for post in all_posts %}

            <tr>
                <!-- row -->
                <td>{{ forloop.counter }}</td>

                <!-- title -->
                <td><a href="{{ get_absolute_url }}">{{ post.title }}</a></td>

                <!-- edit -->
                <td><a href="#">edit</a></td>

                <!-- delete -->
                <td><a href="#">delete</a></td>

                <!-- status -->
                <td>{{ post.status }}</td>
            </tr>

        {% endfor %}

    </table>

    <table>
        <caption>Published Post</caption>
        <tr>
            <th>row</th>
            <th>title</th>
            <th>description</th>
        </tr>

        {% for post in pub_posts %}
            <tr>
                <!-- row -->
                <td>{{ forloop.counter }}</td>

                <!-- title -->
                <td><a href="{{ get_absolute_url }}">{{ post.title }}</a></td>

                <!-- description -->
                <td>{{ post.description | truncatewords:4 }}</td>
            </tr>
        {% endfor %}

    </table>
{% endblock %}
```

برای اینکه پروفایل در همه صفحات در دسترس باشد، در تمپلیت header( که به base.html وصله)، کنار فیلد search با استفاده از تگ a لینک آنرا ایجاد میکنیم تا کاربر را به صفحه پروفایل هدایت کند.

`templates/partials/header.html`

```jinja
<!-- search field -->
<form action="{% url 'Blog:post_search' %}" method="get">
    <input type="text" name="query" required placeholder="عبارت مدنظر را وارد کنید">
    <input type="submit" value="search">
</form>

<!-- profile link -->
<p><a href="{% url 'blog:profile' %}">profile</a></p>
```

### افزودن پست توسط کاربر

خب میخواهیم فرم افزودن پست را ایجاد کنیم؛  مدل Post برای ذخیره اطلاعات و ارتباط با دیتابیس از قبل ایجاد شده، درحال حاضر ما باید (form, template, URL, view) را ایجاد کنیم.

#### **ایجاد URL برای فرم افزودن پست جدید:**

`app directory/urls.py`

```python
urlpatterns = [
    # ...
    path('profile/create-post/', views.create_post, name='create_post'),
]
```

حالا در صفحه پروفایل، یک لینک ایجاد میکنیم که با استفاده از URL بالا ، کاربر را به صفحه ایجاد پست جدید هدایت میکند.

`templates/blog/profile.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Profile {% endblock %}


{% block content %}
    <h1>Profile</h1>
    <a href="{% url 'blog:create_post' %}">Create Post</a>

    <!-- ادامه کدها -->
    <!-- ... -->
{% endblock %}
```

#### **ایجاد فرم افزودن پست جدید(forms.py):**

در این فرم از ModelForm استفاده میکنیم.

> در فرم ایجاد پست تصویر هم داریم ولی تصویر جزء فیلدهای مدل Post نیست، بنابراین خارج از کلاس Meta فیلدهای تصویر را به صورت دستی ایجاد میکنیم.

`app directory/forms.py`

```python
class CreatePostForm(forms.ModelForm):
    image1 = forms.ImageField(label='image1', required=False)
    image2 = forms.ImageField(label='image2', required=False)

    class Meta:
        model = Post
        fields = ['title', 'description', 'reading_time']
```

فیلدهای مدل Post که میخواهیم در فرم باشند را در کلاس Meta مشخص میکنیم.

#### **ایجاد view برای فرم ایجاد پست جدید:**

`app directory/views.py`

```python
def create_post(request):
    if request.method == 'POST':
        form = CreatePostForm(request.POST, request.FILES)
        if form.is_valid():

            post = form.save(commit=False)
            post.author = request.user
            post.save()

            # ...ذخیره تصاویر آپلود شده در مدل (تصویر)، پس از ایجاد پست (در صورت وجود تصویر)

            # :اسم فیلدهای تصویر در فرم
            all_images = ['image1', 'image2']

            for img in all_images:
                img_file = form.cleaned_data.get(img)
                if img_file:
                    Image.objects.create(img_file=img_file, post=post)

            return redirect('Blog:profile')

    else:
        form = CreatePostForm()

    return render(request, 'forms/create_post.html', {'form': form})
```

1- برای فرم CreatePostForm افزون بر request.POST (که در فرم های قبلی هم از آن استفاده کرده ایم) لازم است از request.FILES هم استفاده کنیم؛ **دلیلش هم این است که در این فرم از فایل (تصویر) استفاده میکنیم.**

> بنابراین در فرم هایی که با file سر و کار دارند باید کنار request.POST از request.FILES هم استفاده کنیم.

2- پس از بررسی معتبر بودن فیلدها؛ لازم است اطلاعات فرم را در دیتابیس ذخیره کنیم ولی قبل از ذخیره، نویسنده پست(request.user) را به آن اضافه میکنیم.

3- فیلد تصاویر را اختیاری قرار دادیم پس ممکن است کاربری هیچ تصویری آپلود نکند؛ بنابراین برای جلوگیری از ایجاد آبجکت خالی برای مدل Image از شرط استفاده میکنیم تا اگر تصویر وجود داشت آنرا ذخیره کند.

4- پس از ایجاد پست به صفحه پروفایل redirect میشه.

#### **تکمیل اتوماتیک فیلد slug از روی فیلد title:**

مثله پنل ادمین که فیلد slug، اتوماتیک از روی فیلد title تکمیل میشد؛ برای اینکه در فرم create_post هم slug اتوماتیک تکمیل شود لازم است متد <span class="en-text">save()</span> را در مدل Post بازنویسی(override) کنیم.

قبل از بازنویسی باید ماژول slugify را ایمپورت کنیم:

`app directory/models.py`

```python
from django.template.defaultfilters import slugify
```

**بازنویسی متد <span class="en-text">save()</span>:**

`app directory/models.py`

```python
def save(self, *args, **kwargs):
    if not self.slug:
        self.slug = slugify(self.title)
    super().save(*args, **kwargs)
```

داخل پرانتزهای slugify مشخص میکنیم، slug براساس کدام فیلد تکمیل شود.

#### **ایجاد تمپلیت برای فرم افزودن پست جدید:**

در تمپلیت(create_post.html)، برای فرم افزودن پست جدید از متد post استفاده میکنیم.

> **نکته خیلی مهم:** چون در فرم با file (تصویر) سر و کار داریم، باید برای تگ form از اتریبیوت enctype استفاده کنیم.
>
> چون متد فرم post هستش، باید از {% csrf_token %} هم استفاده کنیم.

**تمپلیت ایجاد پست جدید:**

`templates/forms/create_post.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Create Post {% endblock %}

{% block content %}

    <form method="post" enctype="multipart/form-data">
        {% csrf_token %}

        {{ form.as_p }}

        <input type="submit" value="send" class="sub">
    </form>

    <!-- نمایش خطاها -->
    {% if form.non_field_errors %}
        {{ form.non_field_errors }}
    {% endif %} 

    {% if form.errors %}
        {% for field in form %}
            {% if field.errors %}
                {% for error in field.errors %}
                    {{ field.label }}: {{ error }}
                {% endfor %}   
            {% endif %} 
        {% endfor %}  
    {% endif %}

{% endblock %}
```

### حذف پست و تصاویر آن توسط کاربر

برای حذف پست در پروفایل، یک لینک ایجاد کردیم  حالا برای href آن، باید یک URL ایجاد کنیم.

`app directory/urls.py`

```python
urlpatterns = [
    # ...
    path('profile/delete-post/<post_id>', views.delete_post, name='delete_post'),
]
```

#### **ایجاد view برای حذف پست ها:**

`app directory/views.py`

```python
def delete_post(request, post_id):
    post = get_object_or_404(Post, pk=post_id)
    
    if request.method == 'POST':
        post.delete()
        return redirect('Blog:profile')

    return render(request, 'forms/delete-post.html', {'post': post})
```

#### **ایجاد تمپلیت برای تایید حذف پست ها:**

یک تمپلیت برای تایید حذف پست ایجاد میکنیم، البته میتوان با جاوااسکریپت در همان تمپلیت پروفایل تایید حذف را نمایش دهیم.

`templates/forms/delete_post`

```jinja
{% extends 'parent/base.html' %}

{% block title %} post delete {% endblock %}

{% block content %}
    <h2>آیا از حذف پست {{ post.title }} مطمئن هستید؟!</h2>
    <br>

    <a href="{% url 'blog:profile' %}">بازگشت به صفحه پروفایل</a>

    <form method="post">
        {% csrf_token %}

        <input type="submit" value="حذف">
    </form>
{% endblock %}
```

برای اینکه با حذف پست، تصاویر مربوط به آن هم حذف شوند لازم است متد <span class="en-text">delete()</span> را برای مدل Post بازنویسی(override) کنیم، البته میتوان از پکیج django-cleanup هم برای این کار استفاده کرد.

`app directory/models.py`

```python
class Post(models.Model):
    # ...

    def delete(self, *args, **kwargs):
        for img in self.images.all():
            storage, path = img.img_file.storage, img.img_file.path

            storage.delete(path)
        super().delete(*args, **kwargs)
```

#### توضیحات:

چون چند تصویر وجود داره و باید یکی یکی حذف شوند، روی تمام تصاویر پست حلقه میزنیم.

> - **اتریبیوت storage:** یک مفهوم است که به شما کمک می‌کند فایل‌ها را در سیستم فایل یا در یک مکان ذخیره‌سازی دیگر مدیریت کنید. این ابزار به شما امکان می‌دهد تا به فایل‌هایی که به اشیاء مختلفی مثل پست‌ها مرتبط هستند دسترسی داشته باشید و آن‌ها را مدیریت کنید.
>
> - **اتریبیوت path:**  به مسیر فایل فیزیکی در سیستم فایل اشاره دارد. در کد شما، path مسیر فایل تصاویر مرتبط با هر پست است. این مسیر برای دسترسی به فایل‌ها و همچنین برای حذف آن‌ها از سیستم فایل استفاده می‌شود.
>
> به این ترتیب، storage ابزاری برای مدیریت فایل‌ها و path آدرس دقیق فایل‌ها در سیستم فایل است که برای عملیاتی مانند حذف فایل‌ها یا دسترسی به آن‌ها استفاده می‌شود.

خب با override(بازنویسی) کردن متد <span class="en-text">delete()</span> برای مدل Post، زمانی که پست حذف شود تمام تصاویر مربوط به آن هم حذف میشوند.

### ویرایش پست و حذف تصاویر آن توسط کاربر

میخواهیم برای ویرایش پست ها هم مثله ایجاد پست، یک فرم داشته باشیم.

تفاوت ویرایش پست با ایجاد پست در این است که در ویرایش، روی یک آبجکتی که از قبل وجود داره کار میکنیم.

برای ویرایش پست باید یک URL و view ایجاد کنیم، ولی نیازی به ایجاد فرم و تمپلیت جدید نداریم، و از همان فرم و تمپلیت create_post استفاده میکنیم.

#### **ایجاد URL برای ویرایش پست ها:**

`app directory/urls.py`

```python
urlpatterns = [
    # ...
    path('profile/edit-post/<post_id>', views.edit_post, name='edit_post'),
]
```

> در صفحه پروفایل برای ویرایش پست ها لینک نوشته ایم حالا برای href آنها از URL که برای ویرایش پست در بالا ایجاد کرده ایم استفاده میکنیم.

#### **ایجاد view برای ویرایش پست ها:**

`app directory/views.py`

```python
def edit_post(request, post_id):
    post = get_object_or_404(Post, pk=post_id)

    if request.method == 'POST':
        form = CreatePostForm(request.POST, request.FILES, instance=post)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()

            # :اسم فیلدهای تصویر در فرم
            all_images = ['image1', 'image2']

            for img in all_images:
                img_file = form.cleaned_data.get(img)
                if img_file:
                    Image.objects.create(img_file=img_file, post=post)
                    
            return redirect('Blog:profile')
    else:
        form = CreatePostForm(instance=post)

    return render(request, 'forms/create_post.html', {'post': post, 'form': form})
```

#### توضیحات:

1- برای ویرایش پست ابتدا باید آن پست را بدست بیاوریم، بنابراین با استفاده از post_id که از url دریافت کرده ایم؛ پست را از دیتابیس گرفته و آنرا در یک متغیر ذخیره میکنیم.

2- برای اینکه اطلاعات پست موجود را در فرم خود داشته باشیم؛ برای فرم خود از آرگومان instance استفاده کرده و متغیر post را برایش مشخص میکنیم. | اینطوری فیلدهای فرم، براساس محتوای پست پر شده و نمایش داده میشوند.

> سایر بخش ها قبلا توضیح داده شده است.

برای ویرایش پست از همان تمپلیت create_post استفاده میکنیم در واقع این تمپلیت برای هردو مشترک استفاده میشود.

فقط یکسری تغییرات جزئی برای نمایش تصاویر پست در تمپلیت ایجاد میکنیم:

`templates/forms/create_post.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Create & edit Post {% endblock %}

{% block content %}

    <form method="post" enctype="multipart/form-data">
        {% csrf_token %}

        {{ form.as_p }}

        <input type="submit" value="send" class="sub">
    </form>

    <!-- نمایش تصاویر پست -->
    {% if post and post.images.exists %}
        <div class="photos">
            {% for pic in post.images.all %}
                <div class="photo">
                    <img src="{{ pic.img_file.url }}" alt="pic.img_file">
                </div>
            {% endfor %}
        </div>
    {% endif %}

    <!-- نمایش خطاها -->
    {% if form.non_field_errors %}
        {{ form.non_field_errors }}
    {% endif %} 

    {% if form.errors %}
        {% for field in form %}
            {% if field.errors %}
                {% for error in field.errors %}
                    {{ field.label }}: {{ error }}
                {% endfor %}   
            {% endif %} 
        {% endfor %}  
    {% endif %}

{% endblock %}
```

میتوانیم برای تصاویر دکمه حذف اضافه کنیم.

**مثله حذف پست ها برایش URL و view ایجاد میکنیم ولی دیگه تمپلیت برای تایید حذف ایجاد نمیکنیم.**

#### **ایجاد url برای حذف تصاویر:**

`app directory/urls.py`

```python
urlpatterns = [
    # ...
    path('profile/delete-image/<image_id>', views.delete_image, name='delete_image'),
]
```

**دکمه حذف تصاویر در تمپلیت create_post:**

> برای درک راحت تر در کد زیر فرم و ارورها را نمایش نداده ایم.

`templates/forms/create_post.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Create & edit Post {% endblock %}

{% block content %}
    <!-- form -->
    <!-- ... -->

    <!-- نمایش تصاویر پست -->
    {% if post and post.images.exists %}
        <div class="photos">
            {% for pic in post.images.all %}
                <div class="photo">
                    <img src="{{ pic.img_file.url }}" alt="pic.img_file">

                    <a href="{% url 'blog:delete_image' pic.id %}">delete image</a>
                </div>
            {% endfor %}
        </div>
    {% endif %}

    <!-- نمایش خطاها -->
    <!-- ... -->
{% endblock %}
```

#### **ایجاد view برای حذف تصاویر:**

`app directory/views.py`

```python
def delete_image(request, image_id):
    image = get_object_or_404(Image, pk=image_id)
    image.delete()

    return redirect('blog:profile')
```

با این حال تصویر از پروژه حذف نمیشود، خب راهکار چیه؟!

باید برای مدل Image متد <span class="en-text">delete()</span> را override کنیم. | بدنه متد <span class="en-text">delete()</span> برای مدل Image کمی متفاوت نوشته میشود.

`app directory/models.py`

```python
class Image(models.Model):
    # Image فیلدهای مدل 
    # ...

    def delete(self, *args, **kwargs):
        storage, path = self.img_file.storage, self.img_file.path

        storage.delete(path)
        super().delete(*args, **kwargs)
```

شاید برای برخی دوستان سوال پیش آمده باشه که اگه بخواهیم تمپلیت create_post.html را که برای هر دو فرم ایجاد پست و ویرایش پست مشترک است را به صورت دستی و با تگ های input ایجاد کنیم ساختار چگونه است؟!

خب بریم ببینیم:

`templates/forms/create_post.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Create & edit Post {% endblock %}

{% block content %}

    <form method="post" enctype="multipart/form-data">
        {% csrf_token %}

        <!-- _____________________________ inputs _____________________________ -->

        <input type="text" name="title" value="{{ form.title.value|default_if_none:'' }}">

        <textarea name="description">{{ form.description.value|default_if_none:'' }}</textarea>

        <input type="number" min=0 name="reading_time" value="{{ form.reading_time.value|default_if_none:'' }}">

        <input type="file" name="image1">
        <input type="file" name="image2">

        <!-- _________________________________________________________________ -->

        <input type="submit" value="send" class="sub">
    </form>

    <!-- نمایش تصاویر پست -->
    {% if post and post.images.exists %}
        <div class="photos">
            {% for pic in post.images.all %}
                <div class="photo">
                    <img src="{{ pic.img_file.url }}" alt="pic.img_file">
                </div>
            {% endfor %}
        </div>
    {% endif %}

    <!-- نمایش خطاها -->
    {% if form.non_field_errors %}
        {{ form.non_field_errors }}
    {% endif %} 

    {% if form.errors %}
        {% for field in form %}
            {% if field.errors %}
                {% for error in field.errors %}
                    {{ field.label }}: {{ error }}
                {% endfor %}   
            {% endif %} 
        {% endfor %}  
    {% endif %}

{% endblock %}
```

استفاده از ساختار <span class="en-text">{{ form.field-name.value|default_if_none:"" }}</span> برای اتریبیوت value باعث میشود که در حالت ایجاد پست (که از طرف view تعیین میشود) فیلدها خالی نمایش داده شوند و وقتی حالت ویرایش پست باشد فیلدها براساس محتوای فیلد پر نمایش داده میشوند.

### احراز هویت و لاگین (ورود)

**میخواهیم اگر کاربر لاگین کرده بود username کاربر را نمایش دهیم و در غیر این صورت یک دکمه برای لاگین کردن نمایش دهیم:**

این قابلیت را در تمپلیت header انجام میدهیم تا در همه صفحات وجود داشته باشد.

`templates/partials/header.html`

```jinja
<!-- search field -->
<form action="{% url 'Blog:post_search' %}" method="get">
    <input type="text" name="query" required placeholder="عبارت مدنظر را وارد کنید">
    <input type="submit" value="search">
</form>

<!-- profile link -->
<p><a href="{% url 'blog:profile' %}">profile</a></p>

<!-- login button -->
{% if request.user.is_authenticated %}
    <div>
        <a href="#">{{ request.user.username }}</a>
    </div>
{% else %}
    <a href="#">Login</a>
{% endif %}
```

> request هم توی تمپلیت و هم توی view قابل استفاده میباشد.
>
> <span class="rtl-text">دستور **request.user**، کاربری که لاگین کرده است را برمیگرداند(کاربر فعلی)، متد **<span class="en-text">is_authenticated()</span>** هم بررسی میکنه کاربر احراز هویت شده یا نه؟(لاگین کرده یا نه؟!)</span>

#### **پیاده سازی قابلیت لاگین برای وبسایت:**

django authentication system: فریمورک(سیستم) احراز هویت جنگو میباشد.

> این فریمورک به صورت پیشفرض در جنگو وجود درد. | نیازی به نصب یا اعمال تنظیمات ندارد.
>
> برای هندل(مدیریت) کردن authentication, sessions, permisions و... استفاده میشه.

این فریمورک در مسیر django.contrib.auth قرار داره.

#### **ایجاد URL برای صفحه لاگین**

`app directory/urls.py`

```python
urlpatterns = [
    # ...
    path('login/', views.user_login, name='login'),
]
```

از این url برای href دکمه لاگین که در header ایجاد کردیم، استفاده میکنیم:

`templates/partials/header.html`

```jinja
<!-- search field & profile link -->
<!-- ... -->

<!-- login button -->
{% if request.user.is_authenticated %}
    <div>
        <a href="#">{{ request.user.username }}</a>
    </div>
{% else %}
    <a href="{% url 'blog:login' %}">Login</a>
{% endif %}
```

#### **ایجاد فرم لاگین در forms.py**

`app directory/forms.py`

```python
class LoginForm(forms.Form):
    username = forms.CharField(max_length=250, required=True)
    password = forms.CharField(max_length=250, required=True, widget=forms.PasswordInput)
```

#### **ایجاد view برای صفحه لاگین:**

جهت استفاده از سیستم احراز هویت، برای لاگین لازم است مواردی را ایمپورت کنیم:

`app directory/views.py`

```python
from django.contrib.auth import authenticate, login
```

ساختار کد view:

`app directory/views.py`

```python
def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            user = authenticate(request, username=cd['username'], password=cd['password'])
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return redirect('Blog:profile')
                else:
                    return HttpResponse('Your account is disabled!')
            else:
                return HttpResponse('you are not logged in')

    else:
        form = LoginForm()

    return render(request, 'forms/login.html', {'form': form})
```

#### توضیحات:

1- اطلاعات فرم را از تمپلیت دریافت کرده و به LoginForm ارسال میکنیم.

> باید بررسی کنیم این username و password توی دیتابیس وجود درند یا نه؟!
>
> از کلاس authenticate، برای این احراز هویت(بررسی username و password) استفاده میکنیم، اگه کاربر وجود داشته باشد آن کاربر را برمیگرداند و در غیر این صورت None برگردانده میشود.

2- برای بررسی احراز هویت، username و password را برای کلاس authenticate مشخص میکنیم.

3- چنانچه کاربری با آن اطلاعات وجود داشت، لازم است بررسی کنیم که آن کاربر active میباشد یا اینکه deactive شده است.

> اگه کاربر active بود از کلاس login استفاده کرده و request و  user را جهت لاگین کردن برایش مشخص میکنیم.
>
> و پس از لاگین کردن کاربر را به صفحه پروفایل redirect میکنیم.

> اگر هم کاربر deactive بود برایش یک پیام با محتوای "حساب شما غیرفعال شده" نمایش میدهیم.

4- اگر کاربری با اطلاعات وارد شده وجود نداشت پیام با محتوای "شما لاگین نکرده اید" نمایش میدهیم.

#### **ایجاد تمپلیت برای صفحه لاگین:**

`templates/forms/login.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} Login {% endblock %}

{% block content %}
    <h1>login</h1>
    <p>Enter your informations please...</p>

    <form method="post">
        {% csrf_token %}

        {{ form.as_p }}

        <input type="submit" value="login">
    </form>
{% endblock %}

```

### لاگین و لاگ اوت (خروج) مبتنی بر کلاس

تمپلیت فیلتر default: در صورتی که متغیر وجود نداشت مقدار پیشفرض که برایش مشخص میکنیم را نمایش میدهد.

مثلا توی header مشخص میکنیم، اگر کاربر لاگین کرده first_name کاربر را نمایش بده و اگر first_name وجود نداشت؛ username آن کاربر را نمایش دهد.

`templates/partials/header.html`

```jinja
<!-- search field -->
<form action="{% url 'Blog:post_search' %}" method="get">
    <input type="text" name="query" required placeholder="عبارت مدنظر را وارد کنید">
    <input type="submit" value="search">
</form>

<!-- profile link -->
<p><a href="{% url 'blog:profile' %}">profile</a></p>

<!-- login button -->
{% if request.user.is_authenticated %}
    <div>
        <a href="#">{{ request.user.first_name | default:request.user.username }}</a>
    </div>
{% else %}
    <a href="#">Login</a>
{% endif %}
```

جنگو برای احراز هویت (auth) یکسری class based view داره که کار ما را برای احراز هویت راحت تر میکند.

> نمونه هایی از آنها عبارتند از: LoginView, LogoutView, PasswordChange, PasswordReset

ما میتوانیم مستقیما از این class based view ها استفاده کنیم، و یا مثل ListView و DetailView، آنها را شخصی سازی کنیم.

> برای "class based view" ها form  و view به صورت پیشفرض وجو دارد.
>
> پس وقتی بدون شخصی سازی از class based view ها استفاده کنیم نیازی به view و form نداریم.

برای استفاده مستقیم و بدون شخصی سازی از class based view ها در urls.py آنها را ایمپورت کرده و از آنها استفاده میکنیم.

`app directory/urls.py`

```python
from django.contrib.auth import views as auth_views
```

برای آن اسم مستعار مشخص مینیم تا با اسکریپت views که ایمپورت شده به تداخل نخورد و مشکلی پیش نیاید.

#### **ایجاد url برای لاگین و لاگ اوت با استثاده از class based view:**

`app directory/urls.py`

```python
urlpatterns = [
    # ...
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
]
```

**نکته:** جنگو توی تنظیماتش یکسری مسیر پیشفرض داره؛ مثل مسیر فایل های static و یا تمپلیت ها که templates میباشد، فریمورک احراز هویت جنگو، مسیر تمپلیت هایش به صورت پیشفرض registration میباشد.(این دایرکتوری باید در templates ایجاد شود.)

تمپلیت هایی که برای این class based view ها ایجاد میکنیم باید در دایرکتوری registration قرار بگیرند.

>برای اینکه LoginView تمپلیت ما را تشخیص دهد لازم است تمپلیت login را به دایرکتوری registration منتقل کنیم.

> سیستم احراز هویت برای تمپلیت هایی که برایش ایجاد میشوند نام پیشفرض داره برای مثال: login.html و یا logged_out.html

وقتی از class based view ها استفاده میکنیم، متغیر form را در تمپلیت تشخیص میدهد.

#### **الزام به لاگین کردن برای برخی صفحات:**

برخی صفحات مثل صفحات پروفایل، ایجاد پست جدید، ویرایش پست و...؛ تا زمانی که کاربر لاگین نکرده است نباید نمایش داده شوند، پس لازم است view این طور صفحات را الزام به لاگین کنیم.

برای این کار از دکوراتور login_required استفاده میکنیم که باید ایمپورت شود:

`app directory/views.py`

```python
from django.contrib.auth.decorators import login_required
```

حالا قبل از view هر صفحه ای که باید الزام به لاگین باشد از این دکوراتور استفاده میکنیم.

`app directory/views.py`

```python
@login_required
>def profile(request):...

# ---------------------------------------------------------------

@login_required
>def create_post(request):...
```

> چنانچه کاربری در وبسایت لاگین نکرده باشد، این دکوراتور کاربر را به صفحه لاگین منتقل میکند.

#### **تغییرات جزئی در تمپلیت صفحه لاگین:**

حالا برای فرم لاگین یک تغییر ایجاد میکنیم؛ قبل از دکمه submit یک input با تایپ hidden ایجاد میکنیم، و برای آن اتریبیوت های name  و value با مقادیر زیر مشخص میکینم:

`templates/registration/login.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} Login {% endblock %}

{% block content %}
    <h1>login</h1>
    <p>Enter your informations please...</p>

    <form method="post">
        {% csrf_token %}

        {{ form.as_p }}

        <input type="hidden" name="next" value="{{ next }}">
        <input type="submit" value="login">
    </form>
{% endblock %}
```

> متغیر next خودکار توسط LoginView ارسال میشه.

**خب این next چی هست اصلا و چکار میکنه؟!**

در واقع یک url هست که مشخص میکنه پس از لاگین کردن به چه صفحه ای منتقل شویم.

این next برای صفحاتی که الزام به لاگین هستند کاربرد دارد.

**بریم یک مثال بزنیم:**

> فرض کنیم میخواهیم به صفحه افزودن پست برویم ولی هنوز در وبسایت لاگین نکرده ایم؛
>
> وقتی که میخواهیم به صفحه افزودن پست برویم چون این صفحه الزام به لاگین میباشد ما را به صفحه لاگین منتقل میکند با این حال متغیر next آدرس (URL) صفحه افزودن پست را در خود نگه میدارد و زمانی که لاگین کردیم به کمک آن url ما را به آن صفحه منتقل میکند.

#### **تنظیمات مربوط به login و logout:**

برای اینکه url "لاگین" و "لاگ اوت" به درستی کار کنند لازم است در تنظیمات پروژه تغییراتی اعمال کنیم.

`project directory/settings.py`

```python
# ...

LOGIN_REDIRECT_URL = '/profile/'
LOGIN_URL = '/login/'
LOGOUT_URL = '/logout/'
```

**توضیحات:**

متغیر اول مسیر پیشفرضی است که میخواهیم پس از لاگین شدن به آن صفحه منتقل شویم.

متغیر دوم و سوم هم مسیر(URL) صفحات login و logout هستند که در پروژه خود مشخص کرده ایم.

**نکته:** کاراکتر اسلش (/)، که در ابتدای url ها قرار گرفته الزامی میباشد چون در ادامه آدرس، قرار میگیره و اگه نباشد ارور میدهد.


> <span class="en-text">URL/profile</span>
>
> <span class="en-text">URL/login</span>
>
> <span class="en-text">URL/logout</span>


#### **نکته خیلی مهم:**

`project directory/urls.py`

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('Blog.urls', namespace='Blog'))
]
```

> <span class="rtl-text">**نکته مهم:** در urls.py پروژه، همان طور که در بالا مشاهده میکنید، عبارتی برای اپلیکیشن خود مشخص نکردیم برای همین در تنظیمات مربوط به login و logout هم عبارتی نوشته نشده است.</span>
>
>حالا فرض کنیم، ما برای اپلیکیشن از عبارت blog در urls.py استفاده کرده ایم بنابراین متغیر ها را به صورت زیر مینویسیم.
>
>
> > <span class="en-text">LOGIN_REDIRECT_URL = '/blog/profile/'</span>
> >
> > <span class="en-text">LOGIN_URL = '/blog/login/'</span>
> >
> > <span class="en-text">LOGOUT_URL = '/blog/logout/'</span>

#### **ایجاد دکمه logout:**

برای "logout" یک دکمه در صفحه پروفایل ایجاد میکنیم؛ و برای href آن، URL مربوط به "logout" را مشخص میکنیم:

`templates/blog/profile.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Profile {% endblock %}


{% block content %}
    <h1>Profile</h1>

    <p><a href="{% url 'blog:logout' %}">Logout</a></p>

    <a href="{% url 'blog:create_post' %}">Create Post</a>

    <!-- ادامه کدها -->
    ...
{% endblock %}
```

#### **بریم برای logout تمپلیت شخصی سازی شده ایجاد کنیم:**

این تمپلیت را برای "logout" که با ساختار class-based-view پیاده سازی شده است؛ استفاده میکنیم، بنابراین در دایرکتوری registration قرار میگیرد.

`templates/registration/logged_out.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Logout {% endblock %}


{% block content %}
    <h1>you logged out</h1>
    <br>
    <a href="{% url 'blog:login' %}">login again</a>
{% endblock %}
```

**نکته مهم:**

> زمانیکه از class-based-view استفاده میکنیم برای اینکه تمپلیت های شخصی سازی شده ما  را بجای تمپلیت های پیشفرض نمایش دهد باید تغییراتی در تنظیمات ایجاد کنیم؛
>
> -اسم اپلیکیشن خود را در بالای لیست INSTALLED_APPS قرار دهیم.
>
> -اسم app خود را در بالای admin و auth قرار میدهیم، تا تمپلیت های ما در اولویت قرار بگیرند.

`project directory/settings.py`

```python
# Application definition

INSTALLED_APPS = [
    'blog.apps.BlogConfig',

    'django.contrib.admin',
    'django.contrib.auth',
    # ...
]
```

#### **خب بریم logout را با ساختار توابع ایجاد کنیم:**

این بار میخواهیم بدون استفاده از class based view و با توابع logout را پیاده سازی کنیم.

**ایجاد url برای logout:**

`app directory/urls.py`

```python
urlpatterns = [
    # ...
    path('logout/', views.log_out, name='logout'),
]
```

**ایجاد view برای logout:**

باید logout را ایمپورت کنیم:

`app directory/views.py`

```python
from django.contrib.auth import logout


def log_out(request):
    logout(request)
    return redirect(request.META.get('HTTP_REFERER'))
```

اگر بخواهیم پس از logout از هر صفحه ای، به همان صفحه برگردد از عبارت زیر استفاده میکنیم.

> <span class="en-text">return redirect(request.META.get('HTTP_REFERER'))</span>

### تغییر پسورد

برای تغییر پسورد هم از class-based-view های احراز هویت استفاه میکنیم.

برای تغییر پسورد، دو URL ایجاد میکنیم، یکی برای فرم تغییر پسورد و دیگری برای صفحه ای که پیغام "تغییر موفقیت آمیز پسورد" را نمایش میدهد.

#### **ایجاد url:**

`app directory/urls.py`

```python
urlpatterns = [
    path('password-change/', auth_views.PasswordChangeView.as_view(success_url='done'), name='password_change'),
    path('password-change/done/', auth_views.PasswordChangeDoneView.as_view(), name='password_change_done'),
]
```

> آرگومان success_url زمانی استفاده می‌شود که شما می‌خواهید بعد از انجام موفقیت‌آمیز یک عملیات (مثلاً تغییر رمز عبور)، کاربر به یک صفحه مشخص هدایت شود. به عبارت دیگر، این آرگومان مشخص می‌کند که بعد از اتمام موفقیت‌آمیز عملیات جاری، به چه صفحه ای(URL) منتقل شود.
>
> - مقدار success_url می‌تواند یک URL نسبی (مانند 'done') یا یک URL کامل باشد.
>
> **به طور خلاصه، success_url یک ابزار مهم در ویوهای مبتنی بر کلاس در جنگو است که به شما امکان می‌دهد جریان کاری کاربر را بعد از انجام موفقیت‌آمیز یک عملیات کنترل کنید.**

#### **برای هر کدام از این URL ها یک تمپلیت در مسیر(دایرکتوری) registration ایجاد میکنیم:**

`templates/registration/password_change_form.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} Change Password {% endblock %}

{% block content %}
    <h1>Change Password</h1>
    <p>Enter previous password and new password:</p>

    <form method="post">
        {% csrf_token %}

        {{ form.as_p }}

        <input type="submit" value="Change Password">
    </form>
{% endblock %}
```

`templates/registration/password_change_done.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} Change Password {% endblock %}

{% block content %}
    <h1>Password was changed successfully!</h1>
{% endblock %}
```

برای استفاده از قابلیت تغییر پسورد؛ در صفحه پروفایل یک لینک (دکمه) ایجاد کرده و برای href آن، از URL فرم تغییر پسورد استفاده میکینم.

`templates/blog/profile.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Profile {% endblock %}


{% block content %}
    <h1>Profile</h1>

    <!-- logout button -->
    <p><a href="{% url 'blog:logout' %}">Logout</a></p>

    <!-- Change Password button -->
    <p><a href="{% url 'blog:password_change' %}">Change Password</a></p>

    <!-- create post button -->
    <a href="{% url 'blog:create_post' %}">Create Post</a>

    <!-- ادامه کدها -->
    ...
{% endblock %}
```

### بازنشانی (reset) پسورد

برای ریست پسورد، از 4 URL استفاده میکنیم.

#### **ایجاد URL برای بازنشانی پسورد:**

`app directory/urls.py`

```python
urlpatterns = [
    path('password-reset/', auth_views.PasswordResetView.as_view(success_url='done'), name='password_reset'),
    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('password-reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(success_url='/password-reset/complete'), name='password_reset_confirm'),
    path('password-reset/complete/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
```

>**در URL سوم:**
>
> - پارامتر uidb64: برای نشان دادن شناسه منحصر به فرد کاربر (که در قالب base64 کدگذاری شده است) استفاده میشود. از آن برای رمزگشایی و شناسایی کاربری(user) که برای او ریست پسورد درخواست شده است استفاده میشود.
>
> - پارامتر توکن: برای تأیید اعتبار request و اطمینان از اینکه لینک ریست پسورد، دستکاری نشده باشد استفاده میشود. | برای بررسی معتبر بودن لینک استفاده میشود.

#### **ایجاد تمپلیت برای url های ریست پسورد:**

>1. <span class="en-text">password_reset_form.html</span>
>
>2. <span class="en-text">password_reset_email.html</span>
>
>3. <span class="en-text">password_reset_done.html</span>
>
>4. <span class="en-text">password_reset_confirm.html</span>
>
>5. <span class="en-text">password_reset_complete.html</span>

<span class="rtl-text">تمامی تمپلیت ها در مسیر `templates/registration` قرار میگیرند، بنابراین برای راحتی مسیر را از registration نشان میدهیم.</span>

#### template 1:

`registration/password_reset_form.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %}reset pasword{% endblock %}


{% block content %}
    <h1>Reset Password</h1>
    <p>Enter your Email please...</p>

    <form method="post">
    {% csrf_token %}

    {{ form.as_p }}

    <input type="submit" value="Send Email">
    </form>
{% endblock %}
```

#### template 2:

در تمپلیت password_reset_email، متن ایمیل که به کاربر ارسال میشه را ایجاد میکنیم.

`registration/password_reset_email.html`

```jinja
<!-- Email text -->
Subject: Password reset request

Dear {{ user.get_username }},

We have received a request to reset your password with the email and username below.

Username: {{ user.get_username }}
Email: {{ email }}

If you did not make this request, please ignore this email.

Click the link below to reset the password:

{{ protocol }}://{{ domain }}{% url 'Blog:password_reset_confirm' uidb64=uid token=token %}
```

> متغیرهایی که استفاده میکنیم توسط سیستم احراز هویت جنگو به صورت پیشفرض تعریف شده اند.

#### template 3:

`registration/password_reset_done.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %}reset pasword{% endblock %}

{% block content %}
    <h1>Reset Password</h1>

    <p>password change link was sent to you, please check your email❤️</p>
{% endblock %}
```

#### template 4:

در تمپلیت password_reset_confirm پسورد جدید را وارد میکنیم.

`registration/password_reset_confirm.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %}reset pasword{% endblock %}

{% block content %}
    <h1>Reset Password</h1>

    {% if validlink %}
        <form action="" method="post">
            {% csrf_token %}
            {{ form.as_p }}
            <input type="submit" value="change password">
        </form>
    {% else %}
        your link is not valid...
    {% endif %} 

{% endblock %}
```

> - توکنی که توی url استفاده شده بررسی میکنه لینکی که کاربر کلیک کرده معتبر هست یا نه؟!
>
> - عبارت validlink توی تمپلیت password_reset_confirm کمک میکنه چک کنیم، آیا لینکی که کاربر وارد شده معتبره یا نه؟!!
>
> بنابراین، وجود توکن در URL و استفاده از validlink در تمپلیت، هردو برای بررسی اعتبار لینک بازنشانی رمز عبور کاربرد دارند.

#### template 5:
`registration/password_reset_complete.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %}reset pasword{% endblock %}

{% block content %}
    <h1>Reset Password</h1>

    <p>Your password was changed successfully</p>

    <a href="{% url 'blog:login' %}">Login</a>
{% endblock %}
```

> ریست پسورد، برای زمانیست که کاربر رمز خود را فراموش کرده است؛ بنابراین لینک ریست پسورد را در صفحه لاگین قرار میدهیم.

`templates/registration/login.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} Login {% endblock %}

{% block content %}
    <h1>login</h1>
    <p>Enter your informations please...</p>

    <form method="post">
        {% csrf_token %}

        {{ form.as_p }}

        <input type="hidden" name="next" value="{{ next }}">
        <input type="submit" value="login">
    </form>
    <p>
        <a href="{% url 'blog:password_reset' %}">Forgot your Password?</a>
    </p>
{% endblock %}
```

#### سیستم ارسال ایمیل:

چون در حال حاضر سیستم ارسال ایمیل نداریم باید مشخص کنیم که ایمیل ارسالی را در کنسول نمایش دهد.

در انتهای کد تنظیمات متغیر EMAIL_BACKEND را اضافه میکینم:

`project directry/settings.py`

```python
EMAIL_BACKEND = django.core.mail.backends.console.EmailBackend'
```

**نکته مهم:** ارسال ایمیل برای کاربرانی انجام میشود که در اطلاعات کاربری خود ایمیل ثبت کرده باشند.

پس اگر گاربری ایمیل نداشته باشد نمیتواند ریست پسورد را انجام دهد.

### ثبت نام (register)

برای ثبت نام(register or sign-up) یک فرم در forms.py ایجاد میکنیم:

`app directory/forms.py`

```python
class UserRegisterForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    repeat_password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['username', 'email']

    def clean_repeat_password(self):
        cd = self.cleaned_data

        password = cd['password']
        repeat_password = cd['repeat_password']

        if password != repeat_password:
            raise forms.ValidationError('Passwords must match.')
        return repeat_password
```

1- فیلد پسورد را جدا ایجاد میکنیم، برای اینکه میخواهیم برای تکرار پسورد هم یک فیلد داشه باشیم و در ضمن باید تطابق این دو فیلد پسورد؛ بررسی شود برای همین آن دو فیلد را خارج از کلاس Meta تعریف میکنیم.

2- اعتبارسنجی برای تطابق پسورد ها را انجام میدهیم.

#### **ایجاد URL برای صفحه ثبت نام:**

`app directory/urls.py`

```python
urlpatterns = [
    # ...
    path('register/', views.register, name='register'),
]
```

#### **ایجاد view برای صفحه ثبت نام:**

`app directory/views.py`

```python
def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()

            return render(request, 'registration/register_done.html', {'user': user})
    else:
        form = UserRegisterForm()

    return render(request, 'registration/register.html', {'form': form})
```

**توضیحات:**

> جنگو hash شده پسورد را ذخیره و از آن استفاده میکند.
>
> الگوریتم های مختلفی برای hash کردن دارد؛ الگوریتم پیشفرض آن SHA256 میباشد.

برای ذخیره پسورد کاربر، در دیتابیس از متد <span class="en-text">set_password()</span> استفاده میکنیم؛ این متد از الگوریتم پیشفرض جنگو استفاده کرده و پسورد را به صورت هش شده ذخیره میکند.

> برای ثبت نام دو تمپلیت ایجاد میکنیم:
>
> 1- برای نمایش پیام "ثبت نام شما با موفقیت انجام شد" به کاربر 
>
> 2- نمایش فرم ثبت نام

#### template 1:

`templates/registration/register.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} Register {% endblock %}

{% block content %}
    <h1>Register</h1>
    <p>Enter your informations please</p>

    <form method="post">
        {% csrf_token %}

        {{ form.as_p }}

        <input type="submit" value="Register">
    </form>
{% endblock %}
```

#### template 2:

`templates/registration/register_done.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} Register done {% endblock %}

{% block content %}
    <h1>Dear {{ user }}</h1>
    <p>You have successfully registered 😍</p>

    <a href="{% url 'blog:login' %}">Login</a>
{% endblock %}
```

#### دکمه ثبت نام:

برای ثبت نام یک دکمه، کنار دکمه ورود در header ایجاد میکنیم.

`templates/partials/header.html`

```jinja
<!-- search field -->
<form action="{% url 'Blog:post_search' %}" method="get">
    <input type="text" name="query" required placeholder="عبارت مدنظر را وارد کنید">
    <input type="submit" value="search">
</form>

<!-- profile link -->
<p><a href="{% url 'blog:profile' %}">profile</a></p>


{% if request.user.is_authenticated %}
    <div>
        <a href="#">{{ request.user.first_name | default:request.user.username }}</a>
    </div>
{% else %}
    <!-- ___________________ login & register button ___________________ -->
    <!-- login button -->
    <a href="{% url 'blog:login' %}">Login</a>
    <!-- register button -->
    <a href="{% url 'blog:register' %}">Register</a>
{% endif %}
```

### توسعه مدل User و ویرایش اطلاعات شخصی

برای توسعه مدل User میتوانیم از دو روش استفاده کنیم:

1- ایجاد یک مدل جدید که شامل فیلدهای  اضافی مثل (بیوگرافی، شغل، تصویر پروفایل و...) میباشد و اتصال آن به مدل User

2- بجای استفاده از مدل پیشفرض جنگو، مدل شخصی سازی خود را ایجاد میکنیم.

**در این بخش، از حالت اول استفاده میکنیم.**

#### ایجاد مدل جدید:

یک مدل جدید نوشته و برای آن فیلدهای جدیدی که میخواهیم مدل User داشته باشد ، مشخص میکنیم. | میتوان از اسم account و یا profile برای این مدل استفاده کرد.

`app directory/models.py`

```python
class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account')

    avatar = ResizedImageField(upload_to='profile_image', size=[500, 500], quality=75, crop=['middle', 'center'], null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    job = models.CharField(max_length=250, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.user.username
```

**توضیحات:**

1- اولین فیلد user هست که از فیلد رابطه ای OneToOne ایجاد شده و آنرا به مدل User متصل کرده ایم.

> برای هر کاربر این ویژگی های جدید را اضافه میکنیم. | هر user یک account خواهد داشت و هر اکانتی به یک کاربر متصله برای همین از فیلد 1to1 استفاده میکنیم.

2- به غیر از user سایر فیلدها را اختیاری قرار میدهیم. (به کمک آرگومان های null و blank)

> پس از ایجاد مدل دستورات makemigrations و migrate فراموش نشه!

#### **بریم مدل اکانت را در پنل ادمین نمایش دهیم:**

`app directory/admin.py`

```python
@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'birth_date', 'avatar']
```

#### **تغییر view مربوط به register(ثبت نام):**

در آموزش قبلی برای ثبت نام یک view ایجاد کردیم که یک کاربر با فیلدها و قابلیت های محدود ایجاد میکرد و تمام ولی الآن که برای سایر فیلدها یک مدل جدید ایجاد کردیم؛ باید برای هر کاربری که ثبت نام میکنه یک اکانت هم ایجاد شود.

برای همین در view ثبت نام پس از ایجاد کاربر یک آبجکت برای مدل account ایجاد میکنیم، و آنرا به این کاربر جدید متصل میکنیم.

`app directory/views.py`

```python
def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()

            # ایجاد آبجکت اکانت و اتصال به کاربر جدید
            Account.objects.create(user=user)

            return render(request, 'registration/register_done.html', {'user': user})
    else:
        form = UserRegisterForm()

    return render(request, 'registration/register.html', {'form': form})
```

#### **قابلیت ویرایش اطلاعات شخصی برای هر کاربر:**

خب حالا میخواهیم قابلیت ویرایش اطلاعات شخصی را برای هر کاربر در صفحه  پروفایل ایجاد کنیم.

#### ایجاد فرم ویرایش اطلاعات شخصی در forms.py:

در حال حاضر برای مشخصات کاربری(اطلاعات شخصی) دو مدل داریم: 1- مدل User 2- مدل Account بنابراین در forms.py  دو فرم برای ویرایش اطلاعات ایجاد میکنیم:

`app directory/forms.py`

```python
class UserEditForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']


# ----------------------------------------------------------------------------
class AccountEditForm(forms.ModelForm):
    class Meta:
        model = Account
        # user همه فیلدها بجز فیلد
        exclude = ['user']
```

#### ایجاد view برای ویرایش اطلاعات شخصی:

خب بریم مثله ویرایش پست، برای فرم ویرایش اطلاعات شخصی یک view ایجاد کنیم:

چون دو تا فرم داریم اطلاعات دریافتی از فرم تمپلیت را در هردو فرم ارسال میکنیم.

`app directory/views.py`

```python
@login_required
def edit_account(request):
    if request.method == 'POST':
        user_form = UserEditForm(request.POST, instance=request.user)
        account_form = AccountEditForm(request.POST, request.FILES, instance=request.user.account)
        if user_form.is_valid() and account_form.is_valid():
            user_form.save()
            account_form.save()
            return redirect('blog:profile')
    else:
        user_form = UserEditForm(instance=request.user)
        account_form = ProfileEditForm(instance=request.user.account)

    context = {
        'user_form': user_form,
        'account_form': account_form
    }

    return render(request, 'registration/edit_account.html', context)
```

**توضیحات:**

1- چون برای ویرایش یک آبجکت از قبل وجود داره، بنابراین برای فرم ها از آرگومان instance استفاده کرده و آبجکت را برایش مشخص میکنیم.

> برای دسترسی به اکانت کاربر، از related_name مدل account استفاده کرده ایم. request.user.account

2- برای فرم اکانت تصویر هم داریم بنابراین لازم است از آرگومان request.FILES استفاده کنیم.

3- چون دیگر قرار نیست، اطلاعاتی به آبجکت های فرم اضافه کنیم؛ و فرم ها را مستقیم در دیتابیس ذخیره میکنیم، دیگه از آرگومان commit=False استفاده نمیکنیم.

#### ایجاد URL برای فرم ویرایش اطلاعات شخصی:

`app directory/urls.py`

```python
urlpatterns = [
    # ...
    path('profile/edit-account/', views.edit_account, name='edit_account'),
]
```

#### ایجاد تمپلیت ویرایش اطلاعات شخصی(مشخصات کاربری):

چون در فرم از فایل استفاده میکنیم؛ **لازم است** برای تگ form از اتریبیوت enctype استفاده کنیم.

`templates/registration/edit_account.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} Edit Account {% endblock %}

{% block content %}
    <h1>Edit personal information</h1>
    <p>Edit your information please</p>

    <form method="post" enctype="multipart/form-data">
        {% csrf_token %}

        {{ user_form.as_p }}
        {{ account_form.as_p }}

        <input type="submit" value="save">
    </form>
{% endblock %}
```

#### ایجاد دکمه ویرایش مشخصات کاربری:

در صفحه پروفایل یک دکمه برای ویرایش مشخصات کاربری ایجاد میکنیم:

`templates/blog/profile.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Profile {% endblock %}


{% block content %}
    <h1>Profile</h1>

    <!-- logout button -->
    <p><a href="{% url 'blog:logout' %}">Logout</a></p>

    <!-- Change Password button -->
    <p><a href="{% url 'blog:password_change' %}">Change Password</a></p>

    <!-- create post button -->
    <a href="{% url 'blog:create_post' %}">Create Post</a>

    <!-- edit account button -->
    <a href="{% url 'Blog:edit_account' %}">edit account</a>

    <!-- ادامه کدها -->
    ...
{% endblock %}
```

**نکته مهم:**

> برای کاربرانی که از قبل وجود داشتند باید اکانت نیز داشته باشند در غیر این صورت برای ویرایش اطلاعات شخصی آنها ارور میدهد.

### دسته بندی ساده

دسته بندی در اصل با ایجاد یک مدل مجزا و اتصال آن به مدل پست و انجام یکسری کارها صورت میگیرد ولی در حال حاضر از یک حالت ساده و بدون استفاده از مدل، دسته بندی را ایجاد میکینم.

برای مدل Post یک فیلد انتخابی ایجاد میکنیم؛ برای راحتی بجای استفاده از کلاس مثل status از تاپل برای ایجاد حالت انتخابی استفاده میکنیم.

`app directory/models.py`

```python
class Post(models.Model):
    class Status(models.TextChoices):
        Draft = 'DF', 'Draft'
        Published = 'PB', 'Published'
        Rejected = 'RJ', 'Rejected'

    # ️ ⬆️ choice-field ⬆️
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.Draft)

    # ----------------------------------------------------------------

    CATEGORY_CHOICES = (
        ('TECH', 'Technology'),
        ('AI', 'Artificial Intelligence'),
        ('PL', 'Programming Language'),
        ('OTHER', 'Other'),
    )
    category = models.CharField(max_length=6, choices=CATEGORY_CHOICES, default='OTHER')

    # another codes
    # ...
```

**توضیحات:**

1- یک تاپل که همه دسته بندی در آن قرار میگیرند؛ حالا داخل این تاپل، برای هر دسته بندی هم از تاپل استفاده میکنیم.

> - برای هر دسته بندی(تاپل ها) اولین مقدار در دیتابیس ذخیره میشود و مقدار دوم به کاربر نمایش داده میشود.

2- حالا یک فیلد از نوع CharField ایجاد کرده و برای آرگومان choice آن، اسم تاپل را مشخص میکنیم؛ و با آرگومان default هم یکی از گزینه ها را جهت نمایش انتخاب میکنیم.

> چون در مدل تغییر ایجاد کردیم باید از دستورات makemigrations و migrate استفاده کنیم.

#### **تغییر فرم افزودن پست:**

در forms.py برای فرم Create_Post،  فیلد category(دسته بندی) را اضافه میکنیم.

`app directory/forms.py`

```python
class CreatePostForm(forms.ModelForm):
    image1 = forms.ImageField(label='image1', required=False)
    image2 = forms.ImageField(label='image2', required=False)

    class Meta:
        model = Post
        # add category field
        fields = ['title', 'description', 'reading_time', 'category']
```

**حالا برای نمایش پست ها در تمپلیت post_list دو حالت داریم: 1- نمایش تمام پست ها 2- نمایش پست ها براساس یک دسته بندی خاص**

#### **ایجاد URL برای لیست پست ها:**

برای لیست پست ها به دو URL احتیاج داریم 1- url که دارای متغیر category (برای فیلتر پست ها براساس یک دسته بندی) میباشد 2- url که متغیر ندارد (برای نمایش تمام پست ها بکار میرود).

`app directory/urls.py`

```python
urlpatterns = [
    path('posts/', views.post_list, name='post_list'),
    path('posts/<str:category>', views.post_list, name='post_list_category'),
    # ...
]
```

#### **تغییر ساختار view برای لیست پست ها:**

1- از تابع برای این view استفاده میکنیم.

2- برای این تابع یک آرگومان بنام category ایجاد میکنیم و پیشفرض آنرا None مشخص میکنیم.

> وقتی متغیر category را اختیاری مشخص کنیم؛ اگه دسته بندی توسط url ارسال شد که آنرا دریافت کرده و پست ها را براساس آن دسته بندی فیلتر میکنیم اگر هم ارسال نشد که مقدار پیشفرض None دارد و در نتیجه تمام پست ها را نمایش میدهیم.
>
> این طوری هر دو حالت را در یک view مدیریت میکنیم.

`app directory/views.py`

```python
def post_list(request, category=None):
    if category is not None:
        posts = Post.published.filter(category=category.upper())
    else:
        posts = Post.published.all()

    paginator = Paginator(posts, 2)
    page_number = request.GET.get('page', 1)
    try:
        posts = paginator.page(page_number)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)
    except PageNotAnInteger:
        posts = paginator.page(1)
    context = {
        'posts': posts,
        'category': category,
    }
    return render(request, 'blog/post_list.html', context)
```

**توضیحات:**

1- برای استفاده از category، یک شرط میگذاریم که اگر دسته بندی وجود داشت؛ پست هایی که آن دسته بندی را دارند انتخاب کن و اگر دسته بندی وجود نداشت تمام پست های منتشر شده را انتخاب کن.

#### **تغییر تمپلیت لیست پست ها:**

> برای تگ h1 یک شرط مشخص میکنیم،
>
> - اگر دسته بندی وجود داشت متن این تگ را "لیست پست ها بر اساس دسته بندی ......"
>
> - و در غیر این صورت متن این تگ را "تمام پست ها" قرار دهد.

برای راحتی سایر کدها نوشته نشده اند.

`templates/blog/post_list.html`

```jinja
...
    {% if category %}
        <h1>لیست پست ها بر اساس دسته بندی {{ category }}</h1>
    {% else %}
        <h1>تمام پست ها</h1>
    {% endif %}
...
```

#### **استفاده از دسته بندی برای پست ها:**

یک لیست از دسته بندی ها (با استفاده از تگ a) ایجاد میکنیم و برای هر کدام از دسته بندی ها یک URL به صفحه لیست پست ها مشخص میکنیم.

`templates/blog/post_list.html`

```jinja
...
    <div class="content">
        <div class="categories">
            <a href="{% url 'blog:post_list' 'TECH' %}">Technology</a>
            <a href="{% url 'blog:post_list' 'AI' %}">Intelligence</a>
            <a href="{% url 'blog:post_list' 'PL' %}">Programming Language</a>
            <a href="{% url 'blog:post_list' 'OTHER' %}">Other</a>
        </div>

        <div class="posts">
            {% if category %}
                <h1>لیست پست ها بر اساس دسته بندی {{ category }}</h1>
            {% else %}
                <h1>تمام پست ها</h1>
            {% endif %}

            {% for post in posts %}
                <!-- نمایش هر پست -->
            {% endfor %}
        </div>
    </div>
...
```

#### **اضافه کردن دسته بندی به پست در پنل ادمین:**

`app directory/admin.py`

```python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'title', 'publish', 'status', 'category']
    # ...
```

کد ساختار پنل ادمین برای مدل پست:

`app directory/admin.py`

```python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'title', 'publish', 'status', 'category']
    ordering = ['-publish', '-author']
    list_filter = ['status', 'publish', 'author']
    search_fields = ['title', 'description']
    raw_id_fields = ['author']
    date_hierarchy = 'publish'
    prepopulated_fields = {'slug': ['title']}
    list_editable = ['status']

    inlines = [ImageInline, CommentInline]
```

**نکته مهم:**

در URL ها آیدی پست را که برای post_detail استفاده میشه با دسته بندی اشتباه میگیره برای همین URL مربوط به post_detail را تغییر میدهیم.

`app directory/urls.py`

```python
urlpatterns = [
    path('posts/detail/<int:post_id>', views.post_detail, name='post_detail'),
    # ...
]
```

### تمرینات فصل هفتم و نکاتی در مورد بلاگ (مهم)

#### **T1- ایجاد صفحه ای که اطلاعات و بیوگرافی نویسنده پست را نمایش میدهد، در ضمن تمام پست های نویسنده هم نمایش دهد:**

**a- ایجاد URL برای صفحه ی پروفایل نویسنده:**

`app directory/urls.py`

```python
urlpatterns = [
    path('author-profile/<str:username>', views.author_profile, name='author_profile'),
    # ...
]
```

**b- ایجاد view برای صفحه ی پروفایل نویسنده:**

`app directory/views.py`

```python
def author_profile(request, username):
    user = get_object_or_404(User, username=username, active=True)
    posts = Post.published.filter(author__username=username)

    context = {
        "user": user,
        "posts": posts,
    }

    return render(request, 'blog/author_profile.html', context=context)
```

 **c- ایجاد template برای صفحه ی پروفایل نویسنده:**

`templates/blog/author_profile.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} author Profile {% endblock %}


{% block content %}
    <div class="author-Profile">
        {% if user.first_name %}
            {{ user.first_name }}
        {% else %}
            {{ user.usernaem }}
        {% endif %}

        {% with account=user.account %}
            {% if account.avatar %}
                <img src="account.avatar.url" alt="account.avatar">
            {% endif %}

            Bio: {{ account.bio }}
            Job: {{ account.job }}
            date of birth: {{ account.birth_date }}
        {% endwith %}
    </div>

    <div class="posts">
        {% for post in posts %}
            <!-- نمایش جزئیات هر پست -->
        {% endfor %}
    </div>
{% endblock %}
```

در صفحه post_detail، نویسنده پست را مشخص کرده ایم؛ حالا آنرا داخل تگ a نوشته و برای href آن آدرس صفحه "پروفایل نویسنده" را مشخص میکنیم.

`templates/blog/post_detail.html`

```jinja
...
    <a href="{% url 'blog:author_profile' post.author.username %}">{{ post.author }}</a>
...
```

#### **T2- در صفحه پروفایل برای هر پست تمام کامنت هایش را نمایش دهد:**

میخواهیم کامنت های هر پست را به صورت پنجره modal در صفحه پروفایل نمایش دهیم.

> برای این کار:
>
> 1- از بوت استرپ در پروژه خود استفاده میکنیم.   
> 2- برای هر پست یک دکمه ایجاد کرده تا با آن پنجره modal باز شود.   
> 3- یک تمپلیت برای ساختار پنجره modal ایجاد میکنیم.

**برای درک بهتر فقط بخش های اصلی کد پروفایل را مینویسیم.**

`templates/blog/profile.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Profile {% endblock %}

<!-- ___________________________ bootstrap ___________________________ -->
{% block head %} 
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
{% endblock %}

{% block content %}
    <h1>Profile</h1>

    <table>
        <caption>All Post</caption>
        <tr>
            <th>row</th>
            <th>title</th>
            <th>edit</th>
            <th>delete</th>
            <th>status</th>
            <th>comments</th>
        </tr>
        {% for post in all_posts %}
            <tr>
                <!-- row -->
                <td>{{ forloop.counter }}</td>
                <!-- title -->
                <td><a href="{{ get_absolute_url }}">{{ post.title }}</a></td>
                <!-- edit -->
                <td><a href="#">edit</a></td>
                <!-- delete -->
                <td><a href="#">delete</a></td>
                <!-- status -->
                <td>{{ post.status }}</td>

                <!-- show-comment button -->
                <td><button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#postModal{{ post.id }}">مشاهده نظرات</button></td>
            </tr>

            {% include "blog/modal_comment.html" with post=post %}

        {% endfor %}
    </table>

    <!-- -------------  صفحه بندی همه پست ها  ------------- -->
    {% include 'partials/pagination.html' with page=all_posts %}

<!--_________ سایر کدها _________-->
    ...

    <!-- ___________________________ bootstrap ___________________________ -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
    
{% endblock %}
```

**تمپلیت برای پنجره modal:**

`templates/blog/modal_comment.html`

```jinja
<div class="modal fade" id="postModal{{ post.id }}" tabindex="-1" aria-labelledby="postModalLabel{{ post.id }}" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="postModalLabel{{ post.id }}">نظرات برای پست: {{ post.title }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body">
                <ul>
                    {% for comment in post.comments.all %}
                        <p>name: {{ comment.name }}</p>
                        <li>Content: {{ comment.letter | linebreaks }}</li>
                        <hr>
                    {% empty %}
                        <li>No comments yet.</li>
                    {% endfor %}
                </ul>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
            </div>
        </div>
    </div>
</div>
```

**برای نمایش بهتر کامنت ها در پنجره modal، میتوانید از استایل های زیر هم استفاده کنید.**

`css`

```css
    .modal-body {
        min-height: 150px;
        max-height: 350px;
        overflow-y: auto;
    }
    
    .modal-body ul {
        position: relative;
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        padding: var(--bs-modal-padding);
    }
```

#### **T3- در صفحه پروفایل برای نمایش پست ها صفحه بندی پیاده سازی کنید:**

برای همه پست های کاربر، صفحه بندی را پیاده سازی میکینم:

`app directory/views.py`

```python
def profile(request):
    user = request.user
    pub_posts = Post.published.filter(author=user)
    all_posts = Post.objects.filter(author=user)

    # Pagination <=> صفحه بندی
    paginator = Paginator(all_posts, 10)
    page_number = request.GET.get('page', 1)

    try:
        all_posts = paginator.page(page_number)
    except EmptyPage:
        all_posts = paginator.page(paginator.num_pages)
    except PageNotAnInteger:
        all_posts = paginator.page(1)

    context = {
        "pub_posts": pub_posts,
        "all_posts": all_posts,
    }
    return render(request, 'blog/profile.html', context=context)
```

**نمایش صفحه بندی در تمپلیت:**

`templates/blog/profile.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Profile {% endblock %}

{% block content %}
    <h1>Profile</h1>

    <table>
        <caption>All Post</caption>
        <tr>
            <th>row</th>
            <th>title</th>
            <th>edit</th>
            <th>delete</th>
            <th>status</th>
        </tr>
        {% for post in all_posts %}
            <tr>
                <!-- row -->
                <td>{{ forloop.counter }}</td>
                <!-- title -->
                <td><a href="{{ get_absolute_url }}">{{ post.title }}</a></td>
                <!-- edit -->
                <td><a href="#">edit</a></td>
                <!-- delete -->
                <td><a href="#">delete</a></td>
                <!-- status -->
                <td>{{ post.status }}</td>
            </tr>
        {% endfor %}
    </table>

<!-- ---------------------------------------------------------------------- -->
    <!-- صفحه بندی همه پست ها -->
    {% include 'partials/pagination.html' with page=all_posts %}
<!-- ---------------------------------------------------------------------- -->

    <table>
        <caption>Published Post</caption>
        <tr>
            <th>row</th>
            <th>title</th>
            <th>description</th>
        </tr>

        {% for post in pub_posts %}
            <tr>
                <!-- row -->
                <td>{{ forloop.counter }}</td>
                <!-- title -->
                <td><a href="{{ get_absolute_url }}">{{ post.title }}</a></td>
                <!-- description -->
                <td>{{ post.description | truncatewords:4 }}</td>
            </tr>
        {% endfor %}
    </table>
{% endblock %}
```

#### **T4- برای سیستم احراز هویت class-based-view ها را شخصی سازی کنید:**

برای شخصی سازی، form, template را ایجاد کرده و در view به کلاس خود معرفی میکنیم.

**در اینجا PasswordChangeView را شخصی سازی میکنیم:**

#### ایجاد فرم تغییر پسورد:

`app directory/forms.py`

```python
class CustomPasswordChangeForm(forms.Form):
    old_password = forms.CharField(widget=forms.PasswordInput)
    new_password = forms.CharField(widget=forms.PasswordInput)
```

> برای اینکه اعتبارسنجی‌های لازم به صورت خودکار انجام شود بهتر است از PasswordChangeForm بجای forms.Form ارث بری کنیم. | یا اینکه اعتبارسنجی های لازم را هم اضافه کنیم.

#### ایجاد تمپلیت تغییر پسورد:

`registration/password_change_form.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} Change Password {% endblock %}

{% block content %}
    <h1>Change Password</h1>
    <p>Enter previous password and new password:</p>

    <!-- way 1 -->
    <form method="post">
        {% csrf_token %}

        {{ form.as_p }}

        <input type="submit" value="Change Password">
    </form>

    <!-- way 2 -->
    <form method="post">
        {% csrf_token %}

        <input type="text" name="old_password">
        <input type="text" name="new_password">

        <input type="submit" value="Change Password">
    </form>
{% endblock %}
```

میتوانیم از فرم آماده استفاده کنیم و یا  با تگ input به صورت دستی فرم را ایجاد کنیم. | هر دو روش در کد بالا نوشته شده اند از یک مورد استفاده کنید.

#### شخصی سازی view برای password change:

`app directory/views.py`

```python
from django.contrib.auth.views import PasswordChangeView
from django.urls import reverse_lazy
from .forms import CustomPasswordChangeForm

class MyPasswordChange(PasswordChangeView):
    form_class = CustomPasswordChangeForm
    success_url = reverse_lazy('password_change_done')
    template_name = 'registration/password_change_form.html'
```

**در اینجا PasswordChangeDoneView را شخصی سازی میکنیم:**

#### ایجاد تمپلیت تغییر پسورد:

`registration/password_change_done.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} Change Password {% endblock %}

{% block content %}
    <h1>Password was changed successfully!</h1>
{% endblock %}
```

#### شخصی سازی view برای password change done:

`app directory/views.py`

```python
from django.contrib.auth.views import PasswordChangeDoneView

class MyPasswordChangeDone(PasswordChangeDoneView):
    template_name = 'registration/password_change_done.html'
```

**و حالا در urls.py از این view ها استفاده میکینم.**

`app directory/urls.py`

```python
urlpatterns = [
    path('password-change/', views.MyPasswordChange.as_view(), name='password_change'),
    path('password-change/done/', views.MyPasswordChangeDone.as_view(), name='password_change_done'),
]
```

برای بازنشانی پسورد 4 view و 5 تمپلیت خواهیم داشت؛ برای دریافت ایمیل و رمز جدید نیاز به فرم داریم(پس به 2 فرم نیاز داریم)

در ادامه فقط view ها را ایجاد میکنیم مابقی در طی دوره گفته شده است(مثل ایجاد فرم که در بالا گفته شده و تمپلیت های آنها که در طی دوره ایجاد کردیم)

#### شخصی سازی view برای PasswordResetView:

`app directory/views.py`

```python
from django.contrib.auth.views import PasswordResetView
from .forms import CustomPasswordResetForm

class CustomPasswordResetView(PasswordResetView):
    form_class = CustomPasswordResetForm
    template_name = 'registration/password_reset_form.html'  # تمپلیتی که فرم دریافت ایمیل را آنجا نوشته ایم.
    email_template_name = 'registration/password_reset_email.html'   # متن ایمیل که به کاربر ارسال میشود در این تمپلیت قرار میگیرد(فقط متن ارسالی)
    success_url = reverse_lazy('password_reset_done')  # URL مقصد پس از ارسال ایمیل بازنشانی رمز عبور را وارد کنید
```

> برای PasswordResetDoneView و PasswordResetCompleteView فرم نداریم و در تمپلیت آنها یک پیام با محتوای "عملیات با موفقیت انجام شد" نمایش میدهیم برای همین شخصی سازی view آنها چیزی ندارد، ولی با این حال شبیه PasswordChangeDoneView انجام میشود.

#### شخصی سازی view برای PasswordResetConfirmView:

`app directory/views.py`

```python
from django.contrib.auth.views import PasswordResetConfirmView
from .forms import CustomSetPasswordForm

class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    form_class = CustomSetPasswordForm
    template_name = 'registration/password_reset_confirm.html'  # در این تمپلیت کاربر تایید شده و رمز جدید خود را وارد میکند
    success_url = reverse_lazy('password_reset_complete')  # URL مقصد پس از بازنشانی رمز عبور را وارد کنید
```

#### **T5- در صفحه ایندکس به صورت رندوم یکی از پست ها را نمایش دهید:**

از دو روش استاده میکنیم،1- یکی با استفاده از ماژول رندوم و 2- دیگری با استفاده از ORM جنگو (ساختار SQL)

با استفاده از ماژول random یک پست را انتخاب کرده و در تمپلیت نمایش میدهیم.

`app directory/views.py`

```python
# first way:
from random import choice

def index(request):
    random_post = choice(Post.published.all()) if all_posts else None  # انتخاب یک پست به صورت تصادفی
    return render(request, 'index.html', {'random_post': random_post})

# second way:
def index(request):
    random_post = Post.published.order_by('?').first()
    return render(request, 'index.html', {'random_post': random_post})
```

> <span class="rtl-text">علامت ? در متد <span class="en-text">order_by()</span>  باعث می‌شود که دیتابیس، ردیف‌ها را به صورت تصادفی مرتب کند. این به شما امکان می‌دهد تا به سادگی یک ردیف تصادفی از دیتابیس دریافت کنید.</span>

### نکاتی در خصوص استایل دهی

> برای فرم هایی که به صورت دستی و با تگ اینپوت ایجاد میکنیم، برای استایل دادن؛ برای فیلد ها اتریبیوت کلاس مشخص میکنیم و بهشون استایل میدهیم.
>
> برای فرم هایی هم که به صورت اتوماتیک از کلاس های forms.py ایجاد میکردیم با استفاده از widget برایشان اتریبیوت کلاس مشخص کرده و استایل دهی میکردیم.
>
**ولی برای فیلدهایی که در فرم احراز هویت جنگو هستند چطور استایل دهی کنیم؟! (فرم هایی که از class-based-view سیستم احراز هویت جنگو، ایجاد شده اند)**

1- در forms.py برای آنها فرم ایجاد کرده و از AuthenticationForm ارث بری میکنیم.

2- فیلدهای فرم را ایجاد کرده و با widget برای هر فیلد اتریبیوت مشخص میکنیم؛ و در نهایت استایل دهی میکنیم.

- کلاس AuthenticationForm باید ایمپورت شود:

`app directory/forms.py`

```python
from django.contrib.auth.forms import AuthenticationForm


class LoginForm(AuthenticationForm):
    username = forms.CharField(max_length=250, required=True, widget=forms.TextInput(attrs={'class': 'username'}))
    password = forms.CharField(max_length=250, required=True, widget=forms.PasswordInput(attrs={'class': 'password'}))
```

حالا لازم است در urls.py برای متدهای **<span class="en-text">as_view()</span>**، هر کدام از ویو های احراز هویت، که فرمشان را تغییر داده ایم از آرگومان authentication_form استفاده کرده و اسم کلاس فرم مربوطه را برایش مشخص کنیم.

فرم ها باید در urls.py ایمپورت شوند.

`app directory/urls.py`

```python
from .forms import *


urlpatterns = [
    path('login/', auth_views.LoginView.as_view(authentication_form=LoginForm), name='login'),
    # ...
]
```
