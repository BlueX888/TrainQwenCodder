const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 半径50的圆形
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 在屏幕中心创建圆形精灵
  const circle = this.add.sprite(400, 300, 'circle');

  // 创建缩放动画
  this.tweens.add({
    targets: circle,
    scaleX: 0.24, // 缩放到 24%
    scaleY: 0.24,
    duration: 4000, // 4 秒
    ease: 'Sine.easeInOut', // 使用平滑的缓动函数
    yoyo: true, // 播放完成后反向播放（恢复原始大小）
    loop: -1 // 无限循环，-1 表示永久循环
  });

  // 添加文字说明
  this.add.text(400, 50, '圆形缩放动画 (1.0 ↔ 0.24)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);