> [!info]- 转载申明
> 带你发明 Floyd 算法：从记忆化搜索到递推（Python/Java/C++/Go/JS/Rust）
> 
> [![](https://assets.leetcode.cn/aliyun-lc-upload/users/endlesscheng/avatar_1690721039.png)](https://leetcode.cn/u/endlesscheng/)
> 
> [灵茶山艾府](https://leetcode.cn/u/endlesscheng/)
> 
> ![2022 感恩勋章](https://pic.leetcode.cn/1672297038-gOvOPc-%E6%8E%A5%E5%8F%97%E6%84%9F%E6%81%A9sm.png)
> 
> 27706
> 
> 2023.11.14
> 
> 发布于 浙江
> 
> 记忆化搜索
> 
> 动态规划
> 
> 最短路
> 
> C++
> 
> 6+

> 王道书上 Floyd 算法是空间优化版本，对应的，可以直接跳到 `空间优化` 部分。
## 题意解读

对于城市 i，求出 i 到其余城市的最短路长度，统计有多少个最短路长度 ≤$distanceThreshold$，把个数记作 $cnti$​。

例如示例 1，$cnt0​=2,cnt1​=3,cnt2​=3,cnt3​=2$。

其中 cnti​ 最小的 i 就是答案。示例 1 中的城市 0 和城市 3 对应的 $cnti$​ 都是最小的，这种情况返回 0 和 3 的最大值，即 3。

为了解决本题，我们需要求出**任意两个城市之间的最短路长度**。

## 前置知识

请看视频讲解 [动态规划入门：从记忆化搜索到递推](https://leetcode.cn/link/?target=https%3A%2F%2Fwww.bilibili.com%2Fvideo%2FBV1Xj411K7oF%2F)，制作不易，欢迎点赞！

## 一、启发思考：寻找子问题

![lc1334-c.png](https://pic.leetcode.cn/1699881511-DbyZrc-lc1334-c.png)

## 二、递归怎么写：状态定义与状态转移方程

**定义** $dfs(k,i,j)$ 表示从 $i$ 到 $j$ 的最短路长度，并且这条最短路的中间节点编号都 $≤k$。注意中间节点不包含 $i$ 和 $j$。

根据上面的讨论：

- **不选** $k$，那么中间节点的编号都 $\leq k−1$，即 $dfs(k,i,j)=dfs(k−1,i,j)$。
- **选** $k$，问题分解成从 $i$ 到 $k$ 的最短路，以及从 $k$ 到 $j$ 的最短路。由于这两条最短路的中间节点都不包含 $k$，所以中间节点的编号都$≤k−1$，故得到$dfs(k,i,j)=dfs(k−1,i,k)+dfs(k−1,k,j)$。

这两种情况取最小值，就得到了 $dfs(k,i,j)$。写成式子就是

$$
dfs(k,i,j)=min(dfs(k−1,i,j),dfs(k−1,i,k)+dfs(k−1,k,j))
$$

- **递归边界**：$dfs(−1,i,j)=w[i][j]$。$k=−1$ 表示 $i$ 和 $j$ 之间没有任何中间节点，此时最短路长度只能是连接 $i$ 和 $j$ 的边的边权，即 $w[i][j]$。如果没有连接 $i$ 和 $j$ 的边，则 $w[i][j]=∞$。
- **递归入口**：$dfs(n−1,i,j)$，表示从 $i$ 到 $j$ 的最短路长度。$k=n−1$ 是因为本题节点编号为 $0$ 到 $n−1$，任意最短路的中间节点编号都 $≤n−1$。

#### 答疑

**问**：为什么要强调「中间节点不包含 $i$ 和 $j$」？我看代码中没有判断这个呀？

**答**：只要最短路是简单路径（没有重复节点），中间节点就必然不会包含 $i$ 和 $j$。强调这个事实，便于大家理解后文空间优化写法的正确性。

```py
# 会超时的递归代码
class Solution:
    def findTheCity(self, n: int, edges: List[List[int]], distanceThreshold: int) -> int:
        w = [[inf] * n for _ in range(n)]
        for x, y, wt in edges:
            w[x][y] = w[y][x] = wt

        def dfs(k: int, i: int, j: int) -> int:
            if k < 0:  # 递归边界
                return w[i][j]
            return min(dfs(k - 1, i, j), dfs(k - 1, i, k) + dfs(k - 1, k, j))

        ans = 0
        min_cnt = inf
        for i in range(n):
            cnt = 0
            for j in range(n):
                if j != i and dfs(n - 1, i, j) <= distanceThreshold:
                    cnt += 1
            if cnt <= min_cnt:  # 相等时取最大的 i
                min_cnt = cnt
                ans = i
        return ans
```

#### 复杂度分析

- 时间复杂度：$O(n^{2}3^{n})$。外面调用 $O(n^{2})$ 次 $dfs$$，$ 它的搜索树是一棵满三叉树（每个非叶节点都有三个子节点），树高为 $O(n)$，所以节点个数为 $O(3^{n})$，遍历搜索树需要 $O(3^{n})$ 的时间。
- 空间复杂度：$O(n)$。递归需要 $O(n)$ 的栈空间。

## 三、递归 + 记录返回值 = 记忆化搜索

上面的做法太慢了，怎么优化呢？

比如，从 $2$ 到 $1$ 的最短路可以分解出从 $2$ 到 $7$ 的最短路（中间节点 $≤6$），从 $2$ 到 $3$ 的最短路也可以分解出从 $2$ 到 $7$ 的最短路（中间节点 $≤6$）。也就是说，都会递归到 $dfs(6,2,7)$。

一叶知秋，$dfs$ 中有大量重复递归调用（递归入参相同）。由于 $dfs$ 没有副作用，同样的入参无论计算多少次，算出来的结果都是一样的，因此可以用**记忆化搜索**来优化：

- 如果一个状态（递归入参）是第一次遇到，那么可以在返回前，把状态及其结果记到一个 $memo$ 数组中。
- 如果一个状态不是第一次遇到（$memo$ 中保存的结果不等于 $memo$ 的初始值），那么可以直接返回 $memo$ 中保存的结果。

注意：$memo$ 数组的初始值一定不能等于要记忆化的值。本题可以初始化成 0，因为边权都是正数。

> Python 用户可以无视上面这段，直接用 `@cache` 装饰器。

```py
class Solution:
    def findTheCity(self, n: int, edges: List[List[int]], distanceThreshold: int) -> int:
        w = [[inf] * n for _ in range(n)]
        for x, y, wt in edges:
            w[x][y] = w[y][x] = wt

        @cache  # 缓存装饰器，避免重复计算 dfs 的结果
        def dfs(k: int, i: int, j: int) -> int:
            if k < 0:  # 递归边界
                return w[i][j]
            return min(dfs(k - 1, i, j), dfs(k - 1, i, k) + dfs(k - 1, k, j))

        ans = 0
        min_cnt = inf
        for i in range(n):
            cnt = 0
            for j in range(n):
                if j != i and dfs(n - 1, i, j) <= distanceThreshold:
                    cnt += 1
            if cnt <= min_cnt:  # 相等时取最大的 i
                min_cnt = cnt
                ans = i
        return ans
```

#### 复杂度分析

- 时间复杂度：$O(n^{3})$。由于每个状态只会计算一次，动态规划的时间复杂度 = 状态个数 × 单个状态的计算时间。本题中状态个数等于 $O(n^{3})$，单个状态的计算时间为 $O(1)$，所以动态规划的时间复杂度为 $O(n^{3})$。
- 空间复杂度：$O(n^{3})$。有多少个状态，$memo$ 数组的大小就是多少。

## 四、1:1 翻译成递推

我们可以去掉递归中的「递」，只保留「归」的部分，即自底向上计算。

做法：

- $dfs$ 改成 $f$ 数组；
- 递归改成循环（每个参数都对应一层循环）；
- 递归边界改成 f 数组的初始值。

> 相当于之前是用递归去计算每个状态，现在是**枚举**并计算每个状态。

具体来说，$f[k][i][j]$ 的定义和 $dfs(k,i,j)$ 的定义是一样的，都表示从 i 到 j 的最短路长度，并且这条最短路的中间节点编号都 $≤k$。

相应的递推式（状态转移方程）也和 $dfs$ 是一样的：

$$f[k][i][j]=min(f[k−1][i][j],f[k−1][i][k]+f[k−1][k][j])$$

但是，这种定义方式**没有状态能表示递归边界**，即 $k=−1$ 的情况。

解决办法：把 $f$ 数组的长度加一（在前面插入一个二维数组），用 $f[0][i][j]$ 表示 $dfs(−1,i,j)=w[i][j]$。由于 $f[0]$ 被占用，$f$ 第一维度的下标需要全部向右偏移一位，也就是把 $f[k]$ 改为 $f[k+1]$，把 $f[k−1]$ 改为 $f[k]$。

修改后$f[k+1][i][j]$ 表示从 $i$ 到 $j$ 的最短路长度，并且这条最短路的中间节点编号都 $≤k$。

修改后的递推式为

$$f[k+1][i][j]=min(f[k][i][j],f[k][i][k]+f[k][k][j])$$

初始值 $f[0][i][j]=w[i][j]$，翻译自 $dfs(−1,i,j)=w[i][j]$。

从 $i$ 到 $j$ 的最短路长度为 $f[n][i][j]$，翻译自 $dfs(n−1,i,j)$。

#### 答疑

**问**：为什么一定要在最外层枚举 $k$？

**答**：仔细看上面的状态转移方程，要正确地算出 $f[k+1][i][j]$，必须先把 $f[k][i][j]$、$f[k][i][k]$ 和 $f[k][k][j]$ 算出来。由于我们不知道 $k$ 和 $i,j$ 的大小关系，只有把 $k$ 放在最外层枚举，才能保证先把 $f[k][i][j]、f[k][i][k]$ 和 $f[k][k][j]$ 算出来。顺带一提，对于 $i$ 和 $j$ 来说，由于在计算 $f[k+1][i][j]$ 的时候，$f[k][⋅][⋅]$ 已经全部计算完毕，所以 $i$ 和 $j$ 按照正序/逆序枚举都可以。

```py
class Solution:
    def findTheCity(self, n: int, edges: List[List[int]], distanceThreshold: int) -> int:
        w = [[inf] * n for _ in range(n)]
        for x, y, wt in edges:
            w[x][y] = w[y][x] = wt

        f = [[[0] * n for _ in range(n)] for _ in range(n + 1)]
        f[0] = w
        for k in range(n):
            for i in range(n):
                for j in range(n):
                    f[k + 1][i][j] = min(f[k][i][j], f[k][i][k] + f[k][k][j])

        ans = 0
        min_cnt = inf
        for i in range(n):
            cnt = 0
            for j in range(n):
                if j != i and f[n][i][j] <= distanceThreshold:
                    cnt += 1
            if cnt <= min_cnt:  # 相等时取最大的 i
                min_cnt = cnt
                ans = i
        return ans
```

#### 复杂度分析

- 时间复杂度：$O(n^{3})$。
- 空间复杂度：$O(n^{3})$。

## 五、空间优化

观察上面的状态转移方程，在计算 $f[k+1]$ 时，只会用到 $f[k]$，不会用到（第一个维度的）下标小于 $k$ 的状态。

能不能像$0-1$ 背包那样，把第一个维度去掉呢？也就是

$$f[i][j]=min(f[i][j],f[i][k]+f[k][j])$$

不幸的是，我们无法确定 $k$ 和 $i,j$ 的大小关系，上式中的$f[i][k]$的值可能是 $f[k][i][k]$，也有可能被覆盖成了 $f[k+1][i][k]$。同样的，$f[k][j]$ 的值也可能被覆盖成了 $f[k+1][k][j]$

但是！从状态的定义来看：

- $f[k+1][i][k]$ 表示从 $i$ 到 $k$ 的最短路长度，并且这条最短路的中间节点编号都 $≤k$。由于终点是 $k$，那么中间节点必然不包含 $k$，所以中间节点编号都 $≤k−1$，所以 $f[k+1][i][k]=f[k][i][k]$！
- 同理，$f[k+1][k][j]=f[k][k][j]$。

因为值没变，所以不用担心被覆盖，直接去掉第一个维度。

初始值 $f[i][j]=w[i][j]$。

三重循环结束后，$f[i][j]$ 就是从 $i$ 到 $j$ 的最短路了。

```py
class Solution:
    def findTheCity(self, n: int, edges: List[List[int]], distanceThreshold: int) -> int:
        w = [[inf] * n for _ in range(n)]
        for x, y, wt in edges:
            w[x][y] = w[y][x] = wt

        f = w
        for k in range(n):
            for i in range(n):
                for j in range(n):
                    # f[i][j] = min(f[i][j], f[i][k] + f[k][j])
                    # 手动 if 比大小更快
                    s = f[i][k] + f[k][j]
                    if s < f[i][j]:
                        f[i][j] = s

        ans = 0
        min_cnt = inf
        for i in range(n):
            cnt = 0
            for j in range(n):
                if j != i and f[i][j] <= distanceThreshold:
                    cnt += 1
            if cnt <= min_cnt:  # 相等时取最大的 i
                min_cnt = cnt
                ans = i
        return ans
```

#### 复杂度分析

- 时间复杂度：$O(n^{3})$。
- 空间复杂度：$O(n^{2})$。

## 思考题

向图中添加一条边，如何维护 $f$ 数组？

最暴力的做法是，每次添加一条边，就用 $O(n^{3})$ 时间全部重算一遍。有没有更快的做法呢？

这题是  [2642. 设计可以求最短路径的图类](https://leetcode.cn/problems/design-graph-with-shortest-path-calculator/)

## 分类题单

> [!abstract]- 题单
> 
> [如何科学刷题？](https://leetcode.cn/circle/discuss/RvFUtj/)
> 
> 1. [滑动窗口与双指针（定长/不定长/单序列/双序列/三指针/分组循环）](https://leetcode.cn/circle/discuss/0viNMK/)
> 2. [二分算法（二分答案/最小化最大值/最大化最小值/第K小）](https://leetcode.cn/circle/discuss/SqopEo/)
> 3. [单调栈（基础/矩形面积/贡献法/最小字典序）](https://leetcode.cn/circle/discuss/9oZFK9/)
> 4. [网格图（DFS/BFS/综合应用）](https://leetcode.cn/circle/discuss/YiXPXW/)
> 5. [位运算（基础/性质/拆位/试填/恒等式/思维）](https://leetcode.cn/circle/discuss/dHn9Vk/)
> 6. 【本题相关】[图论算法（DFS/BFS/拓扑排序/最短路/最小生成树/二分图/基环树/欧拉路径）](https://leetcode.cn/circle/discuss/01LUak/)
> 7. [动态规划（入门/背包/状态机/划分/区间/状压/数位/数据结构优化/树形/博弈/概率期望）](https://leetcode.cn/circle/discuss/tXLS3i/)
> 8. [常用数据结构（前缀和/差分/栈/队列/堆/字典树/并查集/树状数组/线段树）](https://leetcode.cn/circle/discuss/mOr1u6/)
> 9. [数学算法（数论/组合/概率期望/博弈/计算几何/随机算法）](https://leetcode.cn/circle/discuss/IYT3ss/)
> 10. [贪心与思维（基本贪心策略/反悔/区间/字典序/数学/思维/脑筋急转弯/构造）](https://leetcode.cn/circle/discuss/g6KTKL/)
> 11. [链表、二叉树与回溯（前后指针/快慢指针/DFS/BFS/直径/LCA/一般树）](https://leetcode.cn/circle/discuss/K0n2gO/)
> 12. [字符串（KMP/Z函数/Manacher/字符串哈希/AC自动机/后缀数组/子序列自动机）](https://leetcode.cn/circle/discuss/SJFwQI/)
> 
> [我的题解精选（已分类）](https://leetcode.cn/link/?target=https%3A%2F%2Fgithub.com%2FEndlessCheng%2Fcodeforces-go%2Fblob%2Fmaster%2Fleetcode%2FSOLUTIONS.md)
> 
> 欢迎关注 [B站@灵茶山艾府](https://leetcode.cn/link/?target=https%3A%2F%2Fspace.bilibili.com%2F206214)