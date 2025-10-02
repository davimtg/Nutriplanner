import React from "react";
import ListaPacientes from "./ListaPacientes/ListaPacientes.js";
import ListaPlanos from "./ListaPlanos/ListaPlanos.js";

export default function DashboardNutricionista(props) {
  return (
    <>
      <main>
        <ListaPacientes pacientes={props.pacientes}/>
        <ListaPlanos planos={props.planos}/>
      </main>
    </>
  );
}
