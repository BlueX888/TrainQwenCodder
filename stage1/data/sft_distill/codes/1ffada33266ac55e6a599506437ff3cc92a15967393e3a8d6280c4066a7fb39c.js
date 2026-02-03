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
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建圆形精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circle');

  // 创建缩放动画
  this.tweens.add({
    targets: circle,           // 动画目标对象
    scaleX: 0.24,             // X 轴缩放到 24%
    scaleY: 0.24,             // Y 轴缩放到 24%
    duration: 2000,           // 持续时间 2 秒（2000 毫秒）
    yoyo: true,               // 动画结束后反向播放（恢复原始大小）
    loop: -1,                 // 无限循环（-1 表示永久循环）
    ease: 'Linear'            // 线性缓动
  });

  // 添加提示文本
  this.add.text(400, 550, 'Circle scaling animation (24% - 100% loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);