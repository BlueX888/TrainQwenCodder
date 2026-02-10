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
  // 使用 Graphics 生成蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('blueSquare', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建蓝色方块精灵，放置在屏幕中央
  const blueSquare = this.add.sprite(400, 300, 'blueSquare');
  
  // 创建闪烁动画
  // 使用 Tween 控制 alpha 透明度实现闪烁效果
  this.tweens.add({
    targets: blueSquare,           // 动画目标对象
    alpha: 0,                       // 目标透明度值（从1渐变到0）
    duration: 750,                  // 单程持续时间 0.75秒
    yoyo: true,                     // 启用往返效果（0->1->0）
    repeat: -1,                     // 无限循环 (-1 表示永久重复)
    ease: 'Sine.easeInOut'         // 缓动函数，使闪烁更平滑自然
  });
  
  // 添加说明文字
  this.add.text(400, 500, '蓝色方块闪烁动画 (1.5秒/周期)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);