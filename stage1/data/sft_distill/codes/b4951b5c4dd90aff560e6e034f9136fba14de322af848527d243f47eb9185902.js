const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let star;
let pointer;
const FOLLOW_SPEED = 160; // 每秒移动像素数

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制五角星
  const points = [];
  const outerRadius = 30;
  const innerRadius = 12;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
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
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建星形精灵
  star = this.add.sprite(400, 300, 'star');
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算星形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    star.x,
    star.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于 1 像素才移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      star.x,
      star.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间差计算本帧应移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果本帧移动距离大于剩余距离，直接到达目标位置
    if (moveDistance >= distance) {
      star.x = pointer.x;
      star.y = pointer.y;
    } else {
      // 平滑移动
      star.x += Math.cos(angle) * moveDistance;
      star.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);