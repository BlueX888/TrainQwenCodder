const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制六边形（正六边形）
  const hexRadius = 50; // 六边形半径
  const hexPoints = [];
  
  // 计算六边形的6个顶点坐标（中心点在 (60, 60)）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = 60 + hexRadius * Math.cos(angle);
    const y = 60 + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 绘制多边形
  graphics.fillPoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 120, 120);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建六边形精灵，放置在屏幕中央
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: hexagon,           // 动画目标对象
    alpha: 0,                   // 目标 alpha 值（从默认的1变到0）
    duration: 500,              // 单程持续时间 500ms（淡出）
    yoyo: true,                 // 启用 yoyo 效果，动画会反向播放（淡入）
    repeat: -1,                 // 无限循环
    ease: 'Linear'              // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Yellow Hexagon Fade In/Out Animation', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);