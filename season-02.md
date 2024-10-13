## فصل دوم: اپلیکیشن بلاگ(بخش اول)

### ساخت اپ (app) برای پروژه

برای توسعه و مدیریت بهتر بخش های مختلف پروژه بکار میرود، مثلا بخش های مختلف سایت مثله مقالات ، فروشگاه و... هر کدام در یک اپ ساخته میشوند تا هم پروژه ساده تر باشه و هم مدیریت سریعتر و راحت تر.

#### ایجاد اپلیکیشن با دستور

`Terminal:`

```powershell
python manage.py startapp app_name
```

#### معرفی اپلیکیشن به پروژه جنگو

توی تنظیمات پروژه، بخش «INSTALLED_APPS» اپلیکیشن خود را معرفی می کنیم.

`project directory name/settings.py`

```python
INESTALLED_APPS=[
    # ...
    '<app_name>.apps.<App_name>Config',
]
```

مثال: اسم اپلیکیشن=blog

```python
INESTALLED_APPS=[
    # ...
    'blog.apps.BlogConfig',
] 
```

---

#### ایجاد مدل Post

جداول در دیتابیس : برای ایجاد جدول و (ستون ها=column) در دیتابیس از «model» در جنگو استفاده میکنیم.

برای ایجاد هر جدول در دیتابیس، توی اسکریپت «models.py» یک کلاس ایجاد میکنیم (این کلاس ها همان جداول ما در دیتابیس هستند)
  برای ایجاد هر ستون از جدول توی کلاس مربوطه یک متغیر (class attribute) ایجاد کرده و نوع فیلد آنرا مشخص میکنیم
  هر کدام از این کلاس ها باید از (models.Model) ارث بری کنند.

`app directory/models.py`

```python
class TableName(models.Model):
    # fields and ...
```

برای نوشتن فیلد های هر جدول به صورت زیر عمل میکنیم:

`app directory/models.py`

```python
    variable = models.type-of-field(arguments)
```

مثال

```python
    title = models.CharField(max_length=250)
```

برای متن های طولانی تر از «TextField» بجای «CharField» استفاده میکنیم.

هر صفحه ای از وبسایت دارای «url» خاص خودش می باشد که به آن slug می گویند.(قسمت اصلی آدرس بعد از نام دامنه است) برای ذخیره slug از فیلد «SlugField» استفاده میشود.

برای زمان و تاریخ از فیلد «DateTimeField» استفاده میکنیم.

مرتب سازی آبجکت ها در جدول:

 داخل بدنه کلاس (همان جدول) یک کلاس دیگه بنام «Meta» ایجاد میکنیم

`app directory/models.py`

```python
class TableName(models.Model):
    # ...
    class Meta:
        # ...
```

حالا داخل بدنه کلاس «Meta» از متغیرهای «ordering» و  «indexes» استفاده میکنیم.

توی لیست «ordering» مشخص میکنیم مرتب سازی بر اساس چه فیلد هایی باشد.
مثلا مرتب سازی براساس زمان انتشار پست (فیلدی که توی کلاس برایش مشخص کرده ایم)
در حالت عادی بر اساس قدیمی تر ها مرتب میکنه واسه همین از (-) قبل از اسم فیلد استفاده میکنیم این طوری براساس جدیدترین مرتب میکنه.
ordering = ['-publish']

indexing: راهی برای جستجوی سریعتر و بهینه تر، بین داده هست.
توی لیست «indexes» مشخص میکنیم جستجو براساس کدام فیلدها انجام شود
بدین ترتیب براساس آن فیلدها؛ دیتا ها را جستجو کرده و با «ordering» مرتبشون میکنه.
indexes = [models.Index(fields=['-publish'])]

---

الآن برای درک بیشتر میخوایم یک جدول با نام «Post» و یکسری فیلد ها مثل (عنوان، توضیحات،تاریخ انتشار و... )ایجاد کنیم تا توضیحات بالا را در مثال ببینید.

`app directory/models.py`

```python
from django.db import models
from django.utils import timezone


class Post(models.Model):

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

    # To sort the table
    class Meta:
        # Sort by
        ordering = ['-publish'] # (-) is used to reverse the sort. => sort by latest post
        # Indexing by
        indexes = [
            models.Index(fields=['-publish'])
            ]


    def __str__(self):
        return self.title
```

ایجاد فیلدهایی که از بین گزینه ها یک مورد را انتخاب میکنیم مثله انتخاب شهر تعیین جنسیت و...
راهکار های متفاوتی داره اینجا از کلاس استفاده میکنیم

مثل کلاس Meta که داخل کلاس اصلی تعریفش کردیم یک کلاس هم برای این حالت انتخابی ایجاد میکنیم.
این کلاس از (models.TextChoices) ارث بری میکنه.

حالا داخل بدنه این کلاس تعدادی متغیر(class attribute) برای گزینه های مدنظر ایجاد میکنیم این متغیر ها رو با حروف بزرگ می نویسیم.

حالا برای این متغیر ها دو مقدار مشخص میکنیم

`app directory/models.py`

```python
class TableName(models.Model):
    class Name(models.TextChoices):
        names = 'values', 'labels'
        # ...
    
    class Meta:
        # ...
```

name = اسم متغیر برای گزینه
value = اسمی که توی دیتابیس ذخیره میشه(اولین مقدار)
label = اسمی که به کاربر روی گزینه نمایش داده میشه(دومین مقدار)

تمامی این اسم ها به دلخواه هستند. (در اینجا مثال در مورد وضعیت پست نوشته شده میباشد).

`app directory/models.py`

```python
class Status(models.TextChoices):
    DRAFT = 'DF', 'Draft'
    PUBLISHED = 'PB', 'Published'
    REJECTED = 'RJ', 'Rejected'
```

