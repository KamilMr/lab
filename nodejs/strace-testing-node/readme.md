I've got to have docker installed.

```bash
docker build . -t strace
docker run -it strace bash
```

From now on play with it

```bash
# in  /app
strace -f -t node <script name>

```