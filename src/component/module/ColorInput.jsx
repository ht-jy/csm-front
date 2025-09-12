import { HexColorPicker } from "react-colorful";
import { useEffect, useRef, useState } from "react";
import "../../assets/css/Input.css"


const ColorInput = ({initColor, setColor, style}) => {
      const [inputColor, setInputColor] = useState("#000000");
    const [hoverOpen, setHoverOpen] = useState(false);
    const colorRef = useRef();

    const handleChangeColor = (value) => {
        setInputColor(value);
        setColor(value);
    }

    useEffect(() => {
        setInputColor(initColor);
    }, [initColor]);


    useEffect(() => {
        const handleClick = (e) => {
            if (colorRef.current?.contains(e.target)) {
                return;
            } else {
                setHoverOpen(false);
            }
        };

        document.body.addEventListener("click", handleClick);
        return () => {
            document.body.removeEventListener("click", handleClick);
        };
    }, []);


    const palette = ["#ff1919ff","#FDB7EA", "#ff9901ff",  "#f8f81eff", "#33681cff", "#63dbffff","#0000FF", "#002b80ff" ,"#9447b3ff", "#000000"];
  return (
    <div>
        <div
        style={{...style, width:"100%" }}
        ref = {colorRef}
        onClick={() => setHoverOpen(prev => !prev)}
        >

            <div 
                className="color-box"
                style = {{ backgroundColor : inputColor}}
            >
            </div>
            { hoverOpen && 
                <div className="palette" onClick={(e) => e.stopPropagation()}>    
                    <HexColorPicker className="color-picker" style={{width:"10rem", height:"8rem"}} color={inputColor} onChange={handleChangeColor} />
    
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap:"wrap", width:"9.5rem"}}>
                        {palette.map((p) => (
                            <button
                            key={p}
                            style={{ background: p, width: "1.5rem", height: "1.5rem", border:"0", borderRadius:"0.25rem" }}
                            onClick={() => handleChangeColor(p)}
                            />
                        ))}
                    </div>

                </div>
            }
        </div>
    </div>

  );
}

export default ColorInput;