## فصل دهم: اپلیکیشن فروشگاه اینترنتی (بخش اول)

### ایجاد پروژه و مدل محصول

برای فروشگاه یک پروژه جدید ایجاد میکنیم حالا یک اپلیکیشن ایجاد کرده و آنرا به پروژه خود معرفی میکنیم ([آموزش ایجاد و معرفی اپ](season-02.html))

مدل «category»:

یک مدل بنام «category» برای دسته بندی محصولات ایجاد میکنیم

یک فیلد «name» برای اسم دسته بندی مشخص میکنیم

یک فیلد برای «slug» نوشته و برای آن از آرگومان (unique=True) استفاده میکنیم تا «slug» تکراری نداشته باشیم

برای بهینه تر بودن از کلاس «Meta» استفاده کرده و داخل بدنه اش «ordering» و «indexes» را براساس فیلد «name» ایجاد میکنیم. / با «verbose_name» میتوانیم یک اسم (برای مدل «category») جهت نمایش در پنل ادمین استفاده کنیم.

با استفاده از آرگومان «verbose_name» هم میتوان برای هر فیلد اسم مستعار مشخص کرد حتی به فارسی.

`app_name > models.py`

```python
from django.db import models


# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=255, unique=True)

    class Meta:
        ordering = ['name']
        indexes = [models.Index(fields=['name'])]
        # اسم مستعار
        verbose_name = 'دسته بندی'
        verbose_name_plural = 'دسته بندی ها'

    def __str__(self):
        return self.name
```

خب حالا میریم مدل «product» را ایجاد کنیم:

با فرض اینکه هر محصول یک «category» داره ولی هر «category» میتونه چند محصول داشته باشه،  یک فیلد بنام «category» از نوع «foreignkey» ایجاد کرده و آنرا به مدل «Category» متصل میکنیم.

#### در ایجاد فروشگاه باید به یک نکته توجه کنیم آن هم اینکه فروشگاه ما یک فروشنده داره و یا دارای چند فروشنده هست.

اگه چند فروشنده داشه باشیم باید یک مدل برای فروشنده ایجاد کنیم«seller» حالا باید این دو مدل (محصول و فروشنده) را بهم متصل کنیم وااسه همین توی مدل  «product» یک فیلد از نوع «foreignkey» ایجاد کرده و آنرا به مدل seller» متصل میکنیم

نکته دیگر اینکه باید مثل پستهای منتشر شده یک «manager» برای «seller» ایجاد میکنیم تا آنهایی که تایید شده اند  توی وبسایت نمایش داده بشوند و بتوانند فعالیت کنند.

«یک فروشنده میتواند چند محصول داشته باشه ولی هر محصول یک فروشنده داره.»

در اینجا ما پروژه را با فرض بر یک فروشنده پیش میبریم.

برای product فیلدهایی مثله (name, slug, descripton, product_image, inventory, price) و... مشخص میکنیم.

توی وبسایت های خارجی price از نوع اعشاری است (DesimalField یا FloatField) ولی توی ایران از «PositiveIntegerField» استفاده میکنیم

برای قیمت دو فیلد دیگر هم ایجاد میکنیم یکی درصد تخفیف برای محصول و دومی قیمت پس از اعمال تخفیف.

---

خب حالا نوبت به ایجاد فیلدهای مربوط به تاریخ (create, update) میرسه(بهتره با تاریخ جلالی تاریخ و زمان را فارسی کنیم.)

`app_name > models.py`

```python
class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')

    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=255)
    description = models.TextField(max_length=3500)

    inventory = models.PositiveIntegerField(default=0)
    # price = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.PositiveIntegerField(default=0)
    offers = models.PositiveIntegerField(default=0)
    new_price = models.PositiveIntegerField(default=0)

    # date
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['id', 'slug']),
            models.Index(fields=['name']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return self.name
```

ویژگی و مشخصات محصول «feature»: محصولات دارای یکسری ویژگی و مشخصاتی هستند، مثلا برای برخی از محصولات وزن آنرا بیان میکنیم ،برای کتب تعداد صفحات را مشخص میکنیم، یکسری از محصولات ابعاد برایشان بیان میشه / در کل یک محصول میتواند چندین ویژگی داشته باشه.

برای اینکه با تغییر ویژگی یک محصول ویزگی محصولات دیگه تغییر نکنه بجای رابطه «ManyToMany» از «ForeignKey» استفاده میکنیم

خب ویژگی«feature» هر محصول را منحصر به فرد در نظر میگیریم؛ بدین ترتیب یک محصول میتواند چند ویژگی(«feature») داشته باشه ولی هر ویژگی«feature» به یک محصول تعلق دارد.

با این توصیفات فیلد رابطه ای مربوط به مشخصات محصول، توی مدل مشخصات «ProductFeatures» نوشته میشود:

`app_name > models.py`

```python
class ProductFeatures(models.Model):
    name = models.CharField(max_length=50)
    value = models.CharField(max_length=255)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='features')

    def __str__(self):
        return f'{self.name}: {self.value}'
```

چون محصولات دارای چندین عکس هستند، یک مدل برای تصاویر ایجاد کرده و آنرا به مدل «product» متصل میکنیم.

`app_name > models.py`

```python
class Images(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_file = models.ImageField(upload_to='product_images/%Y/%m/%d/')
    title = models.CharField(max_length=255)
    description = models.TextField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']
        indexes = [models.Index(fields=['-created'])]

    def __str__(self):
        return self.title
```

نکته: برای اینکه تصاویر آپلودی در هر روزی مجزا توی یک پوشه قرار بگیرند(دسته بندی براساس تاریخ) برای آرگومان «upload_to» از حالت (product_images/%Y/%m/%d/) استفاده میکنیم.

---

#### تنظیمات و کارهای لازم برای ذخیره شدن تصاویر آپلودی

1- برای اینکه تصاویر آپلودی بتوانند ذخیره شوند توی «settings.py» باید «MEDIA_URL» و «MEDIA_ROOT» را مشخص کنیم.

`project_name > settings.py`

```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

---

2- حالا توی «urls.py» پروژه باید یک «urlpatterns» هم اضافه کنیم. / «static» و «settings» رو هم باید ایمپورت کنیم (توی فایل یکسری مقادیر از قبل وجود دارد)

`project_name > urls.py`

```python
from django.contrib import admin
from django.urls import path

from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

حالا باید پکیج «pillow» را نصب کنیم

`Terminal`

```python
pip install pillow
```

حالا بادستورات «makemigrations» و «migrate» تغییرات را در دیتابیس اعمال میکنیم.

---

### نمایش مدل ها در ادمین و سیگنال تخفیف

خب بریم سیگنال تخفیف را ایجاد کنیم

برای نوشتن سیگنال هایمان توی دایرکتوری اپ(app) یک فایل پایتونی بنام «signals.py» ایجاد میکنیم

برای تخفیف محصول از سیگنال «pre_save» استفاده میکنیم پس باید ایمپورت بشه. / reciever رو هم باید ایمپورت کنیم.

حالا وقتی قیمت محصول و یا درصد تخفیف تغییر کنه سیگنال ارسال میشه حالا آن میاد و قیمت پس از تخفیف را محاسبه کرده و آنرا در دیتابیس ذخیره میکنه.

`app_name > signals.py`

```python
from django.dispatch import receiver
from django.db.models.signals import pre_save
from .models import Product


@receiver(pre_save, sender=Product)
def calculate_new_price(sender, instance, **kwargs):
    instance.new_price = ((100 - instance.offers) * instance.price) / 100
```

برای اینکه سیگنال های نوشته شده کار کنند باید آنها را کانفیگ کنیم. / برای این کار توی فایل پایتونی «apps.py» متد «ready» رو «override» میکنیم.

signals => اسم فایلی است که سیگنالها را در آن مینویسیم

app_name => اسمی که برای اپلیکیشن خود نوشته ایم.

`app_name > apps.py`

```python
def ready(self):
    import app_name.signals
```

`app_name > apps.py`

```python
from django.apps import AppConfig


class ShopConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'shop'

    def ready(self):
        import shop.signals
```

---

خب حالا بریم مدل ها را در پنل ادمین نمایش بدیم:

برای مشاهده و مدیریت مدل های «Image» و «ProductFeatures» در مدل «Product»  وقتی در پنل ادمین هستیم؛ برای آن دو از «InlineModelAdmin» استفاده کرده و آنها را به لیست «Inlines» در کلاس «ProductAdmin» اضافه میکنیم.

`app_name > admin.py`

```python
from django.contrib import admin

from shop.models import *


class FeaturesInline(admin.TabularInline):
    model = ProductFeatures
    extra = 0


class ImageInline(admin.TabularInline):
    model = Images
    extra = 0


# Register your models here.
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'new_price', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [FeaturesInline, ImageInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(ProductFeatures)
class ProductFeaturesAdmin(admin.ModelAdmin):
    list_display = ('name', 'value', 'product')
```

---

حالا برای ورود به پنل ادمین باید یک «superuser» ایجاد کنیم.

`Terminal`

```python
python manage.py createsuperuser
```

### اضافه کردن Url و View برای محصولات

بریم یک view برای لیست محصولات ایجاد کنیم / موارد لازم مثل مدل ها را ایمپورت میکنیم:

برای view لیست محصولات دو حالت داریم => 1- زمانی که میخواهیم کل محصولات را نمایش دهیم 2- زمانی که میخواهیم کل محصولات مربوط به یک دسته بندی را نمایش بدهیم.

برای همین به عنوان آرگومان «category_slug=None» را برایش مشخص میکنیم تا زمانی که کاربر آنرا وارد نکرده مقدارش «None» باشد.

تمامی دسته بندی ها(category) و محصولات (product)  را از دیتابیس دریافت کرده و در متغیر ذخیره میکنیم. / اینها به تمپلیت ارسال میشوند.

حالا یک شرط مینویسیم تا اگر دسته بندی توسط کاربر ارسال شد اول چک کنیم آن دسته بندی وجود داره یا نه / اگه وجود داشت محصولات را براساس آن دسته بندی فیلتر میکنیم. در غیر این صورت ارور 404

حالا مواردی مثله (دسته بندی فعلی ، محصولات بدست آمده و کل دسته بندی ها) را از طریق «context» به تمپلیت ارسال میکنیم.

`app_name > views.py`

```python
from django.shortcuts import render, get_object_or_404
from .models import *


# Create your views here.
def products_list(request, category_slug=None):
    category = None
    categories = Category.objects.all()
    products = Product.objects.all()

    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        products = products.filter(category=category)

    context = {
        'category': category,
        'products': products,
        'categories': categories,
    }

    return render(request, 'shop/products_list.html', context=context)
```

حالا بریم «view» مربوط به جئیات محصول را ایجاد کنیم.

این کار را براساس «id» و «slug» آن پست انجام میدهیم. / اگه «id» ویا «slug» وجود نداشت ارور «404» میدهد.

آن محصول را از طریق «context» به تمپلیت ارسال میکنیم.

`app_name > views.py`

```python
def product_detail(request, id, slug):
    product = get_object_or_404(Product, id=id, slug=slug)
    
    context = {
        'product': product,
    }
    
    return render(request, 'shop/product_detail.html', context=context)
```

حالا بریم سراغ url

برای لیست محصولات دو url لازم داریم 1- بدون متغیر که برای کل محصولات هستش 2- به همراه متغیر (category_slug) که برای تمام محصولات مربوط به آن دسته بندی هستش

یک url هم برای جزئیات محصول ایجاد میکنیم. / برای شناسایی محصول مدنظر «slug» و «id» محصول را ارسال میکنیم.

`app_name > urls.py`

```python
from django.urls import path
from . import views


app_name = 'shop'

urlpatterns = [
    path('products/', views.products_list, name='products-list'),
    path('products/<slug:category_slug/>', views.products_list, name='products-list-by-category'),
    path('products/<int:id>/<slug:slug>/', views.product_detail, name='product_detail'),
]
```

حالا برای اینکه این «url» ها کار بکنند باید آنها را به فایل «urls.py» پروژه معرفی کنیم.

لازمه «include» را ایمپورت کنیم.

`project_name > urls.py`

```python
from django.urls import path, include
```

حالا عبارت زیر را به لیست «urlpatterns» اضافه میکنیم.

`project_name > urls.py`

```python
path('', include('shop.urls', namespace='shop')),
```

خب بریم کد کامل را ببینیم:

`project_name > urls.py`

