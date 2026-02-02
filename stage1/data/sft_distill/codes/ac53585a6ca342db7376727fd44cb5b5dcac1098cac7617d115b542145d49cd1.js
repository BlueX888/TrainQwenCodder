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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 80; // 六边形半径
  const centerX = 100;
  const centerY = 100;
  
  // 绘制六边形
  graphics.fillStyle(0x00aaff, 1);
  graphics.lineStyle(4, 0xffffff, 1);
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始，每60度一个顶点
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制多边形
  const polygon = new Phaser.Geom.Polygon(points);
  graphics.fillPoints(polygon.points, true);
  graphics.strokePoints(polygon.points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 200, 200);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建使用六边形纹理的 Sprite
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  this.tweens.add({
    targets: hexSprite,
    scaleX: 0.48,  // 缩放到 48%
    scaleY: 0.48,  // 缩放到 48%
    duration: 2500, // 持续 2.5 秒
    ease: 'Sine.easeInOut', // 使用平滑的缓动函数
    yoyo: true,     // 动画结束后反向播放（恢复原始大小）
    loop: -1        // 无限循环播放
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Hexagon Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scaling from 100% to 48% in 2.5s (looping)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);