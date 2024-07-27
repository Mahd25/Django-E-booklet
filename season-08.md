## فصل هشتم: اپلیکیشن شبکه اجتماعی (بخش اول)

### ایجاد اپلیکیشن و شخصی سازی User

**در این فصل میخواهیم یک اپلیکیشن شبکه اجتماعی ایجاد کنیم؛ بدلیل اینکه این پروژه  نسبت به پروژه وبلاگ تفاوت های زیادی دارد، برای همین یک پروژه جنگو جدید ایجاد میکنیم.**

1- با توجه به توضیحات فصل 1، برای اپلیکیشن شبکه اجتماعی یک پروژه جدید ایجاد میکنیم، سپس یک اپ(app) ساخته و آنرا به پروژه معرفی میکنیم.

2- در دایرکتوری اپ (app)، یک فایل پایتونی بنام urls.py ایجاد میکنیم تا URL های مربوط به app را آنجا ایجاد کنیم.

`app directory/urls.py`

```python
from django.urls import path
from . import views

app_name = 'social'

urlpatterns = []
```

3- برای اینکه url های ایجاد شده کار کنند لازم است در فایل urls.py **پروژه**، url های اپ(app) را معرفی کنیم.

`project directory/urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [Z
    path('admin/', admin.site.urls),
    path('', include('social.urls'), name='social'),
]
```

برای شخصی سازی مدل User و اضافه کردن فیلدهای دلخواه به آن، باید از یکی از کلاس های AbstractUser و یا AbstractBaseUser ارث بری کنیم.

> <center>
>
> ***AbstractBaseUser***
>
> </center>
>
> برای شخصی سازی خیلی زیاد، از AbstractBaseUser استفاده میکنیم.
>
> تمام فیلدها را خودمان بای تعریف کنیم. / پسورد و احراز هویت را خودش پشتیبانی میکند.
>
> برای AbstractBaseUser حتما باید یک manager بنویسیم.    


> <center>
>
> ***AbstractUser***
>
> </center>
>
> استفاده از AbstractUser ساده تر هست.
>
> این کلاس فیلدهای username, password, firstname, lastname, email را دارد؛ بنابراین فقط کافیست فیلدهای جدید را به آنها اضافه کنیم.

1- برای شخصی سازی مدل User، AbstractUser را ایمپورت میکنیم.

2- یک کلاس(مدل) جدید ایجاد میکنیم، که از AbstractUser ارث بری میکند.

> پس از ارث بری کلاس جدید تمام فیلدهای username, password, firstname, lastname, email را خواهد داشت.

3- حالا فیلدهای جدید را به مدل User شخصی سازی شده اضافه میکنیم.

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


    class Meta:
        ordering = ['-username']
        indexes = [models.Index(fields=['-username'])]

    def __str__(self):
        return self.username
```

**پس از ایجاد مدل User شخصی سازی شده، لازم است آن مدل را به پروژه معرفی کنیم:**

در انتهای settings.py یک متغیر بنام AUTH_USER_MODEL ایجاد کرده و مدل User را بهش معرفی میکنیم.

`project directory/settings.py`

```python
AUTH_USER_MODEL = 'app_name.model_name'
# --------------------------------------
AUTH_USER_MODEL = 'social.User'
```

چون در مدل از تصویر استفاده میکنیم لازم است pillow نصب شود.

`terminal`

```python
pip install pillow
```

دستورات makemigrations و migrate فراموش نشه!!!

**تنظیمات مربوط به تصاویر (MEDIA_URL, MEDIA_ROOT) را باید برای پروژه انجام دهیم:**

1- تغییرات در settings.py:

`project directory/settings.py`

```python
MEDIA_URL = '/images/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'images')
```

2- تغییرات در urls.py:

`project directory/urls.py`

```python
# changes 1:
from django.conf.urls.static import static
from django.conf import settings
# ----------------------------------------

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('social.urls'), namespace='social'),
]

# changes 2:
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

#### **نمایش User شخصی سازی شده در پنل ادمین:**

در admin.py مواردی باید ایمپورت شوند:

`app directory/admin.py`

```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
```

**برای نمایش فیلدهای جدید (شخصی سازی شده)، در پنل ادمین لازم است در admin.py اقداماتی انجام دهیم:**

> از fieldset برای گروه بندی مجموعه ای از فیلدها استفاده میشود.

`app directory/admin.py`

```python
@admin.register(User)
class UserAdmin(UserAdmin):
    list_display = ('username', 'profile_image', 'first_name', 'last_name', 'phone_number')
    fieldsets = UserAdmin.fieldsets + (
        ('additional info', {'fields': ('profile_image', 'bio', 'birth_date', 'job', 'location', 'gender', 'phone_number')}),
    )
```

**توضیحات:**

1- از اتریبیوت fieldsets برای نمایش فیلدهای جدید در پنل ادمین استفاده میکنیم.

> در پنل ادمین فیلدها در fieldset های مختلفی وجود دارند؛ حالا برای نمایش فیلدهای جدید در پنل ادمین باید یک fieldset جدید  به مجموعه fieldset های مدل User اضافه کنیم و فیلدهای جدید را در آن نمایش دهیم.

