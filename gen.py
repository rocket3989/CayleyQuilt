n = int(input())
for i in range(1, n):
    for j in range(1, n):
        print((j*i) % n, end=' ')
    print()