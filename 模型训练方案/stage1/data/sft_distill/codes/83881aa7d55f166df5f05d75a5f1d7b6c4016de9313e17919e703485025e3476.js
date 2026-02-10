const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;
let pointer;
const FOLLOW_SPEED = 160; // 每秒移动的像素数

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0099ff, 1);
  
  // 绘制五角星
  const points = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: Math.cos(angle) * radius + outerRadius,
      y: Math.sin(angle) * radius + outerRadius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('starTexture', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在屏幕中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，星形将平滑跟随', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算星形到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    star.x,
    star.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素，则移动星形
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      star.x,
      star.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间差计算本帧应该移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 确保不会超过目标位置
    const actualDistance = Math.min(moveDistance, distance);
    
    // 计算新位置
    star.x += Math.cos(angle) * actualDistance;
    star.y += Math.sin(angle) * actualDistance;
  }
}

new Phaser.Game(config);