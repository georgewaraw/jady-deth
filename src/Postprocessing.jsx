import { ChromaticAberration, EffectComposer, Noise, Scanline } from "@react-three/postprocessing";

export const Postprocessing = () => (
	<EffectComposer>
		<Scanline density={ 2 } />
		<ChromaticAberration offset={[ 0.002, 0.002 ]} />
		<Noise opacity={ 100 } />
	</EffectComposer>
);
