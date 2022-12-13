import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CameraShake } from "@react-three/drei";
import { Text } from "./Text.jsx";
/*
	active BOOLEAN
*/
export function Camera({ active }) {

	const pivot = useRef();

	useFrame( (_, delta) => pivot.current.rotation.y += delta / 100 );

	return (
		<group
			ref={ pivot }
			name="pivot"
			position-y={ 2 }
		>
			<primitive object={ useThree().camera } />
			<CameraShake
				maxYaw={ 0.01 }
				maxPitch={ 0.01 }
				maxRoll={ 0 }
				yawFrequency={ 0.2 }
				pitchFrequency={ 0.2 }
			/>
			{ !active && (
				<Text
					content={ "Jady\nDeth" }
					color="red"
					size={ 0.3 }
					position={[ 0, 0, 4 ]}
				/>
			) }
		</group>
	);

}
