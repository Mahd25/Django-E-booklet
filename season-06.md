## فصل ششم: اپلیکیشن بلاگ (بخش سوم)

### جستجوی ساده با field lookups و عملگر های کوئری

میخواهیم به پروژه خود قابلیت جستجو ساده اضافه کنیم.

> برای این کار لازمه برای آن form، URL، view ایجاد کنیم.

#### بریم برای فیلد جستجو، یک URL ایجاد کنیم.

`app directory/urls.py`

```python
urlpatterns = [
    # ...
    path('search/', views.post_search, name='post_search'),
]
```

> برای جستجو نیازی به مدل نیست؛ چون قرار نیست چیزی توی دیتابیس ذخیره شود.

#### خب بریم در forms.py فرم آن را ایجاد کنیم:

چون مدل نداریم فقط میشه فرم را از forms.Form ایجاد کرد.

یک فیلد برای جستجو ایجاد میکنیم.

`app directory/form.py`

```python
class SearchForm(forms.Form):
    query = forms.CharField()
```

خب حالا وقتشه فرم جستجو را در تمپلیت ایجاد کنیم؛ چون فیلد جستجو باید در تمام صفحات نمایش داده شود این فرم را در تمپلیت پایه یعنی base.html نمایش میدهیم. | فرم را در header.html ایجاد میکنیم که به base.html اضافه خواهد شد.

`templates/partials/header.html`

```jinja
<form action="{% url 'Blog:post_search' %}" method="get">
    <input type="text" name="query" required placeholder="عبارت مدنظر را وارد کنید">
    <input type="submit" value="search">
</form>
```

اترییوت method

> متد فرم را get انتخاب میکنیم؛ چون حالت محرمانگی ندارد و قرار نیست در دیتابیس ذخیره شود، صرفا یک عبارت هست که میتواند در URL نمایش داده شود.

اتریبیوت action

> اطلاعات فرم باید به URL که برای جستجو نوشتیم ارسال شود، پس از اتریبیوت action استفاده کرده و آن URL را برایش مشخص میکنیم.

> **نکته:**    
> در این فرم چون متد get بوده و نیازی به امنیت ندارد از {% csrf_token %} استفاده نمیکنیم.

#### نوشتن view مربوط به search

> query: عبارت جستجو شده    
> results: نتیجه جستجو    
>
> این دو مورد باید در هر صورت به تمپلیت ارسال شوند پس حالت خالی(بدون محتوا) آنها را هم ایجاد میکنیم، تا در تمپلیت نمایش دهیم، مثلا مشخص کنیم "هیچ نتیجه ای یافت نشد."

یه نکته درمورد request.GET:

> در فرم، برای فیلد search از اسم query استفاده کرده ایم، بنابراین وقتی عبارتی جستجو شود در خروجی request.GET کلمه query وجود خواهد داشت.

```python
{'query': [عبارت جستجو شده]}
```

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            results = Post.published.filter(description__icontains=query)

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

1- اگر شرط اول برقرار باشد (درنتیجه query در request.GET باشد)، یعنی عبارتی جستجو شده است(عبارتی به view ارسال شده است).

2- حالا یک نمونه از فرم ایجاد کرده و request.GET را به آن ارسال میکنیم.

3- اگر با متد <span class="en-text">is_valid()</span> معتبر بودن فیلدهای فرم را بررسی نکنیم؛ **cleaned_data** کار نخواهد کرد!

> **پس لازمه که با استفاده از is_valid فرم را بررسی کنیم.**

**خب حالا نتایج جستجو را براساس عبارت جستجو شده بدست بیاوریم:**

- *قبلش بهتره با field_lookups آشنا بشیم!*

جنگو برای فیلتر کردن یکسری آپشن بنام field_lookups در اختیار ما قرار داده است | این موارد جستجو و فیلتر کردن را برای ما ساده تر میکنند.

