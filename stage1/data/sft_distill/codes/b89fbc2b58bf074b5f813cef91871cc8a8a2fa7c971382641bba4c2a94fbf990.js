const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let pointer;
const FOLLOW_SPEED = 360; // 每秒移动360像素

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制六边形（中心点为原点）
  const hexRadius = 40;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
    hexPoints.push(new Phaser.Math.Vector2(x, y));
  }
  
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理（尺寸需要足够容纳六边形）
  graphics.generateTexture('hexagon', hexRadius * 2 + 10, hexRadius * 2 + 10);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 获取指针引用
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
    
    // 根据速度和delta计算本帧移动距离（delta单位是毫秒）
    const moveDistance = (FOLLOW_SPEED * delta) / 1000;
    
    // 如果移动距离大于剩余距离，直接到达目标位置
    if (moveDistance >= distance) {
      hexagon.x = pointer.x;
      hexagon.y = pointer.y;
    } else {
      // 按角度方向移动
      hexagon.x += Math.cos(angle) * moveDistance;
      hexagon.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);