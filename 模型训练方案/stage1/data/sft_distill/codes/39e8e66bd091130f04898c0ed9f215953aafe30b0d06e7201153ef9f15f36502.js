const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 创建星形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
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
    points.push({
      x: 32 + Math.cos(angle) * radius,
      y: 32 + Math.sin(angle) * radius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建星形精灵
  this.star = this.add.sprite(400, 300, 'star');
  
  // 设置跟随速度
  this.followSpeed = 300;
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算星形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    this.star.x,
    this.star.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素，则移动星形
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      this.star.x,
      this.star.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧移动的距离（速度 * 时间，delta单位是毫秒）
    const moveDistance = this.followSpeed * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      this.star.x = pointer.x;
      this.star.y = pointer.y;
    } else {
      // 根据角度和移动距离更新位置
      this.star.x += Math.cos(angle) * moveDistance;
      this.star.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);