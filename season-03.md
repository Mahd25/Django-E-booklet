## فصل سوم: فارسی سازی جنگو

در این فصل، با روش‌های فارسی سازی پنل مدیریت جنگو و تاریخ و زمان آشنا خواهیم شد.

### ۱. فارسی سازی پنل مدیریت

برای فارسی سازی پنل مدیریت، باید تنظیمات و تغییرات زیر را در فایل‌های مختلف پروژه انجام دهیم.

#### ۱.۱ تغییرات در فایل `admin.py`

ابتدا باید متغیرهای عنوان و سربرگ پنل مدیریت را به فارسی تغییر دهیم و سپس مدل‌ها را ثبت کنیم:

``blog/admin.py``

```python
from django.contrib import admin
from .models import *

# Register your models here.

admin.sites.AdminSite.site_header = "پنل مدیریت جنگو"
admin.sites.AdminSite.site_title = "پنل "
admin.sites.AdminSite.index_title = "پنل مدیریت"

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'publish', 'status']
    ordering = ['title', 'publish']
    list_filter = ['status', 'author', 'publish']
    search_fields = ['title', 'description']
    raw_id_fields = ['author']
    date_hierarchy = 'publish'
    prepopulated_fields = {'slug': ['title']}
    list_editable = ['status']
    list_display_links = ['author']
```

#### ۱.۲ تغییرات در فایل `apps.py`

برای فارسی سازی نام اپلیکیشن در پنل مدیریت:

``blog/apps.py``

```python
from django.apps import AppConfig

class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blog'
    verbose_name = "وبلاگ"
```

#### ۱.۳ تغییرات در فایل `models.py`

برای فارسی سازی فیلدهای مدل‌ها و استفاده از تاریخ جلالی:

`blog/models.py`

```python
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django_jalali.db import models as jmodels

class PublishedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status=Post.Status.PUBLISHED)

class Post(models.Model):

    class Status(models.TextChoices):
        DRAFT = 'DF', 'Draft'
        PUBLISHED = 'PB', 'Published'
        REJECTED = 'RJ', 'Rejected'

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_posts", verbose_name="نویسنده")
    title = models.CharField(max_length=250, verbose_name="عنوان")
    description = models.TextField(verbose_name="توضیحات")
    slug = models.SlugField(max_length=250, verbose_name="اسلاگ")
    publish = jmodels.jDateTimeField(default=timezone.now, verbose_name="تاریخ انتشار")
    create = jmodels.jDateTimeField(auto_now_add=True)
    update = jmodels.jDateTimeField(auto_now=True)
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.DRAFT, verbose_name="وضعیت")

    objects = jmodels.jManager()
    published = PublishedManager()

    class Meta:
        ordering = ['-publish']
        indexes = [
            models.Index(fields=['-publish'])
        ]
        verbose_name = "پست"
        verbose_name_plural = "پست‌ها"

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('blog:post_detail', args=[self.id])
```

#### ۱.۴ تنظیمات زبان و منطقه زمانی در `settings.py`

`project directory name/settings.py`

```python
LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'

INSTALLED_APPS = [
    # ...
    'blog.apps.BlogConfig',
    'django_jalali',
    # ...
]
```

### ۲. فارسی سازی تاریخ و زمان

#### ۲.۱ نصب و پیکربندی `django-jalali`

برای استفاده از تاریخ جلالی:

``Terminal:``

```bash
pip install django-jalali
```

#### ۲.۲ تنظیمات تاریخ جلالی در فایل‌های مدل و ادمین

`blog/admin.py`

```python
from django.contrib import admin
from .models import *
from django_jalali.admin.filters import JDateFieldListFilter
import django_jalali.admin as jadmin

admin.sites.AdminSite.site_header = "پنل مدیریت جنگو"
admin.sites.AdminSite.site_title = "پنل"
admin.sites.AdminSite.index_title = "پنل مدیریت"

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'publish', 'status']
    ordering = ['title', 'publish']
    list_filter = ['status', ('publish', JDateFieldListFilter), 'author']
    search_fields = ['title', 'description']
    raw_id_fields = ['author']
    date_hierarchy = "publish"
    prepopulated_fields = {'slug': ['title']}
    list_editable = ['status']
    list_display_links = ['title', 'author']
```