```python
from django.contrib import admin
from django.urls import path, include

from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('shop.urls', namespace='shop')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

برای مدل «Category» و «Product» متد «get_absolute_url» را مشخص تا هرجا لازم داشتیم از آن استفاده کنیم. / «reverse» را باید ایمپورت کنیم.

`app_name > models.py`

```python
from django.urls import reverse

# in Category model => محصولات را براساس یک دسته بندی برمیگرداند
def get_absolute_url(self):
    return reverse('shop:products-list-by-category', kwargs={'slug': self.slug})

# in Product model => یک محصول را براساس (آیدی) و (اسلاگ) آن برمیگرداند.
def get_absolute_url(self):
    return reverse('shop:product_detail', kwargs={'id': self.id, 'slug': self.slug})
```

### اضافه کردن تمپلیت لیست محصولات

داخل دایرکتوری اپ (app) دایرکتوری «static» را ایجاد میکنیم. / برای فایل هایی مثله «css», «JS», «images», «font» استفاده میشه.

توی دایرکتوری «templates» یک دایرکتوری بنام «parent» میسازیم حالا داخل آن یک دایرکتوری دیگه بنام «base» ایجاد کرده و تمپلیت پایه را آنجا ذخیره میکنیم. / حالا داخل دایرکتوری «templates» یک دایرکتوری هم بنام «partials» ساخته و (هدر و فوتر و...) را آنجا ذخیره میکنیم.

حالا بریم تمپلیت پایه خود (base-template.html) را ایجاد کنیم:

داخل تمپلیت برای استفاده از فایل های موجود در دایرکتوری «static» باید  «static» را با تمپلیت تگ «{% load %}» به تمپلیت معرفی کنیم

```html
{% load static %}
```

برای تگ (title) از تمپلیت تگ ({% block name %}{% block %}) استفاده میکنیم. / تا هر تمپلیتی که از «base_template.html» ارث بری میکنه بتواند «title» خودش را داشته باشه.

```html
    <title>shop | {% block title %}{% endblock %}</title>
```

با استفاده از «static» فایل «css» مربوط به تمپلیت «base» را به آن لینک میکنیم.

```html
    <link rel="stylesheet" href="{% static 'CSS/base_style.css' %}">
```

چنانچه بخواهیم توی تگ (head) موارد دیگری هم اضافه کنیم یک تمپلیت تگ «block» هم به آخر تگ (head) اضافه میکنیم.

فایل هایی مثله «header», «navigation», «footer» را به صورت مجزا توی دایرکتوری «partials»  ایجاد میکنیم. / حالا به کمک تمپلیت تگ {% include path %} آنها را به تمپلیت پایه اضافه میکنیم.

برای نوشتن محتوای اصلی تمپلیتی که از فایل «base» ارث بری میکنه باید توی فایل «base» قبل از «footer» از تمپلیت تگ «block» استفاده کنیم.

خب بریم کد کامل تمپلیت پایه را ببینیم:

```html
{% load static %}

<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">

    <title>shop | {% block title %}{% endblock %}</title>
    <link rel="stylesheet" href="{% static 'CSS/base_style.css' %}">
    {% block head %}{% endblock %}
</head>

<body>
    {% include 'partials/header.html' %}

    {% block content %}{% endblock %}

    {% include 'partials/footer.html' %}
</body>

</html>
```

خب بریم تمپلیت لیست محصولات را ایجاد کنیم:

اول از تمپلیت پایه ارث  بری میکنیم

```html
{% extends 'path of base_template.html' %}
```

در کل در هر تمپلیتی که نیاز به فایل هایی مثل (CSS, JS, image, ...) هست باید «static» را لود کنیم. / پس اینجا هم همین کار را میکنیم.

### اضافه کردن تمپلیت جزئیات محصول

در این تمپلیت؛ تصاویر محصول، توضیحات، دسته بندی، ویژگی های آن و... را نمایش میدهیم.

در گام اول از تمپلیت پایه ارث بری میکنیم.

`templates/shop/product_detail.html`

```jinja
{% extends 'parent/base/base_template.html' %}
{% load static %}

{% block title %}{{ product.name }}{% endblock %}

{% block head %}<link rel="stylesheet" href="{% static 'CSS/product-detail.css' %}">{% endblock %}


{% block content %}
    <div class="heading-text">
        <h1>جزئیات محصول</h1>
    </div>


    <div class="product-detail">
        <h2>{{ product.name }}</h2>
        <p>دسته بندی: {{ product.category }}</p>
        <p>موجودی: {{ product.inventory }}</p>
        <ul>
            {% for feature in product.features.all %}
                <li>{{ feature.name }}: {{ feature.value }}</li>
            {% endfor %}
        </ul>

        <div class="price">
            <span class="original-price">قیمت: {{ product.price }}</span>
            <br>
            <span class="discounted-price">قیمت پس از تخفیف: {{ product.new_price }}</span>
        </div>
    </div>

    <div class="product-images">
        {% for image in product.images.all %}
            <img src="{{ image.image_file.url }}" alt="{{ image.title }}">
        {% endfor %}
    </div>

    <div class="product-description">
        <h3>description</h3>
        <p>{{ product.description }}</p>
    </div>
{% endblock %}
```

یک تگ div برای جزئیات محصول ایجاد کرده و در آن؛ اسم محصول، دسته بندی، موجودی، ویژگی های محصول را در آن نمایش میدهیم.

برای تصاویر محصول نیز یک div ایجاد کرده و با پیمایش روی تصاویر توسط حلقه، تصاویر آن را نمایش میدهیم.

و در پایان توضیحات محصول را اضافه میکنیم.

> ساختار html میتواند بسته به علایق تغییراتی داشته باشد، مثلا ابتدا تصاویر نمایش داده شوند.

### کار با سشن (session)

توضیحات اصلی در مورد سشن و کوکی ها در [فصل صفرم](season-00.html#14-khwkhy-h-w-sshn-h) بیان شده است.

session ها در سمت سرور ذخیره میشوند برخلاف کوکی ها؛ و فقط sessionID در کوکی ها ذخیره میشود.

> برای هر کاربر یک sessionID وجود دارد، امنیت بالاتری دارد.

معمولا سشن ها را زمانی استفاده میکنیم، که میخواهیم یکسری داده ها را به صورت موقتی ذخیره کنیم و بعد پاک شوند(به صورت اتوماتیک و یا دستی).

> مثلا در برخی فرم های ثبت نامی که شماره تلفن را گرفته و کدی را به کاربر  ارسال میکند؛ آن شماره در سشن ذخیره میشود.

**برای استفاده از سشن ها لازم است که تنظیمات آن وجود داشته باشد:**

بررسی شود که در settings.py بخش  MIDDLEWARE تنظیمات سشن وجود داشته باشد.(به صورت پیشفرض این تنظیمات وجود دارد.)

`project directory/settings.py`

```python
MIDDLEWARE = [
    'django.contrib.sessions.middleware.SessionMiddleware',
    # ...
]
```

در سشن؛ ساختار عملکردی به صورت دیکشنری میباشد، با کلید و مقدار داده ها را ذخیره میکنیم.

**روش استفاده:**

> تنظیمات MIDDLEWARE سشن باعث میشود که session در request وجود داشته باشد؛ بنابراین با دستور **request.session** میتوانیم به سشن دسترسی داشته باشیم.
>
> request.session یک دیکشنری میباشد.     

```python
request.session[key] = value
# با ساختار دستوری بالا میتوانیم، یک داده را در سشن ذخیره کنیم.

# -------------------------------------------------------------------

request.session.get(key)
# و با دستور بالا میتوانیم به داده مدنظر در سشن دسترسی داشته باشیم.
```

**نکته: به صورت پیشفرض سشن ها به مدت 2 هفته نگهداری میشوند.**

```python
# با کلمه کلیدی del میتوان آن سشن را پاک کرد.
del request.session[key]
```

**تنظیمات اضافی برای سشن:**

یکسری تنظیمات برای مدیریت سشن وجود دارد اینجا چند مورد را بررسی میکنیم:

**SESSION_COOKIE_AGE:** تاریخ انقضای سشن را مشخص میکنیم، باید به ثانیه وارد شود.

**SESSION_ENGINE:** مشخص میکنیم، سشن ها را در سمت سرور در کجا ذخیره شوند. / به صورت پیشفرض دیتابیس میباشد.

**SESSION_EXPIRE_AT_BROWSER_CLOSE:** دو مقدار True  و False دارد، مقدار True  باعث میشود به محض بستن مرورگر سشن ها پاک شوند ولی اگر False باشد مقداری که برای متغیر SESSION_COOKIE_AGE مشخص کردیم، اعمال میشود. / به صورت پیشفرض **False** میباشد.

> **نکته:** اگر قبل از لاگین کردن مواردی را در سشن ذخیره کنیم، پس از لاگین کردن آن داده ها از بین میروند و یک سشن جدید ایجاد میشود.
>
> <span class="rtl-text">ولی اگر میخواهیم آن مقادیر پس از لاگین کردن هم باقی بمانند؛ قبل از استفاده از کلاس <span class="en-text">login()</span> مقادیر آن سشن را در یک متغیر ذخیره کنیم، حالا پس از لاگین کردن اطلاعات ذخیره شده در متغیر را در سشن جدید ذخیره میکنیم.</span>
>
> > my_data = request.session
> >
> > login()
> >
> > request.session = my_data

### اضافه کردن اپ سبد خرید

چون ساختار فروشگاه یک پروژه بزرگ بوده و قابل توسعه میباشد، برای مدیریت بهتر و سریع تر از چندین اپ(app) برای بخش های مختلف استفاده میکنیم.

> مثلا برای سبد خرید و یا پرداخت هزینه ها از اپ های جداگانه ایجاد میکنیم.

پس یک اپ بنام **cart** ایجاد کرده و آنرا در تنظیمات(INSTALLED_APPS) به پروژه خود معرفی میکینم.

**برای هر کاربر، اطلاعات سبد خرید را در سشن ذخیره میکنیم.**

- برای مدیریت سبد خرید که در سشن ذخیره میشود، یک کلاس ایجاد کرده و برای عملکردهای مختلف مثل افزودن کالا به سبد خرید، حذف کالا از سبد خرید و... متدهایی در این کلاس ایجاد میکنیم.

**بریم ببینیم چطور اطلاعات سبد خرید را در سشن ذخیره میکنیم:**

برای اینکه در سشن یک سبد خرید داشته باشیم؛ یک کلید بنام **cart** ایجاد کرده و برای مقدار آن یک دیکشنری قرار میدهیم.(آیتم های سبد خرید در این دیکشنری قرار میگیرند.)

```python
# session => {"cart": {item's}}
```

**ساختار دیکشنری داخلی:**

در این دیکشنری به عنوان **کلید(key)** product_id و برای **مقدار(value)** آن یک دیکشنری دیگر خواهیم داشت؛ در این دیکشنری اطلاعات آن محصول(مثل: تعداد محصول، قیمت محصول، وزن محصول) را ذخیره میکنیم.

```python

# {item's} => {PId1: {'quantity': 2, 'price': product.new_price, 'weight': product.weight}, PId2: {'quantity': 7, 'price': product.new_price, 'weight': product.weight}, ...}

# مقادیر وارد شده فرضی میباشند.
```

> به این ترتیب تا وقتی این سشن برقرار است حتی اگر قیمت محصول تغییر کند، برای محصولاتی که در سبد خرید قرار دارند، تغییر قیمت نخواهیم داشت.(قیمت ثابته.)

کلیدهای ما id محصولات میباشند؛ البته باید به صورت رشته باشد، چون قرار است به json (سریال سازی: فرایند ترجمه ساختمان داده)serialize شود.(پس کلیدها باید به صورت رشته باشند.)

> هر کاربر یک سشن منحصر به فرد با سبدخرید (cart) منحصر به فرد میباشد.

**خب بریم این ساختار را پیاده سازی کنیم:**

در app(اپ)، **cart** یک فایل پایتونی بنام cart.py ایجاد میکنیم؛ در آن فایل یک کلاس ایجاد میکنیم.

> این کلاس همان کلاسی است که در بالا در مورد آن توضیح داده شد(برای مدیریت سبد خرید).

در این فایل، با مدل Product سروکار داریم، ولی این مدل در یک اپ دیگر قرار دارد؛ بنابراین از آن app به مدل ها رفته و مدل Product را انتخاب میکنیم.

`app directory(cart)/cart.py`

```python
from shop.models import Product
```

خب حالا یک کلاس بنام Cart ایجاد میکنیم(این کلاس از هیچ کلاس دیگری ارث بری نمیکنه) داخل بدنه آن متدهایی که لازم داریم را اضافه میکنیم.

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart
```

