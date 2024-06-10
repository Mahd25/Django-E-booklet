## فصل اول

### فهرست مطالب

- [مراحل اولیه ایجاد پروژه جنگو](#مراحل-اولیه-ایجاد-پروژه-جنگو)
- [1. ایجاد محیط مجازی](#1.-ایجاد-محیط-مجازی)
- [2. نصب پکیج جنگو](#2.-نصب-پکیج-جنگو)
- [3. ایجاد پروژه جنگو](#3.-ایجاد-پروژه-جنگو)
- [4. دستور migrate](#4.-دستور-migrate)

### مراحل اولیه ایجاد پروژه جنگو <a id="مراحل-اولیه-ایجاد-پروژه-جنگو"></a>

1. ایجاد محیط مجازی
2. نصب پکیج جنگو
3. ایجاد پروژه
4. دستور migrate

#### 1. ایجاد محیط مجازی <a id="1.-ایجاد-محیط-مجازی"></a>

با استفاده از ماژول های (venv) و یا (virtualenv) محیط مجازی را ایجاد میکنیم.

نصب و استفاده از (virtualenv)

بیشتر برای ورژن های قدیمی تر مورد استفاده میباشد.

نصب (virtualenv)

``Terminal:``

```powershell
pip install virtualenv
```

ایجاد محیط مجازی با (virtualenv)

``Terminal:``

```powershell
virtualenv path\venv-name
```

 نمونه کد از ایجاد محیط مجازی

```powershell
virtualenv my-env
```

```powershell
virtualenv Desktop/my-project/my-env
```

یا

``Terminal:``

```powershell
virtualenv --python=python-version path\venv-name
```

 نمونه کد از ایجاد محیط مجازی

```powershell
virtualenv --python=python3.11 my-env
```

```powershell
virtualenv --python=python3.11 Desktop/my-project/my-env
```

استفاده از (venv)

``Terminal:``

```powershell
python -m venv path\venv-name
```

 نمونه کد از ایجاد محیط مجازی

```powershell
python -m venv my-env
```

```powershell
python -m venv Desktop/my-project/my-env
```

یا

``Terminal:``

```powershell
py -version venv path\venv-name
```

 نمونه کد از ایجاد محیط مجازی

```powershell
py -3.10 venv my-env
```

```powershell
py -3.10 venv Desktop/my-project/my-env
```

فعال کردن محیط مجازی برای استفاده

``CMD:``

```powershell
path\venv-name\Scripts\activate.bat
```

or

```powershell
path\venv-name\Scripts\activate
```

نمونه کد

``CMD:``

```powershell
Desktop\my-project\my-env\Scripts\activate.bat
```

غیرفعال کردن محیط مجازی

``Terminal:``

```powershell
path\venv-name\Scripts\deactivate.bat
```

یا

```powershell
path\venv-name\Scripts\deactivate
```

نمونه کد

```powershell
Desktop\myp-roject\my-env\Scripts\deactivate
```

#### 2. نصب پکیج جنگو <a id="2.-نصب-پکیج-جنگو"></a>

پس از فعال سازی محیط مجازی با دستور زیر جنگو را نصب میکنیم.

``Terminal:``

```powershell
pip install django
```

#### 3. ایجاد پروژه جنگو <a id="3.-ایجاد-پروژه-جنگو"></a>

``Terminal:``

```powershell
django-admin startproject project_name
```

#### 4. دستور migrate <a id="4.-دستور-migrate"></a>

دستور migrate که مسئول اعمال و عدم اعمال مهاجرت(migration) است.(یعنی تغییرات migration را روی دیتابیس اعمال میکنه)

باید در مسیری باشیم که فایل manage.py آنجا قرار دارد.

``Terminal:``

```powershell
python manage.py migrate
```