> میتوانید در document جنگو به آدرس [field_lookups](https://docs.djangoproject.com/en/5.0/ref/models/querysets/#field-lookups) اطلاعات بیشتری درمورد field_lookups و انواع آن بدست بیاورید.

بریم با چند تا از field_lookups آشنا بشیم...

> contains و icontains: یک مقدار برایشان مشخص میکنیم حالا همان طور که از اسمشان پیداست؛ داده هایی که شامل آن مقدار باشند را نمایش میدهد.(به کمک آن دو داده هایی که **شامل** عبارت مدنظر ما هستند را بدست می آوریم)
>
> تفاوت آن دو در این است که contains نسبت به کوچک ویا بزرگ بودن حروف حساس است(Case-sensitive) ولی icontains حساسیتی ندارد(Case-insensitive)

ساختار استفاده از field_lookups به صورت زیر است:

```python
<field-name>__<field-lookups>

title__icontains='python'
```

> <span class="rtl-text">از field_lookups میتوان در متدهای <span class="en-text">get()</span>, <span class="en-text">filter()</span>, <span class="en-text">exclude()</span> استفاده کرد.</span>

4- **حالا توی view به کمک icontains پست هایی که توی description آنها عبارت جستجو شده  وجود دارد را یافته و در متغیر results ذخیره میکنیم تا به تمپلیت ارسال کنیم.**

#### حالا برای نمایش نتایج جستجو یک تمپلیت ایجاد میکنیم

`templates/blog/search_result.html`

```jinja
{% extends 'parent/base.html' %}

{% block title %} Post search {% endblock %}

{% block content %}

    {% if query %}
        {{ results.count }} search results for: {{ query }}
    {% endif %}
    <br>

    <div>
        {% for post in results %}
            <a href="{{ post.get_absolute_url }}">{{ post.title }}</a>
            <p>description:<br>{{ post.description }}</p>
            <br><hr>
        {% empty %}
            Nothing found...
        {% endfor %}
    </div>

{% endblock %}
```

اپراتورها برای کوئری ست ها:
> - <span class="en-text">and: &</span>    
> - <span class="en-text">or: |</span>    
> - <span class="en-text">xor: ^</span>    

    

> <span class="rtl-text">xor: یعنی یا اولی یا دومی ولی هردو نه</span>

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            results1 = Post.published.filter(title__icontains=query)
            results2 = Post.published.filter(description__icontains=query)

            results = results1 ^ results2

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

### کار با Q objects

از Q objects میتوان برای استفاده از عملگرهای and, or, xor, not با انعطاف پذیری بالاتر و استفاده ساده تر بهره برد.

> - <span class="en-text">and: &</span>    
> - <span class="en-text">or: |</span>    
> - <span class="en-text">xor: ^</span>    
> - <span class="en-text">not: ~</span>

برای استفاده لازمه آنرا ایمپورت کنیم.

`app directory/views.py`

```python
from django.db.models import Q
```

از Q objects به صورت زیر استفاده میکنیم:

```python
~Q(value)

Q(value1) & Q(value2)
Q(value1) | Q(value2)
Q(value1) ^ Q(value2)

Post.published.filter(Q(title__icontains=query) & Q(description__icontains=query))
```

علامت ~ به معنای not بوده و نتیجه را برعکس میکنه، مثلا Post.published.filter(~Q(title__icontains='python')) یعنی همه پست ها **بجز** آنهایی که عنوان python  دارند را انتخاب کن.

> اگر خواستیم هم از حالت عادی field_lookups و هم Q objects استفاده کنیم اول باید Q objects نوشته بشوند و بعد حالت عادی مثله حالت زیر:
>
```python
Post.published.filter(Q(...) | Q(...), title__startswith='django')
```

### پیاده سازی FTS و کار با SearchVector (جستجو بین چند فیلد)

> FTS: مخفف Full Text Search میباشد.
>
> این ویژگی مربوط به postgres میباشد.

توی جستجوی ساده که پیاده سازی کردیم، عینا عبارتی که نوشته ایم را جستجو میکنه(دنبال تطابق <span class="en-text">100%</span> میباشد حتی تمام space ها را هم در نظر میگیرد).

برای استفاده از قابلیت های postgres لازمه توی settings.py و بخش INSTALLED_APPS آنرا معرفی کنیم.

`project directory/settings.py`

```python
INSTALLED_APPS = [
    # ...
    'django.contrib.postgres',
]
```

**search** field_lookups ساده ترین و اولین حالت FTS میباشد.

```python
# structure of search field_lookups
field-name__search=query

description__search="django framwork"
```

> space های اضافی را در نظر نمیگیرد.

برای جستجو بین چندین فیلد بهتره از SearchVector استفاده کنیم. | با این حال میتوان یک فیلد هم برایش مشخص کرد.

قبل از استفاده باید آنرا ایمپورت کنیم:

`app directory/views.py`

```python
from django.contrib.postgres.search import SearchVector
```

برای استفاده از SearchVector از annotate استفاده میکنیم.

`app directory/views.py`

```python
# How to use SearchVector
ModelName.manager.annotate(search=SearchVector(<fields-name>)).filter(search=query_search)

Post.published.annotate(search=SearchVector('title', 'description')).filter(search=query)
```

با استفاده از annotate یک فیلد بنام search اضافه میکنیم، آن فیلد از SearchVector ایجاد شده است(داخل پرانتزهای SearchVector فیلدهایی که باید جستجو شوند را مشخص میکنیم).

حالا از متد <span class="en-text">filter()</span> استفاده کرده و عبارت جستجو شده(query) را به فیلد ایجاد شده(search)  می دهیم تا پست هایی که title, description شامل آن query هستند را بیابد.

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            results = Post.published.annotate(search=SearchVector('title', 'description')).filter(search=query)

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

### پیاده سازی FTS و کار با SearchRank و SearchQuery (رتبه بندی نتایج)

#### **SearchQuery**

SearchQuery بجای این query  که یک رشته ساده هست استفاده میشه و یکسری مزیت ها به همراه میاره.

> یکی از کارهایی که میکنه ریشه یابی کلمه جستجو شده میباشد.

نکته: در حالت عادی red tomato و tomato red برایش فرقی ندارد مگر اینکه برایش <span class="en-text">search_type='phrase'</span> استفاده کنیم.

```python
SearchQuery('red tomato', search_type='phrase')
```

`app directory/views.py`

```python
from django.contrib.postgres.search import SearchVector, SearchQuery
```

حالا بجای عبارت query از SearchQuery(query) استفاده میکنیم.

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            search_query = SearchQuery(query)

            results = Post.published.annotate(search=SearchVector('title', 'description')).filter(search=search_query)

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

> برای SearchQuery هم میتوان از عملگرهای and, or, xor استفاده کرد.

```pyton
~SearchQuery("...")

SearchQuery("...") & SearchQuery("...")
SearchQuery("...") | SearchQuery("...")
SearchQuery("...") ^ SearchQuery("...")
```
>
> عملگرها در اینجا کاربردشون روی عبارات  جستجو شده هست، مثلا در and یعنی هردو عبارت وجود داشته باشه.

نکته: برای استفاده از SearchQuery باید از SearchVector  هم استفاده کنیم.

> با استفاده از آرگومان config برای SearchQuery و SearchVector میتوان زبان مدنظر که برای جستجو بکار میرود را مشخص کنیم، ولی تا این لحظه زبان فارسی را پشتیبانی نمیکند.

#### **SearchRank**

SearchRank نتایج جستجو را رتبه بندی و مرتب میکند و براساس این چیدمان آنها را نمایش میدهد.

> 1- رتبه بندی براساس تعداد تکرار عبارت، 2- اینکه آن عبارت در کجای متن وجود دارد(ابتدای متن هست یا انتهای متن)، 3- میزان شباهت عبارت متن با عبارت جستجو شده.

SearchRank را هم کنار SearchQuery و SearchVector ایمپورت میکنیم:

`app directory/views.py`

```python
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
```

1- برای نمایش بهتر، SearchVector را در قالب یک متغیر، کنار متغیر search_query تعریف میکنیم و حالا از آن متغیر در متد <span class="en-text">annotate()</span> استفاده میکنیم.

2- در متد <span class="en-text">annotate()</span> کنار فیلد search یک فیلد دیگر بنام rank ایجاد میکنیم، برای این فیلد از SearchRank استفاده میکنیم.

3- SearchRank دو ورودی میگیرد، اولی: SearchVector و دومی: SearchQuery هست.

4- در متد <span class="en-text">filter()</span> همانند قبل از search=search_query استفاده میکنیم.

5- حالا وقتشه نتایج را مرتب سازی کنیم؛ به این منظور از order_by استفاده کرده و براساس فیلد rank، نتایج را مرتب میکنیم.

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            search_query = SearchQuery(query)
            search_vector = SearchVector('title', 'description')

            results = Post.published.annotate(search=search_vector, rank=SearchRank(search_vector, search_query)).filter(search=search_query).order_by('-rank')

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

در روش جستجو با SearchRank میتوانیم مشخص کنیم که کدام فیلد امتیاز بالاتری داشته باشد تا در نتیجه ی جستجو اهمیت و رتبه بالاتری داشته باشد.

> مثلا اگر title امتیاز بالاتری داشته باشد نتایجی را اول نمایش میدهد که آن عبارت جستجو شده در title آنهاست.

با تعیین این امتیاز دهی نتایج جستجو را اولویت بندی میکنه؛ بریم ببینیم:

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            search_query = SearchQuery(query)
            search_vector = SearchVector('title', weight="A") + SearchVector('description', weight="B")

            results = Post.published.annotate(search=search_vector, rank=SearchRank(search_vector, search_query)).filter(search=search_query).order_by('-rank')

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

برای تعیین امتیازدهی، برای هر فیلد یک SearchVector نوشته و در آن با استفاده از آرگومان weight، امتیاز و وزن فیلد را مشخص میکنیم. | میتوان بجای حروف الفبا با استفاده از عدد در بازه <span class="en-text">(0.1, 1)</span> این امتیاز را مشخص کنیم.

> <span class="rtl-text">میتوانیم در متد <span class="en-text">filter()</span> مشخص کنیم، نتایجی را انتخاب کند که امتیاز(rank) آنها از یه مقداری بیشتر باشد.</span>

`app directory/views.py`

```python
results = Post.published.annotate(search=search_vector, rank=SearchRank(search_vector, search_query)).filter(rank__gte=0.3).order_by('-rank')
```

بریم کد کاملش را هم ببینیم:

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            search_query = SearchQuery(query)
            search_vector = SearchVector('title', weight="A") + SearchVector('description', weight="B")

            results = Post.published.annotate(search=search_vector, rank=SearchRank(search_vector, search_query)).filter(rank__gte=0.3).order_by('-rank')

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

**چنانچه در جستجوی خود غلط املایی داشته باشیم مثلا اشتباهی یک حرف دیگر تایپ کرده باشیم در جستجو به مشکل میخورد.**

### پیاده سازی FTS و کار با TrigramSimilarity (سنجش مشابهت)

برای استفاده از Trigram؛ باید افزونه(اکستنشن) pg_trgm را در postgres نصب کنیم.

> برای نصب اکستنشن pg_trgm میتوان هم از sql shell و هم از pgadmin استفاده کرد.

دستور SQL آن در sql shell:

```sqlshell
create extention pg_trgm
```

1- در pgadmin روی databae کلیک راست کرده و مراحل زیر را انجام میدهیم:

<span class="en-text">2- create > Extention...</span>

3- سپس در کادر باز شده اسم اکستنشن(pg_trgm) را وارد کرده و save را میزنیم.

حالا برای استفاده از TrigramSimilarity باید آنرا ایمپورت کنیم:

`app directory/views.py`

```python
from django.contrib.postgres.search import TrigramSimilarity
```

شیوه استفاده از TrigramSimilarity:

1- با استفاده از متد <span class="en-text">annotate()</span> یک فیلد ایجاد میکنیم ، برای این فیلد از TrigramSimilarity استفاده میکنیم.

2- TrigramSimilarity دو ورودی میگیره اولی: اسم فیلد و دومی: عبارت جستجو شده(query)

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            results = Post.published.annotate(similarity=TrigramSimilarity('title', query)).filter(similarity__gt=0.1).order_by('-similarity')

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

3- حالا در متد <span class="en-text">filter()</span> میزان شباهت را مشخص میکنیم(برای فیلد similarity ایجاد شده میزان شباهت را تعیین میکنیم).

> هرچقدر این میزان similarity بالاتر باشد(به 1 نزدیکتر باشد) سخت گیری بیشتر میشود، یعنی بیشتر نسبت به تطابق عبارت جستجو شده با عبارت موجود در متن حساسیت نشان میدهد(میخواد تا حدامکان شبیه یکدیگر باشند). | پس بهتر است از اعداد پایین تر مثله 0.1 استفاده کنیم.

#### جستجو بین چند فیلد با ساختار TrigramSimilarity

**حالت اول:**

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            result1 = Post.published.annotate(similarity=TrigramSimilarity('title', query)).filter(similarity__gt=0.1)
            result2 = Post.published.annotate(similarity=TrigramSimilarity('description', query)).filter(similarity__gt=0.1)

            results = (result1 | result2).order_by('-similarity')

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

**حالت دوم:**

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            results = Post.published.annotate(
                similarity_title=TrigramSimilarity('title', query),
                similarity_description=TrigramSimilarity('description', query))
                .filter(Q(similarity_titlegt=0.1) | Q(similarity_descriptiongt=0.1) | Q(similarity_slug__gt=0.1)).order_by('-similarity')

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

**حالت سوم:**

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            results = Post.published.annotate(
                similarity=TrigramSimilarity('title', query) + 
                           TrigramSimilarity('description', query))
                           .filter(similarity__gt=0.2).order_by('-similarity')

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

### افزودن فیلد تصویر و تنظیمات آن

اضافه کردن تصویر به مدل Post | برای اینکه چند تصویر برای هر پست داشته باشیم، یک مدل بنام Image ایجاد میکنیم و آنرا به مدل Post متصل میکنیم.

> رابطه بین تصاویر و پست، از نوع Many To One میباشد پس از فیلد ForeignKey استفاده میکنیم.

`app directory/models.py`

```python
class Image(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')

    img_file = models.ImageField(upload_to="post_images/")
    title = models.CharField(max_length=250, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created']
        indexes = [models.Index(fields=['created'])]

    def __str__(self):
        return self.title if self.title else "None"
```

برای تصویر از ImageField استفاده میکنیم، در آرگومان upload_to مسیری که میخواهیم تصویر آنجا ذخیره شود را مشخص میکنیم.

> با استفاده از آرگومان های null=True و blank=True مشخص میکنیم که این فیلد میتواند null و خالی باشد(یعنی اجباری در پرکردن آن نیست).

**نکته:** پس از ایجاد مدل Image لازم است از دستورات makemigrations و migrate استفاده کنیم.

#### برای استفاده از ImageField و ذخیره تصاویر در پروژه  لازم است در settings.py تغییراتی ایجاد کنیم:

> مثله دایرکتوری static، که جنگو آن را میشناسد ، برای تصاویر هم در settings.py، با استفاده از  MEDIA_ROOT یک دایرکتوری مشخص میکنیم تا جنگو آن را بشناسد.

برای تنظیمات و پیکربندی تصاویر، از MEDIA_URL و MEDIA_ROOT استفاده میکنیم.

در انتهای settings.py این دو متغیر را اضافه میکنیم:

`project directory/settings.py`

```python
# ...
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

از MEDIA_URL برای شروع مسیر url  آن تصویر استفاده میشود.

از MEDIA_ROOT استفاده میکنیم تا  یک دایرکتوری برای ذخیره تصاویر در پروژه مشخص کنیم.

> برای استفاده از تصویر در پایتون(جنگو) لازم است، ماژول pillow را نصب کنیم:

```python
pip install pillow
```

تعیین url برای تگ img در تمپلیت:

> با استفاده از images برای یک پست، تمام تصاویر آن پست را بدست می آوریم.(images اسم related_name برای فیلد post در مدل Image میباشد.)

```python
post.images
```

با استفاده از متد <span class="en-text">first()</span> اولین تصویر ایجاد شده را انتخاب میکنیم:

```python
post.images.first()
```

در مثال بالا یک نمونه از مدل Image داریم، پس میتوانیم به تمام فیلدهای آن دسترسی داشته باشیم، (تصاویر در فیلد img_file ذخیره میشوند پس با استفاده از آن میتوانیم به تصویر دسترسی داشته باشیم)

```python
post.images.first.img_file
```

این فیلد(img_file) اسم فایل تصویر را برمیگرداند برای استفاده از url آن تصویر از متد url استفاده میکنیم:

```jinja
<img src="post.images.first.img_file.url" alt="post.images.first.title">
```

جهت نمایش مدل Image در پنل ادمین لازم ست از آن در admin.py استفاده کنیم:

`app directory/admin.py`

```python
@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'post', 'created']
```

#### نمایش تصاویر در post_list و post_detail

`templates/blog/post_list.html`

```jinja
{% extends 'parent/base.html' %}
{% load static %}

