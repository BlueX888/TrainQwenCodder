const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 绘制六边形并生成纹理
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点（半径为8像素，总直径16像素）
  const radius = 8;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    hexPoints.push({ x, y });
  }
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理（16x16像素）
  graphics.generateTexture('hexagon', 16, 16);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建六边形 Sprite
    const hexagon = this.add.sprite(pointer.x, pointer.y, 'hexagon');
    
    // 可选：添加一些视觉反馈（淡入效果）
    hexagon.setAlpha(0);
    this.tweens.add({
      targets: hexagon,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 20, 'Click anywhere to create hexagons', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);