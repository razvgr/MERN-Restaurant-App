import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  useToast,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; 
import axios from "axios";

const API_BASE_URL = "http://localhost:5555";

const DeliveryPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const role = localStorage.getItem("role");

  // State pentru paginare
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6; 

  useEffect(() => {
    if (role !== "curier") {
      toast({
        title: "Acces interzis",
        description: "Această pagină este accesibilă doar curierilor.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate("/main");
    }
  }, [role, navigate, toast]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedOrders = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Eroare la preluarea comenzilor:", error);
        toast({
          title: "Eroare",
          description: "Nu am putut prelua comenzile.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (role === "curier") {
      fetchOrders();
    }
  }, [role, toast]);

const handleMarkAsDelivered = async (orderId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.patch(
      `${API_BASE_URL}/orders/${orderId}`,
      { status: "delivered" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const updatedOrders = orders.map((order) =>
      order._id === orderId ? { ...order, status: "delivered" } : order
    );
    setOrders(
      updatedOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    );
    toast({
      title: "Succes",
      description: "Comanda a fost marcată ca livrată!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (error) {
    console.error("Eroare la marcarea comenzii ca livrată:", error);
    toast({
      title: "Eroare",
      description: "Nu am putut actualiza starea comenzii.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
};

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Box p={6} maxW="1200px" mx="auto" bg="gray.50" minH="100vh">
      <Heading mb={6} color="red.500" textAlign="center">
        Livrări
      </Heading>
      {orders.length === 0 ? (
        <Text textAlign="center" color="gray.500">
          Nu există comenzi de livrat momentan.
        </Text>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {currentOrders.map((order) => (
              <Card
                key={order._id}
                borderWidth="1px"
                borderRadius="lg"
                boxShadow="md"
                bg="white"
                transition="all 0.3s ease"
                _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
              >
                <CardHeader>
                  <Heading size="md" color="red.500">
                    Comanda #{order._id.slice(-6)}
                  </Heading>
                  <Badge
                    colorScheme={order.status === "pending" ? "yellow" : "green"}
                    mt={2}
                  >
                    {order.status === "pending" ? "În așteptare" : "Livrat"}
                  </Badge>
                </CardHeader>
                <CardBody>
                  <Text fontWeight="bold">Adresa: {order.address}</Text>
                  <Text>Metoda de plată: {order.paymentMethod}</Text>
                  <Text>Observații: {order.notes || "N/A"}</Text>
                  <Text mt={2} fontWeight="bold">
                    Total: {order.total} RON
                  </Text>
                  <Text mt={2} fontSize="sm">
                    Produse:
                  </Text>
                  <VStack align="start" spacing={1}>
                    {order.items.map((item, index) => (
                      <Text key={index} fontSize="sm">
                        - {item.name} x{item.quantity} ({item.price} RON)
                        {item.toppings && item.toppings.length > 0 && (
                          <Text as="span" color="gray.500">
                            {" "}
                            (Toppinguri: {item.toppings.join(", ")})
                          </Text>
                        )}
                      </Text>
                    ))}
                  </VStack>
                </CardBody>
                <CardFooter>
                  {order.status === "pending" && (
                    <Button
                      colorScheme="green"
                      size="sm"
                      onClick={() => handleMarkAsDelivered(order._id)}
                    >
                      Marcare ca livrat
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>

          {/* Paginare */}
          {totalPages > 1 && (
            <Flex
              justify="center"
              align="center"
              mt={8}
              gap={4}
              p={4}
              bg="white"
              borderRadius="lg"
              boxShadow="md"
            >
              <IconButton
                aria-label="Previous page"
                icon={<FaArrowLeft />}
                colorScheme="red"
                size="md"
                borderRadius="full"
                isDisabled={currentPage === 1}
                onClick={handlePreviousPage}
                _hover={{ bg: "red.600", transform: "scale(1.1)" }}
              />
              <Text fontWeight="bold" color="gray.700">
                Pagina {currentPage} din {totalPages}
              </Text>
              <IconButton
                aria-label="Next page"
                icon={<FaArrowRight />}
                colorScheme="red"
                size="md"
                borderRadius="full"
                isDisabled={currentPage === totalPages}
                onClick={handleNextPage}
                _hover={{ bg: "red.600", transform: "scale(1.1)" }}
              />
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};

export default DeliveryPage;