{% block title %} Post Lists {% endblock %}

{% block head %}
    <link rel="stylesheet" href="{% static 'css/style.css' %}">
{% endblock %}

{% block content %}
    <div class="container">
        {% for post in page_obj %}
            <div class="post">
                <img src="post.images.first.img_file.url" alt="post.images.first.title">
                <a href="{% url blog:post_detil post.id %}">{{ post.title }}</a>
                <p>{{ post.description|truncatewords:5 }}</p>
            </div>
        {% endfor %}
    </div>

    {% include 'partials/pagination.html' with page=page_obj %}

{% endblock %}
```

`templates/blog/post_detail.html`

```jinja
{% extends 'parent/base.html' %}
{% load blog_tags %}
{% block title %} post detail {% endblock %}

{% block content %}
    <h3>Author: <i>{{ post.author }}</i></h3>
    <br><br>
    <h2>Title: {{ post.title }}</h2>
    <h3>description:</h3>
    <p>{{ post.description | linebreaks }}</p>
    <p>{{ post.publish }}</p>
    <br><hr><br>

    <!-- نمایش تمام تصاویر مربوط به پست -->
    <div class="images">
        {% for IMG in post.images.all %}
            <img src="IMG.img_file.url" alt="IMG.title">
        {% endfor %}
    </div>

    <form action="{% url 'Blog:post_comment' post.id %}" method="post">
        {% csrf_token %}
    
        <input type="text" id="name" placeholder="name" name="name">
        
        <br><br>
        
        <textarea name="letter" cols="30" rows="10" placeholder="your comment..."></textarea>
    
        <input type="submit" value="send">
    </form>

    <!-- نمایش تعداد کامنت ها -->
    <div>
        {% with comments.count as cm_count %}
            {{ cm_count }} comment{{ cm_count|pluralize }}
        {% endwith %}
    </div>

    <!-- نمایش کامنت ها -->
    {% for cm in comments %}
        <div>
            Name: {{ cm.name }}
            <br>
            {{ cm.letter|linebreaks }} 
        </div>
    {% empty %}
        کامنتی وجود ندارد
    {% endfor %}
    
