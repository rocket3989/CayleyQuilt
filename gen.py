# n = int(input())
# for i in range(0, n):
#     print("\"", end = '')
#     for j in range(0, n):
#         print((j^i), end='' if j == n else ' ')
#     print("\", ", end = '')


for i in range(0, 8):
    a1 = i % 4
    b1 = i // 4
    print("\"", end = '')
    for j in range(0, 8):
        a2 = j % 4
        b2 = j // 4
        print("({},{})".format((a1 + a2) % 4, (b1 + b2) % 2), end='' if j == 7 else ' ')
    print("\", ", end = '')