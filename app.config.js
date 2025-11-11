import "dotenv/config";

export default {
  expo: {
    name: "pokedex",
    slug: "tu-app",
    extra: {
      GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    },
  },
};
