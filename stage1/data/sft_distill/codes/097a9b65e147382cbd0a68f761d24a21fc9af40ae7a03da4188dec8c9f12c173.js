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
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  
  // 生成纹理
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建使用该纹理的精灵，放在屏幕中心
  const circle = this.add.sprite(400, 300, 'circleTexture');
  
  // 初始设置为完全透明
  circle.setAlpha(0);
  
  // 创建 Tween 动画：从透明(0)到不透明(1)，持续 1 秒，循环播放
  this.tweens.add({
    targets: circle,
    alpha: 1, // 目标透明度
    duration: 1000, // 持续时间 1 秒
    yoyo: true, // 往返播放（到达目标后再返回起始值）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 500, '圆形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);