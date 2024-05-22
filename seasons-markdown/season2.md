### فصل ۲: نحوه ایجاد محیط مجازی و ساخت برنامه وب با جنگو

در این فصل، به تفصیل نحوه نصب، ایجاد و مدیریت محیط‌های مجازی با استفاده از `virtualenv` و همچنین ساخت و مدیریت یک پروژه وب با استفاده از فریمورک جنگو توضیح داده می‌شود. این فصل شامل مراحل زیر است:

#### 1. نصب `virtualenv`
برای نصب ابزار `virtualenv` که برای ایجاد محیط‌های مجازی استفاده می‌شود، از دستور زیر در ترمینال استفاده کنید:

```bash
pip install virtualenv
```

#### 2. ایجاد محیط مجازی
برای ایجاد محیط مجازی در پروژه، از یکی از دستورات زیر در ترمینال استفاده کنید:

```bash
virtualenv path\venv-name
```

یا اگر می‌خواهید نسخه خاصی از پایتون را استفاده کنید:

```bash
virtualenv --python=python3.11 path\venv-name
```

#### 3. فعال‌سازی محیط مجازی
برای فعال‌سازی محیط مجازی بسته به نوع پوسته‌ای که استفاده می‌کنید، دستورات متفاوتی وجود دارد:

**CMD:**

```cmd
path\venv-name\Scripts\activate.bat
```

یا

```cmd
path\venv-name\Scripts\activate
```

**PowerShell:**

ابتدا سیاست‌های اجرایی را تغییر دهید:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

سپس محیط مجازی را فعال کنید:

```powershell
path\venv-name\Scripts\Activate.ps1
```

#### 4. غیر فعال‌سازی محیط مجازی
برای غیر فعال‌سازی محیط مجازی، از دستورات زیر استفاده کنید:

```cmd
path\venv-name\Scripts\deactivate.bat
```

یا

```cmd
path\venv-name\Scripts\deactivate
```

#### 5. نصب جنگو
برای نصب جنگو، از دستور زیر در ترمینال استفاده کنید:

```bash
pip install django
```

#### 6. ایجاد پروژه جنگو
برای ایجاد یک پروژه جدید با جنگو، از دستورات زیر استفاده کنید:

```bash
django-admin startproject project_name
cd project_name
python manage.py migrate
```

#### 7. ایجاد برنامه جنگو
برای ایجاد یک برنامه جدید در پروژه جنگو، از دستور زیر استفاده کنید:

```bash
python manage.py startapp app_name
```

#### 8. معرفی برنامه‌ها به پروژه
برای معرفی برنامه‌های ایجاد شده به پروژه، فایل `settings.py` در پوشه پروژه را باز کنید و نام برنامه‌ها را به لیست `INSTALLED_APPS` اضافه کنید. برای مثال:

```python
INSTALLED_APPS = [
    'app_name.apps.BlogConfig',
]
```

#### 9. ایجاد مدل‌ها در جنگو
برای ایجاد مدل‌ها، فایل `models.py` در پوشه برنامه را باز کنید و مدل‌های خود را تعریف کنید. برای مثال، مدل زیر برای ایجاد پست‌های وبلاگ استفاده می‌شود:

```python
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DF', 'Draft'
        PUBLISHED = 'PB', 'Published'
        REJECTED = 'RJ', 'Rejected'

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_posts')
    title = models.CharField(max_length=250)
    description = models.TextField()
    slug = models.SlugField(max_length=250)
    publish = models.DateTimeField(default=timezone.now)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.DRAFT)

    class Meta:
        ordering = ['-publish']
        indexes = [
            models.Index(fields=['-publish']),
        ]

    def __str__(self):
        return self.title
```

#### 10. اعمال تغییرات در پایگاه داده
برای اعمال تغییرات در پایگاه داده و ایجاد جداول مورد نیاز، از دستورات زیر استفاده کنید:

```bash
python manage.py makemigrations app_name
python manage.py migrate app_name
```

#### 11. ایجاد ادمین پنل
برای ایجاد یک ادمین پنل و اضافه کردن مدل‌ها به آن، ابتدا یک کاربر سوپر یوزر ایجاد کنید:

