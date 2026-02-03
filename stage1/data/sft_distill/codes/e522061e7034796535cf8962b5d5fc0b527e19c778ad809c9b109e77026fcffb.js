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
  // 创建 Graphics 对象绘制方块
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 在屏幕中心绘制一个 100x100 的方块
  graphics.fillRect(-50, -50, 100, 100);
  
  // 设置方块位置到屏幕中心
  graphics.setPosition(400, 300);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建透明度渐变动画
  this.tweens.add({
    targets: graphics,        // 动画目标对象
    alpha: 1,                 // 目标透明度值
    duration: 1000,           // 动画持续时间 1 秒
    ease: 'Linear',           // 线性缓动
    loop: -1,                 // 无限循环
    yoyo: false               // 不使用往返效果，只从 0 到 1 循环
  });
  
  // 添加提示文本
  this.add.text(400, 500, '方块透明度从 0 到 1 循环渐变', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);