2- حالا باید یک fieldset جدید اضافه کنیم؛ برای این کار با دستور UserAdmin.fieldsets همه فیلدست ها را فراخوانی کرده و یک tupple به مجموعه تاپل های آن اضافه میکنیم.

> fieldset ها به صورت تاپل میباشند.

3- داخل تاپلی که در مرحله 2 ایجاد کردیم، یک تاپل دیگه ایجاد میکنیم؛ حالا داخل این یکی تاپل، باید فیلدست جدید را معرفی کنیم.

> <span class="en-text">(fieldset_name, {"fields": (fields_name, ...)})</span>    


> این تاپل دو مقدار دارد:
>
> مقدار اول: اسم فیلدست میباشد
> مقدار دوم: یک دیکشنری میباشد که فیلدها در آن نوشته میشوند.

4- این دیکشنری، یک کلید و مقدار دارد:

کلید آن عبارت "fields" میباشد.
ومقدار آن یک تاپل هست. / داخل این تاپل اسم فیلدهای جدید را مینویسیم.

### استفاده همزمان از شماره تلفن و یوزر نیم برای لاگین

میخواهیم قابلیت لاگین کردن با شماره تلفن و یا ایمیل را به پروژه اضافه کنیم. / کاربرها بتوانند افزون بر username با شماره تلفن و یا ایمیل هم لاگین کنند.

> ساختار پیشفرض جنگو برای لاگین کردن در وبسایت، استفاده از username و password میباشد.
>
> که از تنظیمات مسیر زیر استفاده میکند.
> > <span class="en-text">django.contrib.auth.backends.ModelBackend</span>

**برای اینکه بتوانیم با ایمیل و شماره تلفن هم در وبسایت لاگین کنیم، باید مراحل زیر را انجام دهیم:**

1- در یک فایل پایتونی که در ادامه ایجاد میکنیم، برای هر روش لاگین کردن یک کلاس ایجاد میکنیم؛ سپس داخل بدنه این کلاس ها از دو متد **authenticate** و  **get_user** استفاده میکنیم.

2- بعد باید این کلاس های ایجاد شده را به پروژه معرفی کنیم.

لاگین و لاگ اوت را به این پروژه هم اضافه میکنیم. / url, form, template, view

**مراحل بالا را در ادامه انجام خواهیم داد ولی قبلش login , logout را به پروژه اضافه کنیم:**

> با ارث بری فرم login از AuthenticationForm اعتبارسنجی های لازم به صورت خودکار اعمال میوند.

**اضافه کردن فرم لاگین:**

`app directory/forms.py`

```python
from django import forms
from django.contrib.auth.forms import AuthenticationForm
from .models import *


class LoginForm(AuthenticationForm):
    username = forms.CharField(label='Username', required=True)
    password = forms.CharField(label='Password', required=True, widget=forms.PasswordInput)
```

**ایجاد view برای logout:**

`app directory/views.py`

```python
from django.contrib.auth import logout
from django.shortcuts import redirect

def log_out(request):
    logout(request)
    return redirect('social:login')
```

**URL های لاگین و لاگ اوت:**

`app directory/urls.py`

```python
urlpatterns = [
    path('login/', auth_views.LoginView.as_view(authentication_form=LoginForm), name='login'),
    # path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('logout/', views.log_out, name='logout'),  
]
```

**ایجاد url برای صفحه پروفایل:**

`app directory/urls.py`

```python
urlpatterns = [
    path('profile/', views.profile, name='profile'),
]
```

**اعمال تنظیمات مربوطه جهت شناسایی url های لاگین و لاگ اوت:**

`project directory/settings.py`

```python
LOGIN_REDIRECT_URL = "/profile/"
LOGIN_URL = "/login/"
LOGOUT_URL = "/logout/"
```

**قابلیت لاگین با شماره تلفن و ایمیل:**

1- در دایرکتوری app یک فایل پایتونی بنام authentication.py ایجاد میکنیم.

> مدل User را باید ایمپورت کنیم.

2- برای لاگین کردن با شماره تلفن یک کلاس ایجاد میکنیم. / این کلاس از کلاس دیگری ارث بری نمیکند.

حالا از دو متد **get_user** و **authenticate** در کلاس استفاده میکنیم:

> - authenticate: برای لاگین کردن کاربر به سیستم استفاده می‌شود. این متد در فرآیند احراز هویت استفاده می‌شود تا بررسی کند آیا اطلاعات وارد شده توسط کاربر معتبر است یا خیر.
>
> - get_user: برای بازیابی اطلاعات کاربر از دیتابیس با استفاده از شناسه کاربر. این متد می‌تواند در بخش‌های مختلف سیستم برای دسترسی به اطلاعات کاربر استفاده شود، مثل زمان‌هایی که سیستم نیاز دارد اطلاعات کاربر لاگین شده را از session ID دریافت کند.

3- در متد **authenticate**، آرگومان های username, password درواقع اسم فیلدهای فرم login هستند. / مقادیر این آرگومان ها را اتوماتیک از فرم دریافت میکند.