```bash
python manage.py createsuperuser
```

سپس مدل‌های خود را به ادمین پنل اضافه کنید. فایل `admin.py` در پوشه برنامه را باز کرده و مدل‌ها را ثبت کنید:

```python
from django.contrib import admin
from .models import Post

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

#### 12. کار با ORM و QuerySet‌ها
برای کار با ORM جنگو و اجرای عملیات CRUD (ایجاد، خواندن، به‌روزرسانی و حذف)، از محیط تعاملی جنگو استفاده کنید:

```bash
python manage.py shell
```

در محیط تعاملی، می‌توانید عملیات مختلفی را انجام دهید. برای مثال:

```python
from django.contrib.auth.models import User
from blog.models import Post

# ایجاد یک پست جدید
user = User.objects.get(username='username')
post = Post.objects.create(author=user, title='عنوان پست', description='توضیحات پست', slug='slug-post')

# به‌روزرسانی یک پست
post.title = 'عنوان جدید'
post.save()

# حذف یک پست
post.delete()
```

#### 13. ایجاد مدیر سفارشی
برای ایجاد مدیر سفارشی که تنها پست‌های منتشر شده را نمایش دهد، ابتدا یک مدیر سفارشی ایجاد کنید:

```python
class PublishedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status=Post.Status.PUBLISHED)
```

سپس این مدیر را به مدل اضافه کنید:

```python
class Post(models.Model):
    objects = models.Manager()
    published = PublishedManager()
```

#### 14. ایجاد URLها و ویوها
برای ایجاد URLها و ویوها در برنامه، فایل `urls.py` را در پوشه برنامه ایجاد کرده و URLها را تعریف کنید:

```python
from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    path('', views.index, name='index'),
    path('posts/', views.post_list, name='post_list'),
    path('posts/<int:id>/', views.post_detail, name='post_detail'),
]
```

سپس ویوهای مربوطه را در فایل `views.py` تعریف کنید:

```python
from django.shortcuts import render, get_object_or_404
from .models import Post

def index(request):
    return render(request, 'blog/index.html')

def post_list(request):
    posts = Post.published.all()
    return render(request, 'blog/post_list.html', {'posts': posts})

def post_detail(request, id):
    post = get_object_or_404(Post, id=id)
    return render(request, 'blog/post_detail.html', {'post': post})
```

#### 15. ایجاد قالب‌های HTML
برای ایجاد قالب‌های HTML، ابتدا یک پوشه به نام `templates` در پوشه برنامه ایجاد کرده و فایل‌های قالب مورد نیاز را در آن قرار دهید. به عنوان مثال، یک قالب پایه ایجاد کنید:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Blog | {% block title %}{% endblock %}</title>
    <link rel="stylesheet" href="{% static 'css/base.css' %}">
    {% block head %}{% endblock %}
</head>
<body>
    {% include 'partials/header.html' %}
    {% include 'partials/navigation.html' %}
    {% block content %}{% endblock %}
    {% include 'partials/footer.html' %}
</body>
</html>
```

سپس قالب‌های دیگری را که از این قالب پایه ارث‌بری می‌کنند، ایجاد کنید. برای مثال، قالب لیست پست‌ها:

```html
{% extends 'parent/base.html' %}

{% block title %}Post List{% endblock %}

{% block content %}
    <h1>Post List</h1>
    <ul>
        {% for post in posts %}
            <li>
                <a href="{% url 'blog:post_detail' post.id %}">{{ post.title }}</a>
                <p>{{ post.description }}</p>
            </li>
        {% endfor %}
    </ul>
{% endblock %}
```

با پیروی از مراحل بالا، شما می‌توانید یک برنامه وب کامل با استفاده از جنگو ایجاد کنید. این مراحل شامل نصب و مدیریت محیط مجازی، ایجاد پروژه و برنامه، تعریف مدل‌ها، اعمال تغییرات در پایگاه داده، ایجاد ادمین پنل، کار با ORM و QuerySet‌ها، ایجاد مدیر سفارشی، تعریف URLها و ویوها، و ایجاد قالب‌های HTML می‌باشد.