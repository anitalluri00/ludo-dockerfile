import React, { useEffect, useRef, useState, useContext } from 'react';
import { PlayerDataContext } from '../../App';
import axios from 'axios';
import positions from './positions';
import './Map.css';

const Map = ({ pawns, nowMoving, rolledNumber }) => {
    const context = useContext(PlayerDataContext);
    const [hintPawn, setHintPawn] = useState();

    const paintPawn = (context, x, y, color) =>{
        const circle = new Path2D();
        circle.arc(x, y, 12, 0, 2 * Math.PI);
        context.strokeStyle = 'black';
        context.stroke(circle);
        context.fillStyle = color;
        context.fill(circle);
        return circle;
    }

    const canvasRef = useRef(null);
    
    const handleCanvasClick = event => {
        // If hint pawn exist it means that pawn can move 
        if(hintPawn){
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            const rect = canvas.getBoundingClientRect(),
            x = event.clientX - rect.left,
            y = event.clientY - rect.top;
            for(const pawn of pawns){
                if (ctx.isPointInPath(pawn.circle, x, y)) {
                    axios.post('http://localhost:3000/game/move', {pawnId: pawn._id, position: hintPawn.position},
                    {
                        withCredentials: true, 
                    });
                    setHintPawn(null);
                }
            }
        }
    }
    const getHintPawnPosition = (pawn) => {
        /* 
            Based on color (because specific color have specific base positions)
            first if for each colors handle situation when pawn is in base
            next if pawn is in the end or will go in there
            else if pawn is on map 
        */
        let { position } = pawn;
        switch (context.color){
            case 'red': 
                if(position >= 0 && position <= 3){
                    return 16;
                }else if(position > 15 && position + rolledNumber <= 66){
                    return position + rolledNumber;
                }else{
                    return  67 + (position + rolledNumber - 66);
                }
            case 'blue': 
                if(position >= 4 && position <= 7){
                    return 55;
                }else if(position+rolledNumber>55 || position+rolledNumber <= 53){
                    return position + rolledNumber;
                }else{
                    return  71 + (position + rolledNumber - 53);
                }
            case 'green': 
                if(position >= 8 && position <= 11){
                    return 42;
                }else if(position + rolledNumber > 42 || position+rolledNumber <= 40){
                    return position + rolledNumber;
                }else{
                    return 76 - (position + rolledNumber - 40)
                }
            case 'yellow': 
                if(position >= 12 && position <= 15){
                    return 29;
                }else if(position + rolledNumber > 29 || position+rolledNumber <= 27){
                    return position + rolledNumber;
                }else{
                    return 82 + (position + rolledNumber - 27)
                }
        }
        
    };
    const handleMouseMove = event => {   
        if(nowMoving && rolledNumber){ 
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            // Gets x and y cords of mouse on canvas
            const rect = canvas.getBoundingClientRect(),
            x = event.clientX - rect.left,
            y = event.clientY - rect.top;
            canvas.style.cursor = "default";
            for (const pawn of pawns){
                if(pawn.circle){
                    /*
                        This condition checks if mouse location is:
                        1) on pawn
                        2) is color of pawn same as player's
                        3) if pawn is on base is rolledNumber is 1 or 6 which allows pawn to exit base
                        And then sets cursor to pointer and paints hint pawn - where will be pawn after click
                    */
                   //&& (pawn.position>15 || rolledNumber === 1 || rolledNumber === 6)
                   console.log(context, pawn.color)
                    if (ctx.isPointInPath(pawn.circle, x, y)  && context.color == pawn.color) {
                        canvas.style.cursor = "pointer";
                        const pawnPosition = getHintPawnPosition(pawn);
                        setHintPawn({id: pawn._id, position: pawnPosition, color: 'grey'});
                        break;
                    }else{
                        setHintPawn(null);
                    }
                }   
            }
        }
    };
    const rerenderCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        var image = new Image();
        image.src = 'https://img-9gag-fun.9cache.com/photo/a8GdpYZ_460s.jpg';
        image.onload = function() {
            context.drawImage(image, 0 , 0);
            pawns.forEach( (pawn, index) => {
                pawns[index].circle = paintPawn(context, positions[pawn.position].x, positions[pawn.position].y, pawn.color);
            });
            if (hintPawn){
                paintPawn(context, positions[hintPawn.position].x, positions[hintPawn.position].y, hintPawn.color);
            }
        }
    }
    // Rerender canvas when pawns have changed
    useEffect(() => {
        console.log(context.color);
        rerenderCanvas(); 
    }, [hintPawn, pawns]);

    return(
        <canvas 
            className="canvas-container" 
            width={480} 
            height={480} 
            ref={canvasRef} 
            onClick={handleCanvasClick} 
            onMouseMove={handleMouseMove}
        />
    )
}
export default Map;