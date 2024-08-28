## فصل یازدهم: اپلیکیشن فروشگاه اینترنتی (بخش دوم)

### سناریوی تکمیل فرایند خرید

**این بخش از آموزش صرفا تئوری بوده و خبری از کد زدن نیست!**

**فرایند تکمیل خرید =>** کاربر سبد خرید را کامل کرده و روی ادامه خرید کلیک کرده؛ از اینجا سناریوی فرایند خرید شروع میشود:

**حالا دو حالت وجود دارد:**

**1-** کاربر از قبل لاگین کرده است.    
**2-** کاربر هنوز لاگین نکرده است.

1. **اگر کاربر از قبل لاگین  کرده بود:** وقتی ادامه خرید را انتخاب میکند چنانچه اطلاعات کاربر کامل باشد؛ به صفحه تایید خرید و درگاه پرداخت منتقل میشود. 

    اگر هم اطلاعات کامل نیست، ابتدا به صفحه تکمیل فرم اطلاعات و سپس به صفحه تایید خرید و درگاه پرداخت منتقل میشود.

2. **کاربر لاگین نکرده است:** پس از انتخاب محصولات وقتی روی  ادامه خرید کلیک میکند از کاربر یک شماره تلفن برای تایید شخص درخواست میکند(یک کد برای شماره تلفن ارسال میشود.)؛ 

    **اگر شماره از قبل در دیتابیس وجود داشته باشد(حساب داشته باشد)**؛ کاربر را به صفحه تایید خرید و درگاه پرداخت منتقل میکنیم.

    **اگر شماره وجود نداشت**؛ برای آن شخص با توجه به شماره تلفن یک حساب کاربری ایجاد میکنیم و سپس کاربر را به صفحه تایید خرید منتقل میکنیم.

    - در یک فرم  مشخصات گیرنده سفارش را از کاربر دریافت میکنیم.

### ارسال پیامک با وب سرویس (کاوه نگار)

**نکته:** برای ارسال پیامک در **وب سرویس های پیامکی** لازم است که در آن وبسایت ها ثبت نام کرده و مراحل احراز هویت را تکمیل کنید.

برای ارسال کد تایید، اطلاع رسانی ها، وضعیت سفارش خریدار و... از سرویس پیامکی استفاده میکنیم.

در اینجا وب سرویس پیامکی کاوه نگار را معرفی میکنیم ولی شما میتوانید از وب سرویس های دیگری استفاده کنید؛ چون ساختار و نحوه استفاده تقریبا مشابه یکدیگر میباشد.

**1-** در مرحله اول لازم است ثبت نام و احراز هویت را؛ که در وبسایت سرویس پیامکی انجام دهیم.

**2-** در بخش ***حساب من*** یک API Key وجود دارد، که در کدها به آن نیاز داریم. / با کلیک روی آیکون کلید (🔑)  یک API جدید ایجاد میکند(API قبلی منقضی میشود.)

**پیامک های ارسالی دو حالت دارند:**

1- پیامک های کد تایید یا دارای یک کلمه خاص(پیامک های توکن دار)    
2- پیامک عادی (شامل یک متن ساده)

**نکته:** مدیریت و ساختار پیامک های توکن دار در بخش اعتبارسنجی سرویس پیامکی (کاوه نگار) انجام میشود.

