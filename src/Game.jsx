import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PositionalAudio } from "@react-three/drei";
import { BasicShadowMap } from "three";
import { Camera } from "./Camera.jsx";
import { Postprocessing } from "./Postprocessing.jsx";
import { Stage } from "./Stage.jsx";
import { Jady } from "./Jady.jsx";
import { Deth } from "./Deth.jsx";

import music_mp3 from "./assets/music.mp3";

export function Game() {

	const [ playing, setPlaying ] = useState( false );
	const music = useRef();

	return (
		<Suspense fallback={ <div>loading</div> }>
			<Canvas
				dpr={ 0.6 / window.devicePixelRatio }
				gl={{ antialias: false }}
				shadows={{ type: BasicShadowMap }}
				onPointerDown={ function () {

					setPlaying( true );
					if( !music.current.isPlaying ) music.current.play();
				} }
			>
				<Camera active={ playing } />
				<Postprocessing />
				<ambientLight color="plum" />
				<Stage />
				{ playing && (<>
					<Jady />
					<Deth />
				</>) }
				<PositionalAudio
					ref={ music }
					url={ music_mp3 }
				/>
			</Canvas>
		</Suspense>
	);

}
