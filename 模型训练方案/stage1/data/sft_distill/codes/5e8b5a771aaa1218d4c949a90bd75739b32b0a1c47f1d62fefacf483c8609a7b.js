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
  // 使用 Graphics 绘制一个方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('square', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 在屏幕中心创建方块精灵
  const square = this.add.sprite(400, 300, 'square');
  
  // 创建缩放动画
  // yoyo: true 表示动画会反向播放（缩小后再放大）
  // duration: 2000 表示单程 2 秒，来回共 4 秒
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: square,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 2000,
    yoyo: true,
    loop: -1,
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字提示
  this.add.text(400, 500, 'Square scaling animation (loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);