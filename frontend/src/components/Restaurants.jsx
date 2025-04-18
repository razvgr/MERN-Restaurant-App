import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

const Restaurants = () => {
  return (
    <Box p={6}>
      <Heading size="xl" color="red.500">
        Restaurante
      </Heading>
      <Text mt={4}>Aici sunt listate toate restaurantele disponibile.</Text>
    </Box>
  );
};

export default Restaurants;
