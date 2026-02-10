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
  // 使用 Graphics 绘制粉色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('pinkSquare', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建方块精灵并居中
  const square = this.add.sprite(400, 300, 'pinkSquare');
  
  // 设置初始透明度为 0（完全透明）
  square.setAlpha(0);
  
  // 创建淡入淡出 Tween 动画
  this.tweens.add({
    targets: square,           // 动画目标对象
    alpha: {                   // 动画属性
      from: 0,                 // 起始值：完全透明
      to: 1                    // 目标值：完全不透明
    },
    duration: 1250,            // 淡入时长 1.25 秒
    yoyo: true,                // 启用 yoyo 效果（到达目标后反向播放）
    repeat: -1,                // 无限循环（-1 表示永久重复）
    ease: 'Sine.easeInOut'     // 缓动函数，使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 450, 'Pink Square Fade In/Out Animation', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  this.add.text(400, 490, 'Duration: 2.5 seconds per cycle', {
    fontSize: '16px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

new Phaser.Game(config);