- خب الآن میخواهیم با شماره تلفن لاگین کنیم بنابراین بررسی میکنیم کاربری با شماره تلفن وارد شده(در آرگومان username) وجود دارد یا نه!

- اگه کاربر وجود داشت؛ بررسی میکنیم که پسورد وارد شده ، تطابق دارد یا نه اگه تطابق داشت که کاربر را برمیگرداند و کاربر در وبسایت لاگین میشود. / اگر هم پسورد تطابق نداشت None را برمیگرداند.

> <span class="rtl-text">با متد <span class="en-text">checkpassword()</span> بررسی میکند که آیا هش پسورد وارد شده با هش پسورد ذخیره شده در دیتابیس؛ برای آن کاربر برابر هست یا نه!</span>

- حالا اگر کاربر وجود نداشت و یا چند کاربر با آن شماره تلفن وارد شده وجود داشت، None  را برمیگرداند.

4- در متد **get_user** بررسی میکنیم کاربری با این id وجود دارد یا نه!

`app directory/authentication.py`

```python
from .models import User


# login with phone-number:
class PhoneAuthBackend:
    def authenticate(self, request, username=None, password=None):
        # username = phoneNumber
        try:
            user = User.objects.get(phone_number=username)
            if user.check_password(password):
                return user
            return None
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

# login with Email:
class EmailAuthBackend:
    def authenticate(self, request, username=None, password=None):
        # username = Email
        try:
            user = User.objects.get(email=username)
            if user.check_password(password):
                return user
            return None
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
```

**معرفی روش های لاگین کردن به پروژه:**

یک متغیر بنام AUTHENTICATION_BACKENDS در انتهای تنظیمات اضافه میکنیم؛ حالا روش های لاگین کردن را در لیست، برایش مشخص میکنیم، اولین مورد حالت پیشفرض لاگین با  username هست بعد از آن لاگین با ایمیل و شماره تلفن را مشخص میکنیم.

روش های لاگین با ایمیل و شماره تلفن را به صورت زیر به پروژه معرفی میکینم:

```python
# structure:
'app_name.script_name.class_name'
```

`project directory/settings.py`

```python
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'social.authentication.PhoneAuthBackend',
    'social.authentication.EmailAuthBackend',
]
```

### ثبت نام و اعتبار سنجی شماره موبایل و یوزرنیم

میخواهیم از ثبت شماره تلفن تکراری در پروژه جلوگیری کنیم.

> فرم ثبت نام و ویرایش اطلاعات شخصی را به این پروژه نیز اضافه میکنیم. / url, view, form, template

**ایجاد URL های ثبت نام و ادیت اطلاعات کاربری:**

`app diectory/urls.py`

```python
urlpatterns = [
    path('register/', views.register, name='register'),
    path('user/edit/', views.edit_profile, name='edit_profile'),
]
```

**ایجاد فرم برای ثبت نام:**

فرم را از مدل User ایجاد میکنیم ولی فیلدهای پسورد و تکرار پسورد را مجزا ایجاد میکنیم:

`app directory/forms.py`

```python
class RegisterForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, required=True)
    password_repeat = forms.CharField(widget=forms.PasswordInput, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'phone_number')

    def clean_password_repeat(self):
        password = self.cleaned_data.get('password')
        password_repeat = self.cleaned_data.get('password_repeat')

        if password != password_repeat:
            raise forms.ValidationError('Passwords must match')
        else:
            return password_repeat

    # جلوگیری از ثبت نام با شماره تکراری
    def clean_phone_number(self):
        phone = self.cleaned_data.get('phone_number')
        if User.objects.filter(phone_number=phone).exists():
            raise forms.ValidationError('Phone number already exists')
        else:
            return phone
```

برای جلوگیری از ثبت شماره تلفن تکراری؛ بررسی میکنیم که آیا کاربری با این شماره تلفن  در دیتابیس وجود دارد یا نه !

> اگر شماره تلفن وجود داشت که به کاربر یک خطا نمایش میدهد که نمیتوانید با این شماره ثبت نام کنید؛ اگر هم وجود نداشت کاربر میتواند ثبت نام کند.

**ایجاد view برای ثبت نام:**

`app directory/views.py`

```python
def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            return redirect('social:profile')
    else:
        form = RegisterForm()

    return render(request, 'registration/register.html', {"form": form})
```

**اعتبارسنجی فرم ویرایش اطلاعات شخصی:**

در زمان ثبت نام(ایجاد کاربر جدید)، اگه username که وارد میکنیم از قبل وجود داشته باشد، اجازه ثبت نام نمیدهد ولی در فرم ویرایش اطلاعات ایرادی نمیگیرد بنابراین لازم است در کنار اعتبارسنجی شماره تلفن، username را هم اعتبارسنجی کنیم تا از وارد کردن(ثبت) اطلاعات تکراری جلوگیری کند.

#### فرم ویرایش اطلاعات شخصی

فیلدهای مربوطه را جهت ویرایش مشخص میکنیم.

`app directory/forms.py`