حالا باید فیلد این حالت انتخابی(گزینه ای) را ایجاد کنیم تا توی دیتابیس بتوان آنرا نمایش داد.(این فیلد از این کلاس بالا استفاده میکنه.)

حالا داخل کلاس اصلی خود (در مثال کلاس Post) یک متغیر برای تعریف فیلد ایجاد میکنیم و نوع آنرا (models.CharField) مشخص میکنیم
حال برایش آرگومان «choices=class-name.choices» را مشخص میکنیم

آرگومان «default» مقدار پیشفرض این گزینه را مشخص میکنه.

آرگومان «max_length» برای مقدار اول متغیر ها در کلاس (در مثال ما کلاس «Status») میباشد چون آنها در دیتابیس ذخیره میشوند.

```python
status = models.CharField(max_length=2, choices=Status.choices, default=Status.DRAFT)
```

خب بریم همه این توضیحات را در کد ببینیم(کلاس و فیلد «status»)

`app directory/models.py`

```python
from django.db import models
from django.utils import timezone


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DF', 'Draft'
        PUBLISHED = 'PB', 'Published'
        REJECTED = 'RJ', 'Rejected'

    # field for the selected mode (using the top class)
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.DRAFT)

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

    # To sort the table
    class Meta:
        # Sort by
        ordering = ['-publish'] # (-) is used to reverse the sort. => sort by latest post
        # Indexing by
        indexes = [
            models.Index(fields=['-publish'])
            ]


    def __str__(self):
        return self.title
```

کلاس (TextChoices) که از آن ارث بری کردیم یکسری اتریبیوت دارد

اتریبیوت choices: میاد محتویات هر متغیر را داخل یک تاپل قرار داده و حالا همه ی آنها را به صورت لیست نمایش میده

اتریبیوت names: اسامی تمام متغیر ها را برمیگرداند

اتریبیوت values: اسامی که قراره توی دیتابیس ذخیره بشن رو نمایش میده

اتریبیوت labels: اسامی که به کاربر نمایش داده میشه را برمیگرداند

یکی از بهترین راه های برقراری ارتباط با کد هایی که مینویسیم استفاده از shell می باشد.


``Terminal:``

```powershell
python manage.py shell
>>>from blog.models import Post

>>>Post.Status.choices
[('DF', 'Draft'), ('PB', 'Published'), ('RJ', 'Rejected')]

>>>Post.Status.names
['DRAFT', 'PUBLISHED', 'REJECTED']

>>>Post.Status.values
['DF', 'PB', 'RJ']

>>>Post.Status.labels
['Draft', 'Published', 'Rejected']
```

---

#### استفاده از مدل User (مدل پیشفرض جنگو)

`app directory/models.py`

```python
from django.contrib.auth.models import User
```

---

#### روابط بین جداول

1. Many To One(ForeignKey)
2. One To One
3. Many To Many

---

در اینجا رابطه «Many To One(ForeignKey)» توضیح داده میشه و مابقی در فصل های بعد.

ارتباط بین یک کاربر با پست هایش از نوع «Many To One(ForeignKey)» میباشد
توضیح: یک کاربر میتونه چند پست داشته باشه ولی هر پست فقط یک کاربر(نویسنده) داره (یک کاربر، چند پست)

فیلد «Many To One(ForeignKey)» توی جدولی نوشته میشه که چندتایی باشه با توجه به مثال بالا توی جدول «Post» نوشته میشه نه جدول «User»

---

خب میخوایم فیلدی برای ارتباط کاربر(نویسنده) با پست ایجاد کنیم/ این فیلد از نوع «Many To One(ForeignKey)» خواهد بود.

برای نوشتن فیلد «Many To One(ForeignKey)» به صورت زیر عمل میکنیم:

`app directory/models.py`

```python
field_name = models.ForeignKey(Connected-model, on_delete=models.CASCADE, related_name='')
```

مثال: فیلد «author» توی مدل «Post»

```python
author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_posts')
```

اولین مورد از فیلد (foreignkey) ، مدلی است که به آن متصل میشویم

آرگومان (on_delete): نوع حذف شدن را مشخص میکند («CASCADE» میگه اگه کاربر حذف شد پست هایش هم حذف شوند)

آرگومان (related_name): مدل متصل شده از این طریق میتواند با این مدل فعلی ارتباط بگیرد.

مدل متصل شده (یعنی «User») از طریق «related_name» با این مدل «Post» ارتباط میگیرد.

خب حالا این فیلد را در کد مدل خود ببینیم:

`app directory/models.py`

```python
from django.db import models
from django.utils import timezone


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

    # To sort the table
    class Meta:
        # Sort by
        ordering = ['-publish'] # (-) is used to reverse the sort. => sort by latest post
        # Indexing by
        indexes = [
            models.Index(fields=['-publish'])
            ]


    def __str__(self):
        return self.title
```

---

### دستور «makemigrations» ، «migrate» و «sqlmigrate»

برای اینکه جداول توی دیتابیس ذخیره بشن از «makemigrations» و «migrate» استفاده میکنیم

دستور migrate : مسئول اعمال و عدم اعمال مهاجرت(migration) است.

دستور makemigrations : مسئول ایجاد مهاجرت(migration) های جدید بر اساس تغییراتی است که در مدل های خود ایجاد کرده اید.

دستور sqlmigrate، : دستورات SQL را برای یک مهاجرت(migration) نمایش می دهد.

با استفاده از دستور «makemigrations» چنانچه تغییری توی مدل اعمال شده باشد میاد و یک (migration) حاوی تغییرات جهت اعمال روی دیتابیس ایجاد میکند با این حال تغییری روی دیتابیس نمیدهد / هنگامی که از دستور «migrate» استفاده کنیم تغییرات روی دیتابیس اعمال میشن.

