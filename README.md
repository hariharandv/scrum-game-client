# Scrum Velocity Simulator - Frontend

An interactive Scrum simulation game built with React 19, TypeScript, and Vite. Helps teams learn about velocity, work-in-progress limits, and technical debt through gamification.

## Features

- **Interactive Game Board**: Drag-and-drop cards between workflow columns
- **Role-Based Gameplay**: Play as Product Owner, Scrum Master, or Developer
- **D6 Dice System**: Roll dice to move tasks through the workflow
- **Cumulative Flow Diagram**: Visualize work distribution over time
- **Sprint Planning**: Pull stories from backlog and allocate capacity
- **Retrospective View**: Analyze game metrics and team performance
- **Save/Load Games**: Persist game state to local storage

## Tech Stack

- React 19
- TypeScript
- Vite
- Recharts (for data visualization)
- CSS Modules

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Game Rules

1. **Select Role**: Choose between Product Owner, Scrum Master, or Developer
2. **Start Game**: Initialize the game board with cards
3. **Move Cards**: Drag cards between columns based on your role permissions
4. **Roll Dice**: Use D6 dice to determine movement outcomes
5. **Sprint Planning**: Pull stories from Product Backlog to Sprint Backlog
6. **Track Progress**: Monitor cumulative flow and velocity metrics

## Role Permissions

- **Product Owner**: Funnel → Product Backlog
- **Scrum Master**: Product Backlog → Sprint Backlog  
- **Developer**: Sprint Backlog through Testing

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

## Deployment

Deployed on Vercel. Connect to backend API via environment variables.

## License

MIT

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
