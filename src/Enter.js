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
      navigate('../mainGame', {replace:true, state:{nickname : nickname}})
    }
  
    return (
      <div className='background'>
        <div className="enter" style={{
          background: `url('${process.env.PUBLIC_URL}/enter.png')`,
          backgroundSize: '70%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'}}>
          <div className='enter_game_input_container'>
            <div className='enter_game_input_block'>
              <label className="nickname" htmlFor='nickname'>Nickname</label>
              <input className="input" type='text' id='nickname' value={nickname} onChange={handleNickNameChange}></input>
              <button className='enter_button' type='submit' onClick={handleEnter}>Start</button>
            </div>
          </div>
        </div>
      </div>
    );
}

export default Enter;