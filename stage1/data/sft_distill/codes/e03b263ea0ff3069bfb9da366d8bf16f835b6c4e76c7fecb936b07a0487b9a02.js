const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制一个圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径 50 的圆
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建精灵对象，使用生成的圆形纹理
  const circle = this.add.sprite(400, 300, 'circleTexture');
  circle.setAlpha(0); // 初始设置为完全透明
  
  // 创建 Tween 动画：从透明（alpha: 0）到不透明（alpha: 1）
  this.tweens.add({
    targets: circle,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 4000, // 持续时间 4 秒
    ease: 'Linear', // 线性渐变
    yoyo: true, // 来回循环（0->1->0）
    repeat: -1 // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 550, '圆形从透明到不透明循环渐变（4秒周期）', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);