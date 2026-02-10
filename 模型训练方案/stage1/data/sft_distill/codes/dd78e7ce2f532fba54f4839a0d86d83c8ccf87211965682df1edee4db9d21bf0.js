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
  // 使用 Graphics 绘制粉色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('pinkSquare', 100, 100);
  graphics.destroy();
  
  // 创建精灵对象并居中显示
  const square = this.add.sprite(400, 300, 'pinkSquare');
  
  // 创建淡入淡出动画
  // 使用 yoyo 实现淡入淡出效果（从1到0再回到1）
  // duration 设置为 1250ms，yoyo 会让总周期为 2500ms (2.5秒)
  this.tweens.add({
    targets: square,
    alpha: 0,           // 目标透明度为0（完全透明）
    duration: 1250,     // 单程时间1.25秒
    yoyo: true,         // 往返效果（淡出后再淡入）
    repeat: -1,         // 无限循环
    ease: 'Linear'      // 线性缓动
  });
  
  // 添加提示文本
  const text = this.add.text(400, 550, '粉色方块淡入淡出循环动画 (2.5秒周期)', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);