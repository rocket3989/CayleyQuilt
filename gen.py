n = int(input())
for i in range(1, n):
    print("\"", end = '')
    for j in range(1, n):
        print((j*i) % n, end='' if j == n else ' ')
    print("\", ", end = '')