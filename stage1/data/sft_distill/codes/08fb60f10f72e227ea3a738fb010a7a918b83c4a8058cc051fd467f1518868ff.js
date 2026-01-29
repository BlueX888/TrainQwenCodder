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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 定义菱形的四个顶点（中心点为原点）
  const size = 60;
  const diamond = new Phaser.Geom.Polygon([
    0, -size,      // 上顶点
    size, 0,       // 右顶点
    0, size,       // 下顶点
    -size, 0       // 左顶点
  ]);
  
  // 填充菱形路径
  graphics.fillPoints(diamond.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建使用菱形纹理的精灵，放置在屏幕中心
  const diamondSprite = this.add.sprite(400, 300, 'diamond');
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: diamondSprite,
    alpha: 0,              // 目标透明度为 0（完全透明）
    duration: 500,         // 持续时间 0.5 秒（500 毫秒）
    yoyo: true,            // 往返动画（淡出后再淡入）
    repeat: -1,            // 无限循环
    ease: 'Linear'         // 线性缓动
  });
  
  // 添加说明文本
  this.add.text(400, 500, '绿色菱形淡入淡出循环动画', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);