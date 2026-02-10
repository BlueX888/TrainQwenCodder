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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制一个方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 100, 100); // 100x100 的方块
  
  // 生成纹理
  graphics.generateTexture('square', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为纹理已生成
  
  // 创建使用该纹理的 Sprite，放置在屏幕中心
  const square = this.add.sprite(400, 300, 'square');
  
  // 创建缩放动画
  // 4秒完成一个完整循环（2秒缩小到64%，2秒恢复到100%）
  this.tweens.add({
    targets: square,
    scaleX: 0.64, // 缩放到 64%
    scaleY: 0.64,
    duration: 2000, // 单程 2 秒
    yoyo: true, // 启用往返效果（缩小后自动恢复）
    loop: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字提示
  this.add.text(400, 500, 'Square scaling: 100% → 64% → 100% (4s loop)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);