[![verification-SMS](https://res.cloudinary.com/am-er/image/upload/v1724505875/kavenegar-client-Verification_ewem5f.png)](https://res.cloudinary.com/am-er/image/upload/v1724505875/kavenegar-client-Verification_ewem5f.png)

**توضیحات:**

1- از بخش **تعریف الگوی اعتبار سنجی**، میتوانیم یک پیامک توکن دار جدید ایجاد کنیم.

2- **نام الگو**؛ اسم تمپلیت هست که در ساختار کد از آن استفاده میکنیم.

3- متنی که قرار است به کاربران ارسال شود در **متن الگوی پیامک** نوشته میشود.

> <span class="rtl-text">بخش متغیر محتوای متن ما؛ <span class="en-text">%token</span> میباشد که در view جنگو آنرا مقدار دهی میکنیم.</span>

**برای استفاده از سرویس پیامکی کاوه نگار لازم است که کابخانه آنرا نصب کنیم.**

`Terminal`

```terminal
pip install kavenegar
```

**ساختار پیامک های توکن دار و عادی:**

اولی برای پیامک های توکن دار و دومی برای پیامک های عادی استفاده میشود.

`app directory(cart)/commom/KaveSms.py`

```python
from kavenegar import *
from urllib.error import HTTPError


def send_sms_with_template(receptor, tokens: dict, template):
    """
        sending sms that needs template
    """
    try:
        api = KavenegarAPI('در بخش حساب من API Key')

        params = {
            'receptor': receptor,
            'template': template,
        }

        for key, value in tokens.items():
            params[key] = value

        response = api.verify_lookup(params)
        print(response)
        return True
    except APIException as e:
        print(e)
        return False
    except HTTPError as e:
        print(e)
        return False


# ---------------------------------------
def send_sms_normal(receptor, message):
    try:
        api = KavenegarAPI('در بخش حساب من API Key')

        params_buyer = {
            'receptor': receptor,
            'message': message,
            'sender': '10005000505077'
        }

        response = api.sms_send(params_buyer)
        print(response)
    except APIException as e:
        print(e)
    except HTTPError as e:
        print(e)
```

**توضیحات:**

برای راحتی کدهای ارسال پیام ر به صورت تابع نوشته و برای استفاده از آنها در view تابع مدنظر را صدا میزنیم، تا از تکرار کد جلوگیری شود.

1- در تابع **send_sms_with_template**:

- **receptor** => شماره گیرنده پیام میباشد(مشتریان و خریداران فروشگاه)

- **tokens** => یک دیکشنری، شامل متغیرهای محتوای متن میباشد (مثال: {'token': 254168})

- **template** => همان  **نام الگو** میباشد؛ که در بخش **تعریف الگوی اعتبار سنجی** آنرا تعریف کرده ایم.

> <span class="rtl-text">در این حالت دیگر لازم نیست متنی بنویسیم و فقط مقدار توکن ها را ارسال میکنیم، تا در محتوای متن اعتبارسنجی بجای (<span class="en-text">%token</span>) قرار گرفته و برای کاربر ارسال شود.</span>

2- در تابع **send_sms_normal**:

- **receptor** => شماره گیرنده پیام میباشد(مشتریان و خریداران فروشگاه)

- **message** => محتوای متن پیام.

**این کد ها را در فایل KaveSms.py نوشته و آنرا در اپ cart قرار میدهیم.**

> حال هرجا نیاز داشته باشیم، یکی از توابع آنرا ایمپورت کرده و آرگومان ها را برایش مشخص میکنیم.

### پیاده سازی دریافت شماره کاربر

در اپ orders فایل urls.py را ایجاد میکنیم.

**در آن سه url میسازیم؛**  
1- برای دریافت شماره تلفن   
2- برای دریافت کد تایید    
3- برای دریافت اطلاعات گیرنده سفارش

`app directory(orders)/urls.py`

```python
from django.urls import path
from . import views


app_name = 'orders'

urlpatterns = [
    path('verify-phone', views.verify_phone, name='verify_phone'),
    path('verify-code', views.verify_code, name='verify_code'),
    path('order-create', views.order_create, name='order_create'),
]
```

**معرفی این فایل به پروژه:**

`project directory/urls.py`

```python
urlpatterns = [
    # ...
    path('order/', include('orders.urls', namespace='orders')),
]
```

**نکته:** در اپ cart برای تمپلیت سبد خرید، یک دکمه برای **ادامه خرید** ایجاد کرده بودیم، حالا برای href آن url (آدرس) verify-phone را مشخص میکنیم.

> برای راحتی کد های طولانی را collapse کردیم.(بستیم)

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
>       {% for item in cart ... %}


>       <div class="cart-total-price"...>


        <div class="checkout-button">
            <div class="continue-btn"><a href="{% url 'orders:verify_phone' %}">ادامه خرید</a></div>
            <div class="back-btn"><a href="{% url "shop:products-list" %}">برگشت به لیست محصولات</a></div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

>    <script...>
       
{% endblock %}
```

در اپ order فایل forms.py را ایجاد کرده و در آن یک فرم برای دریافت شماره تلفن کاربر و اعتبارسنجی آن ایجاد میکنیم.

`app directory(orders)/forms.py`

```python
class PhoneVerificationForm(forms.Form):
    phone_number = forms.CharField(max_length=11)

    def clean_phone_number(self):
        phone_number = self.cleaned_data['phone_number']

        # conditions....
        if not phone_number.isdigit():
            raise forms.ValidationError("Phone number must be digit")

        if len(phone_number) != 11:
            raise forms.ValidationError("Phone number must be 11 digits")

        if not phone_number.startswith("09"):
            raise forms.ValidationError("Phone number must start with 09")
        
        return phone_number
```

**توضیحات:**

پس از ایجاد فیلد شماره تلفن، برای آن اعتبارسنجی انجام میدهیم.

1- شماره تلفن باید به عدد باشد.

2- تعداد ارقام آن باید 11 تا باشد.

3- باید با 09 شروع شود.

نهایتا اگر مشکلی نداشت آنرا return میکنیم.

**ایجاد view برای دریافت و بررسی شماره تلفن:**

`app directory(orders)/views.py`

```python
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import *
from cart.common.KaveSms import *
import random


# Create your views here.
def verify_phone(request):
    if request.user.is_authenticated:
        return redirect('orders:order_create')
    # ———————————————————————————————————————————
    if request.method == 'POST':
        form = PhoneVerificationForm(request.POST)
        if form.is_valid():
            phone = form.cleaned_data.get('phone_number')

            # verification code
            code = ''.join(random.sample('0123456789', 6))
            tokens = {'token': code}

            # save in session...
            request.session['verification_code'] = code
            request.session['phone'] = phone

            # send SMS
            send_sms_with_template(phone, tokens, 'verification_code')

            # success message
            messages.success(request, 'Your verification code has been sent.')
            return redirect('orders:verify_code')
    else:
        form = PhoneVerificationForm()

    context = {
        'form': form,
    }

    return render(request, 'forms/verify_phone.html', context=context)
```

**توضیحات:**

> اگر کاربر در وبسایت لاگین کرده باشد (یعنی anonymous-user نباشد)؛ متد is_authenticated مقدار True را برمیگرداند.

1- اگر کاربر لاگین کرده باشد، دیگر لازم نیست که شماره تلفن وارد کند؛ بنابراین آن کاربر را به صفحه اطلاعات گیرنده سفارش (یعنی order_create) منتقل میکنیم.

2- وقتی کاربر شماره تلفن را وارد کرد و آنرا ارسال کرد، شماره تلفن را به فرم میفرستیم تا اعتبارسنجی شود؛ چنانچه مشکلی نداشته باشد آنرا در یک متغیر ذخیره میکنیم.

3- با استفاده از کتابخانه random یک کد 6 رقمی(تعداد ارقام دلخواه است) ایجاد میکنیم و آنرا در یک دیکشنری ذخیره میکنیم.

> این دیکشنری را به API سرویس پیامکی ارسال میکنیم، تا با استفاده از آن مقدار، کد تایید را به کاربر ارسال کند.

4- کد تایید و شماره تلفن را در session ذخیره میکنیم.(تا در view های بعدی هم به آنها دسترسی داشته باشیم.)

5- شماره تلفن کاربر، دیکشنری tokens و اسم تمپلیت(همان نام الگو در بخش اعتبارسنجی وبسایت) را به API  سامانه پیامکی ارسال میکنیم. / سامانه پیامکی با استفاده از آنها پیام را به کاربر ارسال میکند.

6- پیام "کد تایید برای شما ارسال شد" را با استفاده از ماژول messages به کاربر نشان میدهیم. / در پایان کاربر را به view بعدی یعنی verify-code منتقل میکنیم.

**ایجاد تمپلیت verify_phone.html**

`app (order)/templates/forms/verify_phone.html`

```jinja
<h2>verification phone</h2>

<form action="" method="post">
    {% csrf_token %}

    {{ form.as_p }}

    <input type="submit" value="Send">
</form>

{% for message in messages %}
	{{ message }}
{% endfor %}
```

### ارسال و بررسی کد تایید به شماره کاربر

برای کد تایید فقط در تمپلیت یک فرم ایجاد کرده و مقادیر آن را با دستور **request.POST** دریافت میکنیم.

**ایجاد view برای دریافت و بررسی کد تایید:**

`app directory(orders)/views.py`

```python
def verify_code(request):
    if request.method == 'POST':
        received_code = request.POST.get('code')
        if received_code:
            verification_code = request.session['verification_code']
            phone = request.session['phone']

            if received_code == verification_code:
                if ShopUser.objects.filter(phone=phone).exists():
                    user = ShopUser.objects.get(phone=phone)
                else:
                    characters = 'QWERTYUIOPASDFGHJKLZXCVBNM-0123456789-@_qwertyuiopasdfghjklzxcvbnm'
                    user_password = ''.join(random.sample(characters, 8))

                    user = ShopUser.objects.create_user(phone=phone)
                    user.set_password(user_password)
                    user.save()

                    # send SMS:
                    send_data = {
                        'token1': phone,
                        'token2': user_password,
                    }
                    send_sms_with_template(phone, send_data, 'create-account')

                # ——————————————— login user in website ———————————————
                login(request, user)

                # —————————— clean code & phone from session ——————————
                del request.session['verification_code']
                del request.session['phone']

                return redirect('orders:order_create')

            else:
                messages.error(request, 'Your verification code does not match.')

    return render(request, 'forms/verify_code.html')
```

**توضیحات:**

1- وقتی کاربر کد تایید را ارسال کرد، با دستور **request.POST.get('code')** آنرا دریافت کرده و در یک متغیر ذخیره میکنیم.

2- کد تایید و شماره تلفن کاربر، را از session دریافت کرده و در متغیر ذخیره میکنیم.

3- حالا بررسی میکنیم که کد تایید ارسال شده توسط کاربر با کد تاییدی که ما برایش ارسال کردیم تطابق دارد یا نه!!!

- اگر کد تایید تطابق نداشت یک پیام به کاربر نشان میدهیم. "کد تایید صحیح نمیباشد یا تطابق ندارد."

- حالا اگر کد تایید درست بود؛ دو حالت وجود دارد ، اگر کاربر حساب ندارد یک حساب برایش ایجاد میکنیم و با آن لاگین میکنیم ولی اگر حساب داشته باشد با همان حساب لاگین میشویم.

4- بررسی میکنیم کاربری با این شماره تلفن وجو دارد یا نه! اگر وجود داشت اطلاعات آن کاربر را در یک متغیر ذخیره میکنیم تا بتوانیم لاگین شویم.

5- اگر کاربر وجود نداشت؛ یک حساب کاربری با رمز رندوم برایش ایجاد کرده و آن اطلاعات (نام کاربری(شماره تلفن) و رمز عبور) را برایش پیامک میکنیم.

6- کاربر را در وبسایت لاگین میکنیم.

7- شماره تلفن و کد تایید را از session پاک کرده و کاربر را به صفحه تکمیل فرم اطلاعات گیرنده سفارش(order-create) منتقل میکنیم.

**ایجاد تمپلیت برای دریافت کد تایید:**

`app (order)/templates/forms/verify_code.html`

```jinja
<h2>verification code</h2>

<form action="" method="post">
    {% csrf_token %}

    <input type="text" name="code" placeholder="Enter your code">

    <input type="submit" value="send">
</form>

{% for message in messages %}
	{{ message }}
{% endfor %}
```

### دریافت مشخصات سفارش از کاربر

در اپ order، دو مدل ایجاد کردیم؛ Order(اطلاعت گیرنده سفارش)، OrderItem(آیتم های سفارش همان کالاهای سفارش داده شده)

> حالا یک فرم ایجاد میکنیم که اطلاعات گیرنده سفارش را از کاربر دریافت میکند و پس از آن براساس اطلاعات cart(سبد خرید) آبجکت های مدل OrderItem را ایجاد میکنیم.

**ایجاد فرم اطلاعات گیرنده سفارش:**

`app directory(orders)/forms.py`

```python
from django import forms
from .models import Order


class OrderCreateForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['firstname', 'lastname', 'phone', 'address', 'postal_code', 'province', 'city']
```

**توضیحات:**

فرم را از فیلدهای مدل Order ایجاد میکنیم.

**نکته:** در این فرم شماره تلفن را نیز دریافت میکنیم، چون شماره تلفن گیرنده سفارش میباشد و ممکن است همان شماره کاربر نباشد.(شماره ای که با آن لاگین کرده است.)

**ایجاد view برای فرم اطلاعات گیرنده سفارش:**

این view به url (آدرس) order-create متصل میباشد.

`app directory(orders)/views.py`

```python
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from .forms import *
from .models import OrderItem, Order
from cart.cart import Cart
# app "cart" => "cart.py" file => "Cart" class


@login_required
def order_create(request):
    cart = Cart(request)

    if request.method == 'POST':
        form = OrderCreateForm(request.POST)
        if form.is_valid():
            # Order Info
            order = form.save(commit=False)
            order.buyer = request.user
            order.save()

            # ———————————— Order Item ————————————
            for item in cart:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    price=item['price'],
                    quantity=item['quantity'],
                    weight=item['weight'],
                )
            # —————————————————————————————————————

            # clean cart
            cart.clear()
            request.session['order_id'] = order.id

            # انتقال به صفحه پرداخت هزینه سفارش
            return redirect('orders:request')
    else:
        form = OrderCreateForm()

    return render(request, 'forms/order_create.html', {'form': form, 'cart': cart})
```

**توضیحات:**

1- برای این view از دکوراتور **login_required** استفاده میکنیم؛ چون برای این صفحه کاربر باید در وبسایت لاگین کرده باشد.

2- یک آبجکت از کلاس Cart ایجاد میکنیم. / با استفاده از آن آبجکت های OrderItem را ایجاد میکنیم.

3- اطلاعات گیرنده سفارش را ا تمپلیت دریافت کرده و فیلدهای آنرا اعتبارسنجی میکنیم.

4- چنانچه فیلدها مشکلی نداشته باشند، با متد save اطلاعات سفارش را به همراه کاربر فعلی در دیتابیس ذخیره میکنیم.

5- روی آبجکت cart حلقه میزنیم و براساس اطلاعات آن، برای مدل OrderItem آبجکت های مربوط به سفارش فعلی را ایجاد میکنیم.

> وقتی روی آبجکت cart حلقه میزنیم، در هر ایتریشن یک محصول از سبد خرید با اطلاعاتی نظیر تعداد کالا، قیمت کالا، و... را برمیگرداند.
>
> هر item یک دیکشنری از اطلاعات محصول میباشد. / با توجه به هر آیتم یک آبجکت برای مدل OrderItem ایجاد میکنیم.

6- اطلاعات cart (سبد خرید) را با متد clear پاک میکنیم.

7- آیدی سفارش (order_id) را در session ذخیره میکنیم. / در view های بعدی استفاده میشود.

8- کاربر را به صفحه درگاه پرداخت منتقل میکنیم. / در ادامه url و view آنرا ایجاد میکنیم.

**ایجاد تمپلیت فرم اطلاعات گیرنده سفارش:**

`app(orders)/templates/forms/order_create.html`

```jinja
<h2>Your chosen products</h2>

<ul>
    {% for item in cart %}
        <li>
            {{ item.quantity }} X {{ item.product.name }} =>
            {{ item.total }}
        </li>
    {% endfor %}
</ul>

<!-- ———————————————————————————————————————————————————————— -->

<h2>Complete the order information</h2>

<form action="" method="post">
    {% csrf_token %}
    
    {{ form.as_p }}

    <input type="submit" value="send">
</form>
```

### اتصال درگاه پرداخت (زرین پال) به فروشگاه

برای استفاده از درگاه پرداخت، در آن وبسایت ثبت نام کرده و عملیات احراز هویت را تکمیل میکنیم.

لازم است یکسری تنظیمات را در **settings.py** پیاده سازی کنیم:

`project directory/settings.py`

```python
# ZarinPal Info
MERCHANT = "00000000-0000-0000-0000-000000000000"
SANDBOX = False
```

**توضیحات:**

- وقتی برای درگاه پرداخت ثبت نام کردیم، توی تنظیمات یک کد برای ما ایجاد میشود؛ آنرا برای متغیر MERCHANT ست میکنیم. / این مقدار فعلی ساختار آنرا نشان میدهد.

- برای SANDBOX مقدار False را مشخص میکنیم؛ تا از تنظیمات پیشفرض استفاده نکند.

> در صورت نبود ماژول **requests** آنرا نصب میکنیم.
>
> pip install requests

**ایجاد url های مربوط به درگاه پرداخت:**

دو تا url به url های اپ orders اضافه میکنیم.

`app directory(orders)/urls.py`

```python
urlpatterns = [
    # ...
    path('request/', views.send_request, name='request'),
    path('verify/', views.verify, name='verify'),
]
```

> view های مربوط به این دو url  را هم ایجاد میکنیم.
>
> اولی برای مراحل قبل از ورود به درگاه پرداخت هست و دیگری مراحل بعد از اینکه از درگاه پرداخت برمیگردد.

**ایجاد view های مربوط به درگاه پرداخت:**

این داده ها را از گیتهابی که در سایت زرین پال گفته شده برمیداریم؛ ولی ساختار آنها ایراداتی داره بنابراین از نسخه ویرایش شده در pull request آن  استفاده میکنیم که آن هم باز نیاز به تغییراتی دارد.

`github(zarinpal)`

```python
from django.conf import settings
from django.shortcuts import redirect
from django.http import HttpResponse
import requests
import json


#? sandbox merchant 
if settings.SANDBOX:
    sandbox = 'sandbox'
else:
    sandbox = 'www'


ZP_API_REQUEST = f"https://{sandbox}.zarinpal.com/pg/rest/WebGate/PaymentRequest.json"
ZP_API_VERIFY = f"https://{sandbox}.zarinpal.com/pg/rest/WebGate/PaymentVerification.json"
ZP_API_STARTPAY = f"https://{sandbox}.zarinpal.com/pg/StartPay/"

amount = 1000  # Rial / Required
description = "توضیحات مربوط به تراکنش را در این قسمت وارد کنید"  # Required
phone = 'YOUR_PHONE_NUMBER'  # Optional
# Important: need to edit for real server.
CallbackURL = 'http://127.0.0.1:8080/verify/'


def send_request(request):
    data = {
        "MerchantID": settings.MERCHANT,
        "Amount": amount,
        "Description": description,
        "Phone": phone,
        "CallbackURL": CallbackURL,
    }
    data = json.dumps(data)
    # set content length by data
    headers = {'accept': 'application/json', 'content-type': 'application/json', 'content-length': str(len(data))}
    try:
        response = requests.post(ZP_API_REQUEST, data=data, headers=headers, timeout=10)

        if response.status_code == 200:
            response_json = response.json()
            authority = response_json['Authority']
            if response_json['Status'] == 100:
                return redirect(ZP_API_STARTPAY+authority)
            else:
                return HttpResponse('Error')
        return HttpResponse('response failed')
    except requests.exceptions.Timeout:
        return HttpResponse('Timeout Error')
    except requests.exceptions.ConnectionError:
        return HttpResponse('Connection Error')


def verify(request):
    authority = request.GET.get('Authority')
    status = request.GET.get('Status')
    if status == 'OK' and authority:
        data = {
            "MerchantID": settings.MERCHANT,
            "Amount": amount,
            "Authority": authority,
        }
        data = json.dumps(data)
        # set content length by data
        headers = {'accept': 'application/json', 'content-type': 'application/json', 'content-length': str(len(data))}
        try:
            response = requests.post(ZP_API_VERIFY, data=data, headers=headers)
            if response.status_code == 200:
                response_json = response.json()
                reference_id = response_json['RefID']
                if response['Status'] == 100:
                    return HttpResponse(f'successful , RefID: {reference_id}')
                else:
                    return HttpResponse('Error')
            return HttpResponse('response failed')
        except requests.exceptions.Timeout:
            return HttpResponse('Timeout Error')
        except requests.exceptions.ConnectionError:
            return HttpResponse('Connection Error')
    else:
        return HttpResponse('Not ok')
```

**بریم این دو تا view را تغییر بدیم:**

1- amount, description, phone مقدار ثابت ندارند پس آنها را در view ها تعریف میکنیم نه به صورت یک متغیر.

2- برای CallbackURL باید آدرس حقیقی وبسایت را وارد کنیم ولی در حال حاضر از آدرس local-host با پورت 8000 استفاده میکنیم.

> <span class="rtl-text">**نکته:** اگر یادتان باشد در فایل urls.py پروژه برای url های اپ order مشخص کردیم که با عبارت <span class="en-text">order/</span> شروع شوند در نتیجه باید order را قبل از verify اضافه کنیم.</span>
>
> <span class="rtl-text">پس اینجا url ما میشود <span class="en-text">http://127.0.0.1:8000/order/verify/</span></span>

**ایجاد تغییرات در ویوی send_request:**

1- مقادیر لازم را از آبجکت سفارش فعلی میگیریم؛ بنابراین با استفاده از آیدی سفارش (order_id) که در view قبلی در سشن ذخیره کردیم آبجکت سفارش را از دیتابیس دریافت میکنیم.

2- برای توضیحات سفارش اسم محصولات خریداری شده را نمایش میدهیم./ روی order-item های این سفارش حلقه میزنیم و اسم محصول را به صورت رشته ذخیره میکنیم.

3- **Amount:** هزینه نهایی جهت پرداخت میباشد(هزینه محصولات + هزینه پستی)؛ با استفاده از متد <span class="en-text">get_final_cost()</span> برای آبجکت order آنرا بدست می آوریم.

4- شماره تلفن خریدار را با استفاده از دستور request.user.phone مشخص میکنیم.

**ایجاد تغییرات در ویوی verify:**

1- در این view هم با استفاده از order_id آبجکت سفارش فعلی را در یک متغیر ذخیره میکنیم.

2- مقدار **Amount** را با استفاده از متد <span class="en-text">get_final_cost()</span> محاسبه میکنیم.

3- <span class="rtl-text"> شرط `if response['Status'] == 100` باید به `if response_json['Status'] == 100` تغییر کند.</span>

4- وقتی کد وضعیت 100 هست؛ یعنی پرداخت موفق بوده بنابراین باید **موجودی آن محصولات** و نیز **وضعیت پرداخت کاربر** تغییر کند.

```python
if response_json['Status'] == 100:
    # change inventory of products
    for item in order.items.all():
        item.product.inventory -= item.quantity
        item.product.save()

    # change paid status...
    order.paid = True
    order.save()
```

**نسخه تغییر یافته view های مربوط به درگاه پرداخت:**

در این نسخه تغییراتی که در بالا توضیح دادیم اعمال شده اند.

`app directory(orders)/views.py`

```python
# zarin pal info : اطلاعات درگاه پرداخت

# ? sandbox merchant
if settings.SANDBOX:
    sandbox = 'sandbox'
else:
    sandbox = 'www'


ZP_API_REQUEST = f"https://{sandbox}.zarinpal.com/pg/rest/WebGate/PaymentRequest.json"
ZP_API_VERIFY = f"https://{sandbox}.zarinpal.com/pg/rest/WebGate/PaymentVerification.json"
ZP_API_STARTPAY = f"https://{sandbox}.zarinpal.com/pg/StartPay/"


# Important: need to edit for real server.
CallbackURL = 'http://127.0.0.1:8000/order/verify/'


def send_request(request):
    order = get_object_or_404(Order, id=request.session.get('order_id'))

    description = ""
    for item in order.items.all():
        description += item.product.name + ', '

    data = {
        "MerchantID": settings.MERCHANT,
        "Amount": order.get_final_cost(),
        "Description": description,
        "Phone": request.user.phone,
        "CallbackURL": CallbackURL,
    }

    data = json.dumps(data)
    # set content length by data
    headers = {'accept': 'application/json', 'content-type': 'application/json', 'content-length': str(len(data))}
    try:
        response = requests.post(ZP_API_REQUEST, data=data, headers=headers, timeout=10)

        if response.status_code == 200:
            response_json = response.json()
            authority = response_json['Authority']
            if response_json['Status'] == 100:
                return redirect(ZP_API_STARTPAY+authority)
            else:
                return HttpResponse('Error')
        return HttpResponse('response failed')
    except requests.exceptions.Timeout:
        return HttpResponse('Timeout Error')
    except requests.exceptions.ConnectionError:
        return HttpResponse('Connection Error')


def verify(request):
    order = get_object_or_404(Order, id=request.session.get('order_id'))

    data = {
        "MerchantID": settings.MERCHANT,
        "Amount": order.get_final_cost(),
        "Authority": request.GET.get('Authority'),
    }
    data = json.dumps(data)
    # set content length by data
    headers = {'accept': 'application/json', 'content-type': 'application/json', 'content-length': str(len(data))}
    try:
        response = requests.post(ZP_API_VERIFY, data=data, headers=headers)
        if response.status_code == 200:
            response_json = response.json()
            reference_id = response_json['RefID']
            if response_json['Status'] == 100:
                for item in order.items.all():
                    item.product.inventory -= item.quantity
                    item.product.save()

                # change paid status...
                order.paid = True
                order.save()

                return HttpResponse(f'successful , RefID: {reference_id}')
            else:
                return HttpResponse('Error')

        # clean Order-Id from session
        del request.session['order_id']

        return HttpResponse('response failed')
    except requests.exceptions.Timeout:
        return HttpResponse('Timeout Error')
    except requests.exceptions.ConnectionError:
        return HttpResponse('Connection Error')
```

### صفحات وضعیت پرداخت، لیست و جزئیات سفارش

برای وضعیت پرداخت کاربر(پرداخت موفق و یا زمانیکه پرداخت با شکست مواجه میشود) یک تمپلیت ایجاد میکنیم. / این تمپلیت بجای HttpResponse در ویوی verify نمایش داده میشود.

**اعمال تغییرات در ویوی مربوط به verify:**

`app directory(orders)/views.py`

```python
def verify(request):
    order = get_object_or_404(Order, id=request.session.get('order_id'))

    data = {
        "MerchantID": settings.MERCHANT,
        "Amount": order.get_final_cost(),
        "Authority": request.GET.get('Authority'),
    }
    data = json.dumps(data)
    # set content length by data
    headers = {'accept': 'application/json', 'content-type': 'application/json', 'content-length': str(len(data))}
    try:
        response = requests.post(ZP_API_VERIFY, data=data, headers=headers)
        if response.status_code == 200:
            response_json = response.json()
            reference_id = response_json['RefID']
            if response_json['Status'] == 100:
                for item in order.items.all():
                    item.product.inventory -= item.quantity
                    item.product.save()

                # change paid status...
                order.paid = True
                order.save()

                return render(request, 'orders/payment-tracking.html', {'success': True, 'RefID': reference_id, 'order_id': order.id})
            else:
                return render(request, 'orders/payment-tracking.html', {'success': False})

        # clean Order-Id from session
        del request.session['order_id']

        return HttpResponse('response failed')
    except requests.exceptions.Timeout:
        return HttpResponse('Timeout Error')
    except requests.exceptions.ConnectionError:
        return HttpResponse('Connection Error')
```

**ایجاد تمپلیت وضعیت پرداخت کاربر:**

`app(orders)/templates/orders/payment-tracking.html`

```jinja
{% extends 'parent/base/base_template.html' %}

{% load static %}
{% block title %}payment{% endblock %}

{% block content %}
	{% if success %}
        <div class="success">
            <h2>پرداخت موفق</h2>

            <p>شماره پیگیری: {{ RefID }}</p>
            <p>شماره سفارش: {{ order_id }}</p>
        </div>

    {% else %}
        <div class="failure">
            <h2>پرداخت ناموفق</h2>
            <p>پرداخت با شکست مواجه شد.</p>
        </div>
	{% endif %}

    <a href="{% url 'shop:products-list' %}" class="back-btn">بازگشت به لیست محصولات</a>
{% endblock %}
```

**ایجاد url  برای صفحات (لیست سفارشات و جزئیات هر سفارش):**

`app directory(orders)/urls.py`

```python
urlpatterns = [
    # ...
    path('orders-list/', views.orders_list, name='orders_list'),
    path('order-detail/<int:order_id>/', views.order_detail, name='order_detail'),
]
```

**ایجاد view  برای صفحات (لیست سفارشات و جزئیات هر سفارش):**

`app directory(orders)/views.py`

```python
def orders_list(request):
    user = request.user
    orders = Order.objects.filter(buyer=user)

    context = {
        'orders': orders,
    }

    return render(request, 'orders/order_list.html', context=context)

# —————————————————————————————————————————————————————————————————————

def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    order_items = OrderItem.objects.filter(order=order)

    context = {
        'order': order,
        'order_items': order_items,
    }

    return render(request, 'orders/order_detail.html', context=context)
```

**توضیحات:**

1- در view لیست سفارشات، تمام سفارشات مربوط به کاربر فعلی وبسایت را از دیتابیس دریافت کرده و در یک متغیر ذخیره میکنیم؛ آنرا به تمپلیت ارسال کرده و با استفاده از حلقه سفارشات کاربر را در آن صفحه نمایش میدهیم.

2- در view  جزئیات هر سفارش، با توجه به آیدی سفارش، آن سفارش را از دیتابیس دریافت میکنیم؛ آیتم های آن سفارش را هم دریافت میکنیم تا آنها را در تمپلیت نمایش دهیم.

**ایجاد تمپلیت برای نمایش لیست سفارشات کاربر:**

`app(orders)/templates/orders/order_list.html`

```jinja
{% extends 'parent/base/base_template.html' %}

{% load static %}
{% block title %}order's list{% endblock %}

{% block content %}
    <h1>لیست سفارشات</h1>

    {% if orders %}
    	<table>
            <thead>
                <tr>
                    <th>شماره سفارش</th>
                    <th>تاریخ سفارش</th>
                    <th>وضعیت سفارش</th>
                </tr>
            </thead>

            <tbody>
                {% for order in orders %}
                    <tr>
                        <td><a href="{% url 'orders:order_detail' order.id %}">{{ order.id }}</a></td>

                        <td>{{ order.created }}</td>

                        {% if order.paid %}
                            <td>پرداخت موفق ✔️</td>
                        {% else %}
                            <td>پرداخت ناموفق ✖️</td>
                        {% endif %}
                    </tr>
                {% endfor %}
            </tbody>
        </table>

    {% else %}
        هیچ سفارشی ثبت نشده است!
    {% endif %}

{% endblock %}
```

**ایجاد تمپلیت برای نمایش جزئیات هر سفارش:**

`app(orders)/templates/orders/order_detail.html`

```jinja
{% extends 'parent/base/base_template.html' %}

{% load static %}
{% block title %}order detail{% endblock %}

{% block content %}
    <h1>سفارش {{ order.id }}</h1>

    <h2>order item's</h2>
    <div class="products">
        {% for order_item in order_items %}
            <div class="product">
                <img src="{{ order_item.product.images.first.image_file.url }}" alt="" width="150px">
                <h3>{{ order_item.product.name }}</h3>

                <span>{{ order_item.quantity }} X {{ order_item.price }} => {{ order_item.get_cost }}</span>
            </div>
            <hr>
        {% endfor %}
        
    </div>

    <hr>

    <div class="info">
        <h2>order info</h2>

        <p>first name: {{ order.firstname }}</p>
        <p>last name: {{ order.lastname }}</p>
        <p>phone: {{ order.phone }}</p>

        <p>province: {{ order.province }}</p>
        <p>city: {{ order.city }}</p>
        <p>full address: {{ order.address }}</p>
        <p>postal code: {{ order.postal_code }}</p>
    </div>
{% endblock %}
```

### قابلیت خروجی فایل Excel از سفارش ها در پنل ادمین

میخواهیم اکشنی ایجاد کنیم که اطلاعات سفارش ها را به صورت Excel در خروجی تحویل دهد.

> برای این کار لازم است که پکیج **openpyxl** را نصب کنیم.

`terminal`

```terminal
pip install openpyxl
```

**بریم اکشن را در فایل admin.py ایجاد کنیم:**

لازم است که HttpResponse و openpyxl را ایمپورت کنیم.

`app directory(orders)/admin.py`

```python
from django.http import HttpResponse
import openpyxl


# ------------------------------- My Actions -------------------------------
def export_to_excel(modeladmin, request, queryset):
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="orders.xlsx"'

    # ---------------------------
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = 'Orders'
    # ---------------------------
    columns = ['ID', 'First Name', 'Last Name', 'Phone', 'Address', 'Postal Code', 'City', 'Province', 'Paid', 'Created']

    ws.append(columns)
    # ---------------------------
    for order in queryset:
        created = order.created.replace(tzinfo=None) if order.created else ''

        row = [order.id, order.firstname, order.lastname, order.phone, order.address, order.postal_code, order.city,
               order.province, order.paid, created]

        ws.append(row)
    # --------------------------
    wb.save(response)
    return response


export_to_excel.short_description = 'export to excel'
```

**توضیحات:**

> این اکشن به مدیر سایت امکان می‌دهد تا داده‌های یک queryset (مجموعه‌ای از داده‌ها که از یک مدل خاص در پایگاه داده جنگو انتخاب شده‌اند) را به صورت یک فایل Excel (با پسوند .xlsx) دانلود کند.

1- **نوشتن اکشن:** برای نوشتن اکشن، یک تابع ایجاد میکنیم که modeladmin, request, queryset را به عنوان **پارامتر** دریافت میکند.

- **modeladmin:** ارجاع میدهد به کلاس modeladmin.(یک نمونه از مدل ادمین که تابع اکشن از آن فراخوانی می‌شود.)

- **request:** درخواست HTTP که از سمت کلاینت (کاربر) به سرور ارسال شده است و باعث میشود که اکشن فعال شود.

- **queryset:** مجموعه‌ای از اشیاء که کاربر در پنل ادمین انتخاب کرده است.(در این اکشن؛ سفارش هایی که ادمین در **پنل ادمین** انتخاب کرده است تا به صورت اکسل خروجی داده شوند.)

2- **ایجاد پاسخ برای دانلود**:

```python
response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

response['Content-Disposition'] = 'attachment; filename="orders.xlsx"'
```

- **کلاس `HttpResponse`:** کلاس پاسخ‌دهی در جنگو است که در اینجا برای ایجاد فایل Excel استفاده شده است.

    > **HttpResponse:** شیئی که برای ارسال داده‌ها به مرورگر (کلاینت) استفاده می‌شود.

- **آرگومان `content_type`:** نوع محتوای فایل را مشخص می‌کند که اینجا به عنوان یک فایل اکسل تنظیم شده است.

    > <span class="rtl-text">نوع محتوای و داده را مشخص میکند. / به صورت زیر نشان داده میشود. با مثال</span>
    >
    > <span class="en-text">type/subtype(format) => image/jpg</span>

برای متغیر **response** باید مقدار هدر **Content-Disposition** را تغییر دهیم.

- **`Content-Disposition`:** به مرورگر می‌گوید که پاسخ باید به صورت یک فایل ضمیمه با نام "orders.xlsx" باشد (نه به عنوان محتوای یک صفحه وب).

    > **Content-Disposition:** هدر HTTP که مشخص می‌کند چگونه محتوای پاسخ باید پردازش شود، مثلاً به عنوان یک فایل قابل دانلود.
    >
    > **attachment:** مشخص میکند که که پاسخ ما باید به عنوان یک فایل ضمیمه برای دانلود باشد.
    >
    > **filename:** اسم فایل خروجی به همراه پسوند آن میباشد.

***خب حالا بریم سراغ ساخت فایل اکسل:***

3- **ایجاد فایل Excel با OpenPyXL**:

```python
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'Orders'
```

- `openpyxl.Workbook()`: Workbook درواقع یک فایل اکسل میباشد که میتوانیم چند sheet برایش مشخص کنیم. / پس با این دستور یک فایل اکسل ایجاد میکنیم.

- `wb.active`: برگه (Sheet) فعال در فایل اکسل را می‌گیرد.

- `ws.title = 'Orders'`: عنوان برگه اکسل را به "Orders" تغییر می‌دهد.

    > اتریبیوت title عنوان sheet فعال را تغییر میدهد.

4- **ایجاد و افزودن عنوان ستون‌ها**:

```python
columns = ['ID', 'First Name', 'Last Name', 'Phone', 'Address', 'Postal Code', 'City', 'Province', 'Paid', 'Created']
ws.append(columns)
```

- اسم ستون هایی که قراره در اکسل نمایش داده شوند را در یک لیست مشخص میکنیم.

- با متد append این لیست را به sheet فعال در فایل اکسل اضافه میکنیم.

5- **افزودن داده‌های سفارشات به اکسل**:

```python
for order in queryset:
    created = order.created.replace(tzinfo=None) if order.created else ''

    row = [order.id, order.firstname, order.lastname, order.phone, order.address, order.postal_code, order.city, order.province, order.paid, created]

    ws.append(row)
```

- **نکته:** نمیشه منطقه زمانی را در اکسل ذخیره کرد(ارور میدهد)؛ بنابراین باید منطقه زمانی(time zone)، را از تاریخ حذف کنیم.

    > برای این کار، برای هر سفارش تاریخ ایجاد را صدا زده و tzinfo (مخفف timezone info) را None میکنیم./ برای احتیاط شرط میگذاریم که اگر تاریخ وجود داشت؛ منطقه زمانی را پاک کن تا ارور ندهد.

- در حلقه for باید هر بار، برای ستون هایی که ایجاد کردیم به همان ترتیب، مقادیر را از سفارش دریافت کرده و آنها را به عنوان یک ردیف به اکسل اضافه کنیم.

    > برای تاریخ ایجاد از متغیری که ایجاد کردیم استفاده میکنیم. / تا منطقه زمانی نداشته باشد.


6- **ذخیره کردن فایل اکسل در پاسخ**:

```python
wb.save(response)
return response
```

- `wb.save(response)`: فایل اکسل در شیء پاسخ HTTP ذخیره می‌شود.

    > بعد از حلقه for  با استفاده از متد save، اطلاعات را ذخیره میکنیم؛ برای اینکه این فایل اکسل در متغیر response ذخیره شود، داخل پرانتزهای متد save عبارت response را مینویسیم.

- `return response`: پاسخ به کاربر بازگردانده می‌شود که باعث دانلود فایل اکسل خواهد شد.

7- در نهایت میتوانیم برای اکشن یک اسم دلخواه  مستعار مشخص نیم تا در پنل ادمین نمایش داده شود.

**معرفی اکشن به مدل ادمین Order:**

`app directory(orders)/admin.py`

```python
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'firstname', 'lastname', 'phone', 'province', 'city', 'paid')
    list_filter = ('paid', 'created', 'update')
    list_display_links = ['firstname']
    inlines = [OrdersItemInline]
    # معرفی اکشن به مدل ادمین:
    actions = [export_to_excel]
