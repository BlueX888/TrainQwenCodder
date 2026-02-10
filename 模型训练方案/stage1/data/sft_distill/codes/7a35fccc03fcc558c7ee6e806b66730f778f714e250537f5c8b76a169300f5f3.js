const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制五角星
  graphics.fillStyle(0x0088ff, 1);
  graphics.lineStyle(2, 0x0066cc, 1);
  
  const starPoints = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push({
      x: 40 + Math.cos(angle) * radius,
      y: 40 + Math.sin(angle) * radius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('blueStar', 80, 80);
  graphics.destroy();
  
  // 创建星形精灵
  this.star = this.add.sprite(400, 300, 'blueStar');
  
  // 设置跟随速度
  this.followSpeed = 160;
  
  // 显示提示文本
  this.add.text(10, 10, '移动鼠标，蓝色星形会平滑跟随', {
    fontSize: '18px',
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
  
  // 如果距离大于1像素，则移动星形
  if (distance > 1) {
    // 计算从星形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      this.star.x,
      this.star.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应该移动的距离（速度 * 时间，delta单位是毫秒）
    const moveDistance = Math.min(this.followSpeed * (delta / 1000), distance);
    
    // 根据角度和移动距离更新星形位置
    this.star.x += Math.cos(angle) * moveDistance;
    this.star.y += Math.sin(angle) * moveDistance;
  }
  
  // 可选：让星形旋转，增加视觉效果
  this.star.rotation += 0.02;
}

new Phaser.Game(config);