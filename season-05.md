## فصل پنجم: نصب و راه اندازی پایگاه داده

### نصب پایگاه داده postgresql

از وبسایت PostgreSQL به آدرس [***postgresql.org***](https://www.postgresql.org/)، اپلیکیشن postgres را دانلود و آن را نصب میکنیم.

---

download

از بخش دانلود وبسایت سیستم عامل خود (windows, linux, macOS)  را انتخاب میکنیم حالا روی لینک Download the installer  (نوشته شده در ابتدای صفحه) کلیک میکنیم و یکی از ورژن ها را دانلود میکنیم.

---

installation

مسیرهای نصبی را ترجیحاً همان مسیر پیشفرض مثله (C:\\Program File\\PostgreSQL\\<span class="en-text">\<version></span>) بگذارید باشد./ تیک گزینه ها را بگذارید به صورت پیشفرض فعال باشند.

در ادامه نصب، از ما یک رمز درخواست میکنه که برای استفاده از postgres به آن نیاز داریم./ رمز قابل مشاهده نیست پس حواسمون باشه چه کاراکترهایی وارد میکنیم.

این رمز برای super-user هست./ نام کاربری برای super-user به صورت پیشفرض postgres میباشد. / از آن برای بخش های مدیریتی استفاده میشود.

فیلد port و سایر موارد را هم بگذارید پیشفرض بمانند./ حالا منتظر میمانیم تا نصب کامل شود.

در پنجره Stack Builder که باز شده postgres را انتخاب و next را میزنیم ، در صفحه بعدی اگر هرکدام از این ابزارها را نیاز داشتید می توانید انتخاب کنید فعلا با زدن دکمه cancel از آنها صرف نظر میکنیم.

### کار با SQL Shell (psql)

میتوان با جستجو sql shell یا psql آنرا اجرا کنیم.

اگر فیلدی را خالی رها کرده و اینتر را بزنیم از مقدار پیشفرض داخل [] استفاده میکند./ یا اینکه میتوانیم مقدار مدنظر خود را وارد کنیم.

**برای اولین بار هیچ کاربری بجز super-user وجود ندارد پس username را همین پیشفرض انتخاب میکنیم و در قسمت password، رمزی را که هنگام نصب postgres مشخص کردیم را باید وارد کنیم.**

`sql shell:`

```sqlshell
Server [local host]: <your_host or blank>
Database [postgres]: <your_database_name or blank>
Port [5432]: <your_port or blank>
Username [postgres]: <ypur_username or blank>
Password for user postgres: <password during installation>
```

بعد از این تنظیمات، دیتابیس آماده استفاده و کد زدن میباشد.

توی دستورات SQL باید انتهای کد از علامت (;) استفاده کنیم.

#### ایجاد یک user جدید

`sql shell:`

```sqlshell
create user <name> with encrypted password 'password';
```

پس از ایجاد یک کاربر جدید برای دفعات بعدی که خواستیم وارد psql, sql shell بشویم چنانچه خواستیم از طریق این کاربر جدید وارد شویم باید همین رمزی که در بالا برایش مشخص کرده ایم را بزنیم نه رمز super-user را.

وقتی برای فیلد Username یکی از نام کاربری ها را که ایجاد کرده ایم وارد کنیم در بخش Password مینویسه رمز این کاربر را وارد کنید./ پس هر کاربر ایجاد شده با رمز خودش وارد میشود.

---

#### دادن دسترسی کامل به کاربر

`sql shell:`

```sqlshell
grant all privileges on database <database-name> to <user>;
```

به این ترتیب به کاربر مدنظر روی آن دیتابیس دسترسی کامل میدهیم.

---

با دستور <span class="en-text">`\q`</span>، از psql خارج میشود.

`sql shell:`

```sqlshell
\q;
```

---

با دستور <span class="en-text">`\du`</span>، لیست userها را نشان میدهد.

`sql shell:`

```sqlshell
\du;
```

---

با دستور <span class="en-text">`\dt`</span>، لیست جدول های دیتابیس فعلی را نشان میدهد.

`sql shell:`

```sqlshell
\dt;
```

---

با دستور <span class="en-text">`\l`</span>، لیست دیتابیس ها را نشان میدهد.

`sql shell:`

```sqlshell
\l;
```

---

#### حذف user

`sql shell:`

```sqlshell
drop owned by <user>;
drop user <user>
```

اولین دستور، دسترسی های کاربر را از بین میبرد.

دومین دستور، کاربر را حذف میکند.

همچنین میتوان table و دیتابیس ها را حذف کرد:

`sql shell:`

```sqlshell
drop table <table-name>
```

`sql shell:`

```sqlshell
drop database <database-name>
```

---

#### ایجاد دیتابیس

`sql shell:`

```sqlshell
create database <database-name>;
```

---

#### سوییچ کردن بین دیتابیس ها

`sql shell:`

```sqlshell
\c <database-name>;
```

اسم دیتابیسی که مشخص میکنیم باید توی لیست دیتابیس ها موجود باشه./ مگرنه ارور میده

---

#### استفاده از psql توی cmd

باید آنرا توی متغیرهای محیطی(Environment Variables) ویندوز تعریف کنیم.

حالا چطور؟

به محل نصب postgres رفته و آدرس دایرکتوری bin را برمیداریم.

مثله (C:\\Program File\\PostgreSQL\\16\\bin) ممکنه ورژن برای شما متفاوت باشد.

حالا Environment Variables را جستجو کرده و آنرا اجرا میکنیم./ حالا روی path دابل کلیک کرده با new یک مسیر جدید ایجاد کرده و مسیر bin را آنجا paste میکنیم.(مثله: C:\\Program File\\PostgreSQL\\16\\bin)

حالا توی cmd با نوشتن psql میتوان از postgres استفاده کرد.

### کار با pgAdmin

وقتی وارد pgadmin میشویم از ما رمز درخواست میکند که همان رمز super-user میباشد(رمزی که در هنگام نصب وارد کردیم)

[![Enter-Password](https://res.cloudinary.com/am-er/image/upload/v1719213412/01-Enter-Password_nuidfx.png)](https://res.cloudinary.com/am-er/image/upload/v1719213412/01-Enter-Password_nuidfx.png)

اپلیکیشن pgadmin حالت گرافیکی postgres برای کار و مدیریت کردن دیتابیس هست./ایجاد(database, user, table)، حذف و یا آپدیت آنها

وقتی در محیط گرافیکی یکی از موارد بالا مثل ایجاد یک دیتابیس را انجام میدهیم کد SQL آن را هم به ما نشان میدهد که به درک و یا یادگیری ما کمک میکند.

[![creating](https://res.cloudinary.com/am-er/image/upload/v1719213431/02-Create-all_lnxm9f.png)](https://res.cloudinary.com/am-er/image/upload/v1719213431/02-Create-all_lnxm9f.png)

#### ایجاد دیتابیس

مرحله 1:

[![Create-Database-01](https://res.cloudinary.com/am-er/image/upload/v1719213448/03-Create-Database-01_sgcwpg.png)](https://res.cloudinary.com/am-er/image/upload/v1719213448/03-Create-Database-01_sgcwpg.png)

مرحله 2:

[![Create-Database-02](https://res.cloudinary.com/am-er/image/upload/v1719213464/04-Create-Database-02_mlrmjw.png)](https://res.cloudinary.com/am-er/image/upload/v1719213464/04-Create-Database-02_mlrmjw.png)

نمایش ساختار SQL:

[![Create-Database-03](https://res.cloudinary.com/am-er/image/upload/v1719213478/05-Create-Database-03_utmmrm.png)](https://res.cloudinary.com/am-er/image/upload/v1719213478/05-Create-Database-03_utmmrm.png)

#### ایجاد جدول در دیتابیس

جداول هر دیتابیس در بخش Schemas آن دیتابیس وجود دارند.

مرحله 1:

[![Create-Table-01](https://res.cloudinary.com/am-er/image/upload/v1719213479/06-Create-Table-01_puwfwb.png)](https://res.cloudinary.com/am-er/image/upload/v1719213479/06-Create-Table-01_puwfwb.png)

مرحله 2:

[![Create-Table-02](https://res.cloudinary.com/am-er/image/upload/v1719213480/07-Create-Table-02_podr0o.png)](https://res.cloudinary.com/am-er/image/upload/v1719213480/07-Create-Table-02_podr0o.png)

مرحله 3:

[![Create-Table-03](https://res.cloudinary.com/am-er/image/upload/v1719213510/08-Create-Table-03_yanuqi.png)](https://res.cloudinary.com/am-er/image/upload/v1719213510/08-Create-Table-03_yanuqi.png)

مرحله 4:

[![Create-Table-04](https://res.cloudinary.com/am-er/image/upload/v1719213511/09-Create-Table-04_it71hb.png)](https://res.cloudinary.com/am-er/image/upload/v1719213511/09-Create-Table-04_it71hb.png)

نمایش ساختار SQL:

[![Create-Table-05](https://res.cloudinary.com/am-er/image/upload/v1719213511/10-Create-Table-05_cnsla0.png)](https://res.cloudinary.com/am-er/image/upload/v1719213511/10-Create-Table-05_cnsla0.png)

#### ایجاد User

مرحله 1:

[![Create-User-01](https://res.cloudinary.com/am-er/image/upload/v1719213553/11-Create-User-01_abjjbh.png)](https://res.cloudinary.com/am-er/image/upload/v1719213553/11-Create-User-01_abjjbh.png)

مرحله 2:

[![Create-User-02](https://res.cloudinary.com/am-er/image/upload/v1719213554/12-Create-User-02_o0f4aq.png)](https://res.cloudinary.com/am-er/image/upload/v1719213554/12-Create-User-02_o0f4aq.png)

مرحله 3:

[![Create-User-03](https://res.cloudinary.com/am-er/image/upload/v1719213555/13-Create-User-03_mn9omw.png)](https://res.cloudinary.com/am-er/image/upload/v1719213555/13-Create-User-03_mn9omw.png)

مرحله 4:

[![Create-User-04](https://res.cloudinary.com/am-er/image/upload/v1719213556/14-Create-User-04_vupavc.png)](https://res.cloudinary.com/am-er/image/upload/v1719213556/14-Create-User-04_vupavc.png)

مرحله 5:

[![Create-User-05](https://res.cloudinary.com/am-er/image/upload/v1719213557/15-Create-User-05_vllx8e.png)](https://res.cloudinary.com/am-er/image/upload/v1719213557/15-Create-User-05_vllx8e.png)

نمایش ساختار SQL:

[![Create-User-06](https://res.cloudinary.com/am-er/image/upload/v1719213558/16-Create-User-06_zgdzq3.png)](https://res.cloudinary.com/am-er/image/upload/v1719213558/16-Create-User-06_zgdzq3.png)

> در این ساختار گرافیکی میتوان از کدهای SQL هم استفاده کرد.

### اتصال دیتابیس به پروژه و انتقال داده های دیتابیس قبلی

قبل از هرچیزی لازمه یک کاربر(بهتره تمام دسترسی ها را به کاربر خود بدهیم) و یک دیتابیس(همین کاربر جدید را برایش مشخص میکنیم) از طریق psql و یا pgadmin ایجاد کنیم.

---

اگر فرمت تاریخ داده های دیتابیس قبلی به فارسی(شمسی) بود ابتدا باید فیلدهای تاریخ را به حالت عادی برگردانیم.(هر جا از تاریخ جلالی استفاده کرده ایم را باید به حالت عادی خود برگردانیم) | سپس make migrations و migrate را اجرا میکنیم./ (مگرنه نمیتوان داده های دیتابیس قبلی را به دیتابیس جدید منتقل کرد.)

پس از انتقال داده ها به روی دیتابیس جدید دوباره تاریخ ها را فارسی میکنیم.

---

در اینجا میخواهیم نحوه استخراج داده های دیتابیس قبلی و انتقال آنها روی دیتابیس جدید را توضیح دهیم چنانچه داده های قبلی را نیاز ندارید و فقط میخواهید دیتابیس جدید را به پروژه خود معرفی کنید میتوانید از این توضیحات صرف نظر کنید:

اینها توی ترمینال استفاده میشوند./ توی پروژه جنگوی خود، ترمیتال را باز کرده و دستورات را اجرا میکنیم.

> با استفاده از dumpdata اطلاعات دیتابیس را استخراج میکنیم.

> با استفاده از loaddata اطلاعات را روی دیتابیس قرار میدهیم.

> با استفاده از python manage.py dumpdata --help میتوان دستورات dumpdata را مشاهده کرد.

`Terminal`

```powershell
python -Xutf8 manage.py dumpdata --indent=4 --output=blog_data.json
```

> <span class="rtl-text">دستور <span class="en-text">`-Xutf8`</span> برای جلوگیری از خطا و ارورهای احتمالی است، utf8-mode پایتون را فعال میکنیم تا دیتا به درستی ذخیره بشوند.</span>
>
> با دستور <span class="en-text">`--indent=4`</span> برایش فاصله گذاری(دندانه گذاری) مشخص میکنیم تا ساختار فایل بهم ریختگی داشته باشد
>
> با دستور <span class="en-text">`--output=<name>.json`</span> مشخص میکنیم داده های استخراج شده در چه فایلی(با چه نامی) ذخیره شوند.

این فایل خروجی در پروژه جنگو ما ذخیره میشود.

---

#### اتصال دیتابیس جدید به پروژه خود

`project directory/settings.py`

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': <database-name>,
        'USER': <user>,
        'PASSWORD': <user password>,
        'PORT': 5432,
    }
}
```

برای NAME، اسم دیتابیسی که ایجاد کردیم را وارد میکنیم.

برای USER، اسم کاربری که ایجاد کردیم را وارد میکنیم./(کاربری که میتواند به دیتابیس لاگین کند)

برای PASSWORD، رمز user را وارد میکنیم.

برای PORT، پورت پیشفرض postgres را وارد میکنیم.

---

پس از ایجاد تغییرات در settings.py(معرفی دیتابیس جدید به پروژه)،  ابتدا باید کتابخانه psycopg-binary را نصب کنیم و بعد از آن دستور migrate را اجرا میکنیم.

`Terminal`

```terminal
python -m pip install psycopg2-binary
```

```powershell
python manage.py migrate
```

#### انتقال داده های قبلی به روی دیتابیس جدید

`Terminal`

```powershell
python manage.py loaddata <output_file.json>
```

به این ترتیب اطلاعات داده های قبلی از روی فایل JSON به دیتابیس جدید منتقل میشوند./ حالا اگه خواستیم دوباره تاریخ ها را فارسی میکنیم.

---

خلاصه مراحل صورت گرفته:

ابتدا user و database را ایجاد میکنیم ، فیلدهای تاریخ را اگر فارسی هستند به حالت عادی برمیگردانیم.

> 1- با استفاده از dumpdata اطلاعات دیتابیس را استخراج میکنیم.    
> 2- دیتابیس جدید را به پروژه معرفی میکنیم(settings.py/DATABASES)    
> 3- با استفاده از loaddata اطلاعات را روی دیتابیس جدید قرار میدهیم.

اگر بخواهیم تاریخ ها فارسی باشند دوباره از تاریخ جلالی برای فیلد های تاریخ استفاده میکنیم.