``Terminal:``

```powershell
python manage.py makemigrations app_name(الزامی نیست؛ مگر زمانی که چند اپ داشته باشیم)
python manage.py migrate app_name(الزامی نیست؛ مگر زمانی که چند اپ داشته باشیم)
```

``Terminal:``

```powershell
python manage.py sqlmigrate app_name 'migration code'
```

مثال

``Terminal:``

```powershell
python manage.py sqlmigrate blog 0001
```

---

### ایجاد پنل ادمین

جنگو برای پنل ادمین ساختار پیشفرض دارد/ برای ایجاد پنل ادمین از دستور زیر استفاده میکنیم.

``Terminal:``

```python
python manage.py createsuperuser
```

پس از زدن Enter از ما («username», «email», «password») درخواست میکنه

رمز نمایش داده نمیشه پس حواست باشه چی میزنی

``Terminal:``

```powershell
python manage.py createsuperuser

Username (leave blank to use 'system name'): your_username or blank
Email address: your_email or blank
Password: your_password
Password (again): your_password
```

با این «username» و «password» میتونیم وارد پنل ادمین بشیم.
پس از run کردن پروژه انتهای «url» عبارت (/admin/) را نوشته و Enter را میزنیم

میخواهیم جداولی که در «model» ایجاد کردیم رو در پنل ادمین نمایش بدهیم.

`app directory/admin.py`

```python
from django.contrib import admin
from .models import *

admin.site.register(model_name)
```

توی پنل ادمین برای هر مدل، چیزی که توی (__str__ method) مشخص کرده ایم را نمایش میدهد

---

### شخصی سازی پنل ادمین

برای شخصی سازی پنل ادمین جهت نمایش جداول (models) در پنل، آن طور که میخواهیم به صورت زیر عمل میکنیم

این کار را با استفاده از یک دکوراتور و یک کلاس انجام میدهیم ، داخل کلاس شخصی سازی را انجام میدهیم (این کلاس باید از (admin.ModelAdmin) ارث بری بکنه)

`app directory/admin.py`

```python
from django.contrib import admin
from .models import *


@admin.register(model_name)
class Model_NameAdmin(admin.ModelAdmin):
    # ...
```

#### شخصی سازی پنل => داخل کلاس «Model_Name Admin»

فیلد (list_display): با استفاده از آن مشخص میکنیم کدام فیلد های مدل را در پنل نمایش دهد (به همین ترتیبی که می نویسیم داخل پنل نمایش داده میشوند.)

```python
list_display = ['author', 'title', 'publish', 'status']
```

---

 فیلد (ordering): با استفاده از آن نحوه مرتب سازی داده های مدل خود را مشخص میکنیم

میتوان از یک فیلد و یا چند فیلد جهت مرتب سازی استفاده کرد / هر فیلدی که خواستیم

```python
ordering = ['-publish', '-author']
```

---

فیلد (list_filter): قابلیت فیلتر کردن داده های مدل را براساس فیلدهایی که مشخص می کنیم رو بهمون میده مثلا پست هایی که وضعیت رد شده دارند را نمایش بدهیم.

```python
list_filter = ['status', 'publish', 'author']
```

---

فیلد (search_fields): قابلیت سرچ (جستجو) برای داده های مدل را براساس فیلدهایی که برایش مشخص میکنیم برایمان فعال میکند.  

```python
search_fields = ['title', 'description']
```

---

فیلد (raw_id_fields): برای فیلد های رابطه ای مثل «foreignKey» مثله author کاربرد داره(توضیح را با مثال کاربر پیش میبریم ولی هر فیلدی که از نوع رابطه ای باشد قابل استفاده هست)

وقتی از «raw_id_fields» استفاده کنیم توی پنل ادمین بجای اینکه یک دراپ باکس جهت انتخاب کاربر وجود داشته باشد، یک گزینه سرچ ایجاد میشه که با کلیک روی آن یک صفحه جدید باز شده و حالا کاربر مدنظر را انتخاب میکنیم(این حالت زمانی که تعداد کاربران زیاد باشد نقش چشمگیری دارد)

```python
raw_id_fields = ['author']
```

---

فیلد (list_editable): قابلیت ویرایش فیلد های مدل در صفحه پنل ادمین را فراهم میکند

با استفاده از «list_editable» فیلد هایی که برایش مشخص میکنیم در همان صفحه که داده های دیگر هم وجود دارند میتوان آن فیلد ها را ویرایش کرد.

```python
list_editable = ['status']
```

---

فیلد (date_hierarchy): با این قابلیت، دقیقاً زیر کادر جستجو، برامون لیستی از زمانهای موجود (براساس آن فیلد زمانی که برایش مشخص میکنیم) قرار میگیره و میتونیم مطالب رو بر اساس بازه های زمانی مختلف مشاهده کنیم(مثلا پست های منتشر شده در ماه may از سال 2023 را نمایش دهیم).

```python
date_hierarchy = 'publish'
```

---

فیلد (prepopulated_fields): بااستفاده از آن میتوان مشخص کرد که یکی از فیلدهای مدل اتومات براساس فیلدی دیگر پر شود.(وقتی که میخواهیم یکی از فیلدهای مدل براساس فیلدی دیگر به صورت اتومات پر شود)

مثلا در کد زیر فیلد «slug» پست هایمان براساس متن «title» اتوماتیک پر شود

به این ترتیب وقتی ما در پنل ادمین درحال نوشتن فیلد «title» هستیم فیلد «slug» اتومات براساس «title» ما نوشته میشود.

```python
prepopulated_fields = {'slug': ['title']}
```

---

حالا بریم تمام این موارد را در کد فایل «admin.py» ببینیم:

`app directory/admin.py`

