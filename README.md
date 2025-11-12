# 🎮 PokéApp - Tu Pokédex Inteligente

Una aplicación móvil completa construida con **React Native** y **Expo** que te permite explorar el mundo Pokémon con la ayuda de inteligencia artificial.

## ✨ Características Principales

### 📱 Pokédex Completa
- **1000+ Pokémon** de todas las generaciones
- Búsqueda y filtrado por nombre, tipo o número
- Información detallada de cada Pokémon
- Sprites animados (GIF) en estilo Black/White
- Visualización de estadísticas base
- Lista completa de movimientos y habilidades

### 🤖 PokeAI - Asistente Inteligente
- **Chatbot con IA** powered by Google Gemini
- Búsqueda de Pokémon por descripción natural
- Recomendaciones de equipos personalizados
- Creación automática de equipos balanceados
- Integración con favoritos y equipos del usuario

### ⚔️ Sistema de Equipos
- Crea equipos de hasta **6 Pokémon**
- Equipos manuales o generados por IA
- Estadísticas del equipo (tipos únicos, promedios)
- Gestión completa (agregar, quitar, eliminar)
- Menú contextual con múltiples opciones

### ❤️ Favoritos
- Guarda tus Pokémon favoritos
- Acceso rápido desde cualquier pantalla
- Sincronización con PokeAI
- Gestión visual con tarjetas

### 🎨 Detalles del Pokémon
- Imágenes animadas de alta calidad
- Información física (altura, peso, experiencia)
- Tipos con colores distintivos
- Gráficos de estadísticas
- Variantes (normal, shiny, espalda)
- Sonidos de Pokémon (cries)

## 🛠️ Tecnologías Utilizadas

- **Framework**: React Native + Expo
- **Lenguaje**: TypeScript
- **UI**: NativeWind (Tailwind CSS para React Native)
- **Navegación**: Expo Router
- **Estado Global**: Context API
- **IA**: Google Gemini API
- **API**: PokeAPI
- **Almacenamiento**: AsyncStorage

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Expo CLI
- API Key de Google Gemini

### Pasos

1. **Clona el repositorio**
```bash
git clone https://github.com/tu-usuario/poke-app.git
cd poke-app
```

2. **Instala las dependencias**
```bash
npm install
# o
yarn install
```

3. **Configura las variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:
```properties
EXPO_PUBLIC_GEMINI_API_KEY=tu_api_key_aquí
```

> 💡 Obtén tu API key gratis en [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **Inicia el proyecto**
```bash
npx expo start
```

5. **Ejecuta la app**
- Presiona `i` para iOS Simulator
- Presiona `a` para Android Emulator
- Escanea el QR con Expo Go en tu dispositivo

## 📁 Estructura del Proyecto

```
poke-app/
├── app/                      # Pantallas y navegación (Expo Router)
│   ├── (tabs)/              # Navegación por tabs
│   │   ├── index.tsx        # Home/Pokédex
│   │   ├── favorites.tsx    # Favoritos
│   │   └── profile.tsx      # Perfil
│   └── details/[id].tsx     # Detalles del Pokémon
├── components/              # Componentes reutilizables
│   ├── PokemonCard.tsx     # Tarjeta de Pokémon
│   ├── TypeBadge.tsx       # Badge de tipo
│   ├── StatBar.tsx         # Barra de estadísticas
│   ├── PokeSound.tsx       # Reproductor de sonidos
│   └── ui/                 # Componentes UI
├── context/                # Estado global
│   ├── FavoritesContext.tsx
│   └── EquipoContext.tsx
├── PokeAI.tsx             # Chatbot con IA
├── PokeEquipo.tsx         # Gestión de equipos
└── .env                   # Variables de entorno
```

## 🎯 Uso

### Explorar Pokémon
1. Abre la app en la pestaña "Pokédex"
2. Usa la búsqueda o scroll para navegar
3. Toca cualquier Pokémon para ver detalles

### Crear Equipos con IA
1. Presiona el botón flotante 🤖
2. Escribe algo como: *"Crea un equipo con 6 Pokémon de fuego"*
3. PokeAI generará el equipo automáticamente
4. El equipo se guarda en "Mis Equipos"

### Agregar a Favoritos
1. Entra a los detalles de un Pokémon
2. Presiona el botón ❤️
3. Visualiza tus favoritos en la pestaña correspondiente

### Gestionar Equipos
1. Ve a "Mis Equipos" ⚔️
2. Crea equipos manualmente o con IA
3. Agrega Pokémon desde sus detalles
4. Usa el menú ⋮ para más opciones

## 🌟 Características Destacadas

### Integración con IA
PokeAI entiende lenguaje natural y puede:
- "Muéstrame 5 Pokémon de tipo agua"
- "Recomiéndame un equipo legendario"
- "Busca los iniciales de Kanto"
- "Crea un equipo balanceado"

### Diseño Moderno
- UI/UX inspirada en apps modernas
- Animaciones suaves
- Colores por tipo de Pokémon
- Modo oscuro (en desarrollo)

### Offline First
- Favoritos y equipos guardados localmente
- Funciona sin conexión una vez cargados los datos

## 🤝 Contribuir

Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Tu Perfil](https://linkedin.com/in/tu-perfil)

## 🙏 Agradecimientos

- [PokéAPI](https://pokeapi.co/) - API de datos Pokémon
- [Google Gemini](https://ai.google.dev/) - Modelo de IA
- [Expo](https://expo.dev/) - Framework de desarrollo
- Pokémon y todos los personajes son © de Nintendo/Game Freak

## 📸 Capturas de Pantalla
![Image](https://github.com/user-attachments/assets/08a72f20-31ea-4133-a409-d0ff63d780fd)
