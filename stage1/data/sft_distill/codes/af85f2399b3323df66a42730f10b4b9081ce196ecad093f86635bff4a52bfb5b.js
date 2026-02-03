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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 定义菱形的四个顶点（中心点在 (50, 50)）
  const diamond = new Phaser.Geom.Polygon([
    50, 0,    // 上顶点
    100, 50,  // 右顶点
    50, 100,  // 下顶点
    0, 50     // 左顶点
  ]);
  
  // 填充菱形路径
  graphics.fillPoints(diamond.points, true);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('diamond', 100, 100);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
  
  // 创建使用菱形纹理的 Sprite
  const diamondSprite = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放补间动画
  this.tweens.add({
    targets: diamondSprite,
    scaleX: 0.8,  // 缩放到 80%
    scaleY: 0.8,  // 缩放到 80%
    duration: 3000,  // 持续 3 秒
    yoyo: true,  // 往返播放（缩放到 0.8 后再恢复到 1）
    loop: -1,  // 无限循环
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 50, '菱形缩放动画 (3秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);