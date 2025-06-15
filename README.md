# Racing de Santander Website

A modern, responsive website for Racing de Santander football club with dynamic API integration and modular architecture.

## 🏗️ Project Structure

```
RealRacingSantanderRedoWebsite/
├── index.html                 # Main homepage
├── pages/                     # Sub-pages
│   ├── squad.html            # Squad page
│   └── history.html          # History page
├── src/                      # Source code
│   ├── api/                  # API integration
│   │   └── footballAPIData.js
│   ├── components/           # Reusable components
│   │   ├── header.html       # Header for sub-pages
│   │   ├── footer.html       # Footer for sub-pages
│   │   ├── header-main.html  # Header for main page
│   │   └── footer-main.html  # Footer for main page
│   ├── data/                 # Static data
│   │   └── matchData.js
│   ├── scripts/              # JavaScript files
│   │   └── components.js     # Component loader
│   └── styles/               # CSS files
│       ├── styles.css        # Main styles
│       ├── header.css        # Header styles
│       ├── footer.css        # Footer styles
│       ├── hero.css          # Hero section styles
│       ├── squad.css         # Squad page styles
│       ├── history.css       # History page styles
│       └── api-data.css      # API data styles
├── images/                   # Image assets
│   ├── racingLogo.png
│   ├── realZaragoza.png
│   ├── Real_Zaragoza_logo.svg.png
│   └── SportingLogo.png
├── README.md                 # This file
└── README_API_SETUP.md       # API setup guide
```

## 🚀 Features

### Core Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dynamic Data**: Real-time football data from external APIs
- **Modular Architecture**: Clean separation of concerns
- **Component System**: Reusable header and footer components
- **Fallback Data**: Works offline with comprehensive fallback data

### Pages

- **Homepage**: League position, upcoming fixtures, quick links
- **Squad**: Current team roster with player details
- **History**: Club timeline and statistics

### API Integration

- **Multiple API Support**: API-Football and Football-Data.org
- **Automatic Fallback**: Graceful degradation when APIs are unavailable
- **Real-time Data**: Live squad, fixtures, and league position
- **Error Handling**: Robust error handling and user feedback

## 🛠️ Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **Font Awesome**: Icons
- **External APIs**: Football data integration

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd RealRacingSantanderRedoWebsite
   ```

2. **Set up API keys** (optional)

   - Follow the instructions in `README_API_SETUP.md`
   - Configure your preferred API provider
   - The website works without API keys using fallback data

3. **Open in browser**

   ```bash
   # Using Python (if available)
   python -m http.server 8000

   # Using Node.js (if available)
   npx serve .

   # Or simply open index.html in your browser
   ```

## 🔧 Configuration

### API Setup

See `README_API_SETUP.md` for detailed API configuration instructions.

### Customization

- **Team ID**: Update `teamId` in `src/api/footballAPIData.js` for different teams
- **Styling**: Modify CSS files in `src/styles/`
- **Content**: Update HTML files and data in `src/data/`

## 📁 File Organization

### Root Level

- `index.html`: Main homepage
- `README.md`: Project documentation
- `README_API_SETUP.md`: API setup guide

### Pages Directory

- `pages/squad.html`: Squad page
- `pages/history.html`: History page

### Source Directory (`src/`)

#### API (`src/api/`)

- `footballAPIData.js`: Main API integration class

#### Components (`src/components/`)

- `header.html`: Header component for sub-pages
- `footer.html`: Footer component for sub-pages
- `header-main.html`: Header component for main page
- `footer-main.html`: Footer component for main page

#### Data (`src/data/`)

- `matchData.js`: Static match and team data

#### Scripts (`src/scripts/`)

- `components.js`: Component loader and initialization

#### Styles (`src/styles/`)

- `styles.css`: Main stylesheet
- `header.css`: Header-specific styles
- `footer.css`: Footer-specific styles
- `hero.css`: Hero section styles
- `squad.css`: Squad page styles
- `history.css`: History page styles
- `api-data.css`: API data display styles

### Assets (`images/`)

- All image files used throughout the website

## 🔄 Component System

The website uses a dynamic component loading system:

1. **Component Detection**: Automatically detects if on main page or sub-page
2. **Path Resolution**: Loads appropriate component files with correct paths
3. **Fallback System**: Provides fallback components if files fail to load
4. **Script Execution**: Executes component scripts after loading

## 🎨 Styling Architecture

- **Modular CSS**: Separate files for different components
- **Responsive Design**: Mobile-first approach
- **CSS Variables**: Consistent color scheme and spacing
- **Flexbox/Grid**: Modern layout techniques

## 🔌 API Integration

### Supported APIs

- **API-Football**: Comprehensive football data (recommended)
- **Football-Data.org**: Alternative API with free tier

### Data Types

- **Squad Data**: Player roster with details
- **Fixtures**: Upcoming matches
- **League Position**: Current standings

### Fallback System

- Comprehensive fallback data for offline use
- Automatic detection of API availability
- Graceful error handling

## 🚀 Deployment

### Static Hosting

The website can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any web server

### Requirements

- No server-side processing required
- Works with any static file hosting
- API calls made directly from browser

## 🐛 Troubleshooting

### Common Issues

1. **Components not loading**: Check file paths and server configuration
2. **API errors**: Verify API keys and check console for errors
3. **Styling issues**: Ensure all CSS files are loading correctly
4. **Navigation problems**: Check component paths and routing

### Debug Mode

Enable browser developer tools to see:

- Component loading status
- API response data
- Error messages
- Network requests

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and fan purposes. All Racing de Santander branding and imagery belongs to the club.

## 🤝 Support

For issues or questions:

1. Check the browser console for errors
2. Review the API setup guide
3. Verify file paths and structure
4. Test with fallback data

---

**¡Aúpa Racing!** ⚽🟢⚪
