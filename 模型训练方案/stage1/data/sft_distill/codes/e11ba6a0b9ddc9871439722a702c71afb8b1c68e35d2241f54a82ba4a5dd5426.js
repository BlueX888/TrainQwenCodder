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
  graphics.fillCircle(50, 50, 50); // 在(50,50)位置绘制半径50的圆
  graphics.generateTexture('circle', 100, 100); // 生成100x100的纹理
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理

  // 创建圆形精灵并放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circle');

  // 创建缩放动画
  this.tweens.add({
    targets: circle,           // 动画目标
    scaleX: 0.24,             // X轴缩放到24%
    scaleY: 0.24,             // Y轴缩放到24%
    duration: 1000,           // 持续时间1秒
    yoyo: true,               // 动画结束后反向播放（恢复原始大小）
    loop: -1,                 // -1 表示无限循环
    ease: 'Linear'            // 线性缓动
  });

  // 添加提示文本
  this.add.text(400, 550, 'Circle scaling to 24% and back (1 second loop)', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);