const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 创建粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('pinkSquare', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建粉色方块精灵，放置在屏幕中心
  const square = this.add.sprite(400, 300, 'pinkSquare');
  
  // 设置初始透明度为 0（完全透明）
  square.setAlpha(0);
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: square,
    alpha: { from: 0, to: 1 }, // 从透明到不透明
    duration: 1250, // 淡入 1.25 秒
    yoyo: true, // 反向播放（淡出）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动使过渡更平滑
  });
  
  // 添加提示文本
  const text = this.add.text(400, 550, 'Pink square fading in/out every 2.5s', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);