**توضیحات:**

برای متد **\_\_init\_\_**، باید request را به عنوان پارامتر مشخص کنیم؛ چرا؟!، چون برای دسترسی به سشن به آن نیاز داریم. / در دستور **request.session**.

1. با استفاده از دستور request.session سشن را به دست آورده و آنرا در اتریبیوت session ذخیره میکنیم.

2. یک متغیر موقت بنام cart ایجاد میکنیم و در آن بررسی میکنیم که در سشن cart(سبد خرید) وجود دارد یا نه؟!

    > <span class="rtl-text">با استفاده از متد <span class="en-text">get()</span> بررسی میکنیم که کلیدی تحت عنوان cart وجود دارد یا نه؟!</span>
    >
    > اگر cart وجود داشته باشد مقدار آنرا (value) را برمیگرداند و در غیر این صورت None برمیگرداند. / خروجی آن در متغیر ذخیره میشود.

3. اگر مقدار متغیر cart(سبد خرید)، None بود(یعنی کلید cart در سشن وجود ندارد)؛ بنابراین برای سشن یک کلید(key) بنام cart ایجاد کرده و برای مقدار آن(value) یک دیکشنری خالی مشخص میکنیم.
    > <span class="rtl-text">در ساختار <span class="en-text">cart = self.session['cart'] = {}</span> یک کلید و مقدار برای سشن ست میشود (یک کلید بنام cart با مقدار دیکشنری خالی در سشن ایجاد میشود) از طرفی دیکشنری خالی برای این **متغیر cart** ست میشود.</span>
    >
    > در ضمن این ساختار باعث میشود که هر بار cart آپدیت میشود سشن هم تغییر کند. / وقتی محصولی به cart(سبد خرید) اضافه میکنیم این تغییر در سشن هم لحاظ میشود.
    >
    > الان هم سشن، سبد خرید را دارد و هم متغیر cart دارای مقدار (دیکشنری خالی) میباشد.

    **بذارید یک مثال بزنیم:**

    > > <span class="en-text">a = b = 5</span>
    >
    > در مثال بالا مشخص کرده ایم که متغیر a با متغیر b برابر بوده و برای هردو مقدار 5 ست شده است.
    >
    > > <span class="en-text">cart = self.session['cart'] = {}</span>
    >
    > در متد \_\_init\_\_ هم مشخص کرده ایم که متغیر cart با value(مقدار)، **کلید cart** در دیکشنری session برابر هست و برای هردو یک دیکشنری خالی ست کرده ایم.

4. حالا متغیر cart مقدار دارد(1- یا یک دیکشنری با یکسری مقادیر(اطلاعات محصول) میباشد 2- و یا یک دیکشنری خالیست)؛ آن متغیر را به عنوان اتریبیوت cart ذخیره میکنیم.

    > پس حالا این self.cart یا یک دیکشنری خالی میباشد و یا یک دیکشنری هست که از قبل وجود داشته شامل یکسری محصولات هست.
    >
    > با این مقداردهی های اولیه cart(سبد خرید) را در (session)سشن ست میکند.

**در اپ shop برای مدل Product، فیلد weight را اضافه میکنیم تا از آن در اطلاعات محصول استفاده کنیم:**

`app directory(shop)/models.py`

```python
class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')

    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=255)
    description = models.TextField(max_length=3500)

    inventory = models.PositiveIntegerField(default=0)
    # price = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.PositiveIntegerField(default=0)
    offers = models.PositiveIntegerField(default=0)
    new_price = models.PositiveIntegerField(default=0)

    # —————————————————————————— weight field ——————————————————————————
    weight = models.PositiveIntegerField(default=0)

    # date
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['id', 'slug']),
            models.Index(fields=['name']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return self.name
```

**ایجاد متدهایی برای مدیریت سبد خرید در سشن:**

متدهایی که ایجاد میکنیم اطلاعات سبد خرید را در سشن تغییر میدهد.

> برای راحتی در هر بخش فقط متد همان بخش را در کد نمایش میدهیم و در پایان یک دید کلی از کد خواهیم دید.

1- **متد save:**

در آن مشخص میکنیم، که در این سشن یکسری تغییرات صورت گرفته است.

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart

    # ——————————————————————————————————————————————————
    def save(self):
        self.session.modified = True
```

بنابراین هروقت از متد <span class="en-text">save()</span> استفاده کنیم، به جنگو میفهمانیم که سشن modify شده است.

2- **متد add:**

برای افزودن یک کالا به سبد خرید و یا افزایش تعداد یک کالا در سبد خرید استفاده میشود.

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart

    # ———————————————————————— افزودن به سبد خرید ——————————————————————— #
    def add(self, product):
        product_id = str(product.id)
        if product_id not in self.cart:
            self.cart[product_id] = {'quantity': 1, 'price': product.new_price, 'weight': product.weight}
        else:
            if self.cart[product_id]['quantity'] < product.inventory:
                self.cart[product_id]['quantity'] += 1

        self.save()        

    # —————————————————————————————————————————————————————————————————— #
    def save(self):
        self.session.modified = True
```

**توضیحات:**

1. product را به عنوان پارامتر برای متد add مشخص میکنیم.

2. حالا آیدی آن محصول را به صورت رشته در متغیر product_id ذخیره میکنیم.

    **نکته:** self.cart یک دیکشنری میباشد که برای کلیدهای آن(key)، آیدی محصولات(productID) و برای مقدار(value) هر یک از آنها یک دیکشنری دیگر خواهیم داشت که در آن، اطلاعات محصول مثل تعداد محصول، قیمت محصول، وزن محصول قرار دارد.

3. حالا یک شرط مشخص میکنیم که اگر محصولی با این آیدی در دیکشنری self.cart (سبد خرید) وجود ندارد؛ آنرا به دیکشنری اضافه میکنیم:

    > یک کلید بنام آن product_id ایجاد کرده و برای مقدار آن یک دیکشنری با اطلاعات آن محصول مشخص میکنیم. / این محصول جدید به سبد خرید اضافه میشود.
    >
    > چون این محصول به تازگی اضافه شده تعداد آن را 1 قرار میدهیم.

4. ولی اگر محصول از قبل در سبد خرید وجود داشته باشد، باید یکی به تعداد آن(quantity) اضافه کنیم.

    > ولی با این وجود نباید بیشتر از موجودی  آن کالا ثبت کند برای همین یک شرط میگذاریم  که اگر «تعداد آن کالا در سبد خرید» کمتر از «موجودی کالا» هست یکی به تعداد آن اضافه کن.

5. و در پایان متد <span class="en-text">save()</span> را صدا میزنیم چون سشن تغییر کرده است.

3- **متد decrease:**

این متد تعداد محصول را کاهش می‌دهد و در صورت لزوم آن را از سبد خرید حذف می‌کند.

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart

    # ———————————————————— کاهش تعداد کالا از سبد خرید ——————————————————— #
    def decrease(self, product):
        product_id = str(product.id)
        if self.cart[product_id]['quantity'] > 1:
            self.cart[product_id]['quantity'] -= 1

            self.save()               

    # —————————————————————————————————————————————————————————————————— #
    def save(self):
        self.session.modified = True
```

**توضیحات:**

1. product را به عنوان پارامتر برای متد decrease مشخص میکنیم.

2. در اینجا هم آیدی آن محصول را به صورت رشته در متغیر product_id ذخیره میکنیم

3. یک شرط مشخص میکنم که اگر تعداد کالا در سبد خرید بیشتر از 1 بود؛ از تعداد آن کالا یکی کم کند.

4. و در پایان از متد <span class="en-text">save()</span> استفاده میکنیم.

**4- متد delete:**

برای حذف یک کالا از سبد خرید کاربرد دارد.

> یک محصول را (حالا هر تعداد که داشته باشد)؛ از سبد خرید پاک میکند.

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart

    # ——————————————————— حذف یک محصول از سبد خرید ——————————————————— #
    def delete(self, product):
        product_id = str(product.id)
        if product_id in self.cart:
            del self.cart[product_id]

            self.save()                       

    # —————————————————————————————————————————————————————————————————— #
    def save(self):
        self.session.modified = True
```

**توضیحات:**

1. product را به عنوان پارامتر برای متد delete مشخص میکنیم.

2. در اینجا هم آیدی آن محصول را به صورت رشته در متغیر product_id ذخیره میکنیم

3. حالا با استفاده از یک شرط مشخص میکنیم که اگر آن کالا در سبد خرید وجود دارد، آنرا از دیکشنری سبد خرید پاک کن.

4. استفاده از متد <span class="en-text">save()</span>

**5- متد clear:**

برای پاکسازی کامل سبد خرید استفاده میشود؛ تمام محصولات را از سبد خرید پاک میکند.

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart

    # ——————————————— پاکسازی سبد خرید(حذف تمام محصولات) ——————————————— #
    def clear(self):
        del self.session['cart']
        self.save()                             

    # —————————————————————————————————————————————————————————————————— #
    def save(self):
        self.session.modified = True
```

**توضیحات:**

با استفاده از کلمه کلیدی **del** کلید و مقدار مربوط به cart(سبد خرید) را حذف میکنیم؛ این طوری اطلاعات سبد خرید از سشن پاک میشوند.

**6- متد get_post_price:**

با این متد هزینه پستی کالا ها را برای کاربر محاسبه میکنیم.

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart

    # ——————————————————————— محاسبه هزینه پستی ——————————————————————— #
    def get_post_price(self):
        total_weight = sum(item['weight'] * item['quantity'] for item in self.cart.values())

        if total_weight == 0:
            return 0
        elif total_weight < 1000:
            return 20000
        elif 1000 < total_weight < 2000:
            return 30000
        else:
            return 50000                                  

    # —————————————————————————————————————————————————————————————————— #
    def save(self):
        self.session.modified = True
```

**توضیحات:**

هزینه پستی براساس وزن کالاها محاسبه میشود بنابراین لازم است تا وزن تمام محصولات، سبد خرید را بدست بیاوریم.

> ممکن است از برخی کالاها چند تا وجود داشته باشه؛ پس باید وزن آن کالا را در تعداد آن ضرب کرده و در نهایت تمام وزن ها را باهم جمع کنیم.
>
> quantity * weight

با استفاده از <span class="en-text">self.cart.values()</span> به تمام دیکشنری ها (که اطلاعات محصولات، موجود در سبد خرید را نشان میدهند) دسترسی داریم.

> > <span class="en-text">{PId1: {'quantity': 2, 'price': product.new_price, 'weight': product weight}, PId2: {'quantity': 7, 'price': product.new_price, 'weight': product.weight}, ...}</span>
>
> اگر این نمونه بالا یک سبد خرید باشد، کدی که بالاتر گفته شد؛ دیکشنری ها که به عنوان value هستند را برمیگرداند.

حالا روی این دیکشنری ها حلقه زده و وزن و تعداد هر کالا را بدست آورده و با یکدیگر ضرب میکنیم؛ این کار را در تابع sum انجام میدهیم تا آن مقادیر را باهم جمع هم بکند.

با استفاه از API و یا به صورت دستی هزینه پستی را محاسبه میکنیم.

**7- متد get_total_price:**

با این متد هزینه کل کالا های سبد خرید را محاسبه میکنیم.

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart

    # ————————————————————— محاسبه هزینه کل محصولات ————————————————————— #
    def get_total_price(self):
        total_price = sum(item['price'] * item['quantity'] for item in self.cart.values())
        return total_price                                           

    # —————————————————————————————————————————————————————————————————— #
    def save(self):
        self.session.modified = True
```

**توضیحات:**

این بار میخواهیم هزینه کل کالا ها را حساب کنیم؛ ممکن است از یک کالا چند مورد وجود داشته باشد پس باید تعداد کالا را در قیمت آن ضرب کنیم و در نهایت همه آنها را باهم جمع کنیم.

> این فرایند مشابه با محاسبه وزن کل کالا ها میباشد.

**8- متد get_final_price:**

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart

    # ——————————————————— محاسبه هزینه نهایی سبد خرید ——————————————————— #
    def get_final_price(self):
        final_price = self.get_total_price() + self.get_post_price()
        return final_price                                        

    # —————————————————————————————————————————————————————————————————— #
    def save(self):
        self.session.modified = True
```

**توضیحات:**

از مجموع هزینه کل محصولات و هزینه پستی؛ هزینه نهایی محسبه میشود.

**9- override کردن متد \_\_len\_\_:**

