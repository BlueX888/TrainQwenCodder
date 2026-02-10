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
  // 使用 Graphics 绘制蓝色方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1); // 蓝色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('blueSquare', 100, 100);
  graphics.destroy();

  // 创建蓝色方块 Sprite
  const blueSquare = this.add.sprite(400, 300, 'blueSquare');

  // 创建闪烁动画
  // 使用 Tween 控制 alpha 透明度实现闪烁效果
  this.tweens.add({
    targets: blueSquare,
    alpha: 0, // 从当前值（1）淡出到 0
    duration: 750, // 0.75 秒淡出
    yoyo: true, // 反向播放（淡入）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });

  // 添加提示文字
  this.add.text(400, 500, '蓝色方块闪烁动画 (1.5秒/次)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);