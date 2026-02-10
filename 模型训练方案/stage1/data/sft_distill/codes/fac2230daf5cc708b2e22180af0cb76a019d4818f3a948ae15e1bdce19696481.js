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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  
  // 绘制五角星
  const points = [];
  const centerX = 25;
  const centerY = 25;
  const outerRadius = 25;
  const innerRadius = 10;
  
  for (let i = 0; i < 5; i++) {
    // 外部顶点
    const outerAngle = (i * 2 * Math.PI / 5) - Math.PI / 2;
    points.push({
      x: centerX + Math.cos(outerAngle) * outerRadius,
      y: centerY + Math.sin(outerAngle) * outerRadius
    });
    
    // 内部顶点
    const innerAngle = ((i * 2 + 1) * Math.PI / 5) - Math.PI / 2;
    points.push({
      x: centerX + Math.cos(innerAngle) * innerRadius,
      y: centerY + Math.sin(innerAngle) * innerRadius
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
  
  // 生成纹理
  graphics.generateTexture('starTexture', 50, 50);
  graphics.destroy();
  
  // 创建星形精灵
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 获取鼠标位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;
  
  // 计算星形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(star.x, star.y, mouseX, mouseY);
  
  // 如果距离大于1像素，则移动星形
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(star.x, star.y, mouseX, mouseY);
    
    // 计算本帧应该移动的距离（速度 * 时间）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标位置
    if (moveDistance >= distance) {
      star.x = mouseX;
      star.y = mouseY;
    } else {
      // 否则按照角度和速度移动
      star.x += Math.cos(angle) * moveDistance;
      star.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);