const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillCircle(50, 50, 50); // 半径 50 的圆形
  
  // 添加一个标记点，用于观察旋转效果
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(50, 20, 8); // 在圆形顶部添加白色小圆点作为标记
  
  graphics.generateTexture('orangeCircle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建橙色圆形精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'orangeCircle');
  
  // 创建旋转动画
  this.tweens.add({
    targets: circle,
    rotation: Math.PI * 2, // 旋转 360 度（2π 弧度）
    duration: 1000, // 1 秒完成一次旋转
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动，保持匀速旋转
  });
  
  // 添加提示文本
  this.add.text(400, 500, '橙色圆形旋转动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);