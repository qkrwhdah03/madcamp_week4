import './Restart.css'
import React, {useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Restart(){
    const navigate = useNavigate();
    const {state} = useLocation();
    const prev_nickname = state?.nickname;
    const killed_by = state?.who;
    const network_error = state?.error;
    const [nickname, setNickName] = useState(prev_nickname);
    const handleNickNameChange= (e) =>{
        setNickName(e.target.value);
    }
    const handleEnter = () =>{
    // 서버에 닉네임을 보내면서 socket.io 연결 요청
    navigate('../mainGame', {replace:false, state:{nickname : nickname}})
    }
    return (
        <div className='restart'>
            <div className='you_died'>{network_error? "Network Connection Error":"You were killed by "+killed_by+"!"}</div>
            <div className='restart_game_container'>
            <div className='restart_title'>Restart</div>
            <div className='restart_game_input_block'>
            <label htmlFor='nickname'>닉네임</label>
            <input type='text' id='nickname' value={nickname} onChange={handleNickNameChange}></input>
          </div>
          <button className='enter_button' type='submit' onClick={handleEnter}>입장</button>
            </div>
        </div>
    )
}
export default Restart;