با این متد تعداد کل محصولات را بدست می آوریم.

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart

    # ————————————————————— مجموع تعداد کل محصولات —————————————————————— #
    def __len__(self):
        return sum(item['quantity'] for item in self.cart.values())                                                  
```

**10- override کردن متد \_\_iter\_\_:**

متد __iter__ یکی از متدهای خاص در پایتون است که به اشیا این امکان را می‌دهد تا قابل تکرار (iterable) شوند. | بتوان روی آنها حلقه زد.

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart

    # ——————————————————————————— iteration ———————————————————————————— #
    def __iter__(self):
        product_ids = list(self.cart.keys())
        products = Product.objects.filter(id__in=product_ids)
        cart_dict = self.cart.copy()

        for product in products:
            cart_dict[str(product.id)]['product'] = product

        for item in cart_dict.values():
            yield item                                                       
```

**توضیح کامل کد:**

1. **استخراج شناسه‌های محصولات در سبد خرید**:
    ```python
    product_ids = list(self.cart.keys())
    ```
    - در این خط، تمام کلیدهای دیکشنری `self.cart` که شناسه‌های محصولات (product IDs) هستند، به صورت یک لیست در `product_ids` ذخیره می‌شوند.
    - `self.cart` یک دیکشنری است که در آن کلیدها شناسه‌های محصولات هستند و مقادیر آن شامل اطلاعات مربوط به هر محصول مانند تعداد، قیمت و وزن هستند.

2. **استخراج محصولات از دیتابیس**:
    ```python
    products = Product.objects.filter(id__in=product_ids)
    ```
    - این خط، تمامی محصولات مرتبط با `product_ids` را از دیتابیس واکشی می‌کند. این کوئری تمام محصولاتی که شناسه‌هایشان در `product_ids` هستند را برمی‌گرداند.

3. **ایجاد یک کپی از سبد خرید**:
    ```python
    cart_dict = self.cart.copy()
    ```
    - این خط یک کپی از سبد خرید (`self.cart`) می‌سازد تا اطمینان حاصل شود که تغییرات بعدی بر روی نسخه اصلی سبد خرید تأثیر نمی‌گذارد.

4. **اضافه کردن اشیاء محصول به آیتم‌های سبد خرید**:
    ```python
    for product in products:
        cart_dict[str(product.id)]['product'] = product
    ```
    - در اینجا، برای هر محصولی که از دیتابیس واکشی شده است، شیء محصول مربوطه به آیتم سبد خرید در `cart_dict` اضافه می‌شود. این به شما این امکان را می‌دهد که دسترسی مستقیم به اشیاء محصول (به جای فقط شناسه‌های آن‌ها) در سبد خرید داشته باشید.
    - این کار با استفاده از شناسه محصول به عنوان کلید و شیء محصول به عنوان مقدار در دیکشنری انجام می‌شود.

5. **حلقه تکرار روی آیتم‌های سبد خرید و بازگرداندن آن‌ها**:
    ```python
    for item in cart_dict.values():
        yield item
    ```
    - این قسمت از کد، از `yield` برای بازگرداندن هر آیتم سبد خرید استفاده می‌کند. متد `yield` به جای بازگرداندن همه آیتم‌ها به صورت یکباره، یکی یکی آیتم‌ها را بازمی‌گرداند که این کار باعث می‌شود که متد `__iter__` یک generator شود.
    - `cart_dict.values()` تمام مقادیر دیکشنری `cart_dict` را بازمی‌گرداند که شامل اطلاعات محصولات همراه با اشیاء محصول می‌باشد.

**کل کد در یک نگاه:**

`app directory(cart)/cart.py`

```python
from shop.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')

        if not cart:
            cart = self.session['cart'] = {}

        self.cart = cart

    # ———————————————————————— افزودن به سبد خرید ——————————————————————— #
    def add(self, product):
        product_id = str(product.id)
        if product_id not in self.cart:
            self.cart[product_id] = {'quantity': 1, 'price': product.new_price, 'weight': product.weight}
        else:
            if self.cart[product_id]['quantity'] < product.inventory:
                self.cart[product_id]['quantity'] += 1

        self.save() 

    # ———————————————————— کاهش تعداد کالا از سبد خرید ——————————————————— #
    def decrease(self, product):
        product_id = str(product.id)
        if self.cart[product_id]['quantity'] > 1:
            self.cart[product_id]['quantity'] -= 1

            self.save()

    # ——————————————————— حذف یک محصول از سبد خرید ——————————————————— #
    def delete(self, product):
        product_id = str(product.id)
        if product_id in self.cart:
            del self.cart[product_id]

            self.save()  

    # ——————————————— پاکسازی سبد خرید(حذف تمام محصولات) ——————————————— #
    def clear(self):
        del self.session['cart']
        self.save()   

    # ——————————————————————— محاسبه هزینه پستی ——————————————————————— #
    def get_post_price(self):
        total_weight = sum(item['weight'] * item['quantity'] for item in self.cart.values())

        if total_weight == 0:
            return 0
        elif total_weight < 1000:
            return 20000
        elif 1000 < total_weight < 2000:
            return 30000
        else:
            return 50000   

    # ————————————————————— محاسبه هزینه کل محصولات ————————————————————— #
    def get_total_price(self):
        total_price = sum(item['price'] * item['quantity'] for item in self.cart.values())
        return total_price 

    # ——————————————————— محاسبه هزینه نهایی سبد خرید ——————————————————— #
    def get_final_price(self):
        final_price = self.get_total_price() + self.get_post_price()
        return final_price

    # ————————————————————— مجموع تعداد کل محصولات —————————————————————— #
    def __len__(self):
        return sum(item['quantity'] for item in self.cart.values())   

    # ——————————————————————————— iteration ———————————————————————————— #
    def __iter__(self):
        product_ids = list(self.cart.keys())
        products = Product.objects.filter(id__in=product_ids)
        cart_dict = self.cart.copy()

        for product in products:
            cart_dict[str(product.id)]['product'] = product

        for item in cart_dict.values():
            yield item                                                       

    # —————————————————————————————————————————————————————————————————— #
    def save(self):
        self.session.modified = True
```

### کار با context processor

در view ها بارها، متغیرها را از طریق context که یک دیکشنری میباشد به تمپلیت ارسال کرده و از آنها استفاده کرده ایم. (به عنوان template variable)

بعضی وقت ها در تمپلیت از یکسری متغیرها استفاده کردیم که از سمت view ارسال نشده اند، مثل request یا csrf_token پس از کجا آمده اند؟! اینها context processor هستند.

context processor در setting پروژه تعریف شده اند و در تمام تمپلیت ها در دسترس میباشند.

> در قسمت TEMPLATES و در بخش OPTIONS، یک کلید(key) بنام context_processors وجود دارد و برای مقدار(value) آن یک لیست شامل یکسری مقادیر قرار دارد که آن مقادیر همان context processor ها میباشند.

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
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```

شاید به یک متغیر نیاز داشته باشیم که در همه تمپلیت ها در دسترس باشد ولی از طریق view ارسال نشود در این زمان ها از context processor استفاده میکنیم.

> اگر به چیزی احتیاج داشته باشیم که فقط در برخی از تمپلیت ها نیاز باشد، میتوان از تمپلیت تگ سفارشی استفاده کرد.

**context processor:** یک تابع(function) هست که request را به عنوان آرگومان میگیرد و یک دیکشنری برمیگرداند(return میکند).

**ایجاد context processor:**

> میخواهیم برای اطلاعات سبد خرید یک context processor ایجاد کنیم.

در اپ(app) cart، یک فایل پایتونی بنام context_processors.py ایجاد میکنیم؛ حالا داخل آن یک تابع تعریف کرده که request را به عنوان آرگومان گرفته و یک دیکشنری برمیگرداند.

کلید (key) این دیکشنری همان اسم متغیر هست که در تمپلیت از آن استفاده میکنیم؛ مقدار آن چیزی است که میخواهیم از آن استفاده کنیم.

> در اینجا یک آبجکت از کلاس Cart که request را به عنوان آرگومان میگیرد  را برای مقدار متغیر ست میکنیم.

`app directory(cart)/context_processors.py`

```python
from .cart import Cart


def cart_context(request):
    return {'cart': Cart(request)}
```

**توضیحات:**

کلاس Cart که در فایل پایتونی cart.py قرار دارد را ایمپورت میکنیم.

برای context processor مدنظر، یک تابع ایجاد میکنیم که request را به عنوان آرگومان میگیرد.

حالا باید یک دیکشنری را return کند؛ به عنوان کلید cart را مشخص میکنیم(از آن در تمپلیت استفاده میکنیم)، و به عنوان value یک آبجکت از کلاس Cart ایجاد کرده و request را برایش مشخص میکنیم.

> request برای آبجکت cart الزامیه؛ چرا؟! چون برای دسترسی به سشن به آن احتیاج داریم.

**معرفی context processor به پروژه:**

در settings.py در قسمت TEMPLATES و بخش OPTIONS رفته و context processor شخصی سازی شده را به لیست context_processors اضافه میکنیم.

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
                # structure:
                'app_name.python_file.function_name'
                'cart.context_processors.cart_context'
            ],
        },
    },
]
```

**نمایش اطلاعات سبد خرید در header.html:**

header در base بارگذاری میشود پس در تمام صفحات قابل مشاهده است.

در تمپلیت header که در اپ shop میباشد این کار را انجام میدهیم.

`shop app/templates/partials/header.html`

```jinja
<div class="cart-container">
    {% with item_count=cart|length %}
        <a href="#" class="cart-link">
            <div class="cart-info-container">
                <span class="cart-icon">🛒</span>

                <span class="cart-info">
                    <span class="item-count">{{ item_count }}</span> item's, <span class="total-price">
                    {{ cart.get_total_price }}T</span>
                </span>
            </div>
        </a>
    {% endwith %}
</div>
```

### افزودن آیتم به سبد خرید با Ajax

برای اپ cart فایل urls.py را ایجاد میکنیم.(برای ایجاد url های  اپ cart)

`app directory(cart)/urls.py`

```python
from django.urls import path
from . import views


app_name = 'cart'

urlpatterns = []
```

حالا باید آنرا به پروژه خود معرفی کنیم، تا url های آن اجرا شوند:

`project directory/urls.py`

```python
urlpatterns = [
    # ...
    path('cart/', include('cart.urls', namespace='cart')),
]
```

> حالا هر url که در فایل urls.py اپ cart ایجاد کنیم؛ برای اجرا شدن آن باید قبلش عبارت <span class="en-text">cart/</span> قرار بگیره.
>
> > <span class="en-text">cart/URL</span>

**ایجاد url برای دکمه افزودن به سبد خرید:**

`app directory(cart)/urls.py`

```python
urlpatterns = [
    path('add/<int:product_id>', views.add_to_cart, name='add_to_cart'),
]
```

**ایجاد view برای دکمه افزودن به سبد خرید:**

یکسری کتابخانه مورد نیاز مثله (render, get_object_or_404), (require_POST), (JsonResponse) را ایمپورت میکنیم.

مدل Product (از اپ shop) و کلاس Cart (از همین اپ(cart)) را هم ایمپورت میکنیم.

> کلاس Cart در فایل cart.py قرار دارد.

`app directory(cart)/views.py`

```python
from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_POST
from django.http import JsonResponse

from shop.models import Product
from .cart import Cart


# Create your views here.
@require_POST
def add_to_cart(request, product_id):
    try:
        product = get_object_or_404(Product, id=product_id)
        cart = Cart(request)

        cart.add(product)

        context = {
            'item_count': len(cart),
            'total_price': cart.get_total_price(),
        }

        return JsonResponse(context)

    except:
        return JsonResponse({"error": "Something went wrong"})
```

**توضیحات:**

1- برای view از دکوراتور require_POST استفاده میکنیم چون متد ajax باید از نوع POST باشد. / با این دکوراتور آنرا الزام میکنیم.

2- در url متغیر product_id را مشخص کرده ایم پس باید آنرا به عنوان آرگومان تابع در کنار request دریافت کنیم.

3- با استفاده از product_id محصول مربوطه را از دیتابیس دریافت میکنیم و آنرا در یک متغیر ذخیره میکنیم. | یک آبجکت هم از کلاس Cart ایجاد میکنیم.

4- حالا برای آبجکت cart، با استفاده از متد <span class="en-text">add()</span> محصول را به سبد خرید در سشن اضافه میکنیم.

5- تعداد کل محصولات(آیتم های سبد خرید) و هزینه کل سبد خرید را به صورت json به تمپلیت ارسال میکنیم.(در ajax استفاده میشوند.)

