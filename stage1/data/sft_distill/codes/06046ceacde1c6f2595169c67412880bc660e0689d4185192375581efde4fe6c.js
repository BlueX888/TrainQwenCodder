const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let pointer;
const FOLLOW_SPEED = 360; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制灰色六边形
  const hexRadius = 40;
  const hexPoints = [];
  
  // 计算六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每60度一个顶点
    const x = hexRadius + Math.cos(angle) * hexRadius;
    const y = hexRadius + Math.sin(angle) * hexRadius;
    hexPoints.push(x, y);
  }
  
  // 填充灰色六边形
  graphics.fillStyle(0x808080, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0], hexPoints[1]);
  for (let i = 2; i < hexPoints.length; i += 2) {
    graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算六边形到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    hexagon.x,
    hexagon.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离足够近，直接设置位置，避免抖动
  if (distance < 2) {
    hexagon.x = pointer.x;
    hexagon.y = pointer.y;
    return;
  }
  
  // 计算六边形到鼠标指针的角度
  const angle = Phaser.Math.Angle.Between(
    hexagon.x,
    hexagon.y,
    pointer.x,
    pointer.y
  );
  
  // 根据速度和时间增量计算移动距离
  const moveDistance = FOLLOW_SPEED * (delta / 1000);
  
  // 如果移动距离大于剩余距离，直接到达目标点
  if (moveDistance >= distance) {
    hexagon.x = pointer.x;
    hexagon.y = pointer.y;
  } else {
    // 按角度方向移动
    hexagon.x += Math.cos(angle) * moveDistance;
    hexagon.y += Math.sin(angle) * moveDistance;
  }
}

new Phaser.Game(config);