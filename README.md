
# 🕹️ Madden Attack 
```
  - 실시간 멀티플레이 FPS 웹 게임!
  - 로그인 없이 간편한 접속! 
  - 2D 탑뷰 1인칭 시야! 
```
<div style="display: flex; justify-content: center;  align-items: center;">
  <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/97c24618-8fc1-4371-bf67-e157a1907a2c" alt="image" width="300" />
</div>

## 개발자
- 카이스트 20학번 전산학부 이경민
- 카이스트 22학번 전산학부 박종모 

## 기술스택
### 프론트엔드 : React - Canvas를 이용한 2D 렌더링 
### 백엔드 :  Node.js - express, socket.io, http 등 
### 디자인 소스

#### 플레이어
- [Animated Top-Down Survivor Player](https://opengameart.org/content/animated-top-down-survivor-player)

#### 배경
- [Free Forest Tiles](https://rengodev.itch.io/free-forest-tiles)
- [Rogue Fantasy Catacombs](https://szadiart.itch.io/rogue-fantasy-catacombs?downloa)

#### 구조물
- [Sci-Fi Space Simple Bullets](https://opengameart.org/content/sci-fi-space-simple-bullets)

## 개발 과정
1.19 [socket.io](http://socket.io) 를 이용한 실시간 통신 구현
- [x]  서버 - [socket.io](http://socket.io)를 이용해 유저 입장, 실시간 연결 처리
- [x]  프론트엔드 - 유저 닉네임 입력 후 서버에 연결해서 입장 처리 후, 게임 화면 띄우기
- [x]  입장 후 키보드 입력으로 이동 구현

1.20~21 총 발사 구현 
- [x]  총 발사 모션, 총알 이동, 명중 처리
- [x]  유저 HP, 장전 등 요소 추가 필요
- [x]  HP 화면에 추가 - 모든 유저 위에 bar 추가
- [x]  총알 수 화면에 추가
- [x]  유저 킬 수 화면에 추가
- [x]  유저 사망 시에 종료 화면 구현 - 재참여 버튼, 종료 버튼 등
- [x]  게임 창이 비활성화 되었을 때 처리 방법 필요 - 그냥 죽은걸로 처리함
- [x]  총알 asset 넣기
- [x]  마우스 십자가로 변경
- [x]  프론트 서버 배포

1.22 구조물 맵 생성 
- [x]  유저 명중, 킬, 죽음, 재장전  - 소리 추가
- [x]  게임 플레이 맵 생성  - 바닥 디자인
- [x]  구조물에 의한 이동 막힘, 총알 막힘 등 구현
- [x]  구조물 맵 디자인 필요
- [x]  지하 통로 워프
- [x]  스폰 장소 정하기

1.23~24 시야 가리도록 처리 
- [x]  특정 범위만 유저가 볼 수 있도록 시야 범위 제한
- [x]  구조물에 의한 가려짐도 처리해야함
- [x]  해당 범위 외의 부분을 가리면 될듯..?
- [x]  새로고침 시 소리 오류 해결
- [x]  접속시 화면 안뜨는 버그 수정해야함 - 새로고침으로 일단 해결가능..

- [x]  무기 칼 추가
- [x]  아이템 회복템
- [x]  처음 들어가는 화면 디자인
- [x]  장애물 만들기
- [x]  킬 이펙트 추가
- [x]  총알 맞을때 이펙트 추가
- [x]  화염방사기 추가
- [x]  소리 에러 잡기
- [x]  킬 수 안 오르는 버그.?
- [x]  weapon null error 잡기

1.25. 추가 기능 / 버그 수정 (목)
- [ ]  유저가 방 생성해서 입장 가능하도록 구현하기 - 백엔드에서 잘 처리하면 될듯
- [ ]  현재 유저들 랭킹 보여주기 - ex) 점수, 킬 수 등으로 정렬해서
- [x]  총 종류를 늘린다?
- [ ]  그 외 떠오르는 아이디어들

## 게임 구성
  <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/f086b49a-b9cf-41ec-9988-c67142c0be06"  alt="image" width="400" height="300" />
  <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/c6c565e3-b132-4117-9bf2-76bf64e11290" alt="image" width="400" height="300" />
  <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/6be6c47e-515f-4874-beb8-fbedbae87f8a"  alt="image" width="400" height="300"/>

### 기본 조작
- 캐릭터 이동은 키보드의 wsad 키를 이용하여 상하좌우로 조작이 가능합니다.
- 캐릭터의 시야 조작의 경우 마우스 커서를 따라서 캐릭터가 회전합니다.

### 시야
- 2D에서 1인칭 fps 게임의 특성을 극대화 하기 위해 시야를 제한하였습니다.

  <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/6fc4fa8e-52fb-443e-ae81-7f464928c985"  alt="image" width="400" height="300" />

- 마우스 커서를 기준으로 좌우 "45도"까지만 시야를 활성화했습니다.

   <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/7dee77a1-fb21-4dc7-becb-021a9c345242"  alt="image" width="400" height="300" />

- 해당 범위 외에 위치한 유저와 아이템은 플레이어에게 보이지 않습니다.

   <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/dba5def2-5815-4f54-941e-1f088537c1c7"  alt="image" width="400" height="300" />

- 또한, 해당 시야범위에 포함되었더라도 구조물(벽)에 의해 가려진 경우 마찬가지로 표시되지 않습니다.

- 총 소리의 시각화를 위해서 총알의 경우 시야를 따로 제한하지 않았습니다.

### 사운드 플레이
- 시야 외에 추가적으로 주변 적들에 대한 정보를 주기 위해 심장 소리를 도입했습니다.
- 게임을 시작하면 나는 심장소리는 적들과의 거리가 가까워질 수록 그 소리가 빨라지도록 구현했습니다.
- 이를 통해 보이지 않는 적들 또한 감지하며 게임 플레이가 가능합니다.

### 맵
맵의 구성은 다음과 같습니다. <br>
 <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/b15629c0-ad7d-4546-90a1-580f1a4322de"  alt="image" width="300" height="300" />
 
- 유저들이 최대한 많이 교전할 수 있도록 방들이 연결되어있는 형태로 구성했으며, 몸을 숨길 수 있는 엄폐물을 중간중간에 배치하였습니다.
- 또한, 교전 중 탈출이 가능하도록 맵의 좌측상단-우측하단, 맵 중앙 벽 사이의 비밀통로를 구성하여 순간이동이 가능하도록 했습니다. 

### 아이템
 <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/1cf37eef-0bfa-4c2e-a89e-8ca2f153788e"  alt="image" width="300" height="300" /> <br>
- 아이템의 경우 서버를 통해서 10초에 한 번씩 최대 5개가 맵에 생성됩니다.
- 유저가 아이템에 충분히 가까이 다가가게 되면 아이템을 먹게되며, 유저는 체력을 50% 회복하게 됩니다.

### 무기
- 무기는 4개의 종류를 구현했으며, 숫자 키 1, 2, 3, 4를 통해 무기 변경이 가능합니다.
- 각 무기에 맞는 캐릭터 이미지, 모션, 소리를 추가해주었습니다. <br>
   <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/38972509-8224-4904-b605-e2246ff37926"  alt="image" width="300" height="300" /> <br>
- 1번 무기는 기본 총으로 마우스를 클릭하여 총을 발사할 수 있습니다.
- 총 12발을 발사할 수 있고 명중 시에 10만큼의 데미지를 주게 됩니다. <br>
   <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/650a7a09-5a42-4a3a-b3e6-4a8e35f4a60d"  alt="image" width="300" height="300" /> <br>
- 2번 무기는 칼로 근접전에 유용한 무기입니다. 마우스 클릭을 하면 캐릭터가 칼을 휘두르게 되며 50만큼의 데미지를 상대에게 입힙니다. <br>
   <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/b8da8471-1006-4eaa-85d4-a076d5e06c3f"  alt="image" width="300" height="300" /> <br>
- 3번째 무기는 화염방사기로 데미지는 0.5로 약하지만 한 번의 클릭으로 다수의 화염이 발사되어 적을 불태웁니다.<br>
   <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/ee1a4484-ef34-4d42-b352-581ee504dcc3"  alt="image" width="300" height="300" /> <br>
- 마지막 무기는 수류탄으로 게임 중에 2번만 사용할 수 있습니다. 클릭시에 일정 거리에 수류탄이 떨어지게 되며 3초 후에 폭발하여 80만큼의 데미지를 줍니다.



### 피격, 킬 Effect 
- 게임의 재미를 더하기 위해 플레이중 피격, 킬을 하였을 때 화면에 시각적 효과를 추가해주었습니다. <br>
  <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/46e639ed-7b8a-4579-a63e-f93414d96a6d"  alt="image" width="300" height="300" /> <br>
- 상대 플레이어에게 데미지를 입게 되면 위 사진과 같이 붉은 색의 화면이 일정시간 나타났다 사라지게 됩니다. <br>
  <img src="https://github.com/qkrwhdah03/madcamp_week4_front/assets/57566463/d21a65cc-854b-441f-af4e-1593ab5a6ffa"  alt="image" width="300" height="300" /> <br>

- 다른 플레이어를 죽이게 되면 위와 같이 현재 킬수와 죽인 유저의 닉네임이 함께 뜨게 됩니다.
- 다른 유저들에게는 우측 상단에 킬로그가 나타나게 됩니다. 