> برای کلاس Cart متد \_\_len\_\_ را override کردیم که تعداد محصولات را باهم جمع کند و آن مجموع را return کند برای همین وقتی از تابع <span class="en-text">len()</span> استفاده کنیم تعداد کل محصولات را برمیگرداند.

برای جلوگیری از استثناهای ممکن این ساختارها را در try, except قرار میدهیم.

> اطلاعات سبد خرید که در header نوشتیم باید (با افزودن کالا به سبد خرید) باید آپدیت شوند؛ با همین مقادیری که در context ارسال میکنیم آنها را آپدیت میکنیم.

**ایجاد دکمه افزودن کالا به سبد خرید و ajax آن، در تمپلیت جزئیات محصول:**

در تمپلیت جزئیات محصول در اپ shop، دکمه افزودن کالا به سبد خرید را اضافه کرده و ajax آنرا هم ایجاد میکنیم تا با افزودن کالا اطلاعات سبد خرید آپدیت شوند.

`app(shop)/templates/shop/product_detail.html`

```jinja
{% extends 'parent/base/base_template.html' %}
{% load static %}

{% block title %}{{ product.name }}{% endblock %}

{% block head %}<link rel="stylesheet" href="{% static 'CSS/product-detail.css' %}">{% endblock %}


{% block content %}
    <div class="heading-text">
        <h1>جزئیات محصول</h1>
    </div>


    <div class="product-detail">
        <h2>{{ product.name }}</h2>
        <p>دسته بندی: {{ product.category }}</p>
        <p>موجودی: {{ product.inventory }}</p>
        <ul>
            {% for feature in product.features.all %}
                <li>{{ feature.name }}: {{ feature.value }}</li>
            {% endfor %}
        </ul>

        <div class="price">
            <span class="original-price">قیمت: {{ product.price }}</span>
            <br>
            {% if product.offers %}
                <span class="discounted-price">قیمت پس از تخفیف: {{ product.new_price }}</span>
            {% endif %}
        </div>
    </div>
    
    <button id="add-cart" type="button">افزودن به سبد خرید</button>

    <div class="product-images">
        {% for image in product.images.all %}
            <img src="{{ image.image_file.url }}" alt="{{ image.title }}">
        {% endfor %}
    </div>

    <div class="product-description">
        <h3>description</h3>
        <p>{{ product.description }}</p>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <script>
        $(document).ready(function (){
            $('#add-cart').click(function (){
                $.ajax({
                    type: 'POST',
                    url: '{% url 'cart:add_to_cart' product.id %}',
                    data: {'csrfmiddlewaretoken': '{{ csrf_token }}'},
                    success: function (response){
                        $('.item-count').text(response.item_count);
                        $('.total-price').text(response.total_price);
                    },
                })
            })
        })
    </script>
{% endblock %}
```

**توضیحات:**

1- یک دکمه برای افزودن به سبد خرید ایجاد میکنیم و یک id برای آن مشخص میکنیم.

2- حالا برای jquery مشخص میکنیم، که وقتی رو دکمه کلیک شد ajax عمل کند.

**type:** نوع متد را POST مشخص میکنیم.

**url:** url که برای (دکمه افزودن کالا به سبد خرید) ایجاد کردیم را برایش مشخص میکنیم، همچنین آیدی محصول فعلی.

**data:** برای امنیت csrf_token  را برای آن مشخص میکنیم.

برای تابع success؛ تعداد کل کالا ها و قیمت کل سبد خرید که در header هستند را آپدیت میکنیم.

### تمپلیت سبد خرید

میخواهیم تمپلیت سبد خرید را جهت نمایش (محصولات سفارش داده شده، تعداد و قیمت هر محصول، مجموع هزینه ها و..) ایجاد کنیم.

**ایجاد url برای تمپلیت سبد خرید:**

`app directory(cart)/urls.py`

```python
urlpatterns = [
    # ...
    path('detail', views.cart_detail, name='cart_detail'),
]
```

> در تمپلیت header که اطلاعات سبد خرید را نشان میدهیم یک لینک برای رفتن به صفحه سبد خرید ایجاد کردیم، حالا باید برای href آن این url بالا را مشخص کنیم.

**ایجاد view برای تمپلیت سبد خرید:**

`app directory(cart)/views.py`

```python
def cart_detail(request):
    cart = Cart(request)

    return render(request, "cart/cart_detail.html", context={"cart": cart})
```

**توضیحات:**

برای نمایش اطلاعات سبد خرید در تمپلیت؛ یک آبجکت از کلاس Cart ایجاد کرده و آنرا به تمپلیت سبد خرید ارسال میکنیم.

> از آبجکت cart برای مدیریت سبد خرید استفاده میکنیم.

**ایجاد templates:**

در دایرکتوری اپ cart یک دایرکتوری بنام templates ایجاد میکنیم؛ حالا داخل آن یک دایرکتوری دیگه بنام cart ایجاد کرده و در آن تمپلیت cart_detail.html را میسازیم.

**ایجاد تمپلیت سبد خرید:**

`app (cart)/templates/cart/cart_detail.html`

```jinja
{% extends 'parent/base/base_template.html' %}
{% load static %}

{% block title %}Cart{% endblock %}

{% block content %}
    <div class="header">
        <h1>سبد خرید</h1>
    </div>

    <div class="cart-content">
        {% for item in cart %}
            {# item = product-info(dictionary) #}
            {% with product=item.product %}
                <div class="product-item">
                    <a href="{% url 'shop:product_detail' product.id product.slug %}">
                        <img src="{{ product.images.first.image_file.url }}" alt="{{ product.images.first.image_file }}" width="225px">
                    </a>

                    <div class="product-info">
                        <h3>
                            <a href="{% url 'shop:product_detail' product.id product.slug %}">
                                نام محصول: {{ product.name }}
                            </a>
                        </h3>

                        <p>تعداد: <span class="quantity">{{ item.quantity }}</span></p>
                        <p>قیمت: <span class="price">{{ item.price }}</span></p>
                        <p>مجموع قیمت: <span class="product-total-price">{{ item.total }}</span></p>
                    </div>

                    <div class="actions">
                        <button class="quantity-decrease">-</button>
                        <button class="quantity-add">+</button>
                        <span class="delete">🗑️</span>
                    </div>
                </div>
            {% endwith %}

            {% if not forloop.last %}
                <hr>
            {% endif %}

        {% empty %}
            cart is empty!
        {% endfor %}

        <div class="cart-total-price">
            <p>قیمت کل محصولات: <span id="total-price">{{ cart.get_total_price }}</span> تومان</p>
            <p>هزینه پستی: <span class="post-price">{{ cart.get_post_price }}</span> تومان</p>
            <p>هزینه نهایی: <span class="final-price">{{ cart.get_final_price }}</span> تومان</p>
        </div>

        <div class="checkout-button">
            <div class="continue-btn"><a href="#">ادامه خرید</a></div>
            <div class="back-btn"><a href="{% url "shop:products-list" %}">برگشت به لیست محصولات</a></div>
        </div>
    </div>
{% endblock %}
```

**توضیحات:**

1- در اینجا هم از همان تمپلیت پایه موجود در اپ shop استفاده میکنیم؛ لازم نیست یک تمپلیت پایه دیگر در این اپ بسازیم.

2- فایل های static را لود کرده، یک عنوان برای این صفحه مشخص میکنم.

3- یک div برای محتوای  سبد خرید ایجاد کرده و در آن روی آبجکت cart که از view ارسال شده حلقه میزنیم.

> روی آبجکت cart میتوانیم حلقه بزنیم، چون برای کلاس Cart متد \_\_iter\_\_ ست کرده ایم.
>
> و در آن مشخص کردیم که در هر iteration(پیمایش روی حلقه)، اطلاعات یک محصول را برگرداند(تعداد محصول، قیمت محصول، وزن، آبجکت آن محصول(product)، مجموع قیمت آن کالا با توجه به تعدادش) / و اینکه این اطلاعات در دیکشنری هستند پس item یک دیکشنری شامل اطلاعات محصول میباشد.

4- برای id محصول، slug محصول و... به آبجکت product که در item میباشد؛ نیاز داریم ولی برای اینکه هربار آنرا از دیکشنری دریافت نکنیم از تمپلیت تگ with استفاده کرده و آنرا در یک متغیر ذخیره میکنیم، حالا هرجا به آبجکت product نیاز داشتیم از این متغیر استفاده میکنیم.

> **نکته مهم:** در تمپلیت برای اینکه به مقدار یک کلید از دیکشنری دسترسی داشته باشیم از (.) بجای [] استفاده میکنیم

```pyhon
item = {'product': 'Laptop'}
```

|      python     |   template   |   EXPORT  |
|:---------------:|:------------:|   :----:  |
| item['product'] | item.product | => laptop |

5- در بدنه حلقه for، یک div برای نمایش محصول ثبت شده؛ (مثله نام محصول، تصویر محصول، تعداد و قیمت محصول و...) ایجاد میکنیم.

- تصویر محصول را در تگ a قرار داده و آنرا به صفحه جزئیات محصول هدایت میکنیم تا با کلیک روی تصویر به صفحه آن محصول برود. / id و slug محصول را برای url آن مشخص میکنیم.
    > برای نمایش تصویر ، از اولین عکس محصول استفاده میکنیم.

- برای نام محصول هم این لینک را ایجاد میکنیم.

- نام محصول، تعداد، قیمت و مجموع قیمت را در یک تگ div قرار میدهیم.

    > برای مجموع قیمت هر محصول در فایل cart.py در متد \_\_iter\_\_ یک کلید بنام total  و مقدار مجموع قیمت کالا را برای هر محصول اضافه میکنیم.

`app directory(cart)/cart.py`

```python
def __iter__(self):
    product_ids = list(self.cart.keys())
    products = Product.objects.filter(id__in=product_ids)
    cart_dict = self.cart.copy()

    for product in products:
        cart_dict[str(product.id)]['product'] = product

    for item in cart_dict.values():
        item['total'] = item['price'] * item['quantity']
        yield item                                              
```

- در یک تگ آیکون های + (افزایش تعداد)، - (کاهش تعداد) و 🗑️ (حذف محصول) را قرار میدهیم.

> برای زمانی که سبد خرید خالیست هم متن "cart is empty" را نشان میدهیم.

6- بیرون از حلقه for، یک تگ ایجاد کرده و هزینه کل سبد خرید، هزینه پستی و مبلغ قابل پرداخت(مجموع هزینه کل و هزینه پستی) را در آن مینویسیم.

7- یک دکمه برای ادامه خرید و یک دکمه برای برگشت به لیست محصولات اضافه میکنیم.

### کلید افزایش و کاهش سبد خرید با Ajax

**ایجاد url برای تغییر تعداد کالا:**

برای عملکرد دکمه های افزایش(+) و کاهش(-) تعداد کالا یک url ایجاد میکنیم.

`app directory(cart)/urls.py`

```python
urlpatterns = [
    # ...
    path('update-quantity', views.update_quantity, name='update_quantity'),
]
```

**بریم سراغ ajax دکمه های افزایش و کاهش محصول:**

`app(cart)/templates/cart/cart_detail.html`

