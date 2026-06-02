> 对 DFS 和 BFS 的纯 C 代码实现，尽量采用静态链表。邻接表部分采用链式前向星实现。
## 邻接表的构造

```c
#include <stdio.h>
#include <string.h>

#define MAX_V 100    // 最大顶点数
#define MAX_E 200    // 最大边数（如果是无向图，需开2倍空间）

// 定义存储邻接表的数组
int head[MAX_V];     // head[u] 表示顶点 u 的第一条边在下述数组中的索引
int to[MAX_E];       // to[e]   表示第 e 条边的终点
int next[MAX_E];     // next[e] 表示与第 e 条边同起点的下一条边的索引
int edge_cnt = 0;    // 当前边的计数器（索引）

// 初始化邻接表
void init(int n) {
    edge_cnt = 0;
    // 将 head 初始化为 -1，表示目前没有任何边
    memset(head, -1, sizeof(int) * n);
}

// 添加边：从 u 到 v
void add_edge(int u, int v) {
    to[edge_cnt] = v;         // 记录终点
    next[edge_cnt] = head[u]; // 将当前边指向 u 之前的“第一条边”
    head[u] = edge_cnt;       // 更新 u 的第一条边为当前边
    edge_cnt++;               // 边索引自增
}

// 遍历打印邻接表
void print_graph(int n) {
    for (int i = 0; i < n; i++) {
        printf("顶点 %d: ", i);
        // 从 head[i] 开始，通过 next 数组不断找下一条边
        for (int e = head[i]; e != -1; e = next[e]) {
            printf("%d -> ", to[e]);
        }
        printf("NULL\n");
    }
}

int main() {
    int numVertices = 5;
    // 模拟边数组：{起点, 终点}
    int edges[][2] = {
        {0, 1}, {0, 2},
        {1, 2}, {1, 3}, {1, 4},
        {2, 0},
        {3, 3}
    };
    int numEdges = sizeof(edges) / sizeof(edges[0]);

    init(numVertices);

    // 构造邻接表
    for (int i = 0; i < numEdges; i++) {
        add_edge(edges[i][0], edges[i][1]);
    }

    // 打印结果
    print_graph(numVertices);

    return 0;
}

```

## 邻接表

### BFS

```c
#include <stdio.h>

#define MAXV 100     // 最大顶点数
#define MAXE 1000    // 最大边数（无向图要 *2）

/* -------- 邻接表（数组实现） -------- */
int head[MAXV];   // 每个顶点的第一条边
int to[MAXE];     // 边指向的顶点
int next[MAXE];   // 下一条边
int idx;          // 当前边下标

/* -------- 初始化图 -------- */
void initGraph(int n) {
    // 将所有head[i]置为-1，也就是表示所有节点指向的节点暂时不存在，后面再添加。
    int i;
    for (i = 0; i < n; i++) {
        head[i] = -1;
    }
    idx = 0;
}

/* -------- 添加一条有向边 u -> v -------- */
void addEdge(int u, int v) {
    to[idx] = v;
    next[idx] = head[u];
    head[u] = idx;
    idx++;
}

/* -------- 添加无向边 u - v -------- */
void addUndirectedEdge(int u, int v) {
    addEdge(u, v);
    addEdge(v, u);
}

/* -------- BFS（邻接表，数组版） -------- */
void BFS(int start, int n) {
    int visited[MAXV] = {0};
    // 将所有访问标志置为0，表示都没有访问过
    int queue[MAXV];
    // 申明队列
    int front = 0, rear = 0;
    // 队头队尾指针
    visited[start] = 1;                     // 将当前的节点标记为【已访问】
    queue[rear++] = start;                  // 并入队

    while (front < rear) {                  // 表示队列中还有元素, 就继续处理!
        int u = queue[front++];             // 让 u 出队
        printf("%d ", u);                   // 打印

        for (int i = head[u]; i != -1; i = next[i]) {   // 遍历出队结点的边表，其中 i 是第一条边，-1 表示边的结束。每次往后取边表
            int v = to[i];                              // v 表示当前边指向的结点
            if (!visited[v]) {                          // 如果 边所指向的结点 未被标记📌
                visited[v] = 1;                         // 标记，防止重复访问
                queue[rear++] = v;                      // 入队。
            }
        }
    }
}

/* -------- 主函数测试 -------- */
int main() {
    int n = 5;   // 顶点 0~4
    initGraph(n);                                      // 初始化图表

    /* 构造无向图 */
    addUndirectedEdge(0, 1);
    addUndirectedEdge(0, 2);
    addUndirectedEdge(1, 3);
    addUndirectedEdge(1, 4);

    printf("BFS from 0: ");
    BFS(0, n);

    return 0;
}

```

