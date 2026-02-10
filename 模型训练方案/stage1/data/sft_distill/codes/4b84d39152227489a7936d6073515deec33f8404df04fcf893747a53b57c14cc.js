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
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建使用该纹理的 Sprite，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circleTexture');
  circle.alpha = 0; // 初始设置为完全透明
  
  // 创建循环的透明度补间动画
  this.tweens.add({
    targets: circle,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 1000, // 持续时间 1 秒
    yoyo: true, // 来回播放（透明 -> 不透明 -> 透明）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);