```python
from django.contrib import admin
from .models import *


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'title', 'publish', 'status']
    ordering = ['-publish', '-author']
    list_filter = ['status', 'publish', 'author']
    search_fields = ['title', 'description']
    raw_id_fields = ['author']
    date_hierarchy = 'publish'
    prepopulated_fields = {'slug': ['title']}
    list_editable = ['status']

    # برای تغییر لینک ورود به صفحه ی ویرایش اطلاعات بکار میرود
    # به صورت عادی اولین مورد یعنی (فیلد نویسنده) لینک هست ولی حالا (فیلد عنوان) را لینک داده ایم
    list_display_links = ['title']
```

---

### کار با کوئری ست ها(CRUD, ORM)

#### CRUD: Create - Read - Update - Delete

اینها چهار عملکرد اصلی برای کار با پایگاه داده هستند.

مثلا یک داده به جدول اضافه کنیم،
یک یا چند مورد از داده ها انتخاب کنیم(از روی دیتابیس بخوانیم)،
تغییراتی توی داده ایجاد کنیم،
ویا داده هایی را از دیتابیس حذف کنیم.

این عملکردها را با (ORM) انجام میدهیم.

---

#### ORM : Object Relational Mapping

توی «django» ما به کمک «ORM» میتوانیم با دیتابیس تعامل داشته باشیم («ORM» پلی است برای برقراری ارتباط بین دیتابیس و ساختار کد ما)

این سیستم با توجه به دستوراتی که ما توی پایتون اعمال میکنیم اتوماتیک دستورات را به ساختار «SQL» تبدیل میکند.

برای نمایش دستورات و خروجی آنها در یکجا از «shell» استفاده میکنیم.

`Terminal`

```python
python manage.py shell
```

حالا دو مدل Post و User خود را ایمپورت میکنیم

`Shell app_name='blog'`

```shell
>>> from django.contrib.auth.models import User
>>> from blog.models import Post
```

دستورات در ادامه همین خط کد ایمپورت کردن نوشته میشوند ولی برای توضیحات، هر بخش را برایتان جداگانه مینویسیم

---

متد <span class="en-text">all()</span> : خواندن تمامی داده های یک جدول از دیتابیس

خروجی آن یک (کوئری ست)، شامل تمامی داده های آن جدول میباشد.(ساختار: <QuerySet [<Model\_name: value1\>, <Model\_name: value2\>, ...]\>)

> **value** همان چیزی است که متد \_\_str\_\_ در مدل آن را return میکند.

**queryset:** مجموعه ای از داده های یک جدول در دیتابیس

دو «user» و یک «post» در پنل ادمین ساخته شده است.

```shell
>>> User.objects.all()
<QuerySet [<User: Mahdi>, <User: Ali>]>
>>> Post.objects.all()
<QuerySet [<Post: Python>]>
```

---

یک کلاس مدل (مثلا مدل Post) ، یک جدول از دیتابیس را نشان می دهد و یک نمونه (instance) از آن کلاس یک رکورد از آن جدول را نشان میدهد.

ایجاد کاربر و ذخیره آن در دیتابیس:

``shell:``

```shell
>>> user1 = User(username='Reza26', password='123456', first_name='Reza')
>>> user1.save()
>>> User.objects.all()
<QuerySet [<User: Mahdi>, <User: Ali>, <User: Reza26>]>
```

با متد <span class="en-text">save()</span> این تغییرات را توی دیتابیس ذخیره میکنیم.

---

``shell:``

```shell
>>> user1
<User: Reza26>
>>> user1.first_name
'Reza'
>>> user1.username
'Reza26'
```

با صدا زدن کاربر نام کاربری آنرا نمایش میدهد
با صدا زدن فیلد مدنظر (مثله «first_name» و یا «username») مقدار آنرا از دیتابیس خوانده و به ما نشان میدهد.

---

``shell:``

```shell
>>> user1.username = 'Reza_01'
>>> user1.save()
>>> user1.username
'Reza_01'
>>> User.objects.all()
<QuerySet [<User: Mahdi>, <User: Ali>, <User: Reza_01>]>
```

خب حالا در روش بالا مقدار فیلد «username» را تغییر داده (update کرده)  و در دیتابیس ذخیره کردیم

---

با استفاده از متد <span class="en-text">delete()</span> داده را از دیتابیس پاک میکنیم

``shell:``

```shell
>>> User.objects.all()
<QuerySet [<User: Mahdi>, <User: Ali>, <User: Reza_01>]>
>>> user1.delete()
(1, {'auth.User': 1})
>>> User.objects.all()
<QuerySet [<User: Mahdi>, <User: Ali>]>
```

---


با استفاده از متد <span class="en-text">create()</span> میتوان بدون استفاده از متد <span class="en-text">save()</span>، یک query به صورت مستقیم ایجاد و در دیتابیس ذخیره کرد

خب حالا بریم یک پست جدید ایجاد کنیم:

``shell:``

```shell
>>> Post.objects.all()
<QuerySet [<Post: Python>]>
>>> post1 = Post.objects.create(author=user2, title='Django', description='Django is a free and open source web-based software framework')
>>> post1
<Post: Django>
>>> Post.objects.all()
<QuerySet [<Post: Python>, <Post: Django>]>
```

چون فیلد (author) از نوع (ForeignKey) هست بهتره از (user) ایجاد کرده استفاده کنیم نه رشته / مابقی فیلد ها هم پر میکنیم.

از متد create میتوان بدون ذخیره در یک متغیر نیز، استفاده کرد.

برای «user» بهتره از متد خاص خودش یعنی <span class="en-text">create_user()</span> استفاده کنیم (در این روش دیگر نیازی به متد <span class="en-text">save()</span> نیست):

```python
# structure
class_name.manager.method()
# example
User.objects.create_user()
```

``shell:``

