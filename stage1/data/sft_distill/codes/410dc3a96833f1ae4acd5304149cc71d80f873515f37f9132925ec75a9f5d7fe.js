const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let pointer;
const followSpeed = 360; // 每秒移动360像素

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制六边形（中心点在0,0，半径40）
  const radius = 40;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const x = radius * Math.cos(angle * i - Math.PI / 2);
    const y = radius * Math.sin(angle * i - Math.PI / 2);
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理（纹理大小需要容纳整个六边形）
  const textureSize = radius * 2 + 10;
  graphics.generateTexture('hexagonTex', textureSize, textureSize);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建六边形精灵，初始位置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagonTex');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算六边形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    hexagon.x,
    hexagon.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      hexagon.x,
      hexagon.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间差计算本帧应该移动的距离
    const moveDistance = followSpeed * (delta / 1000);
    
    // 如果本帧移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      hexagon.x = pointer.x;
      hexagon.y = pointer.y;
    } else {
      // 按角度和速度移动
      hexagon.x += Math.cos(angle) * moveDistance;
      hexagon.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);