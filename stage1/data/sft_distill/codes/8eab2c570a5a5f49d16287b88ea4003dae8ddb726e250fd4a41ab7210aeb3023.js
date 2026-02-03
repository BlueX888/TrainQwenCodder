const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let pointer;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色六边形
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制六边形（中心点在原点）
  const hexRadius = 30;
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
    points.push(x, y);
  }
  
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 获取鼠标位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;
  
  // 计算六边形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    hexagon.x,
    hexagon.y,
    mouseX,
    mouseY
  );
  
  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      hexagon.x,
      hexagon.y,
      mouseX,
      mouseY
    );
    
    // 计算本帧应该移动的距离（速度 * 时间，delta单位是毫秒）
    const moveDistance = (120 * delta) / 1000;
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      hexagon.x = mouseX;
      hexagon.y = mouseY;
    } else {
      // 根据角度和速度更新位置
      hexagon.x += Math.cos(angle) * moveDistance;
      hexagon.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);