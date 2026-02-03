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
  // 使用 Graphics 创建灰色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('grayRect', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建灰色矩形精灵，放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'grayRect');
  
  // 创建旋转动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    rotation: Math.PI * 2,   // 旋转到 360 度（2π 弧度）
    duration: 1000,          // 持续时间 1 秒
    ease: 'Linear',          // 线性缓动，匀速旋转
    loop: -1,                // 无限循环（-1 表示永久循环）
    repeat: 0                // 每次循环之间不重复
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Gray rectangle rotating in 1 second loop', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);