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
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xFFFF00, 1);
  
  // 绘制六边形
  const hexagonRadius = 50;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  // 计算六边形顶点
  const points = [];
  for (let i = 0; i < sides; i++) {
    const x = hexagonRadius * Math.cos(angle * i - Math.PI / 2);
    const y = hexagonRadius * Math.sin(angle * i - Math.PI / 2);
    points.push(x, y);
  }
  
  // 绘制多边形
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  const textureSize = hexagonRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建六边形精灵并居中显示
  const hexagonSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建淡入淡出 Tween 动画
  this.tweens.add({
    targets: hexagonSprite,
    alpha: 0,              // 目标透明度为 0（完全透明）
    duration: 1000,        // 持续时间 1 秒
    yoyo: true,            // 启用往返效果（淡出后再淡入）
    repeat: -1,            // 无限循环
    ease: 'Linear'         // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 550, '黄色六边形淡入淡出循环动画', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);