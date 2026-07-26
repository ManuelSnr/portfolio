import re

def update_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Regex to match the visit link and extract its href
    # It looks like: <a href="URL" target="_blank" class="pill-detail-visit">Visit</a>
    # We want to replace it with the social links block
    
    def replacer(match):
        href = match.group(1)
        # return the new block
        return f'''<span class="pill-social-links">
              <a href="{href}" target="_blank" class="pill-social-link"><img src="Assets/General/internet.svg" alt="Website" class="pill-social-icon" /></a>
              <a href="#" target="_blank" class="pill-social-link"><img src="Assets/General/linkedin.svg" alt="LinkedIn" class="pill-social-icon" /></a>
            </span>'''

    pattern = re.compile(r'<a\s+href="([^"]+)"\s+target="_blank"\s+class="pill-detail-visit">\s*Visit\s*</a>')
    
    new_content = pattern.sub(replacer, content)
    
    with open(filename, 'w') as f:
        f.write(new_content)

update_file('index.html')
update_file('about.html')
print("Done")
