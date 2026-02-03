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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 定义菱形的四个顶点（中心点在 (50, 50)，边长约100）
  const diamond = new Phaser.Geom.Polygon([
    50, 0,    // 上顶点
    100, 50,  // 右顶点
    50, 100,  // 下顶点
    0, 50     // 左顶点
  ]);
  
  // 填充菱形路径
  graphics.fillPoints(diamond.points, true);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('diamondTexture', 100, 100);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中心
  const diamondSprite = this.add.sprite(400, 300, 'diamondTexture');
  
  // 创建缩放动画
  this.tweens.add({
    targets: diamondSprite,
    scaleX: 0.16,  // 缩放到 16%
    scaleY: 0.16,  // 缩放到 16%
    duration: 1500,  // 持续 1.5 秒
    yoyo: true,  // 往返效果（缩小后自动放大）
    repeat: -1,  // 无限循环
    ease: 'Linear'  // 线性缓动
  });
}

new Phaser.Game(config);