> [!info]- 指针实现
> ```c
> #include <stdio.h>
> #include <stdlib.h>
> 
> #define MAXV 100   // 最大顶点数
> 
> /* -------- 邻接表结点 -------- */
> typedef struct ArcNode {
>     int adjvex;                // 邻接点下标
>     struct ArcNode *next;      // 指向下一条边
> } ArcNode;
> 
> /* -------- 顶点结点 -------- */
> typedef struct VNode {
>     ArcNode *first;            // 指向第一条边
> } VNode;
> 
> /* -------- 图结构 -------- */
> typedef struct Graph {
>     VNode adjlist[MAXV];       // 邻接表
>     int vexnum;                // 顶点数
>     int arcnum;                // 边数
> } Graph;
> 
> /* -------- 初始化图 -------- */
> void initGraph(Graph *G, int n) {
>     int i;
>     G->vexnum = n;
>     G->arcnum = 0;
>     for (i = 0; i < n; i++) {
>         G->adjlist[i].first = NULL;
>     }
> }
> 
> /* -------- 添加一条有向边 u -> v -------- */
> void addEdge(Graph *G, int u, int v) {
>     ArcNode *p = (ArcNode *)malloc(sizeof(ArcNode));
>     p->adjvex = v;
>     p->next = G->adjlist[u].first;
>     G->adjlist[u].first = p;
>     G->arcnum++;
> }
> 
> /* -------- 无向图加边 u - v -------- */
> void addUndirectedEdge(Graph *G, int u, int v) {
>     addEdge(G, u, v);
>     addEdge(G, v, u);
> }
> 
> /* -------- BFS 遍历 -------- */
> void BFS(Graph *G, int start) {
>     int visited[MAXV] = {0};
>     int queue[MAXV];
>     int front = 0, rear = 0;
> 
>     visited[start] = 1;
>     queue[rear++] = start;
> 
>     while (front < rear) {
>         int u = queue[front++];
>         printf("%d ", u);
> 
>         ArcNode *p = G->adjlist[u].first;
>         while (p != NULL) {
>             int v = p->adjvex;
>             if (!visited[v]) {
>                 visited[v] = 1;
>                 queue[rear++] = v;
>             }
>             p = p->next;
>         }
>     }
> }
> 
> /* -------- 测试主函数 -------- */
> int main() {
>     Graph G;
>     initGraph(&G, 5);   // 5 个顶点：0~4
> 
>     /* 构造无向图 */
>     addUndirectedEdge(&G, 0, 1);
>     addUndirectedEdge(&G, 0, 2);
>     addUndirectedEdge(&G, 1, 3);
>     addUndirectedEdge(&G, 1, 4);
> 
>     printf("BFS from 0: ");
>     BFS(&G, 0);
> 
>     return 0;
> }
> 
> ```


### DFS