```python
class EditProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('profile_image', 'username', 'first_name', 'last_name', 'email', 'phone_number', 'bio', 'job',
                  'location', 'gender', 'birth_date')

    def clean_phone_number(self):
        phone = self.cleaned_data.get('phone_number')
        if User.objects.exclude(id=self.instance.id).filter(phone_number=phone).exists():
            raise forms.ValidationError('Phone number already exists')
        else:
            return phone

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.exclude(id=self.instance.id).filter(username=username).exists():
            raise forms.ValidationError('Username already exists')
        else:
            return username
```

> آرگومان instance از طریق view به فرم ارسال میشود و برای استفاده از مقدار آن از دستور self.instance استفاده میکنیم که در اینجا کاربر فعلی در وبسایت میباشد.

اعتبارسنجی شماره تلفن و username شبیه به اعتبارسنجی در فرم ثبت نام هست ولی یه تفاوت مهم دارد.

>شماره تلفن و username کاربر در دیتابیس وجود دارد؛ بنابراین حتی اگر کاربر آنها را تغییر ندهد چون مشخص کردیم اگه کاربری با این شماره تلفن و یا username وجود داشت خطا نمایش دهد؛ کاربر را به عنوان مورد تکراری تشخیص داده و به کاربر خطا نشان میدهد.
>
> <span class="rtl-text">برای جلوگیری از این مشکل از متد <span class="en-text">exclude()</span> استفاده کرده و مشخص میکنیم که بجز این کاربر جستجو کن ببین اطلاعات تکراری وجود دارد یا نه!!!</span>

**ایجاد view برای فرم ویرایش اطلاعات شخصی:**

`app directory/views.py`

```python
@login_required
def edit_profile(request):
    if request.method == 'POST':
        form = EditProfileForm(request.POST, files=request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('social:profile')
    else:
        form = EditProfileForm(instance=request.user)

    return render(request, 'registration/edit_profile.html', {"form": form})
```

### ارسال ایمیل با جنگو (ارسال تیکت با smtp)

ارسال ایمیل از طریق SMTP انجام میشود. / SMTP یک پروتکل میباشد.

عبارت SMTP مخفف: Simple Mail Transfer Protocol میباشد.

میخواهیم تیکتی که کاربر مینویسد را به ایمیل خود ارسال کنیم. / پس form, template, url, view تیکت را ایجاد میکنیم.

**ایجاد URL برای تیکت:**

`app directory/urls.py`

```python
urlpatterns = [
    path('ticket/', views.ticket, name='ticket'),
]
```

**ایجاد form برای تیکت:**

`app directory/forms.py`

```python
class TicketForm(forms.Form):
    title = forms.CharField(max_length=100, required=True)
    name = forms.CharField(max_length=100, required=True)
    content = forms.CharField(widget=forms.Textarea, required=True)
    email = forms.CharField(required=True)
```

**انجام تنظیمات مربوطه، برای ارسال ایمیل:**

`project directory/settings.py`

```python
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'example@gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_PASSWORD = '---- ---- ---- ----'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
```

**توضیحات:**

1- EMAIL_HOST: مشخص میکنیم از چه سروری، برای خدمات ایمیل استفاده میکنیم؛ در حال حاضر از جیمیل استفاده میکنیم.

2- EMAIL_HOST_USER: آدرس جیمیلی که میخواهیم از آن برای ارسال ایمیل استفاده کنیم. / (فرستنده ایمیل)

3- EMAIL_PORT: مقدار ثابت 587 را برایش مشخص میکنیم.

4- EMAIL_USE_TLS و EMAIL_USE_SSL: برای موارد امنیتی استفاده میشود. / TLS پرکاربردتر میباشد.

5- EMAIL_BACKEND: مشخص میکنیم که از smtp برای ارسال ایمیل استفاده کند.

6- EMAIL_HOST_PASSWORD: این پسورد را در ادامه بدست می آوریم

**بدست آوردن پسورد برای EMAIL_HOST_PASSWORD:**

- وارد My_Account حساب جیمیلی که برای EMAIL_HOST_USER مشخص کردیم میشویم.

- منوی security را انتخاب میکینم.

> **نکته:** تایید دو مرحله ای باید فعال باشه در غیر این صورت پسوردی برای ما، ست نمیکند.

- عبارت app password را در فیلد search، جستجو میکنیم. / پس از وارد کردن پسورد حساب وارد app password میشود.

- یک اسم دلخواه برای app password مشخص کرده و اپ خود را ایجاد میکنیم، یک پسورد برای ما ایجاد میکند؛ آنرا کپی کرده و برای EMAIL_HOST_PASSWORD تنظیمش میکینم.

**ایجاد view برای تیکت:**

`app directory/views.py`

```python
from django.core.mail import send_mail

def ticket(request):
    sent = False
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

            sent = True
            return redirect("social:index")

    else:
        form = TicketForm()

    return render(request, 'forms/ticket.html', {"form": form, "sent": sent})
```

برای ارسال ایمیل از پکیج send_mail استفاده میکنیم.

بریم با برخی از آرگومان های send_mail آشنا بشیم:

1- subject: موضوع ایمیل را برایش مشخص میکنیم.

2- message: محتوای متن ایمیل که ارسال میشود.

3- from_email: فرستنده ایمیل میباشد؛ این همان ایمیلی هست که در تنظیمات مشخص کردیم. / نباید ایمیل دیگری وارد شود مگر اینکه تنظیمات را تغییر دهیم.

