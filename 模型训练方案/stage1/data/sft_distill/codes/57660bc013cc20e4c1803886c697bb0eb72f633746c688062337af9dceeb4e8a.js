const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('square', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建精灵对象并设置到屏幕中心
  const square = this.add.sprite(400, 300, 'square');
  
  // 设置初始透明度为0（完全透明）
  square.setAlpha(0);

  // 创建渐变动画：从透明(0)到不透明(1)，持续2秒，循环播放
  this.tweens.add({
    targets: square,           // 动画目标对象
    alpha: 1,                  // 目标透明度值
    duration: 2000,            // 持续时间2秒（2000毫秒）
    ease: 'Linear',            // 线性缓动
    repeat: -1,                // 无限循环（-1表示永久重复）
    yoyo: false                // 不使用往返效果，只从0到1循环
  });

  // 添加文字说明
  this.add.text(400, 500, 'Square fading from transparent to opaque (2s loop)', {
    fontSize: '18px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);