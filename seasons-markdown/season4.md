## فصل ۴: Forms

### blog > models.py

#### 1. Import های مورد نیاز:

```python
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User  # برای استفاده از مدل کاربر
from django_jalali.db import models as jmodels
from django.urls import reverse
```

#### 2. تعریف مدل‌ها:

##### 2.1. مدل Post:

این مدل برای ذخیره پست‌های بلاگ استفاده می‌شود.

```python
class Post(models.Model):
    # برای تعیین وضعیت پست
    class Status(models.TextChoices):
        DRAFT = 'DF', 'Draft'
        PUBLISHED = 'PB', 'Published'
        REJECTED = 'RJ', 'Rejected'

    # فیلدهای مدل
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_posts", verbose_name="نویسنده")
    title = models.CharField(max_length=250, verbose_name="عنوان")
    description = models.TextField(verbose_name="توضیحات")
    slug = models.SlugField(max_length=250, verbose_name="اسلاگ")
    publish = jmodels.jDateTimeField(default=timezone.now, verbose_name="تاریخ انتشار")
    create = jmodels.jDateTimeField(auto_now_add=True)
    update = jmodels.jDateTimeField(auto_now=True)
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.DRAFT, verbose_name="وضعیت")

    # تعریف مدیریت‌های مدل
    objects = jmodels.jManager()
    published = PublishedManager()

    class Meta:
        ordering = ['-publish']
        indexes = [models.Index(fields=['-publish'])]
        verbose_name = "پست"
        verbose_name_plural = "پست‌ها"

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('blog:post_detail', args=[self.id])
```

##### 2.2. مدل Ticket:

این مدل برای ذخیره تیکت‌های ارسال شده توسط کاربران استفاده می‌شود.

```python
class Ticket(models.Model):
    message = models.TextField(verbose_name="پیام")
    name = models.CharField(max_length=250, verbose_name="نام")
    email = models.EmailField(verbose_name="ایمیل")
    phone = models.CharField(max_length=11, verbose_name="شماره تماس")
    subject = models.CharField(max_length=250, verbose_name="موضوع")

    class Meta:
        verbose_name = "تیکت"
        verbose_name_plural = "تیکت‌ها"

    def __str__(self):
        return self.subject
```

##### 2.3. مدل Comment:

این مدل برای ذخیره کامنت‌های ارسال شده برای پست‌های بلاگ استفاده می‌شود.

```python
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments", verbose_name="پست")
    name = models.CharField(max_length=250, verbose_name="نام")
    body = models.TextField(verbose_name="متن کامنت")
    created = jmodels.jDateTimeField(auto_now_add=True)
    updated = jmodels.jDateTimeField(auto_now=True)
    active = models.BooleanField(default=False)

    class Meta:
        ordering = ['created']
        indexes = [models.Index(fields=['created'])]
        verbose_name = "کامنت"
        verbose_name_plural = "کامنت‌ها"

    def __str__(self):
        return f"{self.name}: {self.post}"
```

### blog > forms.py

#### تعریف فرم‌ها:

##### 1. فرم Ticket:

```python
from django import forms

class TicketForm(forms.Form):
    SUBJECT_CHOICES = (
        ('پیشنهاد', 'پیشنهاد'),
        ('انتقاد', 'انتقاد'),
        ('گزارش', 'گزارش'),
    )
    message = forms.CharField(widget=forms.Textarea, required=True)
    name = forms.CharField(max_length=250, required=True)
    email = forms.EmailField()
    phone = forms.CharField(max_length=11, required=True)
    subject = forms.ChoiceField(choices=SUBJECT_CHOICES)

    # اعتبارسنجی شماره تماس
    def clean_phone(self):
        phone = self.cleaned_data['phone']
        if phone and not phone.isnumeric():
            raise forms.ValidationError("شماره تلفن شامل کاراکترهای غیر عددی است")
        return phone
```

### blog > views.py

#### 1. View های مربوط به پست:

##### 1.1. View لیست پست‌ها با استفاده از کلاس ListView:

```python
from django.views.generic import ListView, DeleteView

class PostListView(ListView):
    queryset = Post.published.all()
    context_object_name = "posts"
    paginate_by = 3
    template_name = "blog/list.html"
```

##### 1.2. View جزئیات پست با استفاده از کلاس DeleteView:

```python
class PostDetailView(DeleteView):
    model = Post
    template_name = "blog/detail.html"
```

#### 2. View مربوط به تیکت:

##### View برای ارسال تیکت:

```python
def ticket(request):
    if request.method == "POST":
        form = TicketForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            Ticket.objects.create(
                message=cd['message'],
                name=cd['name'],
                email=cd['email'],
                phone=cd['phone'],
                subject=cd['subject']
            )
            return redirect("blog:index")
    else:
        form = TicketForm()

    return render(request, "forms/ticket.html", {'form': form})
```

