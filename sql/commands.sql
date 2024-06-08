-- with common table expressionis a named temporary result set that exists within the scope of a single statement and that can be referred to later within that statement
WITH
  cte1 AS (SELECT a, b FROM table1),
  cte2 AS (SELECT c, d FROM table2)
SELECT b, d FROM cte1 JOIN cte2
WHERE cte1.a = cte2.c;
