const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制五角星
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 12;
  const points = 5;
  
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 创建星形精灵
  this.star = this.add.sprite(400, 300, 'star');
  
  // 存储跟随速度
  this.followSpeed = 240;
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
  
  // 如果距离大于1像素，进行移动（避免抖动）
  if (distance > 1) {
    // 计算角度
    const angle = Phaser.Math.Angle.Between(
      this.star.x,
      this.star.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧移动距离（速度 * 时间，delta单位为毫秒）
    const moveDistance = this.followSpeed * (delta / 1000);
    
    // 如果移动距离小于实际距离，按速度移动；否则直接到达目标
    if (moveDistance < distance) {
      this.star.x += Math.cos(angle) * moveDistance;
      this.star.y += Math.sin(angle) * moveDistance;
    } else {
      this.star.x = pointer.x;
      this.star.y = pointer.y;
    }
  }
}

new Phaser.Game(config);