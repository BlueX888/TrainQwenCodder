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
  // 创建方块 Sprite
  const square = this.add.sprite(400, 300, 'square');
  
  // 创建缩放动画
  this.tweens.add({
    targets: square,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 1000,  // 1秒
    yoyo: true,      // 播放完后反向播放（恢复原始大小）
    loop: -1,        // 无限循环
    ease: 'Linear'   // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Square scaling to 32% and back\nLooping forever', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);