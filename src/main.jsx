import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App.jsx";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#e26a92", light: "#f7b6cd", dark: "#b84a73", contrastText: "#fff" },
    secondary: { main: "#c9a7eb", light: "#e7d7f7", dark: "#8f6ec0", contrastText: "#fff" },
    error: { main: "#e05a6f" },
    warning: { main: "#f0b67f" },
    success: { main: "#9ccfa8" },
    info: { main: "#f3b6c6" },
    background: { default: "#fff5f7", paper: "#fffafc" },
    text: { primary: "#4a2a3a", secondary: "#8a6477" },
    divider: "#f3d7e0",
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      '"Quicksand","Poppins","Nunito","Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    h6: { fontWeight: 600, letterSpacing: 0.2 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: 0.3 },
    overline: { letterSpacing: 1.2 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "linear-gradient(180deg,#fff0f4 0%,#fff5f7 40%,#fdf7ff 100%)",
          minHeight: "100vh",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 4px 20px rgba(226,106,146,0.08)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#fffafc",
          border: "1px solid #fbe3ec",
          boxShadow: "0 2px 10px rgba(226,106,146,0.06)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage:
            "linear-gradient(90deg,#f7b6cd 0%,#e7d7f7 100%)",
          color: "#4a2a3a",
          boxShadow: "0 2px 12px rgba(226,106,146,0.15)",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 18 },
        containedPrimary: {
          backgroundImage:
            "linear-gradient(135deg,#f198b4 0%,#e26a92 100%)",
          "&:hover": {
            backgroundImage:
              "linear-gradient(135deg,#e97fa6 0%,#d55986 100%)",
          },
        },
        outlinedPrimary: {
          borderColor: "#f3b6c6",
          "&:hover": { borderColor: "#e26a92", backgroundColor: "#fff0f4" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 500 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            backgroundColor: "#fde7ee",
            color: "#6a3751",
            fontWeight: 600,
            borderBottom: "1px solid #f3d7e0",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#fff3f7" },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid #fbe3ec" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#fffafc",
          "& fieldset": { borderColor: "#f3d7e0" },
          "&:hover fieldset": { borderColor: "#f198b4" },
          "&.Mui-focused fieldset": { borderColor: "#e26a92" },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff3f7",
          borderRadius: 10,
          "&:hover": { backgroundColor: "#ffe8ef" },
          "&.Mui-focused": { backgroundColor: "#ffe8ef" },
          "&:before, &:after": { borderBottomColor: "#f3b6c6" },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage:
            "linear-gradient(180deg,#fffafc 0%,#fff5f9 100%)",
          border: "1px solid #fbe3ec",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { color: "#6a3751", fontWeight: 600 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: { backgroundColor: "#e3f4e7", color: "#3a6a48" },
        standardError: { backgroundColor: "#fde3e7", color: "#8a2a3a" },
        standardInfo: { backgroundColor: "#fde7ef", color: "#6a3751" },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          "&.Mui-active": { color: "#b84a73" },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
