import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshWobbleMaterial, Text3D } from "@react-three/drei";
import { AlwaysDepth } from "three";

import font_json from "./assets/font.json";
/*
	content STRING
	color STRING
	size NUMBER
	position ARRAY
		0 NUMBER
		1 NUMBER
		2 NUMBER
	spinning BOOLEAN
*/
export function Text({ content, color, size, position, spinning }) {

	const text = useRef();

	useFrame( function (_, delta) {

		if( spinning ) text.current.rotation.y += delta;
	} );

	return (
		<Text3D
			ref={ text }
			font={ font_json }
			size={ size }
			height={ 0.1 }
			position={ position }
			onUpdate={ ({ geometry }) => geometry.center() }
		>
			{ content }
			<MeshWobbleMaterial
				factor={ 0.2 }
				speed={ 0.8 }
				depthFunc={ AlwaysDepth }
				color={ color }
			/>
		</Text3D>
	);

}
