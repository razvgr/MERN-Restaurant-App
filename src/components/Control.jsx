import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Select,
  useToast,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Card,
  CardBody,
  Badge,
  Avatar,
  Tooltip,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { FaTrash, FaArrowLeft, FaSearch, FaUserAlt, FaUserTie, FaShoppingBag } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5555";

const Control = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQueryUsers, setSearchQueryUsers] = useState("");
  const [orderFilter, setOrderFilter] = useState("pending");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!token) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii logat pentru a accesa această pagină.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      navigate("/login", { state: { from: "/control" } });
    } else {
      axios
        .get(`${API_BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data.role !== "admin") {
            toast({
              title: "Acces interzis",
              description: "Doar administratorii pot accesa această pagină.",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "top",
            });
            navigate("/main");
          } else {
            fetchUsers();
            fetchOrders();
          }
        })
        .catch((error) => {
          console.error("Eroare la verificarea utilizatorului:", error);
          toast({
            title: "Eroare",
            description: "Nu am putut verifica rolul utilizatorului.",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          navigate("/login");
        });
    }
  }, [token, navigate, toast]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredUsers = response.data.filter((user) => user.role !== "admin");
      setUsers(filteredUsers);
      setFilteredUsers(filteredUsers);
    } catch (error) {
      console.error("Eroare la preluarea utilizatorilor:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut prelua lista de utilizatori.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
      setFilteredOrders(response.data.filter((order) => order.status === "pending"));
    } catch (error) {
      console.error("Eroare la preluarea comenzilor:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut prelua lista de comenzi.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  useEffect(() => {
    if (searchQueryUsers.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(searchQueryUsers.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQueryUsers, users]);

  useEffect(() => {
    setFilteredOrders(orders.filter((order) => order.status === orderFilter));
  }, [orderFilter, orders]);

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Succes",
        description: "Utilizatorul a fost șters cu succes!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      fetchUsers();
    } catch (error) {
      console.error("Eroare la ștergerea utilizatorului:", error.response?.data || error.message);
      toast({
        title: "Eroare",
        description: error.response?.data?.message || "Nu am putut șterge utilizatorul.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const openDeleteModal = (userId) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      handleDeleteUser(userToDelete);
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await axios.put(
        `${API_BASE_URL}/users/${userId}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: "Succes",
        description: "Rolul utilizatorului a fost actualizat cu succes!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      fetchUsers();
    } catch (error) {
      console.error("Eroare la actualizarea rolului:", error.response?.data || error.message);
      toast({
        title: "Eroare",
        description: error.response?.data?.message || "Nu am putut actualiza rolul utilizatorului.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const getAvatarColor = (username) => {
    const colors = ["red", "blue", "green", "purple", "teal", "orange", "cyan", "pink"];
    const index = username.charCodeAt(0) % colors.length;
    return `${colors[index]}.500`;
  };

  return (
    <Box
      minH="100vh"
      background="url('/background_wood.jpg') center/cover no-repeat fixed" // Added backgroundAttachment: fixed
      py={4}
      position="relative"
      overflow="auto" // Ensure the Box handles overflow correctly
    >
      <Link to="/main">
        <IconButton
          aria-label="Back to main"
          icon={<FaArrowLeft />}
          position="fixed"
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

      <Center mb={8}>
        <Box
          bg="red.500"
          opacity="0.9"
          borderRadius="xl"
          boxShadow="xl"
          px={8}
          py={4}
          textAlign="center"
          transition="all 0.3s ease"
          _hover={{
            transform: "translateY(-5px)",
            boxShadow: "2xl",
          }}
        >
          <Heading color="white" fontSize={{ base: "xl", md: "2xl" }}>
            Panou Control ⚙️
          </Heading>
        </Box>
      </Center>

      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <Box 
          bg="white" 
          borderRadius="xl" 
          boxShadow="xl" 
          overflow="hidden"
          minH="calc(100vh - 200px)" // Ensure the content area has a minimum height
        >
          <Tabs variant="soft-rounded" colorScheme="red" onChange={(index) => setActiveTab(index)}>
            <Box px={6} py={5} bg="gray.50" borderBottom="1px" borderColor="gray.200">
              <Flex 
                direction={{ base: "column", md: "row" }} 
                justify="space-between"
                align={{ base: "stretch", md: "center" }}
                gap={4}
              >
                <TabList>
                  <Tab
                    borderRadius="full"
                    px={6}
                    py={2}
                    fontWeight="bold"
                    _hover={{ bg: "red.100" }}
                    _selected={{ bg: "red.500", color: "white" }}
                  >
                    Utilizatori
                  </Tab>
                  <Tab
                    borderRadius="full"
                    px={6}
                    py={2}
                    fontWeight="bold"
                    _hover={{ bg: "red.100" }}
                    _selected={{ bg: "red.500", color: "white" }}
                  >
                    Comenzi
                  </Tab>
                </TabList>

                {activeTab === 0 ? (
                  <InputGroup maxW={{ base: "full", md: "320px" }}>
                    <InputLeftElement pointerEvents="none">
                      <FaSearch color="gray.500" />
                    </InputLeftElement>
                    <Input
                      placeholder="Caută utilizatori..."
                      value={searchQueryUsers}
                      onChange={(e) => setSearchQueryUsers(e.target.value)}
                      focusBorderColor="red.500"
                      borderRadius="full"
                      bg="white"
                      boxShadow="sm"
                      _hover={{ boxShadow: "md" }}
                      _focus={{ boxShadow: "outline" }}
                    />
                  </InputGroup>
                ) : (
                  <Flex gap={3}>
                    <Button
                      colorScheme="yellow"
                      variant={orderFilter === "pending" ? "solid" : "outline"}
                      borderRadius="full"
                      px={6}
                      onClick={() => setOrderFilter("pending")}
                      _hover={{ transform: "scale(1.05)" }}
                      transition="all 0.2s ease-in-out"
                    >
                      Pending
                    </Button>
                    <Button
                      colorScheme="green"
                      variant={orderFilter === "delivered" ? "solid" : "outline"}
                      borderRadius="full"
                      px={6}
                      onClick={() => setOrderFilter("delivered")}
                      _hover={{ transform: "scale(1.05)" }}
                      transition="all 0.2s ease-in-out"
                    >
                      Delivered
                    </Button>
                  </Flex>
                )}
              </Flex>
            </Box>

            <TabPanels>
              <TabPanel p={6}>
                {filteredUsers.length === 0 ? (
                  <Center py={10}>
                    <Text color="gray.500" fontSize="lg">
                      {searchQueryUsers
                        ? "Niciun utilizator găsit pentru această căutare."
                        : "Nu există utilizatori de afișat."}
                    </Text>
                  </Center>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {filteredUsers.map((user) => (
                      <Card
                        key={user._id}
                        borderRadius="lg"
                        overflow="hidden"
                        boxShadow="md"
                        transition="all 0.3s ease"
                        _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
                        bg="white"
                      >
                        <CardBody p={0}>
                          <Box p={4} bg={user.role === "client" ? "red.50" : "blue.50"} borderBottom="1px" borderColor="gray.200">
                            <Flex align="center" gap={3}>
                              <Avatar
                                size="md"
                                name={user.username}
                                bg={getAvatarColor(user.username)}
                                icon={user.role === "client" ? <FaUserAlt /> : <FaUserTie />}
                              />
                              <Box>
                                <Flex align="center" gap={2}>
                                  <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                    {user.username}
                                  </Text>
                                  <Badge
                                    colorScheme={user.role === "client" ? "red" : "blue"}
                                    borderRadius="full"
                                    px={2}
                                    py={0.5}
                                  >
                                    {user.role}
                                  </Badge>
                                </Flex>
                                <Text fontSize="xs" color="gray.500">
                                  Last Login: {new Date(user.createdAt).toLocaleString()}
                                </Text>
                              </Box>
                            </Flex>
                          </Box>
                          <Flex p={4} align="center" gap={2}>
                            <Select
                              size="sm"
                              value={user.role}
                              onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                              focusBorderColor="red.500"
                              borderRadius="md"
                              flex="1"
                            >
                              <option value="client">Client</option>
                              <option value="curier">Curier</option>
                            </Select>
                            <Tooltip hasArrow label="Șterge utilizator" placement="top">
                              <IconButton
                                aria-label="Delete user"
                                icon={<FaTrash />}
                                colorScheme="red"
                                variant="outline"
                                size="sm"
                                borderRadius="full"
                                onClick={() => openDeleteModal(user._id)}
                                _hover={{ bg: "red.50" }}
                              />
                            </Tooltip>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>

              <TabPanel p={6}>
                {filteredOrders.length === 0 ? (
                  <Center py={10}>
                    <Text color="gray.500" fontSize="lg">
                      Nu există comenzi {orderFilter === "pending" ? "în așteptare" : "livrate"} de afișat.
                    </Text>
                  </Center>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {filteredOrders.map((order) => (
                      <Card
                        key={order._id}
                        borderRadius="lg"
                        overflow="hidden"
                        boxShadow="md"
                        transition="all 0.3s ease"
                        _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
                        bg="white"
                      >
                        <CardBody p={0}>
                          <Box p={4} bg="green.50" borderBottom="1px" borderColor="gray.200">
                            <Flex align="center" gap={3}>
                              <Avatar
                                size="md"
                                bg="green.500"
                                icon={<FaShoppingBag />}
                                showBorder={false}
                              />
                              <Box>
                                <Flex align="center" gap={2}>
                                  <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                    Comanda #{order._id.slice(-6)}
                                  </Text>
                                  <Badge
                                    colorScheme="green"
                                    borderRadius="full"
                                    px={2}
                                    py={0.5}
                                  >
                                    {order.paymentMethod}
                                  </Badge>
                                </Flex>
                                <Text fontSize="xs" color="gray.500">
                                  Plasată: {new Date(order.createdAt).toLocaleString()}
                                </Text>
                              </Box>
                            </Flex>
                          </Box>
                          <Box p={4}>
                            <VStack align="start" spacing={2}>
                              <Text fontSize="sm" color="gray.600">
                                <strong>Adresă:</strong> {order.address}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                <strong>Total:</strong> {order.total.toFixed(2)} RON
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                <strong>Observații:</strong> {order.notes || "N/A"}
                              </Text>
                              <Divider />
                              <Text fontSize="sm" fontWeight="bold" color="gray.800">
                                Produse:
                              </Text>
                              {order.items.map((item, index) => (
                                <Text key={index} fontSize="xs" color="gray.600">
                                  - {item.name} x{item.quantity} ({(item.price * item.quantity).toFixed(2)} RON)
                                </Text>
                              ))}
                            </VStack>
                          </Box>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} isCentered motionPreset="scale">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" boxShadow="xl" maxW="400px">
          <ModalHeader bg="red.500" color="white" borderTopRadius="xl" py={4}>
            Confirmă ștergerea
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <Text color="gray.700">
              Ești sigur că vrei să ștergi acest utilizator? Această acțiune nu poate fi anulată.
            </Text>
          </ModalBody>
          <ModalFooter bg="gray.50" borderBottomRadius="xl">
            <Button
              colorScheme="red"
              mr={3}
              onClick={confirmDelete}
              borderRadius="full"
              px={6}
              _hover={{ transform: "scale(1.05)" }}
            >
              Șterge
            </Button>
            <Button
              variant="ghost"
              onClick={closeDeleteModal}
              borderRadius="full"
              _hover={{ bg: "gray.100" }}
            >
              Anulează
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Control;