{% endblock %}
```

> <span class="rtl-text">در تمپلیت بالا برای حلقه for جهت نمایش تمام تصاویر، استفاده از متد <span class="en-text">all()</span> فراموش نشه!</span>
>
> مگرنه ارور میدهد.

با انجام تمام این مراحل تصاویر نمایش داده نمیشوند، چون لازم است در فایل urls.py **پروژه** MEDIA_URL و MEDIA_ROOT را برایش مشخص کنیم.

static و settings باید ایمپورت شوند:

`project directory/urls.py`

```python
from django.conf.urls.static import static
from django.conf import settings
```

خب حالا بریم ساختار کامل urls.py را ببینیم:

`project directory/urls.py`

```python
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('blog.urls', namespace='blog'))
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

حالا تصاویر به درستی نمایش داده میشوند.

### کار با InlineModelAdmin

این قابلیت مربوط به مدل های ForeignKey میباشد.

InlineModel ها برای نمایش مدل ها در پنل ادمین هستند پس در فایل admin.py نوشته میشوند.

> مدل‌های داخلی یا Inline Models در جنگو، به شما امکان می‌دهند که مدل‌هایی را که با یک مدل اصلی (Parent Model) ارتباط دارند را در صفحه ی "ویرایش یا ایجاد" این مدل اصلی، در پنل ادمین نمایش دهید. این امکان به شما کمک می‌کند تا ارتباطات بین مدل‌ها را به صورت منظم و کارآمد در یک صفحه مدیریت کنید. | میتوان مدل های مرتبط را در همان مدل اصلی ویرایش و یا ایجاد کرد.

