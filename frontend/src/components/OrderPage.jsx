import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  useToast,
  Radio,
  RadioGroup,
  Stack,
  Input,
  Collapse,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Icon,
} from "@chakra-ui/react";
import { FaCreditCard, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = "http://localhost:5555";

const OrderPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const token = localStorage.getItem("token");
  const [selectedVoucher, setSelectedVoucher] = useState(
    JSON.parse(localStorage.getItem("selectedVoucher")) || null
  );

  // State for form fields
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  // State for card details
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    if (!token) {
      console.log("Token lipsă la încărcarea OrderPage. Redirecționare către login.");
      toast({
        title: "Eroare",
        description: "Trebuie să fii logat pentru a plasa o comandă.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate("/login", { state: { from: "/order" } });
    }
  }, [token, navigate, toast]);

  // Function to format card number (add spaces every 4 digits)
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, ""); // Remove non-digits
    const match = cleaned.match(/.{1,4}/g); // Split into groups of 4
    return match ? match.join(" ") : cleaned;
  };

  // Handle card number input change
  const handleCardNumberChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (rawValue.length <= 16) {
      setCardNumber(formatCardNumber(rawValue));
    }
  };

  // Function to validate card details
  const validateCardDetails = () => {
    // Remove spaces for validation
    const cleanedCardNumber = cardNumber.replace(/\s/g, "");

    // Check if card number has exactly 16 digits
    if (cleanedCardNumber.length !== 16) {
      toast({
        title: "Eroare",
        description: "Numărul cardului trebuie să aibă exact 16 cifre.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    // Check if card number contains only zeros
    const isCardNumberValid = !/^0+$/.test(cleanedCardNumber);
    if (!isCardNumberValid) {
      toast({
        title: "Eroare",
        description: "Numărul cardului nu poate conține doar zerouri.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    // Validate expiry date (format: MM/YY)
    const [month, year] = expiryDate.split("/").map((val) => parseInt(val, 10));
    if (!month || !year || month < 1 || month > 12) {
      toast({
        title: "Eroare",
        description: "Data de expirare este invalidă. Folosește formatul MM/YY.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    // Check if the card is expired
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Last two digits of the year
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-based in JS
    const isExpired =
      year < currentYear || (year === currentYear && month < currentMonth);
    if (isExpired) {
      toast({
        title: "Eroare",
        description: "Cardul este expirat.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  // Function for geocoding with Nominatim
  const geocodeWithNominatim = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json&limit=1`;

    try {
      const response = await axios.get(url, {
        headers: { "User-Agent": "CasaGrossoApp/1.0 (contact@example.com)" },
      });
      const data = response.data;
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
      return null;
    } catch (error) {
      console.error("Eroare la geocodare cu Nominatim:", error.message);
      return null;
    }
  };

  // Function to calculate delivery time using Haversine formula
  const calculateDeliveryTime = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    const averageSpeed = 30; // Average speed in km/h
    const travelTimeHours = distance / averageSpeed; // Time in hours
    const travelTimeMinutes = Math.round(travelTimeHours * 60); // Time in minutes
    const totalTimeMinutes = travelTimeMinutes + 15; // Add 15-minute buffer for preparation

    return totalTimeMinutes;
  };

  // Function to estimate delivery time
  const estimateDeliveryTime = async (restaurantAddress, clientAddress) => {
    const restaurantCoords = await geocodeWithNominatim(restaurantAddress);
    const clientCoords = await geocodeWithNominatim(clientAddress);

    if (restaurantCoords && clientCoords) {
      const timeInMinutes = calculateDeliveryTime(
        restaurantCoords.lat,
        restaurantCoords.lon,
        clientCoords.lat,
        clientCoords.lon
      );
      return `${timeInMinutes} minute`;
    }
    return null;
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    if (selectedVoucher) {
      if (selectedVoucher.valueType === "fixed") {
        if (
          selectedVoucher.applicableCategories &&
          selectedVoucher.applicableCategories.length > 0
        ) {
          const applicableSubtotal = cart
            .filter((item) =>
              selectedVoucher.applicableCategories.includes(item.category)
            )
            .reduce((total, item) => total + item.price * item.quantity, 0);
          const discount = Math.min(selectedVoucher.value, applicableSubtotal);
          return Math.max(0, subtotal - discount).toFixed(2);
        }
        return Math.max(0, subtotal - selectedVoucher.value).toFixed(2);
      } else if (selectedVoucher.valueType === "percentage") {
        if (
          selectedVoucher.applicableCategories &&
          selectedVoucher.applicableCategories.length > 0
        ) {
          const applicableSubtotal = cart
            .filter((item) =>
              selectedVoucher.applicableCategories.includes(item.category)
            )
            .reduce((total, item) => total + item.price * item.quantity, 0);
          const discount = (applicableSubtotal * selectedVoucher.value) / 100;
          return Math.max(0, subtotal - discount).toFixed(2);
        }
        const discount = (subtotal * selectedVoucher.value) / 100;
        return Math.max(0, subtotal - discount).toFixed(2);
      }
    }

    return subtotal.toFixed(2);
  };

  const handlePlaceOrder = async () => {
    console.log("Token trimis către backend:", token);
    if (!token) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii logat pentru a plasa o comandă.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate("/login", { state: { from: "/order" } });
      return;
    }

    if (!address) {
      toast({
        title: "Eroare",
        description: "Adresa este obligatorie.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validate card details if payment method is "card"
    if (paymentMethod === "card") {
      const isCardValid = validateCardDetails();
      if (!isCardValid) {
        return;
      }
    }

    console.log("Cart trimis către backend:", cart);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/orders`,
        {
          items: cart.map((item) => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            toppings: item.toppings || [],
            category: item.category || "necunoscut",
          })),
          total: parseFloat(getCartTotal()),
          address: address,
          paymentMethod: paymentMethod,
          notes: notes,
          voucherId: selectedVoucher ? selectedVoucher._id : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Răspuns de la backend:", response.data);
      if (response.status === 201) {
        const restaurantAddress = "Bulevardul George Cosbuc 40, Bucuresti,Romania";
        const deliveryTime = await estimateDeliveryTime(restaurantAddress, address);

        toast({
          title: "Succes",
          description: "Comanda a fost plasată cu succes!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        if (deliveryTime) {
          toast({
            title: "Timp estimat de livrare",
            description: `Comanda ta va ajunge în aproximativ ${deliveryTime}.`,
            status: "info",
            duration: null,
            isClosable: true,
          });
        } else {
          toast({
            title: "Atenție",
            description: "Nu am putut calcula timpul de livrare. Te vom contacta pentru detalii.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }

        localStorage.removeItem("cart");
        localStorage.removeItem("selectedToppings");
        localStorage.removeItem("selectedVoucher");
        navigate("/main");
      } else {
        throw new Error("Răspuns neașteptat de la server");
      }
    } catch (error) {
      console.error("Eroare la plasarea comenzii:", error.response?.data || error.message);
      toast({
        title: "Eroare",
        description:
          error.response?.data?.message ||
          "Nu am putut plasa comanda. Verifică consola pentru detalii.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} maxW="800px" mx="auto">
      <Heading mb={6} color="red.500">
        Detalii comandă
      </Heading>
      {cart.length === 0 ? (
        <Text>Coșul tău este gol.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {cart.map((item) => (
            <Box key={item._id} p={4} borderWidth="1px" borderRadius="md" bg="white">
              <Flex justify="space-between">
                <Text fontWeight="bold">{item.name} x{item.quantity}</Text>
                <Text>{(item.price * item.quantity).toFixed(2)} RON</Text>
              </Flex>
              {item.toppings && item.toppings.length > 0 && (
                <Text fontSize="sm" color="gray.600">
                  Toppinguri: {item.toppings.join(", ")}
                </Text>
              )}
            </Box>
          ))}
          <Box mt={4} p={4} borderTop="1px" pt={2}>
            <Text fontWeight="bold">
              Subtotal: {cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)} RON
            </Text>
            {selectedVoucher && (
              <Text color="green.500" mt={2}>
                Voucher aplicat: {selectedVoucher.description} (
                {selectedVoucher.valueType === "fixed"
                  ? `${selectedVoucher.value} RON`
                  : `${selectedVoucher.value}%`}{" "}
                reducere)
              </Text>
            )}
            <Text fontWeight="bold" mt={2}>
              Total: {getCartTotal()} RON
            </Text>
          </Box>

          {/* Form for order details */}
          <VStack spacing={4} mt={4} align="stretch">
            <Input
              placeholder="Adresa de livrare"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              isRequired
              bg="white"
              focusBorderColor="red.500"
              borderRadius="md"
              _hover={{ borderColor: "red.300" }}
            />
            <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
              <Stack direction="row">
                <Radio value="cash" colorScheme="red">
                  Cash
                </Radio>
                <Radio value="card" colorScheme="red">
                  Card
                </Radio>
              </Stack>
            </RadioGroup>

            {/* Card Details Form with Smooth Animation */}
            <Collapse in={paymentMethod === "card"} animateOpacity>
              <Box
                p={4}
                bg="white"
                borderRadius="lg"
                boxShadow="md"
                border="1px solid"
                borderColor="gray.200"
                mt={2}
              >
                <Text fontWeight="bold" mb={4} color="red.500">
                  Detalii Card
                </Text>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">
                      Număr Card
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaCreditCard} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19} // 16 digits + 3 spaces
                        bg="gray.50"
                        focusBorderColor="red.500"
                        borderRadius="md"
                        _hover={{ borderColor: "red.300" }}
                      />
                    </InputGroup>
                  </FormControl>
                  <Flex w="100%" gap={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">
                        Data Expirare (MM/YY)
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaCalendarAlt} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          maxLength={5}
                          bg="gray.50"
                          focusBorderColor="red.500"
                          borderRadius="md"
                          _hover={{ borderColor: "red.300" }}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">
                        CVV
                      </FormLabel>
                      <Input
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={3}
                        bg="gray.50"
                        focusBorderColor="red.500"
                        borderRadius="md"
                        _hover={{ borderColor: "red.300" }}
                      />
                    </FormControl>
                  </Flex>
                </VStack>
              </Box>
            </Collapse>

            <Input
              placeholder="Observații (opțional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              bg="white"
              focusBorderColor="red.500"
              borderRadius="md"
              _hover={{ borderColor: "red.300" }}
            />
            <Button
              colorScheme="red"
              mt={4}
              onClick={handlePlaceOrder}
              _hover={{ transform: "scale(1.02)", boxShadow: "lg" }}
              transition="all 0.2s ease-in-out"
            >
              Plasează comanda
            </Button>
          </VStack>
        </VStack>
      )}
    </Box>
  );
};

export default OrderPage;