import os
import re

d = r'c:\Users\Alee Bushu\StayOS-Hotel-booking\frontend\src'
regexes = [
    (r'text-gray-400', 'text-[#4A6B63]'), 
    (r'text-gray-500', 'text-[#2D4A42]'), 
    (r'text-gray-600', 'text-[#2D4A42]'), 
    (r'text-gray-700', 'text-[#1A2E2B]'), 
    (r'text-gray-900', 'text-[#1A2E2B]'), 
    (r'#6B7280', '#2D4A42'), 
    (r'#9CA3AF', '#4A6B63'), 
    (r'#D1D5DB', '#A8C5BC'), 
    (r'#6b7280', '#2D4A42'), 
    (r'#9ca3af', '#4A6B63'), 
    (r'#d1d5db', '#A8C5BC'), 
    (r'text-\[#A8C5BC\]', 'text-[#C8E6DF]')
]
updated_files = []
for r, _, fs in os.walk(d):
    for f in fs:
        if f.endswith(('.tsx','.ts')):
            path = os.path.join(r, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            orig = content
            for p, r_rep in regexes:
                content = re.sub(p, r_rep, content)
            
            # Opacities
            content = re.sub(r'text-white/50', 'text-[#4A6B63]', content)
            content = re.sub(r'text-white/60', 'text-[#4A6B63]', content)
            content = re.sub(r'text-white/70', 'text-[#4A6B63]', content)
            
            # Use negative lookbehind or replace exact class instances
            content = content.replace(' opacity-60 ', ' ')
            content = content.replace('\"opacity-60 ', '\"')
            content = content.replace(' opacity-60\"', '\"')
            
            content = content.replace(' opacity-70 ', ' ')
            content = content.replace('\"opacity-70 ', '\"')
            content = content.replace(' opacity-70\"', '\"')

            if content != orig:
                updated_files.append(path)
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
print('Updated files:\\n' + '\\n'.join(updated_files))