بگذارید با مثال توضیح دهیم، هر پست میتواند چندین کامنت و تصویر داشته باشد ولی مدیریت این کامنت ها و تصاویر در حال حاضر مشکل است چون هر کدام در بخش مجزایی وجود دارد؛ InlineModelAdmin به ما کمک میکند تا تمام کامنت ها و تصاویر مربوط به هر پست را در پنل همان پست نمایش دهیم به این ترتیب مدیریت آنها ساده تر خواهد بود.

> استفاده از inline models به صورت اصولی برای مدل‌های ForeignKey مناسب است، زیرا ارتباطات بین یک مدل اصلی (یکی به چند) با مدل‌های دیگر را نمایش می‌دهد و امکان ویرایش و مدیریت آن‌ها را در یک صفحه فراهم می‌کند.  
>
> با توجه به رابطه Many To One، پست میشه مدل یکی و کامنت ها و تصاویر هر کدام مدل چندتایی هستند، مدل های چندتایی inline model هستند که درپنل ادمین در بخش مدل یکی یعنی پست نمایش داده میشوند.

برای ایجاد inline model از StackedInline و یا TabularInline استفاده میکنیم.

`app directory/admin.py`

```python
# inlines
# first way:
class ImageInline(admin.TabularInline):
    model = Image


class CommentInline(admin.TabularInline):
    model = Comment

# ________________________________________

# second way
class ImageInline(admin.StackedInline):
    model = Image


class CommentInline(admin.StackedInline):
    model = Comment
```

