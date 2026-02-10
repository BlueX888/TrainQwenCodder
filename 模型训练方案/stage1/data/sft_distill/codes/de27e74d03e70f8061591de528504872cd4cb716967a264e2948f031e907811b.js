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
  // 使用 Graphics 绘制紫色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('purpleRect', 100, 100);
  graphics.destroy();
  
  // 创建精灵对象并设置位置和锚点
  const rect = this.add.sprite(400, 300, 'purpleRect');
  rect.setOrigin(0.5, 0.5); // 设置中心点为旋转中心
  
  // 创建旋转动画
  this.tweens.add({
    targets: rect,
    angle: 360, // 旋转 360 度
    duration: 2000, // 持续 2 秒
    ease: 'Linear', // 线性缓动，保持匀速旋转
    repeat: -1, // 无限循环
    onRepeat: function() {
      // 每次循环重置角度，避免数值累积
      rect.angle = 0;
    }
  });
  
  // 添加提示文本
  const text = this.add.text(400, 500, '紫色矩形旋转动画 (2秒/圈)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);