```jinja
{% extends 'parent/base/base_template.html' %}
{% load static %}

{% block title %}products{% endblock %}

{% block content %}
    <div class="header">
        <h1>سبد خرید</h1>
    </div>

    <div class="cart-content">
        {% for item in cart %}
            {# item = product-info(dictionary) #}
            {% with product=item.product %}
                <div class="product-item" data-item-id="{{ product.id }}">
                    <a href="{% url 'shop:product_detail' product.id product.slug %}">
                        <img src="{{ product.images.first.image_file.url }}" alt="{{ product.images.first.image_file }}" width="225px">
                    </a>

                    <div class="product-info">
                        <h3>
                            <a href="{% url 'shop:product_detail' product.id product.slug %}">
                                نام محصول: {{ product.name }}
                            </a>
                        </h3>

                        <p>تعداد: <span class="quantity" id="quantity-{{ product.id }}">{{ item.quantity }}</span></p>
                        <p>قیمت: <span class="price">{{ item.price }}</span></p>
                        <p>مجموع قیمت: <span class="product-total-price" id="product-price-{{ product.id }}">{{ item.total }}</span></p>
                    </div>

                    <div class="actions">
                        <button class="quantity-decrease">-</button>
                        <button class="quantity-add">+</button>
                        <span class="delete">🗑️</span>
                    </div>
                </div>
            {% endwith %}
            {% if not forloop.last %}
                <hr>
            {% endif %}
        {% empty %}
            cart is empty!
        {% endfor %}

        <div class="cart-total-price">
            <p>قیمت کل محصولات: <span id="total-price">{{ cart.get_total_price }}</span> تومان</p>
            <p>هزینه پستی: <span class="post-price">{{ cart.get_post_price }}</span> تومان</p>
            <p>هزینه نهایی: <span class="final-price">{{ cart.get_final_price }}</span> تومان</p>
        </div>

        <div class="checkout-button">
            <div class="continue-btn"><a href="#">ادامه خرید</a></div>
            <div class="back-btn"><a href="{% url "shop:products-list" %}">برگشت به لیست محصولات</a></div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <script>
        $(document).ready(function (){
            $('.quantity-add').click(function (){
                updateQuantity('add', $(this).closest('.product-item').data('item-id'));
            });

            $('.quantity-decrease').click(function (){
                updateQuantity('decrease', $(this).closest('.product-item').data('item-id'));
            });

            {# ——————————————————————————— update-quantity function ——————————————————————————— #}
            function updateQuantity(action, productId) {
                $.ajax({
                    type: 'POST',
                    url: '{% url 'cart:update_quantity' %}',
                    data: {
                        'csrfmiddlewaretoken': '{{ csrf_token }}',
                        'action': action,
                        'product_id': productId,
                    },

                    success: function (response){
                        if(response.success){
                            {# بخش بالایی(header) #}
                            $('.item-count').text(response.item_count);
                            $('.total-price').text(response.total_price);
                            {# تعداد و مجموع قیمت کالا #}
                            $('#quantity-' + productId).text(response.quantity);
                            $('#product-price-' + productId).text(response.product_cost);
                            {# قیمت کل محصولات، هزینه پستی و هزینه نهایی محصولات #}
                            $('#total-price').text(response.total_price);
                            $('.post-price').text(response.post_price);
                            $('.final-price').text(response.final_price);

                        }else{
                            alert("Error update quantity!!!");
                        }
                    }
                });
            }
        });
    </script>
{% endblock %}
```

**توضیحات:**

1- اسکریپت ajax-jquery را به تمپلیت اضاف میکنیم.

**نکته:** محصولات را با حلقه نمایش میدهیم پس با هربار تکرار حلقه یک آیتم(اطلاعات محصول) تکرار میشود، حالا نکته این هست که وقتی روی + و یا - میزنیم باید مشخص شود که مربوط به کدام محصول میباشد بنابراین با کلیک روی هرکدام از این دکمه ها id محصول را نیز از طریق ajax به view ارسال میکنیم.

> برای ارسال داده به ajax از اتریبیوت **<span class="en-text">data-*</span>** استفاده میکنیم. / آنرا برای div پرنت مشخص میکنیم و آیدی محصول را برایش تعیین میکنیم.

**برای span های تعداد و مجموع قیمت هر محصول، باید id منحصر به فرد مشخص کنیم؛ برای همین از "آیدی آن محصول" در اتریبیوت id استفاده میکنیم.**

2- حالا مشخص میکنیم که هروقت روی دکمه + و یا - کلیک شد یک تابع(function) بنام updateQuantity صدا زده شود.

> تابع updateQuantity برای هردو مشترک هست؛ این تابع دو ورودی میگیرد، یکی product_id و دیگری وضعیت آن دکمه(add or decrease)
>
> <span class="rtl-text">آیدی محصول را از اتریبیوت <span class="en-text">data-item-id</span> دریافت میکنیم.</span>

3- ساختار ajax را داخل بدنه تابع updateQuantity پیاده سازی میکینم.

- **type:** POST.

- **url:** url، آپدیت تعداد محصول را برایش مشخص میکنیم.

- **data:** وضعیت دکمه(add, decrease) و آیدی محصول را به view ارسال میکنیم.

4- **success:** با استفاده از مقادیر دریافت شده از view موارد مربوطه را آپدیت میکنیم.(تعداد کل محصولات، قیمت کل محصولات، تعداد هر محصول، مجموع قیمت هر محصول با توجه به تعداد آن، مبلغ قابل پرداخت)

> برای مشخص کردن آیدی محصول، در بخش success؛ از آرگومان productId که برای تابع updateQuantity مشخص کرده ایم استفاده میکنیم.

**ایجاد view برای تغییر تعداد کالا:**

`app directory(cart)/views.py`

```python
@require_POST
def update_quantity(request):
    action = request.POST['action']
    product_id = request.POST['product_id']

    try:
        product = get_object_or_404(Product, id=product_id)
        cart = Cart(request)

        if action == "add":
            cart.add(product)
        elif action == "decrease":
            cart.decrease(product)

        product_cost = cart.cart[product_id]['quantity'] * cart.cart[product_id]['price']

        context = {
            "success": True,
            'item_count': len(cart),
            'total_price': cart.get_total_price(),
            'quantity': cart.cart[product_id]['quantity'],
            'product_cost': product_cost,
            'post_price': cart.get_post_price(),
            'final_price': cart.get_final_price(),
        }

        return JsonResponse(context)

    except:
        return JsonResponse({"success": False, "error": "Something went wrong: product not found!"})
```

**توضیحات:**

1- متد ajax باید POST باشد بنابراین برای الزام کردن view از دکوراتور require_POST استفاده میکنیم.

2- action (وضعیت دکمه) و product_id را از تمپلیت دریافت کرده و در متغیر ذخیره میکینم.

3- با استفاده از آیدی دریافت شده؛ محصول را از دیتابیس دریافت میکنیم.

4- یک آبجکت از کلاس Cart ایجاد کرده و request را برایش مشخص میکنیم.

5- حالا یک شرط مشخص میکنیم، که اگر وضعیت دکمه add هست متد <span class="en-text">add()</span> و چنانچه وضعیت دکمه decrease هست متد <span class="en-text">decrease()</span> را برای آبجکت cart صدا زده و product را برایش مشخص میکنیم.

6- برای متغیر product_cost مجموع قیمت یک کالا را مشخص میکنیم.

7- مواردی را که در تمپلیت آپدیت میشوند را محاسبه کرده و به صورت json به تمپلیت ارسال میکنیم.

> "success", item_count(تعداد کالاهای سبد خرید), total_price(هزینه کل سبد خرید), quantity(تعداد یک محصول), product_cost(مجموع قیمت یک کالا), post_price(هزینه پستی), final_price(مبلغ قابل پرداخت)

8- با استفاده از <span class="en-text">JsonResponse()</span> مقادیر را به ajax ارسال میکنیم.

### کلید حذف از سبد خرید با Ajax

**برای دکمه حذف کالا از سبد خرید، یک url و view جدید ایجاد میکنیم.**

**ایجاد url برای دکمه حذف کالا:**

`app directory(cart)/urls.py`

```python
urlpatterns = [
    # ...
    path('delete-product', views.delete_product, name='delete_product'),
]
```

**ایجاد view برای دکمه حذف کالا:**

برای **دکمه حذف** هم آیدی محصول(product_id) را با استفاده از ajax به view ارسال میکنیم.

`app directory(cart)/views.py`

```python
def delete_product(request):
    product_id = request.POST['product_id']

    try:
        product = get_object_or_404(Product, id=product_id)
        cart = Cart(request)

        cart.delete(product)

        context = {
            "success": True,
            'item_count': len(cart),
            'total_price': cart.get_total_price(),
            'post_price': cart.get_post_price(),
            'final_price': cart.get_final_price(),
        }

        return JsonResponse(context)

    except:
        return JsonResponse({"success": False, "error": "Something went wrong: product not found!"})
```

**توضیحات:**

1- با استفاده از آیدی دریافت شده؛ محصول را از دیتابیس دریافت میکنیم.

2- یک آبجکت از کلاس Cart ایجاد کرده و request را برایش مشخص میکنیم.

3- متد <span class="en-text">delete()</span> را برای آبجکت cart صدا میزنیم، تا آن محصول را از سشن پاک کند.

4- (تعداد کل محصولات در سبد خرید، مجموع قیمت محصولات، هزینه پستی و مبلغ قابل پرداخت) را به صورت json به ajax ارسال میکنیم تا این موارد را در تمپلیت آپدیت کند. / "success": True را هم برای شرطی که گذاشتیم ارسال میکنیم.

> با استفاده از JsonResponse() مقادیر را به ajax ارسال میکنیم.

**بریم سراغ ajax دکمه حذف محصول:**

برای درک راحت ابتدا فقط ساختار ajax را نمایش میدهیم و سپس کل کدهای تمپلیت نشان داده خواهند شد.

`app(cart)/templates/cart/cart_detail.html`

```jinja
<script>
        $(document).ready(function (){
            $('.quantity-add').click(function (){
                updateQuantity('add', $(this).closest('.product-item').data('item-id'));
            });

            $('.quantity-decrease').click(function (){
                updateQuantity('decrease', $(this).closest('.product-item').data('item-id'));
            });

            $('.delete').click(function (){
                deleteProduct($(this).closest('.product-item').data('item-id'));
            });

            {# ——————————————————————————— update-quantity function ——————————————————————————— #}
            function updateQuantity(action, productId) {
                $.ajax({
                    type: 'POST',
                    url: '{% url 'cart:update_quantity' %}',
                    data: {
                        'csrfmiddlewaretoken': '{{ csrf_token }}',
                        'action': action,
                        'product_id': productId,
                    },

                    success: function (response){
                        if(response.success){
                            {# بخش بالایی(header) #}
                            $('.item-count').text(response.item_count);
                            $('.total-price').text(response.total_price);
                            {# تعداد و مجموع قیمت کالا #}
                            $('#quantity-' + productId).text(response.quantity);
                            $('#product-price-' + productId).text(response.product_cost);
                            {# قیمت کل محصولات، هزینه پستی و هزینه نهایی محصولات #}
                            $('#total-price').text(response.total_price);
                            $('.post-price').text(response.post_price);
                            $('.final-price').text(response.final_price);

                        }else{
                            alert("Error update quantity!!!");
                        }
                    }
                });
            }
            {# ——————————————————————————— delete-product function ——————————————————————————— #}
            function deleteProduct(productId) {
                $.ajax({
                    type: 'POST',
                    url: '{% url 'cart:delete_product' %}',
                    data: {
                        'csrfmiddlewaretoken': '{{ csrf_token }}',
                        'product_id': productId,
                    },

                    success: function (response){
                        if(response.success){
                            {# بخش بالایی(header) #}
                            $('.item-count').text(response.item_count);
                            $('.total-price').text(response.total_price);
                            {# قیمت کل محصولات، هزینه پستی و هزینه نهایی محصولات #}
                            $('#total-price').text(response.total_price);
                            $('.post-price').text(response.post_price);
                            $('.final-price').text(response.final_price);
                            {# حذف کالا از سبد خرید #}
                            $(`.product-item[data-item-id=${ productId }]`).remove();
                        }else{
                            alert("Error update quantity!!!");
                        }
                    }
                });
            }

        });
    </script>
```

**توضیحات:**

1- برای عملکرد دکمه حذف در script یک تابع ایجاد میکنیم. / این تابع آیدی محصول را به عوان آرگومان دریافت میکنه.

2- ساختار ajax در این تابع پیاده سازی میشود.

- **type:** متد ajax را از نوع POST مشخص میکنیم.

- **url:** آدرس حذف محصول  را برای آن مشخص میکنیم.

- **data:** آیدی محصول(product_id) و csrf_token را به view ارسال میکنیم.

3- برای تابع success: (تعداد کل محصولات، مجموع قیمت کالا ها، هزینه پستی و مبلغ قابل پرداخت) را از view دریافت کرده و  پس از حذف محصول آنها را آپدیت میکنیم.

**نکته:** هر محصول و اطلاعات آن در div با کلاس **product-item** قرار دارد؛ پس باید آن div  حذف شود. / چندین div با آن کلاس وجود دارد ولی باید آن div که مقدار اتریبیوت **data-item-id** اش، برابر با آرگومان مشخص شده در تابع هست پاک شود.

> <span class="rtl-text">با متد <span class="en-text">remove()</span> در جاوااسکریپت (ajax) آن div را حذف میکنیم.</span>

**تمپلیت سبد خرید در یک نگاه:**

`app(cart)/templates/cart/cart_detail.html`

