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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制一个矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('rectTexture', 100, 100);
  graphics.destroy();
  
  // 创建 Sprite 对象
  const rect = this.add.sprite(400, 300, 'rectTexture');
  
  // 创建缩放动画
  this.tweens.add({
    targets: rect,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 3000,        // 3秒缩放到16%
    yoyo: true,            // 动画结束后反向播放（恢复到原始大小）
    loop: -1,              // -1 表示无限循环
    ease: 'Linear'         // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '矩形缩放动画\n3秒缩放至16%，然后恢复，循环播放', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);