> تفاوت StackedInline و TabularInline در ظاهر است.
>
> TabularInline: برای نمایش اطلاعات به صورت جدولی، مناسب برای مدل‌های با تعداد فیلدهای کم و جزئیات محدود.
>
> StackedInline: برای نمایش اطلاعات به صورت پشته‌ای (ستونی و پشت‌سرهم)، مناسب برای نمایش جزئیات بیشتر و فیلدهای بیشتر در هر ردیف.

#### توضیح ساختار inline models

برای هر inline model یک کلاس تعریف میکنیم که از StackedInline  یا TabularInline ارث بری میکند؛ حالا داخل بدنه آن، مدل مربوطه را مشخص میکنیم مثلا برای تصویر مدل Image میباشد.

خب ما inline model های خود را ایجاد کردیم حالا باید آنها را به مدلی که قرار است آنجا نمایش داده شوند(یعنی مدل پست) معرفی کنیم.

`app directory/admin.py`

```python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    # ...

    inlines = [ImageInline, CommentInline]
```

کد کاملش هم ببینیم:

`app directory/admin.py`

```python
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

    inlines = [ImageInline, CommentInline]
```

از اتریبیوت کلاس inlines استفاده میکنیم و در لیست آن؛ inline model های ایجاد شده(مربوط به این مدل) را مشخص میکنیم.

**بریم چندتا ویژگی جدید به inline model ها اضافه کنیم:**

`app directory/admin.py`

```python
# inlines
class ImageInline(admin.TabularInline):
    model = Image
    extra = 0
    readonly_fields = (<fields>)


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = (<fields>)
```

با extra مشخص میکنیم چند فرم برای اضافه کردن وجود داشته باشد. | مثلا برای تصویر و یا کامنت جدید چند فرم وجود داشته باشد.

با readonly_fields مشخص میکنیم که کدام فیلدها در این بخش قابل ویرایش نباشند و فقط نمایش داده شوند.

### بهینه سازی خودکار تصاویر

در این بخش کنترل (کیفیت، سایز، پسوند و امثال اینها) را برای فیلد تصویر خواهیم داشت.

برای این تنظیمات از پکیج django-resized استفاده میکنیم. | لازم است که آنرا نصب کنیم.

```python
pip install django-resized
```

**برای استفاده از این پکیج باید یکسری اقدامات انجام بدهیم(برخی اختیاری هستند):**

**پیکربندی اختیاری:** مواردی را به عنوان پیشفرض این پکیج، برای تصاویر مشخص میکنیم. | موارد زیر

این موارد را در settings.py، در انتهای فایل اضافه میکنیم. | هرکدام را براساس نیاز و سلیقه خود مشخص میکنیم.

`project directory/settings.py`

```python
DJANGORESIZED_DEFAULT_SIZE = [1920, 1080]
DJANGORESIZED_DEFAULT_SCALE = 0.5
DJANGORESIZED_DEFAULT_QUALITY = 75
DJANGORESIZED_DEFAULT_KEEP_META = True
DJANGORESIZED_DEFAULT_FORCE_FORMAT = 'JPEG'
DJANGORESIZED_DEFAULT_FORMAT_EXTENSIONS = {'JPEG': ".jpg"}
DJANGORESIZED_DEFAULT_NORMALIZE_ROTATION = False
```

> برای استفاده از آن باید در مدل ها ایمپورت شود.

`app directory/models.py`

```python
from django_resized import ResizedImageField
```

توی models.py هرجا نیاز به فیلد تصویر باشه، از ResizedImageField بجای ImageField استفاده میکنیم.

**این فیلد یکسری آپشن برای بهینه سازی و مدیریت تصاویر دارد:**

#### آپشن ها

