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
  // 创建 Graphics 对象绘制菱形
  const graphics = this.add.graphics();
  
  // 设置绿色填充
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形路径（中心点为 0,0）
  const size = 60;
  const path = new Phaser.Geom.Polygon([
    0, -size,      // 上顶点
    size, 0,       // 右顶点
    0, size,       // 下顶点
    -size, 0       // 左顶点
  ]);
  
  graphics.fillPath();
  graphics.fillPoints(path.points, true);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  
  // 销毁临时 Graphics 对象
  graphics.destroy();
  
  // 在屏幕中心创建使用菱形纹理的 Sprite
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建淡入淡出补间动画
  this.tweens.add({
    targets: diamond,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 500,      // 持续时间 500ms（0.5秒）
    yoyo: true,         // 启用 yoyo 效果，动画反向播放（淡入淡出）
    repeat: -1,         // 无限循环
    ease: 'Linear'      // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 500, '绿色菱形淡入淡出循环动画', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);