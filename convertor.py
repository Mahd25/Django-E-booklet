import markdown
from pygments import highlight
from pygments.lexers import get_lexer_by_name, TextLexer
from pygments.formatters import HtmlFormatter
import re
from slugify import slugify

# Function to highlight code blocks
def highlight_code(code, language):
    try:
        lexer = get_lexer_by_name(language, stripall=True)
    except Exception:
        lexer = TextLexer(stripall=True)

    formatter = HtmlFormatter(cssclass="code-box", style="colorful")
    highlighted_code = highlight(code, lexer, formatter)

    code_info = f"""
        <div class="code-info">
            <button class="copy-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" class="icon-sm"><path fill="currentColor" fill-rule="evenodd" d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" clip-rule="evenodd"></path></svg>
                <span>Copy code</span>
            </button>
            <span class="language">{language}</span>
        </div>
    """

    highlighted_code = re.sub(r'<div class="code-box">', f'<div class="code-box">{code_info}', highlighted_code)
    return highlighted_code

# Function to convert markdown to HTML
def markdown_to_html(md_text):
    code_block_re = re.compile(r'```(\w+)\n(.*?)\n```', re.DOTALL)

    def code_block_replacer(match):
        language = match.group(1)
        code = match.group(2)
        # Do not escape HTML entities in code blocks
        return highlight_code(code, language)

    html_with_highlighted_code = code_block_re.sub(code_block_replacer, md_text)
    html_content = markdown.markdown(html_with_highlighted_code, extensions=['fenced_code', 'codehilite', 'tables'])

    return html_content

# Function to generate TOC and add it after the first h2 tag
def generate_toc_and_add_links(html_content):
    # Find all h3 tags
    headings = re.findall(r'<h3>(.*?)</h3>', html_content)
    toc_lines = ["<div class=\"toc\"><h3>فهرست مطالب</h3><ul>"]
    
    for heading in headings:
        slug = slugify(heading, separator='-', replacements=[(" ", "-"), ("‌", "-")])
        toc_lines.append(f'<li><a href="#{slug}">{heading}</a></li>')
        
    toc_lines.append("</ul></div>")
    toc_content = '\n'.join(toc_lines)

    # Add id attributes to h3 tags and find the position to insert TOC
    def add_id_link(match):
        title = match.group(1).strip()
        slug = slugify(title, separator='-', replacements=[(" ", "-"), ("‌", "-")])
        return f'<h3 id="{slug}">{title}</h3>'

    updated_content = re.sub(r'<h3>(.*?)</h3>', add_id_link, html_content)

    # Find the position of the first h2 tag and insert TOC
    toc_insert_pos = re.search(r'<h2>(.*?)</h2>', updated_content)
    if toc_insert_pos:
        insert_index = toc_insert_pos.end()
        final_content = updated_content[:insert_index] + toc_content + updated_content[insert_index:]
    else:
        final_content = toc_content + updated_content

    return final_content


# Function to read markdown file and convert to HTML
def convert_markdown_file(input_file, output_file, title):
    regex = r"([^\\]+)\.md$"
    md_name = (re.search(regex, input_file)).group(1)

    with open(input_file, 'r', encoding='utf-8') as file:
        md_text = file.read()

    html_output = markdown_to_html(md_text)
    html_output_with_toc = generate_toc_and_add_links(html_output)

    html_template = f"""
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<title>Season {title}</title>    
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Django e-booklet">
<meta name="keywords" content="django, django learning">
<meta name="author" content="Mahdi Rezaie, Ali Ebrahimian">
<link rel="icon" href="../Images/favicon.ico" type="image/ico">

<link rel="stylesheet" type="text/css" href="../seasons-css-&-js/seasons-style.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body>
<main>
    <div class="container">
        <div class="content">
            {html_output_with_toc}
            <a href="https://github.com/mahd25/Django-E-booklet/edit/seasons-source/{md_name}.md" target="_blank" class="edit-icon">
                <i class="fa-solid fa-pen-to-square"></i>
            </a>
        </div>
    </div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="../seasons-css-&-js/Django-seasons.js"></script>
<script src="../seasons-css-&-js/copy-icon.js"></script>
</body>
</html>
    """

    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(html_template)

    print(f"Conversion complete. Check the {output_file} file.")


# Request input and output file paths from user
input_file = input("Please enter the path to the markdown file: ")
output_file = input("Please enter the path to save the HTML file: ")
title = input("Please enter the title of the HTML file(example:two): ")

if not output_file.endswith(".html"):
    output_file += ".html"

# Convert the markdown file to HTML
convert_markdown_file(input_file, output_file, title)
