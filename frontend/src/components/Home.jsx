// src/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "./PageTransition";
import { Link } from "react-router-dom";
import { Box, Button, Container, Heading, Text, Stack, SimpleGrid, Image, useBreakpointValue, Flex } from "@chakra-ui/react";

const Home = () => {
  const navigate = useNavigate();
  return (
    <PageTransition> 
      <div>
        <Box
          as="section"
          position="relative"
          height="100vh"
          backgroundImage="url('https://t4.ftcdn.net/jpg/02/92/20/37/360_F_292203735_CSsyqyS6A4Z9Czd4Msf7qZEhoxjpzZl1.jpg')"
          backgroundPosition="center"
          backgroundSize="cover"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
        >
          <Stack textAlign="center" spacing={6} zIndex="2" width="100%">
            <Heading
              fontSize={useBreakpointValue({ base: "4xl", md: "6xl" })}
              fontWeight="bold"
              letterSpacing="widest"
              mb={6}  
            >
              Casa Grosso
            </Heading>
            <Text
              fontSize={useBreakpointValue({ base: "lg", md: "2xl" })}
              maxW="700px"
              margin="auto"
              lineHeight="1.6"
              mb={8}  
            >
              Răsfățați-vă cu preparate rafinate, gătite cu măiestrie din cele mai fine ingrediente. Descoperiți astăzi noul dumneavoastră fel de mâncare preferat!
            </Text>
            <Button
              colorScheme="red"
              fontSize="xl"  
              variant="solid"
              borderRadius="full"  
              paddingX={4}  
              paddingY={2}  
              _hover={{ bg: "red.600", transform: "scale(1.05)" }}
              onClick={() => navigate("/main")}  
              opacity={0.8}
            >
              Alătură-te experienței
            </Button>

          </Stack>
        </Box>


        {/* About Section */}
        <Box bg="black" py={16} color="white">
          <Container maxW="container.lg">
            <Stack spacing={8} textAlign="center">
              <Heading fontSize="3xl" color="red.400">Despre Noi</Heading>
              <Text fontSize="lg" maxW="700px" margin="auto" lineHeight="1.8">
                Suntem un restaurant italienesc modern care oferă o experiență culinară îndrăzneață și de neuitat. Bucătarii noștri îmbină cele mai proaspete ingrediente cu tehnici tradiționale italienești, rafinate de-a lungul timpului, pentru a crea preparate care vă vor încânta simțurile. Fie că este vorba de o cină relaxantă cu prietenii sau de o celebrare intimă, suntem aici pentru a transforma fiecare moment într-o amintire specială, plină de arome autentice și pasiune pentru gastronomie.
              </Text>
            </Stack>
          </Container>
        </Box>

        {/* Specialties Section */}
        <Box bg="white" py={16}>
          <Container maxW="container.lg">
            <Stack spacing={8} textAlign="center">
              <Heading fontSize="3xl" color="red.400" mb={10}>Specialitățile casei</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                <Box
                  bg="black"
                  color="white"
                  p={5}
                  shadow="xl"
                  borderRadius="lg"
                  _hover={{ transform: "scale(1.05)", boxShadow: "xl" }}
                  transition="all 0.3s ease-in-out"
                >
                  <Image src="https://images.unsplash.com/photo-1513104890138-7c749659a591?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGl6emF8ZW58MHx8MHx8fDA%3D" alt="Dish 1" borderRadius="lg" />
                  <Heading mt={4} size="lg" color="red.400">Pizza delicioasă</Heading>
                  <Text mt={2} color="gray.300">Pizza noastră este preparată manual cu ingrediente de cea mai bună calitate și coaptă perfect pentru a obține o crustă crocantă și un gust delicios, care îți lasă gura apă.</Text>
                </Box>
                <Box
                  bg="black"
                  color="white"
                  p={5}
                  shadow="xl"
                  borderRadius="lg"
                  _hover={{ transform: "scale(1.05)", boxShadow: "xl" }}
                  transition="all 0.3s ease-in-out"
                >
                  <Image src="https://plus.unsplash.com/premium_photo-1664472619078-9db415ebef44?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGFzdGF8ZW58MHx8MHx8fDA%3D" alt="Dish 2" borderRadius="lg" />
                  <Heading mt={4} size="lg" color="red.400">Paste în stil napoletan</Heading>
                  <Text mt={2} color="gray.300">Pastele noastre proaspăt preparate sunt combinate cu o varietate de sosuri, oferind un gust autentic al Italiei în fiecare îmbucătură.</Text>
                </Box>
                <Box
                  bg="black"
                  color="white"
                  p={5}
                  shadow="xl"
                  borderRadius="lg"
                  _hover={{ transform: "scale(1.05)", boxShadow: "xl" }}
                  transition="all 0.3s ease-in-out"
                >
                  <Image src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnVyZ2Vyc3xlbnwwfHwwfHx8MA%3D%3D" alt="Dish 3" borderRadius="lg" />
                  <Heading mt={4} size="lg" color="red.400">Burgeri suculenți</Heading>
                  <Text mt={2} color="gray.300">Savurează burgerii noștri suculenți, perfect pregătiți, cu toppinguri și sosuri care te vor face să-ți dorești și mai mult.</Text>
                </Box>
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>

        {/* Footer Section */}
        <Box as="footer" bg="black" color="white" py={8}>
          <Container maxW="container.lg" textAlign="center">
            <Text>&copy; {new Date().getFullYear()} Casa Grosso. Toate drepturile rezervate.</Text>
            <Flex justify="center" mt={4}>
              <Button
                as={Link}
                to="https://facebook.com"
                variant="link"
                color="white"
                fontSize="lg"
                _hover={{ color: "red.400" }}
              >Facebook</Button>
              <Button
                as={Link}
                to="https://instagram.com"
                variant="link"
                color="white"
                fontSize="lg"
                _hover={{ color: "red.400" }}
                mx = {4}
              >Instagram</Button>
              <Button
                as={Link}
                to="https://twitter.com"
                variant="link"
                color="white"
                fontSize="lg"
                _hover={{ color: "red.400" }}
              >Twitter</Button>
            </Flex>
          </Container>
        </Box>
      </div>
    </PageTransition>
  );
};

export default Home;
