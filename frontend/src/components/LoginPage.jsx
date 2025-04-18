import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  RadioGroup,
  Radio,
  Stack,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const LoginPage = () => {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = mode === "login" ? "http://localhost:5555/login" : "http://localhost:5555/register";

    try {
      const response = await axios.post(url, { username, password }, {
        headers: { "Content-Type": "application/json" },
      });
      if (mode === "login") {
        const { token, role } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        toast({
          title: "Succes",
          description: "Logare reușită!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // Redirecționare în funcție de rol
        const redirectTo = role === "curier" ? "/delivery" : location.state?.from || "/main";
        navigate(redirectTo);
      } else {
        toast({
          title: "Succes",
          description: "Înregistrare reușită!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setMode("login");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "A apărut o problemă.";
      toast({
        title: "Eroare",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Eroare detaliată:", error.response?.data || error.message);
    }
  };

  return (
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      bgImage="url('https://cdn.pixabay.com/photo/2020/03/21/02/26/pizza-4952508_1280.jpg')" // Înlocuiește cu URL-ul imaginii tale
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
    >
      <Box
        bg="rgba(240, 240, 240, 0.8)" // Fundal semi-transparent pentru lizibilitate
        p={8}
        borderRadius="md"
        boxShadow="lg"
        w={{ base: "90%", md: "400px" }}
      >
        <Heading mb={6} textAlign="center" color="red.500">
          {mode === "login" ? "Logare" : "Înregistrare"}
        </Heading>
        <RadioGroup onChange={setMode} value={mode} mb={4}>
          <Stack direction="row" spacing={4}>
            <Radio value="login">Logare</Radio>
            <Radio value="register">Înregistrare</Radio>
          </Stack>
        </RadioGroup>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Input
              placeholder="Nume utilizator"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              color="black"
            />
            <Input
              type="password"
              placeholder="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color="black"
            />
            <Button
              type="submit"
              colorScheme="red"
              bg="red.500"
              w="full"
              _hover={{ bg: "red.500", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)" }}
            >
              {mode === "login" ? "Loghează-te" : "Înregistrează-te"}
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default LoginPage;