```jinja
{% extends 'parent/base/base_template.html' %}
{% load static %}

{% block title %}products{% endblock %}

{% block content %}
    <div class="header">
        <h1>سبد خرید</h1>
    </div>

    <div class="cart-content">
        {% for item in cart %}
            {# item = product-info(dictionary) #}
            {% with product=item.product %}
                <div class="product-item" data-item-id="{{ product.id }}">
                    <a href="{% url 'shop:product_detail' product.id product.slug %}">
                        <img src="{{ product.images.first.image_file.url }}" alt="
                            {{ product.images.first.image_file }}" width="225px">
                    </a>

                    <div class="product-info">
                        <h3>
                            <a href="{% url 'shop:product_detail' product.id product.slug %}">
                                نام محصول: {{ product.name }}
                            </a>
                        </h3>

                        <p>تعداد: <span class="quantity" id="quantity-{{ product.id }}">{{ item.quantity }}</span></p>
                        <p>قیمت: <span class="price">{{ item.price }}</span></p>
                        <p>مجموع قیمت: <span class="product-total-price" id="product-price-{{ product.id }}">
                            {{ item.total }}</span></p>
                    </div>

                    <div class="actions">
                        <button class="quantity-decrease">-</button>
                        <button class="quantity-add">+</button>
                        <span class="delete">🗑️</span>
                    </div>
                </div>
            {% endwith %}
            {% if not forloop.last %}
                <hr>
            {% endif %}
        {% empty %}
            cart is empty!
        {% endfor %}

        <div class="cart-total-price">
            <p>قیمت کل محصولات: <span id="total-price">{{ cart.get_total_price }}</span> تومان</p>
            <p>هزینه پستی: <span class="post-price">{{ cart.get_post_price }}</span> تومان</p>
            <p>هزینه نهایی: <span class="final-price">{{ cart.get_final_price }}</span> تومان</p>
        </div>

        <div class="checkout-button">
            <div class="continue-btn"><a href="#">ادامه خرید</a></div>
            <div class="back-btn"><a href="{% url "shop:products-list" %}">برگشت به لیست محصولات</a></div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <script>
        $(document).ready(function (){
            $('.quantity-add').click(function (){
                updateQuantity('add', $(this).closest('.product-item').data('item-id'));
            });

            $('.quantity-decrease').click(function (){
                updateQuantity('decrease', $(this).closest('.product-item').data('item-id'));
            });

            $('.delete').click(function (){
                deleteProduct($(this).closest('.product-item').data('item-id'));
            });

            {# ——————————————————————————— update-quantity function ——————————————————————————— #}
            function updateQuantity(action, productId) {
                $.ajax({
                    type: 'POST',
                    url: '{% url 'cart:update_quantity' %}',
                    data: {
                        'csrfmiddlewaretoken': '{{ csrf_token }}',
                        'action': action,
                        'product_id': productId,
                    },

                    success: function (response){
                        if(response.success){
                            {# بخش بالایی(header) #}
                            $('.item-count').text(response.item_count);
                            $('.total-price').text(response.total_price);
                            {# تعداد و مجموع قیمت کالا #}
                            $('#quantity-' + productId).text(response.quantity);
                            $('#product-price-' + productId).text(response.product_cost);
                            {# قیمت کل محصولات، هزینه پستی و هزینه نهایی محصولات #}
                            $('#total-price').text(response.total_price);
                            $('.post-price').text(response.post_price);
                            $('.final-price').text(response.final_price);

                        }else{
                            alert("Error update quantity!!!");
                        }
                    }
                });
            }
            {# ——————————————————————————— delete-product function ——————————————————————————— #}
            function deleteProduct(productId) {
                $.ajax({
                    type: 'POST',
                    url: '{% url 'cart:delete_product' %}',
                    data: {
                        'csrfmiddlewaretoken': '{{ csrf_token }}',
                        'product_id': productId,
                    },

                    success: function (response){
                        if(response.success){
                            {# بخش بالایی(header) #}
                            $('.item-count').text(response.item_count);
                            $('.total-price').text(response.total_price);
                            {# قیمت کل محصولات، هزینه پستی و هزینه نهایی محصولات #}
                            $('#total-price').text(response.total_price);
                            $('.post-price').text(response.post_price);
                            $('.final-price').text(response.final_price);
                            {# حذف کالا از سبد خرید #}
                            $(`.product-item[data-item-id=${ productId }]`).remove();
                        }else{
                            alert("Error update quantity!!!");
                        }
                    }
                });
            }

        });
    </script>
{% endblock %}
```

### اضافه کردن اپ و مدل های سفارش (Order)

ایجاد اپ و مدل های سفارش برای عملیات ثبت سفارش کاربر در فروشگاه اینترنتی.

**نکته:** سفارش؛ url و مدل های متفاوتی نیاز دارد و ممکن است در آینده بخواهیم آنرا توسعه دهیم، بنابراین برای مدیریت بهتر اینها یک اپ(app) برای سفارش ایجاد میکنیم. / پس از ایجاد اپ آنرا به پروژه معرفی میکنیم.

`terminal`

```terminal
python manage.py startapp orders
```

`project directory/settings.py`

```python
INSTALLED_APPS = [
    # ...
    "orders.apps.OrdersConfig",
]
```

> AppNameConfig(OrdersConfig)؛ اسم کلاسی است که در فایل apps.py واقع در دایرکتوری اپ(app) وجود دارد. به صورت پیشفرض ایجاد میشود.

**ایجاد مدل order(سفارش):**

برای ثبت یک سفارش؛ اطلاعات مربوط به خریدار مثل: نام خریدار(گیرنده سفارش)،  آدرس، شماره تلفن خریدار، کد پستی، شهر و استان، وضعیت پرداخت و تاریخ ثبت سفارش باید مشخص باشد؛ بنابراین آنها را در مدل Order مشخص میکنیم.

`app directory(orders)/models.py`

```python
from django.db import models
from shop.models import Product


# Create your models here.
class Order(models.Model):
    firstname = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    phone = models.CharField(max_length=11)
    address = models.CharField(max_length=250)
    postal_code = models.CharField(max_length=10)
    province = models.CharField(max_length=50)
    city = models.CharField(max_length=50)

    paid = models.BooleanField(default=False)

    created = models.DateTimeField(auto_now_add=True)
    update = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created']
        indexes = [
            models.Index(fields=['-created']),
        ]

    def get_total_cost(self):
        return sum(item.get_cost() for item in self.items.all())

    def get_post_cost(self):
        total_weight = sum(item.get_weight() for item in self.items.all())

        if total_weight == 0:
            return 0
        elif total_weight < 1000:
            return 20000
        elif 1000 < total_weight < 2000:
            return 30000
        else:
            return 50000

    def get_final_cost(self):
        final_price = self.get_total_cost() + self.get_post_cost()
        return final_price

    def __str__(self):
        return f'order: {self.id}'
```

**توضیحات:**

برای این مدل چند متد تعریف میکنیم؛ یکی برای نمایش مجموع قیمت محصولات، یکی برای هزینه پستی و دیگری برای مشخص کردن مبلغ قابل پرداخت سبد خرید.

> هر سفارش شامل یک یا چند محصول (آیتم های سفارش داده شده) میباشد.
>
> بنابراین یک مدل دیگر برای آیتم های سفارشی ایجاد میکنیم؛ که هر آیتم شامل قیمت، وزن و تعداد آن محصول میباشد، همچنین متدهایی که (وزن نهایی و مجموع قیمت کالا) را برحسب تعداد آن محاسبه میکند.

حالا برای محاسبه مجموع قیمت سفارش؛ روی آیتم های آن حلقه میزنیم و برای هر آیتم مجموع قیمت آنرا بدست آورده(با متد <span class="en-text">get_cost()</span> که مربوط به مدل آیتم های سفارش میباشد.) و آنها را در تابع <span class="en-text">sum()</span> جمع میکنیم.

**ایجاد مدل آیتم های سفارش:**

`app directory(orders)/models.py`

```python
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_items')
    # ———————————————— product info ————————————————
    weight = models.PositiveIntegerField(default=0)
    price = models.PositiveIntegerField(default=0)
    quantity = models.PositiveIntegerField(default=1)

    def get_cost(self):
        return self.price * self.quantity

    def get_weight(self):
        return self.weight * self.quantity

    def __str__(self):
        return f'{self.id}'
```

**توضیحات:**

1- باید مشخص شود که این آیتم ها مربوط به کدام سفارش هستند؛ بنابراین یک فیلد بنام order ایجاد کرده و آنرا به مدل Order متصل میکنیم.

2- با فیلد product به مدل Product وصل میکنیم، تا به اطلاعات آن محصول دسترسی داشته باشیم.

3- فیلدهایی برای وزن، قیمت و تعداد آن محصول ایجاد میکنیم.

4- متد <span class="en-text">get_cost()</span> مجموع قیمت آن کالا را با توجه به تعدادش محاسبه میکند.

5- متد <span class="en-text">get_weight()</span> وزن کل آن کالا را با توجه به تعدادش محاسبه میکند.

> پس از تغییرات در مدل باید دستورات makemigrations و migrate را اجرا کنیم.

### نمایش مدل سفارش در پنل ادمین

در فایل admin.py مدل ها و همچنین admin را باید ایمپورت کنیم.

آیتم های سفارش (order_item)، را به صورت inline در مدل ادمین Order نمایش میدهیم.

`app directory(orders)/admin.py`

```python
from django.contrib import admin
from .models import *


class OrdersItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']
    extra = 0


# Register your models here.
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'firstname', 'lastname', 'phone', 'province', 'city', 'paid')
    list_filter = ('paid', 'created', 'update')

    inlines = [OrdersItemInline]
```

**توضیحات:**

1- برای نمایش آیتم های سفارش در مدل ادمین Order؛ لازم است یک کلاس ایجاد کنیم که از StackedInline و یا TabularInline ارث بری میکند. خب حالا مشخص میکنیم که از چه مدلی آنرا ایجاد کند.

> با raw_id_fields مشخص میکنیم که برای انتخاب محصول بجای باز شدن یک منو، محصولات را در یک صفحه دیگر نمایش بدهد تا انتخاب کردن راحت تر باشد.

2- مدل ادمین Order را ایجاد میکنیم. / برای آن list_display و list_filter مشخص میکنیم و با استفاده از inlines آیتم های سفارش را مشخص میکنیم.

> در اینجا آیدی بسیار مهم است چن یجورایی شماره سفارش حساب میشود.

### ایجاد کاربر سفارشی (AbstractBaseUser)

یک اپ برای account ایجاد میکنیم؛ چون در فروشگاه خریدار و فروشنده داریم و حتی برخی مواقع چندین فروشنده داریم برای مدیریت بهتر این حساب ها یک اپ مجزا ایجاد میکنیم.

پس از ایجاد اپ آنرا به پروژه معرفی میکنیم.

***ایجاد مدل User شخصی سازی شده:***

**نکته:** تفاوت این user با سایر user ها در این است که اینجا دیگر username نداریم و از شماره تلفن بجای آن استفاده میکنیم.(چون در فروشگاه ها معولا با شماره تلفن و یا ایمیل وارد میشوند)

\>\>\> برای ایجاد کاربر سفارشی مواردی را باید ایمپورت کنیم.

`app directory(account)/models.py`

```python
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
```

**توضیحات:**

1- **AbstractBaseUser:** کلاس پایه ای هست که برای ساختن یک user شخصی سازی شده استفاده میشود. / در این حالت فقط چند فیلد اصلی مثل password ، date_joined و چند فیلد دیگر وجود دارد

2- **BaseUserManager:** یک کلاس مدیریت کاربر، در جنگو میباشد(کلاس پایه برای ایجاد و مدیریت کاربر هست؛ یکسری متد برای ایجاد کاربر دارد.)

3- **PermissionsMixin:** یک کلاس Mixin میباشد؛ یکسری متد و ویژگی هایی مربوط به دسترسی و مجوز ها را ارائه میدهد.

**ایجاد Manager برای کاربر سفارشی:**

باید دو متد برایش مشخص کنیم، 1- create_user: برای ساخت کاربر عادی استفاده میشود و 2- create_superuser: که برای ایجاد کاربر مدیر استفاده میشود.

`app directory(account)/models.py`

```python
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


# Create your models here.
class ShopUserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError('Users must have phone number')

        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, phone, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone, password, **extra_fields)
```

**توضیحات:**

#### متد <span class="en-text">create_user()</span>:

1- phone را به صورت اجباری دریافت میکنیم، چون بجای username استفاده میشود؛ password و extra_fields را هم دریافت میکنیم.

> **extra_fields یک دیکشنری میباشد و فیلدهای اضافه را در صورت وجود دریافت میکند. / باعث میشود اگر مقادیر اضافی وجود داشت مشکلی نداشته باشد خطا ندهد.

