const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 生成方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('square', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建方块精灵并居中
  const square = this.add.sprite(400, 300, 'square');
  
  // 创建缩放动画
  // 使用 yoyo 实现从 1 -> 0.32 -> 1 的往返效果
  this.tweens.add({
    targets: square,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 500,  // 单程 0.5 秒
    yoyo: true,     // 启用往返，总时长 1 秒
    loop: -1,       // 无限循环
    ease: 'Linear'  // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Square scaling to 32% and back (1s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);