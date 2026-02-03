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
  // 创建 Graphics 对象绘制黄色六边形
  const graphics = this.add.graphics();
  
  // 计算六边形顶点坐标（中心在 64, 64，半径 50）
  const radius = 50;
  const centerX = 64;
  const centerY = 64;
  const hexagonPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    hexagonPoints.push(x, y);
  }
  
  // 绘制黄色六边形
  graphics.fillStyle(0xffff00, 1);
  graphics.fillPolygon(hexagonPoints);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 128, 128);
  graphics.destroy(); // 销毁 graphics 对象，不再需要
  
  // 创建精灵对象
  const hexagonSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建淡入淡出动画
  // 使用 yoyo 实现淡入淡出效果，duration 1000ms 表示淡入+淡出总共 2 秒
  // 要实现 1 秒完成淡入淡出，每个方向需要 500ms
  this.tweens.add({
    targets: hexagonSprite,
    alpha: 0,           // 从当前 alpha(1) 淡出到 0
    duration: 500,      // 淡出持续 500ms
    yoyo: true,         // 启用 yoyo 效果，淡出后自动淡入
    repeat: -1,         // 无限循环
    ease: 'Linear'      // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 500, '黄色六边形淡入淡出循环动画', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);