4- recipient_list: یک لیست از گیرندگان میباشد. / میتوانیم یک یا چند ایمیل برایش مشخص کنیم.

5- fail_silently=False: اگر خطایی وجود داشته باشد آنرا نمایش میدهد.

> با استفاده از متغیر sent در تمپلیت، یک شرط میگذاریم که وقتی  True بود پیغام "تیکت شما برای پشتیبانی ارسال شد" را نمایش دهد.

### تغییر و بازنشانی پسورد با ایمیل

تغییر و بازنشانی پسورد را برای این پروژه نیز پیاده سازی میکنیم.

`app directory/urls.py`

```python
urlpatterns = [
    # password_change
    path('password-change/', auth_views.PasswordChangeView.as_view(success_url='done'), name='password_change'),
    path('password-change/done/', auth_views.PasswordChangeDoneView.as_view(), name='password_change_done'),

    # password_reset
    path('password-reset', auth_views.PasswordResetView.as_view(success_url='/password-reset/done'), name='password_reset'),
    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('password-reset/confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(success_url='/password-reset/complete'), name='password_reset_confirm'),
    path('password-reset/complete/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
```

تمپلیت ها را در دایرکتوری registration ایجاد میکنیم.

**نکته 1:** برای اینکه تمپلیت های ما را نمایش دهد باید در بخش INSTALLED_APPS اپ(app) را در بالا قرار دهیم.

**نکته 2:** همان طور که قبلا هم گفته شد؛ اگر کاربر ایمیلی ثبت نکرده باشد، ایمیل ارسال نمیشود.

### پیاده سازی سیستم تگ برای پست ها

برای ایجاد تگ زیر پست ها؛ بجای اینکه یک مدل برای تگ ها از نوع رابطه Many To Many ایجاد کنیم، از سیستم django-taggit استفاده میکنیم.

برای استفاده از تگ لازم است یک مدل برای پست های خود ایجاد کنیم:

`app directory/models.py`

```python
class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_posts')
    description = models.TextField()

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

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

**نمایش مدل Post در پنل ادمین:**

`app directory/admin.py`

```python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'updated', 'created']
    ordering = ['-created', '-author']
    search_fields = ['author', 'description']
```

**ایجاد URL برای لیست پست ها:**

`app directory/urls.py`

```python
urlpatterns = [
    path('posts-list/', views.post_list, name='post_list'),
]
```

**ایجاد view برای لیست پست ها:**

`app directory/views.py`

```python
def post_list(request):

    posts = Post.objects.all()

    return render(request, 'social/post_list.html', {'posts': posts})
```

برای استفاده از taggit باید آنرا نصب کنیم:

```terminal
pip install django-taggit
```

پس از نصب باید آنرا به پروژه معرفی کنیم:

`project directory/settings.py`

```python
INSTALLED_APPS = [
    # ...
    'taggit',
]
```

برای ایجاد فیلد tags در مدل Post باید TaggableManager را ایمپورت کنیم.

`app directory/models.py`

```python
from taggit.managers import TaggableManager
```

حالا از آن استفاده کرده و فیلد tags را در مدل Post ایجاد میکنیم:

`app directory/models.py`

```python
from taggit.managers import TaggableManager


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_posts')
    description = models.TextField()

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    tags = TaggableManager()

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

> <span class="rtl-text">با استفاده از متدهای <span class="en-text">remove()</span>, <span class="en-text">add()</span>, <span class="en-text">all()</span> میتوانیم، تگ اضافه و یا حذف کنیم یا اینکه تمام تگ ها را نمایش دهیم.</span>
>
> > <span class="en-text">post.tags.add("holidays")</span>
> >
> > <span class="en-text">post.tags.remove("Halloween")</span>
> >
> > <span class="en-text">post.tags.all()</span>

**ایجاد تمپلیت برای لیست پست ها:**

`templates/social/post_list.html`

```jinja
{% for post in posts %}
    {{ post.description | truncatewords:20 | linebreaks }}
    <br>
    published at {{ post.created }} by {{ post.author }}
    <br>

    {{ post.tags.all | join:', ' }}
{% endfor %}
```

برای نمایش تمام تگ ها، فیلد tags را برای post صدا زده و با متد <span class="en-text">all()</span> همه تگ ها را نمایش میدهیم.

### نمایش تمام پست های یک تگ

میخواهیم کاری شبیه به ساختار دسته بندی (category) که در فصل های قبل اجرا کردیم را پیاده سازی کنیم.

- یک url دیگه برای لیست پست ها ایجاد میکنیم؛ این URL متغیر tag_slug را برای view ارسال میکند.

`app directory/urls.py`

```python
urlpatterns = [
    path('posts-list/', views.post_list, name='post_list'),
    path('posts-list/<slug:tag_slug>', views.post_list, name='post_list_tags'),
]
```

> **نکته:** رابطه بین تگ و پست از نوع Many To Many میباشد.
>
> کلاس Tag باید ایمپورت شود.

