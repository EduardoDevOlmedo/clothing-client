import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  Button,
  Slide,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Skeleton,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
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
const ESTADOS_VENTA = ["disponible", "vendido", "reservado"];

const DROP_FIELDS = ["nombre", "descripcion", "fechaPublicacion", "gastosPublicidad"];
const PRENDA_FIELDS = [
  "nombre",
  "tipo",
  "talla",
  "precioCompra",
  "precioVenta",
  "estadoFisico",
  "estadoVenta",
  "fechaCompra",
  "fechaVenta",
];

function toDateInput(v) {
  if (!v) return "";
  return new Date(v).toISOString().slice(0, 10);
}

function diff(original, current, fields) {
  const out = {};
  for (const k of fields) {
    const a = original?.[k] ?? null;
    const b = current?.[k] ?? null;
    const aVal = a instanceof Date ? a.toISOString() : a;
    const bVal = b instanceof Date ? b.toISOString() : b;
    if (String(aVal ?? "") !== String(bVal ?? "")) out[k] = b;
  }
  return out;
}

export default function DashboardPage() {
  const [drops, setDrops] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [dropOriginal, setDropOriginal] = useState(null);
  const [dropDraft, setDropDraft] = useState(null);
  const [prendasOriginal, setPrendasOriginal] = useState([]);
  const [prendasDraft, setPrendasDraft] = useState([]);
  const [stats, setStats] = useState(null);
  const [sortBy, setSortBy] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [newDropOpen, setNewDropOpen] = useState(false);
  const [newDrop, setNewDrop] = useState({
    nombre: "",
    gastosPublicidad: "",
    descripcion: "",
    fechaPublicacion: "",
  });
  const [toDelete, setToDelete] = useState(null);

  async function deletePrenda(id) {
    try {
      await api.delete(`/prendas/${id}`);
      setToDelete(null);
      await loadDrop(selectedId);
      await loadDrops();
      setToast({ severity: "success", msg: "Prenda eliminada" });
    } catch (e) {
      setToast({
        severity: "error",
        msg: e.response?.data?.error || "Error al eliminar",
      });
    }
  }

  async function loadDrops() {
    setLoading(true);
    const { data } = await api.get("/drops");
    setDrops(data);
    if (data.length && !selectedId) setSelectedId(data[0]._id);
    setLoading(false);
  }

  async function loadDrop(id) {
    if (!id) return;
    const { data } = await api.get(`/drops/${id}`);
    const dropObj = { ...data };
    delete dropObj.prendas;
    delete dropObj.stats;
    dropObj.fechaPublicacion = toDateInput(dropObj.fechaPublicacion);
    setDropOriginal(dropObj);
    setDropDraft(dropObj);
    const prendas = (data.prendas || []).map((p) => ({
      ...p,
      fechaCompra: toDateInput(p.fechaCompra),
      fechaVenta: toDateInput(p.fechaVenta),
    }));
    console.log(data);
    setPrendasOriginal(prendas);
    setPrendasDraft(prendas);
    setStats(data.stats);
    setPage(0);
  }

  useEffect(() => {
    loadDrops();
  }, []);
  useEffect(() => {
    loadDrop(selectedId);
  }, [selectedId]);

  const dropDirty =
    dropDraft && dropOriginal
      ? Object.keys(diff(dropOriginal, dropDraft, DROP_FIELDS)).length > 0
      : false;

  const dirtyPrendas = useMemo(() => {
    const map = new Map(prendasOriginal.map((p) => [p._id, p]));
    return prendasDraft.filter((p) => {
      const o = map.get(p._id);
      return o && Object.keys(diff(o, p, PRENDA_FIELDS)).length > 0;
    });
  }, [prendasOriginal, prendasDraft]);

  const anyDirty = dropDirty || dirtyPrendas.length > 0;

  function updatePrenda(id, field, value) {
    setPrendasDraft((prev) =>
      prev.map((p) => (p._id === id ? { ...p, [field]: value } : p)),
    );
  }

  async function save() {
    setSaving(true);
    try {
      if (dropDirty) {
        const patch = diff(dropOriginal, dropDraft, DROP_FIELDS);
        await api.patch(`/drops/${dropDraft._id}`, patch);
      }
      const origMap = new Map(prendasOriginal.map((p) => [p._id, p]));
      for (const p of dirtyPrendas) {
        const patch = diff(origMap.get(p._id), p, PRENDA_FIELDS);
        await api.patch(`/prendas/${p._id}`, patch);
      }
      await loadDrop(selectedId);
      await loadDrops();
      setToast({ severity: "success", msg: "Cambios guardados" });
    } catch (e) {
      setToast({
        severity: "error",
        msg: e.response?.data?.error || "Error al guardar",
      });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setDropDraft(dropOriginal);
    setPrendasDraft(prendasOriginal);
  }

  async function createDrop() {
    try {
      const payload = {
        ...newDrop,
        gastosPublicidad: Number(newDrop.gastosPublicidad) || 0,
      };
      const { data } = await api.post("/drops", payload);
      setNewDropOpen(false);
      setNewDrop({ nombre: "", descripcion: "", fechaPublicacion: "", gastosPublicidad: "" });
      await loadDrops();
      setSelectedId(data._id);
    } catch (e) {
      setToast({ severity: "error", msg: e.response?.data?.error || "Error" });
    }
  }

  const sorted = useMemo(() => {
    const arr = [...prendasDraft];
    arr.sort((a, b) => {
      const av = a[sortBy] ?? "";
      const bv = b[sortBy] ?? "";
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [prendasDraft, sortBy, sortDir]);

  const showPagination = prendasDraft.length > 25;
  const paged = showPagination
    ? sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sorted;

  const columns = [
    { key: "nombre", label: "Nombre", kind: "text", width: '256px' },
    { key: "tipo", label: "Tipo", kind: "select", opts: TIPOS },
    { key: "talla", label: "Talla", kind: "text" },
    { key: "precioCompra", label: "Compra", kind: "number" },
    { key: "precioVenta", label: "Venta", kind: "number" },
    {
      key: "estadoFisico",
      label: "Estado",
      kind: "select",
      opts: ESTADOS_FISICO,
    },
    {
      key: "estadoVenta",
      label: "Disponibilidad",
      kind: "select",
      opts: ESTADOS_VENTA,
    },
    { key: "fechaCompra", label: "F. compra", kind: "date" },
    { key: "fechaVenta", label: "F. venta", kind: "date" },
  ];

  function handleSort(col) {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  return (
    <>
      <Nav onNewDrop={() => {
        if(location.pathname === '/') {
          setNewDropOpen(true);
        } else {
          navigate(`/`);
        }
      }} />
      <Container maxWidth="xl" sx={{ py: 3, pb: 12 }}>
        <Stack
          direction={{ xs: "column", md: "column" }}
          spacing={2}
          sx={{ mb: 2 }}
          alignItems="flex-start"
        >
          <FormControl sx={{ width: '100%' }}>
            <InputLabel>Drop</InputLabel>
            <Select
              value={selectedId}
              label="Drop"
              onChange={(e) => setSelectedId(e.target.value)}
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

          {stats && (
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Resumen del drop
                </Typography>
                <Stack
                  direction="row"
                  spacing={4}
                  flex={1}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ganancia
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      ${stats.totalGanado}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Vendido
                    </Typography>
                    <Typography variant="h6">${stats.totalVendido}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Vendidas
                    </Typography>
                    <Typography variant="h6">
                      {stats.prendasVendidas || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Disponibles
                    </Typography>
                    <Typography variant="h6">
                      {stats.prendasDisponibles || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Reservadas
                    </Typography>
                    <Typography variant="h6">
                      {stats.prendasReservadas || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Gastos de publicidad
                    </Typography>
                    <Typography variant="h6">${stats.gastosPublicidad || 0}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>

        {dropDraft && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Datos del drop
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="body2">Nombre</Typography>
                  <Typography variant="body1">{dropDraft.nombre}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="body2">Descripción</Typography>
                  <Typography variant="body1">
                    {dropDraft.descripcion}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="body2">Fecha de publicación</Typography>
                  <Typography variant="body1">
                    {new Date(dropDraft.fechaPublicacion).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Paper>
        )}

        <Paper sx={{ overflowX: "auto" }}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </Box>
          ) : prendasDraft.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
              Este drop no tiene prendas.
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {columns.map((c) => (
                      <TableCell
                        key={c.key}
                        sortDirection={sortBy === c.key ? sortDir : false}
                      >
                        <TableSortLabel
                          active={sortBy === c.key}
                          direction={sortBy === c.key ? sortDir : "asc"}
                          onClick={() => handleSort(c.key)}
                        >
                          {c.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.map((p) => (
                    <TableRow key={p._id} hover>
                      {columns.map((c) => (
                        <TableCell key={c.key}>
                          {c.kind === "select" ? (
                            <Select
                              size="small"
                              value={p[c.key] || ""}
                              onChange={(e) =>
                                updatePrenda(p._id, c.key, e.target.value)
                              }
                              fullWidth
                            >
                              {c.opts.map((o) => (
                                <MenuItem key={o} value={o}>
                                  {o}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField
                              style={{ width: c.width || 'auto' }}
                              variant="filled"
                              type={
                                c.kind === "number"
                                  ? "number"
                                  : c.kind === "date"
                                    ? "date"
                                    : "text"
                              }
                              value={p[c.key] ?? ""}
                              onChange={(e) => {
                                const v =
                                  c.kind === "number"
                                    ? e.target.value === ""
                                      ? ""
                                      : Number(e.target.value)
                                    : e.target.value;
                                updatePrenda(p._id, c.key, v);
                              }}
                              disabled={
                                c.key === "fechaVenta" &&
                                p.estadoVenta !== "vendido"
                              }
                              InputLabelProps={
                                c.kind === "date" ? { shrink: true } : undefined
                              }
                              fullWidth
                              sx={{
                                "& .MuiFilledInput-input": {
                                  padding: "2px",
                                },
                              }}
                            />
                          )}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setToDelete(p)}
                          aria-label="eliminar"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {showPagination && (
                <TablePagination
                  component="div"
                  count={sorted.length}
                  page={page}
                  onPageChange={(_, p) => setPage(p)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(+e.target.value);
                    setPage(0);
                  }}
                  rowsPerPageOptions={[25, 50, 100]}
                />
              )}
            </>
          )}
        </Paper>
      </Container>

      <Slide direction="up" in={anyDirty} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            zIndex: 1200,
          }}
        >
          <Typography
            sx={{ flexGrow: 1, alignSelf: "center" }}
            color="text.secondary"
          >
            {dirtyPrendas.length} prenda(s) con cambios{" "}
            {dropDirty && "+ drop modificado"}
          </Typography>
          <Button onClick={discard} disabled={saving}>
            Descartar
          </Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </Paper>
      </Slide>

      <Dialog
        open={newDropOpen}
        onClose={() => setNewDropOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nuevo drop</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={newDrop.nombre}
              onChange={(e) =>
                setNewDrop({ ...newDrop, nombre: e.target.value })
              }
              fullWidth
              autoFocus
            />
               <TextField
              label="Gastos de publicidad"
              type="number"
              value={newDrop.gastosPublicidad}
              onChange={(e) =>
                setNewDrop({ ...newDrop, gastosPublicidad: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Descripcion"
              value={newDrop.descripcion}
              onChange={(e) =>
                setNewDrop({ ...newDrop, descripcion: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Fecha publicacion"
              type="date"
              value={newDrop.fechaPublicacion}
              onChange={(e) =>
                setNewDrop({ ...newDrop, fechaPublicacion: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewDropOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={createDrop}
            disabled={!newDrop.nombre || !newDrop.fechaPublicacion}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar prenda</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Seguro que quieres eliminar{" "}
            <strong>{toDelete?.nombre}</strong>? Esta accion no se puede
            deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deletePrenda(toDelete._id)}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
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
