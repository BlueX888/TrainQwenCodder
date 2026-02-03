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
  // 使用 Graphics 程序化生成矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 200, 150);
  graphics.generateTexture('rectangle', 200, 150);
  graphics.destroy();
}

function create() {
  // 创建矩形精灵并放置在屏幕中央
  const rect = this.add.sprite(400, 300, 'rectangle');
  
  // 设置初始透明度为0（完全透明）
  rect.setAlpha(0);
  
  // 创建渐变动画：从透明(0)到不透明(1)，持续4秒，无限循环
  this.tweens.add({
    targets: rect,
    alpha: 1,              // 目标透明度为1（完全不透明）
    duration: 4000,        // 持续4秒
    ease: 'Linear',        // 线性渐变
    yoyo: true,            // 来回播放（1->0->1）
    repeat: -1             // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 500, '矩形透明度循环动画（4秒）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);