import { createTheme } from '@mui/material/styles';

export const eraserTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4285F4', // Google Blue similar to Eraser.io
      light: '#80a9ff',
      dark: '#1565C0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#34A853', // Green accent
      light: '#81c784',
      dark: '#2E7D32',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0A0A0A', // Very dark background like Eraser.io
      paper: '#1A1A1A', // Slightly lighter for panels
    },
    surface: {
      main: '#1E1E1E', // For cards and elevated surfaces
      dark: '#151515',
      light: '#2A2A2A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      disabled: '#666666',
    },
    divider: '#333333',
    action: {
      active: '#FFFFFF',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    // Custom colors for SQL elements
    sqlColors: {
      table: '#2A2A2A',
      tableBorder: '#404040',
      primaryKey: '#FFA726', // Orange for PK
      foreignKey: '#42A5F5', // Blue for FK
      relationship: '#66BB6A', // Green for relationships
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.125rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    code: {
      fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners like Eraser.io
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#333333 #1A1A1A',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#333333',
            border: '1px solid #1A1A1A',
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#404040',
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: '#404040',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#404040',
          },
          '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: '#1A1A1A',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          borderBottom: '1px solid #333333',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A1A1A',
          borderRight: '1px solid #333333',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          border: '1px solid #333333',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3367D6 0%, #2E7D32 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#2A2A2A',
            '& fieldset': {
              borderColor: '#404040',
            },
            '&:hover fieldset': {
              borderColor: '#4285F4',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4285F4',
            },
          },
        },
      },
    },
  },
});

// Extend the theme interface to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      main: string;
      dark: string;
      light: string;
    };
    sqlColors: {
      table: string;
      tableBorder: string;
      primaryKey: string;
      foreignKey: string;
      relationship: string;
    };
  }

  interface PaletteOptions {
    surface?: {
      main: string;
      dark: string;
      light: string;
    };
    sqlColors?: {
      table: string;
      tableBorder: string;
      primaryKey: string;
      foreignKey: string;
      relationship: string;
    };
  }

  interface TypographyVariants {
    code: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    code?: React.CSSProperties;
  }
}