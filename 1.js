

var gl;

function start(){
    main("square");
    main("triangle");
}

// инициализация GL
function initWebGL(canvas){
    gl = null;
    try { // Попытаться получить стандартный контекст.  // Если не получится, попробовать получить экспериментальный.
    gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch(e) {}
    if (!gl) { // Если мы не получили контекст GL, завершить работу
    alert("Не удалось инициализировать WebGL. Ваш браузер может не поддерживать это.");
    gl = null;
    }
    return gl;
}

//шейдеры
//вершинные 
const vsSquare=`
attribute vec2 vertPosition;
void main() {
  gl_Position = vec4(vertPosition,0.0, 1.0);
}`;

const vsTriangle=`
attribute vec2 vertPosition;
attribute vec3 vertColor;
varying vec3 fragColor;
void main() {
  fragColor = vertColor;
  gl_Position = vec4(vertPosition,0.0,  1.0);
}`;

//фрагментые
const fsSquare =`
precision mediump float;
varying vec3 fragColor;
void main() {
    gl_FragColor = vec4(0.0, 0.5, 1.0, 1.0); //цвет 
}`;

const fsTtriangle =`
precision mediump float;
varying vec3 fragColor;
void main() {
    gl_FragColor = vec4(fragColor, 1.0);
}`;

//MAIN!
function main(type){
    var canvas = document.getElementById(type);

    gl = initWebGL(canvas); 
    if (gl) { // продолжать только если WebGL доступен и работает
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);  // Устанавливаем размер вьюпорта
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // установить в качестве цвета очистки буфера цвета черный, полная непрозрачность
        gl.enable(gl.DEPTH_TEST);// включает использование буфера глубины
        gl.depthFunc(gl.LEQUAL); // определяет работу буфера глубины: более ближние объекты перекрывают дальние
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); // очистить буфер цвета и буфер глубины
        if (type=="square")
        {
            const shaderProgram = initShaderProgram(gl, vsSquare, fsSquare);
            gl.useProgram(shaderProgram);
            
            drawScene("square",shaderProgram);
        }
        else if (type=="triangle")
        {
            const shaderProgram = initShaderProgram(gl, vsTriangle, fsTtriangle);
            gl.useProgram(shaderProgram);
            
            drawScene("triangle",shaderProgram);
        }
    
    }


}

//

function initShaderProgram(gl, vsSource, fsSource) {

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();//создание программы шейдер
    gl.attachShader(shaderProgram, vertexShader); //присоединение шейдеров
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram); //объединение

     // если ошибка программы шейдер
     if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Не удается инициализировать шейдерную программу: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;

}

function loadShader(gl, type, source){

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);//Отправить source в объект шейдера
    gl.compileShader(shader);  // компиляция шейдеров
    
    // проверка на успех
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('Произошла ошибка при компиляции шейдеров: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

//создание объекта и сцены
function drawScene(type,shaderProgram){

    if (type=="square"){
        const vertices = [
            0.5, 0.5, 
            -0.5, 0.5, 
            0.5, -0.5, 
            -0.5, -0.5
            ];  
            var squareVerticesBuffer = gl.createBuffer(); //создаем баффер, там хранятся данные о вершине и цвета
            gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer); //привязываем баффер к точкам привязки(array_buffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); //создаем хранилице из данных буфера
        
            var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertPosition');
            gl.enableVertexAttribArray(vertexPositionAttribute); // вкл артибуты 
            gl.vertexAttribPointer( //привязывает атрибут к текущему буферу
                vertexPositionAttribute, // индекс артибута вершины
                2, // количесвто компонентов на атрибут вершины
                gl.FLOAT, //тип каждого компоненнта в хранилице(буфере)
                false, // True, если будут нормализованы
                0, // Шаг инициализации..(?)
                0 // смешение - позиция в буфере, с которой начинается обработка
            );
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); //рисуем примитивы из данных
    }
    else if(type=="triangle"){
        const vertices = [//x,y,    r,g,b
        0.0, 1.0,   0.0, 0.0, 1.0,
        -1.0, -1.0, 0.0, 1.0, 0.0,
        1.0, -1.0,  1.0, 0.0, 0.0
    ];

    var triangleVerticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
        var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertPosition'); //ссылка на атрибут куда идут координаты 
        var colorPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertColor');

        gl.vertexAttribPointer( vertexPositionAttribute, 2, gl.FLOAT, false,  5*Float32Array.BYTES_PER_ELEMENT,  0 );
        gl.vertexAttribPointer(colorPositionAttribute,3,gl.FLOAT,false, 5*Float32Array.BYTES_PER_ELEMENT, 2*Float32Array.BYTES_PER_ELEMENT);
        //первые 5 и 2 элемента под координаты 5*... 28...

        gl.enableVertexAttribArray(vertexPositionAttribute);
        gl.enableVertexAttribArray(colorPositionAttribute);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

    }

        
    




}
