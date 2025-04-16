export const fetchProducts = async (category) => {
    const res = await fetch(`http://localhost:5555/api/products/${category}`);
    return res.json();
  };
  