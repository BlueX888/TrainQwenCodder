const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 创建粉色星形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制星形
  const starPoints = [];
  const outerRadius = 40;
  const innerRadius = 20;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push({
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius
    });
  }
  
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建星形精灵
  this.star = this.add.sprite(400, 300, 'star');
  
  // 存储跟随速度
  this.followSpeed = 360;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse!', {
    fontSize: '20px',
    color: '#ffffff'
  });
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
  
  // 如果距离大于1像素，才进行移动（避免抖动）
  if (distance > 1) {
    // 计算角度
    const angle = Phaser.Math.Angle.Between(
      this.star.x,
      this.star.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间差计算移动距离
    const moveDistance = this.followSpeed * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      this.star.x = pointer.x;
      this.star.y = pointer.y;
    } else {
      // 平滑移动
      this.star.x += Math.cos(angle) * moveDistance;
      this.star.y += Math.sin(angle) * moveDistance;
    }
  }
  
  // 可选：让星形旋转增加视觉效果
  this.star.rotation += 0.02;
}

new Phaser.Game(config);