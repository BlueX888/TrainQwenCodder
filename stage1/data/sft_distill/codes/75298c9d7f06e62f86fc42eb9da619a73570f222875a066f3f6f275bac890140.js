const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制粉色星形
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.lineStyle(2, 0xffffff, 1); // 白色边框
  
  // 绘制五角星
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 15;
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
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建星形精灵
  this.star = this.add.sprite(400, 300, 'star');
  this.star.setScale(1.5);
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse!', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算平滑跟随速度因子
  // 速度 80 表示每秒移动 80 像素的插值速度
  // 转换为每帧的插值因子：speed * delta / 1000
  const smoothFactor = Math.min(1, (80 * delta) / 1000);
  
  // 使用线性插值实现平滑跟随
  this.star.x = Phaser.Math.Linear(this.star.x, pointer.x, smoothFactor);
  this.star.y = Phaser.Math.Linear(this.star.y, pointer.y, smoothFactor);
  
  // 添加轻微旋转效果增强视觉效果
  this.star.rotation += 0.02;
}

new Phaser.Game(config);