```c
#include <stdio.h>
#include <string.h>

#define MAX_V 100 // 最大顶点数
#define MAX_E 200 // 最大边数

// --- 邻接表（数组实现） ---
int head[MAX_V];  // 存储每个顶点的第一条边的索引
int to[MAX_E];    // 存储边的终点
int next[MAX_E];  // 存储下一条边的索引
int edge_cnt = 0; // 边计数器

// --- 辅助数组 ---
int visited[MAX_V]; // 标记数组：0表示未访问，1表示已访问

// 初始化图
void init(int n)
{
  edge_cnt = 0;                      // 边表索引
  memset(head, -1, sizeof(int) * n); // 第一条边索引初始化为-1，表示还没有边
  memset(visited, 0, sizeof(int) * n);
}

// 添加边（有向图）
void add_edge(int u, int v)
{
  to[edge_cnt] = v;         // 将边的终点设置为v
  next[edge_cnt] = head[u]; // 更新下一条边为head中第一条
  head[u] = edge_cnt;       // 将此边更新为head第一条
  edge_cnt++;               // 处理下一条边
}

// --- DFS 核心函数 ---
void DFS(int u)
{
  // 1. 访问当前节点并标记
  printf("%d ", u);
  visited[u] = 1;

  // 2. 遍历从 u 出发的所有邻居
  // 在链式前向星中，遍历邻居的方式如下：
  // 先遍历该节点的邻接表，也就是遍历一遍边表。
  for (int e = head[u]; e != -1; e = next[e])
  {
    // 取出边所指向的结点。
    int v = to[e]; // v 是 u 的邻居节点
    // 如果所指向的节点未被访问，就递归该节点。
    // 3. 如果邻居未被访问，则递归进入
    if (!visited[v])
    {
      DFS(v);
    }
  }
}

// 处理非连通图的遍历
void traverse_graph(int n)
{
  printf("DFS 遍历顺序: ");
  for (int i = 0; i < n; i++)
  {
    if (!visited[i])    // 如果未被访问过// 默认全部未被访问
    { // 所以会先对第一个块访问，dfs，进行标记
      // dfs后继续往后找visited，是否有没有被访问过的，对其进行dfs，如此往复，依次DFS完所有的联通块
      DFS(i);
    }
  }
  printf("\n");
}

int main()
{
  int numVertices = 6; // 五条边
  init(numVertices);

  // 构造一个图
  // 0 -> 1, 0 -> 2
  // 1 -> 3, 1 -> 4
  // 2 -> 5
  add_edge(0, 1);
  add_edge(0, 2);
  add_edge(1, 3);
  add_edge(1, 4);
  add_edge(2, 5);

  // 执行 DFS
  traverse_graph(numVertices);

  return 0;
}

```

## 邻接矩阵
### BFS

```c
#include <stdio.h>

#define MAXV 100   // 最大顶点数

int G[MAXV][MAXV];    // 邻接矩阵
int visited[MAXV];   // 访问标记
int n;                // 实际顶点数

/* -------- BFS（邻接矩阵） -------- */
void BFS(int start) {
    int queue[MAXV];
    int front = 0, rear = 0;
    int u, v;

    visited[start] = 1;
    queue[rear++] = start;

    while (front < rear) {
        u = queue[front++];
        printf("%d ", u);

        /* 扫描第 u 行邻接矩阵 */
        for (v = 0; v < n; v++) {
            if (G[u][v] != 0 && !visited[v]) {
                visited[v] = 1;
                queue[rear++] = v;
            }
        }
    }
}

/* -------- 主函数 -------- */
int main() {
    int i, j;

    n = 5;   // 顶点 0~4

    /* 初始化邻接矩阵 */
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            G[i][j] = 0;

    /* 构造无向图 */
    G[0][1] = G[1][0] = 1;
    G[0][2] = G[2][0] = 1;
    G[1][3] = G[3][1] = 1;
    G[1][4] = G[4][1] = 1;

    /* 初始化 visited */
    for (i = 0; i < n; i++)
        visited[i] = 0;

    printf("BFS from 0: ");
    BFS(0);

    return 0;
}

```

### DFS

```c
#include <stdio.h>

#define MAXV 100   // 最大顶点数

int G[MAXV][MAXV];    // 邻接矩阵
int visited[MAXV];   // 访问标记
int n;                // 实际顶点数

/* -------- DFS（邻接矩阵） -------- */
void DFS(int u) {   // u 表示当前结点
    int v;
    visited[u] = 1; // 将当前结点标记为【已访问】
    printf("%d ", u);

    for (v = 0; v < n; v++) { // 遍历当前结点的所有【出度】
        if (G[u][v] != 0 && !visited[v]) {  // 如果出度结点存在 且 未被访问
            DFS(v);                         // DFS() 递归该节点
        }
    }
}

/* -------- 主函数 -------- */
int main() {
    int i, j;

    n = 5;   // 顶点 0~4

    /* 初始化邻接矩阵 */
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            G[i][j] = 0;

    /* 构造无向图 */
    G[0][1] = G[1][0] = 1;
    G[0][2] = G[2][0] = 1;
    G[1][3] = G[3][1] = 1;
    G[1][4] = G[4][1] = 1;

    /* 初始化 visited */
    for (i = 0; i < n; i++)
        visited[i] = 0;

    printf("DFS from 0: ");
    DFS(0);

    return 0;
}

```

