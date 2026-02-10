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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 中心点(50,50)，半径50
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 在屏幕中心创建圆形精灵
  const circle = this.add.sprite(400, 300, 'circle');
  circle.setAlpha(0); // 初始设置为完全透明
  
  // 创建 Tween 动画：从透明到不透明，4秒完成，循环播放
  this.tweens.add({
    targets: circle,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 4000, // 持续 4 秒
    ease: 'Linear', // 线性渐变
    yoyo: true, // 往返播放（透明->不透明->透明）
    repeat: -1 // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 550, 'Circle fading in/out over 4 seconds (looping)', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);