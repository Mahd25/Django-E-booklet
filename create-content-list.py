import re

def generate_toc_and_add_links(markdown_content):
    # پیدا کردن تمام تگ‌های هدینگ
    headings = re.findall(r'^(#{3,6})\s+(.+)', markdown_content, flags=re.MULTILINE)
    toc_lines = ["\n### فهرست مطالب\n"]
    for heading in headings:
        level = heading[0]
        title = heading[1].strip()
        link = re.sub(r'\s+', '-', title)
        toc_lines.append(f"- [{title}](#{link})")
    toc_content = '\n'.join(toc_lines)

    # اضافه کردن لینک به هدینگ‌ها
    def add_id_link(match):
        level = match.group(1)
        title = match.group(2).strip()
        link = re.sub(r'\s+', '-', title)
        return f"{level} {title} <a id=\"{link}\"></a>"

    updated_content = re.sub(r'^(#{3,6})\s+(.+)', add_id_link, markdown_content, flags=re.MULTILINE)

    # پیدا کردن موقعیت اولین تگ ##
    toc_insert_pos = re.search(r'^(##)\s+(.+)', updated_content, flags=re.MULTILINE)
    if toc_insert_pos:
        insert_index = toc_insert_pos.end()
        final_content = updated_content[:insert_index] + '\n' + toc_content + updated_content[insert_index:]
    else:
        final_content = toc_content + '\n' + updated_content

    return final_content

# پرسیدن مسیر فایل ورودی و خروجی از کاربر
input_file_path = input("Enter input path: ")
output_file_path = "new-" + input_file_path

if not input_file_path.endswith(".md"):
    input_file_path += ".md"

# خواندن محتوای فایل مارک‌دان
with open(input_file_path, 'r', encoding='utf-8') as file:
    markdown_content = file.read()

# ایجاد فهرست مطالب و اضافه کردن لینک به هدینگ‌ها
final_content = generate_toc_and_add_links(markdown_content)

# نوشتن محتوای جدید به فایل مارک‌دان
with open(output_file_path, 'w', encoding='utf-8') as file:
    file.write(final_content)

print(f"file {output_file_path} is created successfully.")
