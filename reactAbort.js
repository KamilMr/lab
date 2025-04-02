import React, { useEffect, useState } from 'react';

const DataFetcher = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('https://api.example.com/data', { signal: controller.signal })
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      });

    // Cleanup function to abort the fetch request on unmount
    return () => {
      controller.abort();
    };
  }, []);

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
};
