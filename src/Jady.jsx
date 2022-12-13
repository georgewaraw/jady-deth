import { useCallback, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PositionalAudio, useFBX } from "@react-three/drei";
import { AnimationMixer, Color, NearestFilter } from "three";
import { damp } from "maath/easing";
import { Text } from "./Text.jsx";

import jady_idle_fbx from "./assets/jady_idle.fbx";
import jady_punch_left_fbx from "./assets/jady_punch_left.fbx";
import jady_punch_right_fbx from "./assets/jady_punch_right.fbx";
import jady_kick_left_fbx from "./assets/jady_kick_left.fbx";
import jady_kick_right_fbx from "./assets/jady_kick_right.fbx";

import jady_punch_left_mp3 from "./assets/jady_punch_left.mp3";
import jady_punch_right_mp3 from "./assets/jady_punch_right.mp3";
import jady_kick_left_mp3 from "./assets/jady_kick_left.mp3";
import jady_kick_right_mp3 from "./assets/jady_kick_right.mp3";
import jady_hit_mp3 from "./assets/jady_hit.mp3";
import jady_sidestep_mp3 from "./assets/jady_sidestep.mp3";

export function Jady() {

	const jady = useFBX( jady_idle_fbx );

	const [ mixer ] = useState( new AnimationMixer(jady) );
	const [ clips ] = useState({
		idle: jady.animations[ 0 ],
		punch_left: useFBX( jady_punch_left_fbx ).animations[ 0 ],
		punch_right: useFBX( jady_punch_right_fbx ).animations[ 0 ],
		kick_left: useFBX( jady_kick_left_fbx ).animations[ 0 ],
		kick_right: useFBX( jady_kick_right_fbx ).animations[ 0 ]
	});
	const [ animations ] = useState({
		idle: mixer.clipAction( clips.idle ),
		punch_left: mixer.clipAction( clips.punch_left ),
		punch_right: mixer.clipAction( clips.punch_right ),
		kick_left: mixer.clipAction( clips.kick_left ),
		kick_right: mixer.clipAction( clips.kick_right )
	});

	const [ audios ] = useState({
		punch_left: useRef(),
		punch_right: useRef(),
		kick_left: useRef(),
		kick_right: useRef(),
		hit: useRef(),
		sidestep: useRef()
	});

	const [ timeouts ] = useState({
		animations: useRef(),
		audios: useRef()
	});

	const [ score, setScore ] = useState( 0 );
	const { scene } = useThree();

	const act = useCallback( function (action) {

		if( !jady.userData.sidestepping ) {

			if(
				action === "sidestep" &&
				!animations.punch_left.isRunning() &&
				!animations.punch_right.isRunning() &&
				!animations.kick_left.isRunning() &&
				!animations.kick_right.isRunning()
			) {

				jady.userData.sidestepping = true;
				setTimeout( () => jady.userData.sidestepping = false, 1000 );

				if( audios.sidestep.current.isPlaying ) audios.sidestep.current.stop();
				audios.sidestep.current.play();
			}
			else if(
				!animations[ action ].isRunning() &&
				(
					(
						action === "punch_left" &&
						!animations.punch_right.isRunning() &&
						!animations.kick_left.isRunning() &&
						!animations.kick_right.isRunning()
					) ||
					(
						action === "punch_right" &&
						!animations.kick_left.isRunning() &&
						!animations.kick_right.isRunning()
					) ||
					(
						action === "kick_left" &&
						!animations.kick_right.isRunning()
					) ||
					action === "kick_right"
				)
			) {

				for( const animation of Object.values(animations) ) {

					if( animation.isRunning() ) {

						animations[ action ].reset();
						animation.crossFadeTo( animations[action], 0.35, true );
						animations[ action ].play();

						clearTimeout( timeouts.animations.current );
						timeouts.animations.current = setTimeout(
							function () {

								animations.idle.reset();
								animation.crossFadeTo( animations.idle, 0.35, true );
							},
							(clips[action].duration - 0.35) * 1000
						);

						if( audios[action].current.isPlaying ) audios[ action ].current.stop();
						audios[ action ].current.play();

						clearTimeout( timeouts.audios.current );
						timeouts.audios.current = setTimeout(
							function () {

								const deth = scene.getObjectByName( "deth" );

								if( !deth.userData.attacking ) {

									if( audios.hit.current.isPlaying ) audios.hit.current.stop();
									audios.hit.current.play();

									if( action === "punch_left" ) setScore( (score) => score + 5 );
									else if( action === "punch_right" ) setScore( (score) => score + 7 );
									else if( action === "kick_left" ) setScore( (score) => score + 9 );
									else if( action === "kick_right" ) setScore( (score) => score + 11 );
								}
							},
							clips[ action ].duration * 300
						);
					}
				}
			}
		}
	}, [animations, audios, clips, jady, scene, timeouts] );

	useEffect( function () {

		for( const child of jady.children ) {

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

		jady.userData.sidestepping = false;

		animations.idle.play();
	}, [animations, jady] );

	useEffect( function () {

		let count = 0;

		function pointerUpCallback() {

			if( jady.userData.won ) {

				if( count ) window.location.reload();
				count += 1;
			}
		}
		function touchEndCallback( e ) {

			e.preventDefault();

			const x = e.changedTouches[ 0 ].clientX / window.innerWidth * 2 - 1;
			const y = e.changedTouches[ 0 ].clientY / window.innerHeight * -2 + 1;

			if( x < -0.2 && y > 0.2 ) act( "punch_left" );
			else if( x > 0.2 && y > 0.2 ) act( "punch_right" );
			else if( x < -0.2 && y < -0.2 ) act( "kick_left" );
			else if( x > 0.2 && y < -0.2 ) act( "kick_right" );
			else act( "sidestep" );
		}
		function keyUpCallback( e ) {

			if( jady.userData.won ) {

				if( count ) window.location.reload();
				count += 1;
			}
			else if(
				e.code === "KeyQ" ||
				e.code === "KeyE" ||
				e.code === "KeyT" ||
				e.code === "KeyU"
			) {

				e.preventDefault();
				act( "punch_left" );
			}
			else if(
				e.code === "KeyW" ||
				e.code === "KeyR" ||
				e.code === "KeyY" ||
				e.code === "KeyI"
			) {

				e.preventDefault();
				act( "punch_right" );
			}
			else if(
				e.code === "KeyA" ||
				e.code === "KeyD" ||
				e.code === "KeyG" ||
				e.code === "KeyJ"
			) {

				e.preventDefault();
				act( "kick_left" );
			}
			else if(
				e.code === "KeyS" ||
				e.code === "KeyF" ||
				e.code === "KeyH" ||
				e.code === "KeyK"
			) {

				e.preventDefault();
				act( "kick_right" );
			}
			else if( e.code === "Space" ) {

				e.preventDefault();
				act( "sidestep" );
			}
		}

		window.addEventListener( "pointerup", pointerUpCallback );
		window.addEventListener( "touchend", touchEndCallback );
		window.addEventListener( "keyup", keyUpCallback );

		return function () {

			window.removeEventListener( "pointerup", pointerUpCallback );
			window.removeEventListener( "touchend", touchEndCallback );
			window.removeEventListener( "keyup", keyUpCallback );
		}
	}, [act, jady] );

	useFrame( function (_, delta) {

		const deth = scene.getObjectByName( "deth" );

		jady.lookAt( deth.position );

		if( jady.userData.sidestepping ) damp( jady.position, "z", -1.5, 0.75, delta );
		else damp( jady.position, "z", 0, 0.75, delta );

		if( score >= 100 ) jady.userData.won = true;

		mixer.update( delta );
	} );

	return (<>
		<primitive
			object={ jady }
			name="jady"
			scale={ 0.0015 }
			rotation-y={ 90 * Math.PI / 180 }
			position={[ -1.025, -0.35, 0 ]}
		>
			<PositionalAudio
				ref={ audios.punch_left }
				url={ jady_punch_left_mp3 }
				loop={ false }
			/>
			<PositionalAudio
				ref={ audios.punch_right }
				url={ jady_punch_right_mp3 }
				loop={ false }
			/>
			<PositionalAudio
				ref={ audios.kick_left }
				url={ jady_kick_left_mp3 }
				loop={ false }
			/>
			<PositionalAudio
				ref={ audios.kick_right }
				url={ jady_kick_right_mp3 }
				loop={ false }
			/>
			<PositionalAudio
				ref={ audios.hit }
				url={ jady_hit_mp3 }
				loop={ false }
				onUpdate={ (audio) => audio.setVolume(0.75) }
			/>
			<PositionalAudio
				ref={ audios.sidestep }
				url={ jady_sidestep_mp3 }
				loop={ false }
			/>
		</primitive>
		{ (score < 100)
			? (
				<Text
					content={ ("00" + score).slice(-2) }
					color="darkgreen"
					size={ 1 }
					position={[ -1.025, 4, 0 ]}
					spinning
				/>
			)
			: (
				<Text
					content={ "JadyJadyJady\nJadyJadyJady\nJadyJadyJady" }
					color="blue"
					size={ 2 }
					position={[ 0, 2, 0 ]}
					spinning
				/>
			)
		}
	</>);

}