- برای view لیست پست ها، یک آرگومان اختیاری بنام tag_slug با مقدار None مشخص میکنیم. / تا زمانیکه تگ ارسال شد بتوانیم با استفاده از آن، پست های مربوط به آن تگ را نمایش دهیم.

`app directory/views.py`

```python
from taggit.models import Tag


def post_list(request, tag_slug=None):
    tag = None
    posts = Post.objects.all()

    if tag_slug:
        tag = get_object_or_404(Tag, slug=tag_slug)
        posts = Post.objects.filter(tags__in=[tag])

    return render(request, 'social/post_list.html', {'posts': posts, 'tag': tag})
```

**چون حالا در تمپلیت لیست پست ها؛ پست ها به دو صورت نمایش داده میشوند، تغییراتی در تمپلیت ایجاد میکنیم:**

`templates/social/post_list.html`

```jinja
{% if tag %}
    <h2>posts tagged with {{ tag.name }}</h2>
{% endif %} 

{% for post in posts %}
    {{ post.description | truncatewords:20 | linebreaks }}
    published at {{ post.created }} by {{ post.author }}
    <br>
    
    {% for tag in post.tags.all %}
        <a href="{% url 'social:post_list_tags' tag.slug %}">{{ tag.name }}</a>
        
        {% if not forloop.last %}, {% endif %} 
    {% endfor %}
{% endfor %}
```

### ذخیره تگ ها هنگام ایجاد پست

میخواهیم فرمی برای ایجاد پست نوشته و برای پست تگ ها هم ذخیره کنیم.

**ایجاد URL برای افزودن پست:**

`app directory/urls.py`

```python
urlpatterns = [
    path('create-post/', views.create_post, name='create_post'),
]
```

**ایجاد form برای افزودن پست:**

`app directory/forms.py`

```python
class CreatePostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ('description', 'tags')
```

**ایجاد view برای افزودن پست:**

`app directory/views.py`

```python
@login_required
def create_post(request):
    if request.method == 'POST':
        form = CreatePostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()

            form.save_m2m()
            return redirect('social:post_list')
    else:
        form = CreatePostForm()

    return render(request, 'forms/create_post.html', {'form': form})
```

همان طور که گفته شد رابطه بین Tag و Post از نوع Many To Many میباشد.

زمانی که میخواهیم یک فیلد m2m را ذخیره کنیم، **چنانچه از آرگومان "commit=False" برای متد <span class="en-text">save()</span>  استفاده کرده باشیم**؛ پس از ذخیره اطلاعات در دیتابیس، **باید** از متد <span class="en-text">save_m2m()</span> برای آن فرم استفاده کنیم.

### نمایش مشابه ترین پست ها با کمک تگ

خب بریم برای این پروژه هم جزئیات پست را اضافه کنیم.

**ایجاد URL برای post_detail:**

`app directory/urls.py`

```python
urlpatterns = [
    path('posts/detail/<int:post_id>', views.post_detail, name='post_detail'),
]
```

**ایجاد لینک برای پست ها در تمپلیت post_list:**

`templates/social/post_list.html`

```jinja
{% if tag %}
    <h2>posts tagged with {{ tag.name }}</h2>
{% endif %} 

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
{% endfor %}
```

میخواهیم در تمپلیت post_detail چند پست مشابه را نمایش دهیم؛ (پست هایی که تعداد تگ مشابه بیشتری دارند.)

**ایجاد view برای post_detail:**

`app directory/views.py`

```python
def post_detail(request, post_id):
    post = get_object_or_404(Post, pk=pk)

    post_tags_ids = post.tags.values_list('id', flat=True)

    similar_posts = Post.objects.filter(tags__in=post_tags_ids)

    similar_posts = similar_posts.annotate(same_tags=Count('tags')).exclude(id=pk).order_by('-same_tags', '-created')[:3]

    context = {
        'post': post, 
        'similar_posts': similar_posts
        }

    return render(request, 'social/post_detail.html', context=context)
```

**توضیحات:**

1- با استفاده از id ارسال شده توسط url، آن پست را در صورت وجود، از دیتابیس دریافت میکنیم.

2- id تگ های پست را به کمک متد <span class="en-text">values_list()</span> دریافت میکنیم. / اگه از flat استفاده نکنیم در خروجی هر id به صورت تاپل خواهد بود که استفاده ازش کمی سخت میشود.

3- با استفاده از field lookups(فیلد لوکاپ) tags\_\_in، تمام پست هایی که حداقل یک تگ مشابه، با تگ های پست فعلی دارند را دریافت کرده و در یک متغیر ذخیره میکنیم.

**برخی از پست ها ممکن است چند تگ مشابه داشته باشند، در نتیجه برخی پست ها به صورت تکراری در این کوئری ست وجود خواهند داشت.**

4- حالا روی کوئری ستی که در مرحله قبل بدست آوردیم، از <span class="en-text">annotate(same_tags=Count('tags'))</span> استفاده میکنیم تا تعداد تگ های مشترک برای هر پست را محاسبه کنیم، و این مقدار را به عنوان  same_tags به پست های کوئری ست اضافه میکنیم.

> <span class="rtl-text">از متد <span class="en-text">exclude()</span> استفاده میکنیم تا پست فعلی را جز پست های مشابه انتخاب نکند.</span>    


