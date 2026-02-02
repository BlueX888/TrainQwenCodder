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
  // 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径 50 的圆
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy();
}

function create() {
  // 在屏幕中心创建圆形精灵
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 创建缩放动画
  // yoyo: true 表示动画会反向播放（从 0.24 恢复到 1）
  // duration: 2000 表示单程 2 秒，往返共 4 秒
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: circle,
    scaleX: 0.24,
    scaleY: 0.24,
    duration: 2000,
    yoyo: true,
    loop: -1,
    ease: 'Linear'
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Circle scaling to 24% and back (4s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);