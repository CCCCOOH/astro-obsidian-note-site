---
tags:
  - 数据结构
---
> 一年多没摸 C 了，因考研需要，粗略复习一下C语言。
> 参照教程：[the-c-beginner-handbook](https://www.freecodecamp.org/chinese/news/the-c-beginners-handbook/)

## 1. C语言简介

第一个程序，

```c
#include <stdio.h>
int main(void) {
  printf("Hello, World");
}
```

在这段代码中，
- `#include <stdio.h>` 表示导入了 `stdio` 库（标准输入/输出库）。
- `printf` 函数由 `stdio` 提供。
- 在 `stdio` 的某个地方，`printf` 被定义成：`int printf(const char *format, ...);`。


如何执行这段程序？好吧，任何mac和linux设备都自带了C编译器，windows除外。

在终端访问 `gcc` 命令看看有没有它。

对于 `hello.c` 这个程序，我们可以这样编译它：

```shell
gcc hello.c -o hello
```

> 顺便一提，从大一到大三这个命令我学过好多次，但因为缺少练习，我最终还是会忘记它。所以，emmm，由于效率问题，我依然会选择使用VS插件来直接运行一个C语言程序。然后再次忘记这段指令。

完成后文件夹肯定出现了一个 `hello` 文件，用 `hello` 运行它。

![image.png](https://ccccooh.oss-cn-hangzhou.aliyuncs.com/img/202512071854959.png)

我们用命令看看他的大小：

![image.png](https://ccccooh.oss-cn-hangzhou.aliyuncs.com/img/202512071855978.png)

这大概是3kb，很小对吧，因为C是高度优化的。

## 2. 变量与类型

C是一门静态类型语言。

比如，初始化一个 `int` 类型的变量：

```c
int age;
// 或者
int age = 37;
```

然后访问它：

```c
#include <stdio.h>
int age = 3;
int main(void) {
  printf("%d", age);
}
```

> 顺便再一提，这些经常使用的代码我还是记得的。但为了避免下次再浪费时间在这种对语法的纠结上，我决定整体过一遍。

### 2.1 整数

这些都是C语言中的整数类型：
- `char`
- `int`
- `short`
- `long`

特别注意到 `char`，它保存的实际上只是字符的ASCII码，它也可以用于保存 `-128` ～ `127` 之间的小整数，它至少占据一个字节那么大。

### 2.2 无符号整数

对于所有的数据类型都可以在前面追加上一个：`unsigned`。

这样，值的范围不是从负数开始，而是从0开始。

- `unsigned char` 的范围从 `0` 开始，至少到 `255`；
- `unsigned int` 的方位从 `0` 开始，至少到 `65,535`；
- `unsigned short` 的范围从 `0` 开始，至少到 `65,535`
- `unsigned long` 的范围从 `0` 开始，至少到 `4,294,967,295`

### 2.3 溢出的问题

鉴于这一类范围的限制，我们就需要考虑一个问题：溢出了怎么办？如果保证数字不超过限制？

如果你有一个值为 255 的 `unsigned int`，自增返回的值为256，这在意料之中。
如果你有一个值为255的 `unsigned char`，自增后得到的结果就是0。它被重置了！
如果你有一个值为255的 `unsigned char`，给他加上10就会得到数字9；

```c
#include <stdio.h>
unsigned char a = 255;
int main(void) {
  unsigned char a1 = a + 1;
  unsigned char a2 = a + 10;
  printf("%d\n", a1); // 输出结果为 0 
  printf("%d", a2); // 输出结果为 9
}
```

如果你的值是有符号的，程序就会给你一个很大的数。并且，这个值往往是未知的，得看电脑的心情。

还记得吗，`char` 的范围是 `-128~127`，如果我们试图让他超过127就会...

```c
#include <stdio.h>
int main(void) {
  char boom = 127;
  boom = boom + 10;
  printf("%d\n", boom); // 我的mac得到了 -119
}
```

C是一个中立派，它并不会提醒你有这种错误。

### 2.4 声明错误类型的警告

只有在申明一个变量的时候，gcc才会提醒你有错误：

```c
#include <stdio.h>
int main(void) {
  char boom = 1270;
}
```

![image.png](https://ccccooh.oss-cn-hangzhou.aliyuncs.com/img/202512071921295.png)

如果你直接赋值，也会有警告：

```c
#include <stdio.h>
int main(void) {
  char boom;
  boom = 114514;
}
```

![image.png](https://ccccooh.oss-cn-hangzhou.aliyuncs.com/img/202512071922141.png)

### 2.5 浮点数

浮点类型可以表示的范围要比整型大得多（~~说点大家不知道的~~），还可以表示小数。

浮点数可以被写成：
- `1.29e-3`
- `-2.3e+5`

和一些其他的形式。

下面这几种类型：
- `float`
- `double`
- `long double`

任何C的实现都必须满足的最小要求是 `float` 可以表示的范围在10^-37到10^+37之间的数，通常用32位比特实现，也就是四个字节（$4\times8$）。`double` 可以表示一组更大范围的数，`long double` 可以保存的更多。

与整数一样，浮点数的确切值取决于具体实现。

问题的关键在于如何确定自己机器上这些类型的大小，在我的系统上（我也是一台现代 Mac），输出如下：

```c
#include <stdio.h>
int main(void) {
  printf("char %lu bytes\n", sizeof(char)); // char 1 bytes
  printf("int %lu bytes\n", sizeof(int)); // int 4 bytes
  printf("short %lu bytes\n", sizeof(short)); // short 2 bytes
  printf("long %lu bytes\n", sizeof(long)); // long 8 bytes
  printf("float %lu bytes\n", sizeof(float)); // float 4 bytes
  printf("double %lu bytes\n", sizeof(double)); // double 8 bytes
  printf("long double %lu bytes\n", sizeof(long double)); // long double 8 bytes
}
```

> 注释附上了贴心的输出。

## 3. 常量

谈谈常量吧，你总是需要给常量赋一个值。

类似于这样：
```c
const int AGE = 3;
```

尽管这只是一个惯例，但通常常量被写成大写，这样更加醒目：`const int AGE = 3;`。

另一种定义方法是（显然，我还记得这叫做宏定义）：

```c
#define AGE 37
```

在这种情况下，你不需要添加类型，也不需要用 `=`，还可以省略末尾的分号。因为C编译器会在编译时自动推测出类型（我一直以为 `#define` 只是在编译阶段做了简单的字符替换）。
## 4. 运算符

我们有这样一些运算符：
- 算数运算符
- 比较运算符
- 逻辑运算符
- 复合赋值运算符
- 位运算符
- 指针运算符
- 结构运算符
- 混合运算符

### 4.1 算数运算符

这是一些二元运算符：

| 操作符 | 名字  | 示例      |
| --- | --- | ------- |
| `=` | 赋值  | `a = b` |
| `+` | 加   | `a + b` |
| `-` | 减   | `a - b` |
| `*` | 乘   | `a * b` |
| `/` | 除   | `a / b` |
| `%` | 取模  | `a % b` |

一元运算符只需要一个操作符：

| 运算符  | 名字  | 示例             |
| ---- | --- | -------------- |
| `+`  | 一元加 | `+a`           |
| `-`  | 一元减 | `-a`           |
| `++` | 自增  | `a++` or `++a` |
| `--` | 自减  | `a--` or `--a` |

### 4.2 比较运算符

| 运算符  | 名字   | 示例       |
| ---- | ---- | -------- |
| `==` | 相等   | `a == b` |
| `!=` | 不相等  | `a != b` |
| `>`  | 大于   | `a > b`  |
| `<`  | 小于   | `a < b`  |
| `>=` | 大于等于 | `a >= b` |
| `<=` | 小于等于 | `a <= b` |
> 它们还是熟悉的样子。
### 4.3 逻辑运算符

- `!` 非（例如：`!a`）
- `&&` 与（例如：`a && b`）
- `||` 或（例如：`a || b`）

一般情况下，他们被用在布尔运算中

### 4.4 复合赋值运算符

|运算符|名字|示例|
|---|---|---|
|`+=`|加且赋值|`a += b`|
|`-=`|减且赋值|`a -= b`|
|`*=`|乘且赋值|`a *= b`|
|`/=`|除且赋值|`a /= b`|
|`%=`|求模且赋值|`a %= b`|
用他们来减少代码量。

### 4.5 三目运算符

这是C中唯一一个使用三个操作数的运算符，炫技必备：`<条件> ? <表达式> : <表达式>`。功能与条件表达式一样。

### 4.6 sizeof
`sizeof` 操作符返回你传入的操作数的大小。可以传入变量，或者类型。

使用示例如下：

```c
#include <stdio.h>

int main(void) {
  int age = 37;
  printf("%lu\n", sizeof(age)); // 4
  printf("%lu\n", sizeof(int)); // 4
}
```

### 4.7 运算符的优先级

按照顺序，从低到高：
- 赋值运算符 `=`
- 二元运算符 `+` 和 `-`
- 运算符 `*` 和 `/`
- 一元运算符 `+` 和 `-`
- 括号的优先级最高


## 5. 条件语句

### 5.1 if

没什么好说的，每个语言都有，每个语言都差不多。
### 5.2 switch

如果你的检查需要很多的 `if/else/if` 块，那可能是你需要检查变量的具体值，这时候 `switch` 就非常有用了。

你可以提供一个变量作为条件，然后为期望的每一个值使用一个 `case` 入口点：

```c
#include <stdio.h>

int main(void) {
  int a = 1;
  switch (a) {
    case 0:
    // 进行一些操作
    break;
    case 1:
    // 进行一些操作
    break;
    case 2:
    // 进行一些操作
      break;
    default:
      break;
  }
}
```

这里相对迷惑的行为是需要在每一个case块中加入 `break`，用于防止执行下一个 `case` 块。在某些情况下，这非常有用。可以在末尾添加一个 `default` 块来捕获所有的 `case` 块。

`default` 表示在所有捕获失败的情况下，给你一个默认的处理操作。

如果捕获成功，会从成功的case块一直往下执行下去，直到遇到了第一个 `break` 才停止。

比如这里：

```c
#include <stdio.h>

int main(void)
{
  int a = 1;
  switch (a)
  {
  case 0:
    puts("0");
    // 进行一些操作
  case 1:
    puts("1");
    // 进行一些操作
  case 2:
    puts("2");
    break;
    // 进行一些操作
  case 3:
    puts("3");
    // 进行一些操作
  default:
    puts("默认操作...");
    break;
  }
}
```
## 6. 循环

我们可以用 `break` 来跳出一个循环，呃，就这么多...
## 7. 数组

在C中，数组中的每个值都必须有**相同的类型**。这意味着你将会有 `int` 值组成的数组，`double` 组成的数组等等。

可以这样定义一个 `int` 型的数组：
```c
int prices[5];
```

在C中，你必须总是声明数组的大小。C没有开箱即用的动态数组（为此，你必须使用像链表这样的数据结构）。

你可以用常量定义数组的大小：

```c
#include <stdio.h>

const int size = 5;
int prices[size];

int main(void) { };
```

也可以在定义数组的时候进行初始化：
```c
#include <stdio.h>

int prices[] = {1, 2, 3, 4, 5};

int main(void)
{
  printf("%d", prices[2]);
};
```

也可以定义之后再赋值，这没啥好说的。

其中，数组变量名其实是一个指向数组首地址的指针，所以，你也可以像使用普通指针一样使用数组。

## 8. 字符串

在C中，字符串是一种特殊的数组：由 `char` 组成的数组。

```c
char name[7];
char name[7] = "Flavio"; // 更加方便的方法，效果完全一样
```


简而言之，它用于存放ASCII中的字母。你可以用 `printf("%s", name);` 来打印一段字符串。

你可能已经注意到了，这里只有6个字母，但却分配了7个字符的存储空间。这是因为字符串中最后一个字符必须是 `0`，它是字符串的终止符号，我们必须给它留个位置。

说到操作字符串，C提供了一个非常重要的标准库：`string.h`。

有这些函数可供你使用：
- `strcpy()`：将一个字符串复制到另一个字符串
- `strcat()`：将一个字符串追加到另一个字符串
- `strcmp()`：比较两个字符串是否相等
- `strncmp()`：比较两个字符串的前 `n` 个字符
- `strlen()`：计算字符串的长度

## 9. 指针

这是C语言中最负盛名的一个知识点。如果你没学过数据结构，它肯定是你啃的第一个难点。

当你声明一个整数时，可以用 `&` 运算符获取内存中该变量的地址。

```c
#include <stdio.h>

int main(void)
{
  int a = 3;
  printf("%p", &a); // %p 表示格式化输出地址
};
```

我们可以将该地址赋值给一个变量：

```c
int addr = &a; // 我报错了！
```

或者定义一个指针，让它指向这个地址：
```c
#include <stdio.h>

int main(void)
{
  int a = 3;
  int* addr = &a;
  printf("%p\n", addr); // 依次打印地址
  printf("%d\n", *addr); // 打印值
};
```

如果修改了指针所指的值，那么被指向的那个变量就会改变。

```c
#include <stdio.h>

int main(void)
{
  int a = 3;
  int* addr = &a;
  printf("%p\n", addr);
  printf("%d\n", *addr);
  // 修改指针所指向地址的值
  *addr = 15;
  printf("%d\n", a); // 发现a变成了15
  printf("%d\n", *addr); // 发现addr变成了15
};
```

我们可以用指针指向一个数组，用法和正常使用数组一样。

```c
#include <stdio.h>
int arr[] = {12, 23, 34, 45, 56};
int main(void)
{
  int *p = arr;
  printf("%d\n", *p);
  printf("%d\n", p[2]);
  printf("%d\n", *(p+1));
};
```

我们可以用指针做很多美妙的字符串操作，因为字符串的底层就是char构成的数组。
## 10. 函数

重点看看指针在函数中是怎么用的。

我们来把玩一番：
```c
#include <stdio.h>

int* test(int * a) {
  printf("test: %d\n", *a); // test: 114514
  int * b = a;
  return b;
}

int main(void)
{
  int a = 114514;
  int *p = &a;
  int *p2 = test(p);
  printf("p2: %d\n", *p2); // p2: 114514
};
```

## 11. 输入与输出

格式指示符：
- `%c` 用于字符
- `%s` 用于字符串
- `%f` 用于浮点数
- `%p` 用于指针

输入使用 `scanf("")`。
```c
#include <stdio.h>

int main(void) {
  int a;
  scanf("%d", &a);
  printf("%d\n", a);
}
```

输入函数需要传递一个地址，可见其实现一定使用到了指针或者某种地址的操作。

## 12. 变量作用域

## 13. 静态变量

## 14. 全局变量

## 15. 类型定义

C中的 `typedef` 关键字允许你定义新的类型。

其格式为：`typdef EXISTING_TYPE YOUR_NEW_TYPE`。

```c
#include <stdio.h>
typedef int MY;
int main(void) {
  MY a = 3;
  printf("%d", a); // 3
}
```

你可能会问，这玩意有什么用？答案是当两个搭配在一起时 `typedef` 会非常有用：
- 枚举类型
- 结构体

## 16. 枚举类型

使用 `typedef` 和 `enum` 关键字，我们可以定义具有指定值的类型。这是 `typedef` 关键字最重要的使用场景之一。

这是枚举类型的语法：
```c
typedef enum {
  true,
  false
}Boolean;
```

> 我认为这个例子很奇怪。

下面这个例子会更好一些：
```c
#include <stdio.h>
typedef enum {
  monday, // 0
  tuesday, // 1
  wednesday, // 2
  thursday, // 3
  friday, // 4
  saturday,
  sunday
} WEEKDAY;


int main(void) {
  WEEKDAY a = monday;
  printf("%d\n", a); // 0
  a = tuesday;
  printf("%d\n", a); // 1
  a = wednesday;
  printf("%d\n", a); // 2
  a = thursday;
  printf("%d\n", a); // 3
}
```

枚举类型的内部每一个变量都会与一个不同的整数进行配对，并且你可以看到是从0开始递增的。
## 17. 结构体

由于C语言中的数组只能存放同一种数据类型的数据，结构体就显得很好玩了。

语法：`struct <struct_name> {...}`。

示例：
```c
#include <stdio.h>

struct person {
  int age;
};

int main(void) {
  struct person a;
  printf("%d", a.age);
}
```

尤其需要注意的一点，尤其是对于那些过很多高级语言的人。不能把结构体直接当成对象去使用，需要用 `struct` 申明这是一个结构体，而不是：

```c
person a; // 忽略了 struct
```

如果不想每次都用 `struct` 来申明一个新的变量，也可以这样写：

```c 
#include <stdio.h>

struct person {
  int age;
} a;


int main(void) {
  printf("%d", a.age);
}
```

这表示直接声明 `a` 是一个 `person` 结构体变量，也可以声明很多个。其本质都是这样一句 `struct person a, *b,c[3],xxx,...;`

比如:
```c
#include <stdio.h>

struct person {
  int age;
  char* name;
} school[20], girl, *p;


int main(void) {
  school[0].name = "小明";
  girl.age = 12;
  girl.name = "小吕孩";
  p = &girl;
  printf("%s\n",school[0].name); // 小孩
  printf("%s\n", girl.name); //  小吕孩
  p->name = "小孩";
  printf("%s\n", p->name); // 小孩
  printf("%s\n", girl.name); // 小孩
}
```

如果想在定义结构体的时候初始化结构体内部的属性：

```c
#include <stdio.h>

struct person {
  int age;
  char* name;
};

int main(void) {
  struct person xm = {
    23,
    "小明"
  };
  printf("年龄：%d，姓名：%s\n", xm.age, xm.name); // 年龄：23，姓名：小明
}
```

也可以用点符号 `.` 来修改结构体中的属性值，就像你平时操作对象那样。

> 结构体是**复制传递**的，这一点很重要。当然，你可以用一个指针指向结构体，这样就避免了复制。

我们可以使用 `typedef` 来简化结构体的代码：
```c
#include <stdio.h>

struct person {
  int age;
  char* name;
};

typedef struct Person {
  int age;
  char* name;
} PERSON;

int main(void) {
  struct person xm = {
    23,
    "小明"
  };
  PERSON xh = {
    12,
    "小红"
  };
  printf("年龄：%d，姓名：%s\n", xm.age, xm.name); // 年龄：23，姓名：小明
  printf("年龄：%d，姓名：%s\n", xh.age, xh.name); // 年龄：12，姓名：小红
}
```

我把两者放在一起，方便对比。

> 我仅仅复习到这里，对于数据结构来说应该是完全够用了，总共花费我两个半小时，比我预计的要少很多。又可以快乐数据结构了😋。
## 18. 命令行参数

## 19. 头文件

## 20. 预处理器

## 21. 结语