```shell
>>> User.objects.all()
<QuerySet [<User: Mahdi>, <User: Ali>]>
>>> user2 = User.objects.create_user(username='Mr_milad', password='M2546d', first_name='Milad', last_name='Javid')
>>> User.objects.all()
<QuerySet [<User: Mahdi>, <User: Ali>, <User: Mr_milad>]>
```

---

**متد <span class="en-text">get()</span>:** برای دریافت یک (object) از جدول (منطبق با شرایطی که در دستور برایش مشخص میکنیم) استفاده میشه.

اگه شرطی که برایش مشخص میکنیم چند داده را شامل شود ارور میدهد(پس باید شرطی بیان کنیم که یک داده از جدول را شامل شود)

``shell:``

```shell
>>> post = Post.objects.get(id=1)
>>> post
<Post: Python>
>>> user = User.objects.get(username='Mr_milad')
>>> user
<User: Mr_milad>
```

---

اگر هم آن چیزی که برایش مشخص میکنیم وجود نداشته باشه ارور میدهد

برای جلوگیری از ارور، میتوان از متد <span class="en-text">get_or_create()</span> استفاده کرد

با این متد اگه موردی، مطابق با شرایطی که مشخص میکنیم وجود نداشت آن آبجکت را ایجاد میکند.

یک تاپل برمیگرداند (object, created)

 اولین مورد: آبجکت یافته شده و یا ایجاد شده میباشد و دومین مورد: (boolean) هست / اگه آبجکت را ایجاد کرده باشه (True) و چنانچه آبجکت از قبل وجود داشته باشه (False) را نمایش میده

**متد <span class="en-text">get_or_create()</span>:**

``shell:``

```shell
>>> Post.objects.get_or_create(author_id=1, title='C language')
(<Post: C language>, True)

>>> Post.objects.get_or_create(description='Django is a free and open source web-based software framework')
(<Post: Django>, False)
```

---

**متد <span class="en-text">filter()</span>:** براساس شرایطی که برایش مشخص میکنیم، مجموعه داده های جدول را فیلتر و محدود میکند.

خروجی آن (کوئری ست) هستش.

``shell:``

```shell
>>> Post.objects.filter(title='Django')
<QuerySet [<Post: Django>]>
```
با استفاده از 2 تا underscore(__) میتوان فیلد های عناصر مشخص کننده در متد را مشخص کرد

مثال ها

``shell:``

```shell
>>> posts1 = Post.objects.filter(user__id=2)
>>> posts1
<QuerySet [<Post: Django>]>
>>>posts2 = Post.object.filter(publish__year=2023)
>>>posts2
<QuerySet [<Post: Java>, <Post: C#>]>
>>>Post.object.filter(publish__year=2022, author__username="reza")
<QuerySet [<Post: Python>]>
>>>Post.object.filter(publish__year=2024).filter(author__username="ali")
<QuerySet [<Post: Html>]>
```

---

**متد <span class="en-text">exclude()</span>:** همه داده های جدول، بجز آنهایی که این شرط را دارند نمایش میدهد(داده هایی که این شرط را دارند نمایش داده نمیشوند)

خروجی آن (کوئری ست) هستش.

``shell:``

```shell
>>> User.objects.exclude(username='Ali')
<QuerySet [<User: Mahdi>, <User: Mr_milad>]>
```

---

بااستفاده از متد <span class="en-text">update()</span> میتوان چند داده را ویرایش و آپدیت کرد.(برای مجموعه (کوئری ست) کاربرد داره)

``shell:``

```shell
>>> new-post = Post.objects.get(id=1)
>>> new-post.title = 'python programming language'
>>> new-post.save()
>>> User.objects.exclude(username='Ali').update(first_name='Mister1')
```

---

با استفاده از متد <span class="en-text">delete()</span> یک یا چند داده را از جدول پاک میکنیم.

``shell:``

```shell
>>> User.objects.all()
<QuerySet [<User: Mahdi>, <User: Ali>, <User: Mr_milad>]>
>>> my_user = User.objects.get(username='Ali')
>>> my_user.delete()
(1, {'auth.User': 1})
>>> User.objects.all()
<QuerySet [<User: Mahdi>, <User: Mr_milad>]>
```

---

دسترسی به فیلدهای مختلف یک داده از دیتابیس:

انتخاب یک داده 1. با متد <span class="en-text">get()</span> 2. استفاده از ایندکس برای (کوئری ست) و 3. حلقه روی (کوئری ست)

``shell:``

```shell
>>> p1 = Post.objects.get(id=2)
>>> p1.title
'Django'
>>> p1.description
'Django is a free and open source web-based software framework'

>>> User.objects.all()
<QuerySet [<User: Mahdi>, <User: Mr_milad>]>
>>> # استفاده از ایندکس برای انتخاب یک مورد
>>> users = User.objects.all()
>>> users[1].last_name
'Javid'
>>> # بجای استفاده از ایندکس میتوان روی (کوئری ست) حلقه زد و حالا داخل بدنه حلقه فیلد های مدنظر را صدا زد.(متد all() فراموش نشه)
>>> for user in users:
...     print(user.username)
...
Mahdi
Mr_milad
```

---

نمایش تمام پست های یک کاربر:

``shell:``

```shell
>>> posts1 = Post.objects.filter(author__username='Mr_milad')

>>> posts2 = User.objects.get(username='Mr_milad').posts.all()
```

نوشتن متد <span class="en-text">all()</span> مهمه.

عبارت **posts** قبل از متد <span class="en-text">all()</span> اسم (related_name) فیلد (author) هستش.

ما در این دو روش تمامی پست های یک کاربر را بدست آورده ایم./ حالا برای دسترسی به فیلدهای هر پست یا روی آن حلقه میزنیم یا با ایندکس، یک پست را انتخاب کرده و فیلد مدنظر را صدا میزنیم.

