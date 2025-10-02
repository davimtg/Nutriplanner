import styles from "./Receitas.module.css";

export default function Receitas() {
    return (
        <>
            <div className={styles["receitas"]}>
                <input type="text" id={styles["receitas-query"]} placeholder="Digite um alimento ou receita..."/>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles["receitas-search"]}><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
            </div>

            <p className={styles["receitas-title"]}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6.528V3a1 1 0 0 1 1-1h0"/><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"/></svg>
                Alimentos
            </p>
            <div className={styles["receitas-table"]}>
                <div className={styles["receitas-item"]}>
                    <img src="https://m.ftscrt.com/food/9d4d0c56-4852-432a-83e5-b4c24d686d1f.jpg" className={styles["receitas-item__img"]}></img>
                    <div className={styles["receitas-item__infos"]}> 
                        <div className={styles["receitas-item__subinfos"]}>
                            <p className={styles["receitas-item__title"]}>Macarrão</p>
                            <span className={styles["receitas-item__subtitle"]}></span>
                        </div>
                        <span className={styles["receitas-item__subtitle"]}>por 100 g - Calorias: 157kcal | Gord: 0,92g | Carbs: 30,68g | Prot: 5,76g </span>
                    </div>
                </div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
            </div>

            <p className={styles["receitas-title"]}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M7 21h10"/><path d="M19.5 12 22 6"/><path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62"/><path d="M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62"/><path d="M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62"/></svg>
                Receitas
            </p>
            <div className={styles["receitas-table"]}>
                <div className={styles["receitas-item"]}>
                    <img src="https://m.ftscrt.com/static/recipe/c2448413-b44b-49bd-84c9-4020282b2b60.jpg" className={styles["receitas-item__img"]}></img>
                    <div className={styles["receitas-item__infos"]}> 
                        <div className={styles["receitas-item__subinfos"]}>
                            <p className={styles["receitas-item__title"]}>Macarrão Energia</p>
                            <span className={styles["receitas-item__subtitle"]}>Macarrão leve e rápido de fazer. </span>
                        </div>
                        <span className={styles["receitas-item__subtitle"]}>por porção - Calorias: 595kcal | Gord: 23,01g | Carbs: 82,82g | Prot: 16,84g</span>
                    </div>
                </div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
                <div className={styles["receitas-item"]}></div>
            </div>
        </>
    );
}