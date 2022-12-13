import { useGLTF } from "@react-three/drei";
import { NearestFilter } from "three";

import stage_glb from "./assets/stage.glb";

export const Stage = () => (
	<primitive
		object={ useGLTF(stage_glb).scene }
		onUpdate={ function ({ children }) {

			for( const child of children ) {

				if( child.isMesh ) {

					const { map } = child.material;

					child.castShadow = true;
					child.receiveShadow = true;

					map.magFilter = NearestFilter;
					map.minFilter = NearestFilter;
				}
			}
		} }
		scale={[ 3, 6, 3 ]}
	>
		<pointLight
			args={[ "plum", 1, 30 ]}
			castShadow
			position-y={ 3 }
		/>
	</primitive>
);
