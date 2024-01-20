import './MainGame.css'
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";

function MainGame() {
    const {state} = useLocation();
    const nickname = state?.nickname;
    const [myId, setMyId] = useState(null);
    const canvasRef = useRef(null); // canvas 

    // 플레이어, 총알 정보 -> 렌더링에 사용
    const get_player = useRef({});
    const bullets = useRef({});
    const bullet = useRef();

    // 맵 배경 이미지 저장
    const map = useRef(null);
    const troop = useRef(null);

    // 서버 통신 소켓
    const socket = useRef(null);

    // 키보드 입력 상태 받기
    const pressDown = useRef(false);
    const pressUp  =  useRef(false);
    const pressLeft  =  useRef(false);
    const pressRight  =  useRef(false);

    // 마우스 위치 좌표 넣기
    const mousepointerX = useRef(null);
    const mousepointerY = useRef(null);


    let velocity = 4;
    let bulletvelocity = 20;

    useEffect(()=>{

        // 초기화 후, socket.io connection 만들기
        get_player.current = {};

        const soc = io.connect("http://172.10.7.21:80", {transports:['websocket']});
        // socket 연결 성공 시
        soc.on("connect", () => {
            console.log("ㅇㅁㅈSocket connected successfully!");
            soc.emit('username',nickname);
            socket.current = soc;
        });

        // socket 연결 실패 시
        soc.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
          });

        // 본인 user_id 얻어오기
        soc.on("user_id", (socket_id)=>{
            setMyId(socket_id);
        });

        // 전체 플레이어 정보 얻기
        soc.on("join_user", (player)=>{
            // 여기서 users 배열에 player 추가하고
            // get_player에 player.id 와 player을 mapping
            //users.current.push(player);
            get_player.current[player.id] = player;
        });

        soc.on("update_state",(data)=>{
            const player = get_player.current[data.id];
            if(player){
                player.x = data.x;
                player.y = data.y;
                player.dx = data.dx;
                player.dy = data.dy;
            }
        });

        soc.on("leave_user", (id)=>{
            //users.log = users.current.filter(user => user.id !== id);
            delete get_player.current[id];
        });


        soc.on("bullets", (data)=>{
            bullets.current[data.bulletId]=data;
            console.log('총알들', bullets.current);
        });

        soc.on('deletebullet', (data)=>{
            delete bullets.current[data.bulletId];
            console.log('총알 맞앗어요');
        });
        // 배경 map 읽어오기
        const image = new Image();
        image.src = process.env.PUBLIC_URL + '/map.png'; // 이미지 파일 경로 설정
        image.onload = () =>{
            console.log("Read Image Done");
            map.current = image;
        }

        // User 캐릭터 가져오기
        const user_image = new Image();
        user_image.src = process.env.PUBLIC_URL + '/troop/handgun/move/survivor-move_handgun_0.png';
        user_image.onload = ()=>{
            console.log("Read user Image Done");
            troop.current = user_image;
        }

        const handleKeyDown = (e)=>{
            switch (e.key.toLowerCase()) {
                case 'a':
                    pressLeft.current = true; 
                    break;
                case 'd':
                    pressRight.current = true;
                    break;
                case 'w':
                    pressUp.current = true;
                    break;
                case 's':
                    pressDown.current = true;
                    break;
                default:
                    break;
              }
        }

        const handleKeyUp = (e)=>{
            switch (e.key.toLowerCase()) {
                case 'a':
                    pressLeft.current = false; 
                    break;
                case 'd':
                    pressRight.current = false;
                    break;
                case 'w':
                    pressUp.current = false;
                    break;
                case 's':
                    pressDown.current = false;
                    break;
                default:
                    break;
              }
        }
        const handleCanvasClick = (e) => {
            const bulletposition = [e.clientX,e.clientY];
            bullet.current=bulletposition;
            // 클릭한 위치와 방향 등을 서버에 전송
        };

        const handleMouseMove = (e) => {
            mousepointerX.current=e.clientX;
            mousepointerY.current=e.clientY;
        }
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("click", handleCanvasClick);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            soc.disconnect();
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("click", handleCanvasClick);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    useEffect(() => {
        // 컴포넌트가 마운트된 후 canvas에 접근
        if (canvasRef.current && socket.current && map.current) {
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
      }, [canvasRef, canvasRef.current, socket, socket.current, map, map.current]);


    const renderGame = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let cur = get_player.current[myId];
        context.clearRect(0, 0, canvas.width, canvas.height);

        // 맵 그리기, 카메라 설정
        let mapsizeX = 1600;
        let mapSizeY = 1600;
        let cameraX = cur.x - canvas.width / 2; 
        let cameraY = cur.y - canvas.height/ 2;
        if(cameraX < 0){
            cameraX = 0
        } else if(cameraX + canvas.width > mapsizeX){
            cameraX = mapsizeX - canvas.width;
        }
        if(cameraY < 0){
            cameraY = 0;
        } else if(cameraY + canvas.height > mapSizeY){
            cameraY = mapSizeY - canvas.height;
        }
        context.drawImage(map.current, cameraX, cameraY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

        
        // 다른 유저들 위치 표시
        for (let userId in get_player.current) {
            const user = get_player.current[userId];
            // Draw the user at user.x, user.y (adjust as needed)
            //context.fillStyle = user.color; // Set user color
            //context.fillRect(user.x - cameraX, user.y - cameraY, 50, 50); // Example rectangle, adjust size as needed
            const tx = user.x - cameraX ; // 77.4 이미지 크기임
            const ty = user.y - cameraY ; // 66 이미지 크기임
            const angle = Math.atan2(user.dy, user.dx);
            context.save();
            context.translate(tx, ty);
            context.rotate(angle);
            context.scale(0.3, 0.3);
            context.drawImage(troop.current, -troop.current.width / 2, -troop.current.height / 2);
            context.rotate(-angle);
            context.translate(-tx, -ty);
            context.restore();
            
        }

         // 총알 그리기
        if (bullet.current){
            //console.log('발사', bullet.current);
            const angle = Math.atan2(
                bullet.current[1]-context.canvas.offsetTop-cur.y+cameraY,
                bullet.current[0]-context.canvas.offsetLeft-cur.x+cameraX
            )
            cur.angle = angle;
            //console.log('총알 각도',angle);
            socket.current.emit("shoot_bullet", {
                x: cur.x + 30*Math.cos(cur.angle)-20*Math.sin(cur.angle), //캐릭터 총구로 보정 
                y: cur.y +30*Math.sin(cur.angle)+20*Math.cos(cur.angle), // 캐릭터 총구로 보정
                angle:cur.angle
            })
            bullet.current=null;
        }
        //console.log(bullets.current);
        const filtered_bullets = {};
        for (let bulletId in bullets.current) {
            let bullet1 = bullets.current[bulletId];
            bullet1.x += Math.cos(bullet1.angle)*bulletvelocity;
            bullet1.y += Math.sin(bullet1.angle)*bulletvelocity;
            context.fillStyle="#FFFFFF"
            context.beginPath();
            context.arc(
                bullet1.x-cameraX, 
                bullet1.y-cameraY, 
                5, 0, 2*Math.PI
            );
            context.fill();
            if(bullet1.x < 0 || bullet1.y < 0 || bullet1.x > mapsizeX || bullet1.y > mapSizeY){
                continue;
            } else{
                filtered_bullets[bullet1.bulletId]=bullet1;
            }
        }
        bullets.current = filtered_bullets;

        // 현재 자기 자신 위치 업데이트
        if(pressDown.current){
            cur.y += velocity;
            if(cur.y > mapSizeY- 50){ // 50은 user size
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
            if(cur.x > mapsizeX - 50){ // 50은 user size
                cur.x -= velocity;
            }
        }

        // 마우스 포인터 위치 계산
        cur.dy=mousepointerY.current-context.canvas.offsetTop-cur.y+cameraY;
        cur.dx=mousepointerX.current-context.canvas.offsetLeft-cur.x+cameraX;

        // 위치 정보 서버에 보내기
        socket.current.emit("send_location", cur);

        

        handleCollisions();


    };
    function calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 충돌 감지 함수
    function checkCollision(character, bullet) {
        const distance = calculateDistance(
            character.x, character.y,
            bullet.x, bullet.y
        );
    
        // 일정 거리 내에 있으면 충돌로 간주
        const collisionDistance = 20; // 조절 가능한 거리
        return distance < collisionDistance;
    }

    function handleCollisions() {
        const cur = get_player.current[myId];
    
        for (let bulletId in bullets.current) {
            const bullet1 = bullets.current[bulletId];
            if (checkCollision(cur, bullet1)) {
                // 충돌 발생! 여기서 필요한 동작 수행
                console.log('캐릭터와 총알이 충돌했습니다!');
                // 예를 들어, 캐릭터의 체력을 감소시키는 등의 동작 수행
                // 그리고 충돌한 총알 제거 (bullets.current 배열에서 해당 총알 삭제)
                delete bullets.current[bulletId];
                socket.current.emit('collision', bullet1);

            }
        }
    }

    return (
    <div className='maingame'>
        <canvas ref={canvasRef} className='maingame_canvas'></canvas>
    </div>
    );
}
export default MainGame;