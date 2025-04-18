import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  IconButton,
  VStack,
  SimpleGrid,
  Icon,
  Text,
  Input,
  useToast,
  Grid,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  DrawerFooter,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Radio,
  RadioGroup,
  Stack,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import { FaMapMarkerAlt, FaBars, FaSignInAlt, FaShoppingCart, FaTrash, FaPlus, FaMinus, FaComment } from "react-icons/fa";
import { FaPhone, FaEnvelope, FaUserPlus, FaUser, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageTransition from "./PageTransition";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import TopProductsTable from "./TopProductsTable";

// URL-ul backend-ului
const API_BASE_URL = "http://localhost:5555";

const MainPage = () => {
  const location = useLocation();
  const [visibleSection, setVisibleSection] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCartOpen, onOpen: onCartOpen, onClose: onCartClose } = useDisclosure();
  const { isOpen: isCourierDrawerOpen, onOpen: onCourierDrawerOpen, onClose: onCourierDrawerClose } = useDisclosure(); // Drawer pentru curieri
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClientMode, setIsClientMode] = useState(true);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const navigate = useNavigate();
  const [selectedToppings, setSelectedToppings] = useState(JSON.parse(localStorage.getItem("selectedToppings")) || {});
  const [showToppings, setShowToppings] = useState({});
  const { isOpen: isCrustModalOpen, onOpen: onCrustModalOpen, onClose: onCrustModalClose } = useDisclosure();
  const [selectedCrust, setSelectedCrust] = useState(""); // State pentru tipul de blat selectat
  const [currentProduct, setCurrentProduct] = useState(null); // State pentru produsul curent care se adaugă în coș
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure(); // Pentru chatbox
  const [feedbackMessage, setFeedbackMessage] = useState(""); // Mesajul introdus de client
  const [feedbackList, setFeedbackList] = useState([]);

  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // If the user has scrolled more than 50px from the top, set isScrolled to true
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // State pentru paginare în modalul de feedback
  const [currentPage, setCurrentPage] = useState(1);
  const feedbackPerPage = 5; // Numărul de feedback-uri pe pagină

  // Calculează feedback-urile afișate pe pagina curentă
  const indexOfLastFeedback = currentPage * feedbackPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbackPerPage;
  const currentFeedback = feedbackList.slice(indexOfFirstFeedback, indexOfLastFeedback);

  // Calculează numărul total de pagini
  const totalPages = Math.ceil(feedbackList.length / feedbackPerPage);

  // Funcții pentru navigare între pagini
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

  // Resetăm pagina curentă la 1 când se închide modalul
  useEffect(() => {
    if (!isChatOpen) {
      setCurrentPage(1);
    }
  }, [isChatOpen]);

  // State pentru formularul de curieri
  const [userData, setUserData] = useState({ username: "", password: "", role: "curier" });

  useEffect(() => {
    localStorage.setItem("showToppings", JSON.stringify(showToppings));
  }, [showToppings]);

  const toggleShowToppings = (productId) => {
    setShowToppings((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const [reservationError, setReservationError] = useState("");

  // Funcție pentru validarea datei
  const validateDate = (date) => {
    const selectedDate = new Date(date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Setăm ora la 00:00:00 pentru a compara doar data
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate >= currentDate; // Returnează true dacă data este astăzi sau în viitor
  };

  // State pentru rezervare
  const [reservation, setReservation] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    numberOfPeople: "",
  });

  // State pentru rezervări
  const [reservations, setReservations] = useState([]);

  // Fetch rezervări
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reservations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReservations(response.data);
    } catch (error) {
      console.error("Eroare la preluarea rezervărilor:", error);
    }
  };

  // Ștergere rezervare
  const deleteReservation = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/reservations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(reservations.filter((res) => res._id !== id));
      toast({
        title: "Succes",
        description: "Rezervarea a fost ștearsă cu succes!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Eroare la ștergerea rezervării:`, error);
      toast({
        title: "Eroare",
        description: "Nu am putut șterge rezervarea.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fetch feedback messages (pentru admin)
  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackList(response.data);
    } catch (error) {
      console.error("Eroare la preluarea feedback-urilor:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut prelua feedback-urile.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Trimite feedback (pentru clienți)
  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) {
      toast({
        title: "Eroare",
        description: "Mesajul nu poate fi gol.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/feedback`,
        { message: feedbackMessage },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      toast({
        title: "Succes",
        description: "Feedback-ul a fost trimis cu succes!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFeedbackMessage(""); // Resetează mesajul
      onChatClose(); // Închide chatbox-ul
    } catch (error) {
      console.error("Eroare la trimiterea feedback-ului:", error.response?.data || error.message);
      toast({
        title: "Eroare",
        description: error.response?.data?.message || "A apărut o problemă la trimiterea feedback-ului.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fetch feedback messages when admin opens the chatbox
  useEffect(() => {
    if (isAdmin && isChatOpen) {
      fetchFeedback();
    }
  }, [isAdmin, isChatOpen]);

  const [products, setProducts] = useState({
    pizza: [],
    antreuri: [],
    paste: [],
    burgeri: [],
    salate: [],
    desert: [],
    bauturi: [],
  });

  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchVouchers(); // Adăugăm apelul pentru vouchere
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${API_BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setIsAdmin(response.data.role === "admin");
          setIsClientMode(response.data.role === "client");
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("selectedToppings", JSON.stringify(selectedToppings));
  }, [cart, selectedToppings]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      const fetchedProducts = response.data;
      const updatedProducts = {
        pizza: fetchedProducts.pizza.map((p) => ({ ...p, toppings: p.toppings || [] })) || [],
        antreuri: fetchedProducts.antreuri || [],
        paste: fetchedProducts.paste || [],
        burgeri: fetchedProducts.burgeri || [],
        salate: fetchedProducts.salate || [],
        desert: fetchedProducts.desert || [],
        bauturi: fetchedProducts.bauturi || [],
      };
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Eroare la preluarea produselor:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut prelua produsele.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const addProduct = async (category, name, price, description, imageFile, toppings = []) => {
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("image", imageFile);
      formData.append("toppings", JSON.stringify(toppings));

      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchProducts();
      toast({
        title: "Succes",
        description: "Produsul a fost adăugat cu succes!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Eroare la adăugarea produsului în ${category}:`, error);
      toast({
        title: "Eroare",
        description: "Nu am putut adăuga produsul. Verifică consola pentru detalii.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const deleteProduct = async (category, id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProducts();
      toast({
        title: "Succes",
        description: "Produsul a fost șters cu succes!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Eroare la ștergerea produsului din ${category}:`, error);
      toast({
        title: "Eroare",
        description: "Nu am putut șterge produsul.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fetch vouchere
  const fetchVouchers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vouchers`);
      setVouchers(response.data);
    } catch (error) {
      console.error("Eroare la preluarea voucherelor/ nu esti admin:", error);
    }
  };

  // Adăugare voucher
  const addVoucher = async (description, value, valueType, imageFile, applicableCategories) => {
    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("value", value);
      formData.append("valueType", valueType);
      formData.append("image", imageFile);

      // Logăm applicableCategories primite
      console.log("applicableCategories primite în addVoucher:", applicableCategories);

      // Filtrăm categoriile valide
      const validCategories = applicableCategories?.filter((category) => {
        if (!category || typeof category !== "string" || category.trim() === "") {
          console.log("Categorie invalidă, va fi exclusă:", category);
          return false;
        }
        return true;
      }) || [];

      console.log("Categoriile valide după filtrare:", validCategories);

      // Adăugăm categoriile în FormData
      if (validCategories.length > 0) {
        validCategories.forEach((category) => {
          console.log("Adăugăm categorie în FormData:", category);
          formData.append("applicableCategories[]", category);
        });
      } else {
        console.log("Nu există categorii valide de adăugat în FormData.");
      }

      // Logăm conținutul FormData pentru debugging
      console.log("Conținutul FormData:");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/vouchers`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchVouchers();
      toast({
        title: "Succes",
        description: "Voucherul a fost adăugat cu succes!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Eroare la adăugarea voucherului:", error.response?.data || error.message);
      toast({
        title: "Eroare",
        description: "Nu am putut adăuga voucherul. Verifică consola pentru detalii.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Ștergere voucher
  const deleteVoucher = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/vouchers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchVouchers();
      toast({
        title: "Succes",
        description: "Voucherul a fost șters cu succes!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Eroare la ștergerea voucherului:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut șterge voucherul.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Funcție pentru aplicarea unui voucher
  const applyVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    toast({
      title: "Voucher aplicat",
      description: `Voucherul "${voucher.description}" a fost aplicat! Reducere: ${voucher.valueType === "fixed" ? `${voucher.value} RON` : `${voucher.value}%`
        }`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  // Funcție pentru eliminarea voucherului
  const removeVoucher = () => {
    setSelectedVoucher(null);
    toast({
      title: "Voucher eliminat",
      description: "Voucherul a fost eliminat din coș.",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  // Funcționalitate coș
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1, toppings: item.toppings || [] } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, toppings: [] }];
    });
    toast({
      title: "Adăugat în coș",
      description: `${product.name} a fost adăugat în coș!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const toggleTopping = (productId, topping) => {
    setSelectedToppings((prev) => {
      const currentToppings = prev[productId] || [];
      const updatedToppings = currentToppings.includes(topping)
        ? currentToppings.filter((t) => t !== topping)
        : [...currentToppings, topping];
      return { ...prev, [productId]: updatedToppings };
    });
  };

  const addToCartWithToppings = (product) => {
    // Verificăm dacă produsul este o pizza
    if (product.category === "pizza") {
      setCurrentProduct(product); // Setăm produsul curent
      setSelectedCrust(""); // Resetăm selecția tipului de blat
      onCrustModalOpen(); // Deschidem modalul pentru selecția tipului de blat
    } else {
      // Pentru alte categorii, adăugăm direct în coș fără a cere tipul de blat
      const toppings = selectedToppings[product._id] || [];
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item._id === product._id);
        if (existingItem) {
          return prevCart.map((item) =>
            item._id === product._id
              ? {
                ...item,
                quantity: item.quantity + 1,
                toppings: [...new Set([...(item.toppings || []), ...toppings])],
              }
              : item
          );
        }
        return [...prevCart, { ...product, quantity: 1, toppings }];
      });
      setSelectedToppings((prev) => ({ ...prev, [product._id]: [] }));
      toast({
        title: "Adăugat în coș",
        description: `${product.name} a fost adăugat în coș!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Funcție pentru a confirma selecția tipului de blat și a adăuga în coș
  const confirmCrustSelection = () => {
    if (!selectedCrust) {
      toast({
        title: "Eroare",
        description: "Vă rugăm să selectați un tip de blat!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const toppings = selectedToppings[currentProduct._id] || [];
    const updatedToppings = [...toppings, `Blat ${selectedCrust}`]; // Adăugăm tipul de blat ca topping

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === currentProduct._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === currentProduct._id
            ? {
              ...item,
              quantity: item.quantity + 1,
              toppings: [...new Set([...(item.toppings || []), ...updatedToppings])],
            }
            : item
        );
      }
      return [...prevCart, { ...currentProduct, quantity: 1, toppings: updatedToppings }];
    });

    setSelectedToppings((prev) => ({ ...prev, [currentProduct._id]: [] }));
    toast({
      title: "Adăugat în coș",
      description: `${currentProduct.name} cu blat ${selectedCrust} a fost adăugat în coș!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    onCrustModalClose(); // Închidem modalul
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
    toast({
      title: "Eliminat din coș",
      description: "Produsul a fost eliminat din coș.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const getCartTotal = () => {
    // Calculează totalul inițial al coșului (fără reducere)
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    // Dacă nu există voucher, returnăm totalul inițial
    if (!selectedVoucher) {
      return subtotal.toFixed(2);
    }

    // Calculăm subtotalul doar pentru produsele din categoriile aplicabile
    const applicableSubtotal = cart.reduce((total, item) => {
      // Verificăm dacă voucherul se aplică pentru categoria produsului
      const isApplicable =
        selectedVoucher.applicableCategories.length === 0 || // Se aplică tuturor categoriilor
        selectedVoucher.applicableCategories.includes(item.category.toLowerCase());
      return isApplicable ? total + item.price * item.quantity : total;
    }, 0);

    // Calculăm reducerea doar pe subtotalul aplicabil
    let discountedTotal = subtotal;
    if (selectedVoucher.valueType === "fixed") {
      // Reducere fixă (în lei)
      const discount = Math.min(applicableSubtotal, selectedVoucher.value); // Reducerea nu poate depăși subtotalul aplicabil
      discountedTotal = subtotal - discount;
    } else if (selectedVoucher.valueType === "percentage") {
      // Reducere procentuală (%)
      const discount = (applicableSubtotal * selectedVoucher.value) / 100;
      discountedTotal = subtotal - discount;
    }

    // Asigurăm că totalul nu este negativ
    return Math.max(0, discountedTotal).toFixed(2);
  };

  const handleCheckout = () => {
    onCartClose();
    console.log("Salvăm coșul și redirecționăm:", cart, "Voucher aplicat:", selectedVoucher, "Token actual:", localStorage.getItem("token"));
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("selectedToppings", JSON.stringify(selectedToppings));
    localStorage.setItem("selectedVoucher", JSON.stringify(selectedVoucher)); // Salvează voucherul în localStorage
    navigate("/order");
  };

  const handleSectionClick = (section) => {
    setVisibleSection(visibleSection === section ? null : section);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAdmin(false);
    setIsClientMode(true);
    toast({
      title: "Succes",
      description: "Te-ai delogat cu succes!",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    navigate("/login");
  };

  // Funcție pentru gestionarea rezervării
  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setReservationError(""); // Resetăm mesajul de eroare

    // Verificăm dacă data este validă
    if (!reservation.date) {
      setReservationError("Vă rugăm să selectați o dată pentru rezervare.");
      return;
    }

    if (!validateDate(reservation.date)) {
      setReservationError("Nu puteți face o rezervare pentru o dată din trecut.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/reservations`,
        {
          name: reservation.name,
          phone: reservation.phone,
          date: reservation.date,
          time: reservation.time,
          numberOfPeople: parseInt(reservation.numberOfPeople),
          userId: token ? (await axios.get(`${API_BASE_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })).data.id : null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      toast({
        title: "Succes",
        description: "Rezervarea a fost trimisă cu succes!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setReservation({
        name: "",
        phone: "",
        date: "",
        time: "",
        numberOfPeople: "",
      });
    } catch (error) {
      console.error("Eroare la trimiterea rezervării:", error.response?.data || error.message);
      toast({
        title: "Eroare",
        description: error.response?.data?.message || "A apărut o problemă la trimiterea rezervării.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Funcție pentru înregistrarea unui curier
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/register-user`, // Presupunem că backend-ul are un endpoint comun
        { username: userData.username, password: userData.password, role: userData.role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: "Succes",
        description: `Contul de ${userData.role === "curier" ? "curier" : "admin"} ${userData.username} a fost creat cu succes!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setUserData({ username: "", password: "", role: "curier" }); // Resetăm formularul
      onCourierDrawerClose(); // Închidem pop-up-ul
    } catch (error) {
      console.error("Eroare la înregistrarea utilizatorului:", error.response?.data || error.message);
      toast({
        title: "Eroare",
        description: error.response?.data?.message || "A apărut o problemă la înregistrarea utilizatorului.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const AddProductForm = ({ category }) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [toppings, setToppings] = useState("");

    const handleImageChange = (e) => {
      setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!name || !price || !description || !imageFile) {
        toast({
          title: "Eroare",
          description: "Toate câmpurile, inclusiv imaginea, sunt obligatorii!",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      const toppingArray = toppings.split(",").map((t) => t.trim()).filter((t) => t);
      await addProduct(category, name, Number(price), description, imageFile, toppingArray);
      setName("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      setToppings("");
    };

    return (
      <Box mt={8}>
        <Heading size="md" color="red.500" mb={4}>
          Adaugă un produs nou
        </Heading>
        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <Input
            placeholder="Nume produs"
            size="md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            color="black"
          />
          <Input
            placeholder="Preț (RON)"
            size="md"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            color="black"
          />
          <Input
            placeholder="Descriere"
            size="md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            color="black"
          />
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            size="md"
            color="black"
          />
          <Input
            placeholder="Toppinguri (separate prin virgulă, ex: mozzarella, pepperoni)"
            size="md"
            value={toppings}
            onChange={(e) => setToppings(e.target.value)}
            color="black"
          />
          <Button
            colorScheme="red"
            size="md"
            w="full"
            type="submit"
            _hover={{ bg: "red.500", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)" }}
          >
            Adaugă
          </Button>
        </VStack>
      </Box>
    );
  };

  const AddVoucherForm = ({ onAddVoucher }) => {
    const [description, setDescription] = useState("");
    const [value, setValue] = useState("");
    const [valueType, setValueType] = useState("percentage");
    const [imageFile, setImageFile] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const categories = [
      "pizza",
      "antreuri",
      "paste",
      "burgeri",
      "salate",
      "desert",
      "bauturi",
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!description || !value || !valueType || !imageFile) {
        toast({
          title: "Eroare",
          description: "Toate câmpurile sunt obligatorii!",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      console.log("Categoriile selectate înainte de submit:", selectedCategories); // Log pentru debugging

      await onAddVoucher(description, value, valueType, imageFile, selectedCategories);
      setDescription("");
      setValue("");
      setValueType("percentage");
      setImageFile(null);
      setSelectedCategories([]);
    };

    const handleCategoryChange = (category) => {
      setSelectedCategories((prev) =>
        prev.includes(category)
          ? prev.filter((cat) => cat !== category)
          : [...prev, category]
      );
    };

    return (
      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>Descriere</FormLabel>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descriere voucher"
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Valoare</FormLabel>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Valoare (ex. 10)"
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Tip valoare</FormLabel>
          <Select value={valueType} onChange={(e) => setValueType(e.target.value)}>
            <option value="percentage">Procentual (%)</option>
            <option value="fixed">Fix (lei)</option>
          </Select>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Categorii aplicabile</FormLabel>
          <VStack align="start">
            {categories.map((category) => (
              <Checkbox
                key={category}
                isChecked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Checkbox>
            ))}
          </VStack>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Imagine</FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </FormControl>
        <Button type="submit" colorScheme="teal">
          Adaugă Voucher
        </Button>
      </form>
    );
  };

  // Componenta VoucherList
  const VoucherList = ({ items }) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <Text color="gray.500">Niciun voucher disponibil.</Text>;
    }

    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={6}>
        {items.map((item) => (
          <Box
            key={item._id}
            bg="white"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="lg"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
            position="relative"
            display="flex"
            flexDirection="column"
            minH="400px"
          >
            {item.imageUrl ? (
              <Image
                src={`${API_BASE_URL}${item.imageUrl}`}
                alt={item.description}
                w="100%"
                h={{ base: "200px", md: "250px" }}
                objectFit="cover"
              />
            ) : (
              <Box
                w="100%"
                h={{ base: "200px", md: "250px" }}
                bg="gray.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="gray.500">Imagine indisponibilă</Text>
              </Box>
            )}

            <Box p={4} flex="1" display="flex" flexDirection="column">
              <Text fontSize="md" color="gray.600" flex="1">
                {item.description}
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="red.500">
                {item.valueType === "fixed" ? `${item.value} RON` : `${item.value}%`} reducere
              </Text>
              {/* Afișăm categoriile aplicabile */}
              <Text fontSize="sm" color="gray.500" mt={1}>
                Se aplică pentru:{" "}
                {item.applicableCategories.length === 0
                  ? "Toate categoriile"
                  : item.applicableCategories
                    .map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1))
                    .join(", ")}
              </Text>

              {/* Adaugă butonul "Folosește voucher" pentru clienți */}
              {isClientMode && (
                <Button
                  colorScheme="green"
                  size="sm"
                  mt={2}
                  onClick={() => applyVoucher(item)}
                  isDisabled={selectedVoucher && selectedVoucher._id === item._id} // Dezactivează butonul dacă voucherul este deja aplicat
                >
                  {selectedVoucher && selectedVoucher._id === item._id
                    ? "Voucher aplicat"
                    : "Folosește voucher"}
                </Button>
              )}

              {isAdmin && (
                <IconButton
                  aria-label="Delete voucher"
                  icon={<FaTrash />}
                  colorScheme="red"
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={() => deleteVoucher(item._id)}
                  _hover={{ bg: "red.600" }}
                />
              )}
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    );
  };

  const ProductList = ({ category, items }) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <Text color="gray.500">Niciun produs disponibil în această categorie.</Text>;
    }

    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={6}>
        {items.map((item) => (
          <Box
            key={item._id}
            bg="white"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="lg"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
            position="relative"
            display="flex"
            flexDirection="column"
            minH="400px"
          >
            {item.imageUrl ? (
              <Image
                src={`${API_BASE_URL}${item.imageUrl}`}
                alt={item.name}
                w="100%"
                h={{ base: "200px", md: "250px" }}
                objectFit="cover"
              />
            ) : (
              <Box
                w="100%"
                h={{ base: "200px", md: "250px" }}
                bg="gray.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="gray.500">Imagine indisponibilă</Text>
              </Box>
            )}

            <Box p={4} flex="1" display="flex" flexDirection="column">
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontWeight="bold" fontSize="xl" color="red.500">
                  {item.name}
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="gray.700">
                  {item.price} RON
                </Text>
              </Flex>
              <Text fontSize="md" color="gray.600" flex="1">
                {item.description}
              </Text>

              {isClientMode && (
                <Box mt="auto" pt={4}>
                  <Flex justify="space-between" align="center">
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => addToCartWithToppings(item)}
                    >
                      Adaugă în coș
                    </Button>
                    {["pizza", "burgeri", "paste"].includes(category.toLowerCase()) && (
                      <IconButton
                        aria-label="Adaugă toppinguri"
                        icon={<FaPlus />}
                        colorScheme="green"
                        size="sm"
                        onClick={() => toggleShowToppings(item._id)}
                        _hover={{ bg: "green.600" }}
                      />
                    )}
                  </Flex>
                  {showToppings[item._id] && (
                    <Box mt={2}>
                      <Text fontSize="sm" color="gray.600">Alege toppinguri:</Text>
                      {item.toppings && item.toppings.length > 0 ? (
                        item.toppings.map((topping) => (
                          <Flex key={topping} align="center" mt={1}>
                            <Checkbox
                              isChecked={selectedToppings[item._id]?.includes(topping)}
                              onChange={() => toggleTopping(item._id, topping)}
                              colorScheme="green"
                            >
                              {topping}
                            </Checkbox>
                          </Flex>
                        ))
                      ) : (
                        <Text color="gray.500">Fără toppinguri disponibile.</Text>
                      )}
                      <Button
                        mt={2}
                        size="sm"
                        variant="outline"
                        borderColor="rgba(0, 0, 0, 0.5)"
                        color="black"
                        bg="transparent"
                        _hover={{
                          borderColor: "rgba(0, 0, 0, 0.8)",
                          bg: "rgba(0, 0, 0, 0.05)",
                        }}
                        onClick={() => toggleShowToppings(item._id)}
                      >
                        Închide
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {isAdmin && (
                <IconButton
                  aria-label="Delete product"
                  icon={<FaTrash />}
                  colorScheme="red"
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={() => deleteProduct(category, item._id)}
                  _hover={{ bg: "red.600" }}
                />
              )}
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    );
  };

  const DefaultCards = () => {
    const defaultItems = [
      {
        id: 1,
        title: "Noua Pizza Fior di Latte",
        description: "Descoperă noua noastră pizza cu Mozzarella Fior di Latte!",
        imageUrl: "https://media.istockphoto.com/id/1493116898/photo/italian-pizza-napoletana-in-messy-kitchen-with-cooking-ingredients.jpg?s=612x612&w=0&k=20&c=fBm5t2ECIv8AjO6I_d-l51Y6xalwRrhqqREz7e2rs-o=",
      },
      {
        id: 2,
        title: "Oferta Săptamânii",
        description: "Orice pizza medie doar 29 lei!",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSREN6E-NPqD6S8-9hP9KLfYdik9ZFb0wgZIw&s",
      },
      {
        id: 3,
        title: "Paștele a la Grosso",
        description: "De Paște treci pe la noi împreuna cu cei dragi, alături de cei mici!",
        imageUrl: "data:image/jpeg;base64,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",
      },
    ];

    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={6}>
        {defaultItems.map((item) => (
          <Box
            key={item.id}
            bg="white"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="lg"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
            display="flex"
            flexDirection="column"
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                w="100%"
                h={{ base: "200px", md: "250px" }}
                objectFit="cover"
              />
            ) : (
              <Box
                w="100%"
                h={{ base: "200px", md: "250px" }}
                bg="gray.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="gray.500">Imagine indisponibilă</Text>
              </Box>
            )}
            <Box p={4} flex="1" display="flex" flexDirection="column">
              <Text fontWeight="bold" fontSize="xl" color="red.500" mb={2}>
                {item.title}
              </Text>
              <Text fontSize="md" color="gray.600" noOfLines={3}>
                {item.description}
              </Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    );
  };

  return (
    <PageTransition>
      <Box
        minH="100vh"
        overflowX="hidden"
        // Setăm fundalul condițional
        background={
          "url('/wood_table_main.jpg') center/cover no-repeat"
        }
      >
        <Flex
          as="nav"
          bg={isHovered ? "white" : "transparent"}
          px={6}
          py={4}
          align="center"
          boxShadow={isHovered ? "sm" : "none"}
          maxW="100%"
          w="100%"
          position="fixed"
          top={0}
          zIndex={10}
          justifyContent="space-between"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          transition="background-color 0.3s ease-in-out, opacity 0.3s ease-in-out"
        >
          {/* Logo */}
          <Link to="/">
            <Image
              src="/restaurant_logo1.png"
              alt="Logo"
              h={{ base: "60px", md: "110px" }}
              opacity={isScrolled && !isHovered ? 0 : 1} // Transparent when scrolled and not hovered
              transition="opacity 0.3s ease-in-out"
            />
          </Link>
          {/* Hamburger Menu for Mobile */}
          <IconButton
            aria-label="Open menu"
            icon={<FaBars />}
            display={{ base: "block", md: "none" }}
            onClick={onOpen}
            colorScheme="red"
            size="lg"
            fontSize="24px"
            p={3}
            d="flex"
            justifyContent="center"
            alignItems="center"
            opacity={isScrolled && !isHovered ? 0 : 1} // Transparent when scrolled and not hovered
            transition="opacity 0.3s ease-in-out"
          />

          {/* Navigation Links */}
          <HStack
            spacing={6}
            mx="auto"
            justify="center"
            flexShrink={0}
            display={{ base: "none", md: "flex" }}
            opacity={isScrolled && !isHovered ? 0 : 1} // Transparent when scrolled and not hovered
            transition="opacity 0.3s ease-in-out"
          >
            {[
              { name: "RESTAURANT", section: "restaurante" },
              { name: "OFERTE", section: "oferte" },
              { name: "PIZZA", section: "pizza" },
              { name: "ANTREURI", section: "antreuri" },
              { name: "PASTE", section: "paste" },
              { name: "BURGERI", section: "burgeri" },
              { name: "SALATE", section: "salate" },
              { name: "DESERT", section: "desert" },
              { name: "BĂUTURI", section: "bauturi" },
            ].map((item) => (
              <Button
                key={item.section}
                fontSize={{ base: isHovered ? "sm" : "md", md: isHovered ? "md" : "lg" }}
                fontWeight="bold"
                colorScheme="red"
                color={isHovered ? "black" : "white"}
                variant={visibleSection === item.section ? "solid" : "ghost"}
                onClick={() => handleSectionClick(item.section)}
                _hover={{
                  bg: visibleSection === item.section ? "red.600" : "red.500",
                  color: "white",
                  transform: "scale(1.05)",
                }}
                _active={{ bg: "red.600", transform: "scale(1)" }}
                _focus={{ boxShadow: "0 0 2px 2px rgba(255, 0, 0, 0.5)" }}
                transition="color 0.3s, font-size 0.3s, transform 0.2s ease-in-out"
              >
                {item.name}
              </Button>
            ))}
          </HStack>

          {/* Right Side Buttons */}
          <HStack
            spacing={4}
            justify="flex-end"
            flexShrink={0}
            display={{ base: "flex", md: "flex" }}
            opacity={isScrolled && !isHovered ? 0 : 1} // Transparent when scrolled and not hovered
            transition="opacity 0.3s ease-in-out"
          >
            {isClientMode && localStorage.getItem("token") && (
              <Link to="/dashboard">
                <IconButton
                  bg="white"
                  color="black"
                  _hover={{
                    bg: "blue.600",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                    color: "white",
                  }}
                  transition="0.2s ease-in-out"
                  size="md"
                  minW="40px"
                  h="40px"
                  p={0}
                  icon={<FaUser />}
                />
              </Link>
            )}
            {isClientMode && (
              <IconButton
                bg="white"
                color="black"
                _hover={{
                  bg: "red.600",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                  color: "white",
                }}
                transition="0.2s ease-in-out"
                size="md"
                minW="40px"
                h="40px"
                p={0}
                icon={<FaShoppingCart />}
                onClick={onCartOpen}
              />
            )}
            {localStorage.getItem("token") && isAdmin && (
              <IconButton
                aria-label="Adaugă curieri"
                icon={<FaUserPlus />}
                bg="white"
                color="black"
                _hover={{
                  bg: "green.600",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                  color: "white",
                }}
                transition="0.2s ease-in-out"
                size="md"
                minW="40px"
                h="40px"
                p={0}
                onClick={onCourierDrawerOpen}
              />
            )}
            {localStorage.getItem("token") && isAdmin && (
              <Link to="/control">
                <IconButton
                  aria-label="Control utilizatori"
                  icon={<IoSettingsSharp />}
                  bg="white"
                  color="black"
                  _hover={{
                    bg: "red.500",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                    color: "white",
                  }}
                  transition="0.2s ease-in-out"
                  size="md"
                  minW="40px"
                  h="40px"
                  p={0}
                />
              </Link>
            )}
            {localStorage.getItem("token") ? (
              <Button
                fontSize={{ base: "sm", md: "md" }}
                color="white"
                fontWeight="bold"
                textAlign="center"
                transition="0.2s ease-in-out"
                bg="red"
                _hover={{
                  bg: "red.500",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                }}
                onClick={handleLogout}
              >
                Delogare
              </Button>
            ) : (
              <Link to="/login">
                <IconButton
                  bg="white"
                  color="black"
                  _hover={{
                    bg: "red.600",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                    color: "white",
                  }}
                  transition="0.2s ease-in-out"
                  size="md"
                  minW="40px"
                  h="40px"
                  p={0}
                >
                  <LockIcon />
                </IconButton>
              </Link>
            )}
          </HStack>
        </Flex>
        <Box h={{ base: "68px", md: "108px" }} />

        <Drawer isOpen={isCartOpen} placement="right" onClose={onCartClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Coșul meu</DrawerHeader>
            <DrawerBody>
              {cart.length === 0 ? (
                <Text color="gray.500">Coșul tău este gol.</Text>
              ) : (
                <VStack spacing={4}>
                  {cart.map((item) => (
                    <Flex
                      key={item._id}
                      w="full"
                      p={2}
                      bg="gray.100"
                      borderRadius="md"
                      align="center"
                      justify="space-between"
                    >
                      <Box>
                        <Text fontWeight="bold">{item.name}</Text>
                        <Text color="gray.600">{(item.price * item.quantity).toFixed(2)} RON</Text>
                        {item.toppings && item.toppings.length > 0 && (
                          <Text fontSize="sm" color="gray.600">
                            Toppinguri: {item.toppings.join(", ")}
                          </Text>
                        )}
                        <HStack>
                          <IconButton
                            size="xs"
                            icon={<FaMinus />}
                            onClick={() => updateQuantity(item._id, -1)}
                          />
                          <Text>{item.quantity}</Text>
                          <IconButton
                            size="xs"
                            icon={<FaPlus />}
                            onClick={() => updateQuantity(item._id, 1)}
                          />
                        </HStack>
                      </Box>
                      <IconButton
                        size="sm"
                        colorScheme="red"
                        icon={<FaTrash />}
                        onClick={() => removeFromCart(item._id)}
                      />
                    </Flex>
                  ))}
                  <Box w="full" borderTop="1px" pt={2}>
                    {/* Afișează subtotalul (fără reducere) */}
                    <Text fontWeight="bold">
                      Subtotal: {cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)} RON
                    </Text>
                    {/* Afișează reducerea aplicată, dacă există */}
                    {selectedVoucher && (
                      <Box mt={2}>
                        <Text color="green.500">
                          Voucher aplicat: {selectedVoucher.description} (
                          {selectedVoucher.valueType === "fixed"
                            ? `${selectedVoucher.value} RON`
                            : `${selectedVoucher.value}%`}{" "}
                          reducere)
                        </Text>
                        {/* Afișăm subtotalul aplicabil pentru voucher */}
                        {selectedVoucher.applicableCategories.length > 0 && (
                          <Text fontSize="sm" color="gray.600">
                            Se aplică pentru:{" "}
                            {selectedVoucher.applicableCategories
                              .map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1))
                              .join(", ")}
                          </Text>
                        )}
                        {/* Calculăm și afișăm reducerea efectivă */}
                        {(() => {
                          const applicableSubtotal = cart.reduce((total, item) => {
                            const isApplicable =
                              selectedVoucher.applicableCategories.length === 0 ||
                              selectedVoucher.applicableCategories.includes(item.category.toLowerCase());
                            return isApplicable ? total + item.price * item.quantity : total;
                          }, 0);
                          let discount = 0;
                          if (selectedVoucher.valueType === "fixed") {
                            discount = Math.min(applicableSubtotal, selectedVoucher.value);
                          } else if (selectedVoucher.valueType === "percentage") {
                            discount = (applicableSubtotal * selectedVoucher.value) / 100;
                          }
                          return discount > 0 ? (
                            <Text fontSize="sm" color="green.500">
                              Reducere aplicată: {discount.toFixed(2)} RON
                            </Text>
                          ) : null;
                        })()}
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          mt={1}
                          onClick={removeVoucher}
                        >
                          Elimină voucher
                        </Button>
                      </Box>
                    )}
                    {/* Afișează totalul final (cu reducere) */}
                    <Text fontWeight="bold" mt={2}>
                      Total: {getCartTotal()} RON
                    </Text>
                  </Box>
                </VStack>
              )}
            </DrawerBody>
            <DrawerFooter>
              <Button
                colorScheme="red"
                w="full"
                onClick={handleCheckout}
                isDisabled={cart.length === 0}
              >
                Comandă
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Meniu</DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align="start">
                {[
                  { name: "RESTAURANT", section: "restaurante" },
                  { name: "OFERTE", section: "oferte" },
                  { name: "PIZZA", section: "pizza" },
                  { name: "ANTREURI", section: "antreuri" },
                  { name: "PASTE", section: "paste" },
                  { name: "BURGERI", section: "burgeri" },
                  { name: "SALATE", section: "salate" },
                  { name: "DESERT", section: "desert" },
                  { name: "BĂUTURI", section: "bauturi" },
                ].map((item) => (
                  <Button
                    key={item.section}
                    fontSize="md"
                    fontWeight="bold"
                    colorScheme="red"
                    variant={visibleSection === item.section ? "solid" : "ghost"}
                    onClick={() => handleSectionClick(item.section)}
                    w="full"
                    _hover={{
                      bg: visibleSection === item.section ? "red.600" : "red.500",
                      color: "white",
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Drawer pentru înregistrarea curierilor */}
        <Drawer isOpen={isCourierDrawerOpen} placement="right" onClose={onCourierDrawerClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Înregistrare utilizator</DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} as="form" onSubmit={handleRegisterUser}>
                <Input
                  placeholder="Nume utilizator"
                  value={userData.username}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  color="black"
                  required
                  focusBorderColor="red.500"
                  borderRadius="md"
                />
                <Input
                  type="password"
                  placeholder="Parolă"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  color="black"
                  required
                  focusBorderColor="red.500"
                  borderRadius="md"
                />
                {/* Adăugăm radio button pentru selectarea rolului */}
                <FormControl as="fieldset">
                  <FormLabel fontWeight="bold" color="gray.700">
                    Rol utilizator
                  </FormLabel>
                  <RadioGroup
                    onChange={(value) => setUserData({ ...userData, role: value })}
                    value={userData.role}
                  >
                    <Stack direction="row" spacing={4}>
                      <Radio value="curier" colorScheme="red">
                        Curier
                      </Radio>
                      <Radio value="admin" colorScheme="red">
                        Admin
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="green"
                  w="full"
                  _hover={{ bg: "green.500", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)" }}
                  borderRadius="md"
                >
                  Înregistrează utilizator
                </Button>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Container maxW="100%" my={6}> {/* Folosim întreaga lățime a paginii */}
          <Heading fontSize="2xl" fontWeight="bold" color="red.500">
            {/* Page Title */}
          </Heading>

          {visibleSection === null && (
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "center", md: "flex-start" }}
              justify={{ base: "center", md: "center" }}
              gap={{ base: 4, md: 8 }} // Spațiu mai mic pe mobil, mai mare pe desktop
              w="100%"
            >
              {/* Box-ul cu noutăți */}
              <Box
                bg="black"
                p={6}
                borderRadius="md"
                boxShadow="lg"
                maxW={{ base: "100%", md: "700px" }} // Reducem ușor lățimea pentru echilibru
                w="100%"
                textAlign="center"
              >
                <Heading size="lg" color="red.500" mb={4}></Heading>
                <DefaultCards />
              </Box>

              {/* Tabelul cu cele mai vândute produse */}
              <TopProductsTable />
            </Flex>
          )}

          {visibleSection === "restaurante" && (
            <Box bg="white" p={6} borderRadius="md" boxShadow="lg" mx="auto" maxW={{ base: "100%", md: "800px" }} textAlign="center">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation={{ clickable: true, prevEl: ".swiper-button-prev", nextEl: ".swiper-button-next" }}
                pagination={{ clickable: true }}
                className="custom-swiper"
              >
                <SwiperSlide>
                  <img src="https://tudispizza.ro/wp-content/uploads/2024/11/Foto-73.jpg" alt="Interior" />
                </SwiperSlide>
                <SwiperSlide>
                  <img src="https://tudispizza.ro/wp-content/uploads/2024/11/Foto-66.jpg" alt="Mâncare" />
                </SwiperSlide>
                <SwiperSlide>
                  <img src="https://tudispizza.ro/wp-content/uploads/2024/11/Foto-99.jpg" alt="Mâncare" />
                </SwiperSlide>
                <div className="swiper-button-prev"></div>
                <div className="swiper-button-next"></div>
              </Swiper>
              <Text mt={4} fontSize="md" color="black" fontWeight="bold">
                Un restaurant italian modern cu atmosferă relaxantă, preparate autentice și ingrediente de cea mai înaltă calitate.
              </Text>
              <VStack spacing={3} mt={5}>
                <Text fontSize="md" fontWeight="bold" color="red.500">
                  <Icon as={FaMapMarkerAlt} color="red.500" mr={2} />
                  Bulevardul George Coșbuc 40, București
                </Text>
                <Text fontSize="md" color="red.500">
                  <Icon as={FaPhone} color="red.500" mr={2} />
                  +40 723 123 456
                </Text>
                <Text fontSize="md" color="red.500">
                  <Icon as={FaEnvelope} color="red.500" mr={2} />
                  contact@casagrosso.ro
                </Text>
              </VStack>
              {isAdmin ? (
                <Box mt={8}>
                  <Heading size="md" color="red.500" mb={4}>
                    Lista Rezervări
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={6}>
                    {reservations.map((reservation) => (
                      <Box
                        key={reservation._id}
                        bg="white"
                        borderRadius="lg"
                        overflow="hidden"
                        boxShadow="lg"
                        transition="all 0.3s ease"
                        _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
                        position="relative"
                        display="flex"
                        flexDirection="column"
                      >
                        <Box p={4} flex="1" display="flex" flexDirection="column">
                          <Text fontWeight="bold" fontSize="xl" color="red.500" mb={2}>
                            {reservation.name}
                          </Text>
                          <Text fontSize="md" color="gray.600">
                            Telefon: {reservation.phone}
                          </Text>
                          <Text fontSize="md" color="gray.600">
                            Data: {reservation.date}
                          </Text>
                          <Text fontSize="md" color="gray.600">
                            Ora: {reservation.time}
                          </Text>
                          <Text fontSize="md" color="gray.600">
                            Persoane: {reservation.numberOfPeople}
                          </Text>
                          <IconButton
                            aria-label="Delete reservation"
                            icon={<FaTrash />}
                            colorScheme="red"
                            size="sm"
                            position="absolute"
                            top={2}
                            right={2}
                            onClick={() => deleteReservation(reservation._id)}
                            _hover={{ bg: "red.600" }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              ) : (
                <Box mt={8}>
                  <Heading size="md" color="red.500" mb={4}>
                    Rezervă o masă
                  </Heading>
                  <VStack spacing={4} as="form" onSubmit={handleReservationSubmit}>
                    <Input
                      placeholder="Nume"
                      size="md"
                      color="black"
                      value={reservation.name}
                      onChange={(e) => setReservation({ ...reservation, name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Telefon"
                      size="md"
                      type="tel"
                      color="black"
                      value={reservation.phone}
                      onChange={(e) => setReservation({ ...reservation, phone: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Data"
                      size="md"
                      type="date"
                      color="black"
                      value={reservation.date}
                      onChange={(e) => {
                        setReservation({ ...reservation, date: e.target.value });
                        setReservationError(""); // Resetăm eroarea la schimbarea datei
                      }}
                      min={new Date().toISOString().split("T")[0]} // Setăm data minimă la data curentă
                      required
                    />
                    <Input
                      placeholder="Ora"
                      size="md"
                      type="time"
                      color="black"
                      value={reservation.time}
                      onChange={(e) => setReservation({ ...reservation, time: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Număr persoane"
                      size="md"
                      type="number"
                      min="1"
                      color="black"
                      value={reservation.numberOfPeople}
                      onChange={(e) => setReservation({ ...reservation, numberOfPeople: e.target.value })}
                      required
                    />
                    {reservationError && (
                      <Text color="red.500" fontSize="sm">
                        {reservationError}
                      </Text>
                    )}
                    <Button
                      colorScheme="red"
                      size="lg"
                      w="full"
                      type="submit"
                      _hover={{ bg: "red.500", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)" }}
                      isDisabled={reservation.date && !validateDate(reservation.date)}
                    >
                      Trimite rezervarea
                    </Button>
                  </VStack>
                </Box>
              )}
            </Box>
          )}

          {visibleSection === "oferte" && (
            <Box bg={isAdmin ? "white" : "ghost"} p={6} borderRadius="md" boxShadow="lg" mx="auto" maxW={{ base: "100%", md: "800px" }} textAlign="center">
              <Heading size="lg" color="red.500" mb={4}>
              </Heading>
              <VoucherList items={vouchers} />
              {isAdmin && <AddVoucherForm onAddVoucher={addVoucher} />}
            </Box>
          )}

          {visibleSection === "pizza" && (
            <Box bg={isAdmin ? "white" : "ghost"} p={6} borderRadius="md" boxShadow="lg" mx="auto" maxW={{ base: "100%", md: "800px" }} textAlign="center">
              <Heading size="lg" color="red.500" mb={4}>
              </Heading>
              <ProductList category="pizza" items={products.pizza} />
              {isAdmin && <AddProductForm category="pizza" />}
            </Box>
          )}

          {visibleSection === "antreuri" && (
            <Box bg={isAdmin ? "white" : "ghost"} p={6} borderRadius="md" boxShadow="lg" mx="auto" maxW={{ base: "100%", md: "800px" }} textAlign="center">
              <Heading size="lg" color="red.500" mb={4}>
              </Heading>
              <ProductList category="antreuri" items={products.antreuri} />
              {isAdmin && <AddProductForm category="antreuri" />}
            </Box>
          )}

          {visibleSection === "paste" && (
            <Box bg={isAdmin ? "white" : "ghost"} p={6} borderRadius="md" boxShadow="lg" mx="auto" maxW={{ base: "100%", md: "800px" }} textAlign="center">
              <Heading size="lg" color="red.500" mb={4}>
              </Heading>
              <ProductList category="paste" items={products.paste} />
              {isAdmin && <AddProductForm category="paste" />}
            </Box>
          )}

          {visibleSection === "burgeri" && (
            <Box bg={isAdmin ? "white" : "ghost"} p={6} borderRadius="md" boxShadow="lg" mx="auto" maxW={{ base: "100%", md: "800px" }} textAlign="center">
              <Heading size="lg" color="red.500" mb={4}>
              </Heading>
              <ProductList category="burgeri" items={products.burgeri} />
              {isAdmin && <AddProductForm category="burgeri" />}
            </Box>
          )}

          {visibleSection === "salate" && (
            <Box bg={isAdmin ? "white" : "ghost"} p={6} borderRadius="md" boxShadow="lg" mx="auto" maxW={{ base: "100%", md: "800px" }} textAlign="center">
              <Heading size="lg" color="red.500" mb={4}>
              </Heading>
              <ProductList category="salate" items={products.salate} />
              {isAdmin && <AddProductForm category="salate" />}
            </Box>
          )}

          {visibleSection === "desert" && (
            <Box bg={isAdmin ? "white" : "ghost"} p={6} borderRadius="md" boxShadow="lg" mx="auto" maxW={{ base: "100%", md: "800px" }} textAlign="center">
              <Heading size="lg" color="red.500" mb={4}>
              </Heading>
              <ProductList category="desert" items={products.desert} />
              {isAdmin && <AddProductForm category="desert" />}
            </Box>
          )}

          {visibleSection === "bauturi" && (
            <Box bg={isAdmin ? "white" : "ghost"} p={6} borderRadius="md" boxShadow="lg" mx="auto" maxW={{ base: "100%", md: "800px" }} textAlign="center">
              <Heading size="lg" color="red.500" mb={4}>
              </Heading>
              <ProductList category="bauturi" items={products.bauturi} />
              {isAdmin && <AddProductForm category="bauturi" />}
            </Box>
          )}
        </Container>

        {/* Modal pentru selecția tipului de blat */}
        <Modal isOpen={isCrustModalOpen} onClose={onCrustModalClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Alege tipul de blat</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text mb={4}>Trebuie să selectezi un tip de blat pentru pizza ta:</Text>
              <RadioGroup onChange={setSelectedCrust} value={selectedCrust}>
                <Stack direction="column" spacing={3}>
                  <Radio value="pufos" colorScheme="red">
                    Blat pufos
                  </Radio>
                  <Radio value="subtire" colorScheme="red">
                    Blat subțire
                  </Radio>
                </Stack>
              </RadioGroup>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="red"
                mr={3}
                onClick={confirmCrustSelection}
                isDisabled={!selectedCrust} // Dezactivăm butonul dacă nu este selectat un tip de blat
              >
                Confirmă
              </Button>
              <Button variant="ghost" onClick={onCrustModalClose}>
                Anulează
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Iconița de chat în colțul din dreapta jos */}
        <IconButton
          aria-label="Open chat"
          icon={<FaComment />}
          position="fixed"
          bottom="20px"
          right="20px"
          colorScheme="red"
          size="lg"
          borderRadius="full"
          boxShadow="lg"
          onClick={onChatOpen}
          zIndex={1000}
          _hover={{ bg: "red.600", transform: "scale(1.1)" }}
        />

        {/* Chatbox pentru clienți (logati sau nelogati) */}
        {!isAdmin && (
          <Modal isOpen={isChatOpen} onClose={onChatClose} isCentered>
            <ModalOverlay />
            <ModalContent maxW="400px" borderRadius="lg" boxShadow="xl">
              <ModalHeader bg="red.500" color="white" borderTopRadius="lg">
                Trimite feedback
              </ModalHeader>
              <ModalCloseButton color="white" />
              <ModalBody p={4}>
                <Text mb={3} color="gray.600">
                  Scrie-ne feedback-ul tău mai jos:
                </Text>
                <Input
                  placeholder="Mesajul tău..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  size="md"
                  focusBorderColor="red.500"
                  minH="100px"
                  as="textarea"
                  resize="none"
                  borderRadius="md"
                  color="black"
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="red"
                  mr={3}
                  onClick={handleSendFeedback}
                  isDisabled={!feedbackMessage.trim()}
                >
                  Trimite
                </Button>
                <Button variant="ghost" onClick={onChatClose}>
                  Anulează
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        {/*Chatbox pentru admin */}
        {isAdmin && (
          <Modal isOpen={isChatOpen} onClose={onChatClose} isCentered>
            <ModalOverlay />
            <ModalContent maxW="500px" borderRadius="lg" boxShadow="xl">
              <ModalHeader bg="red.500" color="white" borderTopRadius="lg">
                Feedback de la clienți
              </ModalHeader>
              <ModalCloseButton color="white" />
              <ModalBody p={4} maxH="400px" overflowY="auto">
                {feedbackList.length === 0 ? (
                  <Text color="gray.500">Niciun feedback primit.</Text>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {currentFeedback.map((feedback) => (
                      <Box
                        key={feedback._id}
                        p={3}
                        bg="gray.100"
                        borderRadius="md"
                        boxShadow="sm"
                      >
                        <Text fontSize="sm" color="gray.600">
                          {feedback.userId
                            ? `Utilizator: ${feedback.userId.username}`
                            : "Anonim"}
                        </Text>
                        <Text mt={1} color="black">
                          {feedback.message}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {new Date(feedback.createdAt).toLocaleString()}
                        </Text>
                      </Box>
                    ))}
                    {/* Paginare */}
                    {totalPages > 1 && (
                      <Flex
                        justify="center"
                        align="center"
                        mt={4}
                        gap={3}
                        p={3}
                        bg="white"
                        borderRadius="lg"
                        boxShadow="sm"
                      >
                        <IconButton
                          aria-label="Previous page"
                          icon={<FaArrowLeft />}
                          colorScheme="red"
                          size="sm"
                          borderRadius="full"
                          isDisabled={currentPage === 1}
                          onClick={handlePreviousPage}
                          _hover={{ bg: "red.600", transform: "scale(1.1)" }}
                        />
                        <Text fontWeight="bold" color="gray.700" fontSize="sm">
                          Pagina {currentPage} din {totalPages}
                        </Text>
                        <IconButton
                          aria-label="Next page"
                          icon={<FaArrowRight />}
                          colorScheme="red"
                          size="sm"
                          borderRadius="full"
                          isDisabled={currentPage === totalPages}
                          onClick={handleNextPage}
                          _hover={{ bg: "red.600", transform: "scale(1.1)" }}
                        />
                      </Flex>
                    )}
                  </VStack>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={onChatClose}>
                  Închide
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        <style jsx>{`
          .swiper-pagination-bullet {
            background: #DC143C !important;
            opacity: 0.5;
          }
          .swiper-pagination-bullet-active {
            background: #DC143C !important;
            opacity: 1;
          }
          .swiper-button-next,
          .swiper-button-prev {
            color: #DC143C !important;
          }
        `}</style>
      </Box>
    </PageTransition>
  );
};

export default MainPage;