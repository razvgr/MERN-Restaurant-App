import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Input,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = "http://localhost:5555";

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem("token");

  // State pentru datele utilizatorului
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // State pentru paginare
  const [displayedOrders, setDisplayedOrders] = useState([]); // Comenzile afișate
  const [page, setPage] = useState(1); // Pagina curentă
  const ordersPerPage = 6; // Numărul de comenzi pe pagină

  // Verifică dacă utilizatorul este logat
  useEffect(() => {
    if (!token) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii logat pentru a accesa această pagină.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate("/login", { state: { from: "/dashboard" } });
    } else {
      fetchUserData();
      fetchOrders();
    }
  }, [token, navigate, toast]);

  // Preluare date utilizator
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setNewUsername(response.data.username);
    } catch (error) {
      console.error("Eroare la preluarea datelor utilizatorului:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut prelua datele utilizatorului.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Preluare istoric comenzi
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
      // Inițializează comenzile afișate cu prima pagină
      setDisplayedOrders(response.data.slice(0, ordersPerPage));
    } catch (error) {
      console.error("Eroare la preluarea comenzilor:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut prelua istoricul comenzilor.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Funcție pentru a încărca mai multe comenzi
  const loadMoreOrders = () => {
    const nextPage = page + 1;
    const newOrders = orders.slice(0, nextPage * ordersPerPage);
    setDisplayedOrders(newOrders);
    setPage(nextPage);
  };

  // Modificare username
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Eroare",
        description: "Numele de utilizator nu poate fi gol.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/me/username`,
        { username: newUsername },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: "Succes",
        description: "Numele de utilizator a fost actualizat cu succes!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchUserData(); // Reîmprospătează datele utilizatorului
    } catch (error) {
      console.error("Eroare la actualizarea username-ului:", error.response?.data || error.message);
      toast({
        title: "Eroare",
        description: error.response?.data?.message || "Nu am putut actualiza numele de utilizator.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Modificare parolă
  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      toast({
        title: "Eroare",
        description: "Parola nu poate fi goală.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/me/password`,
        { password: newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: "Succes",
        description: "Parola a fost actualizată cu succes!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setNewPassword(""); // Resetează câmpul parolei
    } catch (error) {
      console.error("Eroare la actualizarea parolei:", error.response?.data || error.message);
      toast({
        title: "Eroare",
        description: error.response?.data?.message || "Nu am putut actualiza parola.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      background="white"
    >
      <Container maxW="container.xl" py={10} position="relative">
        {/* Buton de întoarcere în colțul din stânga sus */}
        <Link to="/main">
          <IconButton
            aria-label="Back to main"
            icon={<FaArrowLeft />}
            position="absolute"
            top={4}
            left={4}
            colorScheme="red"
            size="md"
            borderRadius="full"
            boxShadow="lg"
            _hover={{ bg: "red.600", transform: "scale(1.1)" }}
            zIndex={1000}
          />
        </Link>

        <Heading color="red.500" mb={8} textAlign="center">
        </Heading>

        {/* Secțiunea de profil și setări */}
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={6}
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="lg"
          mb={8}
        >
          {/* Setări utilizator */}
          <Box flex="1">
            <Heading size="md" color="red.500" mb={4}>
              Setări Cont
            </Heading>
            <VStack spacing={4} align="stretch">
              {/* Modificare username */}
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Nume utilizator
                </Text>
                <Flex gap={3}>
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Nume utilizator"
                    focusBorderColor="red.500"
                    borderRadius="md"
                    color="black"
                  />
                  <Button
                    colorScheme="red"
                    onClick={handleUpdateUsername}
                    isDisabled={newUsername === user?.username}
                  >
                    Actualizează
                  </Button>
                </Flex>
              </Box>

              {/* Modificare parolă */}
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Parolă nouă
                </Text>
                <Flex gap={3}>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Parolă nouă"
                    focusBorderColor="red.500"
                    borderRadius="md"
                    color="black"
                  />
                  <Button
                    colorScheme="red"
                    onClick={handleUpdatePassword}
                    isDisabled={!newPassword.trim()}
                  >
                    Actualizează
                  </Button>
                </Flex>
              </Box>
            </VStack>
          </Box>

          {/* Informații utilizator */}
          <Box flex="1" borderLeft={{ md: "1px" }} pl={{ md: 6 }}>
            <Heading size="md" color="red.500" mb={4}>
              Informații Cont
            </Heading>
            {user ? (
              <VStack spacing={2} align="start">
                <Text>
                  <strong>Nume utilizator:</strong> {user.username}
                </Text>
                <Text>
                  <strong>Rol:</strong> {user.role}
                </Text>
                <Text>
                  <strong>Last Login:</strong>{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </VStack>
            ) : (
              <Text color="gray.500">Se încarcă...</Text>
            )}
          </Box>
        </Flex>

        {/* Istoricul comenzilor */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="lg">
          <Heading size="md" color="red.500" mb={4}>
            Istoricul Comenzilor
          </Heading>
          {orders.length === 0 ? (
            <Text color="gray.500">Nu ai nicio comandă în istoric.</Text>
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {displayedOrders.map((order) => (
                  <Box
                    key={order._id}
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    boxShadow="sm"
                    position="relative"
                    transition="all 0.3s ease"
                    _hover={{ transform: "translateY(-5px)", boxShadow: "md" }}
                  >
                    <Text fontWeight="bold" color="red.500">
                      Comanda #{order._id.slice(-6)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Data: {new Date(order.createdAt).toLocaleString()}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Total: {order.total} RON
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Status:{" "}
                      <Text
                        as="span"
                        color={
                          order.status === "pending"
                            ? "orange.500"
                            : order.status === "delivered"
                            ? "green.500"
                            : "red.500"
                        }
                      >
                        {order.status}
                      </Text>
                    </Text>
                    <Text fontSize="sm" color="gray.600" mt={2}>
                      Produse:
                    </Text>
                    <VStack align="start" spacing={1} mt={1}>
                      {order.items.map((item, index) => (
                        <Text key={index} fontSize="sm">
                          - {item.name} x{item.quantity} ({item.price} RON)
                        </Text>
                      ))}
                    </VStack>
                    {order.voucherId && (
                      <Text fontSize="sm" color="green.500" mt={2}>
                        Voucher aplicat: {order.voucherId.description}
                      </Text>
                    )}
                  </Box>
                ))}
              </SimpleGrid>
              {/* Buton "Încarcă mai multe" */}
              {displayedOrders.length < orders.length && (
                <Flex justify="center" mt={6}>
                  <Button
                    colorScheme="red"
                    onClick={loadMoreOrders}
                    _hover={{ bg: "red.600", transform: "scale(1.05)" }}
                  >
                    Încarcă mai multe
                  </Button>
                </Flex>
              )}
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;