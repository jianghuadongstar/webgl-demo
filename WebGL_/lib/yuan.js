/**
 * Created by Administrator on 2017/5/22 0022.
 */
// Vertex shader program
var YUAN_VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' +        // Normal
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
    'uniform vec3 u_AmbientLight;\n' +     // Light color
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position ;\n' +
        // Make the length of the normal 1.0
    '  vec3 normal = normalize(a_Normal.xyz);\n' +
        // Dot product of the light direction and the orientation of a surface (the normal)
    '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
        // Calculate the color due to diffuse reflection
    '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
    '  vec3 ambient = u_AmbientLight * a_Color.rgb ;\n' +
    '  v_Color = vec4(diffuse+ambient, a_Color.a);\n' +
    '}\n';

// Fragment shader program
var YUAN_FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +

    '}\n';

var vs =
    " attribute vec4 a_Position_l;\n" +
    ' uniform mat4 u_MvpMatrix_l;\n' +
    " void main(){\n" +
    '  gl_Position = u_MvpMatrix_l * a_Position_l ;\n' +
    '  gl_PointSize = 5.0;\n'+
    "}\n";
var fs =
    " precision highp float;\n" +
    " void main(){\n" +
    "   gl_FragColor = vec4(1.0,1.0,0.0,1.0);\n" +
    "}\n";

    /*
     * function  main
     *
     * gl                  webgl环境
     * index_h     int     定义圆柱的高度  整数
     * sx          float   定义圆柱的宽度  小数
     * PX,PY,PZ  float     圆柱平移的  x y z,三个方向的位移（以屏幕为中心为坐标轴）
     * */
    function main() {
        // Retrieve <canvas> element
        var canvas = document.getElementById('webgl');

        // Get the rendering context for WebGL
        var gl = getWebGLContext(canvas);
        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }
        // Initialize shaders
        if (!initShaders(gl, YUAN_VSHADER_SOURCE, YUAN_FSHADER_SOURCE)) {
            console.log('Failed to intialize shaders.');
            return;
        }

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        // Set the clear color and enable the depth test


        // Get the storage location of u_MvpMatrix
        var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
        var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
        var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
        var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
        if (!u_MvpMatrix || !u_LightColor || !u_LightDirection ||!u_AmbientLight) {
            console.log('Failed to get the storage location');
            return;
        }
        gl.uniform3f(u_AmbientLight, 0.9,0.0,0.0);
        // 设置为白光
        gl.uniform3f(u_LightColor, 1.0, 2.0, 1.0);
        // 在世界坐标 设置光方向
        var lightDirection = new Vector3([3.0,2.0,4.0]);
        lightDirection.normalize();     // 归一化
        gl.uniform3fv(u_LightDirection, lightDirection.elements);
        // 设置照相机和视点
        var mvpMatrix = new Matrix4();

        mvpMatrix.setPerspective(90.0, 2, 1, 1000);
        mvpMatrix.setLookAt(0, 0, 0, 0, 0, -1, 0, 1, 0);
        // Clear color and depth buffer
        //gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //mvpMatrix.scale(1.0, 1.0, 1.0);
        let arr = [];
        for(var j=0;j<=6;j+=3){
            var rn = Math.round(Math.random()*30+10);
            var rx = Math.random()*720-360.0;
            var ry = Math.random()*280-(200-rn-40);

            arr[j] = rx;
            arr[j+1] = ry;
            arr[j+2] = rn;
        }
        console.log(arr);
        for(var k=0;k<arr.length;k+=3){
            draw(initVertexBuffers(gl,arr[k]/400,arr[k+1]/200,0.0),gl,arr[k+2]);
            //draw(initVertexBuffers(gl,arr[k]/50,arr[k+1]/50,0.0/50),gl,30);

        }
        var line = [
            100,0,0,
            -100,100,0
        ];
        //lineMian(arr);
        drawLine(arr);
        function draw(n,gl,index_h){
            var Y= -0.01;
            for (var i=0;i<index_h;i++){
                mvpMatrix.translate(0 ,Y,0);
                //Y -= 0.01;
                // Pass the model view projection matrix to u_MvpMatrix
                gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
                gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
                //console.log(n)
            }
            mvpMatrix.translate(0 ,-Y*index_h,0);
        }

        //cubeX,cubeY,cubeZ   圆柱的位置坐标
        function initVertexBuffers(gl,x,y,z) {
            let a ,sin,cos;
            let n = 20;
            var ai = 2*Math.PI/n;
            let positions = [],indices=[];
            positions.push(x);
            positions.push(y);
            positions.push(z);

            for (let i = 0; i < n; i++) {
                a = ai*i;
                sin = Math.sin(a);
                cos = Math.cos(a);

                positions.push(cos/10+x);
                positions.push(sin/10+y);
                positions.push(0.0 +z);
            }
            for(let j=0;j<n;j++ ){
                if (j<n-1){
                    indices.push(0);
                    indices.push(j+1);
                    indices.push(j+2);
                }
            }
            indices.push(0);
            indices.push(n);
            indices.push(1);
            indices = new Uint8Array(indices);
            let colors = new Float32Array([    // Colors
                1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
                1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
                1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
                1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
                1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
                1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
            ]);


            let normals = new Float32Array([    // Normal
                0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
                1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
                0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
                -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
                0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
                0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
            ]);



            // Write the vertex coordinates and color to the buffer object
            if (!initArrayBuffer(gl, new Float32Array(positions), 3, gl.FLOAT, 'a_Position')) return -1;
            if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) return -1;
            if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')) return -1;

            // Create a buffer object
            var indexBuffer = gl.createBuffer();
            if (!indexBuffer)
                return -1;

            // Write the indices to the buffer object
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

            return indices.length;
        }

        function initArrayBuffer(gl, data, num, type, attribute) {
            // Create a buffer object
            var buffer = gl.createBuffer();
            if (!buffer) {
                console.log('Failed to create the buffer object');
                return false;
            }
            // Write date into the buffer object
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            // Assign the buffer object to the attribute variable
            var a_attribute = gl.getAttribLocation(gl.program, attribute);
            if (a_attribute < 0) {
                console.log('Failed to get the storage location of ' + attribute);
                return false;
            }
            gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
            // Enable the assignment of the buffer object to the attribute variable
            gl.enableVertexAttribArray(a_attribute);

            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            return true;
        }
        return arr;
    }
