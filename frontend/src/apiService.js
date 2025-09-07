const BACKEND_URL = 'http://localhost:9090';

// For getting data FROM the Ballerina backend
export const getData = async (path) => {
  const response = await fetch(`${BACKEND_URL}/${path}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend Error: ${errorText}`);
  }
  return response.json();
};