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
    const knifeposition = useRef(0);
    const knifeswings = useRef([]);
    const fire = useRef(null);
    const fires = useRef([]);

    const items = useRef({});

    // 킬 로그 저장
    const kill_log = useRef([]);

    // 맵 배경 이미지 저장 변수
    const map = useRef(null);
    const pistol = useRef(null);
    const pistol2 = useRef(null);
    const knife = useRef(null);
    const knife2 = useRef(null);
    const fireshot = useRef(null);
    const bullet_img = useRef(null);
    const item_img = useRef(null);
    const fire_img = useRef(null);

    const wall = useRef(null); //##########################################(1)

    // 서버 통신 소켓
    const socket = useRef(null);

    // 소리 재생을 위한 상호작용 변수 선언
    const [interact, setinteract] = useState(false);
    const soundplay = useRef(false);

    // 키보드 입력 상태 받기 (asdf)
    const pressDown = useRef(false);
    const pressUp  =  useRef(false);
    const pressLeft  =  useRef(false);
    const pressRight  =  useRef(false);
    const pressReload = useRef(false);

    // 마우스 위치 좌표 넣기
    const mousepointerX = useRef(null);
    const mousepointerY = useRef(null);

    //유저 무기 정보
    const weaponstate = useRef(1);

    // 변수 값 설정
    const map_src = '/map.png'; // 배경맵 경로
    const pistol_src = '/troop/handgun/move/survivor-move_handgun_0.png'; // 유저 캐릭터 경로
    const pistol_src2 = '/troop/handgun/reload/survivor-reload_handgun_9.png'; // 유저 캐릭터 경로  
    const knife_src = './troop/knife/meleeattack/survivor-meleeattack_knife_0.png';
    const knife_src2 = './troop/knife/meleeattack/survivor-meleeattack_knife_7.png';
    const fireshot_src =  './troop/shotgun/idle/survivor-idle_shotgun_0.png';
    const wall_src = '/wall_data.json'
    const bullet_src = '/bullet.png';
    const item_src = '/box.png'
    const fire_src = '/fire.png';
    const reload_src = new Audio(process.env.PUBLIC_URL +'/sounds/reload.mp3');
    const heartbeat_src = new Audio(process.env.PUBLIC_URL +'/sounds/heartbeat.mp3');
    const pistolsound_src = new Audio(process.env.PUBLIC_URL +'/sounds/pistol.mp3');
    const knifesound_src = new Audio(process.env.PUBLIC_URL + '/sounds/knife.mp3');
    const firesound_src = new Audio(process.env.PUBLIC_URL + '/sounds/fire.mp3');
    const firereload_src = new Audio(process.env.PUBLIC_URL + '/sounds/firereload.mp3');
    const velocity = 4; // 유저 이동 속도
    const bulletvelocity = 20; // 총알 속도
    const firevelocity = 5;
    const reload_time = 1000; // 재장전 시간 (ms)
    const rendering_interval = 20; // 렌더링 주기 (ms)
    const search_distance = 20;//벽 존재 탐색 거리
    const canvas_w = 1024; // 캔버스 크기
    const canvas_h = 768; // 캔버스 크기
    const map_x = 1920 ; //dw 전체 맵 크기 
    const map_y = 1920 ;// 전체 맵 크기
    const total_bullet_num = 12; // 탄창 총알 수
    const damage = 10;  // 총알 데미지
    const bullet_collision_distance = 20; // 총알 충돌 거리 설정
    const total_fire_num = 5;
    const item_collision_distance = 30;
    const tile_size = 32; // Tiled tile하나 크기 32 px
    const vision_angle = Math.PI / 4; // 전체 시야각의 절반임
    const kill_log_frame = 75;

    // User 상태 관련 변수들
    const num_bullet = useRef(total_bullet_num); // 탄창 속 총알 수
    const reload_frame_number = useRef(reload_time / rendering_interval) // 재장전 프레임 수 = 재장전시간 / 렌더링 주기
    const knifeswing = useRef(0);
    const num_fire = useRef(total_fire_num);
    const firing = useRef(0);


    useEffect(()=>{

        // 초기화 후, socket.io connection 만들기
        get_player.current = {};
        setinteract(false);
        // 배경 map 읽어오기
        const image = new Image();
        image.src = process.env.PUBLIC_URL + map_src; // 이미지 파일 경로 설정
        image.onload = () =>{
            console.log("Read Map Image Done");
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
        user_image.src = process.env.PUBLIC_URL + pistol_src;
        user_image.onload = ()=>{
            console.log("Read user Image Done");
            pistol.current = user_image;
        }

        const user_image2 = new Image();
        user_image2.src = process.env.PUBLIC_URL + pistol_src2;
        user_image2.onload = ()=>{
            console.log("Read user Image2 Done");
            pistol2.current = user_image2;
        }

        const user_image3 = new Image();
        user_image3.src = process.env.PUBLIC_URL + knife_src;
        user_image3.onload = ()=>{
            console.log("Read user Image Done");
            knife.current = user_image3;
        }

        const user_image4 = new Image();
        user_image4.src = process.env.PUBLIC_URL + knife_src2;
        user_image4.onload = ()=>{
            console.log("Read user Image Done");
            knife2.current = user_image4;
        }

        const user_image5 = new Image();
        user_image5.src = process.env.PUBLIC_URL + fireshot_src;
        user_image5.onload = ()=>{
            console.log("Read user Image Done");
            fireshot.current = user_image5;
        }

        // 총알 이미지 가져오기
        const bullet_image = new Image();
        bullet_image.src = process.env.PUBLIC_URL + bullet_src;
        bullet_image.onload = ()=>{
            console.log("Read bullet Image Done");
            bullet_img.current = bullet_image;
        }

        // 아이템 이미지 가져오기
        const item_image = new Image();
        item_image.src = process.env.PUBLIC_URL + item_src;
        item_image.onload = ()=>{
            console.log("Read Item Image Done");
            item_img.current = item_image;
        }

        const fire_image = new Image();
        fire_image.src = process.env.PUBLIC_URL + fire_src;
        fire_image.onload = ()=>{
            console.log("Read Item Image Done");
            fire_img.current = fire_image;
        }

        const soc = io.connect("http://172.10.5.177:80", {transports:['websocket']});

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
            console.log("Get myId");
        });

        // item 기존 정보
        soc.on("item_init", (item_init)=>{
            items.current = item_init;
            console.log("기존 아이템 정보 ", items.current);
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
                player.weapon=data.weapon;
            }
        });

        soc.on("leave_user", (id)=>{
            delete get_player.current[id];
        });


        soc.on("bullets", (data)=>{
            bullets.current[data.bulletId]=data;

        });

        soc.on("fires", (data)=>{
            fires.current.push(data);
        });

        soc.on("knifeswings", (data)=>{
            knifeswings.current.push(data);
        });

        soc.on('deletebullet', (data)=>{
            delete bullets.current[data.bulletId];
        });

        soc.on('killed', (dead, user)=>{
            const player = get_player.current[user.id];
            if(player){
                player.kill += 1;
            }
            kill_log.current.push({kill:user.user_name, dead:dead.nickname, life: kill_log_frame});
        });

        soc.on('spawn_item', (pos)=>{
            items.current[pos.id] = {x:pos.x, y:pos.y};
        });

        soc.on('delete_item', (item_id)=>{
            delete items.current[item_id];
        });

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
                case 'r':
                    if(weaponstate.current===1){
                        if(!pressReload.current && num_bullet.current < total_bullet_num){
                            pressReload.current = true;
                            reload();
                        };
                    }
                    else if(weaponstate.current===3){
                        if(!pressReload.current && num_fire.current < total_fire_num){
                            pressReload.current = true;
                            reload();
                        };
                    }
                    break;
                case '1':
                    weaponstate.current=1;
                    break;
                case '2':
                    weaponstate.current=2;
                    break;
                case '3':
                    weaponstate.current=3;
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
            setinteract(true);
            const mouseposition = [e.clientX,e.clientY];
            if(weaponstate.current===1){
                bullet.current=mouseposition;
                if(num_bullet.current>0 && soundplay.current){
                    pistolsound_src.currentTime=0;
                    pistolsound_src.play();
                }
            }
            else if(weaponstate.current===2){
                weaponstate.current=2.5;
                knifeposition.current=mouseposition;
                knifeswing.current=25;
                knifesound_src.currentTime=0;
                knifesound_src.play();
            }
            else if(weaponstate.current===3){
                weaponstate.current=3.5;
                firing.current=25;
                fire.current=mouseposition;
                if(num_fire.current>0 && soundplay.current){
                    firesound_src.currentTime=0;
                    firesound_src.play();
                }
                
            }
        };

        const handleMouseMove = (e) => {
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
                if(!heartbeat_src.paused) heartbeat_src.pause();
                navigate('../Restart', {replace:true, state:{nickname : nickname, who : "Network Connection Error",error:true}});
              }
        };

        

        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("click", handleCanvasClick);
        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener('visibilitychange', handleVisibilityChange); 

        // heartbeat_src.addEventListener('ended', function() {
        //     console.log('끝낫습니다');
        //     heartbeat_src.currentTime = 0; 
        //     heartbeat_src.play();
        // }, false);

        return () => {
            soc.disconnect();
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("click", handleCanvasClick);
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener('visibilitychange', handleVisibilityChange); 

            reload_src.pause();
            heartbeat_src.pause();
            pistolsound_src.pause();
            knifesound_src.pause();
        };
    }, []);

    const reload = () => {
        if(weaponstate.current===1){
            reload_src.currentTime=0;
            if(soundplay.current){
                reload_src.play();
            }
            setTimeout(() => {
                num_bullet.current = total_bullet_num;
                pressReload.current = false;
            }, reload_time);
        }
        else if(weaponstate.current===3 || weaponstate.current===3.5){
            firereload_src.currentTime=0;
            if(soundplay.current){
                firereload_src.play();
            }
            setTimeout(() => {
                num_fire.current = total_fire_num;
                pressReload.current = false;
            }, reload_time);
        }
    };

    useEffect(() => {
        // 컴포넌트가 마운트된 후 canvas에 접근
        if (canvasRef.current && socket.current && map.current && pistol.current && pistol2.current && 
            wall.current && myId && item_img.current && knife.current && knife2.current) {
            const canvas = canvasRef.current;
            canvas.width = canvas_w;
            canvas.height = canvas_h;
            // 1000ms마다 renderGame 호출
            const intervalId = setInterval(() => {
                renderGame();
            }, rendering_interval);

            const intervalId1 = setInterval(() => {
                updatesound();
             }, 500);
            

            return () => {
                clearInterval(intervalId);
                clearInterval(intervalId1); // 컴포넌트가 unmount될 때 interval 해제
            };
        }
      }, [myId]);


    useEffect(()=>{
        if(interact){
            heartbeat_src.play();
            soundplay.current=true;
        }
    },[interact]);

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

        if(!heartbeat_src.paused || soundplay.current){
            heartbeat_src.pause();
            if(closestdistance<250){
                heartbeat_src.playbackRate=3;
                heartbeat_src.play();
            }
            else if(closestdistance<500){
                heartbeat_src.playbackRate=2;
                heartbeat_src.play();
            }
            else {
                heartbeat_src.playbackRate=1;
                heartbeat_src.play();
            }
        }
    }

    const renderGame = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let cur = get_player.current[myId];
        context.clearRect(0, 0, canvas.width, canvas.height);

        const lightAngle = Math.PI / 2; // 45도 부채꼴 모양으로 밝힘
        const lightDistance = 1000; // 밝힐 최대 거리
        const mouseangle = Math.atan2(cur.dy, cur.dx);
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


        context.globalAlpha = 0.75;
        context.drawImage(map.current, cameraX, cameraY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1.0;

        context.save();
        context.beginPath();
        context.moveTo(cur.x - cameraX, cur.y - cameraY);
        context.arc(cur.x - cameraX, cur.y - cameraY, lightDistance, mouseangle - lightAngle / 2, mouseangle + lightAngle / 2);
        context.lineTo(cur.x - cameraX, cur.y - cameraY);
        context.closePath();
        context.clip();

        const brightMapCanvas = document.createElement('canvas');
        brightMapCanvas.width = canvas.width;
        brightMapCanvas.height = canvas.height;
        const brightMapContext = brightMapCanvas.getContext('2d');

        // 부채꼴 모양으로 밝기 조절
        brightMapContext.globalAlpha = 1; // 밝기 조절 정도 (0.5는 반투명)
        brightMapContext.drawImage(map.current, cameraX, cameraY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

        // 나머지 맵 어둡게 처리
        context.globalCompositeOperation = 'destination-atop';
        context.drawImage(brightMapCanvas, 0, 0);
        context.globalCompositeOperation = 'source-over';

        context.restore();


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
                const isWithin = innerangle < vision_angle;

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
                if (!isWithin || iswall) {
                    context.globalAlpha = 0; // 투명도 설정 (0.5: 반투명)
                }
                else{
                    context.globalAlpha = 1;
                    drawProgressBar(tx-30, ty-50, user.state, 100,'#4CAF50', 60 ,6);
                    
                }
            } 
            else {
                drawProgressBar(tx-30, ty-50, user.state, 100,'#4CAF50', 60 ,6);
                if(weaponstate.current===1){
                    drawProgressBar(tx-30, ty-35, num_bullet.current, total_bullet_num,'#FE2E64', 58, 2);
                }
                else if(weaponstate.current===3){
                    drawProgressBar(tx-30, ty-35, num_fire.current, total_fire_num,'#FE2E64', 58, 2);
                }
            }

            context.translate(tx, ty);
            context.rotate(angle);
            context.scale(0.3, 0.3);
            if(user.weapon===1){
                if(user.hit){
                    context.drawImage(pistol2.current, -pistol2.current.width / 2, -pistol2.current.height / 2);
                }
                else{
                    context.drawImage(pistol.current, -pistol.current.width / 2, -pistol.current.height / 2);
                }
            }

            else if(user.weapon===2){
                context.drawImage(knife.current, -knife.current.width / 2, -knife.current.height / 2);
            }
            else if(user.weapon===2.5){
                context.drawImage(knife2.current, -knife2.current.width / 2, -knife2.current.height / 2);
            }
            else if(user.weapon===3 || user.weapon===3.5){
                context.drawImage(fireshot.current, -fireshot.current.width / 2, -fireshot.current.height / 2);
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
            
                socket.current.emit("shoot_bullet", {
                    x: cur.x + 30*Math.cos(angle)-20*Math.sin(angle), //캐릭터 총구로 보정 
                    y: cur.y +30*Math.sin(angle)+20*Math.cos(angle), // 캐릭터 총구로 보정
                    angle:angle,
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

        if(weaponstate.current===2.5){
            knifeswing.current -=1;
            if (knifeswing.current===24){
                const angle = Math.atan2(
                    knifeposition.current[1]-context.canvas.offsetTop-cur.y+cameraY,
                    knifeposition.current[0]-context.canvas.offsetLeft-cur.x+cameraX
                )
                socket.current.emit("knifeswing", {
                    x: cur.x + 30*Math.cos(angle), 
                    y: cur.y +30*Math.sin(angle), 
                    angle:angle,
                    user : cur.id,
                    user_name : cur.nickname
                })

            }
            if(knifeswing.current===0){
                weaponstate.current=2;
            }
        }

        if (fire.current){
            if(num_fire.current > 0){ // 총알이 남아 있으면
                if (firing.current){
                    firing.current-=1;
                    if(!(firing.current%4)){
                        const angle = Math.atan2(
                            fire.current[1]-context.canvas.offsetTop-cur.y+cameraY,
                            fire.current[0]-context.canvas.offsetLeft-cur.x+cameraX
                        )
                        socket.current.emit("shoot_fire", {
                            x: cur.x + 30*Math.cos(angle)-20*Math.sin(angle), //캐릭터 총구로 보정 
                            y: cur.y +30*Math.sin(angle)+20*Math.cos(angle), // 캐릭터 총구로 보정
                            angle:angle,
                            user : cur.id, // 누가 쐈는지 저장
                            user_name : cur.nickname,
                            life: 50
                        })
                    }
                            
                }
                else{
                    fire.current = null; 
                    weaponstate.current=3;
                    num_fire.current -= 1; 
                }                
            }
            else {
                if(reload_frame_number.current===reload_time / rendering_interval){
                    console.log('reload');
                    reload();
                }
                // 재장전
                if(reload_frame_number.current > 0){
                    reload_frame_number.current -= 1;
                } else{
                    reload_frame_number.current = reload_time / rendering_interval;
                    fire.current = null; 
                }
                weaponstate.current=3;
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

        const filtered_fires = [];
        for (let i=0; i<fires.current.length; i++) {
            let fire_cur = fires.current[i];
            fire_cur.life-=1;
            fire_cur.x += Math.cos(fire_cur.angle)*firevelocity;
            fire_cur.y += Math.sin(fire_cur.angle)*firevelocity;
            
            context.save();

            context.translate(fire_cur.x - cameraX, fire_cur.y- cameraY);
            context.rotate(fire_cur.angle);
            context.drawImage(fire_img.current, -fire_img.current.width / 2, -fire_img.current.height / 2);
            context.rotate(-fire_cur.angle);
            context.translate(-fire_cur.x + cameraX, fire_cur.y + cameraY);
            context.restore(); 

            // 벽 충돌하면 제거
            const p = Math.floor(fire_cur.x / tile_size);
            const q = Math.floor(fire_cur.y / tile_size);
            if(wall.current[q][p] === 1 || fire_cur.life===0){
                continue;
            } else{
                filtered_fires.push(fire_cur);
            }

        }
        fires.current = filtered_fires;

        // 아이템 그리기
        for(let item_id in items.current){
            let item_cur = items.current[item_id];
            
            const mdifx = mousepointerX.current-context.canvas.offsetLeft-cur.x+cameraX;
            const mdify = mousepointerY.current-context.canvas.offsetTop-cur.y+cameraY;
            const edifx = item_cur.x - cur.x;
            const edify = item_cur.y - cur.y;
            const mdif = Math.sqrt(mdifx**2 + mdify**2);
            const edif = Math.sqrt(edifx**2 + edify**2);
            const inner = (mdifx*edifx+mdify*edify)/(mdif*edif);
            const innerangle = Math.acos(inner);
            const isWithin = innerangle < vision_angle;

            let iswall = 0;
            const itemangle = Math.acos(edifx/edif);
            let sign=1;
            if(edify<0)sign=-1;
            const plusx = search_distance*Math.cos(itemangle);
            const plusy = search_distance*Math.sin(itemangle)*sign;
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

            if(isWithin && !iswall){
                context.drawImage(item_img.current, item_cur.x - cameraX, item_cur.y - cameraY);   
            }
        }


        // 아이템 충돌처리
        handleEatItem(cur);
        
        // 총알 충돌처리 
        handleCollisions(cur);

        
        // 킬 수 표시하기
        context.font = '20px Arial';
        context.fillStyle = '#FFF';
        context.textAlign = 'center';
        context.fillText("Kill : "+ cur.kill, canvas.width- 80, 60);
        
        // 접속 유저 수 표시 
        context.fillText("Total Users : "+ Object.keys(get_player.current).length, canvas.width-80, 30);


        // 킬 로그'
        context.font = '20px Arial';
        const filtered_kill_log = [];
        const size = kill_log.current.length;
        for(let i=0; i<size; i++){
            const log = kill_log.current[i];
            context.fillText(log.kill +" kills " +log.dead, canvas.width-100, 100 + 15 *i);
            log.life -= 1;
            if(log.life > 0){
                filtered_kill_log.push(log);
            }
        }
        kill_log.current = filtered_kill_log

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
        cur.weapon=weaponstate.current;
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
    function checkCollision(character, bullet, criteria) {
        const distance = calculateDistance(
            character.x, character.y,
            bullet.x, bullet.y
        );
        // 일정 거리 내에 있으면 충돌로 간주
        return distance < criteria;
    }



    function handleCollisions(cur) {
        //const cur = get_player.current[myId];
    
        for (let bulletId in bullets.current) {
            const bullet_cur = bullets.current[bulletId];
            if (checkCollision(cur, bullet_cur, bullet_collision_distance)) {
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
                    if(!heartbeat_src.paused) heartbeat_src.pause();
                    navigate('../Restart', {replace:false, state:{nickname : nickname, who : bullet_cur.user_name, error:false}});
                }
            }
        }

        for (let i=0; i<knifeswings.current.length; i++){
            const knifeswing = knifeswings.current[i];
            if (checkCollision(cur, knifeswing, bullet_collision_distance)){
                cur.state-=50;
                if(cur.state <= 0){ // 사망 처리
                    socket.current.emit("deathknife", cur, knifeswing);
                    // bullet_cur.user로 점수나 킬 올리기
                    if(!heartbeat_src.paused) heartbeat_src.pause();
                    navigate('../Restart', {replace:false, state:{nickname : nickname, who : knifeswing.user_name, error:false}});
                }
            }
        }
        knifeswings.current=[];

        for(let i=0; i<fires.current.length;i++){
            const fire = fires.current[i];
            if (checkCollision(cur, fire, bullet_collision_distance)){
                cur.state-=0.5;
                if(cur.state <= 0){ // 사망 처리
                    socket.current.emit("deathknife", cur, fire);
                    // bullet_cur.user로 점수나 킬 올리기
                    if(!heartbeat_src.paused) heartbeat_src.pause();
                    navigate('../Restart', {replace:false, state:{nickname : nickname, who : fire.user_name, error:false}});
                }
            }
        }
    }  

    function handleEatItem(cur){
        for(let item_id in items.current){
            const item_cur = items.current[item_id];
            if(checkCollision(cur, item_cur, item_collision_distance)){
                cur.state += 50;
                if(cur.state > 100) cur.state = 100;

                delete items.current[item_id];
                socket.current.emit('eat_item', item_id);
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