```

<hr>

#### اصطلاحات کلیدی:

میخواهیم در مورد `HttpResponse`, `content_type`, و `MIME-type` یکسری توضیحات اضافه تر بیان کنیم.(جهت درک بیشتر)

**1- HttpResponse**

**توضیح:**
`HttpResponse` یک کلاس در فریمورک جنگو است که برای ارسال پاسخ HTTP از سمت سرور به کلاینت استفاده می‌شود. این کلاس به شما اجازه می‌دهد تا محتوای پاسخ، هدرها، و کد وضعیت HTTP را تنظیم کنید.

> به عبارتی، هر زمان که یک درخواست به سرور ارسال می‌شود، سرور باید پاسخی را برگرداند. این پاسخ می‌تواند یک صفحه HTML، یک فایل، یا هر نوع داده دیگری باشد.


**2- content_type**

**توضیح:**
`content_type` یک ویژگی از شیء `HttpResponse` است که نوع محتوای داده‌ای که در پاسخ ارسال می‌شود را مشخص می‌کند. این نوع محتوا با استفاده از MIME-type مشخص می‌شود و به مرورگر می‌گوید که چگونه باید داده‌های دریافت‌شده را پردازش کند.

**3- MIME-type**

**توضیح:**
MIME-type (Multipurpose Internet Mail Extensions) نوعی استاندارد برای مشخص کردن نوع محتوای داده‌ها در اینترنت است. این نوع اطلاعات به مرورگر یا سایر برنامه‌ها کمک می‌کند تا بدانند چگونه داده‌ها را پردازش کنند و آنرا نمایش دهند.

**فرمت استاندارد MIME به شکل `type/subtype` است و هر بخش آن توضیح‌دهنده‌ی نوع و زیرنوع محتوای داده‌هاست.**


- **type** (نوع): دسته‌بندی کلی محتوا را مشخص می‌کند، مانند `text`، `image`، `application`، `audio`، `video` و غیره.
- **subtype** (زیرنوع): نوع خاص‌تری از محتوا را در آن دسته‌بندی مشخص می‌کند. برای مثال، در دسته‌بندی `text`، زیرنوع می‌تواند `html`، `plain` و ... باشد.


**`text/plain`**:
- **type**: `text`
- **subtype**: `plain`
- **کاربرد**: برای ارسال متن ساده بدون قالب‌بندی.

**مثال‌ها:**
- `text/plain` برای فایل‌های متنی ساده
- `image/jpeg` برای تصاویر JPEG
- `application/json` برای داده‌های JSON
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` برای فایل‌های اکسل (xlsx)

***جمع‌بندی:***

- **HttpResponse**: کلاس پاسخ‌دهی در جنگو برای ارسال داده‌ها به کاربر.

- **content_type**: نوع محتوای ارسالی در پاسخ که نحوه‌ی پردازش آن را برای مرورگر مشخص می‌کند.

- **MIME-type**: استانداردی برای تعیین نوع داده‌ها که به مرورگر کمک می‌کند تا داده‌ها را به درستی نمایش یا پردازش کند. 

### تمرینات فصل 11 (مهم)