* **size** - حداکثر عرض و ارتفاع تصویر را مشخص میکند، به عنوان مثال [640، 480]. اگر یکی از ابعاد None باشد، تصویر با استفاده از مقدار دیگر و با حفظ نسبت ابعاد تصویر، تغییر اندازه لحاظ می‌شود. اگر برای size مقداری مشخص نکنیم، اندازه اصلی تصویر حفظ می‌شود.

* **scale** - یک عدد اعشاری، اگر None نباشد، تصویر پس از تغییر اندازه مجدداً مقیاس‌بندی می‌شود.

* **crop** - تغییر اندازه و برش. ['بالا'، 'چپ'] - گوشه بالا سمت چپ، ['وسط'، 'مرکز'] - برش مرکز، ['پایین'، 'راست'] - برش گوشه پایین سمت راست.

* **quality** - کیفیت تصویر تغییر اندازه داده شده 0..100، -1 به معنی پیش‌فرض

* **keep_meta** - حفظ اطلاعات EXIF و سایر داده‌های متا، پیش‌فرض True

* **force_format** - اجبار فرمت تصویر تغییر اندازه داده شده، فرمت‌های موجود توسط pillow پشتیبانی می‌شوند، پیش‌فرض None

### تمرینات فصل ششم (مهم)

#### 1- وقتی پست حذف شد، تصاویر مربوط به آن هم از پروژه حذف شوند:

**برای این کار از دو روش پیشنهادی استفاده میکنیم:**

**روش اول:**

بازنویسی (override) متد <span class="en-text">delete()</span> برای کلاس مربوطه(Post):

`app directory/models.py`

```python
class Post(models.Model):
    # ...

    def delete(self, *args, **kwargs):
        for img in self.images.all():
            storage, path = img.img_file.storage, img.img_file.path
            
            storage.delete(path)
            
        super().delete(*args, **kwargs)
```

**روش دوم:**

استفاده از پکیج django-cleanup:

**Ⅰ- پکیج django-cleanup را نصب میکنیم.**

```python
pip install django-cleanup
```

**Ⅱ- خب حالا باید پیکربندی لازم را انجام دهیم:**

باید django-cleanup را به پایین بخش INSTALLED_APPS در settings.py اضافه کنیم.

`project directory/settings.py`

```python
INSTALLED_APPS = [
    # ...,
    'django_cleanup.apps.CleanupConfig',
]
```

> همین و تمام، پیکربندی دیگری لازم نیست!!!

بدین ترتیب وقتی پست حذف بشه تمام تصاویر مربوط به آن هم حذف میشوند.

> - <span class="rtl-text"> استفاده از بازنویسی متد <span class="en-text">delete()</span> مناسب است وقتی که شما نیاز دارید که عملیات حذف فایل‌ها را به طور دقیق کنترل کنید یا نیاز به انجام عملیات دیگری در همان زمان حذف دارید.</span>
> 
> - استفاده از Django-cleanup مناسب است اگر به دنبال راه حلی ساده و خودکار برای مدیریت فایل‌ها هستید و نیاز به نوشتن کدهای بیشتر ندارید.

#### 2- فیلد search براساس title و description تصویر هم جستجو را انجام دهد:

کافیست فیلد های مدل Image را به صورت \<related\_name\>\_\_\<field\_name\> در ساختار search جایی که فیلدها را مشخص میکردیم بنویسیم.

`app directory/views.py`

```python
def post_search(request):
    query = None
    results = []

    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']

            results = Post.published.annotate(
                similarity=TrigramSimilarity('title', query) + 
                           TrigramSimilarity('description', query) + 
                           TrigramSimilarity('images__title', query) + 
                           TrigramSimilarity('images__description', query)).filter(similarity__gt=0.2).order_by('-similarity')

    context = {
        "query": query,
        "results": results,
    }

    return render(request, 'blog/search_result.html', context=context)
```

با این ساختار هم برای عنوان و توضیحات پست جستجو صورت میگیره و هم براساس عنوان و توضیحات "تصاویر پست ها"، ولی در خروجی پست را نمایش میدهد نه تصویر را.

> در سایر روش های جستجو هم میتوان به همین روش عمل کرد.

#### 3- دایرکتوری ذخیره تصاویر، براساس "تاریخ" آن روز ایجاد شود. | دایرکتوری ذخیره تصاویر، براساس "نام کاربری نویسنده پست" ایجاد شود:

میخواهیم برای آرگومان upload_to برای هر روزی که تصویری آپلود میشود یک دایرکتوری همنام با آن تاریخ ایجاد کنیم.

`app directory/models.py`

```python
from datetime import date


Date = date.today().strftime("%B %d, %Y")

class Image(models.Model):
    image = ResizedImageField(upload_to=f"{Date}", size=[125, 125], scale=1, crop=['middle', 'center'], null=True, blank=True)

    # ...سایر فیلدها را برای سادگی حذف کردیم
    # ...
```

> در فایل models.py خارج از کلاس ها  می‌توانید با تعریف یک تابع، مسیر ذخیره‌سازی فایل‌ها را سفارشی‌سازی کنید
>
> ساختار به صورت زیر میباشد:

