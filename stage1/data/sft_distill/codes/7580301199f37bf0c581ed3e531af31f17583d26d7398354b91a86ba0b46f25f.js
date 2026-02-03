const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色星形（五角星）
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 星形的中心点
  const centerX = 12;
  const centerY = 12;
  const outerRadius = 12; // 外半径
  const innerRadius = 5;  // 内半径
  const points = 5;       // 五角星
  
  // 计算星形的顶点
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
  
  // 生成纹理（24x24像素）
  graphics.generateTexture('star', 24, 24);
  
  // 销毁 graphics 对象，释放内存
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成黄色星形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形图像
    const star = this.add.image(pointer.x, pointer.y, 'star');
    
    // 可选：添加一些动画效果让星形更生动
    this.tweens.add({
      targets: star,
      scale: { from: 0, to: 1 },
      alpha: { from: 0.5, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
}

new Phaser.Game(config);