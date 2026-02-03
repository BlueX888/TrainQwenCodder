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
  // 使用 Graphics 创建矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('rect', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建矩形精灵，放置在屏幕中心
  const rectangle = this.add.sprite(400, 300, 'rect');
  
  // 创建缩放动画
  // yoyo: true 表示动画会反向播放（缩小后放大）
  // repeat: -1 表示无限循环
  // duration: 2000 表示单程2秒（缩小到16%需要2秒，恢复也需要2秒）
  this.tweens.add({
    targets: rectangle,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: 'Linear'
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Rectangle scaling to 16% and back (2s each way)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);