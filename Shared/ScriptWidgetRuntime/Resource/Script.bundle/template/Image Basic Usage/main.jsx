// 
// JSWidget 
// https://xnu.app/scriptwidget
// 
// Usage for component image
// 

/*

    <image />
    <image systemName="mosaic.fill" />
    <image id="image0" />
    
    <image id="image" mode="fit" ratio="0.6" />
    <image id="image" mode="fill" size="260,60" />

    <image id="image" mode="fill" clip size="200,100"/>
    
    <image id="image" mode="fill" clip="rect" size="200,100"/>
    <image id="image" mode="fill" clip="ellipse" size="200,100"/>
    <image id="image" mode="fill" clip="circle" size="200,100"/>
    <image id="image" mode="fill" clip="capsule" size="200,100"/>

    <image id="image" mode="fill" corner="30" size="200,100"/>
*/

$render(
  <col>
    <image url="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" size={{width: 20, height: 20}}/>
    <image id="image" size={{width: 260, height: 60}}/>
  </col>
);
