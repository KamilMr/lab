This repository was set up while following a course by Hussein Nasser on [Udemy](https://www.udemy.com/course/nodejs-internals-and-architecture). He used `strace` to trace system calls that processes make and receive. It is available on Linux. Since I am using a Mac, I use Docker for that.

You need to have Docker installed.

```bash
# I noticed there are some issues when building the image so sometimes it needs to be run twice. This
# has to be investigated TODO.
docker build . -t strace
docker run -it strace bash
```

From now on play with it

```bash
# in  /app
strace -f -t node <script name>
```