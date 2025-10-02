import React from "react";
import styles from "./ClienteDashboard.module.css";

export default function ClienteDashboard() {
  return (
    <main className={styles.main}>
      {/* 2) Gráfico de Água (barras CSS) */}
      <section className={styles["chart-card"]} aria-labelledby="titulo-agua">
        <h2 id="titulo-agua">Gráfico de Consumo de Água</h2>
        <div
          className={styles.bars}
          role="img"
          aria-label="Consumo de água semanal em ml — gráfico estático"
        >
          <div className={styles.bar}>
            <div className={styles.track}>
              <span className={styles.fill} style={{ height: "87%" }}></span>
            </div>
            <b>2000 ml</b>
          </div>
          <div className={styles.bar}>
            <div className={styles.track}>
              <span className={styles.fill} style={{ height: "78.3%" }}></span>
            </div>
            <b>1800 ml</b>
          </div>
          <div className={styles.bar}>
            <div className={styles.track}>
              <span className={styles.fill} style={{ height: "95.7%" }}></span>
            </div>
            <b>2200 ml</b>
          </div>
          <div className={styles.bar}>
            <div className={styles.track}>
              <span className={styles.fill} style={{ height: "91.3%" }}></span>
            </div>
            <b>2100 ml</b>
          </div>
          <div className={styles.bar}>
            <div className={styles.track}>
              <span className={styles.fill} style={{ height: "82.6%" }}></span>
            </div>
            <b>1900 ml</b>
          </div>
          <div className={styles.bar}>
            <div className={styles.track}>
              <span className={styles.fill} style={{ height: "100%" }}></span>
            </div>
            <b>2300 ml</b>
          </div>
          <div className={styles.bar}>
            <div className={styles.track}>
              <span className={styles.fill} style={{ height: "87%" }}></span>
            </div>
            <b>2000 ml</b>
          </div>
        </div>
      </section>

      {/* 3) Gráfico de Proteínas (donut via CSS conic-gradient) */}
      <section className={styles["chart-card"]} aria-labelledby="titulo-prot">
        <h2 id="titulo-prot">Gráfico de Macros</h2>
        <div className={styles["donut-wrap"]}>
          <div
            className={styles.donut}
            role="img"
            aria-label="Distribuição de proteínas — Proteínas, Carboidratos, Gorduras"
          ></div>
          <div className={styles.legend} aria-hidden="false">
            <div className={styles.item}>
              <span
                className={styles.swatch}
                style={{ background: "#f94144" }}
              ></span>{" "}
              Proteínas — 35%
            </div>
            <div className={styles.item}>
              <span
                className={styles.swatch}
                style={{ background: "#f8961e" }}
              ></span>{" "}
              Carboidratos — 50%
            </div>
            <div className={styles.item}>
              <span
                className={styles.swatch}
                style={{ background: "#577590" }}
              ></span>{" "}
              Gorduras — 15%
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}