---

استفاده از فیلدهای مدل در متدهایی مثله (<span class="en-text">get()</span>, <span class="en-text">filter()</span>, <span class="en-text">exclude()</span>):

``shell:``

```shell
>>> post_01 = Post.objects.get(id=2)
>>> post_02 = post.objects.filter(title='Django')
>>> post_03 = post.objects.exclude(title='python')

>>> user01 = User.objects.get(username='Mahdi')
>>> user02 = User.objects.filter(first_name='milad')
```

در مثال های متعدد از فیلدها به صورت بالا استفاده کردیم حالا میخوایم وقتی دو جدول بهم متصل هستند، از فیلدهای جدول مقابل استفاده کنیم.

``shell:``

```shell
>>> # structure
>>> post = Post.objects.filter(relation-field_name__field_name-in-connected-model)
>>> # examples
>>> post_04 = Post.objects.get(author__id=1)
>>> post_05 = post.objects.filter(author__first_name='Mahdi')
>>> post_06 = post.objects.exclude(author__username='Mr_milad')

>>> # structure
>>> user = User.objects.filter(related_name__field_name)
>>> # examples
>>> user03 = User.objects.get(user_posts__title='python programming language')
>>> user04 = User.objects.exclude(user_posts__title='C language')
```

---

**متد <span class="en-text">order_by()</span>:** کوئری ست را براساس یک فیلد مرتب سازی میکند.

``shell:``

```shell
>>> sorted_users = User.objects.all().order_by('first_name')
>>> # reverse
>>> sorted_users = User.objects.all().order_by('-first_name')
```

---

محدود کردن(limit) کوئری ست با slicing:

``shell:``

```shell
>>> User.objects.all()[2:5]
```

---

**متد <span class="en-text">values()</span>:** این متد مربوط به (کوئری ست) ها هستش. / یک (کوئری ست) شامل یک یا چند دیکشنری برمیگرداند

هر دیکشنری یک آبجکت از آن جدول میباشد. / آن دیکشنری تمام فیلدهای آن مدل (ستون های جدول) را نمایش میدهد.

کلید دیکشنری همان فیلدهای ما هستند.

``shell:``

```shell
>>> Post.objects.all()
<QuerySet [<Post: python programming language>, <Post: Django>]>
>>> Post.objects.all().values()
<QuerySet [{'id': 1, 'author_id': 1, 'title': 'python programming language', 'description': 'pytjon is very usefull', 'created': datetime.datetime(2023, 5, 24, 15, 25, 45, 946455, tzinfo=datetime.timezone.utc)},
{'id': 2, 'author_id': 3, 'title': 'Django', 'description': 'Django is a free and open source web-based software framework', 'created': datetime.datetime(2023, 4, 12, 17, 18, 45, 856455, tzinfo=datetime.timezone.utc)}]>
```

خب حالا اگه ما فقط چند فیلد را بجای کل فیلدها بخواهیم کافیه آن فیلدها را برایش مشخص کنیم:

``shell:``

```shell
>>> Post.objects.all()
<QuerySet [<Post: python programming language>, <Post: Django>]>
>>> Post.objects.all().values('id', 'title')
<QuerySet [{'id': 1, 'title': 'python programming language'}, {'id': 2, 'title': 'Django'}]>
```

---

**متد <span class="en-text">values_list()</span>:** این متد مشابه (values()) میباشد، با این تفاوت که بجای دیکشنری؛ تاپل برمیگرداند.

هر تاپل شامل مقدار فیلد ها میباشد.

``shell:``

```shell
>>> Post.objects.all()
<QuerySet [<Post: python programming language>, <Post: Django>]>
>>> Post.objects.all().values_list()
<QuerySet [(1, 1, 'python programming language', 'pytjon is very usefull', datetime.datetime(2023, 5, 24, 15, 25, 45, 946455, tzinfo=datetime.timezone.utc)),
(2, 3, 'Django', 'Django is a free and open source web-based software framework', datetime.datetime(2023, 4, 12, 17, 18, 45, 856455, tzinfo=datetime.timezone.utc))]>
```

کاربرد اصلی این متد برای نمایش یک فیلد و بعضی مواقع چند فیلد میباشد:

``shell:``

```shell
>>> Post.objects.all().values_list('title')
<QuerySet [('python programming language',), ('Django',)]>

>>> # for better design (use flat=True)
>>>Post.objects.all().values_list('title', flat=True)
<QuerySet ['python programming language', 'Django']>

>>> # use multiple fields

>>> Post.objects.all().values_list('id', 'description')
<QuerySet [(1, 'pytjon is very usefull'), (2, 'Django is a free and open source web-based software framework')]>

>>> # for better design(use named=True)
>>> Post.objects.all().values_list('id', 'description', named=True)
<QuerySet [Row(id=1, description='pytjon is very usefull'), Row(id=2, description='Django is a free and open source web-based software framework')]>
```

---

### ساخت manager سفارشی برای مدل

هر مدل دارای (manager) پیشفرض (objects) میباشد.

و با استفاده از آن تمام آبجکت های ایجاد شده از آن مدل را شامل میشود(تمامی داده های آن مدل در دیتابیس)

حالا میخواهیم (manager سفارشی) خود را ایجاد کنیم.

خارج از کلاس مدل خود (در مثال ما کلاس Post) ، یک کلاس ایجاد میکنیم که از (models.Manager) ارث بری میکنه.

`app directory/models.py`

```python
class Field_NameManager(models.Manager):
    # ...


class Post(models.Model):
    # ...
    # .
    # .
```

حالا داخل آن کلاس متد <span class="en-text">get_queryset()</span> را **override** میکنیم

`app directory/models.py`

```python
class Field_NameManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(...)
```