> <span class="rtl-text">تابع <span class="en-text">Count('tags')</span> در اینجا حساب میکند هر پست، چند بار در کوئری ست تکرار شده است؛ و چون هر پست به تعداد تگ های مشابهی که دارد تکرار میشود، در نتیجه عددی که نشان میدهد تعداد تگ های مشابه میباشد.</span>
>
> - <span class="rtl-text">با استفاده از متد <span class="en-text">order_by()</span>، نتایج را براساس تعداد تگ های مشابه مرتب سازی میکنیم و چنانچه تعداد تگ مشابه یکسان بود، براساس تاریخ ایجاد مرتب میکنیم.</span>
>
> حالا پست هایی که تعداد تگ مشابه بیشتری دارند به این پست شبیه تر خواهند بود.

**نمایش پست های مشابه در تمپلیت post_detail:**

`templates/social/post_detail.html`

```jinja
{{ post.description | truncatewords:20 | linebreaks }}

published at {{ post.created }} by {{ post.author }}
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

### تمرینات فصل هشتم (مهم)

#### 1- پیاده سازی قابلیت جستجو(براساس توضیحات و تگ های پست):

همانند پروژه قبلی، تمپلیت پایه(base.html) را برای این پروژه نیز ایجاد میکنیم.

**باید برای جستجو یک فرم ایجاد کنیم و آنرا در تمپلیت base.html قرار دهیم تا در همه صفحات دیده شود.**

**ایجاد فرم برای جستجو:**

`app directory/forms.py`

```python
class SearchForm(forms.Form):
    query = forms.CharField(max_length=250)
```

**ایجاد url برای جستجو:**

`app directory/urls.py`

```python
urlpatterns = [
    path('search/', views.post_search, name='post_search'),
]
```

**ایجاد view برای جستجو:**

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            results = Post.objects.annotate(
                similarity=TrigramSimilarity('tags', query) + 
                           TrigramSimilarity('description', query)).filter(similarity__gt=0.18).order_by('-similarity')

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

برای استفاده از قابلیت های postgres لازمه توی settings.py و بخش INSTALLED_APPS آنرا معرفی کنیم.

`project directory/settings.py`

```python
INSTALLED_APPS = [
    # ...
    'django.contrib.postgres',
]
```

#### 2- پیاده سازی قابلیت کامنت گذاشتن برای پست ها:

برای قابلیت کامنت گذاری لازم است، model, url, view, form ایجاد کنیم:

**ایجاد مدل برای کامنت گذاشتن:**

`app directory/models.py`

```python
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')

    name = models.CharField(max_length=250)
    content = models.TextField()
    # date
    created = models.DateTimeField(auto_now_add=True)

    # status for show in template
    active = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created']
        indexes = [models.Index(fields=['-created'])]

    def __str__(self):
        return f'Written by: {self.name}\n{self.post} Post'
```

**ایجاد فرم برای کامنت:**

`app directory/forms.py`

```python
class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['name', 'content']
```

**ایجاد URL برای کامنت:**

`app directory/urls.py`

```python
urlpatterns = [
    path('post-detail/<int:post_id>/comment/', views.post_comment, name='post_comment'),
]
```

**ایجاد view برای کامنت:**

`app directory/views.py`

```python
def post_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    comment = None

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.save()
    else:
        form = CommentForm()

    context = {
        'comment': comment,
        'post': post,
        'form': form
    }

    return render(request, "forms/comment.html", context=context)
```

#### 3- صفحه بندی برای پست ها

**ایجاد ساختار تمپلیت صفحه بندی:**

`templates/partials/pagination.html`

```jinja
{% load static %}
<link rel="stylesheet" href="{% static 'css/pagination.css' %}">

<nav class="my-5" aria-label="navigation">
    <ul class="pagination d-inline-block d-md-flex justify-content-center">

        {% if page.has_previous %}
            <li class="page-item">
                <a class="page-link1" href="?page={{ page.previous_page_number }}" tabindex="-1" aria-disabled="true">«</a>
            </li>

            {% if page.number > 3 %}
                <li class="page-item"><a class="page-link" href="?page=1">1</a></li>
                {% if page.number > 4 %}
                    <li class="page-item disabled"><a class="page-link" href="#">...</a></li>
                {% endif %}
            {% endif %}

        {% endif %}

        {% for num in page.paginator.page_range %}
            {% if page.number == num %}
                <li class="page-item"><a class="page-link active" href="?page={{ num }}">{{ num }}</a></li>
            {% elif num > page.number|add:'-3' and num < page.number|add:'3' %}
                <li class="page-item"><a class="page-link" href="?page={{ num }}">{{ num }}</a></li>
            {% endif %}
        {% endfor %}

        {% if page.has_next %}
            {% if page.number < page.paginator.num_pages|add:'-3' %}
                <li class="page-item disabled"><a class="page-link" href="#">...</a></li>
                <li class="page-item"><a class="page-link" href="?page={{ page.paginator.num_pages }}">{{ page.paginator.num_pages }}</a></li>
            {% elif page.number < page.paginator.num_pages|add:'-2' %}
                <li class="page-item"><a class="page-link" href="?page={{ page.paginator.num_pages }}">{{ page.paginator.num_pages }}</a></li>

            {% endif %}
            <li class="page-item">
                <a class="page-link1" href="?page={{ page.next_page_number }}">»</a>
            </li>
        {% endif %}

    </ul>
