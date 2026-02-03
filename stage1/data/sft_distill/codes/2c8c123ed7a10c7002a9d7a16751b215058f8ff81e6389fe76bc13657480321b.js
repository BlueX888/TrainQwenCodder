const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 程序化生成圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 中心点(50,50)，半径50
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建圆形精灵，初始设为完全透明
  const circle = this.add.sprite(400, 300, 'circle');
  circle.alpha = 0;

  // 创建 Tween 动画：4秒内从透明(0)到不透明(1)，循环播放
  this.tweens.add({
    targets: circle,
    alpha: 1,           // 目标透明度为1（完全不透明）
    duration: 4000,     // 持续时间4秒
    ease: 'Linear',     // 线性渐变
    yoyo: true,         // 往返播放（1->0->1）
    repeat: -1          // 无限循环
  });

  // 添加提示文本
  this.add.text(400, 500, '圆形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);