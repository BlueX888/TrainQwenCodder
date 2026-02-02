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
  // 使用 Graphics 绘制黄色六边形
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点
  const hexRadius = 50;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = hexRadius + Math.cos(angle) * hexRadius;
    const y = hexRadius + Math.sin(angle) * hexRadius;
    hexPoints.push(x, y);
  }
  
  // 绘制填充的六边形
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.beginPath();
  graphics.moveTo(hexPoints[0], hexPoints[1]);
  for (let i = 2; i < hexPoints.length; i += 2) {
    graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy(); // 销毁 Graphics 对象以释放资源
  
  // 创建六边形精灵并居中显示
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  hexagon.setAlpha(0); // 初始透明度为 0
  
  // 创建淡入淡出循环动画
  this.tweens.add({
    targets: hexagon,
    alpha: { from: 0, to: 1 }, // 从透明到不透明
    duration: 500, // 淡入 0.5 秒
    yoyo: true, // 反向播放（淡出）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);