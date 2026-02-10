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
  // 创建黄色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 60, 60); // 绘制 60x60 的矩形
  
  // 设置初始位置（左侧）
  graphics.x = 50;
  graphics.y = 270; // 垂直居中
  
  // 创建补间动画：从左移动到右，然后往返循环
  this.tweens.add({
    targets: graphics,
    x: 690, // 目标位置（右侧，800 - 60 - 50 = 690）
    duration: 2500, // 2.5秒
    yoyo: true, // 往返效果（到达终点后返回起点）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动，匀速移动
  });
  
  // 添加文字说明
  this.add.text(400, 50, '黄色矩形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '循环周期: 2.5秒 × 2 (往返) = 5秒', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);