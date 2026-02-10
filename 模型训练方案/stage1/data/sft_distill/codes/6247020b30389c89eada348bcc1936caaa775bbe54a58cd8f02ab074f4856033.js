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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制菱形（四个点连接成菱形）
  // 中心点在 (50, 50)，宽度 100，高度 100
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 上顶点
  graphics.lineTo(100, 50);    // 右顶点
  graphics.lineTo(50, 100);    // 下顶点
  graphics.lineTo(0, 50);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('diamond', 100, 100);
  
  // 销毁 Graphics 对象（已经生成纹理，不再需要）
  graphics.destroy();
  
  // 使用生成的纹理创建 Sprite，放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为 0（完全透明）
  diamond.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，4秒完成，无限循环
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    alpha: 1,                   // 目标透明度为 1（完全不透明）
    duration: 4000,             // 持续时间 4 秒（4000 毫秒）
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 来回播放（到1后再回到0）
    repeat: -1                  // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(400, 550, '菱形透明度动画：4秒循环', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);