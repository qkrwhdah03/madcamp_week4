import './MainGame.css'
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";

function MainGame() {
    const navigate = useNavigate();
    const {state} = useLocation();
    const nickname = state?.nickname;
    const [myId, setMyId] = useState(null);
    const canvasRef = useRef(null); // canvas 

    // 플레이어, 총알 위치 정보 -> 렌더링에 사용
    const get_player = useRef({});
    const bullets = useRef({});
    const bullet = useRef(null);

    // 맵 배경 이미지 저장 변수
    const map = useRef(null);
    const troop = useRef(null);
    const troop2 = useRef(null);
    const bullet_img = useRef(null);

    const wall = useRef(null); //##########################################(1)

    // 서버 통신 소켓
    const socket = useRef(null);

    // 소리 재생을 위한 상호작용 변수 선언
    const [interact, setInteract] = useState(false);

    // 키보드 입력 상태 받기 (asdf)
    const pressDown = useRef(false);
    const pressUp  =  useRef(false);
    const pressLeft  =  useRef(false);
    const pressRight  =  useRef(false);
    const pressReload = useRef(false);

    // 마우스 위치 좌표 넣기
    const mousepointerX = useRef(null);
    const mousepointerY = useRef(null);


    // 변수 값 설정
    const map_src = '/map.png'; // 배경맵 경로
    const troop_src = '/troop/handgun/move/survivor-move_handgun_0.png'; // 유저 캐릭터 경로
    const troop_src2 = '/troop/handgun/reload/survivor-reload_handgun_9.png'; // 유저 캐릭터 경로  
    const wall_src = '/wall_data.json'
    const bullet_src = '/bullet.png';
    const reolad_src = new Audio('/sounds/reload.mp3');
    const heartbeat_src = new Audio('sounds/heartbeat.mp3');
    const pistol_src = new Audio('sounds/pistol.mp3');
    const velocity = 4; // 유저 이동 속도
    const bulletvelocity = 20; // 총알 속또
    const reload_time = 1000 // 재장전 시간 (ms)
    const rendering_interval = 20 // 렌더링 주기 (ms)
    const search_distance = 20//벽 존재 탐색 거리
    const canvas_w = 1024; // 캔버스 크기
    const canvas_h = 768; // 캔버스 크기
    const map_x = 1920  //dw 전체 맵 크기 
    const map_y = 1920 // 전체 맵 크기
    const total_bullet_num = 12; // 탄창 총알 수
    const damage = 10;  // 총알 데미지
    const collision_distance = 20; // 총알 충돌 거리 설정
    const tile_size = 32; // Tiled tile하나 크기 32 px

    // User 상태 관련 변수들
    const num_bullet = useRef(total_bullet_num); // 탄창 속 총알 수
    const reload_frame_number = useRef(reload_time / rendering_interval) // 재장전 프레임 수 = 재장전시간 / 렌더링 주기

    useEffect(()=>{

        // 초기화 후, socket.io connection 만들기
        get_player.current = {};

        const soc = io.connect("http://172.10.7.21:80", {transports:['websocket']});

        // socket 연결 성공 시
        soc.on("connect", () => {
            console.log("Socket connected successfully!");
            soc.emit('username',nickname);
            socket.current = soc;
            heartbeat_src.currentTime=0;
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
                player.state = data.state;
                player.kill = data.kill;
                player.hit=data.hit;
            }
        });

        soc.on("leave_user", (id)=>{
            delete get_player.current[id];
        });


        soc.on("bullets", (data)=>{
            bullets.current[data.bulletId]=data;

        });

        soc.on('deletebullet', (data)=>{
            delete bullets.current[data.bulletId];
        });

        soc.on('killed', (user_id)=>{
            const player = get_player.current[user_id];
            if(player){
                player.kill += 1;
            }
        })
        
        // 배경 map 읽어오기
        const image = new Image();
        image.src = process.env.PUBLIC_URL + map_src; // 이미지 파일 경로 설정
        image.onload = () =>{
            console.log("Read Image Done");
            map.current = image;
        }

        // map에서 wall 정보 읽어오기
        let src = process.env.PUBLIC_URL + wall_src;
        fetch(src)
        .then(response => {
            if (!response.ok) {
            throw new Error('Fail to fetch map wall data');
            }
            return response.json();
        })
        .then(jsonData => {
            wall.current = jsonData['wall_tile_coordinate']; // wall 변수에 저장 : 60 by 60 array
        })
        .catch(error => {
            console.error('Error while fetching or parsing JSON file:', error);
        });

        // User 캐릭터 가져오기
        const user_image = new Image();
        user_image.src = process.env.PUBLIC_URL + troop_src;
        user_image.onload = ()=>{
            console.log("Read user Image Done");
            troop.current = user_image;
        }

        const user_image2 = new Image();
        user_image2.src = process.env.PUBLIC_URL + troop_src2;
        user_image2.onload = ()=>{
            console.log("Read user Image Done");
            troop2.current = user_image2;
        }

        // 총알 이미지 가져오기
        const bullet_image = new Image();
        bullet_image.src = process.env.PUBLIC_URL + bullet_src;
        bullet_image.onload = ()=>{
            console.log("Read bullet Image Done");
            bullet_img.current = bullet_image;
        }

        const handleKeyDown = (e)=>{
            setInteract(true);
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
                case 'r':
                    if(!pressReload.current && num_bullet.current < total_bullet_num){
                        pressReload.current = true;
                        reload();
                    };
                    break;
                default:
                    break;
              }
        }

        const handleKeyUp = (e)=>{
            setInteract(true);
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
            setInteract(true);
            const bulletposition = [e.clientX,e.clientY];
            bullet.current=bulletposition;
            if(num_bullet.current>0){
                pistol_src.pause();
                pistol_src.currentTime=0;
                pistol_src.play();
            }
        };

        const handleMouseMove = (e) => {
            setInteract(true);
            mousepointerX.current=e.clientX;
            mousepointerY.current=e.clientY;
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('현재 창이 활성화되어 있습니다.');
              } else {
                console.log('현재 창이 비활성화되어 있습니다.');
                // 비활성화 되면..? 어떻게 처리?
                // 1.Navigate으로 connection이 끊긴 창으로 이동하게
                heartbeat_src.pause();
                navigate('../Restart', {replace:true, state:{nickname : nickname, who : "Network Connection Error",error:true}});
              }
        };
        

        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("click", handleCanvasClick);
        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener('visibilitychange', handleVisibilityChange); 

        heartbeat_src.addEventListener('ended', function() {
            heartbeat_src.currentTime = 0; 
            heartbeat_src.play();
        }, false);

        return () => {
            soc.disconnect();
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("click", handleCanvasClick);
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener('visibilitychange', handleVisibilityChange); 
        };
    }, []);

    const reload = () => {
        reolad_src.currentTime=0;
        reolad_src.play();
        setTimeout(() => {
            num_bullet.current = total_bullet_num;
            pressReload.current = false;
        }, reload_time);
    };

    useEffect(() => {
        // 컴포넌트가 마운트된 후 canvas에 접근
        if (canvasRef.current && socket.current && map.current && troop.current && troop2.current && wall.current && myId) {
            const canvas = canvasRef.current;
            canvas.width = canvas_w;
            canvas.height = canvas_h;
            // 1000ms마다 renderGame 호출
            const intervalId = setInterval(() => {
                renderGame();
            }, rendering_interval);

            const intervalId1 = setInterval(() => {
                if(interact){
                    updatesound();
                }
            }, 500);

            return () => {
                clearInterval(intervalId); // 컴포넌트가 unmount될 때 interval 해제
                clearInterval(intervalId1);
            };
        }
      }, [canvasRef.current, socket.current, map.current, troop.current, troop2.current, wall.current, myId]);

    const updatesound = () =>{
        let closestdistance=100000000000;
        // 다른 유저들 위치 표시
        for (let userId in get_player.current) {
            const user = get_player.current[userId];
            const distance = calculateDistance(user.x, user.y, get_player.current[myId].x, get_player.current[myId].y);
            if (userId!==myId && closestdistance>distance){
                closestdistance=distance;
            };
    
        }
        heartbeat_src.pause();
        if(closestdistance<200){
            heartbeat_src.playbackRate=2.;
            heartbeat_src.play();
        }
        else if(closestdistance<400){
            heartbeat_src.playbackRate=1.5;
            heartbeat_src.play();
        }
        else {
            heartbeat_src.playbackRate=1;
            heartbeat_src.play();
        }
    }

    const renderGame = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let cur = get_player.current[myId];
        context.clearRect(0, 0, canvas.width, canvas.height);

        // 맵 그리기, 카메라 설정
        let mapsizeX = map_x;
        let mapSizeY = map_y;
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


        // Health Point 그리기
       const drawProgressBar = (x, y, val, max, color, length, height) =>{ 
            context.fillStyle = '#ddd';
            context.fillRect(x, y, length, height);

            // Draw the filled part of the progress bar
            context.fillStyle = color;
            context.fillRect(x, y, length * val/max, height);
       }
        // 다른 유저들 위치 표시
        for (let userId in get_player.current) {
            const user = get_player.current[userId];
            // Draw the user at user.x, user.y (adjust as needed)
            const tx = user.x - cameraX ; 
            const ty = user.y - cameraY ;
            const angle = Math.atan2(user.dy, user.dx);
            context.save();
            if (userId !== myId){
                const mdifx = mousepointerX.current-context.canvas.offsetLeft-cur.x+cameraX;
                const mdify = mousepointerY.current-context.canvas.offsetTop-cur.y+cameraY;
                const edifx = user.x - cur.x;
                const edify = user.y - cur.y;
                const mdif = Math.sqrt(mdifx**2 + mdify**2);
                const edif = Math.sqrt(edifx**2 + edify**2);
                const inner = (mdifx*edifx+mdify*edify)/(mdif*edif);
                const innerangle = Math.acos(inner);
                const isWithin45Degrees = innerangle < Math.PI / 4;

                let iswall = 0;
                const enemyangle = Math.acos(edifx/edif);
                let sign=1;
                if(edify<0)sign=-1;
                const plusx = search_distance*Math.cos(enemyangle);
                const plusy = search_distance*Math.sin(enemyangle)*sign;
                let x=cur.x;
                let y=cur.y;
                const n = Math.floor(edif/search_distance);
                for (let i=1; i<=n; i++){
                    x+=plusx;
                    y+=plusy;
                    const p = Math.floor(x/tile_size);
                    const q = Math.floor(y/tile_size);
                    if(wall.current[q][p] === 1){
                        iswall = 1;
                    }

                    

                };
                


            
                // 명도 낮춤 효과
                if (!isWithin45Degrees || iswall) {
                    context.globalAlpha = 0; // 투명도 설정 (0.5: 반투명)
                }
                else{
                    context.globalAlpha = 1;
                    drawProgressBar(tx-30, ty-50, user.state, 100,'#4CAF50', 60 ,6);
                    
                }
            } 
            else {
                drawProgressBar(tx-30, ty-50, user.state, 100,'#4CAF50', 60 ,6);
                drawProgressBar(tx-30, ty-35, num_bullet.current, total_bullet_num,'#FE2E64', 58, 2);
            }

            context.translate(tx, ty);
            context.rotate(angle);
            context.scale(0.3, 0.3);

            if(user.hit){
                context.drawImage(troop2.current, -troop.current.width / 2, -troop.current.height / 2);
            }
            else{
                context.drawImage(troop.current, -troop.current.width / 2, -troop.current.height / 2);
            }
            context.rotate(-angle);
            context.translate(-tx, -ty);
            context.restore();
        }

        

         // 총알 발사 처리
        if (bullet.current){
            if(num_bullet.current > 0){ // 총알이 남아 있으면
                const angle = Math.atan2(
                    bullet.current[1]-context.canvas.offsetTop-cur.y+cameraY,
                    bullet.current[0]-context.canvas.offsetLeft-cur.x+cameraX
                )
                cur.angle = angle;
            
                socket.current.emit("shoot_bullet", {
                    x: cur.x + 30*Math.cos(cur.angle)-20*Math.sin(cur.angle), //캐릭터 총구로 보정 
                    y: cur.y +30*Math.sin(cur.angle)+20*Math.cos(cur.angle), // 캐릭터 총구로 보정
                    angle:cur.angle,
                    user : cur.id, // 누가 쐈는지 저장
                    user_name : cur.nickname
                })
                num_bullet.current -= 1; 
                bullet.current = null; 
            }
            else {
                if(reload_frame_number.current===reload_time / rendering_interval){
                    reload();
                }
                // 재장전
                if(reload_frame_number.current > 0){
                    reload_frame_number.current -= 1;
                } else{
                    
                    reload_frame_number.current = reload_time / rendering_interval;
                    bullet.current = null; 
                }
                
            }
        }

        // 총알 그리기 + 맵에서 나간 총알 삭제
        const filtered_bullets = {};
        for (let bulletId in bullets.current) {
            let bullet_cur = bullets.current[bulletId];
            bullet_cur.x += Math.cos(bullet_cur.angle)*bulletvelocity;
            bullet_cur.y += Math.sin(bullet_cur.angle)*bulletvelocity;
            
            context.save();
            context.translate(bullet_cur.x - cameraX, bullet_cur.y- cameraY);
            context.rotate(bullet_cur.angle);
            context.drawImage(bullet_img.current, -bullet_img.current.width / 2, -bullet_img.current.height / 2);
            context.rotate(-bullet_cur.angle);
            context.translate(-bullet_cur.x + cameraX, bullet_cur.y + cameraY);
            context.restore(); 

            // 벽 충돌하면 제거
            const p = Math.floor(bullet_cur.x / tile_size);
            const q = Math.floor(bullet_cur.y / tile_size);
            if(wall.current[q][p] === 1){
                continue;
            } else{
                filtered_bullets[bullet_cur.bulletId] = bullet_cur;
            }
        }
        bullets.current = filtered_bullets;


        // 총알 충돌처리 
        handleCollisions(cur);
        
        // 킬 수 표시하기
        context.font = '20px Arial';
        context.fillStyle = '#FFF';
        context.textAlign = 'center';
        context.fillText("Kill : "+ cur.kill, canvas.width- 80, 30);


        // 현재 자기 자신 위치 업데이트
        
        if(pressDown.current){
            cur.y += velocity;
            const p = Math.floor(cur.x/tile_size);
            const q = Math.floor(cur.y/tile_size);
            if(wall.current[q][p] === 1){
                cur.y -= velocity;
            }
          
        }
        if(pressUp.current){
            cur.y -= velocity;
            const p = Math.floor(cur.x/tile_size);
            const q = Math.floor(cur.y/tile_size);
            if(wall.current[q][p] === 1){
                cur.y += velocity;
            }
       
        }
        if(pressLeft.current){
            cur.x -= velocity;
            const p = Math.floor(cur.x/tile_size);
            const q = Math.floor(cur.y/tile_size);
            if(wall.current[q][p] === 1){
                cur.x += velocity;
            }
      
        }
        if(pressRight.current){
            cur.x += velocity;
            const p = Math.floor(cur.x/tile_size);
            const q = Math.floor(cur.y/tile_size);
            if(wall.current[q][p] === 1){
                cur.x -= velocity;
            }
       
        }

        // 지하 순간이동 처리
        const p = Math.floor(cur.x/tile_size);
        const q = Math.floor(cur.y/tile_size);
        if(q === 41 && p === 29){
            cur.x = 33 * tile_size;
        }
        if(q === 41 && p === 32){
            cur.x = 28 * tile_size;
        }
        if(q === 58 && p === 58){
            cur.x = 2 * tile_size;
            cur.y = 3 * tile_size;
        }
        if(q <=2 && p <=2 ){
            cur.x = 57 * tile_size;
            cur.y = 57 * tile_size;
        }

        // 마우스 포인터 위치 계산
        cur.dy=mousepointerY.current-context.canvas.offsetTop-cur.y+cameraY;
        cur.dx=mousepointerX.current-context.canvas.offsetLeft-cur.x+cameraX;
        if(cur.hit){
            cur.hit-=1;
        }

        // 위치 정보 서버에 보내기
        socket.current.emit("send_location", cur);
    };

    // 거리 계산
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
        return distance < collision_distance;
    }

    function handleCollisions(cur) {
        //const cur = get_player.current[myId];
    
        for (let bulletId in bullets.current) {
            const bullet_cur = bullets.current[bulletId];
            if (checkCollision(cur, bullet_cur)) {
                // 충돌 발생! 여기서 필요한 동작 수
                // 예를 들어, 캐릭터의 체력을 감소시키는 등의 동작 수행
                cur.state -= damage; // 체력 10 감소
                cur.hit=10;

                // 그리고 충돌한 총알 제거 (bullets.current 배열에서 해당 총알 삭제)
                delete bullets.current[bulletId];
                socket.current.emit('collision', bullet_cur);

                if(cur.state <= 0){ // 사망 처리
                    socket.current.emit("death", cur, bullet_cur);
                    // bullet_cur.user로 점수나 킬 올리기
                    heartbeat_src.pause();
                    navigate('../Restart', {replace:true, state:{nickname : nickname, who : bullet_cur.user_name, error:false}});
                }
            }
        }
    }  

    return (
    <div className='maingame' >
        <canvas ref={(ref) => { canvasRef.current = ref; } } className='maingame_canvas'></canvas>   
    </div>
    );
}
export default MainGame;