داخل پرانتز متد <span class="en-text">filter()</span> با تعیین فیلد یا فیلدهایی از مدل، (کوئری ست) خود را فیلتر میکنیم(محدود میکنیم)

مثلا پست هایی را میخواهیم که وضعیت (publish) داشته باشند/ داخل متد <span class="en-text">filter()</span> مشخص میکنیم آنهایی که فیلد (status) برابره با (PUBLISHED) رو نمایش بده.

`app directory/models.py`

```python
class PublishedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status=Post.Status.PUBLISHED)
```

#### حالا باید این (manager) را به کلاس مدل خود (Post) معرفی کنیم

داخل کلاس مدل یک متغیر بنام (objects) نوشته و برایش مقدار (models.Manager()) را مشخص میکنیم.

حالا یک متغیر برای (manager سفارشی) نوشته و برایش (اسم کلاس (manager) که ایجاد کردیم) را مشخص میکنیم

```python
    objects = models.Manager()
    published = PublishedManager()
```

خب همه اینها را در کد فایل models.py ببینیم (کد جدید مابین خط چین ها میباشد).

`app directory/models.py`

```python
from django.db import models
from django.utils import timezone


# -------------------------------------------------------------------------
# Managers
class PublishedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status=Post.Status.PUBLISHED)
# -------------------------------------------------------------------------


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


    def __str__(self):
        return self.title
```

---

### ایجاد URL های اپلیکیشن بلاگ

برای مدیریت راحت تر (url) های هر اپلیکیشن (app) توی دایرکتوری هر اپ، یک فایل (urls.py) ایجاد کرده و (url)های مربوط به آن اپ را داخلش مینویسیم.

---

توی فایل (urls.py) اپ، (path) و (views) را ایمپورت میکنیم.

`app directory/urls.py`

```python
from django.urls import path
from . import views
```

---

1. توی فایل urls.py هر اپ یک متغیر بنام (app_name) نوشته و برایش اسم همان اپ را مشخص میکنیم.

2. حالا یک متغیر بنام (urlpatterns) ایجاد میکنیم، (url)های اپ داخل لیست آن قرار میگیرند.

---

#### تعریف url

توی لیست (urlpatterns) به صورت زیر عمل میکنیم:

`app directory/urls.py`

```python
urlpatterns = [
    path('page_url/', views.function_name, name='function_name'),
]
```

داخل پرانتز (path):
مورد اول => (url) آن صفحه در وبسایت میباشد(به صورت رشته نوشته میشود)
مورد دوم =>  (view) نوشته شده برای آن (url) میباشد
مورد سوم => یک اسم برای (url) مشخص میکنیم(همنام با اسم (view))

`app directory/urls.py`

```python
from django.urls import path
from . import views


app_name = 'blog'

urlpatterns = [
    # path("URL-name-page+/",views.view-page-method,name='name for better access to URL')

    # URL For index page
    path('', views.index, name='index'),
    # URL For Post-Detail
    path('posts/', views.post_list, name='post_list'),
    # URL For Post-Detail
    path('posts/<int:id>', views.post_detail, name="post_detail")
]
```

توی url متغیر را به صورت <name\> یا <data\_type:name\> بیان میکنیم

حالا وقتی این (url) را وارد میکنیم متغیر به (view) ارسال میشه

 برای استفاده از آن متغیر باید اسم متغیر را به عنوان آرگومان به تابع (view)  بدهیم.

---

#### کاربرد (app_name) و (name) در فایل (url)

اگر در پروژه، چند اپلیکیشن داشتیم برای دسترسی راحت تر به urlهای هر اپلیکیشن میتوان برای فایل های (urls.py) آنها یک namespace (app_name) تعریف کنیم و بجای نوشتن آن آدرس طولانی به صورت زیر عمل میکنیم:

app_name: (name in path)

blog: post_list

---

الآن این (url)ها کار نمیکنند ما باید یکسری تغییرات توی فایل (urls.py) پروژه (نه دایرکتوری اپ) ایجاد کنیم (باید فایل urls.py اپ را بهش معرفی کنیم)

```python
path('خالی یا یک آدرس', include('آدرس فایل url اپ', namespace="اسم اپ"))
```

مقدار path بالا باید درون لیست urlpatterns فایل urls.py خود پروژه اضافه شود، همچنین باید include نیز به این فایل import شود.

برای درک بیشتر به کد زیر توجه کنید.

`project directory/urls.py`

```python
from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),

    path('url before the app url/', include('app_name.urls', namespace="app_name"))
    # example
    path('weblog/', include('blog.urls', namespace="blog"))
]
```

---

### ایجاد view های اپلیکیشن بلاگ

داخل فایل (views.py) مدل های خود را (جهت ارتباط با دیتابیس: اعمال تغییرات و یا خواندن داده ها) ایمپورت میکنیم

view ها به صورت تابع تعریف میشوند که دارای آرگومان اجباری (request) هستند.

داخل بدنه تابع هرکاری که لازم داریم را انجام میدهیم

حالا اگه قرار باشه یک تمپلیت را نمایش دهیم از (render) استفاده میکنیم که باید ایمپورت شود.

برای تابع (render) دو مورد (request) و (path/template_name) اجباری هستند.

برای ارسال داده از (view) به (template) از (context) استفاده میکنیم

---

تمپلیت های ما در دایرکتوری (templates که در اپ قرار دارد) پوشه بندی میشوند آدرس تمپلیت های ما از داخل دایرکتوری templates شروع میشوند

'blog/post_detail.html'

دایرکتوری blog داخل دایرکتوری templates قرار دارد

`app directory/views.py`

