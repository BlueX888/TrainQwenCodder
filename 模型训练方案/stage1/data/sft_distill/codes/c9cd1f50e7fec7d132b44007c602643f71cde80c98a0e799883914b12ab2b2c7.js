const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 计算六边形的顶点坐标
  const hexRadius = 80;
  const centerX = 0;
  const centerY = 0;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff88, 1); // 青绿色
  graphics.fillPolygon(hexPoints);
  
  // 生成纹理
  const textureSize = hexRadius * 2 + 20;
  graphics.x = textureSize / 2;
  graphics.y = textureSize / 2;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  hexagon.setAlpha(0); // 初始透明度为 0
  
  // 创建渐变动画
  this.tweens.add({
    targets: hexagon,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 4000, // 4秒
    yoyo: true, // 来回播放（透明->不透明->透明）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性渐变
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Hexagon fading in/out (4s cycle)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);