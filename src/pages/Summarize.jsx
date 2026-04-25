import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Skeleton,
} from "@mui/material";
import ReactECharts from "echarts-for-react";
import api from "../api.js";
import Nav from "../components/Nav.jsx";
import { useNavigate } from "react-router-dom";
import { formatNumberToCurrency } from "../utils/utils.ts";

export default function Summarize() {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    api.get("/drops").then(({ data }) => {
      setDrops(data);
      setLoading(false);
    });
  }, []);

  const bestDrop = useMemo(() => {
    if (!drops.length) return null;
    let best = null;
    let maxGanado = -Infinity;
    for (const d of drops) {
      const ganado = d.stats?.totalGanado ?? 0;
      if (ganado > maxGanado) {
        best = d;
        maxGanado = ganado;
      }
    }
    return best;
  }, [drops]);

  const totals = useMemo(() => {
    let vendido = 0;
    let ganado = 0;
    let gastadoEnPublicidad = 0;
    for (const d of drops) {
      vendido += d.stats?.totalVendido || 0;
      ganado += d.stats?.totalGanado || 0;
      gastadoEnPublicidad += d.stats.gastosPublicidad || 0;
    }
    const gastado = vendido - ganado;
    return { gastado, ganado, vendido, gastadoEnPublicidad };
  }, [drops]);

  const pieOption = {
    tooltip: {
      trigger: "item",
      formatter: ({ name, value, percent }) =>
        `${name}: ${formatNumberToCurrency(value)} (${percent}%)`,
    },
    legend: { bottom: 0 },
    series: [
      {
        name: "Distribucion",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: {
          show: true,
          formatter: ({ name, value }) =>
            `${name}\n${formatNumberToCurrency(value)}`,
        },
        data: [
          {
            value: totals.gastado,
            name: "Gastado en prendas",
            itemStyle: { color: "#ef5350" },
          },
          {
            value: totals.ganado,
            name: "Ganancia neta",
            itemStyle: { color: "#66bb6a" },
          },
          {
            value: totals.gastadoEnPublicidad,
            name: "Gastos de publicidad",
            itemStyle: { color: "#ffa726" },
          },
        ],
      },
    ],
  };

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
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Resumen global
        </Typography>

        {loading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : (
          <>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mb: 3 }}
            >
              {bestDrop && (
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      Mejor drop
                    </Typography>
                    <Typography variant="body1">
                      {bestDrop.nombre} -{" "}
                      {new Date(bestDrop.fechaPublicacion).toLocaleDateString()}
                      : <br />{" "}
                      <b>
                        {formatNumberToCurrency(bestDrop.stats?.totalGanado)}
                      </b>
                    </Typography>
                  </CardContent>
                </Card>
              )}
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    Total gastado
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {formatNumberToCurrency(totals.gastado)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Costo de prendas vendidas
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    Total ganado
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {formatNumberToCurrency(totals.ganado)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Utilidad neta
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    Total gastado en publicidad
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {formatNumberToCurrency(totals.gastadoEnPublicidad)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Gastos de publicidad
                  </Typography>
                </CardContent>
              </Card>
            </Stack>

            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Distribucion de ingresos (
                  {formatNumberToCurrency(totals.vendido)} total vendido)
                </Typography>
                <Box sx={{ height: 360 }}>
                  <ReactECharts
                    option={pieOption}
                    style={{ height: "100%", width: "100%" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </>
  );
}
