## فصل ۳: فارسی‌سازی اپلیکیشن جنگو

در این فصل، با روش‌های فارسی‌سازی پنل مدیریت جنگو و تاریخ و زمان آشنا خواهیم شد.

### ۱. فارسی‌سازی پنل مدیریت

برای فارسی‌سازی پنل مدیریت، باید تنظیمات و تغییرات زیر را در فایل‌های مختلف پروژه انجام دهیم.

#### ۱.۱ تغییرات در فایل `admin.py`

ابتدا باید متغیرهای عنوان و سربرگ پنل مدیریت را به فارسی تغییر دهیم و سپس مدل‌ها را ثبت کنیم:

```python
# blog/admin.py

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

برای فارسی‌سازی نام اپلیکیشن در پنل مدیریت:

```python
# blog/apps.py

from django.apps import AppConfig

class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blog'
    verbose_name = "وبلاگ"
```

#### ۱.۳ تغییرات در فایل `models.py`

برای فارسی‌سازی فیلدهای مدل‌ها و استفاده از تاریخ جلالی:

```python
# blog/models.py

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

```python
# SabzWeb/settings.py

LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'

INSTALLED_APPS = [
    ...
    'blog.apps.BlogConfig',
    'django_jalali',
    ...
]
```

### ۲. فارسی‌سازی تاریخ و زمان

#### ۲.۱ نصب و پیکربندی `django-jalali`

برای استفاده از تاریخ جلالی:

```bash
$ pip install django-jalali
```

#### ۲.۲ تنظیمات تاریخ جلالی در فایل‌های مدل و ادمین

```python
# blog/admin.py

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

```python
# blog/models.py

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

```html
<!-- blog/templates/blog/detail.html -->

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
