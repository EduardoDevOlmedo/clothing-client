import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import api from "../api.js";
import Nav from "../components/Nav.jsx";

const TIPOS = [
  "blusa",
  "falda",
  "botas",
  "pantalon",
  "vestido",
  "chaqueta",
  "accesorio",
  "otro",
];
const ESTADOS_FISICO = ["nuevo", "usado", "con detalle"];

export default function AddPrendaPage() {
  const [drops, setDrops] = useState([]);
  const [form, setForm] = useState({
    drop: "",
    nombre: "",
    tipo: "blusa",
    talla: "",
    precioCompra: "",
    precioVenta: "",
    estadoFisico: "nuevo",
  });
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/drops").then(({ data }) => {
      setDrops(data);
      if (data.length) setForm((f) => ({ ...f, drop: data[0]._id }));
    });
  }, []);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/prendas", {
        ...form,
        fechaCompra: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString(),
        precioCompra: Number(form.precioCompra),
        precioVenta: Number(form.precioVenta),
      });
      setToast({ severity: "success", msg: "Prenda creada" });
      setTimeout(() => navigate("/"), 800);
    } catch (e) {
      setToast({ severity: "error", msg: e.response?.data?.error || "Error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Nav
        onNewDrop={() => {
          if (location.pathname === "/") {
            setNewDropOpen(true);
          } else {
            navigate(`/`);
          }
        }}
      />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Nueva prenda
          </Typography>
          <form onSubmit={submit}>
            <Stack spacing={2}>
              <FormControl required fullWidth>
                <InputLabel>Drop</InputLabel>
                <Select
                  value={form.drop}
                  label="Drop"
                  onChange={(e) => set("drop", e.target.value)}
                >
                  {drops.map((d) => (
                    <MenuItem key={d._id} value={d._id}>
                      {d.nombre}
                      {d.fechaPublicacion
                        ? ` - ${new Date(d.fechaPublicacion).toLocaleDateString()}`
                        : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Nombre"
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                required
              />

              <FormControl required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={form.tipo}
                  label="Tipo"
                  onChange={(e) => set("tipo", e.target.value)}
                >
                  {TIPOS.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Talla"
                value={form.talla}
                onChange={(e) => set("talla", e.target.value)}
                required
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Precio compra"
                  type="number"
                  value={form.precioCompra}
                  onChange={(e) => set("precioCompra", e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Precio venta"
                  type="number"
                  value={form.precioVenta}
                  onChange={(e) => set("precioVenta", e.target.value)}
                  required
                  fullWidth
                />
              </Stack>

              <FormControl required>
                <InputLabel>Estado fisico</InputLabel>
                <Select
                  value={form.estadoFisico}
                  label="Estado fisico"
                  onChange={(e) => set("estadoFisico", e.target.value)}
                >
                  {ESTADOS_FISICO.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => navigate("/")}>Cancelar</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving || !form.drop}
                >
                  {saving ? "Guardando..." : "Crear prenda"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Container>

      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {toast ? (
          <Alert severity={toast.severity}>{toast.msg}</Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
