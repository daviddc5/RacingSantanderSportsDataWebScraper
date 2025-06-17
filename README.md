# Racing de Santander Fan Website

A modern React-based fan website for Racing de Santander, featuring live match data, squad information, and club history.

## 🚀 Features

- **Modern React Architecture**: Built with React 18, Vite, and React Router
- **Live Match Data**: Real-time fixtures and league position from football APIs
- **Responsive Design**: Mobile-first design that works on all devices
- **Dynamic Squad Display**: Player information with photos and statistics
- **Club History**: Interactive timeline of Racing's rich history
- **API Integration**: Fallback data when APIs are unavailable
- **Vercel Ready**: Optimized for deployment on Vercel

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM
- **Build Tool**: Vite
- **Styling**: CSS3 with CSS Variables
- **APIs**: API-Football integration with fallback data
- **Deployment**: Vercel (with proper SPA routing)

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd RealRacingSantanderRedoWebsite
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up API keys** (optional)

   - Copy `config.example.js` to `config.js`
   - Add your API-Football key for live data
   - Without API key, the site will use fallback data

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**

   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically detect the React/Vite setup

2. **Environment Variables** (optional)

   - Add your API keys in Vercel dashboard
   - Set `VITE_API_FOOTBALL_KEY` for live data

3. **Deploy**
   - Vercel will automatically build and deploy
   - The `vercel.json` handles SPA routing

### Other Platforms

The app is configured for Vercel but can be deployed to any static hosting service:

- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting provider

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header.jsx      # Navigation header
│   ├── Footer.jsx      # Site footer
│   └── *.css           # Component styles
├── pages/              # Page components
│   ├── Home.jsx        # Home page with live data
│   ├── Squad.jsx       # Squad display
│   ├── History.jsx     # Club history
│   └── *.css           # Page styles
├── hooks/              # Custom React hooks
│   └── useRacingAPI.js # API integration hook
├── utils/              # Utility functions
│   └── footballAPIData.js # API data handling
├── App.jsx             # Main app component
├── main.jsx            # React entry point
└── *.css               # Global styles
```

## 🔧 Configuration

### API Setup

The app supports multiple football data APIs:

1. **API-Football** (Primary)

   - Most comprehensive data
   - Requires API key from RapidAPI
   - Provides live fixtures, squad, and league data

2. **Fallback Data**
   - Built-in static data when APIs are unavailable
   - Ensures the site always works
   - Updated manually for accuracy

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_FOOTBALL_KEY=your_api_football_key_here
```

## 🎨 Customization

### Colors and Branding

Update CSS variables in `src/index.css`:

```css
:root {
  --color-green: #00a651; /* Primary brand color */
  --color-green-dark: #007a2d; /* Darker green */
  --color-white: #ffffff; /* White */
  --color-grey-light: #f8f9fa; /* Light grey */
  --color-grey-medium: #6c757d; /* Medium grey */
  --color-grey-dark: #343a40; /* Dark grey */
  --color-black: #000000; /* Black */
}
```

### Content Updates

- **Squad Data**: Update `src/utils/footballAPIData.js` fallback data
- **History**: Modify `src/pages/History.jsx` content
- **Fixtures**: Update fallback fixtures in the API utility

## 🚀 Performance

- **Vite Build**: Fast development and optimized production builds
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Responsive images with fallbacks
- **API Caching**: Efficient API data handling with fallbacks

## 📱 Mobile Support

- **Responsive Design**: Mobile-first approach
- **Touch Friendly**: Optimized for touch interactions
- **Progressive Web App**: Can be installed on mobile devices
- **Offline Support**: Fallback data works without internet

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Racing de Santander for the inspiration
- API-Football for providing football data
- React and Vite communities for excellent tooling
- Vercel for seamless deployment

---

**¡Aúpa Racing!** ⚽🟢⚪
