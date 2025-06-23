I've got to have docker installed.

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