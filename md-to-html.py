import markdown
from pathlib import Path
from markdown.extensions.toc import TocExtension

def convert_markdown_to_html(input_file_path, output_file_path):
    # خواندن محتوای فایل مارکدان
    input_file = Path(input_file_path)
    markdown_text = input_file.read_text(encoding='utf-8')

    # تعریف افزونه‌های مورد استفاده
    extensions = [
        'markdown.extensions.extra',
        'markdown.extensions.codehilite',  # افزونه برای هایلایت کدها
        'markdown.extensions.fenced_code',  # افزونه برای بلاک‌های کد
        TocExtension(permalink=True)       # افزونه برای ساختاردهی فصول
    ]

    # تبدیل مارکدان به HTML با استفاده از افزونه‌ها
    html_text = markdown.markdown(markdown_text, extensions=extensions)

    # اضافه کردن استایل‌ها به HTML
    html_content = f"""
    <!DOCTYPE html>
    <html lang="fa">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Markdown to HTML</title>
        <link rel="stylesheet" href="style-seasons.css">
    </head>
    <body>
        {html_text}
    </body>
    </html>
    """

    # نوشتن محتوای HTML به فایل خروجی
    output_file = Path(output_file_path)
    output_file.write_text(html_content, encoding='utf-8')

# مسیر فایل مارکدان ورودی و فایل HTML خروجی
input_file_path = input("مسیر فایل مارکدان: ")
output_file_path = input("مسیر فایل خروجی: ")

if not output_file_path.endswith(".html"):
    output_file_path += ".html"

# تبدیل فایل مارکدان به HTML
convert_markdown_to_html(input_file_path, output_file_path)
