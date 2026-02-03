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
  // 创建黄色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 60, 60); // 绘制 60x60 的矩形
  
  // 设置矩形初始位置（左侧）
  graphics.x = 50;
  graphics.y = 270; // 垂直居中 (600 - 60) / 2
  
  // 创建补间动画
  this.tweens.add({
    targets: graphics,
    x: 690, // 移动到右侧 (800 - 60 - 50)
    duration: 2500, // 2.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果
    repeat: -1 // 无限循环 (-1 表示永久重复)
  });
  
  // 添加提示文本
  this.add.text(400, 50, '黄色矩形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '2.5秒完成单程 | Yoyo模式 | 无限循环', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);