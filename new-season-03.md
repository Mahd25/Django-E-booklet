# فصل ۳: فارسی‌سازی اپلیکیشن جنگو

در این فصل، با روش‌های فارسی‌سازی پنل مدیریت جنگو و تاریخ و زمان آشنا خواهیم شد.

## ۱. فارسی‌سازی پنل مدیریت

### فهرست مطالب

- [۱.۱ تغییرات در فایل `admin.py`](#۱.۱-تغییرات-در-فایل-`admin.py`)
- [۱.۲ تغییرات در فایل `apps.py`](#۱.۲-تغییرات-در-فایل-`apps.py`)
- [۱.۳ تغییرات در فایل `models.py`](#۱.۳-تغییرات-در-فایل-`models.py`)
- [۱.۴ تنظیمات زبان و منطقه زمانی در `settings.py`](#۱.۴-تنظیمات-زبان-و-منطقه-زمانی-در-`settings.py`)
- [۲.۱ نصب و پیکربندی `django-jalali`](#۲.۱-نصب-و-پیکربندی-`django-jalali`)
- [۲.۲ تنظیمات تاریخ جلالی در فایل‌های مدل و ادمین](#۲.۲-تنظیمات-تاریخ-جلالی-در-فایل‌های-مدل-و-ادمین)
- [۲.۳ تغییرات در قالب‌ها برای استفاده از تاریخ جلالی](#۲.۳-تغییرات-در-قالب‌ها-برای-استفاده-از-تاریخ-جلالی)
- [۳.۱ تغییرات در ویوها](#۳.۱-تغییرات-در-ویوها)
- [۳.۲ تغییرات در قالب‌ها](#۳.۲-تغییرات-در-قالب‌ها)
- [۴.۱ تنظیمات لاگ‌ها در `settings.py`](#۴.۱-تنظیمات-لاگ‌ها-در-`settings.py`)
- [۴.۲ استفاده از لاگ‌ها در ویوها](#۴.۲-استفاده-از-لاگ‌ها-در-ویوها)

برای فارسی‌سازی پنل مدیریت، باید تنظیمات و تغییرات زیر را در فایل‌های مختلف پروژه انجام دهیم.

### ۱.۱ تغییرات در فایل `admin.py` <a id="۱.۱-تغییرات-در-فایل-`admin.py`"></a>

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

### ۱.۲ تغییرات در فایل `apps.py` <a id="۱.۲-تغییرات-در-فایل-`apps.py`"></a>

برای فارسی‌سازی نام اپلیکیشن در پنل مدیریت:

``blog/apps.py``

```python
from django.apps import AppConfig

class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blog'
    verbose_name = "وبلاگ"
```

### ۱.۳ تغییرات در فایل `models.py` <a id="۱.۳-تغییرات-در-فایل-`models.py`"></a>

برای فارسی‌سازی فیلدهای مدل‌ها و استفاده از تاریخ جلالی:

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

### ۱.۴ تنظیمات زبان و منطقه زمانی در `settings.py` <a id="۱.۴-تنظیمات-زبان-و-منطقه-زمانی-در-`settings.py`"></a>

`project directory name/settings.py`

```python
LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'

INSTALLED_APPS = [
    ...
    'blog.apps.BlogConfig',
    'django_jalali',
    ...
]
```

## ۲. فارسی‌سازی تاریخ و زمان

### ۲.۱ نصب و پیکربندی `django-jalali` <a id="۲.۱-نصب-و-پیکربندی-`django-jalali`"></a>

برای استفاده از تاریخ جلالی:

``Terminal:``

```bash
pip install django-jalali
```

### ۲.۲ تنظیمات تاریخ جلالی در فایل‌های مدل و ادمین <a id="۲.۲-تنظیمات-تاریخ-جلالی-در-فایل‌های-مدل-و-ادمین"></a>

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

### ۲.۳ تغییرات در قالب‌ها برای استفاده از تاریخ جلالی <a id="۲.۳-تغییرات-در-قالب‌ها-برای-استفاده-از-تاریخ-جلالی"></a>

`blog/templates/blog/detail.html`

```html
{% extends 'parent/base.html' %}
{% load jformat %}
{% block title %} جزئیات پست {% endblock %}
{% block content %}
    <h1>جزئیات پست</h1>
    <h3>{{ post.title }} توسط {{ post.author }}</h3>
    <p>{{ post.description | linebreaks }}</p>
    <hr>
    <p>{{ post.publish | jformat }}</p>
{% endblock %}
```

## ۳. صفحه‌بندی (Pagination)

برای افزودن قابلیت صفحه‌بندی به لیست پست‌ها، ابتدا تغییرات زیر را در ویوها و قالب‌ها اعمال می‌کنیم.

### ۳.۱ تغییرات در ویوها <a id="۳.۱-تغییرات-در-ویوها"></a>

`blog/views.py`

```python
from django.shortcuts import render, get_object_or_404
from .models import Post
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.views.generic import ListView, DetailView

def index(request):
    return HttpResponse("index")

class PostListView(ListView):
    queryset = Post.published.all()
    context_object_name = "posts"
    paginate_by = 3
    template_name = "blog/list.html"

class PostDetailView(DetailView):
    model = Post
    template_name = "blog/detail.html"
```

### ۳.۲ تغییرات در قالب‌ها <a id="۳.۲-تغییرات-در-قالب‌ها"></a>

`blog/templates/partials/pagination.html`

```html
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
        <a href="?page={{ page.next_page_number }}">بعدی »

</a>
    {% endif %}
</div>
```

`blog/templates/blog/list.html`

```html
{% extends 'parent/base.html' %}
{% block title %}لیست پست‌ها{% endblock %}
{% block content %}
    <h1>لیست پست‌ها</h1>
    {% for post in posts %}
        <h3>
            <a href="{{ post.get_absolute_url }}">
                {{ post.title }}
            </a>
            توسط {{ post.author }}
        </h3>
        <p>{{ post.description }}</p>
    {% endfor %}

    {% include "partials/pagination.html" with page=posts %}
{% endblock %}
```

## ۴. استفاده از لاگ‌ها در جنگو

برای مدیریت بهتر خطاها و اشکالات پروژه، استفاده از لاگ‌ها بسیار مفید است. لاگ‌ها به شما کمک می‌کنند تا مشکلات را شناسایی و رفع کنید.

### ۴.۱ تنظیمات لاگ‌ها در `settings.py` <a id="۴.۱-تنظیمات-لاگ‌ها-در-`settings.py`"></a>

`project directory name/settings.py`

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'debug.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

### ۴.۲ استفاده از لاگ‌ها در ویوها <a id="۴.۲-استفاده-از-لاگ‌ها-در-ویوها"></a>

`blog/views.py`

```python
from django.shortcuts import render, get_object_or_404
from .models import Post
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.views.generic import ListView, DetailView
import logging

logger = logging.getLogger(__name__)

def index(request):
    return HttpResponse("index")

class PostListView(ListView):
    queryset = Post.published.all()
    context_object_name = "posts"
    paginate_by = 3
    template_name = "blog/list.html"

    def get_queryset(self):
        logger.debug("Fetching posts for PostListView")
        return super().get_queryset()

class PostDetailView(DetailView):
    model = Post
    template_name = "blog/detail.html"

    def get_object(self, queryset=None):
        logger.debug(f"Fetching post with ID {self.kwargs['pk']}")
        return super().get_object(queryset)
```

## نتیجه‌گیری

با اعمال تغییرات ذکر شده، پروژه جنگو به زبان فارسی قابل استفاده و مدیریت خواهد بود. همچنین قابلیت صفحه‌بندی و استفاده از لاگ‌ها به شما کمک می‌کند تا تجربه بهتری از مدیریت و رفع مشکلات پروژه داشته باشید.