`blog/models.py`

```python
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django_jalali.db import models as jmodels

class PublishedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status=Post.Status.PUBLISHED)

class Post(models.Model):

    class Status(models.TextChoices):
        DRAFT = 'DF', 'Draft'
        PUBLISHED = 'PB', 'Published'
        REJECTED = 'RJ', 'Rejected'

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_posts", verbose_name="نویسنده")
    title = models.CharField(max_length=250, verbose_name="عنوان")
    description = models.TextField(verbose_name="توضیحات")
    slug = models.SlugField(max_length=250, verbose_name="اسلاگ")
    publish = jmodels.jDateTimeField(default=timezone.now, verbose_name="تاریخ انتشار")
    create = jmodels.jDateTimeField(auto_now_add=True)
    update = jmodels.jDateTimeField(auto_now=True)
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.DRAFT, verbose_name="وضعیت")

    objects = jmodels.jManager()
    published = PublishedManager()

    class Meta:
        ordering = ['-publish']
        indexes = [
            models.Index(fields=['-publish'])
        ]
        verbose_name = "پست"
        verbose_name_plural = "پست‌ها"

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('blog:post_detail', args=[self.id])
```

#### ۲.۳ تغییرات در قالب‌ها برای استفاده از تاریخ جلالی

`blog/templates/blog/detail.html`

```jinja
{% extends 'parent/base.html' %}
{% load jformat %}
{% block title %} جزئیات پست {% endblock %}
{% block content %}
    <h1>جزئیات پست</h1>
    <h3>{{ post.title }} توسط {{ post.author }}</h3>
    <p>{{ post.description |linebreaks }}</p>
    <hr>
    <p>{{ post.publish |jformat|"%Y/%m/%d-%H:%M" }}</p>
{% endblock %}
```

مقادیر فرمت دهی جلالی براساس ماژول datetime پایتون می باشند(نه فیلترهای جنگو!!(date و time)).

برای کامنت گذاری در تمپلیت های جنگو باید از تگ {# text #} استفاده کرد.

### نتیجه‌گیری

با اعمال تغییرات ذکر شده، پنل ادمین پروژه جنگو به زبان فارسی قابل استفاده خواهد بود. همچنین تاریخ و زمان با تاریخ جلالی به شمسی تبدیل خواهد شد(به زبان فارسی)

---

## استفاده و فرمت دهی زمان در تمپلیت ها

برای استفاده از ماژول datetime در پروژه کافیست این ماژول را در فایل "views.py" وارد کنیم و یک object در context برای آن ایجاد کنیم.


برای مثال)

``app directory/views.py:``

```python
...
import datetime
def post_detail(request, id):
    post = get_object_or_404(Post, id=id, status=Post.Status.PUBLISHED)
    context = {
        "post": post,
        "new_date": datetime.datetime.now(),
    }
    return render(request, "blog/post_detail.html", context)
```

حال میتوان از آن در تمپلیت ها نیز استفاده کرد

``app directory/templates/blog/post_detail.html``

```
    ...
    <p>{{ new_date }}</p>
    ...
```

میتوان از فیلتر date و مقادیر آن، برای فرمت دهی تاریخ استفاده کرد.

```jinja
<p>{{ new_date |date }}</p>
<p>{{ new_date |date:"DATE_FORMAT" }}</p>
<p>{{ new_date |date:"DATETIME_FORMAT" }}</p>
<p>{{ new_date |date:"SHORT_DATE_FORMAT" }}</p>
<p>{{ new_date |date:"SHORT_DATETIME_FORMAT" }}</p>
```
فرمت های تعریف شده برای date

```jinja
<p>{{ new_date |date:"سال:Y ماه:m" }}</p>
```


میتوان برای date مقادیر دلخواهی را قرار داد.

از فیلتر time و مقادیر آن هم میتوان برای فرمت دهی ساعت استفاده کرد.

برای مطالعه بیشتر می توانید <a href="https://docs.djangoproject.com/en/5.1/ref/templates/builtins/#date">داکیومنت</a> این بخش را بخوانید.
