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
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建 Sprite 对象并设置到屏幕中心
  const square = this.add.sprite(400, 300, 'square');
  
  // 创建缩放动画
  this.tweens.add({
    targets: square,
    scaleX: 0.8,  // X 轴缩放到 80%
    scaleY: 0.8,  // Y 轴缩放到 80%
    duration: 2000,  // 持续 2 秒
    yoyo: true,  // 启用往返效果（缩放到 0.8 后再回到 1）
    loop: -1,  // -1 表示无限循环
    ease: 'Sine.easeInOut'  // 使用正弦缓动函数使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 50, '方块循环缩放动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);