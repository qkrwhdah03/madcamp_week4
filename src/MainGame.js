import './MainGame.css'
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";

function MainGame() {
    const {state} = useLocation();
    const nickname = state?.nickname;
    const [myId, setMyId] = useState(null);
    const canvasRef = useRef(null); // canvas 
   // const users = useRef([]);
    const get_player = useRef({});
    const socket = useRef(null);

    // 키보드 입력 상태 받기
    const pressDown = useRef(false);
    const pressUp  =  useRef(false);
    const pressLeft  =  useRef(false);
    const pressRight  =  useRef(false);

    let velocity = 4;

    useEffect(()=>{

        // socket.io connection 만들기

        const soc = io.connect("http://172.10.7.21:80", {transports:['websocket']});
        // socket 연결 성공 시
        soc.on("connect", () => {
            console.log("Socket connected successfully!");
            soc.emit('username',nickname);
            console.log(soc);
            socket.current = soc;
        });

        // socket 연결 실패 시
        soc.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
          });

        // 본인 user_id 얻어오기
        soc.on("user_id", (socket_id)=>{
            setMyId(socket_id);
            //console.log(socket_id);
        });

        // 전체 플레이어 정보 얻기
        soc.on("join_user", (player)=>{
            // 여기서 users 배열에 player 추가하고
            // get_player에 player.id 와 player을 mapping
            //users.current.push(player);
            get_player.current[player.id] = player;
            soc.on("update_state",(data)=>{
                const player = get_player.current[data.id];
                console.log(player, data);
                player.x = data.x;
                player.y = data.y;
            });
    
        });

        soc.on("leave_user", (id)=>{
            //users.current = users.current.filter(user => user.id !== id);
            delete get_player.current[id];
        });

        const handleKeyDown = (e)=>{
            switch (e.key) {
                case 'ArrowLeft':
                    pressLeft.current = true; 
                    break;
                case 'ArrowRight':
                    pressRight.current = true;
                    break;
                case 'ArrowUp':
                    pressUp.current = true;
                    break;
                case 'ArrowDown':
                    pressDown.current = true;
                    break;
                default:
                    break;
              }
        }

        const handleKeyUp = (e)=>{
            switch (e.key) {
                case 'ArrowLeft':
                    pressLeft.current = false; 
                    break;
                case 'ArrowRight':
                    pressRight.current = false;
                    break;
                case 'ArrowUp':
                    pressUp.current = false;
                    break;
                case 'ArrowDown':
                    pressDown.current = false;
                    break;
                default:
                    break;
              }
        }

        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            soc.disconnect();
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
          };
    }, []);

    useEffect(() => {
        // 컴포넌트가 마운트된 후 canvas에 접근
        if (canvasRef.current && socket.current) {
            const canvas = canvasRef.current;
            canvas.width = 1024;
            canvas.height = 768;

            // 1000ms마다 renderGame 호출
            const intervalId = setInterval(() => {
                renderGame();
            }, 20);

            return () => {
                clearInterval(intervalId); // 컴포넌트가 unmount될 때 interval 해제
            };
        }
      }, [canvasRef, canvasRef.current, socket, socket.current]);

    
    const renderGame = () => {

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        //console.log("render "+ users.current, get_player.current, users.current.length);

        for (let userId in get_player.current) {
            const user = get_player.current[userId];
            // Draw the user at user.x, user.y (adjust as needed)
            context.fillStyle = user.color; // Set user color
            context.fillRect(user.x, user.y, 50, 50); // Example rectangle, adjust size as needed
        }

        let cur = get_player.current[myId];
        if(pressDown.current){
            cur.y += velocity;
            if(cur.y > canvas.height){
                cur.y -= velocity;
            }
        }
        if(pressUp.current){
            cur.y -= velocity;
            if(cur.y < 0){
                cur.y += velocity;
            }
        }
        if(pressLeft.current){
            cur.x -= velocity;
            if(cur.x < 0){
                cur.x += velocity;
            }
        }
        if(pressRight.current){
            cur.x += velocity;
            if(cur.x > canvas.width){
                cur.x -= velocity;
            }
        }
        console.log(socket.current);
        socket.current.emit("send_location", cur);
    };

    return (
    <div className='maingame'>
        <canvas ref={canvasRef} className='maingame_canvas'></canvas>
    </div>
    );
}
export default MainGame;