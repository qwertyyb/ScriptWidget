// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// Usage for component image
// 

/*

    <image />
    <image systemName="mosaic.fill" />
    <image id="image0" />
    
    <image id="image" mode="fit" ratio="0.6" />
    <image id="image" mode="fill" size={{width: 260, height: 60}} />

    <image id="image" mode="fill" clip="rect" size={{width: 200, height: 100}}/>
    
    <image id="image" mode="fill" clip="rect" size={{width: 200, height: 100}}/>
    <image id="image" mode="fill" clip="ellipse" size={{width: 200, height: 100}}/>
    <image id="image" mode="fill" clip="circle" size={{width: 200, height: 100}}/>
    <image id="image" mode="fill" clip="capsule" size={{width: 200, height: 100}}/>

    <image id="image" mode="fill" corner="30" size={{width: 200, height: 100}}/>
*/

$render(
  <col>
    <image url="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" size={{width: 20, height: 20}}/>
    <image id="image" size={{width: 260, height: 60}}/>
  </col>
);