</nav>
```

**افزودن ساختار pagination به تمپلیت post_list:**

`templates/social/post_list.html`

```jinja
{% if tag %}
    <h2>posts tagged with {{ tag.name }}</h2>
{% endif %} 

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
{% endfor %}

<!-- ساختار صفحه بندی -->
{% include 'partials/pagination.html' with page=posts %}
```

**تغییر view برای لیست پست ها:**

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
    page_number = request.GET.get('page', 1)
    
    try:
        posts = paginator.page(page_number)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)
    except PageNotAnInteger:
        posts = paginator.page(1)

    return render(request, 'social/post_list.html', {'posts': posts, 'tag': tag})
```

> همان طور که قبلا هم گفته شد؛ متغیر posts که در try, except ایجاد شده یک آبجکت از صفحه میباشد که اطلاعات صفحه و پست ها را در خود دارد.

#### 4- پیاده سازی قابلیت ویرایش و حذف برای پست ها:

**ویرایش اطلاعات پست:**

برای ویرایش پست از فرم و تمپلیت ایجاد پست استفاده میکنیم.

**ایجاد URL برای ویرایش پست:**

`app directory/urls.py`

```python
urlpatterns = [
    path('profile/edit-post/<post_id>', views.edit_post, name='edit_post'),
]
```

**ایجاد view برای ویرایش پست:**

`app directory/views.py`

```python
from django.contrib.auth.decorators import login_required

@login_required
def edit_post(request, post_id):
    post = get_object_or_404(Post, pk=post_id, author=request.user)

    if request.method == 'POST':
        form = CreatePostForm(request.POST, instance=post)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()

            return redirect('social:index')
    else:
        form = CreatePostForm(instance=post)

    return render(request, 'forms/create_post.html', {'post': post, 'form': form})
```

> برای پستی که دریافت میکنیم، مشخص میکنیم که نویسنده(author) آن، کاربر فعلی باشد؛ چون هر کاربر فقط میتواند پست های خود را ویرایش کند نه پست های دیگری را.

**حذف پست:**

ایجاد url برای حذف پست ها:

`app directory/urls.py`

```python
urlpatterns = [
    path('profile/delete-post/<post_id>', views.delete_post, name='delete_post'),
]
```

برای هر پست یک دکمه حذف ایجاد میکنیم:

`templates/social/post_list.html`

```jinja
{% if tag %}
    <h2>posts tagged with {{ tag.name }}</h2>
{% endif %} 

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

    <a href="{% url 'social:delete_post' post.id %}">delete post</a>
{% endfor %}

<!-- ساختار صفحه بندی -->
{% include 'partials/pagination.html' with page=posts %}
```

**ایجاد view برای حذف پست ها:**

`app directory/views.py`

```python
def delete_post(request, post_id):
    post = get_object_or_404(Post, pk=post_id)

    if request.method == 'POST':
        post.delete()

        return redirect('social:post_list')
    
    return render(request, 'forms/delete-post.html', {'post': post})
```

**ایجاد template برای حذف پست ها:**

`templates/forms/delete_post.html`

```jinja
<h2>آیا از حذف پست مطمئن هستید؟!</h2>
<br>

<a href="{% url 'social:post_list' %}">بازگشت به صفحه لیست پست ها</a>

<form method="post">
    {% csrf_token %}

    <input type="submit" value="حذف">
</form>
```

#### 5- قابلیت افزودن تصویر برای پست ها:

**ایجاد مدل Images برای ذخیره تصاویر:**

`app directory/models.py`

```python
class Image(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images', null=True, blank=True)
    
    image = ResizedImageField(upload_to='post_images/', size=[125, 125], scale=1, crop=['middle', 'center'], null=True, blank=True)
    title = models.CharField(max_length=250, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']
        indexes = [models.Index(fields=['-created'])]

    def __str__(self):
        return f"Title: {self.title}" if self.title else f"Image_name: {self.image}"
```

**تغییر فرم ایجاد پست برای افزودن تصویر به آن:**

`app directory/forms.py`

```python
class CreatePostForm(forms.ModelForm):
    img1 = forms.ImageField(label='pic1', required=False)
    img2 = forms.ImageField(label='pic2', required=False)

    class Meta:
        model = Post
        fields = ('description', 'tags')
```

**تغییر view برای ایجاد پست:**

`app directory/views.py`

```python
@login_required
def create_post(request):
    if request.method == 'POST':
        form = CreatePostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()

            form.save_m2m()

            # اسم فیلدهای تصویر در فرم
            all_images = ['img1', 'img2']

            for img in all_images:
                img_file = form.cleaned_data.get(img)
                if img_file:
                    Image.objects.create(image=img_file, post=post)

            return redirect('social:post_list')
    else:
        form = CreatePostForm()

    return render(request, 'forms/create_post.html', {'form': form})
```
