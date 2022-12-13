import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Game } from "./Game.jsx";

createRoot( document.querySelector("div") ).render(
	<StrictMode>
		<Game />
	</StrictMode>
);
