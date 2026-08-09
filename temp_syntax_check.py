import pathlib
text = pathlib.Path('src/App.tsx').read_text(encoding='utf-8')
lines = text.splitlines()
stack=[]
string=None
escape=False
comment=None
for li,line in enumerate(lines, start=1):
    i=0
    while i < len(line):
        ch=line[i]
        nxt=line[i+1] if i+1 < len(line) else ''
        if comment:
            if comment=='//':
                break
            if comment=='/*' and ch=='*' and nxt=='/':
                comment=None
                i += 1
            i += 1
            continue
        if string:
            if escape:
                escape=False
            elif ch=='\\':
                escape=True
            elif ch==string:
                string=None
            i += 1
            continue
        if ch=='/' and nxt=='/':
            comment='//'
            i += 2
            continue
        if ch=='/' and nxt=='*':
            comment='/*'
            i += 2
            continue
        if ch in '"\'`':
            string=ch
            i += 1
            continue
        if ch in '({[':
            stack.append((ch, li, i+1))
        elif ch==')':
            if not stack or stack[-1][0] != '(':
                print('unmatched )', li, i+1)
                raise SystemExit(0)
            stack.pop()
        elif ch==']':
            if not stack or stack[-1][0] != '[':
                print('unmatched ]', li, i+1)
                raise SystemExit(0)
            stack.pop()
        elif ch=='}':
            if not stack or stack[-1][0] != '{':
                print('unmatched }', li, i+1)
                raise SystemExit(0)
            stack.pop()
        i += 1
print('stack size', len(stack))
for item in stack[-20:]:
    print(item)
