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
  // 使用 Graphics 绘制紫色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('purpleSquare', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵对象，放置在屏幕中央
  const square = this.add.sprite(400, 300, 'purpleSquare');
  
  // 设置初始透明度为0（完全透明）
  square.setAlpha(0);
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: square,           // 动画目标对象
    alpha: 1,                  // 目标透明度值
    duration: 2000,            // 淡入持续时间 2秒
    yoyo: true,                // 启用往返效果（淡入后淡出）
    repeat: -1,                // 无限循环 (-1 表示永久重复)
    ease: 'Sine.easeInOut'     // 缓动函数，使动画更平滑
  });
  
  // 添加提示文本
  this.add.text(400, 500, '紫色方块淡入淡出动画 (4秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);