### blog > admin.py

#### 1. ثبت مدل‌ها در ادمین:

##### 1.1. ثبت مدل Post:

```python
from django.contrib import admin
from .models import *
from django_jalali.admin.filters import JDateFieldListFilter

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

##### 1.2. ثبت مدل Ticket:

```python
@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'phone']
```

##### 1.3. ثبت مدل Comment:

```python
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['post', 'name', 'created', 'active']
    list_filter = ['active', ('created', JDateFieldListFilter), ('updated', JDateFieldListFilter)]
    search_fields = ['name', 'body']
    list_editable = ['active']
```

### blog > urls.py

#### 1. تعریف مسیرهای URL:

```python
from django.urls import path
from . import views

app_name = "blog"

urlpatterns = [
    path('', views.index, name="index"),
    path('posts/', views.PostListView.as_view(), name="post_list"),
    path('posts/<pk>/', views.PostDetailView.as_view(), name="post_detail"),
    path('ticket/', views.ticket, name="ticket")
]
```

### blog > templates > forms > ticket.html

#### قالب HTML برای فرم تیکت:

```html
{% extends 'parent/base.html' %}
{% block title %} ticket form {% endblock %}
{% block content %}
    <h1>Ticket — Form</h1>
    <form method="post">
        {% csrf_token %}
        نام و نام خانوادگی:
        <input type="text" name="name" required
        {% if form.name.value %} value="{{ form.name.value }}" {% endif %}>
        <br>
        ایمیل:
        <input type="email" name="email" required
        {% if form.email.value %} value="{{ form.email.value }}" {% endif %}>
        <br>
        شماره همراه:
        <input type="text" name="phone" maxlength="11" required
        {% if form.phone.value %} value="{{ form.phone.value }}" {% endif %}>
        <br>
        توضیحات:
        <textarea name="message">
            {% if form.message.value %} {{ form.message.value }} {% endif %}
        </textarea>
        <br>
        <select name="subject">
            <option value="پیشنهاد" {% if form.subject.value == 'پیشنهاد' %} selected {% endif %}> پیشنهادات</option>
            <option value="انتقاد" {% if form.subject.value == 'انتقاد' %} selected {% endif %}> انتقادات</option>
            <option value="گزارش" {% if form.subject.value == 'گزارش' %} selected {% endif %}> گزارش </option>
        </select>
        <br>
        <input type="submit" value="ثبت تیکت">
    </form>

    {% if form.errors %}
        لطفا خطاهای زیر را اصلاح کنید!
        <br>
        {% for field in form %}
            {% if field.errors %}
                {% for error in field.errors %}
                    {{ field.label }} : {{ error }}
                {% endfor %}
            {% endif %}
        {% endfor %}
    {% endif %}
    {% if form.non_field_errors %}
        {{ form.non_field

_errors }}
    {% endif %}
{% endblock %}
```

### blog > templates > blog > list.html

#### قالب HTML برای نمایش لیست پست‌ها:

```html
{% extends 'parent/base.html' %}
{% block title %} پست‌ها {% endblock %}
{% block content %}
    <h1>Posts</h1>
    {% for post in posts %}
        <div>
            <a href="{{ post.get_absolute_url }}">{{ post.title }}</a>
        </div>
    {% endfor %}
    {% if is_paginated %}
        <div>
            <span>
                {% if page_obj.has_previous %}
                    <a href="?page={{ page_obj.previous_page_number }}">previous</a>
                {% endif %}
            </span>

            <span>Page {{ page_obj.number }} of {{ page_obj.paginator.num_pages }}</span>

            <span>
                {% if page_obj.has_next %}
                    <a href="?page={{ page_obj.next_page_number }}">next</a>
                {% endif %}
            </span>
        </div>
    {% endif %}
{% endblock %}
```

### blog > templates > blog > detail.html

#### قالب HTML برای نمایش جزئیات پست:

```html
{% extends 'parent/base.html' %}
{% block title %} {{ post.title }} {% endblock %}
{% block content %}
    <h1>{{ post.title }}</h1>
    <p>{{ post.description }}</p>
    <p>{{ post.publish }}</p>
{% endblock %}
```

### parent > templates > parent > base.html

#### قالب HTML پایه:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>وبلاگ</h1>
    <hr>
    <ul>
        <li>
            <a href="{% url 'blog:index' %}">خانه</a>
        </li>
        <li>
            <a href="{% url 'blog:post_list' %}">پست‌ها</a>
        </li>
        <li>
            <a href="{% url 'blog:ticket' %}">فرم تیکت</a>
        </li>
    </ul>
    <hr>
    {% block content %}
    {% endblock %}
</body>
</html>
```