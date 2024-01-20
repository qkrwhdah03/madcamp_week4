import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './Enter.css';

function Enter(){
    const navigate = useNavigate();
    const [nickname, setNickName] = useState('');
    const handleNickNameChange= (e) =>{
      setNickName(e.target.value);
    }
  
    const handleEnter = () =>{
      // 서버에 닉네임을 보내면서 socket.io 연결 요청
      navigate('../mainGame', {replace:false, state:{nickname : nickname}})
    }
  
    return (
      <div className="enter">
        <div className='enter_game_input_container'>
          <div className='enter_game_input_title'>게임 입장</div>
          <div className='enter_game_input_block'>
            <label htmlFor='nickname'>닉네임</label>
            <input type='text' id='nickname' value={nickname} onChange={handleNickNameChange}></input>
          </div>
          <button className='enter_button' type='submit' onClick={handleEnter}>입장</button>
        </div>
      </div>
    );
}

export default Enter;