2- phone حتما، باید وجود داشته باشد بنابراین یک شرط مینویسیم که اگر شماره تلفن وجود نداشت یک خطایی را نمایش دهد.

3- برای ایجاد user از دستور <span class="en-text">self.model(phone=phone, **extra_fields)</span> استفاده میکنیم.

> self: یک آبجکت از این کلاس میباشد.
>
> model: مدلی هست که این manager برای آن استفاده میشود. / کاربر سفارشی از این manager استفاده میکند.
>
> phone و  **extra_fields هم برای اطلاعات فیلدهای کاربر استفاده میشوند.

4- با متد <span class="en-text">set_password()</span>؛ password را برای کاربر  به صورت hash شده، ست میکنیم.

5- با متد <span class="en-text">save()</span> تغییرات را ذخیره میکنیم.

> اینجا یک نکته ای هست، باید برای save مشخص کنیم که اینها در کدام دیتابیس ذخیره شوند(چون ممکن است از چند دیتابیس در پروژه استفاده کنیم.)
>
> **using=self._db:** این نشان دهنده این است که از همان دیتابیس فعال پروژه که در setting تعریف کردیم استفاده کن.

6- در پایان user باید return شود.

#### متد <span class="en-text">create_superuser()</span>:

1- پارامترهای آن مشابه با پارامترهای متد create_user میباشد.

**نکته:** متد setdefault، برای دیکشنری استفاده میشود؛ این متد به عنوان آرگومان اول اسم یک کلید را دریافت میکند => حالا اگر آن کلید وجود داشته باشد مقدار آنرا برمیگرداند و چنانچه آن کلید وجود نداشته باشد، مقداری که به عنوان آرگومان دوم مشخص میکنیم را برای آن کلید ست میکند.

> برای متد create_superuser باید از یکسری موارد اطمینان پیدا کنیم که وجود دارند.
>
> برای superuser(کاربر ویژه)، "is_staff" و "is_superuser" الزامی میباشد؛ باید در دیکشنری extra_fields وجود داشته باشد، اگر وجود ندارد باید خودمون برایش ست کنیم.(با متد setdefault برایش ست میکنیم.)

2- برای extra_fields از متد setdefault استفاده میکنیم تا مطمئن شویم که برای is_superuser و is_staff مقدار True ست شده باشد.

> **is_staff:** اجازه میدهد که کاربر به admin site دسترسی داشته باشد.
>
> **is_superuser:** تمام دسترسی و مجوزها را به آن کاربر میدهد.

3- اگر is_superuser و is_staff مشخص نشده باشند با متد setdefault آنها را ست میکنیم ولی اگر تعریف شده باشند باید چک کنیم، چه چیزی برای آن ها ست شده است. / بنابراین شرط میگذاریم که اگر مقادیر آنها True نمیباشد، خطا نشان بده.

4- حالا اگر این مراحل را پشت سر گذاشت؛ میتوانیم superuser را ایجا کنیم؛ برای ایجاد "کاربر ویژه" از متد create_user اسفاده میکنیم و آنرا return میکنیم.

***ایجاد custom user(کاربر سفارشی):***

برای کاربر سفارشی یک کلاس ایجاد میکنیم که از دو کلاس پایه AbstractBaseUser و PermissionsMixin ارث بری میکند.

`app directory(account)/models.py`

```python
class ShopUser(AbstractBaseUser, PermissionsMixin):
    phone = models.CharField(max_length=11, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    address = models.TextField()

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = ShopUserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.phone
```

**توضیحات:**

1- برای آن فیلد phone را مشخص میکنیم که بجای username استفاده میشود.

> چون از phone بجای username استفاده میکنیم، آن باید منحصر به فرد باشد(تکراری نباشد)؛ پس برای آن از آرگومان unique=True استفاده میکنیم.

2- فیلدهای دیگری مثل first_name، last_name و address را نیز برای ان تعریف میکنیم.

3- فیلد is_active را با مقدار پیشفرض True(چون کاربر جدید فعال هست) و فیلد is_staff را با مقدار پیشفرض False(چون همه کاربرها نباید به admin site دسترسی داشته باشند.) ایجاد میکنیم.

4- یک فیلد برای تاریخ پیوستن کاربر(ثبت نام کاربر در سایت) ایجاد میکنیم.(date_joined)

5- کلاس manager که ایجاد کردیم را برایش مشخص میکنیم.

6- دو مقدار دیگر را نیز باید تعریف کنیم،

1) **USERNAME_FIELD:** برایش مشخص میکنیم که کدام فیلد قرار است به عنوان username استفاده شود.

2) **REQUIRED_FIELDS:** یک لیست میباشد، که مشخص میکنیم موقع ایجاد superuser کدام فیلدها اجباری باشند  توسط کاربر باید مشخص شوند.

    > فیلدهای username(phone) و password به صورت پیشفرض، الزامی هستند حالا اگر موارد دیگری را بخواهیم که الزامی باشند آنها را در این لیست اضافه میکنیم.

**خب حالا باید این کاربر سفارشی در تنظیمات به پروژه معرفی شود:**

- یک متغیر بنام AUTH_USER_MODEL ایجاد کرده و مدل کاربر سفارشی را به صورت <span class="en-text">'app_name.Model_name'</span> برایش مشخص میکنیم.

`project directory/settings.py`

```python
AUTH_USER_MODEL = 'account.ShopUser'
```

**نکته:** دستورات makemigrations و migrate را اجرا میکنیم.

اگر از همان ابتدای پروژه، مشخص نکنیم که از چه نوع user استفاده میکنیم، (یعنی قبل از ایجاد کاربر سفارشی  AbstractBaseUser از user دیگری استفاده کرده باشیم)؛ زمان اجرای دستور migrate به خطا میخوریم.

**برای رفع خطا**، در فایل urls.py پروژه و بخش INSTALLED_APPS در تنظیمات پروژه، "اطلاعات admin را کامنت میکنیم"؛ حالا دستور migrate را اجرا میکنیم، سپس آنها را از کامنت خارج کرده و یکبار دیگه دستورات makemigrations و migrate را اجرا میکنیم.

**ایجاد SuperUser:**

`terminal`

```terminal
python manage.py createsuperuser
```

### شخصی سازی فرم ادمین برای کاربر سفارشی

چون مدل User را از AbstractBaseUser ایجاد کرده ایم، باید فرم های ایجاد و ویرایش کاربر را هم شخصی سازی کنیم؛ پس در دایرکتوری اپ account فایل forms.py را برای مدیریت فرم ها ایجاد میکنیم.

- برای شخصی سازی فرم ها UserCreationForm و UserChangeForm را ایمپورت میکنیم. / مدل کاربر سفارشی (ShopUser) را هم ایمپورت میکنیم.

`app directory(account)/forms.py`

```python
from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import ShopUser


class ShopUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = ShopUser
        fields = ('phone', 'first_name', 'last_name', 'address', 'is_active', 'is_staff', 'date_joined', 'is_superuser')


class ShopUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = ShopUser
        fields = ('phone', 'first_name', 'last_name', 'address', 'is_active', 'is_staff', 'date_joined', 'is_superuser')
```

**توضیحات:**

1- دو کلاس ایجاد میکنیم که از UserCreationForm و UserChangeForm ارث بری میکنند.

> یکی از فرم ها مربوط به ایجاد کاربر میباشد(UserCreationForm) و دیگری برای ویرایش اطلاعات یک کاربر میباشد.(UserChangeForm)

2- ساختار هر دو فرم یکسان میباشد؛ در بدنه آنها(فرم ها) یک کلاس Meta ایجاد میکنیم که از Meta کلاسی که ارث بری کرده ایم، ارث بری میکند.

3- داخل بدنه کلاس Meta، مدل کاربر سفارشی و فیلدهایی که میخواهیم در فرم باشند را مشخص میکنیم.

**نمایش مدل ShopUser در پنل ادمین:**

- مدل کاربر سفارشی(ShopUser)، UserAdmin و فرم های ایجاد شده را ایمپورت میکنیم.

`app directory(account)/admin.py`

```python
from django.contrib import admin
from .models import *
from django.contrib.auth.admin import UserAdmin
from .forms import ShopUserCreationForm, ShopUserChangeForm


# Register your models here.
@admin.register(ShopUser)
class ShopUserAdmin(UserAdmin):
    ordering = ['phone']

    add_form = ShopUserCreationForm
    form = ShopUserChangeForm
    model = ShopUser

    list_display = ['phone', 'first_name', 'last_name', 'is_active', 'is_staff']

    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'address')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {'fields': ('phone', 'password1', 'password2')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'address')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )
```

**توضیحات:**

1- **اتریبیوت کلاس add_form:** برای فرم ایجاد کاربر استفاده میشود.

- **اتریبیوت کلاس form:** برای فرم ویرایش کاربر استفاده میشود.

- برای اتریبیوت کلاس model هم مدل کاربر سفارشی را مشخص میکنیم.

> به این ترتیب فرم های ایجاد شده را به مدل ادمین معرفی میکنیم.

2- با list_display مشخص میکنیم که چه فیلدهایی نمایش داده شود.

3- حالا فیلدست ها را با دسته بندی های مجزا ایجاد میکنیم.

> **fieldsets:** برای بخش ویرایش اطلاعات در مدل ادمین هست.
>
> **add_fieldsets:** برای بخش ایجاد یک کاربر جدید(اضافه کردن کاربر جدید) در مدل ادمین میباشد.
>
> برای add_fieldsets دو تا پسورد (password1 و password2) باید نوشته شود؛ چون رمز باید تایید شود.

***نکته:*** برای نمایش فیلدهای فرم "اطلاعات کاربر"، در پنل ادمین از add_fieldsets و fieldsets استفاده میکنیم.

### اعتبار سنجی کاربر سفارشی

در فایل forms.py برای هر دو فرم ("ایجاد" و "ویرایش" کاربر) یعنی (ShopUserCreationForm و ShopUserChangeForm) اعتبارسنجی های لازم را انجام میدهیم.

**نکته:** هردو فرم از ساختار یکسانی برخوردارند؛ بنابراین اعتبارسنجی ها برای هردو انجام میدهیم.

`app directory(account)/forms.py`

```python
from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import ShopUser


class ShopUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = ShopUser
        fields = ('phone', 'first_name', 'last_name', 'address', 'is_active', 'is_staff', 'date_joined', 'is_superuser')

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        
        # ——————————————————— conditions ———————————————————
        if ShopUser.objects.filter(phone=phone).exists():
            raise forms.ValidationError('This phone number is already taken')

        if not phone.isdigit():
            raise forms.ValidationError("Phone number is invalid")

        if not phone.startswith('09'):
            raise forms.ValidationError("Phone number must start with '09'")

        if len(phone) != 11:
            raise forms.ValidationError("Phone number must have 11 digits")
        # ——————————————————————————————————————————————————
        return phone


class ShopUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = ShopUser
        fields = ('phone', 'first_name', 'last_name', 'address', 'is_active', 'is_staff', 'date_joined', 'is_superuser')

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')

        # ——————————————————— conditions ———————————————————
        if ShopUser.objects.exclude(id=self.instance.id).filter(phone=phone).exists():
            raise forms.ValidationError('This phone number is already taken')

        if not phone.isdigit():
            raise forms.ValidationError("Phone number must be digit")

        if not phone.startswith('09'):
            raise forms.ValidationError("Phone number must start with '09'")

        if len(phone) != 11:
            raise forms.ValidationError("Phone number must have 11 digits")
        # ——————————————————————————————————————————————————
        return phone
```

**توضیحات:**

برای این دو فرم فیلد شماره تلفن را اعتبارسنجی کرده ایم؛ در این اعتبارسنجی:

1- بررسی میشود که شماره تلفن از قبل وجود دارد یا نه؟!

2- بررسی میشود که شماره تلفن فقط عددی باشد.

3- شماره تلفن باید با 09 شروع شود.

4- تعداد ارقام شماره تلفن باید 11 تایی باشد.

**نکته:** در فرم ویرایش کاربر(ShopUserChangeForm) شماره تلفن کاربر در دیتابیس وجود دارد، بنابراین وقتی کاربر بدون تغییر شماره تلفن save را بزند به کاربر خطا میدهد که شماره تلفن از قبل وجود دارد(شماره تلفن خود کاربر)؛ برای جلوگیری از این خطا، از متد <span class="en-text">exclude()</span> استفاده کرده و کاربر فعلی را از لیست کاربرانی که بررسی میشوند حذف میکنیم.

### تمرینات فصل دهم (مهم)
