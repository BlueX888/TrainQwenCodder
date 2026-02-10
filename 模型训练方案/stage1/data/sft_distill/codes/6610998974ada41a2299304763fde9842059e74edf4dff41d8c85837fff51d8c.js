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
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('squareTexture', 100, 100);
  graphics.destroy();

  // 创建方块精灵
  const square = this.add.sprite(400, 300, 'squareTexture');

  // 创建缩放 Tween 动画
  // 单程 2 秒，往返共 4 秒
  this.tweens.add({
    targets: square,
    scaleX: 0.64,
    scaleY: 0.64,
    duration: 2000,      // 单程 2 秒
    yoyo: true,          // 启用往返效果（缩小后再放大）
    loop: -1,            // 无限循环
    ease: 'Linear'       // 线性缓动
  });

  // 添加文字说明
  this.add.text(400, 50, '方块缩放动画循环播放', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '缩放范围: 100% -> 64% -> 100%\n循环周期: 4 秒', {
    fontSize: '16px',
    color: '#cccccc',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);