`app directory/models.py`

```python
def func_name(instance, filename):
    # ...
```

Ⅰ- پارامتر instnce یک نمونه از آن کلاسی است که این تابع آنجا استفاده میشود.

Ⅱ- پارامتر filename نام اصلی فایلی است که آپلود شده و قرار است در پروژه ذخیره شود.

**خب بریم با این تابع، مسیر ذخیره سازی را یکبار براساس "تاریخ" آپلود و بار دیگر با "نام کاربری نویسنده پست" سفارشی سازی کنیم:**

> **نکته مهم:** برای اینکه تصویر آپلودی را تشخیص دهد و آنرا در مسیر مشخص شده  ذخیره کند باید از filename استفاده کنیم.

#### مشخص کردن مسیر ذخیره سازی بر اساس تاریخ آپلود:

`app directory/models.py`

```python
def date_directory_path(instance, filename):
    today = date.today().strftime("%B %d, %Y")
    return f"post_images/{today}/{filename}"


class Image(models.Model):
    image = ResizedImageField(upload_to=date_directory_path, size=[125, 125], scale=1, crop=['middle', 'center'], null=True, blank=True)
```

#### مشخص کردن مسیر ذخیره سازی براساس نام کاربری نویسنده پست:

`app directory/models.py`

```python
def user_directory_path(instance, filename):
    user = instance.post.author.username
    return f'post_images/{user}/{filename}'


class Image(models.Model):
    image = ResizedImageField(upload_to=user_directory_path, size=[125, 125], scale=1, crop=['middle', 'center'], null=True, blank=True)
```

پس از ایجاد تابع، آن تابع را برای آرگومان upload_to صدا میزنیم. | پرانتز لازم نیست خودش تشخیص میدهد.

#### 4- برای متد \_\_str\_\_ عنوان(title) تصویر نمایش داده شود و در صورتی که title وجود نداشت اسم آن فایل نمایش داده شود:

`app directory/models.py`

```python
class Image(models.Model):
    # ...

    def __str__(self):
        return f"title: {self.title}" if self.title else f"image_name: {self.img_file}"
```

#### 5- در تمپلیت post_detail، تصاویر پست در مکان های مختلف نمایش داده شوند:

برای اینکه تصاویر پست را در بخش های مختلف نمایش دهیم از ایندکس استفاده میکنیم:

```jinja
{{ post.images.index-number }}

<img src="{{ post.images.2.img_file.url }}">
```

#### ساختار تمپلیت post_detail برای نمایش تصاویر در بخش های مختلف:

> <span class="rtl-text"> اول با متد <span class="en-text">exists()</span> بررسی میکنیم که هیچ تصویری وجود داره یا نه اگه وجود داشت، ابتدا تصویر اول و سپس مابقی را نمایش میدهیم.</span>    

در تمپلیت، 4 تصویر را نمایش میدهیم(در صورت وجود).

`templates/blog/post_detail.html`

```jinja
{% extends 'parent/base.html' %}
{% load blog_tags %}
{% block title %} post detail {% endblock %}

{% block content %}

    <!-- نمایش تصاویر در بخش های مختلف -->
    {% if post.images.exists %}
        <!-- اولین تصویر -->
        <img src="{{ post.images.first.image.url }}" alt="First Image">

        <h3>Author: <i>{{ post.author }}</i></h3>
        <br><br>

        <!-- دومین تصویر -->
        {% if post.images.count > 2 %}
            <img src="{{ post.images.1.image.url }}" alt="Second Image">
        {% endif %}

        <h2>Title: {{ post.title }}</h2>
        <h3>description:</h3>
        <p>{{ post.description | linebreaks }}</p>
        <p>{{ post.publish }}</p>

        <!-- سومین تصویر -->
        {% if post.images.count > 3 %}
            <img src="{{ post.images.2.image.url }}" alt="Third Image">
        {% endif %}

        <br>

        <!-- آخرین تصویر -->
        {% if post.images.count > 1 %}
            <img src="{{ post.images.last.image.url }}" alt="Last Image">
        {% endif %}
        <br><hr><br>
    {% endif %}

    <form action="{% url 'Blog:post_comment' post.id %}" method="post">
        {% csrf_token %}
    
        <input type="text" id="name" placeholder="name" name="name">
        
        <br><br>
        
        <textarea name="letter" cols="30" rows="10" placeholder="your comment..."></textarea>
    
        <input type="submit" value="send">
    </form>

    <!-- نمایش تعداد کامنت ها -->
    <div>
        {% with comments.count as cm_count %}
            {{ cm_count }} comment{{ cm_count|pluralize }}
        {% endwith %}
    </div>

    <!-- نمایش کامنت ها -->
    {% for cm in comments %}
        <div>
            Name: {{ cm.name }}
            <br>
            {{ cm.letter|linebreaks }} 
        </div>
    {% empty %}
        کامنتی وجود ندارد
    {% endfor %}
    
{% endblock %}
```
