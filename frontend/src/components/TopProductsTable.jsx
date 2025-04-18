import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

const API_BASE_URL = "http://localhost:5555";

const TopProductsTable = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/top-products`);
        setTopProducts(response.data);
      } catch (error) {
        console.error("Eroare la preluarea celor mai vândute produse:", error);
        setError("Nu am putut prelua cele mai vândute produse.");
      }
    };

    fetchTopProducts();
  }, []);

  if (error) {
    return (
      <Box
        bg="black"
        borderRadius="lg"
        boxShadow="lg"
        p={{ base: 3, md: 4 }}
        maxW={{ base: "100%", md: "350px" }}
        w="100%"
        minH={{ base: "auto", md: "400px" }}
        textAlign="center"
        border="1px solid"
        borderColor="gray.700"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Heading
          size="md"
          color="white"
          mb={4}
          fontFamily="'Poppins', sans-serif"
          fontWeight="bold"
        >
          Top produse delicioase
        </Heading>
        <Text color="white">{error}</Text>
      </Box>
    );
  }

  if (topProducts.length === 0) {
    return (
      <Box
        bg="black"
        borderRadius="lg"
        boxShadow="lg"
        p={{ base: 3, md: 4 }}
        maxW={{ base: "100%", md: "350px" }}
        w="100%"
        minH={{ base: "auto", md: "400px" }}
        textAlign="center"
        border="1px solid"
        borderColor="gray.700"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Heading
          size="md"
          color="white"
          mb={4}
          fontFamily="'Poppins', sans-serif"
          fontWeight="bold"
        >
          Top produse delicioase
        </Heading>
        <Text color="white">Nu există date disponibile.</Text>
      </Box>
    );
  }

  return (
    <Box
      bg="black"
      borderRadius="30px 30px 30px"
      boxShadow="lg"
      p={{ base: 3, md: 4 }}
      maxW={{ base: "100%", md: "350px" }}
      w="100%"
      minH={{ base: "auto", md: "500px" }}
      border="1px solid"
      borderColor="gray.700"
    >
      <Heading
        size={{ base: "md", md: "lg" }}
        color="white"
        mb={6}
        textAlign="center"
        fontFamily="'Poppins', sans-serif"
        fontWeight="bold"
      >
        Alegeri perfecte &#x1F3C6;
      </Heading>
      <Box overflowX="auto">
        <Table variant="unstyled" width="100%">
          <Thead>
            <Tr>
              <Th
                p={{ base: "10px", md: "14px" }}
                bgGradient="linear-gradient(135deg, #ff4d4d, #cc0000)"
                color="white"
                borderRadius="5px 0 0 0"
                textAlign="left"
                fontFamily="'Poppins', sans-serif"
                fontWeight="700"
                fontSize={{ base: "14px", md: "16px" }}
                borderBottom="2px solid #ff4d4d"
              >
                Produs
              </Th>
              <Th
                p={{ base: "10px", md: "14px" }}
                bgGradient="linear-gradient(135deg, #ff4d4d, #cc0000)"
                color="white"
                borderRadius="0 8px 0 0"
                textAlign="center"
                fontFamily="'Poppins', sans-serif"
                fontWeight="700"
                fontSize={{ base: "14px", md: "16px" }}
                borderBottom="2px solid #ff4d4d"
              >
                Vânzări
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {topProducts.map((product, index) => (
              <Tr
                key={product._id || index}
                bg="black"
                transition="all 0.3s ease"
                _hover={{
                  bg: "red.600",
                  boxShadow: "0 2px 8px rgba(255, 77, 77, 0.3)",
                }}
              >
                <Td
                  p={{ base: "10px", md: "14px" }}
                  textAlign="left"
                  fontFamily="'Roboto', sans-serif"
                  fontWeight="600"
                  fontSize={{ base: "13px", md: "15px" }}
                  color="white"
                  borderBottom="1px solid"
                  borderColor="gray.600"
                >
                  {product.name}
                </Td>
                <Td
                  p={{ base: "10px", md: "14px" }}
                  textAlign="center"
                  fontFamily="'Roboto', sans-serif"
                  fontWeight="600"
                  fontSize={{ base: "13px", md: "15px" }}
                  color="white"
                  borderBottom="1px solid"
                  borderColor="gray.600"
                >
                  {product.sales}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default TopProductsTable;