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
        'markdown.extensions.codehilite',
        'markdown.extensions.fenced_code',
        'markdown.extensions.tables',
        TocExtension(permalink=True)
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
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 20px;
                background-color: #f9f9f9;
            }}
            h1, h2, h3, h4, h5, h6 {{
                color: #333;
            }}
            p {{
                margin: 0 0 10px;
            }}
            pre, code {{
                background: #f4f4f4;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow-x: auto;
            }}
            code {{
                padding: 2px 4px;
                font-size: 90%;
                background-color: #f4f4f4;
                border-radius: 4px;
            }}
            .codehilite {{
                background: #f4f4f4;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }}
            table, th, td {{
                border: 1px solid #ddd;
                padding: 8px;
            }}
            th {{
                background-color: #f2f2f2;
                text-align: left;
            }}
            a {{
                color: #007BFF;
                text-decoration: none;
            }}
            a:hover {{
                text-decoration: underline;
            }}
            img {{
                max-width: 100%;
                height: auto;
            }}
            .highlight {{
                background-color: #ffffcc;
                padding: 2px 4px;
                border-radius: 4px;
            }}
        </style>
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