```python
from .models import *
from django.shortcuts import render
from django.http import HttpResponse, Http404


# Views Of Home Page.
def index(request):
    return HttpResponse("index")

# Views Of All Posts.
def post_list(request):
    posts = Post.published.all()
    context = {
        'posts':posts,
    }

    return render(request, 'blog/post_list.html', context)

# Views Of Post-Details.
def post_detail(request, id):
    try:
        post = Post.published.get(id=id)
    except:
        raise Http404("No Post Found")

    context = {
        'post':post,
    }

    return render(request, "blog/post_detail.html", context)
```

بااستفاده از تابع (HttpResponse) یک متن رو نمایش میدهیم مثلا در بالا عبارت ('index') رو نمایش میدهد

در تابع (post_list) همه پست های منتشر شده را با دستور (ORM) از دیتابیس گرفته و توی متغیر (posts) ذخیره کرده ایم.

بااستفاده از (context) محتوای متغیر (posts) را با اسم (posts قابل استفاده در تمپلیت) به تمپلیت ارسال کرده ایم.

توی (post_detail) با دریافت (id) از (url) و استفاده از آن پست مربوطه را میابیم/ حالا اگه آن پست نباشد با تابع (Http404) ارور 404 با یک پیغام دلخواه نمایش داده میشود.

---

### ایجاد base template

توی قالب تمپلیت وبسایت یک بخش هایی مثل header, footer, navigation هستند که در همه صفحات تکرار میشوند برای جلوگیری از این تکرارها از تمپلیت (base template) استفاده کرده و آن بخش های تکراری را داخلش مینویسیم.

ساختار کلی تمپلیت تگ ها{%  %} و ساختار متغیرهای تمپلیت {{  }} میباشد

#### ساختار base template

`app directory/templates/parent/base.html`

```jinja
{% load static %}
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}{% endblock %}</title>
    <link rel="icon" type="image/ico" href="{% static 'icon/Django03.ico' %}">
    <link rel="stylesheet" type="text/css" href= "{% static 'css/base.css' %}">
    {% block head %}{% endblock %}
</head>
<body>
    {% include 'partials/header.html' %}
    {% include 'partials/navigation.html' %}
    <div class="container">
        {% block content %}{% endblock %}
    </div>
    {% include 'partials/footer.html' %}
</body>
</html>
```

فایل هایی مثله (images, CSS, JS) داخل دایرکتوری (static) قرار داده میشوند (دایرکتوری static را داخل دایرکتوری اپ ایجاد کنید)

برای استفاده از فایل های داخل دایرکتوری (static) اول باید آن را (load) کنیم این کار را با تمپلیت تگ {% load static %} انجام می دهیم

---

تمپلیت تگ (block):

{% block name %}{% endblock %}

با استفاده از این ساختار میتوان توی قالب هایی که از (base.html) ارث بری میکنند مطلب مدنظر خود را جایگزین کرد.

هر صفحه ای (title) خود را دارد واسه همین برای تگ (title) از تمپلیت تگ (block) استفاده میکنیم تا در هر صفحه ای عنوان منحصر به فرد خود را بنویسیم

---

تمپلیت های header, navigation, footer را جداگانه مینویسم حالا با استفاده از تمپلیت تگ {% include %} آنها را وارد تمپلیت (base.html) میکنیم

---

### ایجاد template های لیست و جزئیات

توی دایرکتوری (blog) فایل (html) را ایجاد میکنیم(blog داخل دایرکتوری templates قرار داره)

خب حالا برای اینکه تمپلیت ما (post_list.html ویا post_detail.html) از تمپلیت (base.html) ارث بری بکنه از تمپلیت تگ {% extends 'parent/base.html' %} استفاده میکنیم

حالا برای پرکردن (block)هایی که در تمپلیت پایه ایجاد کرده ایم:

از آن تمپلیت تگ block استفاده کرده و مابین تگ متن دلخواه خود را می نویسیم

بخش فرانت اند تمپلیت دلخواه هست و هرکس هر طور خواست میتونه آنرا بنویسه اینجا فقط یک مثال زدیم و چگونگی استفاده از block ها و تمپلیت تگ ها بیان شده است.

#### post_list.html

`app directory/templates/blog/post_list.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Post Lists {% endblock %}

{% block head %}
    <link rel="stylesheet" href="{% static 'css/style.css' %}">
{% endblock %}

{% block content %}
    <div class="container">
        {% for post in posts %}
            <div class="post">
                <a href="{% url blog:post_detil post.id %}">{{ post.title }}</a>
                <p>{{ post.description|truncatewords:5 }}</p>
            </div>
        {% endfor %}
    </div>
{% endblock %}

```

#### post_detail.html

`app directory/templates/blog/post_detail.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} {{ post.title }} {% endblock %}

{% block content %}
    <h3>Author: {{ post.author }}</h3>
    <br><br>
    <h2>Title: {{ post.title }}</h2>
    <h3 >description:</h3>
    <p>{{ post.description | linebreaks }}</p>
    <p>{{ post.publish }}</p>
{% endblock %}
```

برای استفاده از حلقه (for) توی تمپلیت از تمپلیت تگ آن استفاده میکنیم:

``jinja:``

```jinja
{% for post in posts %}
    بدنه حلقه
{% endfor %}
```

با استفاده از تمپلیت تگ (url) بجای آدرس طولانی، میتوان خیلی ساده به آنها دسترسی داشت.

``jinja:``

```jinja
{% url 'app_name:name in path' %}

{% url 'blog:post_list' %}
```

تمپلیت فیلتر (|truncatewords:number): با عددی که جلویش می نویسیم، تعیین میکنیم تا چند تا از کلمات آن متن را نشان بدهد و اگر باز کلمه داشت بجای آنها سه نقطه میذاره.

تمپلیت فیلتر (linebreaks): اگه متنی که نوشتیم در خطوط مختلف نوشته شده باشه توی صفحه سایت هم اون خطوط را جداگانه مینویسه.
