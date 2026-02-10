const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 创建星形纹理
  const graphics = this.add.graphics();
  
  // 绘制灰色星形
  graphics.fillStyle(0x808080, 1);
  graphics.lineStyle(2, 0x606060, 1);
  
  // 绘制五角星
  const points = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = 40 + Math.cos(angle) * radius;
    const y = 40 + Math.sin(angle) * radius;
    points.push(x, y);
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 80, 80);
  graphics.destroy();
}

function create() {
  // 创建星形精灵
  this.star = this.add.sprite(400, 300, 'star');
  
  // 存储跟随速度
  this.followSpeed = 300;
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算星形与鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    this.star.x,
    this.star.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      this.star.x,
      this.star.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应该移动的距离（速度 * 时间）
    const moveDistance = this.followSpeed * (delta / 1000);
    
    // 如果移动距离大于实际距离，直接到达目标点
    if (moveDistance >= distance) {
      this.star.x = pointer.x;
      this.star.y = pointer.y;
    } else {
      // 否则按照速度平滑移动
      this.star.x += Math.cos(angle) * moveDistance;
      this.star.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);