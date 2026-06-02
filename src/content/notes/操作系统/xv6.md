## 文件关闭

位于 `kernal/sysfile.c` 下。

```c
sys_close(void) // 系统调用层的关闭
{
  int fd;
  struct file *f;

  if(argfd(0, &fd, &f) < 0)
    return -1;
  myproc()->ofile[fd] = 0; // 放文件描述符
  fileclose(f); // 内核功能层，处理文件对象本身
  return 0;
}
```

`kernal/file.c:fileclose()`：

```c
void
fileclose(struct file *f)
{
  struct file ff;

  // 1. 加锁：保护全局文件表 ftable，防止多个进程同时修改同一个文件结构体
  acquire(&ftable.lock);

  // 2. 健壮性检查：如果引用计数已经小于 1，说明内核逻辑出错（重复释放）
  if(f->ref < 1)
    panic("fileclose");

  // 3. 递减引用计数：如果减 1 后仍大于 0，说明还有其他进程/线程在使用该文件
  if(--f->ref > 0){
    release(&ftable.lock);
    return; // 直接返回，不销毁底层资源
  }

  // 4. 准备清理：引用计数归零，将文件结构体内容暂存到局部变量 ff
  // 这样做是为了能提前释放 ftable.lock，避免在后续耗时的 I/O 操作中占用锁
  ff = *f;
  f->ref = 0;
  f->type = FD_NONE; // 标记该文件槽位为空闲，可被其他 open 调用复用
  release(&ftable.lock);

  // 5. 根据文件类型执行真正的清理工作
  if(ff.type == FD_PIPE){
    // 如果是管道，关闭管道的读端或写端
    pipeclose(ff.pipe, ff.writable);
  } else if(ff.type == FD_INODE || ff.type == FD_DEVICE){
    // 如果是普通文件或设备文件
    // 开始一个文件系统事务（Transaction），确保 inode 操作的原子性
    begin_op();
    // 释放 inode：减少 inode 的引用计数，如果计数归零则将其写回磁盘并释放
    iput(ff.ip);
    end_op();
  }
}
```