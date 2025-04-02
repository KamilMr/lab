
<html>
<head>
  <title>VND to PLN</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
    table { width: 100%; max-width: 400px; margin: auto; border-collapse: collapse; }
    th, td { border: 1px solid black; padding: 8px; }
    input, select { width: 100%; padding: 10px; margin-top: 10px; font-size: 16px; }
  </style>
</head>
<body>
  <h1>Latest VND to PLN Exchange Rate: ${rate}</h1>
  <h2>Convert VND to PLN</h2>
  <p>Result: <span id="result"></span></p>
  <select id="currency">
    <option value="vnd">VND</option>
    <option value="pln">PLN</option>
  </select>
  <input type="number" id="amount" placeholder="Enter amount" oninput="convert()" />
  <h2>Conversion Table</h2>
  <table>
    <tr><th>VND</th><th>PLN</th></tr>
    ${tableRows}
  </table>
  <script>
    function convert() {
      const rate = ${rate};
      const amount = document.getElementById('amount').value;
      const currency = document.getElementById('currency').value;
      let result = 0;

      if (currency === 'vnd') {
        result = (amount * rate).toFixed(2);
      } else {
        result = (amount / rate).toFixed(2);
      }

      document.getElementById('result').innerText = result;
    }
  </script>
</body>
</html>