function drawLine(arr){
    var centerArr,changeArr=[];
    var canvas=document.getElementById('webgl1');
    var context=canvas.getContext('2d');
    for(var i=0;i<arr.length;i+=3){
        change(i,arr,changeArr,canvas);
    }
    centerArr = center(changeArr);
    //var gl = getWebGLContext(canvas);
    //gl.clearColor(0.0, 0.0, 0.0, 1.0);
    console.log(changeArr);
    context.strokeStyle ="#FF0000";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(changeArr[0],changeArr[1]+arr[2]*2);
    context.quadraticCurveTo(centerArr[0],canvas.height / 2 -centerArr[1]+centerArr[2]*1.5,changeArr[3],changeArr[4]+arr[5]*2);
    context.stroke();
}
function change(i,arr,changeArr,canvas){
    changeArr[i] = canvas.width / 2 +arr[i];
    changeArr[i+1] = canvas.height / 2 -arr[i+1];
    changeArr[i+2] = 0 +arr[i+2];
    return changeArr;
}
function center(arr) {
    var Arr = [];
    Arr[0] = (arr[0]+arr[3])/2;
    Arr[1] = (arr[1]+arr[4])/2;
    Arr[2] = (arr[2]+arr[5])/2;
    console.log(Arr);
    return Arr;
}
/*
function lineMian(arr){
    var canvas = document.getElementById('webgl1');
    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    if (!initShaders(gl, vs, fs)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);
    var uMvpMatrix_l = gl.getUniformLocation(gl.program, 'u_MvpMatrix_l');
    var MvpMatrix_l = new Matrix4();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    MvpMatrix_l.setPerspective(90.0, 1, 1, 1000);
    MvpMatrix_l.setLookAt(0, 0, 0,  0, 0, -1,  0, 1, 0);

  /!*  var arr = [
        0.5,0.0,0.0,
        0.0,0.0,0.5
    ];*!/
    var Position_l = gl.getAttribLocation(gl.program, 'a_Position_l'); //取得变量
    gl.vertexAttrib4f(Position_l, arr[0]/50, arr[1]/50, arr[2]/50, 1.0);

    var num = initVertexBuffers(arr);

    //gl.uniformMatrix4fv(uMvpMatrix_l, false, MvpMatrix_l.elements);
    //gl.drawArrays(gl.POINTS, 0, 1);

    drawPoint(gl,num[0],num[1],num[2]);
    function drawPoint(gl,x,y,z){
        var Y= 1;
        for (var i=0;i<180;i++){
            MvpMatrix_l.rotate(Y, x, y, z);
            // Pass the model view projection matrix to u_MvpMatrix
            gl.uniformMatrix4fv(uMvpMatrix_l, false, MvpMatrix_l.elements);
            gl.drawArrays(gl.LINE_STRING, 0, 1);
        }
    }
}
function initVertexBuffers(arr) {
    var znum = [];
    znum[0] = (arr[0]+arr[3])/50;
    znum[1] = (arr[1]+arr[4])/50;
    znum[2] = (arr[2]+arr[5])/50;
    return znum;
    console.log(znum);
}*/
