import React, { useState, useEffect } from "react";
import axios from "axios";
import BarcodeScanner from "./BarcodeScanner";
import "./App.css";

function App() {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  const [isColorBlindMode, setIsColorBlindMode] = useState(() => {
    const savedColorBlind = localStorage.getItem("colorBlindMode");
    return savedColorBlind === "true";
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    // Save theme preference and apply to body
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    // Save color blind mode preference and apply to body
    localStorage.setItem("colorBlindMode", isColorBlindMode.toString());
    document.body.classList.toggle("color-blind-mode", isColorBlindMode);
  }, [isColorBlindMode]);

  const saveToHistory = (productData) => {
    const newHistory = [productData, ...history.slice(0, 4)]; // Keep last 5
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const searchProduct = async (code) => {
    if (!code) return;
    setLoading(true);
    setError("");
    setProduct(null);
    try {
      let response;
      let productData;

      // Try Barcode Lookup API first (comprehensive database)
      try {
        response = await axios.get(
          `https://api.barcodelookup.com/v3/products?barcode=${code}&formatted=y&key=demo`
        );

        if (
          response.data &&
          response.data.products &&
          response.data.products.length > 0
        ) {
          const item = response.data.products[0];
          productData = {
            barcode: code,
            name: item.title || item.product_name || "Nome não disponível",
            description: item.description || "Descrição não disponível",
            price:
              item.stores && item.stores.length > 0
                ? item.stores
                    .map(
                      (store) => `${store.store_name}: ${store.price || "N/A"}`
                    )
                    .join(", ")
                : "Preço não disponível",
            image:
              item.images && item.images.length > 0 ? item.images[0] : null,
            brand: item.brand,
            model: item.model,
            color: item.color,
            size: item.size,
            weight: item.weight,
            category: item.category,
            manufacturer: item.manufacturer,
            stores: item.stores,
            source: "Barcode Lookup",
          };
        }
      } catch (barcodeErr) {
        console.log("Barcode Lookup failed, trying UPC Item DB...");

        // Fallback to UPC Item DB
        try {
          response = await axios.get(
            `https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`
          );

          if (
            response.data &&
            response.data.items &&
            response.data.items.length > 0
          ) {
            const item = response.data.items[0];
            productData = {
              barcode: code,
              name: item.title || "Nome não disponível",
              description: item.description || "Descrição não disponível",
              price: item.lowest_recorded_price
                ? `A partir de R$ ${item.lowest_recorded_price}`
                : item.offers && item.offers.length > 0
                ? `A partir de R$ ${item.offers[0].price || "N/A"}`
                : "Preço não disponível",
              image:
                item.images && item.images.length > 0 ? item.images[0] : null,
              brand: item.brand,
              model: item.model,
              color: item.color,
              size: item.size,
              weight: item.weight,
              category: item.category,
              offers: item.offers,
              source: "UPC Item DB",
            };
          }
        } catch (upcErr) {
          console.log("UPC Item DB failed, trying Open Food Facts...");

          // Fallback to Open Food Facts
          try {
            response = await axios.get(
              `https://world.openfoodfacts.org/api/v0/product/${code}.json`
            );

            if (response.data.status === 1) {
              const prod = response.data.product;
              productData = {
                barcode: code,
                name:
                  prod.product_name ||
                  prod.product_name_en ||
                  prod.product_name_fr ||
                  prod.product_name_pt ||
                  "Nome não disponível",
                description:
                  prod.ingredients_text ||
                  prod.ingredients_text_en ||
                  prod.generic_name ||
                  prod.generic_name_en ||
                  prod.categories ||
                  "Descrição não disponível",
                price:
                  prod.price ||
                  prod.price_usd ||
                  prod.prices?.[Object.keys(prod.prices || {})[0]]?.price ||
                  "Preço não disponível",
                image:
                  prod.image_url ||
                  prod.image_front_url ||
                  prod.image_front_small_url ||
                  null,
                brand: prod.brands,
                source: "Open Food Facts",
              };
            }
          } catch (offErr) {
            console.log("Open Food Facts also failed, trying Cosmos API...");

            // Final fallback to Cosmos API (Brazilian products)
            try {
              response = await axios.get(
                `https://cosmos.bluesoft.com.br/api/gtins/${code}.json`,
                {
                  headers: {
                    "User-Agent": "ConsulteJa-App/1.0",
                  },
                }
              );

              if (response.data && response.data.description) {
                productData = {
                  barcode: code,
                  name: response.data.description || "Nome não disponível",
                  description:
                    response.data.ncm?.description ||
                    response.data.gpc?.description ||
                    "Descrição não disponível",
                  price: "Preço não disponível",
                  image: response.data.thumbnail || null,
                  brand: response.data.brand || null,
                  gtin: response.data.gtin,
                  ncm: response.data.ncm?.code,
                  gpc: response.data.gpc?.description,
                  net_weight: response.data.net_weight,
                  gross_weight: response.data.gross_weight,
                  width: response.data.width,
                  height: response.data.height,
                  depth: response.data.depth,
                  source: "Cosmos",
                };
              }
            } catch (cosmosErr) {
              console.log("All APIs failed");
              throw cosmosErr;
            }
          }
        }
      }

      if (productData) {
        setProduct(productData);
        saveToHistory(productData);
      } else {
        setError(
          "Produto não encontrado. Verifique se o código de barras está correto e tente novamente."
        );
      }
    } catch (err) {
      console.error("API Error:", err);
      setError(
        "Erro ao consultar o produto. Verifique sua conexão com a internet e tente novamente."
      );
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchProduct(barcode);
  };

  const handleBarcodeDetected = (code) => {
    setBarcode(code);
    setShowScanner(false);
    searchProduct(code);
  };

  const handleHistoryClick = (item) => {
    setBarcode(item.barcode);
    setProduct(item);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleColorBlindMode = () => {
    setIsColorBlindMode(!isColorBlindMode);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container-fluid">
          <div className="header-content">
            <div className="header-buttons">
              <button
                className="theme-toggle-btn"
                onClick={toggleDarkMode}
                aria-label="Alternar tema"
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>
              <button
                className={`color-blind-toggle-btn ${
                  isColorBlindMode ? "active" : ""
                }`}
                onClick={toggleColorBlindMode}
                aria-label="Modo daltonismo"
              >
                {isColorBlindMode ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
            <h1 className="app-title">ConsulteJá</h1>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <section className="hero-section">
            <div className="hero-content">
              <h2>Consulta Rápida de Produtos</h2>
              <p>
                Descubra informações detalhadas sobre qualquer produto através
                do código de barras
              </p>
            </div>
          </section>

          <div className="search-section">
            <form onSubmit={handleSubmit}>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Digite o código de barras"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner me-2"></span>
                      Consultando...
                    </>
                  ) : (
                    "Consultar"
                  )}
                </button>
              </div>
            </form>
            <button
              className="btn btn-secondary"
              onClick={() => setShowScanner(!showScanner)}
            >
              {showScanner ? "Fechar Scanner" : "📷 Escanear Código de Barras"}
            </button>
            {showScanner && (
              <div className="scanner-container">
                <BarcodeScanner onDetected={handleBarcodeDetected} />
              </div>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {product && (
            <div className="result-section">
              <div className="product-card">
                <div className="product-image-container">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                  ) : (
                    <div
                      className="product-image-placeholder"
                      style={{
                        width: "280px",
                        height: "280px",
                        background:
                          "linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(30, 144, 255, 0.1))",
                        borderRadius: "15px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#8a2be2",
                        fontSize: "3rem",
                        fontFamily: "Orbitron, monospace",
                        fontWeight: "700",
                        border: "2px solid rgba(138, 43, 226, 0.3)",
                        boxShadow: "0 8px 25px rgba(138, 43, 226, 0.2)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          fontSize: "1.5rem",
                          opacity: 0.5,
                        }}
                      >
                        📦
                      </div>
                      <div
                        style={{
                          fontSize: "2.5rem",
                          marginBottom: "10px",
                        }}
                      >
                        📷
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontFamily: "Rajdhani, sans-serif",
                          fontWeight: "600",
                          color: "#34495e",
                          textAlign: "center",
                          lineHeight: "1.3",
                        }}
                      >
                        SEM
                        <br />
                        IMAGEM
                      </div>
                    </div>
                  )}
                </div>
                <div className="product-details">
                  <h5>Resultado da Consulta</h5>
                  <p>
                    <strong>Nome:</strong> {product.name}
                  </p>
                  {product.brand && (
                    <p>
                      <strong>Marca:</strong> {product.brand}
                    </p>
                  )}
                  <p>
                    <strong>Preço:</strong> {product.price}
                  </p>
                  <p>
                    <strong>Descrição:</strong> {product.description}
                  </p>
                  {product.ncm && (
                    <p>
                      <strong>NCM:</strong> {product.ncm}
                    </p>
                  )}
                  {product.gpc && (
                    <p>
                      <strong>Categoria:</strong> {product.gpc}
                    </p>
                  )}
                  {product.net_weight && (
                    <p>
                      <strong>Peso Líquido:</strong> {product.net_weight}
                    </p>
                  )}
                  {product.gross_weight && (
                    <p>
                      <strong>Peso Bruto:</strong> {product.gross_weight}
                    </p>
                  )}
                  {(product.width || product.height || product.depth) && (
                    <p>
                      <strong>Dimensões:</strong>{" "}
                      {product.width && `${product.width} x `}
                      {product.height && `${product.height} x `}
                      {product.depth && `${product.depth} cm`}
                    </p>
                  )}
                  <p>
                    <strong>Código de Barras:</strong> {product.barcode}
                  </p>
                  {product.model && (
                    <p>
                      <strong>Modelo:</strong> {product.model}
                    </p>
                  )}
                  {product.color && (
                    <p>
                      <strong>Cor:</strong> {product.color}
                    </p>
                  )}
                  {product.size && (
                    <p>
                      <strong>Tamanho:</strong> {product.size}
                    </p>
                  )}
                  {product.weight && (
                    <p>
                      <strong>Peso:</strong> {product.weight}
                    </p>
                  )}
                  {product.category && (
                    <p>
                      <strong>Categoria:</strong> {product.category}
                    </p>
                  )}
                  <p>
                    <strong>Fonte:</strong>{" "}
                    <span
                      style={{
                        background:
                          product.source === "Barcode Lookup"
                            ? "linear-gradient(45deg, #6366f1, #8b5cf6)"
                            : product.source === "UPC Item DB"
                            ? "linear-gradient(45deg, #ff6b6b, #ffa500)"
                            : product.source === "Open Food Facts"
                            ? "linear-gradient(45deg, #10b981, #34d399)"
                            : "linear-gradient(45deg, #8a2be2, #1e90ff)",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                      }}
                    >
                      {product.source}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="history-section">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Histórico de Consultas</h5>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={clearHistory}
                  style={{
                    fontFamily: "Rajdhani, sans-serif",
                    fontWeight: "600",
                    borderRadius: "10px",
                    padding: "8px 16px",
                    transition: "all 0.3s ease",
                  }}
                >
                  🗑️ Limpar Histórico
                </button>
              </div>
              <ul className="list-group history-list">
                {history.map((item, index) => (
                  <li
                    key={index}
                    className="list-group-item list-group-item-action"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{item.name}</strong>
                        <br />
                        <small className="text-muted">
                          Código: {item.barcode}
                        </small>
                      </div>
                      <span className="badge bg-primary rounded-pill">
                        {index + 1}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>
            &copy; 2024 ConsulteJá - Consulta rápida de produtos por código de
            barras
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
