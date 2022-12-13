import { useCallback, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PositionalAudio, useFBX } from "@react-three/drei";
import { AnimationMixer, Color, NearestFilter } from "three";
import { Text } from "./Text.jsx";

import deth_idle_fbx from "./assets/deth_idle.fbx";
import deth_punch_fbx from "./assets/deth_punch.fbx";
import deth_kick_fbx from "./assets/deth_kick.fbx";

import deth_punch_mp3 from "./assets/deth_punch.mp3";
import deth_kick_mp3 from "./assets/deth_kick.mp3";
import deth_hit_mp3 from "./assets/deth_hit.mp3";

export function Deth() {

	const deth = useFBX( deth_idle_fbx );

	const [ mixer ] = useState( new AnimationMixer(deth) );
	const [ clips ] = useState({
		idle: deth.animations[ 0 ],
		punch: useFBX( deth_punch_fbx ).animations[ 0 ],
		kick: useFBX( deth_kick_fbx ).animations[ 0 ]
	});
	const [ animations ] = useState({
		idle: mixer.clipAction( clips.idle ),
		punch: mixer.clipAction( clips.punch ),
		kick: mixer.clipAction( clips.kick )
	});

	const [ audios ] = useState({
		punch: useRef(),
		kick: useRef(),
		hit: useRef()
	});

	const attacks = useRef([]);

	const [ score, setScore ] = useState( 0 );
	const { scene } = useThree();

	const attack = useCallback( function () {

		const jady = scene.getObjectByName( "jady" );

		if(
			score < 100 &&
			!jady.userData.won
		) {

			let [ attack_0, attack_1 ] = attacks.current;

			if( attack_0 === attack_1 ) attack_0 = ( attack_1 === "punch" ) ? "kick" : "punch";
			else attack_0 = ( Math.random() < 0.5 ) ? "punch" : "kick";

			attacks.current = [ attack_1, attack_0 ];

			const length = 0.5;
			const duration = clips[ attack_0 ].duration - length;

			animations[ attack_0 ].reset();
			animations.idle.crossFadeTo( animations[attack_0], length, true );
			animations[ attack_0 ].play();

			if( audios[attack_0].current.isPlaying ) audios[ attack_0 ].current.stop();
			audios[ attack_0 ].current.play();

			setTimeout(
				function () {

					if( !jady.userData.sidestepping ) {

						const increment = ( attack_0 === "punch" ) ? 30 : 40;
						setScore( (score) => score + increment );

						if( audios.hit.current.isPlaying ) audios.hit.current.stop();
						audios.hit.current.play();
					}
				},
				duration * 400
			);
			setTimeout(
				() => deth.userData.attacking = true,
				duration * 600
			);
			setTimeout(
				function () {

					animations.idle.reset();
					animations[ attack_0 ].crossFadeTo( animations.idle, length, true );

					deth.userData.attacking = false;
				},
				duration * 1000
			);
		}
	}, [animations, audios, clips, deth, scene, score] );

	useEffect( function () {

		for( const child of deth.children ) {

			if( child.isSkinnedMesh ) {

				const { material } = child;
				const { map } = material;

				child.castShadow = true;
				child.receiveShadow = true;

				material.color = new Color( 0x222222 );
				if( map ) {

					map.magFilter = NearestFilter;
					map.minFilter = NearestFilter;
				}
			}
		}

		animations.idle.play();
		const interval = setInterval( attack, 5000 );

		return () => clearInterval( interval );
	}, [animations, attack, deth] );

	useEffect( function () {

		let count = 0;

		function pointerUpCallback() {

			if( score >= 100 ) {

				if( count ) window.location.reload();
				count += 1;
			}
		}
		function keyUpCallback() {

			if( score >= 100 ) {

				if( count ) window.location.reload();
				count += 1;
			}
		}

		window.addEventListener( "pointerup", pointerUpCallback );
		window.addEventListener( "keyup", keyUpCallback );

		return function () {

			window.removeEventListener( "pointerup", pointerUpCallback );
			window.removeEventListener( "keyup", keyUpCallback );
		}
	}, [score] );

	useFrame( (_, delta) => mixer.update(delta) );

	return (<>
		<primitive
			object={ deth }
			name="deth"
			scale={ 0.0015 }
			rotation-y={ 270 * Math.PI / 180 }
			position={[ 1.025, -0.35, 0 ]}
		>
			<PositionalAudio
				ref={ audios.punch }
				url={ deth_punch_mp3 }
				loop={ false }
			/>
			<PositionalAudio
				ref={ audios.kick }
				url={ deth_kick_mp3 }
				loop={ false }
			/>
			<PositionalAudio
				ref={ audios.hit }
				url={ deth_hit_mp3 }
				loop={ false }
				onUpdate={ (audio) => audio.setVolume(0.75) }
			/>
		</primitive>
		{ (score < 100)
			? (
				<Text
					content={ ("00" + score).slice(-2) }
					color="darkgreen"
					size={ 1 }
					position={[ 1.025, 4, 0 ]}
					spinning
				/>
			)
			: (
				<Text
					content={ "DethDethDeth\nDethDethDeth\nDethDethDeth" }
					color="purple"
					size={ 2 }
					position={[ 0, 2, 0 ]}
					spinning
				/>
			)
		}
	</>);

}
