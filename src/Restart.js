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
        <div className='background'>
            <div className='restart' style={{
          background: `url('${process.env.PUBLIC_URL}/restart.png')`,
          backgroundSize: '70%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'}}>
                <div className='restart_game_container'>
                    <div className='you_died'>{network_error? "Network Connection Error":"You were killed by " +killed_by+"!"}
                    </div>
                    <div className='restart_game_input_block'>
                        <label className='nickname' htmlFor='nickname'>Nickname</label>
                        <input className='input' type='text' id='nickname' value={nickname} onChange={handleNickNameChange}></input>
                        <button className='enter_button' type='submit' onClick={handleEnter}>Restart</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Restart;