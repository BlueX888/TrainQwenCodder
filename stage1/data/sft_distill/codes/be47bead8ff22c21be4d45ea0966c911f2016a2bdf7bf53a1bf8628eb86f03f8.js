const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;
let pointer;
const FOLLOW_SPEED = 300;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色星形
  const graphics = this.add.graphics();
  
  // 绘制五角星
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.lineStyle(2, 0x606060, 1);
  
  const points = [];
  const outerRadius = 30;
  const innerRadius = 12;
  const centerX = 32;
  const centerY = 32;
  
  // 生成五角星的10个点（5个外点 + 5个内点交替）
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    points.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }
  
  // 绘制星形路径
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在屏幕中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 获取鼠标位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;
  
  // 计算星形与鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    star.x,
    star.y,
    mouseX,
    mouseY
  );
  
  // 如果距离大于1像素，才进行移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      star.x,
      star.y,
      mouseX,
      mouseY
    );
    
    // 计算本帧应该移动的距离
    const moveDistance = Math.min(FOLLOW_SPEED * deltaSeconds, distance);
    
    // 根据角度和距离更新星形位置
    star.x += Math.cos(angle) * moveDistance;
    star.y += Math.sin(angle) * moveDistance;
  }
}

new Phaser.Game(config);