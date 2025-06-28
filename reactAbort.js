    const controller = new AbortController();

    fetch('https://api.example.com/data', { signal: controller.signal })
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      });
