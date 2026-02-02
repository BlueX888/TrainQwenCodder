const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
const FOLLOW_SPEED = 360; // 像素/秒

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制六边形（中心在原点）
  const hexRadius = 40;
  const hexPath = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = Math.cos(angle) * hexRadius;
    const y = Math.sin(angle) * hexRadius;
    hexPath.push(new Phaser.Math.Vector2(x, y));
  }
  
  graphics.fillPoints(hexPath, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 确保鼠标输入已启用
  this.input.setDefaultCursor('pointer');
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算六边形与鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    hexagon.x, 
    hexagon.y, 
    pointer.x, 
    pointer.y
  );
  
  // 如果距离很小，直接停止移动避免抖动
  if (distance < 2) {
    return;
  }
  
  // 计算六边形指向鼠标的角度
  const angle = Phaser.Math.Angle.Between(
    hexagon.x, 
    hexagon.y, 
    pointer.x, 
    pointer.y
  );
  
  // 根据速度和时间增量计算本帧应移动的距离
  const moveDistance = (FOLLOW_SPEED * delta) / 1000;
  
  // 如果本帧移动距离大于剩余距离，直接到达目标位置
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