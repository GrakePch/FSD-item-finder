import json

f_input = "./zh.json"

j_zh = json.load(open(f_input, "r", encoding="UTF-8"))

for k, v in j_zh.items():
    if v.endswith("]"):
        i = v.find("[")
        new_v = v
        if i >= 0:
            if v[i-1] != ' ':
                new_v = v[0:i]
            else:
                i = v.find("[", i+1)
                if i >= 0:
                    new_v = v[0:i]
        print(new_v)